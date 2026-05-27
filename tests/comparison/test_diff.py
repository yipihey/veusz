"""Unit tests for the comparison harness diff math.

Runs without PyQt6, without Rust, without Veusz. Stdlib + numpy + pillow only.
"""

from __future__ import annotations

import math
import tempfile
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

import sys
sys.path.insert(0, str(Path(__file__).parent))
from diff import diff_pngs, render_compare_pairs, _band  # noqa: E402


@pytest.fixture
def tmp_pngs(tmp_path):
    """Two 32x32 RGBA PNGs: identical baseline + an 8/255-brightness shift."""
    base = np.zeros((32, 32, 4), dtype=np.uint8)
    base[..., :3] = 200
    base[..., 3] = 255
    Image.fromarray(base, "RGBA").save(tmp_path / "a.png")
    Image.fromarray(base, "RGBA").save(tmp_path / "b_identical.png")

    shift = base.copy()
    shift[..., :3] = np.clip(shift[..., :3].astype(int) + 8, 0, 255).astype(np.uint8)
    Image.fromarray(shift, "RGBA").save(tmp_path / "b_shifted.png")
    return tmp_path


def test_identical_inputs_yield_infinite_psnr(tmp_pngs):
    r = diff_pngs(tmp_pngs / "a.png", tmp_pngs / "b_identical.png")
    assert r.error is None
    assert math.isinf(r.psnr_db)
    assert r.pixels_diff == 0
    assert r.max_channel_delta == 0
    assert r.band == "identical"


def test_small_shift_lands_in_material_band(tmp_pngs):
    r = diff_pngs(tmp_pngs / "a.png", tmp_pngs / "b_shifted.png",
                  identical_db=50.0, within_db=35.0)
    assert r.error is None
    assert r.pixels_diff == 32 * 32
    assert r.max_channel_delta == 8
    # 8/255 brightness shift on every pixel: MSE = 64, PSNR ~30 dB.
    assert 29.0 < r.psnr_db < 31.0
    assert r.band == "material"


def test_band_thresholds():
    assert _band(60.0, identical=50.0, within=35.0) == "identical"
    assert _band(50.0, identical=50.0, within=35.0) == "identical"
    assert _band(40.0, identical=50.0, within=35.0) == "within"
    assert _band(34.0, identical=50.0, within=35.0) == "material"
    assert _band(float("inf"), identical=50.0, within=35.0) == "identical"
    assert _band(None, identical=50.0, within=35.0) == "unknown"


def test_shape_mismatch_returns_error(tmp_path):
    a = np.zeros((4, 4, 4), dtype=np.uint8); a[..., 3] = 255
    b = np.zeros((4, 8, 4), dtype=np.uint8); b[..., 3] = 255
    Image.fromarray(a, "RGBA").save(tmp_path / "small.png")
    Image.fromarray(b, "RGBA").save(tmp_path / "wide.png")
    r = diff_pngs(tmp_path / "small.png", tmp_path / "wide.png")
    assert r.error is not None
    assert "shape mismatch" in r.error


def test_diff_visualisation_is_emitted(tmp_pngs):
    out = tmp_pngs / "vis.png"
    diff_pngs(tmp_pngs / "a.png", tmp_pngs / "b_shifted.png", diff_out=out)
    assert out.exists()
    vis = np.asarray(Image.open(out).convert("RGBA"))
    # Magenta channel pair (R, B) should be non-zero where pixels differ.
    assert vis[..., 0].max() > 0
    assert vis[..., 2].max() > 0
    # Green should be zero everywhere.
    assert vis[..., 1].max() == 0


def test_pair_iteration_finds_all_backend_pairs(tmp_pngs):
    # Lay out the files in the {stem}.{backend}.png convention.
    d = tmp_pngs
    Image.fromarray(np.full((32, 32, 4), 255, dtype=np.uint8), "RGBA").save(d / "doc.qt.png")
    Image.fromarray(np.full((32, 32, 4), 255, dtype=np.uint8), "RGBA").save(d / "doc.tiny-skia.png")
    Image.fromarray(np.full((32, 32, 4), 200, dtype=np.uint8), "RGBA").save(d / "doc.vello.png")

    res = render_compare_pairs(d, ["qt", "tiny-skia", "vello"])
    assert "doc" in res
    # 3 backends -> C(3,2) = 3 pairs.
    assert len(res["doc"]) == 3
    bands = {f"{r['a_path'].rsplit('.', 2)[1]} vs {r['b_path'].rsplit('.', 2)[1]}": r["band"]
             for r in res["doc"]}
    assert bands["qt vs tiny-skia"] == "identical"  # both filled with 255
    assert bands["qt vs vello"] == "material"
    assert bands["tiny-skia vs vello"] == "material"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
