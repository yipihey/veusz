"""Tests for the abstract-Painter equivalents of Veusz Setting.Line /
Setting.Brush conversion methods.

These are the building blocks of the widget refactor (per
`docs/widget-refactor-spike.md`): widgets that target the abstract
Painter call `setting.Line.to_stroke(helper)` and
`setting.Brush.to_fill(helper)` instead of `makeQPen` / `makeQBrush`.
"""

from __future__ import annotations

import math
import os

import pytest

# PyQt6 needed because Veusz Setting.color() returns a QColor.
pytest.importorskip("PyQt6")

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

from PyQt6 import QtWidgets  # noqa: E402
import sys
if QtWidgets.QApplication.instance() is None:
    _app = QtWidgets.QApplication(sys.argv)

import veusz.widgets        # noqa: F401,E402 register widget classes
import veusz.dataimport     # noqa: F401,E402
from veusz import document  # noqa: E402
from veusz.document.painthelper import PaintHelper  # noqa: E402
from veusz.paint.protocol import LineCap, LineJoin  # noqa: E402


def _example_doc_with_line():
    doc = document.Document()
    doc.load("examples/spectrum.vsz")
    return doc


def _painter_for(doc):
    """Build a PainterRoot-style QPainter for the document. Veusz's
    settings.color() consults the painter for the document's color
    palette, so we need an actual PainterRoot, not just a PaintHelper.
    """
    from PyQt6 import QtGui
    from veusz.document.painthelper import PaintHelper, DirectPainter
    helper = PaintHelper(doc, (800, 600), dpi=(96, 96))
    image = QtGui.QImage(1, 1, QtGui.QImage.Format.Format_ARGB32)
    image.fill(0)
    p = DirectPainter(image)
    p.updateMetaData(helper)
    # Keep `image` and helper alive on the painter so they don't drop.
    p._owned_image = image
    p._owned_helper = helper
    return p


def _find_widget_with_line(doc):
    """Walk the widget tree, return the first widget that has a Setting.Line
    called 'Line' (covers axes, plotters, etc.)."""
    def visit(w):
        if hasattr(w.settings, 'isSetting') and w.settings.isSetting('Line'):
            return w
        for child in w.children:
            r = visit(child)
            if r is not None:
                return r
        return None
    return visit(doc.basewidget)


def test_line_to_stroke_produces_protocol_stroke():
    doc = _example_doc_with_line()
    helper = _painter_for(doc)
    w = _find_widget_with_line(doc)
    assert w is not None, "smoke document should contain a widget with a Line setting"
    line = w.settings.get('Line')
    stroke = line.to_stroke(helper)
    # Width should be in user-space units, matching makeQPen's convert().
    assert stroke.width > 0
    # cap/join defaults match Qt's flat/miter.
    assert stroke.cap is LineCap.BUTT
    assert stroke.join is LineJoin.MITER
    # miter limit matches the makeQPen pen.setMiterLimit(4).
    assert stroke.miter_limit == 4.0
    # color is normalised to 0..1 sRGB.
    for c in (stroke.color.r, stroke.color.g, stroke.color.b, stroke.color.a):
        assert 0.0 <= c <= 1.0


def test_line_to_stroke_or_none_respects_hide():
    doc = _example_doc_with_line()
    helper = _painter_for(doc)
    w = _find_widget_with_line(doc)
    line = w.settings.get('Line')
    line.hide = False
    assert line.to_stroke_or_none(helper) is not None
    line.hide = True
    assert line.to_stroke_or_none(helper) is None
    # transparency=100 also hides
    line.hide = False
    line.transparency = 100
    assert line.to_stroke_or_none(helper) is None


def test_brush_to_fill_solid():
    """Find a widget with a Brush/Fill setting and convert it."""
    doc = _example_doc_with_line()
    helper = _painter_for(doc)
    # Walk for a Brush.
    def visit(w):
        for s_name in ('Brush', 'FillBelow', 'FillAbove'):
            if hasattr(w.settings, 'isSetting') and w.settings.isSetting(s_name):
                cand = w.settings.get(s_name)
                if hasattr(cand, 'to_fill'):
                    return cand
        for child in w.children:
            r = visit(child)
            if r is not None:
                return r
        return None
    fill_setting = visit(doc.basewidget)
    if fill_setting is None:
        pytest.skip("no Brush setting in the spectrum doc to test against")
    fill = fill_setting.to_fill(helper)
    assert fill.solid is not None
    assert fill.linear is None and fill.radial is None
    for c in (fill.solid.r, fill.solid.g, fill.solid.b, fill.solid.a):
        assert 0.0 <= c <= 1.0


def test_plot_line_arrow_abstract_paints_through_scene_recorder():
    """Drive `plot_line_arrow` from veusz.paint.utils_abstract against a
    `PythonSceneRecorder` — the standalone abstract Painter that doesn't
    need any backend. Asserts the recorded ops are what we'd expect:
    a save/transform/stroke-path/restore sequence."""
    from veusz.paint.utils_abstract import plot_line_arrow
    from veusz.paint.scene_recorder import PythonSceneRecorder
    from veusz.paint.protocol import Stroke, Color

    rec = PythonSceneRecorder()
    stroke = Stroke(color=Color(0, 0, 0, 1.0), width=2.0)
    plot_line_arrow(rec, 10.0, 20.0, 100.0, 30.0, stroke,
                    arrowsize=5.0, arrowleft='arrow', arrowright='triangle')

    ops = rec.to_dict()["ops"]
    op_names = [o if isinstance(o, str) else next(iter(o.keys())) for o in ops]
    # First op is Save (we wrap the whole arrow in a save/restore).
    assert op_names[0] == "Save"
    # Two transforms (translate, rotate) before any draw.
    assert op_names[:3] == ["Save", "ConcatTransform", "ConcatTransform"]
    # SetPaint precedes the strokes.
    assert "SetPaint" in op_names
    # We expect at least one StrokePath (the main line) and a FillPath
    # (for the 'triangle' arrowright).
    assert "StrokePath" in op_names
    assert "FillPath" in op_names
    # Balanced Save/Restore at end.
    assert op_names[-1] == "Restore"


def test_plot_line_arrow_renders_through_tinyskia():
    """End-to-end: refactored line-arrow code drives a TinySkiaSceneBackend
    and produces a real PNG.

    Run in a subprocess because the in-process PyQt6 + Veusz Qt state
    (loaded earlier in this module) clashes with the Rust extension's
    runtime when both live in the same Python process. The standalone
    path is what real callers hit anyway.
    """
    try:
        import veusz.paint._paint_ext  # noqa: F401
    except ImportError:
        pytest.skip("veusz.paint._paint_ext not built")
    import subprocess, sys, os
    script = '''
import sys
from veusz.paint import create_painter
from veusz.paint.utils_abstract import plot_line_arrow
from veusz.paint.protocol import Stroke, Color
p = create_painter(200, 80, backend="tiny-skia", background=(1.0, 1.0, 1.0, 1.0))
stroke = Stroke(color=Color.rgba8(40, 80, 200, 255), width=2.0)
plot_line_arrow(p, 30.0, 40.0, 140.0, 0.0, stroke,
                arrowsize=8.0, arrowleft="arrow", arrowright="arrow")
plot_line_arrow(p, 30.0, 60.0, 140.0, 0.0, stroke,
                arrowsize=8.0, arrowleft="triangle", arrowright="triangle")
p.finish()
png = p.png_bytes
if not png.startswith(b"\\x89PNG\\r\\n\\x1a\\n"):
    sys.exit(2)
from PIL import Image
import io, numpy as np
arr = np.asarray(Image.open(io.BytesIO(png)).convert("RGBA"))
non_white = ((arr[..., :3] < 200).any(axis=2)).sum()
if non_white < 200:
    sys.exit(3)
print(f"OK: PNG={len(png)} bytes, non-white pixels={non_white}")
'''
    env = dict(os.environ)
    env.pop("QT_QPA_PLATFORM", None)
    p = subprocess.run([sys.executable, "-c", script],
                       capture_output=True, text=True, env=env, timeout=30,
                       cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    assert p.returncode == 0, \
        f"subprocess failed: stdout={p.stdout!r} stderr={p.stderr!r}"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
