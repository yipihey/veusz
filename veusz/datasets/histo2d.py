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

"""2D histogram / density datasets — the engine behind phase diagrams.

This mirrors the 1D :class:`veusz.datasets.histo.DatasetHistoGenerator`, but
bins a *pair* of expressions (x, y) — optionally weighted — into a 2D grid via
:func:`numpy.histogram2d`. The result is a regular :class:`Dataset2DBase`, so
the existing ``image`` widget renders it (colormap, log scaling, colorbar) and
every paint backend draws it as a single image op. That keeps dense scatter —
e.g. a phase diagram of a 256^3 simulation, ~1.7e7 points — fast to render and
tiny to export, regardless of the input size, because only the binned grid
(a few hundred cells per side) ever reaches the renderer.

Binning logic and the per-axis log/linear edge handling are factored to match
the 1D widget exactly so the two stay consistent.

Cross-backend note: with *linear* bins the generated dataset has uniform edges,
which Dataset2D collapses to a plain (xrange, yrange) so the image widget uses
its fast linear path — rendered identically on every backend (Qt, tiny-skia,
Vello native, Vello/WebGPU in the browser) as a single image op. *Log-spaced*
bin edges (``islog`` in binparams) are non-uniform and need the image widget's
non-linear path, which the browser's pure-Python qtloops fallback does not yet
implement; for the browser, bin in log space by logging the data first (the
usual phase-diagram workflow) so the bins stay linear.
"""

import numpy as N

from .. import utils
from .commonfn import _
from .twod import Dataset2DBase, Dataset2D
from .expression import evalDatasetExpression

# Reduction methods. 'counts' needs no weight; 'sum'/'mean' require one;
# 'density' is counts normalised so the integral over the plane is 1.
HISTO2D_METHODS = ('counts', 'sum', 'mean', 'density')


def binEdges(binmanual, binparams, data):
    """Compute N+1 bin edges for one axis.

    binmanual: None or an explicit list of edges.
    binparams: (numbins, minval, maxval, islog); min/max may be 'Auto'.
    data: the values for this axis (used only to resolve 'Auto' bounds).

    Mirrors DatasetHistoGenerator.binLocations so 1D and 2D agree.
    """
    if binmanual is not None:
        return N.array(binmanual, dtype=N.float64)

    numbins, minval, maxval, islog = binparams

    if minval == 'Auto' or maxval == 'Auto':
        if data is None or len(data) == 0:
            return N.array([])
        if minval == 'Auto':
            minval = N.min(data)
        if maxval == 'Auto':
            maxval = N.max(data)

    if not islog:
        if maxval == minval:
            # degenerate range: widen slightly so histogram2d has real edges
            maxval = minval + 1.
        delta = (maxval - minval) / numbins
        return N.arange(numbins + 1) * delta + minval
    else:
        if minval <= 0:
            minval = 1e-99
        if maxval <= 0:
            maxval = 1e99
        lmin, lmax = N.log(minval), N.log(maxval)
        if lmax == lmin:
            lmax = lmin + 1.
        delta = (lmax - lmin) / numbins
        return N.exp(N.arange(numbins + 1) * delta + lmin)


class DatasetHisto2DGenerator:
    """Computes (and caches) a 2D histogram of two expressions."""

    def __init__(self, document, exprx, expry, exprweight=None,
                 binparamsx=None, binparamsy=None,
                 binmanualx=None, binmanualy=None,
                 method='counts'):
        """
        exprx, expry = dataset expressions for the two axes
        exprweight = None or a dataset expression giving per-point weights
                     (used by the 'sum' and 'mean' methods)
        binparamsx/y = None or (numbins, minval, maxval, islog) per axis
        binmanualx/y = None or an explicit list of bin edges per axis
        method = one of HISTO2D_METHODS
        """
        self.changeset = -1

        self.document = document
        self.exprx = exprx
        self.expry = expry
        self.exprweight = exprweight
        self.binparamsx = (10, 'Auto', 'Auto', False) if binparamsx is None else binparamsx
        self.binparamsy = (10, 'Auto', 'Auto', False) if binparamsy is None else binparamsy
        self.binmanualx = binmanualx
        self.binmanualy = binmanualy
        self.method = method
        self.dataset = None

        self._cacheddata = None

    def _evalFinite(self, expr):
        """Evaluate an expression to a 1D array, or None on failure/empty."""
        if not expr:
            return None
        d = evalDatasetExpression(self.document, expr)
        if d is None:
            return None
        d = N.asarray(d.data, dtype=N.float64)
        return d

    def getData(self):
        """Return (x, y, weight) arrays sharing a joint-finite mask.

        weight is None when no weight expression is set. Cached against the
        document changeset so repeated renders don't re-evaluate.
        """
        if self.document.changeset != self.changeset:
            x = self._evalFinite(self.exprx)
            y = self._evalFinite(self.expry)
            w = self._evalFinite(self.exprweight)

            result = None
            if x is not None and y is not None:
                n = min(len(x), len(y))
                if w is not None:
                    n = min(n, len(w))
                if n > 0:
                    x, y = x[:n], y[:n]
                    finite = N.isfinite(x) & N.isfinite(y)
                    if w is not None:
                        w = w[:n]
                        finite &= N.isfinite(w)
                        w = w[finite]
                    x, y = x[finite], y[finite]
                    if len(x) > 0:
                        result = (x, y, w)

            self._cacheddata = result
            self.changeset = self.document.changeset
        return self._cacheddata

    def getEdges(self):
        """Return (xedges, yedges) for the current data."""
        data = self.getData()
        xd = None if data is None else data[0]
        yd = None if data is None else data[1]
        xe = binEdges(self.binmanualx, self.binparamsx, xd)
        ye = binEdges(self.binmanualy, self.binparamsy, yd)
        return xe, ye

    def getGrid(self):
        """Return (grid, xedges, yedges).

        grid has shape (ny, nx) — row index is y, column index is x — to match
        what Dataset2D / the image widget expect. Empty bins are NaN so the
        image widget renders them transparent rather than as colormap-zero.
        """
        data = self.getData()
        xe, ye = self.getEdges()
        if data is None or len(xe) < 2 or len(ye) < 2:
            return N.zeros((0, 0)), xe, ye

        x, y, w = data

        # histogram2d returns H with shape (nx, ny); transpose to (ny, nx).
        counts, _xe, _ye = N.histogram2d(x, y, bins=[xe, ye])
        counts = counts.astype(N.float64)

        if self.method == 'counts':
            grid = counts
        elif self.method == 'density':
            grid, _xe, _ye = N.histogram2d(x, y, bins=[xe, ye], density=True)
        elif self.method in ('sum', 'mean'):
            if w is None:
                # no weight given: sum/mean of "nothing" — fall back to counts
                grid = counts
            else:
                wsum, _xe, _ye = N.histogram2d(x, y, bins=[xe, ye], weights=w)
                if self.method == 'sum':
                    grid = wsum
                else:
                    # mean = sum(weight) / count, NaN where empty
                    with N.errstate(invalid='ignore', divide='ignore'):
                        grid = N.where(counts > 0, wsum / counts, N.nan)
        else:
            grid = counts

        # blank empty bins for count/sum/density so they don't read as a real 0
        if self.method in ('counts', 'sum', 'density'):
            grid = N.where(counts > 0, grid, N.nan)

        return grid.T, xe, ye

    def generateDataset(self):
        self.dataset = Dataset2DHisto(self, self.document)
        return self.dataset

    def saveToFile(self, fileobj):
        """Emit the command that recreates this dataset."""
        dsname = ''
        for name, ds in self.document.data.items():
            if ds is self.dataset:
                dsname = name
                break

        fileobj.write(
            "CreateHistogram2D(%s, %s, %s, weightexpr=%s, "
            "binparamsx=%s, binparamsy=%s, "
            "binmanualx=%s, binmanualy=%s, method=%s)\n" % (
                utils.rrepr(self.exprx),
                utils.rrepr(self.expry),
                utils.rrepr(dsname),
                utils.rrepr(self.exprweight),
                utils.rrepr(self.binparamsx),
                utils.rrepr(self.binparamsy),
                utils.rrepr(self.binmanualx),
                utils.rrepr(self.binmanualy),
                utils.rrepr(self.method)))

    def linkedInformation(self):
        """Description of the link for the data browser."""
        wtext = (_(", weighted by '%s'") % self.exprweight) if self.exprweight else ''
        return _("2D histogram of '%s' vs '%s' (%s)%s") % (
            self.exprx, self.expry, self.method, wtext)


class Dataset2DHisto(Dataset2DBase):
    """A 2D dataset whose grid + edges come from a DatasetHisto2DGenerator.

    Internally it builds a plain :class:`Dataset2D` from the generated grid and
    bin edges, and proxies that object's coordinate attributes. Going through
    Dataset2D matters: its constructor collapses *uniform* bin edges to a plain
    (xrange, yrange), which lets the image widget take its fast **linear** image
    path — the one supported on every backend, including the browser. Only
    genuinely non-uniform edges (log binning) keep explicit edges and use the
    rectangle path.
    """

    dstype = _('2D histogram')
    # not directly editable: the values derive from the source expressions
    editable = False

    def __init__(self, generator, document):
        Dataset2DBase.__init__(self)
        self.generator = generator
        self.document = document
        self.linked = None
        self.changeset = -1
        self._frozen = None

    def _get(self):
        """Return the cached internal Dataset2D, rebuilding when data change."""
        if self._frozen is None or self.changeset != self.generator.document.changeset:
            grid, xe, ye = self.generator.getGrid()
            self._frozen = Dataset2D(N.array(grid), xedge=xe, yedge=ye)
            self.changeset = self.generator.document.changeset
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
        """The relationship can be broken (frozen to a plain Dataset2D)."""
        return True

    def linkedInformation(self):
        return self.generator.linkedInformation()

    def saveDataRelationToText(self, fileobj, name):
        self.generator.saveToFile(fileobj)

    # The values are reconstructed from the generator on load, so there's no
    # raw data to dump (matches the 1D histogram dataset behaviour).
    def saveDataDumpToText(self, fileobj, name):
        pass

    def saveDataDumpToHDF5(self, group, name):
        pass

    def returnCopy(self):
        """Freeze the current grid into a standalone Dataset2D."""
        return self._get().returnCopy()
