"""Tests for the kernel-side data-reduction service and the provider-backed
datasets — the no-SAB design for separate-thread plotting.

The point is reduction pushdown: binning/decimation/stats run where the data
lives (the DataService), and only the small result crosses to the plotting
side (the provider + Dataset2DKernelHisto). These tests check the reductions
match numpy, that the kernel-backed histogram matches the *local* density path
exactly, version/caching behaviour, and that the result renders through the
image widget like any 2D dataset.
"""

from __future__ import annotations

import io
import json
import os
import sys

import numpy as N
import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets, dataimport  # noqa: F401
    yield app


def _service(x, y, w=None):
    from veusz.datasets.dataservice import DataService
    s = DataService()
    s.register('x', x)
    s.register('y', y)
    if w is not None:
        s.register('w', w)
    return s


BPX = (20, -4.0, 4.0, False)
BPY = (20, -4.0, 4.0, False)
XE = N.linspace(-4, 4, 21)


def test_describe_and_reduce():
    rng = N.random.default_rng(0)
    x = rng.normal(size=1000)
    x[10] = N.nan
    s = _service(x, x)
    d = s.describe('x')
    assert d['size'] == 1000 and d['finite'] == 999
    assert d['version'] == 1
    fin = x[N.isfinite(x)]
    assert s.reduce('x', 'finite') == 999
    assert s.reduce('x', 'count') == 1000
    assert abs(s.reduce('x', 'mean') - fin.mean()) < 1e-9
    assert abs(s.reduce('x', 'max') - fin.max()) < 1e-9


def test_register_bumps_version():
    s = _service(N.zeros(5), N.zeros(5))
    assert s.version('x') == 1
    s.register('x', N.ones(5))
    assert s.version('x') == 2


def test_histogram2d_matches_numpy():
    rng = N.random.default_rng(1)
    x, y = rng.normal(size=40000), rng.normal(size=40000)
    s = _service(x, y)
    grid, xe, ye, ver = s.histogram2d(
        xref='x', yref='y', binparamsx=BPX, binparamsy=BPY, method='counts')
    H, _xe, _ye = N.histogram2d(x, y, bins=[XE, XE])
    ref = N.where(H > 0, H, N.nan).T
    assert N.allclose(N.nan_to_num(grid), N.nan_to_num(ref))
    assert ver == 1


def test_histogram2d_weighted_mean():
    rng = N.random.default_rng(2)
    x, y = rng.normal(size=30000), rng.normal(size=30000)
    w = N.abs(rng.normal(1, 0.2, size=30000))
    s = _service(x, y, w)
    grid, *_ = s.histogram2d(xref='x', yref='y', weightref='w',
                             binparamsx=BPX, binparamsy=BPY, method='mean')
    H, _, _ = N.histogram2d(x, y, bins=[XE, XE])
    Hs, _, _ = N.histogram2d(x, y, bins=[XE, XE], weights=w)
    with N.errstate(invalid='ignore', divide='ignore'):
        ref = N.where(H > 0, Hs / H, N.nan).T
    assert N.allclose(N.nan_to_num(grid), N.nan_to_num(ref))


def test_kernel_histo_matches_local_density_exactly():
    # The whole promise: binning "where the data lives" gives the identical grid
    # to the local density dataset.
    from veusz import document
    from veusz.document.commandinterface import CommandInterface
    from veusz.datasets.kernel import Dataset2DKernelHisto, InProcessProvider

    rng = N.random.default_rng(3)
    x, y = rng.normal(size=50000), rng.normal(size=50000)

    # local path
    ci = CommandInterface(document.Document())
    ci.SetData('x', x)
    ci.SetData('y', y)
    ci.CreateHistogram2D('x', 'y', 'local', binparamsx=BPX, binparamsy=BPY,
                         method='counts')
    local = ci.document.data['local'].data

    # kernel path
    prov = InProcessProvider(_service(x, y))
    kds = Dataset2DKernelHisto(prov, 'x', 'y', binparamsx=BPX, binparamsy=BPY,
                               method='counts')
    assert N.allclose(N.nan_to_num(kds.data), N.nan_to_num(local))
    # and it collapsed uniform edges to a linear image, like the local one
    assert kds.isLinearImage() == ci.document.data['local'].isLinearImage()


def test_kernel_histo_caches_and_rebins():
    from veusz.datasets.kernel import Dataset2DKernelHisto, InProcessProvider
    rng = N.random.default_rng(4)
    s = _service(rng.normal(size=10000), rng.normal(size=10000))
    calls = {'n': 0}
    orig = s.histogram2d

    def counting(**kw):
        calls['n'] += 1
        return orig(**kw)
    s.histogram2d = counting
    prov = InProcessProvider(s)

    kds = Dataset2DKernelHisto(prov, 'x', 'y', binparamsx=BPX, binparamsy=BPY)
    _ = kds.data
    _ = kds.data  # cached -> no second reduction
    assert calls['n'] == 1
    # zoom: new bins -> one more reduction
    kds.setBins(binparamsx=(40, -2, 2, False), binparamsy=(40, -2, 2, False))
    _ = kds.data
    assert calls['n'] == 2
    assert kds.data.shape == (40, 40)


def test_fetch_decimation_caps_points():
    s = _service(N.arange(1_000_000.0), N.arange(1_000_000.0))
    out, ver = s.fetch('x', max_points=1000, decimate='stride')
    assert out.size <= 1000 and ver == 1
    # value-range filter
    out2, _ = s.fetch('x', lo=10.0, hi=19.0)
    assert out2.min() >= 10 and out2.max() <= 19 and out2.size == 10


def test_kernel_1d_fetch_decimate_and_cache():
    from veusz.datasets.kernel import Dataset1DKernel, InProcessProvider
    s = _service(N.arange(1_000_000.0), N.arange(1_000_000.0))
    prov = InProcessProvider(s)

    d = Dataset1DKernel(prov, 'x', max_points=2000, decimate='stride')
    assert d.dimensions == 1 and d.serr is None
    assert len(d.data) <= 2000

    calls = {'n': 0}
    orig = s.fetch

    def counting(*a, **k):
        calls['n'] += 1
        return orig(*a, **k)
    s.fetch = counting
    d2 = Dataset1DKernel(prov, 'x', max_points=500)
    _ = d2.data
    _ = d2.data
    assert calls['n'] == 1            # cached
    d2.setView(lo=0.0, hi=100.0, max_points=500)
    _ = d2.data
    assert calls['n'] == 2 and d2.data.max() <= 100


def test_kernel_1d_renders_in_xy_plot():
    from veusz import document
    from veusz.document.commandinterface import CommandInterface
    from veusz.datasets.kernel import Dataset1DKernel, InProcessProvider
    from veusz.paint.qt_capture import capture_document_scene

    s = _service(N.linspace(0, 10, 5000), N.sin(N.linspace(0, 10, 5000)))
    prov = InProcessProvider(s)
    ci = CommandInterface(document.Document())
    ci.document.setData('kx', Dataset1DKernel(prov, 'x'))
    ci.document.setData('ky', Dataset1DKernel(prov, 'y'))
    ci.To(ci.Add('page'))
    ci.To(ci.Add('graph'))
    ci.To(ci.Add('xy'))
    ci.Set('xData', 'kx')
    ci.Set('yData', 'ky')
    ci.To('..')
    scene = capture_document_scene(ci.document, page=0, pagesize_px=(500, 400),
                                   dpi=(96.0, 96.0))
    raw = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    ops = json.loads(raw)['ops']

    def opname(o):
        return o if isinstance(o, str) else next(iter(o.keys()), '')
    assert any(k in opname(o) for o in ops
               for k in ('DrawMarkers', 'StrokePath', 'DrawPath'))


def test_kernel_histo_renders_single_image_op():
    from veusz import document
    from veusz.document.commandinterface import CommandInterface
    from veusz.datasets.kernel import Dataset2DKernelHisto, InProcessProvider
    from veusz.paint.qt_capture import capture_document_scene

    rng = N.random.default_rng(5)
    x, y = rng.normal(size=200000), rng.normal(size=200000)
    prov = InProcessProvider(_service(x, y))

    ci = CommandInterface(document.Document())
    ci.document.setData('phase', Dataset2DKernelHisto(
        prov, 'x', 'y', binparamsx=(60, -4, 4, False),
        binparamsy=(60, -4, 4, False), method='counts'))
    ci.To(ci.Add('page'))
    ci.To(ci.Add('graph', autoadd=False))
    ci.Add('axis', name='x')
    ci.Add('axis', name='y', direction='vertical')
    ci.To(ci.Add('image', name='img'))
    ci.Set('data', 'phase')
    ci.To('..')

    scene = capture_document_scene(ci.document, page=0, pagesize_px=(480, 420),
                                   dpi=(96.0, 96.0))
    raw = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    ops = json.loads(raw)['ops']

    def opname(o):
        return o if isinstance(o, str) else next(iter(o.keys()), '')
    assert sum('DrawImage' in opname(o) for o in ops) == 1
    assert len(ops) < 500
