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

# ---------------------------------------------------------------------------
# Cubic Bezier fitting (port of src/qtloops/beziers.cpp + beziers_qtwrap.cpp).
#
# These power Veusz's 'bezier' / 'tight-Bezier' line styles. Each fitter
# returns a flat list of (x, y) control points in groups of four
#   [anchor0, ctrl1, ctrl2, anchor1, anchor1', ctrl1', ...]
# exactly as ``addCubicsToPainterPath`` consumes them. The single/multi
# fitters reproduce Schneider's least-squares algorithm ("An Algorithm for
# Automatically Fitting Digitized Curves", Graphics Gems, 1990); the tight
# fitter reproduces the MS-Excel-like control-point construction.
# ---------------------------------------------------------------------------

import math as _math

# tangent value used by Schneider's code to mean "estimate me"
_UNCONSTRAINED = (0.0, 0.0)


def _pts_as_tuples(data):
    """Coerce a QPolygonF/iterable of QPointF (or (x, y) tuples) to a list of
    (x, y) float tuples."""
    out = []
    for p in data:
        if hasattr(p, "x"):
            out.append((float(p.x()), float(p.y())))
        else:
            out.append((float(p[0]), float(p[1])))
    return out


def _polyf(groups):
    """Build a QPolygonF from a flat list of (x, y) control-point tuples."""
    out = qt.QPolygonF()
    for x, y in groups:
        out.append(qt.QPointF(x, y))
    return out


def _vsub(a, b):
    return (a[0] - b[0], a[1] - b[1])


def _vadd(a, b):
    return (a[0] + b[0], a[1] + b[1])


def _vscale(a, s):
    return (a[0] * s, a[1] * s)


def _dot(a, b):
    return a[0] * b[0] + a[1] * b[1]


def _l2(p):
    return _math.hypot(p[0], p[1])


def _is_zero(p):
    return p[0] == 0.0 and p[1] == 0.0


def _unit(p):
    m = _math.hypot(p[0], p[1])
    if m == 0:
        return (0.0, 0.0)
    return (p[0] / m, p[1] / m)


def _rot90(p):
    return (-p[1], p[0])


def _B0(u):
    return (1.0 - u) ** 3


def _B1(u):
    return 3.0 * u * (1.0 - u) ** 2


def _B2(u):
    return 3.0 * u * u * (1.0 - u)


def _B3(u):
    return u ** 3


def _bezier_pt(degree, V, t):
    """Evaluate a Bezier of given degree (control points V) at parameter t."""
    pascal = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]
    s = 1.0 - t
    spow = [1.0, s, 0.0, 0.0]
    tpow = [1.0, t, 0.0, 0.0]
    for i in range(1, degree):
        spow[i + 1] = spow[i] * s
        tpow[i + 1] = tpow[i] * t
    ret = _vscale(V[0], spow[degree])
    for i in range(1, degree + 1):
        coef = pascal[degree][i] * spow[degree - i] * tpow[i]
        ret = _vadd(ret, _vscale(V[i], coef))
    return ret


def _copy_without_nans_or_dups(src):
    """Drop NaN points and adjacent duplicates, keeping the first finite point.
    Mirrors ``copy_without_nans_or_adjacent_duplicates``."""
    out = []
    seen_first = False
    for p in src:
        if _math.isnan(p[0]) or _math.isnan(p[1]):
            continue
        if not seen_first:
            out.append(p)
            seen_first = True
        elif p != out[-1]:
            out.append(p)
    return out


def _left_tangent(d, tol_sq):
    n = len(d)
    i = 1
    while True:
        t = _vsub(d[i], d[0])
        distsq = _dot(t, t)
        if tol_sq < distsq:
            return _unit(t)
        i += 1
        if i == n:
            return _unit(t) if distsq != 0 else _unit(_vsub(d[1], d[0]))


def _right_tangent(d, tol_sq):
    n = len(d)
    last = n - 1
    i = last - 1
    while True:
        t = _vsub(d[i], d[last])
        distsq = _dot(t, t)
        if tol_sq < distsq:
            return _unit(t)
        if i == 0:
            return _unit(t) if distsq != 0 else _unit(_vsub(d[last - 1], d[last]))
        i -= 1


def _center_tangent(d, center):
    if d[center + 1] == d[center - 1]:
        diff = _vsub(d[center], d[center - 1])
        ret = _rot90(diff)
    else:
        ret = _vsub(d[center - 1], d[center + 1])
    return _unit(ret)


def _chord_length_parameterize(d):
    n = len(d)
    u = [0.0] * n
    for i in range(1, n):
        u[i] = u[i - 1] + _l2(_vsub(d[i], d[i - 1]))
    tot = u[n - 1]
    if tot == 0:
        return u, False
    if _math.isfinite(tot):
        for i in range(1, n):
            u[i] /= tot
    else:
        for i in range(1, n):
            u[i] = i / (n - 1)
    u[n - 1] = 1.0
    return u, True


def _estimate_lengths(bezier, data, uPrime, tHat1, tHat2):
    C = [[0.0, 0.0], [0.0, 0.0]]
    X = [0.0, 0.0]
    n = len(data)
    bezier[0] = data[0]
    bezier[3] = data[n - 1]
    for i in range(n):
        b0, b1, b2, b3 = _B0(uPrime[i]), _B1(uPrime[i]), _B2(uPrime[i]), _B3(uPrime[i])
        a1 = _vscale(tHat1, b1)
        a2 = _vscale(tHat2, b2)
        C[0][0] += _dot(a1, a1)
        C[0][1] += _dot(a1, a2)
        C[1][0] = C[0][1]
        C[1][1] += _dot(a2, a2)
        shortfall = _vsub(
            _vsub(data[i], _vscale(bezier[0], b0 + b1)),
            _vscale(bezier[3], b2 + b3))
        X[0] += _dot(a1, shortfall)
        X[1] += _dot(a2, shortfall)
    det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1]
    if det_C0_C1 != 0:
        det_C0_X = C[0][0] * X[1] - C[0][1] * X[0]
        det_X_C1 = X[0] * C[1][1] - X[1] * C[0][1]
        alpha_l = det_X_C1 / det_C0_C1
        alpha_r = det_C0_X / det_C0_C1
    else:
        c0 = C[0][0] + C[0][1]
        if c0 != 0:
            alpha_l = alpha_r = X[0] / c0
        else:
            c1 = C[1][0] + C[1][1]
            if c1 != 0:
                alpha_l = alpha_r = X[1] / c1
            else:
                alpha_l = alpha_r = 0.0
    if alpha_l < 1.0e-6 or alpha_r < 1.0e-6:
        alpha_l = alpha_r = _l2(_vsub(data[n - 1], data[0])) * (1.0 / 3.0)
    bezier[1] = _vadd(_vscale(tHat1, alpha_l), bezier[0])
    bezier[2] = _vadd(_vscale(tHat2, alpha_r), bezier[3])


def _estimate_bi(bezier, ei, data, u):
    oi = 3 - ei
    num = (0.0, 0.0)
    den = 0.0
    for i in range(len(data)):
        ui = u[i]
        b = [_B0(ui), _B1(ui), _B2(ui), _B3(ui)]
        nx = b[ei] * (b[0] * bezier[0][0] + b[oi] * bezier[0][0]
                      + b[3] * bezier[3][0] - data[i][0])
        ny = b[ei] * (b[0] * bezier[0][1] + b[oi] * bezier[0][1]
                      + b[3] * bezier[3][1] - data[i][1])
        num = (num[0] + nx, num[1] + ny)
        den -= b[ei] * b[ei]
    if den != 0:
        bezier[ei] = (num[0] / den, num[1] / den)
    else:
        bezier[ei] = _vscale(_vadd(_vscale(bezier[0], oi),
                                   _vscale(bezier[3], ei)), 1.0 / 3.0)


def _generate_bezier(data, u, tHat1, tHat2, tolerance_sq):
    bezier = [None, None, None, None]
    est1 = _is_zero(tHat1)
    est2 = _is_zero(tHat2)
    et1 = _left_tangent(data, tolerance_sq) if est1 else tHat1
    et2 = _right_tangent(data, tolerance_sq) if est2 else tHat2
    _estimate_lengths(bezier, data, u, et1, et2)
    if est1:
        _estimate_bi(bezier, 1, data, u)
        if bezier[1] != bezier[0]:
            et1 = _unit(_vsub(bezier[1], bezier[0]))
        _estimate_lengths(bezier, data, u, et1, et2)
    return bezier


def _newton_raphson(Q, P, u):
    Q1 = [_vscale(_vsub(Q[i + 1], Q[i]), 3.0) for i in range(3)]
    Q2 = [_vscale(_vsub(Q1[i + 1], Q1[i]), 2.0) for i in range(2)]
    Q_u = _bezier_pt(3, Q, u)
    Q1_u = _bezier_pt(2, Q1, u)
    Q2_u = _bezier_pt(1, Q2, u)
    diff = _vsub(Q_u, P)
    numerator = _dot(diff, Q1_u)
    denominator = _dot(Q1_u, Q1_u) + _dot(diff, Q2_u)
    if denominator > 0:
        improved_u = u - (numerator / denominator)
    else:
        if numerator > 0:
            improved_u = u * 0.98 - 0.01
        elif numerator < 0:
            improved_u = 0.031 + u * 0.98
        else:
            improved_u = u
    if not _math.isfinite(improved_u):
        improved_u = u
    elif improved_u < 0.0:
        improved_u = 0.0
    elif improved_u > 1.0:
        improved_u = 1.0
    diff_lensq = _dot(diff, diff)
    proportion = 0.125
    while True:
        if _dot(_vsub(_bezier_pt(3, Q, improved_u), P),
                _vsub(_bezier_pt(3, Q, improved_u), P)) > diff_lensq:
            if proportion > 1.0:
                improved_u = u
                break
            improved_u = (1 - proportion) * improved_u + proportion * u
            proportion += 0.125
        else:
            break
    return improved_u


def _reparameterize(d, u, bezCurve):
    last = len(d) - 1
    for i in range(1, last):
        u[i] = _newton_raphson(bezCurve, d[i], u[i])


def _compute_hook(a, b, u, bezCurve, tolerance):
    P = _bezier_pt(3, bezCurve, u)
    diff = _vsub(_vscale(_vadd(a, b), 0.5), P)
    dist = _l2(diff)
    if dist < tolerance:
        return 0.0
    allowed = _l2(_vsub(b, a)) * 0.2 + tolerance
    return dist / allowed


def _compute_max_error_ratio(d, u, bezCurve, tolerance):
    n = len(d)
    last = n - 1
    maxDistsq = 0.0
    max_hook_ratio = 0.0
    snap_end = 0
    splitPoint = last  # default
    prev = bezCurve[0]
    for i in range(1, last + 1):
        curr = _bezier_pt(3, bezCurve, u[i])
        dd = _vsub(curr, d[i])
        distsq = _dot(dd, dd)
        if distsq > maxDistsq:
            maxDistsq = distsq
            splitPoint = i
        hook_ratio = _compute_hook(prev, curr, 0.5 * (u[i - 1] + u[i]),
                                   bezCurve, tolerance)
        if max_hook_ratio < hook_ratio:
            max_hook_ratio = hook_ratio
            snap_end = i
        prev = curr
    dist_ratio = _math.sqrt(maxDistsq) / tolerance
    if max_hook_ratio <= dist_ratio:
        ret = dist_ratio
    else:
        ret = -max_hook_ratio
        splitPoint = snap_end - 1
    return ret, splitPoint


def _fit_cubic_full(out, data, tHat1, tHat2, error, max_beziers):
    """Append fitted cubic segments (each 4 control points) to ``out``.
    Returns the number of segments, or -1 on error. Mirrors
    ``sp_bezier_fit_cubic_full``."""
    maxIterations = 4
    n = len(data)
    if n < 2:
        return 0

    if n == 2:
        b0 = data[0]
        b3 = data[n - 1]
        dist = _l2(_vsub(data[n - 1], data[0])) * (1.0 / 3.0)
        if _math.isnan(dist):
            b1, b2 = b0, b3
        else:
            b1 = (_vscale(_vadd(_vscale(b0, 2), b3), 1.0 / 3.0)
                  if _is_zero(tHat1) else _vadd(b0, _vscale(tHat1, dist)))
            b2 = (_vscale(_vadd(b0, _vscale(b3, 2)), 1.0 / 3.0)
                  if _is_zero(tHat2) else _vadd(b3, _vscale(tHat2, dist)))
        out.extend([b0, b1, b2, b3])
        return 1

    u, ok = _chord_length_parameterize(data)
    if not ok:
        return 0
    bezier = _generate_bezier(data, u, tHat1, tHat2, error)
    _reparameterize(data, u, bezier)
    tolerance = _math.sqrt(error + 1e-9)
    maxErrorRatio, splitPoint = _compute_max_error_ratio(data, u, bezier, tolerance)

    if abs(maxErrorRatio) <= 1.0:
        out.extend(bezier)
        return 1

    if 0.0 <= maxErrorRatio <= 3.0:
        for _ in range(maxIterations):
            bezier = _generate_bezier(data, u, tHat1, tHat2, error)
            _reparameterize(data, u, bezier)
            maxErrorRatio, splitPoint = _compute_max_error_ratio(
                data, u, bezier, tolerance)
            if abs(maxErrorRatio) <= 1.0:
                out.extend(bezier)
                return 1

    is_corner = maxErrorRatio < 0

    if is_corner:
        if splitPoint == 0:
            if _is_zero(tHat1):
                splitPoint += 1
            else:
                return _fit_cubic_full(out, data, _UNCONSTRAINED, tHat2,
                                       error, max_beziers)
        elif splitPoint == n - 1:
            if _is_zero(tHat2):
                splitPoint -= 1
            else:
                return _fit_cubic_full(out, data, tHat1, _UNCONSTRAINED,
                                       error, max_beziers)

    if max_beziers > 1:
        if is_corner:
            recTHat1 = recTHat2 = _UNCONSTRAINED
        else:
            recTHat2 = _center_tangent(data, splitPoint)
            recTHat1 = _vscale(recTHat2, -1.0)
        nsegs1 = _fit_cubic_full(out, data[:splitPoint + 1], tHat1, recTHat2,
                                 error, max_beziers - 1)
        if nsegs1 < 0:
            return -1
        nsegs2 = _fit_cubic_full(out, data[splitPoint:], recTHat1, tHat2,
                                 error, max_beziers - nsegs1)
        if nsegs2 < 0:
            return -1
        return nsegs1 + nsegs2
    return -1


def bezier_fit_cubic_single(data, error, *a, **k):
    """Fit a single cubic Bezier segment to ``data`` (Schneider). Returns a
    QPolygonF of 4 control points, or empty on failure. Mirrors
    ``bezier_fit_cubic_single`` in beziers_qtwrap.cpp."""
    pts = _pts_as_tuples(data)
    uniqued = _copy_without_nans_or_dups(pts)
    out = []
    if len(uniqued) >= 2:
        retn = _fit_cubic_full(out, uniqued, _UNCONSTRAINED, _UNCONSTRAINED,
                               error, 1)
        if retn < 0:
            return qt.QPolygonF()
    return _polyf(out)


def bezier_fit_cubic_multi(data, error, max_beziers=None, *a, **k):
    """Fit a multi-segment Bezier curve to ``data`` (Schneider, recursive).
    Returns a QPolygonF of 4*nsegs control points. Mirrors
    ``bezier_fit_cubic_multi`` / ``sp_bezier_fit_cubic_r``."""
    pts = _pts_as_tuples(data)
    if max_beziers is None:
        max_beziers = len(pts) + 1
    max_beziers = max(int(max_beziers), 1)
    uniqued = _copy_without_nans_or_dups(pts)
    out = []
    if len(uniqued) >= 2:
        retn = _fit_cubic_full(out, uniqued, _UNCONSTRAINED, _UNCONSTRAINED,
                               error, max_beziers)
        if retn < 0:
            return qt.QPolygonF()
    return _polyf(out)


def bezier_fit_cubic_tight(data, looseness, *a, **k):
    """MS-Excel-like tight cubic Bezier fit. Returns a QPolygonF of 4*(len-1)
    control points. Mirrors ``bezier_fit_cubic_tight`` in beziers_qtwrap.cpp."""
    pts = _pts_as_tuples(data)
    n = len(pts)
    if n < 2:
        return qt.QPolygonF()
    if n == 2:
        return _polyf([pts[0], pts[0], pts[1], pts[1]])

    out = []
    for i in range(1, n):
        pt1 = pts[i - 1]
        pt2 = pts[i]
        if i == 1:
            pt0 = pts[i - 1]
            pt3 = pts[i + 1]
            f1 = looseness / 1.5
            f2 = looseness / 3.0
        elif i == n - 1:
            pt0 = pts[i - 2]
            pt3 = pts[i]
            f1 = looseness / 3.0
            f2 = looseness / 1.5
        else:
            pt0 = pts[i - 2]
            pt3 = pts[i + 1]
            f1 = looseness / 3.0
            f2 = looseness / 3.0
        d02 = _l2(_vsub(pt2, pt0))
        d12 = _l2(_vsub(pt2, pt1))
        d13 = _l2(_vsub(pt3, pt1))
        b1 = d02 < d12 * 3.0
        b2 = d13 < d12 * 3.0
        if not (b1 and b2):
            f1 = (d12 / d02 / 2.0) if d02 != 0 else 0.0
            f2 = (d12 / d13 / 2.0) if d13 != 0 else 0.0
            if b1:
                f1 = f2
            if b2:
                f2 = f1
        c1 = _vadd(pt1, _vscale(_vsub(pt2, pt0), f1))
        c2 = _vadd(pt2, _vscale(_vsub(pt1, pt3), f2))
        out.extend([pt1, c1, c2, pt2])
    return _polyf(out)


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


# Candidate fractional positions along a contour line at which a label may be
# placed, tried in order (matches NUM_LABEL_POSITIONS in polylineclip.cpp).
_LABEL_POSITIONS = (0.5, 1.0 / 3.0, 2.0 / 3.0, 0.4, 0.6, 0.25, 0.75)


class LineLabeller:
    """Pure-Python contour line labeller, mirroring ``polylineclip.cpp``.

    ``addLine`` clips each contour polyline to the clip rectangle and stores
    the clipped pieces as one *polyset*. ``process`` walks every polyset and,
    for each clipped polyline long enough to hold a label, finds the first
    candidate position whose (rotated) label rectangle does not overlap an
    already-placed label, then calls ``drawAt(polyset_index, rect)``. The
    subclass (``ContourLineLabeller`` in contour.py) overrides ``drawAt`` to
    actually render the numeric label and subtract its rectangle from the line
    clip path, so contour LINES *and* their inline LABELS both render headless.
    """

    def __init__(self, cliprect=None, rotatelabels=False):
        self._cliprect = cliprect
        self._rotatelabels = bool(rotatelabels)
        # one PolyVector (list of clipped QPolygonF) per addLine call
        self._polys = []
        self._textsizes = []

    def addLine(self, poly, textsize):
        """Clip ``poly`` to the clip rect and store the pieces as one polyset.
        ``textsize`` is a QSizeF giving the label box for this contour."""
        if self._cliprect is not None:
            pieces = clipPolyline(self._cliprect, poly)
        else:
            pieces = [poly]
        self._polys.append(pieces)
        self._textsizes.append(textsize)

    def _find_line_position(self, poly, frac, size):
        """Return a RotatedRectangle for a label centred at fractional length
        ``frac`` along ``poly``, or an invalid (zero-size) one if the line is
        too short. Mirrors ``LineLabeller::findLinePosition``."""
        pts = [(p.x(), p.y()) for p in poly]
        if len(pts) < 2:
            return RotatedRectangle()

        sw = size.width() if hasattr(size, "width") else size[0]
        sh = size.height() if hasattr(size, "height") else size[1]

        seglens = [_math.hypot(pts[i][0] - pts[i - 1][0],
                               pts[i][1] - pts[i - 1][1])
                   for i in range(1, len(pts))]
        totlength = sum(seglens)

        # don't label lines which are too short to hold the text
        if totlength / 2.0 < max(sw, sh):
            return RotatedRectangle()

        target = totlength * frac
        length = 0.0
        for i in range(1, len(pts)):
            seglength = seglens[i - 1]
            if length + seglength >= target:
                fseg = (target - length) / seglength if seglength else 0.0
                xp = pts[i - 1][0] * (1 - fseg) + pts[i][0] * fseg
                yp = pts[i - 1][1] * (1 - fseg) + pts[i][1] * fseg
                angle = (_math.atan2(pts[i][1] - pts[i - 1][1],
                                     pts[i][0] - pts[i - 1][0])
                         if self._rotatelabels else 0.0)
                return RotatedRectangle(xp, yp, sw, sh, angle)
            length += seglength

        return RotatedRectangle()

    def process(self):
        """Place at most one label per clipped polyline, avoiding overlaps,
        invoking ``drawAt`` for each. Mirrors ``LineLabeller::process``."""
        rtest = RectangleOverlapTester()
        for polyseti, pv in enumerate(self._polys):
            size = self._textsizes[polyseti]
            for poly in pv:
                for frac in _LABEL_POSITIONS:
                    r = self._find_line_position(poly, frac, size)
                    if not r.isValid():
                        break
                    if not rtest.willOverlap(r):
                        self.drawAt(polyseti, r)
                        rtest.addRect(r)
                        break  # only add label once per polyline

    def getNumPolySets(self):
        return len(self._polys)

    def getPolySet(self, i):
        if 0 <= i < len(self._polys):
            return self._polys[i]
        return []

    def drawAt(self, idx, r):
        """Overridden by subclasses to render the label; no-op by default."""
        pass


def resampleNonlinearImage(image, x0, y0, x1, y1, xedge, yedge):
    """Resample a per-bin colour image onto a uniform pixel grid covering the
    plotter rect [x0,x1]x[y0,y1], using the (non-uniform) pixel edges. Returns a
    single QImage, so a non-linearly-binned image (e.g. log-spaced histogram
    bins, or any image on a log axis) is drawn as one image op rather than
    thousands of rectangles. Mirrors ``resampleNonlinearImage`` in qtloops.cpp;
    this is the pure-Python fallback used in the browser / headless, where the
    C++ extension is absent.
    """
    sw, sh = image.width(), image.height()
    pix = getattr(image, '_pixels', None)
    if pix is None or sw == 0 or sh == 0:
        return image

    x0, x1 = (int(x0), int(x1)) if x0 <= x1 else (int(x1), int(x0))
    y0, y1 = (int(y0), int(y1)) if y0 <= y1 else (int(y1), int(y0))
    xw, yw = x1 - x0, y1 - y0
    if xw <= 0 or yw <= 0:
        return image

    src = N.frombuffer(pix, dtype=N.uint8).reshape(sh, sw, 4)
    xe = N.asarray(xedge, dtype=float)
    ye = N.asarray(yedge, dtype=float)

    # output pixel centres, in plotter coordinates
    px = N.arange(xw) + x0 + 0.5
    py = N.arange(yw) + y0 + 0.5

    # source column: bin whose [xedge[ix], xedge[ix+1]) contains px (ascending)
    ix = N.clip(N.searchsorted(xe, px, side='right') - 1, 0, sw - 1)
    # source row: C++ scans the reversed y edges (yedge runs high→low in plotter
    # coords for a normal upward axis, so its reverse is ascending)
    yr = ye[::-1]
    iy = N.clip(N.searchsorted(yr, py, side='right') - 1, 0, sh - 1)

    out = src[iy[:, None], ix[None, :], :]
    img = qt.QImage(xw, yw, image.format())
    img._pixels = N.ascontiguousarray(out, dtype=N.uint8).tobytes()
    return img


def plotNonlinearImageAsBoxes(painter, image, xedge, yedge):
    """Draw a per-bin colour image as filled rectangles at the given pixel
    edges. Used for drawMode='default'/'rectangles' on non-linear images. This
    emits one rect per cell, so it is heavier than ``resampleNonlinearImage``
    (which density defaults to); provided so existing image widgets with the
    default draw mode still render headless / in the browser.
    """
    sw, sh = image.width(), image.height()
    pix = getattr(image, '_pixels', None)
    if pix is None or sw == 0 or sh == 0:
        return None

    src = N.frombuffer(pix, dtype=N.uint8).reshape(sh, sw, 4)
    xe = N.asarray(xedge, dtype=float)
    ye = N.asarray(yedge, dtype=float)

    for col in range(sw):
        xa, xb = xe[col], xe[col + 1]
        # image column `col` maps to x bin `col`; image row `row` (top-down)
        # maps to the y edge pair (reversed, as in resampleNonlinearImage)
        for row in range(sh):
            b, g, r, a = (int(v) for v in src[row, col])
            if a == 0:
                continue
            ya, yb = ye[sh - 1 - row], ye[sh - row]
            painter.fillRect(
                qt.QRectF(min(xa, xb), min(ya, yb),
                          abs(xb - xa), abs(yb - ya)),
                qt.QColor(r, g, b, a))
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
