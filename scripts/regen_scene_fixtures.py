#!/usr/bin/env python3
"""Regenerate canonical scene fixtures under tests/comparison/fixtures/.

These fixtures are small, deterministic, hand-authored scenes that look
like real Veusz plot output. They drive the CI tests in
``tests/comparison/test_fixtures.py`` without needing PyQt6 or a real
Veusz install — those need a real dev environment.

Once the harness has been run against the corpus in a PyQt6 env with
``--keep-scene``, you can also drop the resulting ``*.scene.json`` files
into ``tests/comparison/fixtures/`` to get real-document regression
coverage.

Usage::

    python3 scripts/regen_scene_fixtures.py
"""

from __future__ import annotations

import math
import sys
from pathlib import Path as FsPath

# Make veusz importable when running this script from the repo root.
sys.path.insert(0, str(FsPath(__file__).resolve().parent.parent))

from veusz.paint.scene_recorder import PythonSceneRecorder
from veusz.paint.protocol import (
    Affine, Color, Fill, GradientStop, LineCap, LineJoin, LinearGradient,
    Paint, Path, Rect, Stroke, TextLayout, TextStyle,
)

FIXTURES = FsPath(__file__).resolve().parent.parent / "tests" / "comparison" / "fixtures"


def synthetic_plot() -> bytes:
    """A scene that exercises every Painter op the audit highlighted as core:
    stroke + fill paths, gradients, transforms, clipping, text placeholder."""
    rec = PythonSceneRecorder()

    # plot frame
    rec.set_paint(Paint(stroke=Stroke(color=Color.rgba8(50, 50, 50, 255), width=1.0),
                        anti_alias=True))
    p = Path()
    p.move_to(40, 40); p.line_to(40, 200); p.line_to(360, 200)
    rec.stroke_path(p)

    # axis tick marks
    for x in [80, 120, 160, 200, 240, 280, 320]:
        t = Path()
        t.move_to(x, 200); t.line_to(x, 204)
        rec.stroke_path(t)

    # three bars
    for i, (col, h) in enumerate([((255, 200, 100, 255), 50),
                                   ((100, 200, 100, 255), 110),
                                   ((100, 150, 255, 255), 80)]):
        rec.set_paint(Paint(
            fill=Fill(solid=Color.rgba8(*col)),
            stroke=Stroke(color=Color.rgba8(0, 0, 0, 255), width=0.8),
            anti_alias=True,
        ))
        r = Path.rect(Rect(70 + i * 90, 200 - h, 70, h))
        rec.fill_path(r); rec.stroke_path(r)

    # smooth curve
    rec.set_paint(Paint(
        stroke=Stroke(color=Color.rgba8(200, 50, 50, 255), width=2.0,
                      cap=LineCap.ROUND, join=LineJoin.ROUND),
        anti_alias=True,
    ))
    curve = Path()
    for i in range(80):
        x = 40 + i * 4
        y = 120 - 30 * math.sin(i * 0.15)
        if i == 0: curve.move_to(x, y)
        else:      curve.line_to(x, y)
    rec.stroke_path(curve)

    # gradient banner
    rec.set_paint(Paint(
        fill=Fill(linear=LinearGradient(
            start=(40, 10), end=(360, 10),
            stops=(GradientStop(0.0, Color.rgba8(255, 255, 200, 255)),
                   GradientStop(1.0, Color.rgba8(150, 100, 255, 255))),
        )),
        anti_alias=True,
    ))
    rec.fill_path(Path.rect(Rect(40, 10, 320, 14)))

    # rotated, clipped square
    rec.save()
    rec.push_clip_rect(Rect(285, 25, 70, 60))
    rec.concat_transform(Affine.translate(320, 55))
    ang = math.pi / 5
    c, s = math.cos(ang), math.sin(ang)
    rec.concat_transform(Affine(c, s, -s, c, 0, 0))
    rec.concat_transform(Affine.translate(-15, -15))
    rec.set_paint(Paint(fill=Fill(solid=Color.rgba8(100, 100, 100, 200)),
                        anti_alias=True))
    rec.fill_path(Path.rect(Rect(0, 0, 30, 30)))
    rec.restore()

    # text placeholder
    rec.draw_text(TextLayout(
        "Synthetic Plot Fixture",
        TextStyle(size_pt=12.0, family="sans-serif",
                  color=Color.rgba8(0, 0, 0, 255)),
    ), 60, 230)

    return rec.to_json()


FIXTURE_GENERATORS = {
    "synthetic_plot.scene.json": synthetic_plot,
}


def main() -> int:
    FIXTURES.mkdir(parents=True, exist_ok=True)
    for name, generator in FIXTURE_GENERATORS.items():
        path = FIXTURES / name
        data = generator()
        path.write_bytes(data)
        print(f"wrote {path}: {len(data)} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
