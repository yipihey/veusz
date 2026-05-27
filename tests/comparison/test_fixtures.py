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


def _backends_for_test():
    """Backends to run fixture tests against. Vello requires a working
    wgpu adapter; we probe via available_backends so CI runners without
    Vulkan/Metal/DX12 silently skip Vello."""
    available = list(ext.available_backends())
    return [b for b in ("tiny-skia", "vello") if b in available]


@pytest.mark.parametrize("backend", _backends_for_test())
@pytest.mark.parametrize("scene_path", _all_fixtures(),
                         ids=lambda p: p.stem.replace(".scene", ""))
def test_fixture_renders_to_png_and_pdf(scene_path, backend, tmp_path):
    scene_json = scene_path.read_bytes()
    stem = scene_path.stem.replace(".scene", "")
    res = render_scene_fixture(scene_json, stem, backend,
                                tmp_path, width_px=400, height_px=240)
    assert res.error is None, res.error
    assert res.png and res.png.exists()
    assert res.pdf and res.pdf.exists()

    arr = np.asarray(PilImage.open(res.png).convert("RGBA"))
    assert arr.shape == (240, 400, 4)
    assert tuple(arr[0, 0]) == (255, 255, 255, 255)

    pdf = res.pdf.read_bytes()
    assert pdf.startswith(b"%PDF-")
    assert b"%%EOF" in pdf


@pytest.mark.parametrize("backend", _backends_for_test())
@pytest.mark.parametrize("scene_path", _all_fixtures(),
                         ids=lambda p: p.stem.replace(".scene", ""))
def test_fixture_render_is_deterministic(scene_path, backend, tmp_path):
    """Same scene + same backend -> visually-identical PNG.

    tiny-skia is byte-deterministic. Vello on real GPU (and llvmpipe)
    can vary at the bit level due to compute-pipeline scheduling but
    must still produce visually-equivalent output (PSNR >= 50 dB —
    well into the "identical" tolerance band). Asserts byte-equality
    for tiny-skia and PSNR-equality for Vello.
    """
    scene_json = scene_path.read_bytes()
    stem = scene_path.stem.replace(".scene", "")

    out_a = tmp_path / "a"; out_a.mkdir()
    out_b = tmp_path / "b"; out_b.mkdir()

    res_a = render_scene_fixture(scene_json, stem, backend,
                                  out_a, width_px=400, height_px=240)
    res_b = render_scene_fixture(scene_json, stem, backend,
                                  out_b, width_px=400, height_px=240)
    assert res_a.error is None and res_b.error is None

    if backend == "tiny-skia":
        # Pure CPU rasteriser — should be bit-identical.
        assert res_a.png.read_bytes() == res_b.png.read_bytes(), \
            "tiny-skia output must be bit-identical across runs"
    else:
        # GPU compute pipelines can reorder tile work; assert visual
        # equivalence via PSNR instead.
        import math
        d = diff_pngs(res_a.png, res_b.png)
        assert d.error is None, d.error
        psnr = d.psnr_db
        assert psnr is not None and (math.isinf(psnr) or psnr >= 50.0), \
            f"{backend} renders must match each other within 50 dB; got {psnr}"


def test_tiny_skia_vs_vello_within_tolerance(tmp_path):
    """Cross-backend diff: tiny-skia and Vello render the same scene
    within the harness's 'within tolerance' band (PSNR >= 35 dB).
    Subpixel anti-aliasing differences are expected; structural
    differences would be a regression."""
    if "vello" not in ext.available_backends():
        pytest.skip("vello not available in this build")
    p = FIXTURES / "synthetic_plot.scene.json"
    if not p.exists():
        pytest.skip("synthetic_plot fixture missing")
    scene_json = p.read_bytes()

    out_ts = tmp_path / "ts"; out_ts.mkdir()
    out_v  = tmp_path / "v";  out_v.mkdir()
    render_scene_fixture(scene_json, "synth", "tiny-skia", out_ts, 400, 240)
    render_scene_fixture(scene_json, "synth", "vello",     out_v,  400, 240)

    d = diff_pngs(out_ts / "synth.tiny-skia.png", out_v / "synth.vello.png",
                  identical_db=50.0, within_db=35.0)
    assert d.error is None, d.error
    assert d.psnr_db is not None and d.psnr_db >= 35.0, \
        f"tiny-skia vs vello: PSNR {d.psnr_db} dB is below 'within' threshold"


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
