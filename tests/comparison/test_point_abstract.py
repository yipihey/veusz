"""Tests for ``PointPlotter.dataDrawAbstract`` — the abstract-Painter
render path for the xy widget.

Coverage:
- Recorded-ops shape: the abstract path emits the expected mix of
  ConcatTransform / StrokePath / FillPath / SetPaint / Save / Restore.
- All 88 marker codes build a non-empty Path through the abstract
  ``marker_path`` table (no fallbacks to Qt).
- End-to-end: the same widget drives a real ``TinySkiaSceneBackend``
  (in a subprocess to keep PyQt6 and the Rust Vello runtime apart) and
  produces a PNG with visible non-white pixels.
- The error-style dispatch table covers every name in the QPainter
  version's ``error_functions`` map.
"""

from __future__ import annotations

import os
import sys

import pytest

pytest.importorskip("PyQt6")

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

from PyQt6 import QtWidgets, QtGui  # noqa: E402
if QtWidgets.QApplication.instance() is None:
    _app = QtWidgets.QApplication(sys.argv)

import veusz.widgets        # noqa: F401,E402
import veusz.dataimport     # noqa: F401,E402
from veusz import document  # noqa: E402
from veusz.document.painthelper import PaintHelper, DirectPainter  # noqa: E402
from veusz.paint.scene_recorder import PythonSceneRecorder  # noqa: E402
from veusz.paint.markers import marker_codes, marker_path  # noqa: E402
from veusz.widgets.point import PointPlotter, ErrorBarDraw  # noqa: E402


def _load_spectrum():
    doc = document.Document()
    doc.load("examples/spectrum.vsz")
    return doc


def _render_once_and_collect_xy(doc):
    """Render the doc through a Qt DirectPainter so PaintHelper learns
    every widget's bounds. Return (helper, list_of_(xy, posn, cliprect,
    axes))."""
    helper = PaintHelper(doc, (800, 600), dpi=(96, 96))
    img = QtGui.QImage(800, 600, QtGui.QImage.Format.Format_ARGB32_Premultiplied)
    img.fill(0xFFFFFFFF)
    qp = DirectPainter(img)
    qp.updateMetaData(helper)
    helper.directpaint = qp
    qp.save()
    doc.paintTo(helper, 0)
    qp.restore()
    qp.end()

    found = []
    for (widget, _layer), state in helper.states.items():
        if isinstance(widget, PointPlotter):
            posn = state.bounds
            cliprect = state.clip
            axes = widget.fetchAxes()
            found.append((widget, posn, cliprect, axes))
    return helper, qp, found


def test_point_plotter_data_draw_abstract_records_ops():
    """Drive dataDrawAbstract against a PythonSceneRecorder and check the
    op stream is non-empty and has the expected shape.

    Force ``marker='circle'`` on the first xy widget so the marker path
    actually fires — spectrum.vsz is all lines by default."""
    doc = _load_spectrum()
    helper, qp, xys = _render_once_and_collect_xy(doc)
    assert xys, "spectrum doc should contain at least one xy widget"

    first_xy = xys[0][0]
    op = doc.applyOperation
    from veusz.document.operations import OperationSettingSet
    op(OperationSettingSet(first_xy.settings.get('marker'), 'circle'))

    # Re-render so the marker change participates in coordinate setup.
    helper, qp, xys = _render_once_and_collect_xy(doc)

    rec = PythonSceneRecorder()
    for xy, posn, cliprect, axes in xys:
        xy.dataDrawAbstract(rec, qp, axes, posn, cliprect)

    ops = rec.to_dict()["ops"]
    op_names = [o if isinstance(o, str) else next(iter(o.keys())) for o in ops]

    # At minimum we expect: SetPaint (to register the line stroke), a
    # StrokePath (the line itself), and Save/Restore pairs around marker
    # blocks. The doc has data + markers + line so all three appear.
    assert "SetPaint" in op_names
    assert "StrokePath" in op_names
    assert "Save" in op_names and "Restore" in op_names
    # We translate per-marker, so ConcatTransform should appear many times.
    assert op_names.count("ConcatTransform") > 10, (
        f"only {op_names.count('ConcatTransform')} ConcatTransforms; "
        f"first ops: {op_names[:40]}")


def test_dispatch_table_covers_every_qt_error_style():
    """The abstract-Painter error dispatch table must list every name in
    the QPainter version. Drift here would silently skip error bars on
    the new backends."""
    qt_keys = set(ErrorBarDraw.error_functions.keys())
    abs_keys = set(ErrorBarDraw._abstract_error_functions.keys())
    missing = qt_keys - abs_keys
    assert not missing, f"abstract dispatch missing: {missing}"


def test_every_marker_code_builds_a_path():
    """Every name the QPainter side accepts must be buildable through
    the abstract marker_path() — otherwise a user document using that
    marker would silently render nothing in the new backends."""
    from veusz.utils.points import MarkerCodes as QtMarkerCodes
    abs_codes = set(marker_codes())
    qt_codes = set(QtMarkerCodes)
    missing = qt_codes - abs_codes
    assert not missing, f"abstract markers missing: {sorted(missing)}"

    # And each one actually produces a non-empty Path (except 'none').
    for name in qt_codes:
        path, _fillable = marker_path(name, 5.0, 1.0)
        if name == 'none':
            assert len(path.verbs) == 0
        else:
            assert len(path.verbs) > 0, f"{name} built an empty path"


def test_point_plotter_renders_through_tinyskia_subprocess():
    """End-to-end: drive PointPlotter.dataDrawAbstract through a real
    TinySkiaSceneBackend and assert the produced PNG has visible content.

    Subprocess because PyQt6 + the Rust _paint_ext runtime do not play
    nicely in the same process (font-config, threading)."""
    try:
        import veusz.paint._paint_ext  # noqa: F401
    except ImportError:
        pytest.skip("veusz.paint._paint_ext not built")
    import subprocess

    script = r'''
import os, sys
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
from PyQt6 import QtWidgets, QtGui
# Keep a strong reference to the QApplication for the lifetime of the
# script; the parented-via-QApplication.instance() idiom lets it get GCd
# during long Veusz imports and the QFontDatabase access aborts.
_app = QtWidgets.QApplication.instance() or QtWidgets.QApplication(sys.argv)

import veusz.widgets, veusz.dataimport
from veusz import document
from veusz.document.painthelper import PaintHelper, DirectPainter
from veusz.paint import create_painter
from veusz.widgets.point import PointPlotter

doc = document.Document()
doc.load("examples/spectrum.vsz")

# Render once through Qt to populate position metadata.
helper = PaintHelper(doc, (800, 600), dpi=(96, 96))
img = QtGui.QImage(800, 600, QtGui.QImage.Format.Format_ARGB32_Premultiplied)
img.fill(0xFFFFFFFF)
qp = DirectPainter(img)
qp.updateMetaData(helper)
helper.directpaint = qp
qp.save()
doc.paintTo(helper, 0)
qp.restore()
qp.end()

# Find xy widgets + their computed bounds.
xys = [(w, st.bounds, st.clip, w.fetchAxes())
       for (w, _l), st in helper.states.items()
       if isinstance(w, PointPlotter)]
if not xys:
    sys.exit(2)

# Now drive the abstract path against a tiny-skia backend.
p = create_painter(800, 600, backend="tiny-skia",
                   background=(1.0, 1.0, 1.0, 1.0))
for xy, posn, cliprect, axes in xys:
    xy.dataDrawAbstract(p, qp, axes, posn, cliprect)
p.finish()
png = p.png_bytes
if not png.startswith(b"\x89PNG\r\n\x1a\n"):
    sys.exit(3)

# Sanity-check the PNG has visible non-white pixels (the data line +
# markers). Without point.dataDrawAbstract working this would be a
# fully-white image.
from PIL import Image
import io, numpy as np
arr = np.asarray(Image.open(io.BytesIO(png)).convert("RGBA"))
non_white = ((arr[..., :3] < 200).any(axis=2)).sum()
if non_white < 500:
    sys.exit(4)
print(f"OK: PNG={len(png)} bytes, non_white={non_white}")
'''
    env = dict(os.environ)
    env["QT_QPA_PLATFORM"] = "offscreen"
    p = subprocess.run(
        [sys.executable, "-c", script],
        capture_output=True, text=True, env=env, timeout=60,
        cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    assert p.returncode == 0, (
        f"subprocess failed: stdout={p.stdout!r} stderr={p.stderr!r}")


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
