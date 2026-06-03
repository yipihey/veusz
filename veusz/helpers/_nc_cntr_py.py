"""Pure-Python contour tracer — fallback for the compiled ``_nc_cntr`` C
extension when it isn't available (e.g. the browser/Pyodide wheel, which prunes
``.so`` files).

Implements just the :class:`Cntr` API the contour widget uses:

    c = Cntr(x, y, z, mask)
    lines = c.trace(level)            # iso-lines at one level
    polys = c.trace(level1, level2)   # filled region between two levels

``trace(level)`` does marching squares and returns a list of ``Nx2`` float
arrays (polylines in data coordinates), joined where segments share an
endpoint.

``trace(level1, level2)`` returns the filled region between two levels as a
list of closed ``Nx2`` polygons. The contour widget adds them all to one
``QPainterPath`` (even-odd fill) and fills it, so the polygons only have to
tile the band ``level1 <= z <= level2`` without overlap — they do not need to
be merged into the big slit-connected polygons the C extension builds for
rendering efficiency. We obtain that tiling by splitting every quad cell into
two triangles (over which the interpolated field is planar) and clipping each
triangle to the band in z-space (Sutherland-Hodgman on the two level planes).
This reproduces the same filled area as the C ``_nc_cntr`` tracer, including
saddle cells, using linear edge interpolation (as marching squares does).
"""

import numpy as N

# Edge ids: 0 bottom, 1 right, 2 top, 3 left. For each marching-squares case
# (bit0=BL, bit1=BR, bit2=TR, bit3=TL above the level), the pairs of edges the
# contour connects. Saddles (5, 10) emit two independent segments.
_CASES = {
    0: [], 1: [(3, 0)], 2: [(0, 1)], 3: [(3, 1)],
    4: [(1, 2)], 5: [(3, 0), (1, 2)], 6: [(0, 2)], 7: [(3, 2)],
    8: [(2, 3)], 9: [(2, 0)], 10: [(0, 1), (2, 3)], 11: [(2, 1)],
    12: [(1, 3)], 13: [(1, 0)], 14: [(0, 3)], 15: [],
}


class Cntr:
    def __init__(self, x, y, z, mask=None):
        self.x = N.asarray(x, dtype=float)
        self.y = N.asarray(y, dtype=float)
        self.z = N.asarray(z, dtype=float)
        self.mask = None if mask is None else N.asarray(mask, dtype=bool)

    def trace(self, level, level2=None):
        if level2 is not None:
            return self._fill(float(level), float(level2))
        segs = self._segments(float(level))
        return _join(segs)

    def _fill(self, level1, level2):
        """Return closed polygons tiling the region level1 <= z <= level2.

        Each quad cell is split into two triangles; over a triangle the
        field is planar, so clipping the triangle to z >= lo and z <= hi
        (Sutherland-Hodgman against the two level planes, interpolating
        position on cut edges) yields the exact linear isoband piece for
        that triangle. The pieces tile the band without overlap.
        """
        lo, hi = (level1, level2) if level1 <= level2 else (level2, level1)
        x, y, z, mask = self.x, self.y, self.z, self.mask
        ny, nx = z.shape
        polys = []

        for j in range(ny - 1):
            for i in range(nx - 1):
                if mask is not None and (mask[j, i] or mask[j, i + 1]
                                         or mask[j + 1, i + 1] or mask[j + 1, i]):
                    continue
                # corners: BL, BR, TR, TL as (x, y, z)
                c0 = (x[j, i], y[j, i], z[j, i])
                c1 = (x[j, i + 1], y[j, i + 1], z[j, i + 1])
                c2 = (x[j + 1, i + 1], y[j + 1, i + 1], z[j + 1, i + 1])
                c3 = (x[j + 1, i], y[j + 1, i], z[j + 1, i])
                if not all(N.isfinite(c[2]) for c in (c0, c1, c2, c3)):
                    continue
                # split quad into triangles (BL, BR, TR) and (BL, TR, TL)
                for tri in ((c0, c1, c2), (c0, c2, c3)):
                    band = _clip_band(tri, lo, hi)
                    if len(band) >= 3:
                        polys.append(N.array([(p[0], p[1]) for p in band],
                                             dtype=float))
        return polys

    def _segments(self, level):
        x, y, z, mask = self.x, self.y, self.z, self.mask
        ny, nx = z.shape
        segs = []

        def cross(ay, ax_, by, bx_):
            za = z[ay, ax_]; zb = z[by, bx_]
            d = zb - za
            t = 0.5 if d == 0 else (level - za) / d
            return (x[ay, ax_] + t * (x[by, bx_] - x[ay, ax_]),
                    y[ay, ax_] + t * (y[by, bx_] - y[ay, ax_]))

        for j in range(ny - 1):
            for i in range(nx - 1):
                if mask is not None and (mask[j, i] or mask[j, i + 1]
                                         or mask[j + 1, i + 1] or mask[j + 1, i]):
                    continue
                z0, z1, z2, z3 = z[j, i], z[j, i + 1], z[j + 1, i + 1], z[j + 1, i]
                if not (N.isfinite(z0) and N.isfinite(z1)
                        and N.isfinite(z2) and N.isfinite(z3)):
                    continue
                case = ((z0 > level) | ((z1 > level) << 1)
                        | ((z2 > level) << 2) | ((z3 > level) << 3))
                pairs = _CASES[case]
                if not pairs:
                    continue
                edge = {
                    0: lambda: cross(j, i, j, i + 1),          # bottom
                    1: lambda: cross(j, i + 1, j + 1, i + 1),  # right
                    2: lambda: cross(j + 1, i + 1, j + 1, i),  # top
                    3: lambda: cross(j + 1, i, j, i),          # left
                }
                for a, b in pairs:
                    segs.append((edge[a](), edge[b]()))
        return segs


def _clip_half(poly, keep_ge, thresh):
    """Sutherland-Hodgman clip of a polygon of (x, y, z) vertices to the
    half-space z >= thresh (keep_ge True) or z <= thresh (keep_ge False),
    interpolating x, y, z linearly on cut edges."""
    if not poly:
        return []

    def inside(p):
        return p[2] >= thresh if keep_ge else p[2] <= thresh

    def intersect(a, b):
        da, db = a[2] - thresh, b[2] - thresh
        denom = da - db
        t = 0.5 if denom == 0 else da / denom
        return (a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t,
                thresh)

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


def _clip_band(tri, lo, hi):
    """Clip a triangle (list of (x, y, z)) to the band lo <= z <= hi,
    returning the resulting convex polygon as a list of (x, y, z)."""
    poly = _clip_half(list(tri), True, lo)   # z >= lo
    poly = _clip_half(poly, False, hi)       # z <= hi
    return poly


def _key(pt):
    return (round(pt[0], 6), round(pt[1], 6))


def _join(segs):
    """Chain undirected segments into polylines by matching endpoints."""
    if not segs:
        return []
    from collections import defaultdict
    adj = defaultdict(list)
    for idx, (a, b) in enumerate(segs):
        adj[_key(a)].append(idx)
        adj[_key(b)].append(idx)
    used = [False] * len(segs)
    polylines = []

    def other(idx, k):
        a, b = segs[idx]
        return b if _key(a) == k else a

    for start in range(len(segs)):
        if used[start]:
            continue
        used[start] = True
        a, b = segs[start]
        chain = [a, b]
        # extend forward from b, then backward from a
        for end_pt, append in ((b, True), (a, False)):
            k = _key(end_pt)
            while True:
                nxt = None
                for cand in adj[k]:
                    if not used[cand]:
                        nxt = cand
                        break
                if nxt is None:
                    break
                used[nxt] = True
                npt = other(nxt, k)
                if append:
                    chain.append(npt)
                else:
                    chain.insert(0, npt)
                k = _key(npt)
        polylines.append(N.array(chain, dtype=float))
    return polylines
