"""Pure-Python contour tracer — fallback for the compiled ``_nc_cntr`` C
extension when it isn't available (e.g. the browser/Pyodide wheel, which prunes
``.so`` files).

Implements just the :class:`Cntr` API the contour widget uses:

    c = Cntr(x, y, z, mask)
    lines = c.trace(level)            # iso-lines at one level
    polys = c.trace(level1, level2)   # filled region between two levels

``trace(level)`` does marching squares and returns a list of ``Nx2`` float
arrays (polylines in data coordinates), joined where segments share an
endpoint. Filled regions (``trace(level1, level2)``) are not implemented here
and return ``[]`` — contour *lines* render in the browser, fills are skipped
(the C extension is still used on the desktop).
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
            return []  # filled regions not supported in the pure-Python fallback
        segs = self._segments(float(level))
        return _join(segs)

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
