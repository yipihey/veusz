"""Tests for the 2D histogram / density dataset (CreateHistogram2D).

Covers binning correctness against numpy, the joint-finite masking, the
reduction methods (counts/sum/mean/density), the cross-backend linear-vs-log
edge behaviour, save/reload round-tripping, and that the result renders as a
single image op through the Scene-IR capture path (i.e. on every backend).
"""

from __future__ import annotations

import io
import os
import sys

import numpy as N
import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    """One QApplication for the session; registers widgets + commands."""
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets, dataimport  # noqa: F401 — side-effect imports
    yield app


def _doc_with_xy(x, y, w=None):
    from veusz import document
    from veusz.document.commandinterface import CommandInterface
    doc = document.Document()
    ci = CommandInterface(doc)
    ci.SetData('x', N.asarray(x, dtype=float))
    ci.SetData('y', N.asarray(y, dtype=float))
    if w is not None:
        ci.SetData('w', N.asarray(w, dtype=float))
    return doc, ci


XEDGES = N.linspace(-4, 4, 21)
YEDGES = N.linspace(-4, 4, 21)
BPX = (20, -4, 4, False)
BPY = (20, -4, 4, False)


def _refcounts(x, y):
    H, _xe, _ye = N.histogram2d(x, y, bins=[XEDGES, YEDGES])
    return H


def test_counts_matches_numpy():
    rng = N.random.default_rng(0)
    x, y = rng.normal(size=20000), rng.normal(size=20000)
    doc, ci = _doc_with_xy(x, y)
    ci.CreateHistogram2D('x', 'y', 'h', binparamsx=BPX, binparamsy=BPY, method='counts')
    H = _refcounts(x, y)
    ref = N.where(H > 0, H, N.nan).T
    got = doc.data['h'].data
    assert got.shape == (20, 20)
    assert N.allclose(N.nan_to_num(got), N.nan_to_num(ref))
    # empty bins are NaN (rendered transparent), not zero
    assert N.any(N.isnan(got))


def test_sum_and_mean_match_numpy():
    rng = N.random.default_rng(1)
    x, y = rng.normal(size=30000), rng.normal(size=30000)
    w = N.abs(rng.normal(1, 0.2, size=30000))
    doc, ci = _doc_with_xy(x, y, w)
    ci.CreateHistogram2D('x', 'y', 'sum', weightexpr='w',
                         binparamsx=BPX, binparamsy=BPY, method='sum')
    ci.CreateHistogram2D('x', 'y', 'mean', weightexpr='w',
                         binparamsx=BPX, binparamsy=BPY, method='mean')
    H = _refcounts(x, y)
    Hs, _xe, _ye = N.histogram2d(x, y, bins=[XEDGES, YEDGES], weights=w)
    refsum = N.where(H > 0, Hs, N.nan).T
    with N.errstate(invalid='ignore', divide='ignore'):
        refmean = N.where(H > 0, Hs / H, N.nan).T
    assert N.allclose(N.nan_to_num(doc.data['sum'].data), N.nan_to_num(refsum))
    assert N.allclose(N.nan_to_num(doc.data['mean'].data), N.nan_to_num(refmean))


def test_density_matches_numpy():
    rng = N.random.default_rng(2)
    x, y = rng.normal(size=15000), rng.normal(size=15000)
    doc, ci = _doc_with_xy(x, y)
    ci.CreateHistogram2D('x', 'y', 'd', binparamsx=BPX, binparamsy=BPY, method='density')
    H, _xe, _ye = N.histogram2d(x, y, bins=[XEDGES, YEDGES], density=True)
    ref = N.where(_refcounts(x, y) > 0, H, N.nan).T
    assert N.allclose(N.nan_to_num(doc.data['d'].data), N.nan_to_num(ref))


def test_nonfinite_values_dropped_jointly():
    # Points where x, y, or weight is non-finite must be dropped together.
    x = N.array([0.0, 1.0, N.nan, 2.0, 3.0])
    y = N.array([0.0, N.inf, 1.0, 2.0, 3.0])
    w = N.array([1.0, 1.0, 1.0, N.nan, 1.0])
    doc, ci = _doc_with_xy(x, y, w)
    ci.CreateHistogram2D('x', 'y', 'h', weightexpr='w',
                         binparamsx=(4, 0, 4, False), binparamsy=(4, 0, 4, False),
                         method='counts')
    # only points 0 (0,0) and 4 (3,3) survive the joint-finite mask
    assert N.nansum(doc.data['h'].data) == 2


def test_linear_bins_use_fast_linear_path():
    # Uniform edges must collapse to a linear image (the cross-backend path).
    rng = N.random.default_rng(3)
    x, y = rng.normal(size=5000), rng.normal(size=5000)
    doc, ci = _doc_with_xy(x, y)
    ci.CreateHistogram2D('x', 'y', 'h', binparamsx=BPX, binparamsy=BPY, method='counts')
    ds = doc.data['h']
    assert ds.isLinearImage()      # → image widget's fast, universal path
    assert ds.xedge is None and ds.xrange is not None


def test_log_bins_keep_edges():
    rng = N.random.default_rng(4)
    x = 10 ** rng.uniform(0, 3, size=5000)
    y = 10 ** rng.uniform(0, 3, size=5000)
    doc, ci = _doc_with_xy(x, y)
    ci.CreateHistogram2D('x', 'y', 'h',
                         binparamsx=(15, 1, 1000, True), binparamsy=(15, 1, 1000, True),
                         method='counts')
    ds = doc.data['h']
    assert not ds.isLinearImage()  # geometric edges retained
    assert ds.xedge is not None and len(ds.xedge) == 16
    # log edges are geometric
    ratios = ds.xedge[1:] / ds.xedge[:-1]
    assert N.allclose(ratios, ratios[0])


def test_save_reload_roundtrip():
    from veusz import document
    from veusz.document.commandinterpreter import CommandInterpreter
    rng = N.random.default_rng(5)
    x, y = rng.normal(size=8000), rng.normal(size=8000)
    doc, ci = _doc_with_xy(x, y)
    ci.CreateHistogram2D('x', 'y', 'h', binparamsx=BPX, binparamsy=BPY, method='counts')
    before = N.nan_to_num(doc.data['h'].data)

    buf = io.StringIO()
    doc.saveToFile(buf)
    text = buf.getvalue()
    assert 'CreateHistogram2D' in text

    doc2 = document.Document()
    CommandInterpreter(doc2).runFile(io.StringIO(text))
    assert 'h' in doc2.data
    after = N.nan_to_num(doc2.data['h'].data)
    assert N.allclose(before, after)


def test_renders_as_single_image_op():
    # The phase-diagram property: any number of points reduces to one image op.
    import json
    from veusz.paint.qt_capture import capture_document_scene
    rng = N.random.default_rng(6)
    x, y = rng.normal(size=200000), rng.normal(size=200000)
    doc, ci = _doc_with_xy(x, y)
    ci.CreateHistogram2D('x', 'y', 'h', binparamsx=(60, -4, 4, False),
                         binparamsy=(60, -4, 4, False), method='counts')
    ci.To(ci.Add('page'))
    ci.To(ci.Add('graph', autoadd=False))
    ci.Add('axis', name='x')
    ci.Add('axis', name='y', direction='vertical')
    ci.To(ci.Add('image', name='img'))
    ci.Set('data', 'h')
    ci.To('..')

    scene = capture_document_scene(doc, page=0, pagesize_px=(566, 566), dpi=(96.0, 96.0))
    raw = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    ops = json.loads(raw)['ops']

    def opname(o):
        return o if isinstance(o, str) else next(iter(o.keys()), '')
    assert any('DrawImage' in opname(o) for o in ops)
    # 60x60 = 3600 cells but it's one image, so the op count stays tiny
    assert len(ops) < 500
