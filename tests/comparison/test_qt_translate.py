"""Tests for veusz.paint.qt_translate.

Uses duck-typed mocks for QPen, QBrush, QPainterPath, etc., so the suite
runs without PyQt6 installed. The real integration is exercised when
``veusz/paint/qt_capture.py`` is used inside Veusz with real Qt objects.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import pytest

from veusz.paint import qt_translate as qt
from veusz.paint.protocol import (
    Affine, BlendMode, Color, Fill, FillRule, LineCap, LineJoin, Paint, Quality,
    PathVerb, Stroke,
)


# ---------------------------------------------------------------------------
# Lightweight mocks of the Qt API surface qt_translate calls.
# ---------------------------------------------------------------------------

class FakeQColor:
    def __init__(self, r: float, g: float, b: float, a: float = 1.0):
        self._r, self._g, self._b, self._a = r, g, b, a
    def redF(self):   return self._r
    def greenF(self): return self._g
    def blueF(self):  return self._b
    def alphaF(self): return self._a


class FakeQTransform:
    def __init__(self, m11=1, m12=0, m21=0, m22=1, m31=0, m32=0):
        self._m = (m11, m12, m21, m22, m31, m32)
    def m11(self): return self._m[0]
    def m12(self): return self._m[1]
    def m21(self): return self._m[2]
    def m22(self): return self._m[3]
    def m31(self): return self._m[4]
    def m32(self): return self._m[5]


@dataclass
class FakeQPen:
    color: FakeQColor
    style: int = qt.QT_PEN_SOLID
    width: float = 1.0
    cap: int = 0x00     # FlatCap
    join: int = 0x00    # MiterJoin
    miter: float = 4.0
    dash: List[float] = field(default_factory=list)

    def style_(self): return self.style
    def __getattr__(self, name):
        if name == "color_":
            return lambda: self.color
        raise AttributeError(name)
    # the protocol expects camelCase methods; expose them explicitly:
    def color_method(self): return self.color


def make_pen(c=(0.0, 0.0, 0.0, 1.0), *, style=qt.QT_PEN_SOLID,
             width=1.0, cap=0x00, join=0x00, miter=4.0, dash=None):
    """Build a FakeQPen with QPen-like method names."""
    pen = type("Pen", (), {})()
    qc = FakeQColor(*c)
    pen.color = lambda: qc
    pen.style = lambda: style
    pen.widthF = lambda: width
    pen.capStyle = lambda: cap
    pen.joinStyle = lambda: join
    pen.miterLimit = lambda: miter
    pen.dashPattern = lambda: list(dash or [])
    return pen


def make_brush(*, style=qt.QT_BRUSH_SOLID, color=(0.0, 0.0, 0.0, 1.0),
               gradient=None):
    b = type("Brush", (), {})()
    b.style = lambda: style
    b.color = lambda: FakeQColor(*color)
    b.gradient = lambda: gradient
    return b


class _FakePointF:
    def __init__(self, x, y):
        self._x, self._y = x, y
    def x(self): return self._x
    def y(self): return self._y


class _FakeLinearGradient:
    def __init__(self, start, end, stops):
        self._start = _FakePointF(*start)
        self._end = _FakePointF(*end)
        self._stops = [(off, FakeQColor(*c)) for off, c in stops]
    def start(self): return self._start
    def finalStop(self): return self._end
    def stops(self): return self._stops


class _FakeRadialGradient:
    def __init__(self, center, radius, stops):
        self._center = _FakePointF(*center)
        self._radius = radius
        self._stops = [(off, FakeQColor(*c)) for off, c in stops]
    def center(self): return self._center
    def radius(self): return self._radius
    def stops(self): return self._stops


def make_linear_gradient(start, end, stops):
    return _FakeLinearGradient(start, end, stops)


def make_radial_gradient(center, radius, stops):
    return _FakeRadialGradient(center, radius, stops)


def make_qpath(elements):
    """elements: list of (type, x, y) tuples."""
    p = type("Path", (), {})()
    p.elementCount = lambda: len(elements)

    class _El:
        def __init__(self, t, x, y):
            self.type = t; self.x = x; self.y = y
    els = [_El(*e) for e in elements]
    p.elementAt = lambda i: els[i]
    return p


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_qcolor_roundtrip():
    c = FakeQColor(0.5, 0.25, 0.75, 0.5)
    out = qt.qcolor_to_color(c)
    assert out == Color(0.5, 0.25, 0.75, 0.5)


def test_qtransform_to_affine_matches_struct_order():
    t = FakeQTransform(m11=2, m12=0, m21=0, m22=3, m31=10, m32=20)
    a = qt.qtransform_to_affine(t)
    assert a == Affine(2, 0, 0, 3, 10, 20)


def test_qpen_no_pen_returns_none():
    pen = make_pen(style=qt.QT_PEN_NO_PEN)
    assert qt.qpen_to_stroke(pen) is None


def test_qpen_solid_translates():
    pen = make_pen(c=(1.0, 0.0, 0.0, 1.0), width=2.5)
    s = qt.qpen_to_stroke(pen)
    assert s.color == Color(1, 0, 0, 1)
    assert s.width == 2.5
    assert s.dash is None
    assert s.cap is LineCap.BUTT
    assert s.join is LineJoin.MITER


def test_qpen_custom_dash_carries_pattern():
    pen = make_pen(style=qt.QT_PEN_CUSTOM_DASH, dash=[4.0, 2.0, 1.0, 2.0])
    s = qt.qpen_to_stroke(pen)
    assert s.dash == (4.0, 2.0, 1.0, 2.0)


def test_qpen_cap_join_translate():
    pen = make_pen(cap=0x20, join=0x80)  # RoundCap, RoundJoin
    s = qt.qpen_to_stroke(pen)
    assert s.cap is LineCap.ROUND
    assert s.join is LineJoin.ROUND


def test_qbrush_solid_to_fill():
    b = make_brush(color=(0.1, 0.2, 0.3, 1.0))
    fill = qt.qbrush_to_fill(b)
    assert fill.solid == Color(0.1, 0.2, 0.3, 1.0)
    assert fill.linear is None and fill.radial is None


def test_qbrush_no_brush_returns_none():
    b = make_brush(style=qt.QT_BRUSH_NO_BRUSH)
    assert qt.qbrush_to_fill(b) is None


def test_qbrush_linear_gradient_translates_stops_and_endpoints():
    g = make_linear_gradient(
        (0.0, 0.0), (100.0, 0.0),
        [(0.0, (1, 0, 0, 1)), (1.0, (0, 0, 1, 1))],
    )
    b = make_brush(style=qt.QT_BRUSH_LINEAR_GRADIENT, gradient=g)
    fill = qt.qbrush_to_fill(b)
    assert fill.linear is not None
    assert fill.linear.start == (0.0, 0.0)
    assert fill.linear.end == (100.0, 0.0)
    assert len(fill.linear.stops) == 2
    assert fill.linear.stops[0].offset == 0.0
    assert fill.linear.stops[0].color == Color(1, 0, 0, 1)


def test_qbrush_radial_gradient_translates():
    g = make_radial_gradient((10.0, 20.0), 50.0,
                             [(0.0, (1, 1, 1, 1)), (1.0, (0, 0, 0, 1))])
    b = make_brush(style=qt.QT_BRUSH_RADIAL_GRADIENT, gradient=g)
    fill = qt.qbrush_to_fill(b)
    assert fill.radial is not None
    assert fill.radial.center == (10.0, 20.0)
    assert fill.radial.radius == 50.0


def test_qpath_simple_polyline_translates():
    elements = [
        (qt.PATH_MOVE, 0.0, 0.0),
        (qt.PATH_LINE, 10.0, 0.0),
        (qt.PATH_LINE, 10.0, 10.0),
    ]
    p = qt.qpath_to_path(make_qpath(elements))
    assert p.verbs == [PathVerb.MOVE_TO, PathVerb.LINE_TO, PathVerb.LINE_TO]
    assert p.points == [0.0, 0.0, 10.0, 0.0, 10.0, 10.0]


def test_qpath_cubic_collapses_three_elements_into_one_verb():
    # Qt: CurveTo (control1), CurveData (control2), CurveData (endpoint)
    elements = [
        (qt.PATH_MOVE, 0.0, 0.0),
        (qt.PATH_CURVE, 10.0, 0.0),
        (qt.PATH_CURVE_DATA, 20.0, 0.0),
        (qt.PATH_CURVE_DATA, 30.0, 30.0),
    ]
    p = qt.qpath_to_path(make_qpath(elements))
    assert p.verbs == [PathVerb.MOVE_TO, PathVerb.CUBIC_TO]
    assert p.points == [0.0, 0.0,  10.0, 0.0, 20.0, 0.0, 30.0, 30.0]


def test_composition_mode_maps_known_values():
    assert qt.composition_mode_to_blend(qt.QT_COMP_SOURCE_OVER) is BlendMode.SOURCE_OVER
    assert qt.composition_mode_to_blend(qt.QT_COMP_MULTIPLY) is BlendMode.MULTIPLY
    assert qt.composition_mode_to_blend(qt.QT_COMP_PLUS) is BlendMode.PLUS
    # Unknown -> fallback.
    assert qt.composition_mode_to_blend(99) is BlendMode.SOURCE_OVER


def test_render_hints_to_quality():
    assert qt.render_hints_to_quality(0) is Quality.FAST
    assert qt.render_hints_to_quality(0x01) is Quality.BALANCED
    assert qt.render_hints_to_quality(0x01 | 0x02 | 0x04) is Quality.BEST


def test_pen_brush_to_paint_carries_both_sides():
    pen = make_pen(c=(1, 0, 0, 1), width=2.0)
    brush = make_brush(color=(0, 1, 0, 1))
    paint = qt.pen_brush_to_paint(pen, brush, anti_alias=False)
    assert paint.stroke.color == Color(1, 0, 0, 1)
    assert paint.fill.solid == Color(0, 1, 0, 1)
    assert paint.anti_alias is False


def test_pen_brush_to_paint_handles_no_pen_and_no_brush():
    pen = make_pen(style=qt.QT_PEN_NO_PEN)
    brush = make_brush(style=qt.QT_BRUSH_NO_BRUSH)
    paint = qt.pen_brush_to_paint(pen, brush)
    assert paint.stroke is None
    assert paint.fill is None


def test_fill_rule_translation():
    assert qt.qfill_rule_to_fill_rule(qt.QT_FILL_RULE_ODD_EVEN) is FillRule.EVEN_ODD
    assert qt.qfill_rule_to_fill_rule(qt.QT_FILL_RULE_WINDING) is FillRule.NON_ZERO


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
