"""Tests for the density plotter widget (2D histogram, like xy/contour).

Verifies registration, that it bins x/y data and renders as a single image op
on the Scene-IR path (so every backend draws it), colorbar binding, the
weighted reductions, schema extraction (the inspector interface), and save.
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


def _doc():
    from veusz import document
    from veusz.document.commandinterface import CommandInterface
    return CommandInterface(document.Document())


def _build(ci, **setvals):
    """Build page→graph→axes→density(+colorbar), return the density widget."""
    ci.To(ci.Add('page'))
    ci.To(ci.Add('graph', autoadd=False))
    ci.Add('axis', name='x')
    ci.Add('axis', name='y', direction='vertical')
    ci.To(ci.Add('density', name='dens'))
    for k, v in setvals.items():
        ci.Set(k, v)
    widget = ci.currentwidget
    ci.To('..')
    return widget


def test_density_registered():
    from veusz import document, widgets  # noqa: F401
    assert 'density' in document.thefactory.listWidgets()


def test_renders_as_single_image_op():
    from veusz.paint.qt_capture import capture_document_scene
    ci = _doc()
    rng = N.random.default_rng(0)
    x, y = rng.normal(size=100000), rng.normal(size=100000)
    ci.SetData('x', x)
    ci.SetData('y', y)
    _build(ci, xData='x', yData='y', numBinsX=80, numBinsY=80)

    scene = capture_document_scene(ci.document, page=0, pagesize_px=(560, 480),
                                   dpi=(96.0, 96.0))
    raw = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    ops = json.loads(raw)['ops']

    def opname(o):
        return o if isinstance(o, str) else next(iter(o.keys()), '')
    assert any('DrawImage' in opname(o) for o in ops)
    assert len(ops) < 500   # 80x80 bins, but one image op


def test_colorbar_binds_to_density():
    from veusz.paint.qt_capture import capture_document_scene
    ci = _doc()
    rng = N.random.default_rng(1)
    ci.SetData('x', rng.normal(size=50000))
    ci.SetData('y', rng.normal(size=50000))
    _build(ci, xData='x', yData='y')
    # colorbar must accept a density widget as its target
    ci.Add('colorbar', widgetName='dens')
    # render shouldn't raise and should still contain an image
    scene = capture_document_scene(ci.document, page=0, pagesize_px=(400, 400),
                                   dpi=(96.0, 96.0))
    raw = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    assert b'DrawImage' in raw or 'DrawImage' in raw.decode('utf8', 'ignore')


def test_widget_binning_matches_numpy_counts():
    ci = _doc()
    rng = N.random.default_rng(2)
    x, y = rng.normal(size=40000), rng.normal(size=40000)
    ci.SetData('x', x)
    ci.SetData('y', y)
    widget = _build(ci, xData='x', yData='y',
                  numBinsX=20, minX=-4, maxX=4,
                  numBinsY=20, minY=-4, maxY=4, mode='counts')

    grid = widget.getImageData().data
    H, _xe, _ye = N.histogram2d(x, y, bins=[N.linspace(-4, 4, 21),
                                            N.linspace(-4, 4, 21)])
    ref = N.where(H > 0, H, N.nan).T
    assert N.allclose(N.nan_to_num(grid), N.nan_to_num(ref))


def test_weighted_mean_mode():
    ci = _doc()
    rng = N.random.default_rng(3)
    x, y = rng.normal(size=30000), rng.normal(size=30000)
    w = N.abs(rng.normal(1, 0.2, size=30000))
    ci.SetData('x', x)
    ci.SetData('y', y)
    ci.SetData('w', w)
    widget = _build(ci, xData='x', yData='y', weightData='w',
                  numBinsX=15, minX=-3, maxX=3,
                  numBinsY=15, minY=-3, maxY=3, mode='mean')

    grid = widget.getImageData().data
    xe = N.linspace(-3, 3, 16)
    H, _, _ = N.histogram2d(x, y, bins=[xe, xe])
    Hs, _, _ = N.histogram2d(x, y, bins=[xe, xe], weights=w)
    with N.errstate(invalid='ignore', divide='ignore'):
        ref = N.where(H > 0, Hs / H, N.nan).T
    assert N.allclose(N.nan_to_num(grid), N.nan_to_num(ref))


def test_schema_exposes_natural_interface():
    from veusz.daemon import schema
    names = {x['name'] for x in schema.extract_class_schema('density')['settings']}
    # the inspector should offer the x/y/weight + binning + colour controls
    for expected in ('xData', 'yData', 'weightData', 'mode',
                     'numBinsX', 'logX', 'numBinsY', 'colorMap', 'colorScaling'):
        assert expected in names


def test_save_emits_add_density():
    ci = _doc()
    rng = N.random.default_rng(4)
    ci.SetData('x', rng.normal(size=10000))
    ci.SetData('y', rng.normal(size=10000))
    _build(ci, xData='x', yData='y')
    buf = io.StringIO()
    ci.document.saveToFile(buf)
    assert "Add('density'" in buf.getvalue()
