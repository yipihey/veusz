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

"""A density (2D histogram) plotter — a phase-diagram widget.

This plots a *pair* of 1D datasets (x, y), optionally weighted, by binning them
into a 2D grid and drawing that grid as a colour-mapped image. It's a
first-class plotter alongside ``xy`` and ``contour``: you point it at x and y
datasets and it renders, no separate dataset step.

Implementation reuses the ``image`` widget wholesale — colormap, colour
scaling, the colorbar binding, and every backend's raster path — by subclassing
it and overriding only the data source: instead of reading a 2D dataset, it
bins its x/y/weight expressions through
:class:`veusz.datasets.DatasetHisto2DGenerator`. So a million-point scatter
becomes one image op that's tiny to export and fast to draw everywhere
(desktop, browser/WebGPU, PDF), and the colorbar 'just works'.
"""

from .. import qtall as qt
from .. import setting
from .. import document
from .. import datasets
from . import plotters
from .image import Image

def _(text, disambiguation=None, context='Density'):
    """Translate text."""
    return qt.QCoreApplication.translate(context, text, disambiguation)


class Density(Image):
    """Plot a density / 2D histogram of two datasets."""

    typename = 'density'
    allowusercreation = True
    description = _('Plot a density map (2D histogram) of x, y data')

    def __init__(self, *args, **argsv):
        Image.__init__(self, *args, **argsv)
        # cache of the binning generator + its frozen dataset, rebuilt only
        # when a binning-relevant setting changes (not on formatting tweaks).
        self._genkey = None
        self._gen = None
        self._gends = None

    @classmethod
    def addSettings(klass, s):
        """Construct list of settings."""
        # deliberately GenericPlotter, not Image: we replace Image's 2D `data`
        # / `transparencyData` settings with x/y/weight + binning controls,
        # then reuse Image's colour controls.
        plotters.GenericPlotter.addSettings(s)

        s.add( setting.DatasetExtended(
            'xData', 'x',
            descr=_('X dataset to bin'),
            usertext=_('X data')), 0 )
        s.add( setting.DatasetExtended(
            'yData', 'y',
            descr=_('Y dataset to bin'),
            usertext=_('Y data')), 1 )
        s.add( setting.DatasetExtended(
            'weightData', '',
            descr=_('Optional weight dataset (for sum / mean)'),
            usertext=_('Weight')), 2 )
        s.add( setting.Choice(
            'mode',
            ('counts', 'sum', 'mean', 'density'),
            'counts',
            descr=_('Value shown per bin'),
            usertext=_('Bin value')), 3 )

        # per-axis binning controls
        s.add( setting.Int(
            'numBinsX', 100, minval=1, maxval=100000,
            descr=_('Number of bins in X'),
            usertext=_('Num. bins X')), 4 )
        s.add( setting.FloatOrAuto(
            'minX', 'Auto',
            descr=_('Minimum X (Auto = data minimum)'),
            usertext=_('Min. X')), 5 )
        s.add( setting.FloatOrAuto(
            'maxX', 'Auto',
            descr=_('Maximum X (Auto = data maximum)'),
            usertext=_('Max. X')), 6 )
        s.add( setting.Bool(
            'logX', False,
            descr=_('Log-spaced X bins (renders on desktop; for the browser '
                    'bin in log space by taking log of the data)'),
            usertext=_('Log X bins')), 7 )

        s.add( setting.Int(
            'numBinsY', 100, minval=1, maxval=100000,
            descr=_('Number of bins in Y'),
            usertext=_('Num. bins Y')), 8 )
        s.add( setting.FloatOrAuto(
            'minY', 'Auto',
            descr=_('Minimum Y (Auto = data minimum)'),
            usertext=_('Min. Y')), 9 )
        s.add( setting.FloatOrAuto(
            'maxY', 'Auto',
            descr=_('Maximum Y (Auto = data maximum)'),
            usertext=_('Max. Y')), 10 )
        s.add( setting.Bool(
            'logY', False,
            descr=_('Log-spaced Y bins (renders on desktop; for the browser '
                    'bin in log space by taking log of the data)'),
            usertext=_('Log Y bins')), 11 )

        # colour scale (mirrors the image widget's value-range controls)
        s.add( setting.FloatOrAuto(
            'min', 'Auto',
            descr=_('Minimum value of color scale'),
            usertext=_('Min. value')), 12 )
        s.add( setting.FloatOrAuto(
            'max', 'Auto',
            descr=_('Maximum value of color scale'),
            usertext=_('Max. value')), 13 )
        s.add( setting.Choice(
            'colorScaling',
            ['linear', 'sqrt', 'log', 'squared'],
            'linear',
            descr=_('Scaling to transform numbers to color'),
            usertext=_('Scaling')), 14 )
        s.add( setting.Choice(
            'mapping',
            ('pixels', 'bounds'),
            'pixels',
            descr=_('Map image using pixels or bound coordinates'),
            usertext=_('Mapping')), 15 )

        # shared colormap + draw-mode controls (colorMap, invert, etc.)
        klass.addColormapSettings(s)

    @property
    def userdescription(self):
        s = self.settings
        wt = (_(' weighted by %s') % s.weightData) if s.weightData else ''
        return _("%s vs %s (%s%s)") % (s.yData, s.xData, s.mode, wt)

    def _binparams(self, axis):
        s = self.settings
        if axis == 'x':
            return (s.numBinsX, s.minX, s.maxX, s.logX)
        return (s.numBinsY, s.minY, s.maxY, s.logY)

    def getImageData(self):
        """Bin x/y(/weight) into a 2D dataset, caching the generator so a
        formatting change doesn't trigger a rebin (only binning settings do).
        Data changes still refresh, because the generated dataset caches its
        grid against the document changeset."""
        s = self.settings
        if not s.xData or not s.yData:
            return None

        bpx, bpy = self._binparams('x'), self._binparams('y')
        key = (s.xData, s.yData, s.weightData, s.mode, bpx, bpy)
        if key != self._genkey or self._gen is None:
            self._gen = datasets.DatasetHisto2DGenerator(
                self.document, s.xData, s.yData,
                exprweight=(s.weightData or None),
                binparamsx=bpx, binparamsy=bpy, method=s.mode)
            self._gends = self._gen.generateDataset()
            self._genkey = key

        if self._gen.getData() is None:
            return None
        return self._gends

    def getTransparencyData(self):
        # density has no separate transparency dataset
        return None


# allow the factory to instantiate a density plot
document.thefactory.register(Density)
