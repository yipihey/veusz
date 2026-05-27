"""Smoke tests for SceneCapturingPainter via dependency-injected fake Qt.

A real-Qt integration test would require PyQt6, the Veusz document module,
and a sample .vsz; those will run in CI once a Qt-installed environment
exists. Here we verify the glue between QPainter overrides and the
recorder produces the expected SceneOp sequence for the common cases.
"""

from __future__ import annotations

import json
from types import SimpleNamespace

import pytest

from veusz.paint import qt_translate as qtt
from veusz.paint.protocol import Color, PathVerb
from veusz.paint.qt_capture import make_scene_capturing_painter


# ---------------------------------------------------------------------------
# Fake Qt module sized to what SceneCapturingPainter uses
# ---------------------------------------------------------------------------

class _FakeQPainter:
    """Stand-in for ``qt.QPainter``.

    Tracks pen/brush so ``pen()`` / ``brush()`` return what callers set, and
    no-ops every drawing call. Subclasses (the painter class built by
    make_scene_capturing_painter) call ``super().setPen(...)`` etc., which
    land here.
    """
    class RenderHint:
        Antialiasing = 0x01
        TextAntialiasing = 0x02
        SmoothPixmapTransform = 0x04

    def __init__(self, device=None):
        self._pen = _FakeQPen()
        self._brush = _FakeQBrush()
        self._transform = _FakeQTransform()

    # state ----
    def setPen(self, pen): self._pen = pen
    def setBrush(self, brush): self._brush = brush
    def setRenderHint(self, hint, on=True): pass
    def pen(self): return self._pen
    def brush(self): return self._brush
    def transform(self): return self._transform

    # stack ----
    def save(self): pass
    def restore(self): pass

    # transforms ----
    def translate(self, *a): pass
    def rotate(self, deg): pass
    def scale(self, sx, sy=None): pass
    def setTransform(self, t, combine=False): pass
    def resetTransform(self): pass

    # clip ----
    def setClipRect(self, *a): pass
    def setClipPath(self, *a): pass

    # draw ----
    def drawLine(self, *a): pass
    def drawRect(self, *a): pass
    def drawEllipse(self, *a): pass
    def drawPath(self, *a): pass
    def strokePath(self, *a): pass
    def fillPath(self, *a): pass
    def fillRect(self, *a): pass
    def drawPolyline(self, *a): pass
    def drawPolygon(self, *a): pass
    def drawImage(self, *a): pass
    def end(self): pass


class _FakeQPen:
    def __init__(self, color=(0.0, 0.0, 0.0, 1.0), width=1.0,
                 style=qtt.QT_PEN_SOLID, cap=0x00, join=0x00, miter=4.0,
                 dash=None):
        self._color = _FakeQColor(*color)
        self._width = width
        self._style = style
        self._cap = cap
        self._join = join
        self._miter = miter
        self._dash = dash or []

    def color(self): return self._color
    def widthF(self): return self._width
    def style(self): return self._style
    def capStyle(self): return self._cap
    def joinStyle(self): return self._join
    def miterLimit(self): return self._miter
    def dashPattern(self): return list(self._dash)


class _FakeQBrush:
    def __init__(self, color=(0.0, 0.0, 0.0, 1.0), style=qtt.QT_BRUSH_SOLID):
        self._color = _FakeQColor(*color)
        self._style = style
    def color(self): return self._color
    def style(self): return self._style
    def gradient(self): return None


class _FakeQColor:
    def __init__(self, r, g, b, a=1.0):
        self._r, self._g, self._b, self._a = r, g, b, a
    def redF(self): return self._r
    def greenF(self): return self._g
    def blueF(self): return self._b
    def alphaF(self): return self._a


class _FakeQTransform:
    def m11(self): return 1.0
    def m12(self): return 0.0
    def m21(self): return 0.0
    def m22(self): return 1.0
    def m31(self): return 0.0
    def m32(self): return 0.0


class _FakeQRectF:
    def __init__(self, x, y, w, h):
        self._x, self._y, self._w, self._h = x, y, w, h
    def x(self): return self._x
    def y(self): return self._y
    def width(self): return self._w
    def height(self): return self._h


class _FakeQLineF:
    def __init__(self, x1, y1, x2, y2):
        self._x1, self._y1, self._x2, self._y2 = x1, y1, x2, y2
    def x1(self): return self._x1
    def y1(self): return self._y1
    def x2(self): return self._x2
    def y2(self): return self._y2


def _fake_qt():
    return SimpleNamespace(QPainter=_FakeQPainter)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_draw_line_emits_setpaint_then_stroke():
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    pen = _FakeQPen(color=(1.0, 0.0, 0.0, 1.0), width=2.0)
    p.setPen(pen)
    p.drawLine(_FakeQLineF(0.0, 0.0, 10.0, 0.0))

    ops = p.recorder.to_dict()["ops"]
    # Expect: SetPaint, StrokePath
    op_names = [o if isinstance(o, str) else next(iter(o.keys())) for o in ops]
    assert "SetPaint" in op_names
    assert "StrokePath" in op_names


def test_fill_rect_emits_solid_fill_op():
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    brush = _FakeQBrush(color=(0.0, 0.5, 1.0, 1.0))
    p.fillRect(_FakeQRectF(10, 20, 30, 40), brush)

    ops = p.recorder.to_dict()["ops"]
    set_paint = [o for o in ops if isinstance(o, dict) and "SetPaint" in o][0]
    fill_path = [o for o in ops if isinstance(o, dict) and "FillPath" in o][0]
    # the fill is solid blue-ish
    solid = set_paint["SetPaint"]["fill"]["Solid"]
    assert solid["b"] > 0.9 and solid["g"] > 0.4
    # the path is a closed rect (M, L, L, L, Close)
    verbs = fill_path["FillPath"]["path"]["verbs"]
    assert verbs == ["MoveTo", "LineTo", "LineTo", "LineTo", "Close"]


def test_save_restore_emits_balanced_frame_ops():
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    p.save(); p.save(); p.restore(); p.restore()
    ops = p.recorder.to_dict()["ops"]
    assert ops == ["Save", "Save", "Restore", "Restore"]


def test_translate_rotate_scale_each_emit_a_concat_transform():
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    p.translate(5.0, 7.0)
    p.rotate(90.0)
    p.scale(2.0, 3.0)
    ops = p.recorder.to_dict()["ops"]
    concat_ops = [o for o in ops if isinstance(o, dict) and "ConcatTransform" in o]
    assert len(concat_ops) == 3
    # First op is translation: e=5, f=7.
    t = concat_ops[0]["ConcatTransform"]
    assert t["e"] == 5.0 and t["f"] == 7.0
    # Last op is a uniform scale: a=2, d=3, off-diagonals zero.
    s = concat_ops[2]["ConcatTransform"]
    assert s["a"] == 2.0 and s["d"] == 3.0
    assert s["b"] == 0.0 and s["c"] == 0.0


def test_set_clip_rect_emits_pushclip_then_super_call_succeeds():
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    p.setClipRect(_FakeQRectF(0, 0, 50, 50))
    ops = p.recorder.to_dict()["ops"]
    assert any(isinstance(o, dict) and "PushClipRect" in o for o in ops)


def test_scene_json_serialises():
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    p.fillRect(_FakeQRectF(0, 0, 5, 5),
               _FakeQBrush(color=(1, 0, 0, 1)))
    data = p.recorder.to_json()
    assert isinstance(data, (bytes, bytearray))
    parsed = json.loads(data)
    assert "ops" in parsed and len(parsed["ops"]) >= 2


def test_scene_json_decodes_via_extension():
    """Round-trip through the Rust scene_summary_json to confirm the
    JSON shape Python emits is actually what Rust accepts."""
    ext = pytest.importorskip("veusz.paint._paint_ext")
    p = make_scene_capturing_painter(object(), qt_module=_fake_qt())
    p.setPen(_FakeQPen(color=(0.0, 0.0, 0.0, 1.0), width=1.0))
    p.drawLine(_FakeQLineF(0, 0, 10, 0))
    p.fillRect(_FakeQRectF(0, 0, 5, 5),
               _FakeQBrush(color=(1, 0, 0, 1)))

    summary = json.loads(ext.scene_summary_json(p.recorder.to_json()))
    assert summary["paths_stroked"] >= 1
    assert summary["paths_filled"] >= 1


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
