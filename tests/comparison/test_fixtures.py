"""Tests against pre-recorded scene fixtures.

Fixtures live in ``tests/comparison/fixtures/`` as ``*.scene.json`` files —
the JSON shape consumed by the Rust extension's ``render_scene_to_png`` /
``render_scene_to_pdf_bytes``. They exist so CI exercises the full
rendering pipeline (tiny-skia, pdf-writer, diff math) without needing
PyQt6 / Veusz installed.

Regenerate with ``scripts/regen_scene_fixtures.py``.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

pytest.importorskip("PIL")
import numpy as np
from PIL import Image as PilImage

ext = pytest.importorskip("veusz.paint._paint_ext")

import sys
sys.path.insert(0, str(Path(__file__).parent))
from veusz_render_compare import render_scene_fixture  # noqa: E402
from diff import diff_pngs  # noqa: E402

FIXTURES = Path(__file__).parent / "fixtures"


def _all_fixtures():
    if not FIXTURES.exists():
        return []
    return sorted(FIXTURES.glob("*.scene.json"))


@pytest.mark.parametrize("scene_path", _all_fixtures(),
                         ids=lambda p: p.stem.replace(".scene", ""))
def test_fixture_renders_to_png_and_pdf(scene_path, tmp_path):
    scene_json = scene_path.read_bytes()
    stem = scene_path.stem.replace(".scene", "")
    res = render_scene_fixture(scene_json, stem, "tiny-skia",
                                tmp_path, width_px=400, height_px=240)
    assert res.error is None, res.error
    assert res.png and res.png.exists()
    assert res.pdf and res.pdf.exists()

    # PNG opens and has the right size.
    arr = np.asarray(PilImage.open(res.png).convert("RGBA"))
    assert arr.shape == (240, 400, 4)
    # Background is white (we asked for (1, 1, 1, 1)), so at least the
    # corners should be white.
    assert tuple(arr[0, 0]) == (255, 255, 255, 255)

    # PDF starts with the right magic.
    pdf = res.pdf.read_bytes()
    assert pdf.startswith(b"%PDF-")
    assert b"%%EOF" in pdf


@pytest.mark.parametrize("scene_path", _all_fixtures(),
                         ids=lambda p: p.stem.replace(".scene", ""))
def test_fixture_render_is_deterministic(scene_path, tmp_path):
    """Same scene -> same PNG bytes. Critical for CI snapshot diffs."""
    scene_json = scene_path.read_bytes()
    stem = scene_path.stem.replace(".scene", "")

    out_a = tmp_path / "a"
    out_b = tmp_path / "b"
    out_a.mkdir(); out_b.mkdir()

    res_a = render_scene_fixture(scene_json, stem, "tiny-skia",
                                  out_a, width_px=400, height_px=240)
    res_b = render_scene_fixture(scene_json, stem, "tiny-skia",
                                  out_b, width_px=400, height_px=240)
    assert res_a.error is None and res_b.error is None
    assert res_a.png.read_bytes() == res_b.png.read_bytes(), \
        "tiny-skia output must be bit-identical across runs (CI snapshot determinism)"


def test_synthetic_plot_fixture_has_expected_summary():
    """Sanity-check the canonical fixture: the right kinds of ops are present."""
    p = FIXTURES / "synthetic_plot.scene.json"
    if not p.exists():
        pytest.skip("synthetic_plot fixture missing — regenerate")
    summary = json.loads(ext.scene_summary_json(p.read_bytes()))
    assert summary["paths_filled"] >= 3   # at least the bars
    assert summary["paths_stroked"] >= 5  # frame + ticks + curve
    assert summary["clips_pushed"] >= 1   # the rotated-square clip
    assert summary["text_runs"] >= 1


def test_fixture_vs_itself_is_identical(tmp_path):
    """The diff harness reports PSNR=inf when the same scene is rendered twice."""
    p = FIXTURES / "synthetic_plot.scene.json"
    if not p.exists():
        pytest.skip("synthetic_plot fixture missing — regenerate")
    scene_json = p.read_bytes()

    a = tmp_path / "a"; a.mkdir()
    b = tmp_path / "b"; b.mkdir()
    render_scene_fixture(scene_json, "synth", "tiny-skia",
                          a, width_px=400, height_px=240)
    render_scene_fixture(scene_json, "synth", "tiny-skia",
                          b, width_px=400, height_px=240)
    import math
    d = diff_pngs(a / "synth.tiny-skia.png", b / "synth.tiny-skia.png")
    assert d.error is None
    assert math.isinf(d.psnr_db), \
        f"deterministic render of identical scene yielded PSNR {d.psnr_db}"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
