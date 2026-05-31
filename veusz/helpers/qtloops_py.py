"""Pure-Python fallback for the compiled ``qtloops`` extension.

Used when the C++ ``qtloops`` module is unavailable — notably under Pyodide,
where there is no compiler/Qt. It provides two kinds of function:

* **Recorders** (``plotLinesToPainter``, ``plotPathsToPainter`` …) that draw
  batched geometry. The C++ versions paint onto a real ``QPainter``; here we
  instead record the same geometry into the capturing painter's Scene, which
  is exactly what :mod:`veusz.paint.qt_capture` does when it intercepts the
  C++ calls. So in a headless/browser capture, ``qtloops`` *is* the recorder.

* **Geometry helpers** (``addNumpyToPolygonF``, ``addNumpyPolygonToPath``,
  ``binData`` …) reimplemented in NumPy/Python to match the C++ behaviour.

Faithful to ``src/qtloops/*.cpp``. Contour/3D/nonlinear-image helpers that the
headless target doesn't need are approximated or left as safe no-ops.
"""

from __future__ import annotations

import numpy as N

from .. import qtall as qt
from ..paint import qt_capture as _cap

# Lets qt_capture skip its own qtloops interception: this module already
# records straight into the painter, so wrapping would double-count.
_VEUSZ_PURE_RECORDER = True

_SMALL = 0.01  # matches C++ smallDelta() in qtloops.cpp


# ---------------------------------------------------------------------------
# Recorders — delegate to the Scene-recording emitters in qt_capture.
# Guarded so a non-capturing painter (no .recorder) is a harmless no-op.
# ---------------------------------------------------------------------------

def _recorder(fn):
    def wrap(painter, *a, **k):
        if not hasattr(painter, "recorder"):
            return None
        return fn(painter, *a, **k)
    return wrap


plotLinesToPainter = _recorder(_cap._emit_lines)
plotPathsToPainter = _recorder(_cap._emit_paths)
plotClippedPolyline = _recorder(_cap._emit_clipped_polyline)
plotClippedPolygon = _recorder(_cap._emit_clipped_polygon)
plotBoxesToPainter = _recorder(_cap._emit_boxes)
plotImageAsRects = _recorder(_cap._emit_image_as_rects)


# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def _columns(cols):
    """Coerce variadic numpy/scalar columns to 1-D float arrays.

    Scalars broadcast to the longest column (the C++ Tuple2Ptrs treats a
    length-1 array as per-row constant via dims checks)."""
    arrs = [N.atleast_1d(N.asarray(c, dtype=float)).ravel() for c in cols]
    n = max((a.size for a in arrs), default=0)
    out = []
    for a in arrs:
        if a.size == 1 and n > 1:
            a = N.full(n, a[0])
        out.append(a)
    return out, n


def addNumpyToPolygonF(poly, *cols):
    """Append interleaved (x, y) column pairs to ``poly`` (a QPolygonF),
    skipping points within 0.01 of the previous one. Mirrors
    ``qtloops.cpp:addNumpyToPolygonF``."""
    arrs, _ = _columns(cols)
    ncol = len(arrs)
    lastx = lasty = -1e6
    for row in range(max((a.size for a in arrs), default=0)):
        for c in range(0, ncol - 1, 2):
            xa, ya = arrs[c], arrs[c + 1]
            if row < xa.size and row < ya.size:
                x = float(xa[row]); y = float(ya[row])
                if abs(x - lastx) >= _SMALL or abs(y - lasty) >= _SMALL:
                    poly.append(qt.QPointF(x, y))
                    lastx, lasty = x, y


def addNumpyPolygonToPath(path, clip, *cols):
    """For each row, build a polygon from the (x, y) column pairs and add it to
    ``path`` (optionally clipped to ``clip``). Mirrors
    ``qtloops.cpp:addNumpyPolygonToPath``. ``clip`` may be None or a QRectF."""
    arrs, n = _columns(cols)
    ncol = len(arrs)
    for row in range(n):
        poly = qt.QPolygonF()
        any_pt = False
        for c in range(0, ncol - 1, 2):
            xa, ya = arrs[c], arrs[c + 1]
            if row < xa.size and row < ya.size:
                poly.append(qt.QPointF(float(xa[row]), float(ya[row])))
                any_pt = True
        if not any_pt:
            break
        if clip is not None:
            out = qt.QPolygonF()
            polygonClip(poly, clip, out)
            path.addPolygon(out)
        else:
            path.addPolygon(poly)
        path.closeSubpath()


def scalePath(path, scale):
    """Return a copy of ``path`` (QPainterPath) scaled about the origin.
    Mirrors ``qtloops.cpp:scalePath``."""
    out = qt.QPainterPath()
    n = path.elementCount()
    i = 0
    while i < n:
        el = path.elementAt(i)
        t = int(getattr(el.type, 'value', el.type))
        if t == 0:      # MoveTo
            out.moveTo(el.x * scale, el.y * scale); i += 1
        elif t == 1:    # LineTo
            out.lineTo(el.x * scale, el.y * scale); i += 1
        elif t == 2:    # CurveTo + 2 data elements
            c1 = path.elementAt(i + 1); c2 = path.elementAt(i + 2)
            out.cubicTo(el.x * scale, el.y * scale,
                        c1.x * scale, c1.y * scale,
                        c2.x * scale, c2.y * scale)
            i += 3
        else:
            i += 1
    return out


def addCubicsToPainterPath(path, poly):
    """Add cubic segments from a QPolygonF of control points taken in groups of
    four (anchor, ctrl1, ctrl2, anchor). Mirrors
    ``qtloops.cpp:addCubicsToPainterPath``."""
    pts = list(poly)
    last = None
    i = 0
    while i + 3 < len(pts):
        p0, c1, c2, p1 = pts[i], pts[i + 1], pts[i + 2], pts[i + 3]
        if last is None or (last.x() != p0.x() or last.y() != p0.y()):
            path.moveTo(p0.x(), p0.y())
        path.cubicTo(c1.x(), c1.y(), c2.x(), c2.y(), p1.x(), p1.y())
        last = p1
        i += 4


def binData(data, binning, average):
    """Sum (or average) consecutive groups of ``binning`` values, NaN-skipping.
    Mirrors ``numpyfuncs.cpp:binData``. Returns a 1-D numpy array."""
    a = N.asarray(data, dtype=float).ravel()
    binning = max(int(binning), 1)
    n = a.size
    size = -(-n // binning)  # ceil
    out = N.full(size, N.nan)
    for b in range(size):
        chunk = a[b * binning:(b + 1) * binning]
        finite = chunk[N.isfinite(chunk)]
        if finite.size:
            out[b] = finite.mean() if average else finite.sum()
    return out


def rollingAverage(data, weights, width):
    """Centred rolling (optionally weighted) average of half-window ``width``,
    NaN-skipping. Mirrors ``numpyfuncs.cpp:rollingAverage``."""
    a = N.asarray(data, dtype=float).ravel()
    n = a.size
    w = None
    if weights is not None:
        w = N.asarray(weights, dtype=float).ravel()
        n = min(n, w.size)
    width = int(width)
    out = N.full(n, N.nan)
    for i in range(n):
        lo, hi = max(0, i - width), min(n, i + width + 1)
        seg = a[lo:hi]
        mask = N.isfinite(seg)
        if w is not None:
            wt = w[lo:hi]
            mask = mask & N.isfinite(wt)
            ct = wt[mask].sum()
            if ct:
                out[i] = (wt[mask] * seg[mask]).sum() / ct
        else:
            if mask.any():
                out[i] = seg[mask].mean()
    return out


# ---------------------------------------------------------------------------
# Clipping (Sutherland–Hodgman for polygons, Liang–Barsky for polylines)
# ---------------------------------------------------------------------------

def _rect_bounds(r):
    x1, y1 = r.left(), r.top()
    x2, y2 = r.right(), r.bottom()
    return min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)


def polygonClip(inpoly, cliprect, outpoly):
    """Sutherland–Hodgman clip of ``inpoly`` to the axis-aligned ``cliprect``;
    appended into ``outpoly`` (both QPolygonF). Mirrors ``polygonclip.cpp``."""
    xmin, ymin, xmax, ymax = _rect_bounds(cliprect)
    pts = [(p.x(), p.y()) for p in inpoly]
    if not pts:
        return

    def clip_edge(poly, inside, intersect):
        if not poly:
            return []
        out = []
        prev = poly[-1]
        prev_in = inside(prev)
        for cur in poly:
            cur_in = inside(cur)
            if cur_in:
                if not prev_in:
                    out.append(intersect(prev, cur))
                out.append(cur)
            elif prev_in:
                out.append(intersect(prev, cur))
            prev, prev_in = cur, cur_in
        return out

    def lerp(a, b, t):
        return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

    # left
    pts = clip_edge(pts, lambda p: p[0] >= xmin,
                    lambda a, b: lerp(a, b, (xmin - a[0]) / (b[0] - a[0])))
    # right
    pts = clip_edge(pts, lambda p: p[0] <= xmax,
                    lambda a, b: lerp(a, b, (xmax - a[0]) / (b[0] - a[0])))
    # top
    pts = clip_edge(pts, lambda p: p[1] >= ymin,
                    lambda a, b: lerp(a, b, (ymin - a[1]) / (b[1] - a[1])))
    # bottom
    pts = clip_edge(pts, lambda p: p[1] <= ymax,
                    lambda a, b: lerp(a, b, (ymax - a[1]) / (b[1] - a[1])))

    for x, y in pts:
        outpoly.append(qt.QPointF(x, y))


def _clip_segment(x1, y1, x2, y2, xmin, ymin, xmax, ymax):
    """Liang–Barsky: return clipped (x1,y1,x2,y2) or None if fully outside."""
    dx, dy = x2 - x1, y2 - y1
    p = [-dx, dx, -dy, dy]
    q = [x1 - xmin, xmax - x1, y1 - ymin, ymax - y1]
    u1, u2 = 0.0, 1.0
    for pi, qi in zip(p, q):
        if pi == 0:
            if qi < 0:
                return None
        else:
            t = qi / pi
            if pi < 0:
                u1 = max(u1, t)
            else:
                u2 = min(u2, t)
    if u1 > u2:
        return None
    return (x1 + u1 * dx, y1 + u1 * dy, x1 + u2 * dx, y1 + u2 * dy)


def clipPolyline(clip, poly):
    """Clip a polyline to ``clip`` (QRectF); return a list of QPolygonF runs.
    Mirrors ``polylineclip.cpp:clipPolyline``."""
    xmin, ymin, xmax, ymax = _rect_bounds(clip)
    pts = [(p.x(), p.y()) for p in poly]
    runs = []
    cur = None
    for i in range(len(pts) - 1):
        seg = _clip_segment(*pts[i], *pts[i + 1], xmin, ymin, xmax, ymax)
        if seg is None:
            cur = None
            continue
        sx1, sy1, sx2, sy2 = seg
        if cur is not None and abs(cur[-1][0] - sx1) < 1e-9 and abs(cur[-1][1] - sy1) < 1e-9:
            cur.append((sx2, sy2))
        else:
            cur = [(sx1, sy1), (sx2, sy2)]
            runs.append(cur)
    out = []
    for run in runs:
        pg = qt.QPolygonF()
        for x, y in run:
            pg.append(qt.QPointF(x, y))
        out.append(pg)
    return out


# ---------------------------------------------------------------------------
# Approximations for rarely-used helpers (cosmetic / edge-case features).
# ---------------------------------------------------------------------------

def _straight_cubics(pts):
    """Build group-of-4 cubic control points tracing straight segments through
    the data points — a faithful-enough stand-in for the C++ Bézier fitters
    (the 'bezier' line option degrades to straight segments)."""
    out = qt.QPolygonF()
    for i in range(len(pts) - 1):
        p0, p1 = pts[i], pts[i + 1]
        c1 = qt.QPointF(p0.x() + (p1.x() - p0.x()) / 3.0,
                        p0.y() + (p1.y() - p0.y()) / 3.0)
        c2 = qt.QPointF(p0.x() + 2.0 * (p1.x() - p0.x()) / 3.0,
                        p0.y() + 2.0 * (p1.y() - p0.y()) / 3.0)
        out.append(p0); out.append(c1); out.append(c2); out.append(p1)
    return out


def bezier_fit_cubic_multi(data, error, *a, **k):
    return _straight_cubics(list(data))


def bezier_fit_cubic_tight(data, looseness, *a, **k):
    return _straight_cubics(list(data))


def bezier_fit_cubic_single(data, error, *a, **k):
    return _straight_cubics(list(data))


# ---------------------------------------------------------------------------
# Geometry value types exposed by qtloops (data carriers + label de-conflict)
# ---------------------------------------------------------------------------

class RotatedRectangle:
    """A rectangle with a rotation angle (radians), as used by text bounds /
    label placement. Mirrors ``polylineclip.h:RotatedRectangle``."""

    def __init__(self, cx=0.0, cy=0.0, xw=0.0, yw=0.0, angle=0.0):
        self.cx = float(cx); self.cy = float(cy)
        self.xw = float(xw); self.yw = float(yw)
        self.angle = float(angle)

    def isValid(self):
        return self.xw > 0 and self.yw > 0

    def rotate(self, dtheta):
        self.angle += dtheta

    def rotateAboutOrigin(self, dtheta):
        import math
        c, s = math.cos(dtheta), math.sin(dtheta)
        nx = self.cx * c - self.cy * s
        ny = self.cx * s + self.cy * c
        self.cx, self.cy = nx, ny
        self.angle += dtheta

    def translate(self, dx, dy):
        self.cx += dx; self.cy += dy

    def makePolygon(self):
        import math
        c, s = math.cos(self.angle), math.sin(self.angle)
        hw, hh = self.xw / 2.0, self.yw / 2.0
        poly = qt.QPolygonF()
        for x, y in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh)):
            poly.append(qt.QPointF(self.cx + x * c - y * s,
                                   self.cy + x * s + y * c))
        return poly


def _rect_corners(rect):
    import math
    c, s = math.cos(rect.angle), math.sin(rect.angle)
    hw, hh = rect.xw / 2.0, rect.yw / 2.0
    return [(rect.cx + x * c - y * s, rect.cy + x * s + y * c)
            for x, y in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]


def _polys_overlap(a, b):
    """Separating-axis test for two convex polygons (lists of (x, y))."""
    for poly in (a, b):
        n = len(poly)
        for i in range(n):
            x1, y1 = poly[i]
            x2, y2 = poly[(i + 1) % n]
            # edge normal
            nx, ny = -(y2 - y1), (x2 - x1)
            amin = amax = None
            for px, py in a:
                proj = px * nx + py * ny
                amin = proj if amin is None else min(amin, proj)
                amax = proj if amax is None else max(amax, proj)
            bmin = bmax = None
            for px, py in b:
                proj = px * nx + py * ny
                bmin = proj if bmin is None else min(bmin, proj)
                bmax = proj if bmax is None else max(bmax, proj)
            if amax < bmin or bmax < amin:
                return False  # separating axis found
    return True


class RectangleOverlapTester:
    """Accumulates rotated rectangles and reports whether a new one overlaps
    any already added — drives axis tick-label thinning. Mirrors
    ``polylineclip.h:RectangleOverlapTester``."""

    def __init__(self):
        self._rects = []

    def addRect(self, rect):
        self._rects.append(_rect_corners(rect))

    def willOverlap(self, rect):
        corners = _rect_corners(rect)
        return any(_polys_overlap(r, corners) for r in self._rects)


class LineLabeller:
    """Pure-Python contour line labeller. Unlike the C++ extension it does not
    place text or break lines around labels — it simply passes the added
    polylines straight through so contour *lines* render. The painter clips to
    ``clippath`` (the plot rect, set by the subclass), so lines stay inside the
    graph; label text is drawn by the subclass's ``drawAt`` (a no-op here, since
    ``process`` doesn't compute label rectangles)."""

    def __init__(self, cliprect=None, rotatelabels=False):
        self._cliprect = cliprect
        self._rotatelabels = rotatelabels
        self._lines = []

    def addLine(self, poly, textsize):
        self._lines.append(poly)

    def process(self):
        pass

    def getNumPolySets(self):
        return len(self._lines)

    def getPolySet(self, i):
        return [self._lines[i]]

    def drawAt(self, idx, r):
        pass


def resampleNonlinearImage(image, *a, **k):
    # Nonlinear-axis image resampling is out of scope headless; pass through.
    return image


def plotNonlinearImageAsBoxes(painter, *a, **k):
    return None


# ---------------------------------------------------------------------------
# Colormap → image (used by image / colorbar widgets)
# ---------------------------------------------------------------------------

def numpyToQImage(imgdata, colors, forcetrans=False):
    """Map a 2-D data array (values 0..1) through a colour table to an ARGB
    image. ``colors`` is (numcolors, 4) with columns [B, G, R, A]; a leading
    color of -1 selects discrete 'jumps' mode. Mirrors ``qtloops.cpp``
    (including the numpy↔Qt vertical flip). Returns a qtshim QImage carrying
    raw ARGB32 bytes so the captured Scene has real pixels."""
    data = N.asarray(imgdata, dtype=float)
    cols = N.asarray(colors, dtype=float)
    if data.ndim != 2:
        data = N.atleast_2d(data)
    yw, xw = data.shape
    numcolors = cols.shape[0]
    numbands = max(numcolors - 1, 1)
    finite = N.isfinite(data)
    val = N.clip(N.where(finite, data, 0.0), 0.0, 1.0)

    if numcolors >= 1 and cols[0, 0] == -1:
        band = N.clip((val * (numcolors - 1)).astype(int) + 1, 1, numcolors - 1)
        bgra = cols[band]
    else:
        band = N.clip((val * numbands).astype(int), 0, numbands - 1)
        band2 = N.minimum(band + 1, numbands)
        delta = (val * numbands - band)[..., None]
        bgra = ((1.0 - delta) * cols[band] + delta * cols[band2] + 0.5)

    bgra = N.where(finite[..., None], bgra, 0.0)
    buf = N.empty((yw, xw, 4), dtype=N.uint8)
    buf[..., 0] = N.clip(bgra[..., 0], 0, 255)  # B
    buf[..., 1] = N.clip(bgra[..., 1], 0, 255)  # G
    buf[..., 2] = N.clip(bgra[..., 2], 0, 255)  # R
    buf[..., 3] = N.clip(bgra[..., 3], 0, 255)  # A
    buf = buf[::-1]  # numpy row 0 → bottom scanline (Qt is top-down)

    img = qt.QImage(xw, yw, qt.QImage.Format.Format_ARGB32)
    img._pixels = buf.tobytes()
    return img


def applyImageTransparancy(img, data):
    """Scale each pixel's alpha by clip(data, 0, 1). Mirrors ``qtloops.cpp``."""
    pix = getattr(img, "_pixels", None)
    if pix is None:
        return
    d = N.clip(N.asarray(data, dtype=float), 0.0, 1.0)
    if d.ndim != 2:
        d = N.atleast_2d(d)
    yw = min(d.shape[0], img.height())
    xw = min(d.shape[1], img.width())
    W, H = img.width(), img.height()
    buf = N.frombuffer(pix, dtype=N.uint8).reshape(H, W, 4).copy()
    # buf is top-down; numpy row y maps to image row (H-1-y) (the flip above).
    for y in range(yw):
        ir = H - 1 - y
        buf[ir, :xw, 3] = (buf[ir, :xw, 3] * d[y, :xw]).astype(N.uint8)
    img._pixels = buf.tobytes()
