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

"""Plotting-side handle to a :class:`~veusz.datasets.dataservice.DataService`,
and Veusz datasets backed by it.

The plotting thread (a separate Pyodide from the notebook kernel) holds a
*provider* — its window onto data resident elsewhere. In-process the provider
wraps a DataService directly (the call is a plain method call); over a Jupyter
comm a future provider serialises the same calls and ships binary results.
Either way the datasets here are **reduction-aware**: a density plot asks the
provider to bin, and only the small grid crosses back — the raw array never
leaves the kernel.

The provider's method surface mirrors DataService's reductions, and the
datasets cache results against the source ``version`` so a re-bin happens only
on a real change (new view, edited data).
"""

import numpy as N

from . import wire
from .commonfn import _
from .oned import Dataset1DBase
from .twod import Dataset2DBase, Dataset2D


class InProcessProvider:
    """A data provider backed by an in-process :class:`DataService`.

    Used for tests and for standalone embeds (no kernel) — the reduction runs
    in the same interpreter, so there's no copy and no serialisation. A
    comm-backed provider implements the same surface over a worker boundary.
    """

    def __init__(self, service):
        self.service = service

    def describe(self, ref):
        return self.service.describe(ref)

    def reduce(self, ref, op):
        return self.service.reduce(ref, op)

    def fetch(self, ref, **kwargs):
        return self.service.fetch(ref, **kwargs)

    def histogram2d(self, **kwargs):
        return self.service.histogram2d(**kwargs)


class RemoteProvider:
    """A data provider that reaches a :class:`DataService` across a boundary.

    ``transport`` is the only thing that differs per boundary: a callable
    ``transport(request_dict) -> response_dict``. The requests/responses are the
    JSON-safe wire forms (:mod:`veusz.datasets.wire`) — base64 float32 for
    grids/arrays, plain JSON for the rest — so only reduced results cross; the
    raw data never leaves the service's process. Transports:

      * in-process (tests / standalone): ``local_transport(service)`` runs
        ``wire.dispatch`` directly;
      * server: a synchronous RPC to a remote ``veuszd`` holding the data;
      * notebook kernel: the response is delivered asynchronously and read from
        a cache primed by the runtime (a thin async wrapper over this).

    The provider surface matches :class:`InProcessProvider`, so the datasets
    above don't care which side of a boundary the data lives on.
    """

    def __init__(self, transport):
        self._transport = transport

    def _rpc(self, _method, /, **params):
        # _method positional-only: histogram2d's params include one named
        # 'method' (the binning mode), so it must not collide with the RPC name.
        return wire.decode_response(
            _method, self._transport(wire.encode_request(_method, **params)))

    def describe(self, ref):
        return self._rpc('describe', ref=ref)

    def reduce(self, ref, op):
        return self._rpc('reduce', ref=ref, op=op)

    def fetch(self, ref, **kwargs):
        return self._rpc('fetch', ref=ref, **kwargs)

    def histogram2d(self, **kwargs):
        return self._rpc('histogram2d', **kwargs)


def local_transport(service):
    """A synchronous in-process transport over a DataService — for tests, the
    standalone embed, and as the reference the comm/server transports mirror."""
    return lambda request: wire.dispatch(service, request)


class Dataset1DKernel(Dataset1DBase):
    """A 1D dataset fetched from a provider over data resident elsewhere.

    The everyday "plot a kernel column" path: the values are pulled via
    ``provider.fetch`` — optionally filtered to a value range and decimated to a
    display-resolution point budget, so a huge column never crosses whole.
    Cached against the fetch parameters; call :meth:`setView` when the axis
    range/resolution changes and :meth:`invalidate` when the source changes.
    """

    dstype = _('Kernel data')
    editable = False
    serr = perr = nerr = None

    def __init__(self, provider, ref, lo=None, hi=None,
                 max_points=None, decimate='stride'):
        Dataset1DBase.__init__(self)
        self.provider = provider
        self.ref = ref
        self.lo = lo
        self.hi = hi
        self.max_points = max_points
        self.decimate = decimate
        self.linked = None
        self._cache = None
        self._key = None

    def setView(self, lo=None, hi=None, max_points=None):
        """Update the value-range / point budget (e.g. on zoom) and drop the
        cache so the next access re-fetches a decimation for the new view."""
        self.lo, self.hi, self.max_points = lo, hi, max_points
        self._cache = None

    def invalidate(self):
        self._cache = None

    def _get(self):
        key = (self.ref, self.lo, self.hi, self.max_points, self.decimate)
        if self._cache is None or key != self._key:
            arr, _version = self.provider.fetch(
                self.ref, lo=self.lo, hi=self.hi,
                max_points=self.max_points, decimate=self.decimate)
            self._cache = N.asarray(arr, dtype=N.float64)
            self._key = key
        return self._cache

    data = property(lambda self: self._get())

    def canUnlink(self):
        return False

    def linkedInformation(self):
        return _("Kernel data '%s'") % self.ref

    def saveDataDumpToText(self, fileobj, name):
        pass

    def saveDataDumpToHDF5(self, group, name):
        pass


class Dataset2DKernelHisto(Dataset2DBase):
    """A 2D-histogram dataset whose grid is computed by a provider over data
    resident elsewhere (the notebook kernel).

    The binning is pushed to the provider; only the grid crosses back. Results
    are cached against the bin parameters + reduction method, so re-binning
    happens only when the view changes (call :meth:`setBins`) or the data
    changes (call :meth:`invalidate`, e.g. from a kernel data-changed signal).
    The grid is wrapped in a plain :class:`Dataset2D` so it inherits the
    regular-grid collapse and renders through the image widget on every backend
    — identical to a local density plot, just fed from elsewhere.
    """

    dstype = _('2D histogram (kernel)')
    editable = False

    def __init__(self, provider, xref, yref, weightref=None,
                 binparamsx=None, binparamsy=None,
                 binmanualx=None, binmanualy=None, method='counts'):
        Dataset2DBase.__init__(self)
        self.provider = provider
        self.xref = xref
        self.yref = yref
        self.weightref = weightref
        self.binparamsx = binparamsx
        self.binparamsy = binparamsy
        self.binmanualx = binmanualx
        self.binmanualy = binmanualy
        self.method = method
        self.linked = None
        self._frozen = None
        self._key = None

    def setBins(self, binparamsx=None, binparamsy=None,
                binmanualx=None, binmanualy=None):
        """Update the bin parameters (e.g. on zoom) and drop the cache so the
        next access re-bins at the provider for the new view."""
        self.binparamsx = binparamsx
        self.binparamsy = binparamsy
        self.binmanualx = binmanualx
        self.binmanualy = binmanualy
        self._frozen = None

    def invalidate(self):
        """Drop the cached grid — call when the source data changed."""
        self._frozen = None

    def _binkey(self):
        tup = lambda v: tuple(v) if v is not None else None
        return (self.xref, self.yref, self.weightref, self.method,
                tup(self.binparamsx), tup(self.binparamsy),
                tup(self.binmanualx), tup(self.binmanualy))

    def _get(self):
        key = self._binkey()
        if self._frozen is None or key != self._key:
            grid, xe, ye, _version = self.provider.histogram2d(
                xref=self.xref, yref=self.yref, weightref=self.weightref,
                binparamsx=self.binparamsx, binmanualx=self.binmanualx,
                binparamsy=self.binparamsy, binmanualy=self.binmanualy,
                method=self.method)
            self._frozen = Dataset2D(N.array(grid), xedge=xe, yedge=ye)
            self._key = key
        return self._frozen

    # proxy the coordinate attributes off the frozen Dataset2D
    data = property(lambda self: self._get().data)
    xrange = property(lambda self: self._get().xrange)
    yrange = property(lambda self: self._get().yrange)
    xedge = property(lambda self: self._get().xedge)
    yedge = property(lambda self: self._get().yedge)
    xcent = property(lambda self: self._get().xcent)
    ycent = property(lambda self: self._get().ycent)

    def canUnlink(self):
        return False

    def linkedInformation(self):
        wt = (_(' weighted by %s') % self.weightref) if self.weightref else ''
        return _("2D histogram of kernel data %s vs %s (%s%s)") % (
            self.xref, self.yref, self.method, wt)

    def saveDataDumpToText(self, fileobj, name):
        pass

    def saveDataDumpToHDF5(self, group, name):
        pass

    def returnCopy(self):
        return self._get().returnCopy()
