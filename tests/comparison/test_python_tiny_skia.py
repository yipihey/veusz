"""End-to-end tests for the Python -> tiny-skia path.

Requires the ``veusz.paint._paint_ext`` Rust extension to be built.
Skips cleanly if the extension is missing so the rest of the suite still
runs in CI environments that don't have Cargo.
"""

from __future__ import annotations

import json
from pathlib import Path as FsPath

import pytest

pytest.importorskip("PIL")
import numpy as np
from PIL import Image as PilImage

# Skip the whole module if the Rust extension is not available.
ext = pytest.importorskip("veusz.paint._paint_ext")

from veusz.paint import create_painter, active_backend  # noqa: E402
from veusz.paint.protocol import (  # noqa: E402
    Affine, Color, Fill, FillRule, LineCap, LineJoin, Paint, Path, Rect,
    Stroke,
)
from veusz.paint.scene_recorder import PythonSceneRecorder  # noqa: E402


def _png_to_rgba(buf: bytes) -> np.ndarray:
    import io
    return np.asarray(PilImage.open(io.BytesIO(buf)).convert("RGBA"))


def test_extension_reports_tiny_skia_available():
    assert "tiny-skia" in ext.available_backends()
    assert ext.__version__


def test_empty_scene_renders_to_solid_background():
    p = create_painter(8, 8, backend="tiny-skia",
                       background=(0.5, 0.5, 0.5, 1.0))
    p.finish()
    arr = _png_to_rgba(p.png_bytes)
    assert arr.shape == (8, 8, 4)
    # 0.5 -> 128 (give or take rounding); all pixels uniform.
    assert 125 <= arr[..., 0].min() <= 130
    assert arr[..., 0].std() < 1.0


def test_filled_rect_lands_in_pixels():
    p = create_painter(32, 32, backend="tiny-skia",
                       background=(1.0, 1.0, 1.0, 1.0))
    p.set_paint(Paint(fill=Fill(solid=Color.rgba8(255, 0, 0, 255)),
                      anti_alias=False))
    p.fill_path(Path.rect(Rect(8, 8, 16, 16)))
    p.finish()
    arr = _png_to_rgba(p.png_bytes)
    # center pixel red
    assert tuple(arr[16, 16]) == (255, 0, 0, 255)
    # corner still white
    assert tuple(arr[0, 0]) == (255, 255, 255, 255)


def test_stroke_and_fill_one_path_no_state_leak():
    p = create_painter(32, 32, backend="tiny-skia",
                       background=(1.0, 1.0, 1.0, 1.0))
    paint = Paint(
        fill=Fill(solid=Color.rgba8(0, 255, 0, 255)),
        stroke=Stroke(color=Color.rgba8(0, 0, 0, 255), width=2.0,
                      cap=LineCap.BUTT, join=LineJoin.MITER),
        anti_alias=False,
    )
    p.set_paint(paint)
    r = Path.rect(Rect(8, 8, 16, 16))
    p.fill_path(r)
    p.stroke_path(r)
    p.finish()
    arr = _png_to_rgba(p.png_bytes)
    # inside the rect, well away from the stroke -> green
    assert tuple(arr[15, 15]) == (0, 255, 0, 255)
    # outside, untouched -> white
    assert tuple(arr[2, 2]) == (255, 255, 255, 255)


def test_save_restore_clip_unwinds():
    p = create_painter(16, 16, backend="tiny-skia",
                       background=(1.0, 1.0, 1.0, 1.0))
    p.save()
    p.push_clip_rect(Rect(0, 0, 8, 8))
    p.set_paint(Paint(fill=Fill(solid=Color.rgba8(0, 0, 0, 255)),
                      anti_alias=False))
    p.fill_path(Path.rect(Rect(0, 0, 16, 16)))
    p.pop_clip()
    p.restore()
    # Now paint a red rect everywhere; restored state should NOT still have the clip.
    p.set_paint(Paint(fill=Fill(solid=Color.rgba8(255, 0, 0, 128)),
                      anti_alias=False))
    p.fill_path(Path.rect(Rect(12, 12, 4, 4)))
    p.finish()
    arr = _png_to_rgba(p.png_bytes)
    # inside the original clip and original paint -> black
    assert tuple(arr[2, 2]) == (0, 0, 0, 255)
    # outside the clip but where red was painted after restore -> red blended on white
    px = arr[14, 14]
    assert px[0] > 200 and px[1] < 200 and px[2] < 200


def test_scene_json_matches_summary_via_extension():
    rec = PythonSceneRecorder()
    rec.set_paint(Paint(fill=Fill(solid=Color(1, 0, 0, 1)), anti_alias=True))
    rec.fill_path(Path.rect(Rect(0, 0, 4, 4)))
    rec.save()
    rec.draw_text  # presence check
    rec.restore()
    summary = json.loads(ext.scene_summary_json(rec.to_json()))
    assert summary["paths_filled"] == 1
    assert summary["saves"] == 1
    assert summary["restores"] == 1
    assert summary["total_ops"] == 4  # set_paint, fill_path, save, restore


def test_active_backend_env_var(monkeypatch):
    monkeypatch.setenv("VEUSZ_PAINT_BACKEND", "tiny-skia")
    assert active_backend() == "tiny-skia"
    monkeypatch.setenv("VEUSZ_PAINT_BACKEND", "qt")
    assert active_backend() == "qt"


def test_unknown_backend_raises(monkeypatch):
    monkeypatch.setenv("VEUSZ_PAINT_BACKEND", "frobnicate")
    from veusz.paint.factory import BackendError
    with pytest.raises(BackendError):
        active_backend()


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
