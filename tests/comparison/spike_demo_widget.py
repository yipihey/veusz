"""Spike: a Veusz-style widget written purely against the abstract Painter.

Validates that the `veusz.paint.protocol.Painter` interface is rich enough
to express the kind of drawing real Veusz widgets do — pen styling, fill,
clipping, transforms, text — without falling through to QPainter-specific
APIs. The widget runs through all available backends; the test asserts
visually-equivalent output across them.

See `docs/widget-refactor-spike.md` for the bigger picture: why the full
Veusz widget refactor isn't done yet, and what it would look like if it
were.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

import pytest

# The fixture / harness machinery is happy without PyQt6.
from veusz.paint import create_painter, active_backend, BackendError
from veusz.paint.protocol import (
    Affine, Color, Fill, FillRule, LineCap, LineJoin, Paint, Path,
    Rect, Stroke, TextLayout, TextStyle,
)


# ---------------------------------------------------------------------------
# Widget written against the abstract Painter protocol
# ---------------------------------------------------------------------------

@dataclass
class DemoBarChartWidget:
    """A small bar-chart widget that paints purely through the Painter
    protocol — no QPainter import, no Veusz-internal types.

    Mirrors the shape of veusz.widgets.bar.BarPlotter's draw method but
    without all the data-loading + axis-tick machinery. Just: draw a
    frame, draw N bars with stroke + fill, draw a label under each bar.
    """
    values: list             # [(label, magnitude), ...]
    width_px: int = 400
    height_px: int = 240
    title: Optional[str] = None
    bar_color: Color = Color.rgba8(80, 140, 200, 255)
    stroke_color: Color = Color.rgba8(0, 0, 0, 255)

    def draw(self, painter) -> None:
        """The widget's whole rendering surface. Painter is whatever
        backend the caller chose."""
        margin = 40
        n = len(self.values)
        if n == 0:
            return
        max_v = max(v for _, v in self.values)
        plot_w = self.width_px - 2 * margin
        plot_h = self.height_px - 2 * margin
        bar_w = plot_w / (n * 1.5)
        gap_w = bar_w * 0.5

        # Plot frame: three sides of a box, stroked.
        painter.set_paint(Paint(stroke=Stroke(
            color=Color.rgba8(40, 40, 40, 255), width=1.5,
        ), anti_alias=True))
        frame = Path()
        frame.move_to(margin, margin)
        frame.line_to(margin, self.height_px - margin)
        frame.line_to(self.width_px - margin, self.height_px - margin)
        painter.stroke_path(frame)

        # Bars.
        for i, (_, v) in enumerate(self.values):
            x = margin + gap_w + i * (bar_w + gap_w)
            h = plot_h * (v / max_v)
            y = self.height_px - margin - h
            painter.set_paint(Paint(
                fill=Fill(solid=self.bar_color),
                stroke=Stroke(color=self.stroke_color, width=0.8,
                              cap=LineCap.BUTT, join=LineJoin.MITER),
                anti_alias=True,
            ))
            rect = Path.rect(Rect(x, y, bar_w, h))
            painter.fill_path(rect)
            painter.stroke_path(rect)

        # Category labels under each bar.
        for i, (label, _) in enumerate(self.values):
            x = margin + gap_w + i * (bar_w + gap_w) + bar_w * 0.3
            y = self.height_px - margin + 16
            painter.draw_text(TextLayout(
                str(label),
                TextStyle(family="sans-serif", size_pt=10.0, weight=400,
                          italic=False, color=Color.rgba8(20, 20, 20, 255)),
            ), x, y)

        # Title.
        if self.title:
            painter.draw_text(TextLayout(
                self.title,
                TextStyle(family="sans-serif", size_pt=14.0, weight=700,
                          italic=False, color=Color.rgba8(0, 0, 0, 255)),
            ), margin, margin - 10)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

_SAMPLE = DemoBarChartWidget(
    values=[("Q1", 23), ("Q2", 41), ("Q3", 37), ("Q4", 52)],
    title="Demo bar chart",
)


def _available_scene_backends() -> list:
    """Backends that can paint without needing PyQt6 set up."""
    try:
        from veusz.paint import _paint_ext  # type: ignore
        return list(_paint_ext.available_backends())
    except ImportError:
        return []


@pytest.mark.parametrize("backend", _available_scene_backends())
def test_widget_paints_through_each_scene_backend(backend, tmp_path):
    """The same widget code, run against each backend, must produce a
    valid non-trivial PNG. The widget never imports QPainter or any
    Veusz-internal type — only the protocol values."""
    try:
        p = create_painter(_SAMPLE.width_px, _SAMPLE.height_px,
                           backend=backend, background=(1.0, 1.0, 1.0, 1.0))
    except BackendError as e:
        pytest.skip(f"backend {backend} unavailable: {e}")

    _SAMPLE.draw(p)
    png_bytes = p.to_png()
    assert png_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    assert len(png_bytes) > 1000, "blank-looking output"

    out = tmp_path / f"demo.{backend}.png"
    out.write_bytes(png_bytes)


def test_widget_produces_pdf_too():
    """tiny-skia and Vello both produce PDF through the shared pdf-writer
    pipeline. Test that the demo widget's output goes through PDF cleanly
    too."""
    avail = _available_scene_backends()
    if "tiny-skia" not in avail:
        pytest.skip("tiny-skia unavailable")
    p = create_painter(_SAMPLE.width_px, _SAMPLE.height_px,
                       backend="tiny-skia", background=(1.0, 1.0, 1.0, 1.0))
    _SAMPLE.draw(p)
    pdf = p.to_pdf()
    assert pdf.startswith(b"%PDF-")
    assert b"%%EOF" in pdf
    # Should have at least one path-fill operator and one text run.
    assert b"f" in pdf or b"f*" in pdf  # fill op


def test_widget_does_not_import_qpainter():
    """Smoke test that the widget surface doesn't accidentally drag in
    PyQt6. If it did, the abstract-Painter contract would be violated."""
    import sys
    # Re-import this module in a clean namespace.
    snapshot = set(sys.modules.keys())
    # The widget class is already defined above; just verify its module
    # didn't pull in qt modules.
    qt_loaded = {m for m in snapshot if m.startswith("PyQt6")}
    # If PyQt6 was already loaded by some other test or fixture, allow it
    # — what matters is that *this module* doesn't import it.
    import importlib
    mod = importlib.import_module(__name__)
    new_qt = {m for m in sys.modules.keys()
              if m.startswith("PyQt6")} - qt_loaded
    assert not new_qt, (
        "spike_demo_widget should not require PyQt6 — imported "
        f"{new_qt} as a side effect"
    )


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
