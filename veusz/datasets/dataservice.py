#    Copyright (C) 2026 Veusz contributors
#
#    This file is part of Veusz.
#
#    Veusz is free software: you can redistribute it and/or modify it
#    under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 2 of the License, or
#    (at your option) any later version.
#
#    Veusz is distributed in the hope that it will be useful, but
#    WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
#    General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with Veusz. If not, see <https://www.gnu.org/licenses/>.
#
##############################################################################

"""Data-reduction service for separate-thread / out-of-process plotting.

When Veusz plots data that lives in another runtime — the notebook kernel's
Pyodide, a server, a huge file — we deliberately do NOT copy the raw array to
the plotting thread (no SharedArrayBuffer, no gigabyte transport). Instead the
plotter's *question* runs HERE, next to the resident data, and only the small
answer crosses the boundary:

  * bin two columns into a grid          -> a few-hundred-cell image
  * decimate a column to display res     -> O(pixels) points
  * reduce a column to a statistic       -> one number

This is the no-SAB design: move the reduction to the data, ship back the
result. :class:`DataService` is the half that runs *where the data lives* — in
a notebook that's the kernel; standalone it's in-process. Its method surface is
also the wire contract a Jupyter-comm transport marshals later, but the methods
themselves are plain NumPy and fully testable headless. The binning reuses the
exact same core as the local density dataset (:mod:`veusz.datasets.histo2d`),
so a phase diagram bins identically whether the data lives here or is reduced
where it lives.
"""

import numpy as N

from .histo2d import binEdges, jointFiniteMask, histogram2dGrid, HISTO2D_METHODS

_AUTO_BINS = (10, 'Auto', 'Auto', False)


class DataServiceError(Exception):
    """Raised for an unknown data ref or an invalid reduction request."""


class DataService:
    """Holds named arrays and answers reduction requests over them.

    Refs are opaque strings (a kernel variable name, a column id). Each ref
    carries a monotonic ``version`` bumped on (re)registration, so a plotting
    client can cache reduced results and detect when the source changed.
    """

    def __init__(self):
        self._arrays = {}    # ref -> 1D float64 ndarray
        self._versions = {}  # ref -> int

    # -- registration --------------------------------------------------------

    def register(self, ref, array):
        """Register (or replace) the array behind ``ref``; returns its new
        version. Stored as a 1D float64 view — plotting works in float64 and
        this keeps the reductions dtype-stable."""
        self._arrays[ref] = N.asarray(array, dtype=N.float64).ravel()
        self._versions[ref] = self._versions.get(ref, 0) + 1
        return self._versions[ref]

    def unregister(self, ref):
        self._arrays.pop(ref, None)
        self._versions.pop(ref, None)

    def has(self, ref):
        return ref in self._arrays

    def version(self, ref):
        return self._versions.get(ref, 0)

    def _get(self, ref):
        try:
            return self._arrays[ref]
        except KeyError:
            raise DataServiceError("unknown data ref: %r" % (ref,))

    # -- reductions ----------------------------------------------------------

    def describe(self, ref):
        """Tiny metadata for ``ref`` — shape, finite count, range, version.
        Cheap enough to call before deciding how to reduce."""
        a = self._get(ref)
        finite = a[N.isfinite(a)]
        return {
            'ref': ref,
            'size': int(a.size),
            'finite': int(finite.size),
            'min': float(finite.min()) if finite.size else None,
            'max': float(finite.max()) if finite.size else None,
            'version': self.version(ref),
        }

    def reduce(self, ref, op):
        """A single statistic over the finite values of ``ref``.
        op in {count, finite, min, max, mean, sum, std}."""
        a = self._get(ref)
        f = a[N.isfinite(a)]
        if op == 'count':
            return int(a.size)
        if op == 'finite':
            return int(f.size)
        if op not in ('min', 'max', 'mean', 'sum', 'std'):
            raise DataServiceError("unknown reduce op: %r" % (op,))
        return float(getattr(f, op)()) if f.size else None

    def fetch(self, ref, lo=None, hi=None, max_points=None, decimate='stride'):
        """Return values of ``ref`` (optionally value-range filtered, optionally
        decimated to ~``max_points`` for display) plus the source version.

        decimate: 'stride' (every k-th), 'sample' (evenly spaced indices), or
        'minmax' (per-bucket min+max — preserves a 1D envelope for line plots).
        Use this for normal-size or single-column data; for dense 2D data use
        :meth:`histogram2d` instead (exact, and far smaller).
        """
        a = self._get(ref)
        if lo is not None or hi is not None:
            mask = N.isfinite(a)
            if lo is not None:
                mask &= (a >= lo)
            if hi is not None:
                mask &= (a <= hi)
            a = a[mask]
        if max_points is not None and a.size > max_points > 0:
            if decimate == 'stride':
                step = int(N.ceil(a.size / max_points))
                a = a[::step]
            elif decimate == 'sample':
                a = a[N.linspace(0, a.size - 1, max_points).astype(int)]
            elif decimate == 'minmax':
                nb = max(1, max_points // 2)
                a = N.concatenate([
                    (b.min(), b.max()) for b in N.array_split(a, nb) if b.size])
            else:
                raise DataServiceError("unknown decimate mode: %r" % (decimate,))
        return N.ascontiguousarray(a, dtype=N.float64), self.version(ref)

    def histogram2d(self, xref, yref, weightref=None,
                    binparamsx=None, binmanualx=None,
                    binparamsy=None, binmanualy=None, method='counts'):
        """Bin ``xref`` vs ``yref`` (optionally weighted by ``weightref``) into
        a 2D grid — the enormous-data path. Returns ``(grid, xedges, yedges,
        version)``; the grid is ``(ny, nx)`` with empty bins NaN, exactly as the
        local density dataset produces. Only the grid crosses the boundary, so a
        100M-point phase diagram ships as a few hundred KB.
        """
        if method not in HISTO2D_METHODS:
            raise DataServiceError("unknown method: %r" % (method,))
        x = self._get(xref)
        y = self._get(yref)
        w = self._get(weightref) if weightref else None

        masked = jointFiniteMask(x, y, w)
        xd = None if masked is None else masked[0]
        yd = None if masked is None else masked[1]
        xe = binEdges(binmanualx, binparamsx or _AUTO_BINS, xd)
        ye = binEdges(binmanualy, binparamsy or _AUTO_BINS, yd)

        if masked is None:
            grid = N.zeros((0, 0))
        else:
            grid, xe, ye = histogram2dGrid(masked[0], masked[1], masked[2],
                                           xe, ye, method)
        version = max(self.version(xref), self.version(yref),
                      self.version(weightref) if weightref else 0)
        return grid, xe, ye, version
