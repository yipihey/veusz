"""Pure-Python fallback for the compiled ``veusz/helpers/threed`` extension.

Used when the C++ ``threed`` module is unavailable — headless desktop, Pyodide
in the browser, any environment without the built extension. Provides the
Python-facing API the 3D widgets call (``Scene3D``, ``Graph3D``, ``Axis3D``,
``Point3D``, ``Function3D``, ``Surface3D``, ``Volume3D``).

Architecture mirrors the C++ version in ``src/threed``: the scene graph emits
flat ``Fragment``s (triangles, line segments, instanced paths) with 3D world
positions; the scene computes Lambertian lighting per fragment, projects to
screen via the camera, depth-sorts (Painter's algorithm), then issues plain
``QPainter`` ops (``drawPolygon``/``drawLine``/``drawPath``). Those ops are
exactly what ``qt_capture.SceneCapturingPainter`` already records, so the rest
of the stack (Scene IR → Vello → WASM canvas) draws 3D unchanged.
"""

from __future__ import annotations

import math
import numpy as N

from .. import qtall as qt

PI = math.pi
DEG2RAD = PI / 180.0
EPS = 1e-8
LINE_DELTA_DEPTH = 1e-6

# Marker so qt_capture's qtloops interception knows this fallback already
# records straight into the painter (mirrors the qtloops_py pattern; not used
# by threed but harmless to expose).
_VEUSZ_PURE_RECORDER = True


# ===========================================================================
# Math: Vec2 / Vec3 / Vec4, Mat3 / Mat4
# ---------------------------------------------------------------------------
# Lightweight wrappers around small numpy arrays, mirroring the C++ class
# operator surface used by widget code: v(i) reads component i; arithmetic
# returns new instances; matrix * matrix and matrix * vec are supported.
# ===========================================================================

class Vec2:
    __slots__ = ('v',)

    def __init__(self, *a):
        if len(a) == 0:
            self.v = N.zeros(2)
        elif len(a) == 1 and hasattr(a[0], 'v'):
            self.v = a[0].v.copy()
        elif len(a) == 2:
            self.v = N.array([a[0], a[1]], dtype=float)
        else:
            self.v = N.zeros(2)

    def __call__(self, i): return float(self.v[i])
    def rad2(self): return float(self.v[0] * self.v[0] + self.v[1] * self.v[1])
    def rad(self): return float(math.sqrt(self.rad2()))
    def __sub__(self, o): return Vec2(self.v[0] - o.v[0], self.v[1] - o.v[1])
    def __add__(self, o): return Vec2(self.v[0] + o.v[0], self.v[1] + o.v[1])
    def __mul__(self, s): return Vec2(self.v[0] * s, self.v[1] * s)


class Vec3:
    __slots__ = ('v',)

    def __init__(self, *a):
        if len(a) == 0:
            self.v = N.zeros(3)
        elif len(a) == 1:
            x = a[0]
            if hasattr(x, 'v'):
                self.v = x.v[:3].copy()
            else:
                self.v = N.asarray(x, dtype=float).ravel()[:3]
        elif len(a) == 3:
            self.v = N.array([a[0], a[1], a[2]], dtype=float)
        else:
            self.v = N.zeros(3)

    def __call__(self, i): return float(self.v[i])
    def rad2(self): return float(self.v @ self.v)
    def rad(self): return float(math.sqrt(self.rad2()))
    def normalise(self):
        n = self.rad()
        if n > 0:
            self.v /= n

    def __add__(self, o): return Vec3(self.v[0] + o.v[0], self.v[1] + o.v[1], self.v[2] + o.v[2])
    def __sub__(self, o): return Vec3(self.v[0] - o.v[0], self.v[1] - o.v[1], self.v[2] - o.v[2])
    def __neg__(self): return Vec3(-self.v[0], -self.v[1], -self.v[2])
    def __mul__(self, s): return Vec3(self.v[0] * s, self.v[1] * s, self.v[2] * s)
    __rmul__ = __mul__

    def isfinite(self):
        return bool(N.all(N.isfinite(self.v)))


class Vec4:
    __slots__ = ('v',)

    def __init__(self, *a):
        if len(a) == 0:
            self.v = N.zeros(4)
        elif len(a) == 1 and hasattr(a[0], 'v'):
            self.v = a[0].v[:4].copy()
        elif len(a) == 3:
            self.v = N.array([a[0], a[1], a[2], 1.0], dtype=float)
        elif len(a) == 4:
            self.v = N.array(a, dtype=float)
        else:
            self.v = N.zeros(4)

    def __call__(self, i): return float(self.v[i])


class Mat4:
    __slots__ = ('m',)

    def __init__(self, m=None):
        if m is None:
            self.m = N.zeros((4, 4))
        elif isinstance(m, Mat4):
            self.m = m.m.copy()
        else:
            self.m = N.asarray(m, dtype=float).reshape(4, 4).copy()

    def __call__(self, r, c): return float(self.m[r, c])

    def set(self, r, c, v): self.m[r, c] = float(v)

    def __mul__(self, o):
        if isinstance(o, Mat4):
            return Mat4(self.m @ o.m)
        if isinstance(o, Vec4):
            return Vec4(*(self.m @ o.v))
        return NotImplemented


class Mat3:
    __slots__ = ('m',)

    def __init__(self, m=None):
        if m is None:
            self.m = N.zeros((3, 3))
        elif isinstance(m, Mat3):
            self.m = m.m.copy()
        else:
            self.m = N.asarray(m, dtype=float).reshape(3, 3).copy()

    def __call__(self, r, c): return float(self.m[r, c])

    def __mul__(self, o):
        if isinstance(o, Mat3):
            return Mat3(self.m @ o.m)
        if isinstance(o, Vec3):
            return Vec3(*(self.m @ o.v))
        return NotImplemented


# ---------------------------------------------------------------------------
# ValVector: the C++ extension's std::vector<double>. We just expose a numpy
# array — the widget code already constructs us from numpy arrays.
# ---------------------------------------------------------------------------

def ValVector(arr=None):
    if arr is None:
        return N.zeros(0)
    if isinstance(arr, N.ndarray):
        return arr.astype(float, copy=False).ravel()
    return N.asarray(list(arr), dtype=float).ravel()


# ---------------------------------------------------------------------------
# Matrix factory helpers (mirror src/threed/mmaths.{h,cpp})
# ---------------------------------------------------------------------------

def identityM4():
    return Mat4(N.eye(4))


def identityM3():
    return Mat3(N.eye(3))


def translationM4(vec):
    m = N.eye(4)
    m[0, 3] = vec(0); m[1, 3] = vec(1); m[2, 3] = vec(2)
    return Mat4(m)


def scaleM4(vec):
    m = N.eye(4)
    m[0, 0] = vec(0); m[1, 1] = vec(1); m[2, 2] = vec(2)
    return Mat4(m)


def rotateM4(angle, vec):
    c = math.cos(angle); s = math.sin(angle)
    a = Vec3(vec); a.normalise()
    ax, ay, az = a(0), a(1), a(2)
    t = (1 - c)
    m = N.array([
        [c + t * ax * ax,     t * ay * ax - s * az, t * az * ax + s * ay, 0],
        [t * ax * ay + s * az, c + t * ay * ay,     t * az * ay - s * ax, 0],
        [t * ax * az - s * ay, t * ay * az + s * ax, c + t * az * az,     0],
        [0, 0, 0, 1],
    ], dtype=float)
    return Mat4(m)


def rotate3M4(ax, ay, az):
    return (rotateM4(ax, Vec3(1, 0, 0))
            * rotateM4(ay, Vec3(0, 1, 0))
            * rotateM4(az, Vec3(0, 0, 1)))


# ---------------------------------------------------------------------------
# Conversion + projection helpers
# ---------------------------------------------------------------------------

def vec3to4(v):
    return Vec4(v(0), v(1), v(2), 1.0)


def vec4to3(v):
    w = v(3)
    inv = 1.0 / w if w != 0 else 1.0
    return Vec3(v(0) * inv, v(1) * inv, v(2) * inv)


def vec3to2(v):
    return Vec2(v(0), v(1))


def calcProjVec(projM, v):
    if isinstance(v, Vec3):
        v = vec3to4(v)
    nv = projM * v
    w = nv(3)
    inv = 1.0 / w if w != 0 else 1.0
    return Vec3(nv(0) * inv, nv(1) * inv, nv(2) * inv)


def projVecToScreen(screenM, vec):
    mult = screenM * Vec3(vec(0), vec(1), 1.0)
    inv = 1.0 / mult(2) if mult(2) != 0 else 1.0
    return Vec2(mult(0) * inv, mult(1) * inv)


def cross(a, b):
    return Vec3(
        a(1) * b(2) - a(2) * b(1),
        a(2) * b(0) - a(0) * b(2),
        a(0) * b(1) - a(1) * b(0))


def dot(a, b):
    return a(0) * b(0) + a(1) * b(1) + a(2) * b(2)


# ---------------------------------------------------------------------------
# 2D hit-test helpers used by Scene.idPixel
# ---------------------------------------------------------------------------

def _point_in_tri(px, py, x0, y0, x1, y1, x2, y2):
    """Sign-of-cross-products point-in-triangle (any winding)."""
    d1 = (px - x1) * (y0 - y1) - (x0 - x1) * (py - y1)
    d2 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2)
    d3 = (px - x0) * (y2 - y0) - (x2 - x0) * (py - y0)
    has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
    return not (has_neg and has_pos)


def _point_near_seg(px, py, x0, y0, x1, y1, tol):
    """True if (px, py) is within ``tol`` of segment (x0,y0)-(x1,y1)."""
    dx = x1 - x0; dy = y1 - y0
    L2 = dx * dx + dy * dy
    if L2 <= 0:
        ex = px - x0; ey = py - y0
        return ex * ex + ey * ey <= tol * tol
    t = ((px - x0) * dx + (py - y0) * dy) / L2
    if t < 0: t = 0
    elif t > 1: t = 1
    fx = x0 + t * dx; fy = y0 + t * dy
    ex = px - fx; ey = py - fy
    return ex * ex + ey * ey <= tol * tol


# ===========================================================================
# Surface and line properties
# ===========================================================================

class SurfaceProp:
    def __init__(self, r=0.5, g=0.5, b=0.5, refl=0.5, trans=0.0, hide=False):
        self.r, self.g, self.b = float(r), float(g), float(b)
        self.refl, self.trans = float(refl), float(trans)
        self.hide = bool(hide)
        self.rgbs = None  # (N, 4) uint8 array of (B, G, R, A) — Qt ARGB32 layout

    def setRGBs(self, qimg):
        w = int(qimg.width())
        if w <= 0:
            self.rgbs = None
            return
        # qtshim QImage._pixels carries ARGB32 little-endian bytes [B,G,R,A].
        raw = bytes(qimg.constBits().asarray(4 * w * max(qimg.height(), 1)))
        arr = N.frombuffer(raw, dtype=N.uint8)
        # Take the first scanline (the C++ does the same).
        self.rgbs = arr[:4 * w].reshape(w, 4).copy()

    def hasRGBs(self):
        return self.rgbs is not None and len(self.rgbs) > 0

    def color(self, idx):
        """Return (r,g,b,a) ints in 0..255."""
        if not self.hasRGBs():
            return (int(self.r * 255), int(self.g * 255), int(self.b * 255),
                    int((1 - self.trans) * 255))
        i = min(int(idx), len(self.rgbs) - 1)
        b, g, r, a = self.rgbs[i]  # ARGB32 LE bytes
        return (int(r), int(g), int(b), int(a))


class LineProp:
    def __init__(self, r=0.0, g=0.0, b=0.0, trans=0.0, refl=0.0,
                 width=1.0, hide=False, style=None):
        self.r, self.g, self.b = float(r), float(g), float(b)
        self.trans, self.refl = float(trans), float(refl)
        self.width = float(width)
        self.hide = bool(hide)
        self.style = style if style is not None else qt.Qt.PenStyle.SolidLine
        self.rgbs = None
        self.dashpattern = None

    def setRGBs(self, qimg):
        SurfaceProp.setRGBs(self, qimg)

    def setDashPattern(self, vec):
        self.dashpattern = [float(v) for v in ValVector(vec)]
        self.style = qt.Qt.PenStyle.CustomDashLine

    def hasRGBs(self):
        return self.rgbs is not None and len(self.rgbs) > 0

    def color(self, idx):
        if not self.hasRGBs():
            return (int(self.r * 255), int(self.g * 255), int(self.b * 255),
                    int((1 - self.trans) * 255))
        i = min(int(idx), len(self.rgbs) - 1)
        b, g, r, a = self.rgbs[i]
        return (int(r), int(g), int(b), int(a))


# ===========================================================================
# Fragment + Object base
# ===========================================================================

FR_NONE, FR_TRIANGLE, FR_LINESEG, FR_PATH = 0, 1, 2, 3


class Fragment:
    __slots__ = ('type', 'points', 'proj', 'object', 'params',
                 'surfaceprop', 'lineprop', 'pathsize', 'calccolor',
                 'splitcount', 'index', 'usecalccolor')

    def __init__(self):
        self.type = FR_NONE
        # Default to zero Vec3s so projection/rendering of slots beyond
        # `n_visible()` is harmless (FR_PATH's 2nd/3rd slot, etc.).
        self.points = [Vec3(), Vec3(), Vec3()]
        self.proj = [Vec3(), Vec3(), Vec3()]
        self.object = None
        self.params = None
        self.surfaceprop = None
        self.lineprop = None
        self.pathsize = 0.0
        self.calccolor = (0, 0, 0, 0)
        self.splitcount = 0
        self.index = 0
        self.usecalccolor = False

    def n_visible(self):
        return (3 if self.type == FR_TRIANGLE
                else 2 if self.type == FR_LINESEG
                else 1 if self.type == FR_PATH else 0)

    def n_total(self):
        return (3 if self.type == FR_TRIANGLE
                else 2 if self.type == FR_LINESEG
                else 3 if self.type == FR_PATH else 0)

    def max_depth(self):
        if self.type == FR_TRIANGLE:
            return max(self.proj[0](2), self.proj[1](2), self.proj[2](2))
        if self.type == FR_LINESEG:
            return max(self.proj[0](2), self.proj[1](2)) - LINE_DELTA_DEPTH
        if self.type == FR_PATH:
            return self.proj[0](2) - 2 * LINE_DELTA_DEPTH
        return float('inf')


class FragmentParameters:
    pass


class FragmentPathParameters(FragmentParameters):
    def __init__(self):
        self.path = None
        self.scaleline = False
        self.scalepersp = True
        self.runcallback = False

    def callback(self, painter, pt1, pt2, pt3, index, scale, linescale):
        pass


class Object:
    def __init__(self):
        self.widgetid = 0

    def assignWidgetId(self, wid):
        self.widgetid = int(wid)

    def getFragments(self, perspM, outerM, v):
        pass


# ===========================================================================
# Containers (mirror objects.cpp / clipcontainer.cpp)
# ===========================================================================

class ObjectContainer(Object):
    def __init__(self):
        super().__init__()
        self.objects = []
        self.objM = identityM4()

    def addObject(self, obj):
        self.objects.append(obj)

    def getFragments(self, perspM, outerM, v):
        totM = outerM * self.objM
        for o in self.objects:
            o.getFragments(perspM, totM, v)


class FacingContainer(ObjectContainer):
    def __init__(self, norm):
        super().__init__()
        self.norm = Vec3(norm)

    def getFragments(self, perspM, outerM, v):
        origin = vec4to3(outerM * Vec4(0, 0, 0, 1))
        tnorm = vec4to3(outerM * vec3to4(self.norm))
        if tnorm(2) > origin(2):
            super().getFragments(perspM, outerM, v)


class ClipContainer(ObjectContainer):
    """Axis-aligned 3D clip. We delegate clipping to the renderer by tagging
    fragments with the clip bounds; the renderer clips lines + triangles
    against each of the six planes (Sutherland-Hodgman-style) before sorting.
    For v1 we accept fragments wholly outside as still-drawn — the
    visual effect is unchanged for the shipping examples; tight clipping is
    a follow-on."""

    def __init__(self, minpt, maxpt):
        super().__init__()
        self.minpt = Vec3(minpt)
        self.maxpt = Vec3(maxpt)


# ===========================================================================
# Primitives
# ===========================================================================

class Triangle(Object):
    def __init__(self, a, b, c, prop):
        super().__init__()
        self.points = [Vec3(a), Vec3(b), Vec3(c)]
        self.surfaceprop = prop

    def getFragments(self, perspM, outerM, v):
        f = Fragment()
        f.type = FR_TRIANGLE
        f.surfaceprop = self.surfaceprop
        for i in range(3):
            f.points[i] = vec4to3(outerM * vec3to4(self.points[i]))
        f.object = self
        v.append(f)


class TriangleFacing(Triangle):
    """Triangle drawn only when its (un-normalised) face normal points toward
    the camera (whose eye is at origin in eye-space). Same convention as the
    C++ version: if the centroid-to-normal dot product is < 0 we flip the
    normal, then compare against the centroid-to-camera direction."""

    def getFragments(self, perspM, outerM, v):
        pts = [vec4to3(outerM * vec3to4(p)) for p in self.points]
        centroid = (pts[0] + pts[1] + pts[2]) * (1.0 / 3.0)
        norm = cross(pts[1] - pts[0], pts[2] - pts[0])
        if dot(centroid, norm) < 0:
            norm = -norm
        # Camera is at origin in eye-space; face toward camera if dot of
        # (camera - centroid) with normal is positive — i.e. -dot(centroid, n).
        if -dot(centroid, norm) > 0:
            f = Fragment()
            f.type = FR_TRIANGLE
            f.surfaceprop = self.surfaceprop
            f.points[0], f.points[1], f.points[2] = pts
            f.object = self
            v.append(f)


class PolyLine(Object):
    def __init__(self, prop):
        super().__init__()
        self.lineprop = prop
        self.points = []

    def addPoint(self, p):
        self.points.append(Vec3(p))

    def addPoints(self, x, y, z):
        x = ValVector(x); y = ValVector(y); z = ValVector(z)
        n = min(len(x), len(y), len(z))
        for i in range(n):
            self.points.append(Vec3(x[i], y[i], z[i]))

    def getFragments(self, perspM, outerM, v):
        if len(self.points) < 2:
            return
        prev = vec4to3(outerM * vec3to4(self.points[0]))
        for i in range(1, len(self.points)):
            cur = vec4to3(outerM * vec3to4(self.points[i]))
            if cur.isfinite() and prev.isfinite():
                f = Fragment()
                f.type = FR_LINESEG
                f.lineprop = self.lineprop
                f.object = self
                f.points[0] = cur
                f.points[1] = prev
                f.index = i
                v.append(f)
            prev = cur


class LineSegments(Object):
    """Two constructor forms (mirroring the C++ overloads):
      LineSegments(x1, y1, z1, x2, y2, z2, prop)
      LineSegments(pts1, pts2, prop)  — pts*: flat [x,y,z, x,y,z, …] arrays
    """

    def __init__(self, *args):
        super().__init__()
        if len(args) == 7:
            x1, y1, z1, x2, y2, z2, prop = args
            x1 = ValVector(x1); y1 = ValVector(y1); z1 = ValVector(z1)
            x2 = ValVector(x2); y2 = ValVector(y2); z2 = ValVector(z2)
            n = min(len(x1), len(y1), len(z1), len(x2), len(y2), len(z2))
            pts = []
            for i in range(n):
                pts.append(Vec3(x1[i], y1[i], z1[i]))
                pts.append(Vec3(x2[i], y2[i], z2[i]))
            self.points = pts
            self.lineprop = prop
        elif len(args) == 3:
            pts1, pts2, prop = args
            pts1 = ValVector(pts1); pts2 = ValVector(pts2)
            n = min(len(pts1) // 3, len(pts2) // 3)
            pts = []
            for i in range(n):
                pts.append(Vec3(pts1[3 * i], pts1[3 * i + 1], pts1[3 * i + 2]))
                pts.append(Vec3(pts2[3 * i], pts2[3 * i + 1], pts2[3 * i + 2]))
            self.points = pts
            self.lineprop = prop
        else:
            raise TypeError(f'LineSegments: bad args {len(args)}')

    def getFragments(self, perspM, outerM, v):
        for i in range(0, len(self.points), 2):
            f = Fragment()
            f.type = FR_LINESEG
            f.lineprop = self.lineprop
            f.object = self
            f.points[0] = vec4to3(outerM * vec3to4(self.points[i]))
            f.points[1] = vec4to3(outerM * vec3to4(self.points[i + 1]))
            f.index = i
            v.append(f)


class Points(Object):
    """Instanced 2D path (e.g. a marker shape) placed at 3D positions."""

    def __init__(self, x, y, z, path, lineprop, surfprop):
        super().__init__()
        self.x = ValVector(x); self.y = ValVector(y); self.z = ValVector(z)
        self.path = path
        self.lineedge = lineprop
        self.surfacefill = surfprop
        self.sizes = N.zeros(0)
        self.scaleline = False
        self.scalepersp = True
        self.fragparams = FragmentPathParameters()
        self.fragparams.path = path
        self.fragparams.scaleline = self.scaleline
        self.fragparams.scalepersp = self.scalepersp

    def setSizes(self, sizes):
        self.sizes = ValVector(sizes)

    def getFragments(self, perspM, outerM, v):
        self.fragparams.scaleline = self.scaleline
        self.fragparams.scalepersp = self.scalepersp
        n = min(len(self.x), len(self.y), len(self.z))
        hassizes = len(self.sizes) > 0
        if hassizes:
            n = min(n, len(self.sizes))
        for i in range(n):
            p = vec4to3(outerM * Vec4(self.x[i], self.y[i], self.z[i], 1.0))
            if not p.isfinite():
                continue
            f = Fragment()
            f.type = FR_PATH
            f.object = self
            f.params = self.fragparams
            f.surfaceprop = self.surfacefill
            f.lineprop = self.lineedge
            f.pathsize = float(self.sizes[i]) if hassizes else 1.0
            f.points[0] = p
            f.index = i
            v.append(f)


class Text(Object):
    """3D-positioned text with a per-instance draw callback. Subclasses
    override ``draw(painter, pt1, pt2, pt3, index, scale, linescale)``."""

    def __init__(self, pos1, pos2):
        super().__init__()
        self.pos1 = ValVector(pos1)
        self.pos2 = ValVector(pos2)
        self.fragparams = FragmentPathParameters()
        self.fragparams.runcallback = True
        self.fragparams.callback = self._cb

    def _cb(self, painter, pt1, pt2, pt3, index, scale, linescale):
        self.draw(painter, pt1, pt2, pt3, index, scale, linescale)

    def draw(self, painter, pt1, pt2, pt3, index, scale, linescale):
        pass

    def getFragments(self, perspM, outerM, v):
        n = min(len(self.pos1), len(self.pos2)) // 3
        for i in range(n):
            base = i * 3
            f = Fragment()
            f.type = FR_PATH
            f.object = self
            f.params = self.fragparams
            f.surfaceprop = None
            f.lineprop = None
            f.pathsize = 1.0
            f.points[0] = vec4to3(outerM * Vec4(
                self.pos1[base], self.pos1[base + 1], self.pos1[base + 2], 1.0))
            f.points[1] = vec4to3(outerM * Vec4(
                self.pos2[base], self.pos2[base + 1], self.pos2[base + 2], 1.0))
            f.index = i
            v.append(f)


class _AxisLabelsParams(FragmentPathParameters):
    """Per-AxisLabels params: stores axangle (axis-from-centre orientation in
    projected coords) and a back-pointer to the AxisLabels for drawLabel
    dispatch. Mirrors ``AxisLabels::PathParameters`` in objects.cpp."""

    def __init__(self, owner):
        super().__init__()
        self.path = None
        self.scaleline = False
        self.scalepersp = False
        self.runcallback = True
        self.axangle = 0.0
        self.owner = owner

    def callback(self, painter, pt, ax1, ax2, index, scale, linescale):
        painter.save()
        self.owner.drawLabel(painter, index, pt, ax1, ax2, self.axangle)
        painter.restore()


class AxisLabels(Object):
    """Tick labels along one of several candidate cube edges. Subclasses
    override ``drawLabel(painter, index, pt, ax1, ax2, axangle)``. v1: scores
    the candidate axes the same way the C++ does (prefer front-bottom-left in
    projected coords) and uses the winner."""

    def __init__(self, box1, box2, tickfracs, labelfrac):
        super().__init__()
        self.box1 = Vec3(box1)
        self.box2 = Vec3(box2)
        self.tickfracs = ValVector(tickfracs)
        self.labelfrac = float(labelfrac)
        self.starts = []
        self.ends = []
        self.fragparams = _AxisLabelsParams(self)

    def addAxisChoice(self, start, end):
        self.starts.append(Vec3(start))
        self.ends.append(Vec3(end))

    def drawLabel(self, painter, index, pt, ax1, ax2, axangle):
        pass

    def getFragments(self, perspM, outerM, v):
        if not self.starts or len(self.tickfracs) == 0:
            return
        # Project box corners + axis ends in clip space; pick the best
        # candidate axis as the C++ scoring function does.
        bp = [self.box1, self.box2]
        proj_corners = []
        for i0 in range(2):
            for i1 in range(2):
                for i2 in range(2):
                    p = Vec3(bp[i0](0), bp[i1](1), bp[i2](2))
                    proj_corners.append(calcProjVec(perspM, outerM * vec3to4(p)))
        cx = sum(c(0) for c in proj_corners) / 8.0
        cy = sum(c(1) for c in proj_corners) / 8.0
        cz = sum(c(2) for c in proj_corners) / 8.0
        proj_cent = Vec3(cx, cy, cz)

        n = len(self.starts)
        proj_starts, proj_ends = [], []
        for i in range(n):
            proj_starts.append(calcProjVec(perspM, outerM * vec3to4(self.starts[i])))
            proj_ends.append(calcProjVec(perspM, outerM * vec3to4(self.ends[i])))

        # Score: prefer front (z<centre), bottom (y>centre), left (x<centre)
        best = 0
        bestscore = -1
        for i in range(n):
            av0 = (proj_starts[i](0) + proj_ends[i](0)) * 0.5
            av1 = (proj_starts[i](1) + proj_ends[i](1)) * 0.5
            av2 = (proj_starts[i](2) + proj_ends[i](2)) * 0.5
            score = ((av0 <= proj_cent(0)) * 10 + (av1 > proj_cent(1)) * 11
                     + (av2 < proj_cent(2)) * 12)
            if score > bestscore:
                bestscore = score
                best = i
        # axangle: from box centre to axis centre, in projected coords.
        amx = (proj_starts[best](0) + proj_ends[best](0)) * 0.5 - proj_cent(0)
        amy = (proj_starts[best](1) + proj_ends[best](1)) * 0.5 - proj_cent(1)
        self.fragparams.axangle = (180.0 / PI) * math.atan2(amy, amx)

        # Emit one FR_PATH per tick. points[0]=tick world pos,
        # points[1]=axis start, points[2]=axis end; the renderer projects
        # them to screen and hands the QPointFs to the callback.
        axstart_scene = vec4to3(outerM * vec3to4(self.starts[best]))
        axend_scene = vec4to3(outerM * vec3to4(self.ends[best]))
        delta = axend_scene - axstart_scene
        for i in range(len(self.tickfracs)):
            frac = float(self.tickfracs[i])
            tickpt = axstart_scene + delta * frac
            f = Fragment()
            f.type = FR_PATH
            f.object = self
            f.params = self.fragparams
            f.pathsize = 1.0
            f.points[0] = tickpt
            f.points[1] = axstart_scene
            f.points[2] = axend_scene
            f.index = i
            v.append(f)


# ---------------------------------------------------------------------------
# Mesh / DataMesh / MultiCuboid — heavier surface primitives. We provide
# correct skeletons but emit empty fragment lists in v1 so widgets relying on
# them (Function3D, Surface3D, Volume3D) can be loaded without import errors;
# they will render as empty (axes/labels still show). Filling these in is the
# next step (mirrors objects.cpp Mesh::getSurfaceFragments + MultiCuboid).
# ---------------------------------------------------------------------------

class Mesh(Object):
    """Regular grid surface (Function3D, Surface3D shimming). ``direction``
    picks which axis is the "height" — the other two become the in-plane
    grid. Mirrors ``objects.cpp:Mesh::get{Line,Surface}Fragments``."""

    class Direction:
        X_DIRN = 0
        Y_DIRN = 1
        Z_DIRN = 2

    def __init__(self, pos1, pos2, heights, direction, lineprop, surfprop,
                 hidehorzline=False, hidevertline=False):
        super().__init__()
        self.pos1 = ValVector(pos1)
        self.pos2 = ValVector(pos2)
        self.heights = ValVector(heights)
        self.direction = direction
        self.lineprop = lineprop
        self.surfaceprop = surfprop
        self.hidehorzline = bool(hidehorzline)
        self.hidevertline = bool(hidevertline)

    def _vec_idxs(self):
        """(vidx_h, vidx_1, vidx_2) for the chosen height direction."""
        d = self.direction
        D = Mesh.Direction
        if d == D.Y_DIRN: return (1, 2, 0)
        if d == D.Z_DIRN: return (2, 0, 1)
        return (0, 1, 2)  # X_DIRN (default)

    def getFragments(self, perspM, outerM, v):
        self._getLineFragments(perspM, outerM, v)
        self._getSurfaceFragments(perspM, outerM, v)

    def _getLineFragments(self, perspM, outerM, v):
        if self.lineprop is None:
            return
        vh, v1, v2 = self._vec_idxs()
        n1 = len(self.pos1); n2 = len(self.pos2)
        if n1 == 0 or n2 == 0 or len(self.heights) < n1 * n2:
            return
        idx = 0
        pt4 = N.array([0.0, 0.0, 0.0, 1.0])
        # Two passes: stepindex 0 = sweep along pos1 (per pos2 row), 1 = vice versa.
        for stepindex in range(2):
            if self.hidehorzline and stepindex == 0:
                continue
            if self.hidevertline and stepindex == 1:
                continue
            vec_step = self.pos1 if stepindex == 0 else self.pos2
            vec_const = self.pos2 if stepindex == 0 else self.pos1
            vidx_step = v1 if stepindex == 0 else v2
            vidx_const = v2 if stepindex == 0 else v1
            for consti in range(len(vec_const)):
                pt4[vidx_const] = vec_const[consti]
                prev = None
                for stepi in range(len(vec_step)):
                    hi = stepi * n2 + consti if stepindex == 0 else consti * n2 + stepi
                    pt4[vidx_step] = vec_step[stepi]
                    pt4[vh] = self.heights[hi]
                    cur = vec4to3(outerM * Vec4(pt4[0], pt4[1], pt4[2], pt4[3]))
                    if stepi > 0 and cur.isfinite() and prev.isfinite():
                        f = Fragment()
                        f.type = FR_LINESEG
                        f.lineprop = self.lineprop
                        f.object = self
                        f.points[0] = cur
                        f.points[1] = prev
                        f.index = idx
                        idx += 1
                        v.append(f)
                    prev = cur

    def _getSurfaceFragments(self, perspM, outerM, v):
        if self.surfaceprop is None:
            return
        vh, v1, v2 = self._vec_idxs()
        n1 = len(self.pos1); n2 = len(self.pos2)
        if n1 < 2 or n2 < 2 or len(self.heights) < n1 * n2:
            return
        # Two alternating triangulation patterns produce a diamond grid pattern.
        tidxs = (((0, 1, 2), (3, 1, 2)), ((1, 0, 3), (2, 0, 3)))
        cell_idx = 0
        for i1 in range(n1 - 1):
            for i2 in range(n2 - 1):
                p4 = [N.array([0.0, 0.0, 0.0, 1.0]) for _ in range(4)]
                pproj = [None, None, None, None]
                for i in range(4):
                    j1 = i1 + (i & 1); j2 = i2 + (i >> 1)
                    p4[i][vh] = self.heights[j1 * n2 + j2]
                    p4[i][v1] = self.pos1[j1]
                    p4[i][v2] = self.pos2[j2]
                    pproj[i] = vec4to3(outerM * Vec4(*p4[i]))
                pat = tidxs[(i1 + i2) % 2]
                for tri in range(2):
                    a, b, c = pat[tri]
                    if pproj[a].isfinite() and pproj[b].isfinite() and pproj[c].isfinite():
                        f = Fragment()
                        f.type = FR_TRIANGLE
                        f.surfaceprop = self.surfaceprop
                        f.object = self
                        f.points[0], f.points[1], f.points[2] = pproj[a], pproj[b], pproj[c]
                        f.index = cell_idx
                        v.append(f)
                cell_idx += 1


class DataMesh(Object):
    """Binned 2D data displayed as a 3D surface (Surface3D). ``idxval`` /
    ``idxedge1`` / ``idxedge2`` assign data + edges to the X/Y/Z axes.
    v1: lowres mode only (highres neighbour-averaging deferred). Per-cell
    duplicate edges are NOT deduplicated — the painter draws shared edges
    twice; cosmetically identical, mild perf cost. Mirrors
    ``objects.cpp:DataMesh::getFragments``."""

    def __init__(self, edges1, edges2, vals, idxval, idxedge1, idxedge2,
                 highres, lineprop, surfprop, hidehorzline=False, hidevertline=False):
        super().__init__()
        self.edges1 = ValVector(edges1)
        self.edges2 = ValVector(edges2)
        self.vals = ValVector(vals)
        self.idxval = int(idxval)
        self.idxedge1 = int(idxedge1)
        self.idxedge2 = int(idxedge2)
        self.highres = bool(highres)
        self.lineprop = lineprop
        self.surfaceprop = surfprop
        self.hidehorzline = bool(hidehorzline)
        self.hidevertline = bool(hidevertline)

    # 9-corner stencil indices (mirrors objects.cpp):
    #   6 -- 5 -- 4
    #   |    |    |
    #   7 -- 8 -- 3
    #   |    |    |
    #   0 -- 1 -- 2
    # lowres: only corners 0, 2, 4, 6 (cell corners) — two-triangle fan,
    # alternating diamond pattern.
    _LR_TRI_A = ((0, 2, 4), (0, 6, 4))
    _LR_TRI_B = ((2, 0, 6), (2, 4, 6))
    _LR_LINES = ((0, 2), (0, 6), (4, 2), (4, 6))
    _LR_LINE_CELLS = ((0, 0, 0), (0, 0, 1), (0, 1, 0), (1, 0, 1))
    _LR_DIRN = (0, 1, 0, 1)
    # highres: 8 fan triangles from cell-centre (corner 8) + octagon edges.
    _HR_TRIS = ((8, 0, 1), (8, 1, 2), (8, 2, 3), (8, 3, 4),
                (8, 4, 5), (8, 5, 6), (8, 6, 7), (8, 7, 0))
    _HR_LINES = ((0, 1), (1, 2), (2, 3), (3, 4),
                 (4, 5), (5, 6), (6, 7), (7, 0))
    _HR_LINE_CELLS = ((0, 0, 0), (0, 0, 1), (1, 0, 2), (1, 0, 3),
                      (0, 1, 1), (0, 1, 0), (0, 0, 3), (0, 0, 2))
    _HR_DIRN = (1, 1, 0, 0, 1, 1, 0, 0)

    def getFragments(self, perspM, outerM, v):
        if sorted((self.idxval, self.idxedge1, self.idxedge2)) != [0, 1, 2]:
            return
        if self.lineprop is None and self.surfaceprop is None:
            return
        n1 = int(len(self.edges1)) - 1
        n2 = int(len(self.edges2)) - 1
        if n1 <= 0 or n2 <= 0 or len(self.vals) < n1 * n2:
            return

        e1 = N.asarray(self.edges1, dtype=float)
        e2 = N.asarray(self.edges2, dtype=float)
        vals = N.asarray(self.vals, dtype=float).reshape(n1, n2)

        # Vectorised 4-neighbour cell-corner averages: corner_val[i1, i2]
        # = average of the up-to-4 cells touching grid intersection (i1, i2).
        ix1 = N.clip(N.arange(n1 + 1)[:, None] - 1, 0, n1 - 1)
        ix2 = N.clip(N.arange(n2 + 1)[None, :] - 1, 0, n2 - 1)
        jx1 = N.clip(N.arange(n1 + 1)[:, None], 0, n1 - 1)
        jx2 = N.clip(N.arange(n2 + 1)[None, :], 0, n2 - 1)
        corner_val = 0.25 * (
            vals[ix1, ix2] + vals[jx1, ix2] + vals[ix1, jx2] + vals[jx1, jx2])

        highres = self.highres
        if highres:
            tris = DataMesh._HR_TRIS
            lines = DataMesh._HR_LINES
            line_cells = DataMesh._HR_LINE_CELLS
            line_dirn = DataMesh._HR_DIRN
            # Edge-midpoints use 2-neighbour averages — mirror C++.
            # mid_h[(i1, i2)] is the horizontal edge midpoint between
            # cell (i1, i2) and cell (i1, i2-1) (clipped).
            # We compute on demand inside the cell loop.
        else:
            tris = DataMesh._LR_TRI_A
            lines = DataMesh._LR_LINES
            line_cells = DataMesh._LR_LINE_CELLS
            line_dirn = DataMesh._LR_DIRN

        drawn = set()  # (i1, i2, lineid) — per-cell line dedup

        for i1 in range(n1):
            for i2 in range(n2):
                vc = vals[i1, i2]
                if not math.isfinite(vc):
                    continue

                # Build the corners we actually need for this mode.
                corners = [None] * 9
                corners[0] = self._corner(corner_val[i1, i2], e1[i1], e2[i2])
                corners[2] = self._corner(corner_val[i1, i2 + 1], e1[i1], e2[i2 + 1])
                corners[4] = self._corner(corner_val[i1 + 1, i2 + 1], e1[i1 + 1], e2[i2 + 1])
                corners[6] = self._corner(corner_val[i1 + 1, i2], e1[i1 + 1], e2[i2])
                if highres:
                    # 2-neighbour averages along cell edges (clipped to grid).
                    n_l = vals[max(i1 - 1, 0), i2] if i1 > 0 else vc
                    n_r = vals[min(i1 + 1, n1 - 1), i2] if i1 < n1 - 1 else vc
                    n_t = vals[i1, max(i2 - 1, 0)] if i2 > 0 else vc
                    n_b = vals[i1, min(i2 + 1, n2 - 1)] if i2 < n2 - 1 else vc
                    em = 0.5 * (e1[i1] + e1[i1 + 1])
                    em2 = 0.5 * (e2[i2] + e2[i2 + 1])
                    corners[1] = self._corner(0.5 * (vc + n_t), e1[i1], em2)
                    corners[3] = self._corner(0.5 * (vc + n_r), em, e2[i2 + 1])
                    corners[5] = self._corner(0.5 * (vc + n_b), e1[i1 + 1], em2)
                    corners[7] = self._corner(0.5 * (vc + n_l), em, e2[i2])
                    corners[8] = self._corner(vc, em, em2)

                # Project to scene/world space.
                world = {k: vec4to3(outerM * c) for k, c in enumerate(corners) if c is not None}

                if self.surfaceprop is not None:
                    pat = (tris if highres
                           else (DataMesh._LR_TRI_A if (i1 + i2) % 2 == 0
                                 else DataMesh._LR_TRI_B))
                    cell_idx = i1 * n2 + i2
                    for a, b, c in pat:
                        f = Fragment()
                        f.type = FR_TRIANGLE
                        f.surfaceprop = self.surfaceprop
                        f.object = self
                        f.points[0], f.points[1], f.points[2] = world[a], world[b], world[c]
                        f.index = cell_idx
                        v.append(f)

                if self.lineprop is not None:
                    cell_idx = i1 * n2 + i2
                    for k, (a, b) in enumerate(lines):
                        dirn = line_dirn[k]
                        if self.hidehorzline and dirn == 0:
                            continue
                        if self.hidevertline and dirn == 1:
                            continue
                        # Per-cell dedup: this line belongs to cell (i1+dx, i2+dy)
                        # with id `lid`; if already drawn by an adjacent cell, skip.
                        dx, dy, lid = line_cells[k]
                        key = (i1 + dx, i2 + dy, lid)
                        if key in drawn:
                            continue
                        drawn.add(key)
                        f = Fragment()
                        f.type = FR_LINESEG
                        f.lineprop = self.lineprop
                        f.object = self
                        f.points[0] = world[a]; f.points[1] = world[b]
                        f.index = cell_idx
                        v.append(f)

    def _corner(self, vh, p1, p2):
        """Pack a (height, edge1, edge2) corner into a homogeneous Vec4
        according to the axis permutation."""
        pt = [0.0, 0.0, 0.0, 1.0]
        pt[self.idxval] = float(vh)
        pt[self.idxedge1] = float(p1)
        pt[self.idxedge2] = float(p2)
        return Vec4(*pt)


class MultiCuboid(Object):
    """Array of axis-aligned boxes (Volume3D). Each cuboid emits 12
    triangles + 12 edge segments. Tables mirror ``objects.cpp``."""

    # 12 triangles per cuboid: each triple is (corner-index of 0=min/1=max along x,y,z)
    _TRI_IDX = (
        ((0, 0, 0), (0, 0, 1), (1, 0, 0)),
        ((0, 0, 1), (0, 0, 0), (0, 1, 0)),
        ((0, 1, 0), (0, 1, 1), (0, 0, 1)),
        ((0, 1, 0), (1, 1, 0), (0, 1, 1)),
        ((0, 1, 0), (0, 0, 0), (1, 0, 0)),
        ((0, 1, 1), (1, 0, 1), (0, 0, 1)),
        ((0, 1, 1), (1, 1, 1), (1, 0, 1)),
        ((1, 0, 0), (1, 1, 0), (0, 1, 0)),
        ((1, 0, 1), (1, 0, 0), (0, 0, 1)),
        ((1, 0, 1), (1, 1, 0), (1, 0, 0)),
        ((1, 0, 1), (1, 1, 1), (1, 1, 0)),
        ((1, 1, 0), (1, 1, 1), (0, 1, 1)),
    )
    _EDGE_IDX = (
        ((0, 0, 0), (0, 0, 1)), ((0, 0, 0), (0, 1, 0)), ((0, 0, 0), (1, 0, 0)),
        ((0, 0, 1), (0, 1, 1)), ((0, 0, 1), (1, 0, 1)), ((0, 1, 0), (0, 1, 1)),
        ((0, 1, 0), (1, 1, 0)), ((0, 1, 1), (1, 1, 1)), ((1, 0, 0), (1, 0, 1)),
        ((1, 0, 0), (1, 1, 0)), ((1, 0, 1), (1, 1, 1)), ((1, 1, 0), (1, 1, 1)),
    )

    def __init__(self, xmin, xmax, ymin, ymax, zmin, zmax,
                 lineprop, surfprop):
        super().__init__()
        self.xmin = ValVector(xmin); self.xmax = ValVector(xmax)
        self.ymin = ValVector(ymin); self.ymax = ValVector(ymax)
        self.zmin = ValVector(zmin); self.zmax = ValVector(zmax)
        self.lineprop = lineprop
        self.surfaceprop = surfprop

    def getFragments(self, perspM, outerM, v):
        sp = self.surfaceprop
        lp = self.lineprop
        if (sp is None or sp.hide) and (lp is None or lp.hide):
            return
        n = min(len(self.xmin), len(self.xmax),
                len(self.ymin), len(self.ymax),
                len(self.zmin), len(self.zmax))
        for i in range(n):
            x = (self.xmin[i], self.xmax[i])
            y = (self.ymin[i], self.ymax[i])
            z = (self.zmin[i], self.zmax[i])
            if sp is not None and not sp.hide:
                for tri in MultiCuboid._TRI_IDX:
                    pts = []
                    for ix, iy, iz in tri:
                        pts.append(vec4to3(outerM * Vec4(x[ix], y[iy], z[iz], 1.0)))
                    f = Fragment()
                    f.type = FR_TRIANGLE
                    f.surfaceprop = sp
                    f.object = self
                    f.points[0], f.points[1], f.points[2] = pts
                    f.index = i
                    v.append(f)
            if lp is not None and not lp.hide:
                for a, b in MultiCuboid._EDGE_IDX:
                    pa = vec4to3(outerM * Vec4(x[a[0]], y[a[1]], z[a[2]], 1.0))
                    pb = vec4to3(outerM * Vec4(x[b[0]], y[b[1]], z[b[2]], 1.0))
                    f = Fragment()
                    f.type = FR_LINESEG
                    f.lineprop = lp
                    f.object = self
                    f.points[0], f.points[1] = pa, pb
                    f.index = i
                    v.append(f)


# ===========================================================================
# Camera (mirrors camera.cpp)
# ===========================================================================

class Camera:
    def __init__(self):
        self.eye = Vec3(0, 0, 0)
        self.viewM = identityM4()
        self.perspM = identityM4()
        self.combM = identityM4()
        self.setPointing(Vec3(0, 0, 0), Vec3(0, 0, 1), Vec3(0, 1, 0))
        self.setPerspective()

    def setPointing(self, eye, target, up):
        self.eye = Vec3(eye)
        f = target - eye; f.normalise()
        u = Vec3(up); u.normalise()
        s = cross(f, u); s.normalise()
        u = cross(s, f)
        m = N.zeros((4, 4))
        m[0, 0] = s(0); m[0, 1] = s(1); m[0, 2] = s(2); m[0, 3] = -dot(s, eye)
        m[1, 0] = u(0); m[1, 1] = u(1); m[1, 2] = u(2); m[1, 3] = -dot(u, eye)
        m[2, 0] = -f(0); m[2, 1] = -f(1); m[2, 2] = -f(2); m[2, 3] = dot(f, eye)
        m[3, 3] = 1.0
        self.viewM = Mat4(m)
        self.combM = self.perspM * self.viewM

    def setPerspective(self, fov_degrees=90.0, znear=0.1, zfar=100.0):
        scale = 1.0 / math.tan(fov_degrees * (PI / 180 / 2))
        m = N.zeros((4, 4))
        m[0, 0] = scale
        m[1, 1] = scale
        m[2, 2] = -zfar / (zfar - znear)
        m[3, 2] = -1
        m[2, 3] = -zfar * znear / (zfar - znear)
        self.perspM = Mat4(m)
        self.combM = self.perspM * self.viewM


# ===========================================================================
# Scene: lighting, projection, depth sort, doDrawing
# (mirrors scene.cpp, RENDER_PAINTERS path)
# ===========================================================================

class _Light:
    def __init__(self, posn, r, g, b, intensity):
        self.posn = Vec3(posn)
        self.r, self.g, self.b = r, g, b
        self.intensity = intensity


def _qcolor_components(qcol):
    """Pull (r, g, b) floats in [0,1] from a (qtshim or PyQt6) QColor."""
    return (qcol.redF(), qcol.greenF(), qcol.blueF())


def _clip255(v):
    if v < 0: return 0
    if v > 255: return 255
    return int(v)


class Scene:
    class RenderMode:
        RENDER_PAINTERS = 0
        RENDER_BSP = 1

    def __init__(self, mode):
        self.mode = mode
        self.lights = []
        self.fragments = []
        self.draworder = []
        self.screenM = identityM3()
        # Bulk numpy views populated by _project_fragments + _build_screen_xy
        # so the playback loop reads slices instead of calling projVecToScreen.
        self._proj_xyz = None      # (Nfrags, 3, 3): clip-space (x, y, depth)
        self._proj_counts = None   # (Nfrags,) int8: n_total per fragment
        self._scr_x = None         # (Nfrags, 3): screen-space x per point
        self._scr_y = None         # (Nfrags, 3): screen-space y per point

    def addLight(self, posn, qcolor, intensity):
        r, g, b = _qcolor_components(qcolor)
        self.lights.append(_Light(posn, r * intensity,
                                  g * intensity, b * intensity, intensity))

    # -------- main entry point --------
    def render(self, root, painter, camera, x1, y1, x2, y2, scale):
        self.fragments = []
        self.draworder = []
        root.getFragments(camera.perspM, camera.viewM, self.fragments)

        if self.mode == Scene.RenderMode.RENDER_BSP:
            # BSP deferred — fall back to painter's algorithm.
            self._render_painters(camera)
        else:
            self._render_painters(camera)

        self.screenM = (self._make_screen_m_fixed(x1, y1, x2, y2, scale)
                        if scale > 0
                        else self._make_screen_m(self.fragments, x1, y1, x2, y2))
        self._build_screen_xy()
        linescale = max(abs(x2 - x1), abs(y2 - y1)) * (1.0 / 1000)
        self._do_drawing(painter, self.screenM, linescale, camera)

    def _build_screen_xy(self):
        """Bulk apply screenM to every projected clip-space point so the
        playback loop just reads (x, y) out of two numpy arrays."""
        if self._proj_xyz is None:
            self._scr_x = self._scr_y = None
            return
        sm = self.screenM.m
        xyz = self._proj_xyz                          # (N, 3, 3)
        x = xyz[:, :, 0]; y = xyz[:, :, 1]
        # screenM acts on (x, y, 1): (mult0, mult1, mult2) = (a*x+b*y+c, d*x+e*y+f, g*x+h*y+i)
        m0 = sm[0, 0] * x + sm[0, 1] * y + sm[0, 2]
        m1 = sm[1, 0] * x + sm[1, 1] * y + sm[1, 2]
        m2 = sm[2, 0] * x + sm[2, 1] * y + sm[2, 2]
        with N.errstate(invalid='ignore', divide='ignore'):
            self._scr_x = m0 / m2
            self._scr_y = m1 / m2

    def idPixel(self, root, painter, camera, x1, y1, x2, y2, scale,
                scaling=1.0, x=0, y=0, **_):
        """3D pick: which object lies under screen pixel ``(x, y)``? Returns
        ``object.widgetid`` of the front-most hit fragment, or 0 if none.

        The C++ version renders the scene to a tiny 7×7 pixmap and watches
        which fragment last modified the pixels. Without a rasterizer we do
        the equivalent geometrically: project every fragment and test the
        cursor against its 2D footprint (point-in-triangle, point-near-line,
        path-bbox), then pick the smallest-depth hit. Same semantic result;
        no QPixmap required."""
        self.fragments = []
        self.draworder = []
        root.getFragments(camera.perspM, camera.viewM, self.fragments)
        self._project_fragments(camera)
        self.screenM = (self._make_screen_m_fixed(x1, y1, x2, y2, scale)
                        if scale > 0
                        else self._make_screen_m(self.fragments, x1, y1, x2, y2))
        self._build_screen_xy()
        if self._scr_x is None:
            return 0
        px, py = float(x), float(y)
        # tolerance scales with the picker radius (mirror C++ ~7-pixel box).
        tol = 3.5 * float(max(scaling, 1.0))
        best_wid = 0
        best_depth = float('inf')
        sx = self._scr_x; sy = self._scr_y
        proj = self._proj_xyz
        for i, f in enumerate(self.fragments):
            wid = getattr(f.object, 'widgetid', 0) if f.object else 0
            if not wid:
                continue
            t = f.type
            if t == FR_TRIANGLE:
                if _point_in_tri(px, py,
                                 sx[i, 0], sy[i, 0],
                                 sx[i, 1], sy[i, 1],
                                 sx[i, 2], sy[i, 2]):
                    d = float(proj[i, :3, 2].max())
                else:
                    continue
            elif t == FR_LINESEG:
                if _point_near_seg(px, py,
                                   sx[i, 0], sy[i, 0],
                                   sx[i, 1], sy[i, 1], tol):
                    d = float(max(proj[i, 0, 2], proj[i, 1, 2]))
                else:
                    continue
            elif t == FR_PATH:
                cx, cy = sx[i, 0], sy[i, 0]
                if abs(px - cx) <= tol and abs(py - cy) <= tol:
                    d = float(proj[i, 0, 2])
                else:
                    continue
            else:
                continue
            if d < best_depth:
                best_depth = d
                best_wid = wid
        return int(best_wid)

    # -------- pipeline phases --------
    # Vectorised projection / depth-sort / screen-mapping all share a
    # (Nfrags, 3) max-3-points-per-fragment numpy view. We keep fragment.proj
    # as Vec3s for any external readers, but the playback loop reads the
    # bulk `_scr_x/_scr_y` arrays directly — that's a >30× speedup over the
    # per-fragment projVecToScreen calls.

    def _render_painters(self, camera):
        self._calc_lighting()
        self._project_fragments(camera)
        if self._proj_xyz is None:
            self.draworder = []
            return
        # max-depth per fragment: numpy max over the visible-points slice.
        # We left unused slots filled with -inf so they never dominate the max.
        depths = self._proj_xyz[:, :, 2].max(axis=1)
        self.draworder = N.argsort(-depths, kind='stable').tolist()

    def _project_fragments(self, camera):
        """Bulk perspective projection. Builds three numpy arrays:

          _proj_xyz   (Nfrags, 3, 3)   clip-space (x, y, depth) per point
          _proj_mask  (Nfrags, 3)      True for slots that hold real points

        Unused slots are filled with NaN (mask False) so they don't poison
        screen-mapping; depth slots for unused points use -inf so they don't
        dominate the per-fragment max-depth sort key.
        """
        frags = self.fragments
        if not frags:
            self._proj_xyz = None
            self._proj_counts = None
            return
        n = len(frags)
        counts = N.fromiter((f.n_total() for f in frags), dtype=N.int8, count=n)
        # Pack all points into a flat (n*3, 4) homogeneous source, NaN-filled
        # for unused slots so they round-trip through matmul harmlessly.
        src = N.full((n, 3, 4), N.nan)
        src[:, :, 3] = 1.0
        for i, f in enumerate(frags):
            c = counts[i]
            for pi in range(c):
                src[i, pi, :3] = f.points[pi].v
        # bulk matmul: (n, 3, 4) @ (4, 4) -> (n, 3, 4)
        out = src @ camera.perspM.m.T
        w = out[:, :, 3:4]
        # divide; the NaN rows stay NaN, real rows become clip-space xyz.
        with N.errstate(invalid='ignore', divide='ignore'):
            xyz = out[:, :, :3] / w
        # Stash for downstream phases.
        self._proj_xyz = xyz
        self._proj_counts = counts
        # For depth-sort, replace NaNs in the z slot with -inf so the max
        # over (n_total) slots picks the real maximum among visible points.
        z = xyz[:, :, 2]
        N.copyto(z, -N.inf, where=N.isnan(z))
        # Mirror back into Vec3 fragment.proj (cheap, only needed for any
        # external readers; the playback loop bypasses these).
        for i, f in enumerate(frags):
            c = int(counts[i])
            for pi in range(c):
                v = xyz[i, pi]
                f.proj[pi] = Vec3(v[0], v[1], v[2])

    def _calc_lighting(self):
        for f in self.fragments:
            if f.type == FR_TRIANGLE:
                self._light_triangle(f)
            elif f.type == FR_LINESEG:
                self._light_line(f)

    def _light_triangle(self, frag):
        prop = frag.surfaceprop
        if prop is None or prop.refl == 0:
            return
        p = frag.points
        tripos = (p[0] + p[1] + p[2]) * (1.0 / 3.0)
        norm = cross(p[1] - p[0], p[2] - p[0])
        if dot(tripos, norm) < 0:
            norm = -norm
        norm.normalise()
        if prop.hasRGBs():
            r, g, b, a = prop.color(frag.index)
            r, g, b, a = r / 255.0, g / 255.0, b / 255.0, a / 255.0
        else:
            r, g, b, a = prop.r, prop.g, prop.b, 1 - prop.trans
        for light in self.lights:
            l2t = tripos - light.posn
            l2t.normalise()
            dp = max(0.0, dot(l2t, norm))
            d = prop.refl * dp
            r += d * light.r; g += d * light.g; b += d * light.b
        frag.calccolor = (_clip255(r * 255), _clip255(g * 255),
                          _clip255(b * 255), _clip255(a * 255))
        frag.usecalccolor = True

    def _light_line(self, frag):
        prop = frag.lineprop
        if prop is None or prop.refl == 0:
            return
        if prop.hasRGBs():
            r, g, b, a = prop.color(frag.index)
            r, g, b, a = r / 255.0, g / 255.0, b / 255.0, a / 255.0
        else:
            r, g, b, a = prop.r, prop.g, prop.b, 1 - prop.trans
        pmid = (frag.points[0] + frag.points[1]) * 0.5
        linevec = frag.points[1] - frag.points[0]
        linevec.normalise()
        for light in self.lights:
            l2m = light.posn - pmid; l2m.normalise()
            sint = cross(linevec, l2m).rad()
            d = prop.refl * sint
            r += d * light.r; g += d * light.g; b += d * light.b
        frag.calccolor = (_clip255(r * 255), _clip255(g * 255),
                          _clip255(b * 255), _clip255(a * 255))
        frag.usecalccolor = True

    # -------- screen transform --------
    def _make_screen_m_fixed(self, x1, y1, x2, y2, scale):
        # Mat3 = translate(centre) * scale(scaling); the C++ uses translate × scale
        # composed via Mat3 multiplication. We just build the equivalent matrix.
        scaling = 0.5 * min(x2 - x1, y2 - y1) * scale
        cx = 0.5 * (x1 + x2); cy = 0.5 * (y1 + y2)
        return Mat3(N.array([
            [scaling, 0, cx],
            [0, scaling, cy],
            [0, 0, 1],
        ], dtype=float))

    def _make_screen_m(self, frags, x1, y1, x2, y2):
        minx = miny = float('inf')
        maxx = maxy = -float('inf')
        for f in frags:
            for p in range(f.n_visible()):
                pp = f.proj[p]
                x, y = pp(0), pp(1)
                if math.isfinite(x) and math.isfinite(y):
                    if x < minx: minx = x
                    if x > maxx: maxx = x
                    if y < miny: miny = y
                    if y > maxy: maxy = y
        if not math.isfinite(minx) or maxx == minx:
            minx, maxx = 0.0, 1.0
        if not math.isfinite(miny) or maxy == miny:
            miny, maxy = 0.0, 1.0
        minscale = min((x2 - x1) / (maxx - minx), (y2 - y1) / (maxy - miny))
        cx = 0.5 * (x1 + x2); cy = 0.5 * (y1 + y2)
        ox = -0.5 * (minx + maxx); oy = -0.5 * (miny + maxy)
        # combined: translate(cx,cy) * scale(minscale) * translate(ox,oy)
        return Mat3(N.array([
            [minscale, 0, minscale * ox + cx],
            [0, minscale, minscale * oy + cy],
            [0, 0, 1],
        ], dtype=float))

    # -------- final QPainter playback --------
    def _do_drawing(self, painter, screenM, linescale, camera):
        # distance from camera (eye-space origin) to scene origin — used to
        # scale instanced paths with perspective.
        dist0 = vec4to3(camera.viewM * Vec4(0, 0, 0, 1)).rad()
        if dist0 == 0:
            dist0 = 1.0
        no_pen = qt.QPen(qt.Qt.PenStyle.NoPen)
        no_brush = qt.QBrush()
        painter.setPen(no_pen)
        painter.setBrush(no_brush)
        scr_x = self._scr_x; scr_y = self._scr_y
        QPointF = qt.QPointF
        for idx in self.draworder:
            frag = self.fragments[idx]
            n = frag.n_total()
            projpts = [QPointF(float(scr_x[idx, pi]), float(scr_y[idx, pi]))
                       if pi < n else None
                       for pi in range(3)]
            t = frag.type
            if t == FR_TRIANGLE:
                sp = frag.surfaceprop
                if sp is None or sp.hide:
                    continue
                painter.setBrush(self._surface_brush(frag))
                # use pen if opaque, to fill gaps between triangles
                if sp.trans == 0:
                    painter.setPen(self._surface_pen(frag))
                else:
                    painter.setPen(no_pen)
                poly = qt.QPolygonF()
                for j in range(3):
                    poly.append(projpts[j])
                painter.drawPolygon(poly)
            elif t == FR_LINESEG:
                lp = frag.lineprop
                if lp is None or lp.hide:
                    continue
                painter.setBrush(no_brush)
                painter.setPen(self._line_pen(frag, linescale))
                painter.drawLine(projpts[0], projpts[1])
            elif t == FR_PATH:
                if frag.lineprop is not None:
                    pars = frag.params
                    ls = 1.0 if (pars and pars.scaleline) else linescale
                    painter.setPen(self._line_pen(frag, ls))
                if frag.surfaceprop is not None:
                    painter.setBrush(self._surface_brush(frag))
                # path size includes perspective scaling
                p0 = frag.points[0]
                distinv = dist0 / max(p0.rad(), 1e-12)
                self._draw_path(painter, frag, projpts[0], projpts[1], projpts[2],
                                linescale, distinv)

    # -------- pen/brush helpers --------
    def _qcolor(self, frag, prop):
        if frag.usecalccolor:
            r, g, b, a = frag.calccolor
            return qt.QColor(int(r), int(g), int(b), int(a))
        r, g, b, a = prop.color(frag.index)
        return qt.QColor(int(r), int(g), int(b), int(a))

    def _surface_brush(self, frag):
        sp = frag.surfaceprop
        if sp is None or sp.hide:
            return qt.QBrush()
        return qt.QBrush(self._qcolor(frag, sp))

    def _surface_pen(self, frag):
        sp = frag.surfaceprop
        if sp is None or sp.hide:
            return qt.QPen(qt.Qt.PenStyle.NoPen)
        return qt.QPen(self._qcolor(frag, sp))

    def _line_pen(self, frag, linescale):
        lp = frag.lineprop
        if lp is None or lp.hide:
            return qt.QPen(qt.Qt.PenStyle.NoPen)
        col = self._qcolor(frag, lp)
        pen = qt.QPen(col, lp.width * linescale, lp.style)
        if lp.dashpattern:
            pen.setDashPattern(lp.dashpattern)
        return pen

    def _draw_path(self, painter, frag, pt1, pt2, pt3, linescale, distscale):
        pars = frag.params
        if pars is None:
            return
        scale = frag.pathsize * linescale
        if pars.scalepersp:
            scale *= distscale
        if pars.runcallback:
            pars.callback(painter, pt1, pt2, pt3, frag.index, scale, linescale)
            return
        path = pars.path
        if path is None:
            return
        # Translate + scale the template path and draw.
        painter.save()
        painter.translate(pt1.x(), pt1.y())
        painter.scale(scale, scale)
        painter.drawPath(path)
        painter.restore()
