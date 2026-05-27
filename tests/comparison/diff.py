"""Per-pixel diff math for the comparison harness.

Optional dependencies (``pillow`` and ``numpy``) — both ship in Veusz's
existing dev-tools stack. If either is missing, :func:`diff_pngs` returns a
non-fatal placeholder so the harness can still run trace collection and
single-backend rendering without them.

The tolerance bands in ``manifest.toml`` are interpreted here:

* PSNR >= ``tolerance.identical``  -> ``"identical"``  (green)
* PSNR >= ``tolerance.within``     -> ``"within"``     (yellow)
* otherwise                        -> ``"material"``   (red)

See ``docs/parallel-paint-backends-plan.md`` §10.4.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class DiffResult:
    a_path: str
    b_path: str
    width: int = 0
    height: int = 0
    pixels_total: int = 0
    pixels_diff: int = 0
    max_channel_delta: int = 0
    psnr_db: Optional[float] = None
    ssim: Optional[float] = None
    band: str = "unknown"
    error: Optional[str] = None
    diff_png: Optional[str] = None  # path to a side-by-side diff visualisation


def _band(psnr: Optional[float], identical: float, within: float) -> str:
    if psnr is None:
        return "unknown"
    if psnr == float("inf") or psnr >= identical:
        return "identical"
    if psnr >= within:
        return "within"
    return "material"


def diff_pngs(a_path: Path, b_path: Path,
              identical_db: float = 50.0,
              within_db: float = 35.0,
              diff_out: Optional[Path] = None) -> DiffResult:
    """Compare two PNGs and return a :class:`DiffResult`.

    Both images must have the same dimensions. The function loads both as
    RGBA8 numpy arrays, computes per-channel L1 stats, PSNR over MSE, and
    (optionally) a coarse SSIM proxy. ``diff_out``, if given, receives a
    diff visualisation: ``|a - b|`` boosted to be visible, with full-opacity
    differences shown in magenta.
    """
    result = DiffResult(a_path=str(a_path), b_path=str(b_path))
    try:
        import numpy as np
        from PIL import Image
    except ImportError as exc:
        result.error = f"missing optional dep: {exc.name}"
        return result

    try:
        a_img = np.asarray(Image.open(a_path).convert("RGBA"))
        b_img = np.asarray(Image.open(b_path).convert("RGBA"))
    except Exception as exc:
        result.error = f"read failed: {exc}"
        return result

    if a_img.shape != b_img.shape:
        result.error = f"shape mismatch: {a_img.shape} vs {b_img.shape}"
        return result

    h, w = a_img.shape[:2]
    result.width, result.height = w, h
    result.pixels_total = w * h

    delta = a_img.astype(np.int16) - b_img.astype(np.int16)
    abs_delta = np.abs(delta).astype(np.uint8)
    result.max_channel_delta = int(abs_delta.max())
    # A pixel is "different" if any channel differs.
    result.pixels_diff = int((abs_delta.sum(axis=2) > 0).sum())

    # PSNR over RGB only — alpha differences can dominate AA edges.
    mse = float(((a_img[..., :3].astype(np.float64) - b_img[..., :3].astype(np.float64)) ** 2).mean())
    if mse == 0.0:
        result.psnr_db = float("inf")
    else:
        result.psnr_db = 10.0 * math.log10(255.0 * 255.0 / mse)

    # A 1-channel SSIM proxy: cheap luminance correlation. Real SSIM with a
    # gaussian window is overkill for the green/yellow/red triage we care
    # about; we add it later if a borderline case demands it.
    luma_a = 0.299 * a_img[..., 0] + 0.587 * a_img[..., 1] + 0.114 * a_img[..., 2]
    luma_b = 0.299 * b_img[..., 0] + 0.587 * b_img[..., 1] + 0.114 * b_img[..., 2]
    if luma_a.std() > 0 and luma_b.std() > 0:
        result.ssim = float(np.corrcoef(luma_a.ravel(), luma_b.ravel())[0, 1])

    result.band = _band(result.psnr_db, identical_db, within_db)

    if diff_out is not None:
        # Visualise the diff: magenta where a and b differ, transparent
        # elsewhere. Boost to make sub-pixel differences visible.
        vis = np.zeros((h, w, 4), dtype=np.uint8)
        any_diff = (abs_delta.sum(axis=2) > 0)
        vis[..., 0] = 255 * any_diff
        vis[..., 2] = 255 * any_diff
        # Modulate alpha by the magnitude of the difference (boosted x16).
        vis[..., 3] = np.clip(abs_delta.max(axis=2) * 16, 0, 255)
        Image.fromarray(vis, mode="RGBA").save(diff_out)
        result.diff_png = str(diff_out)

    return result


def render_compare_pairs(report_dir: Path, backends: list,
                         identical_db: float = 50.0,
                         within_db: float = 35.0) -> dict:
    """Find PNG outputs in ``report_dir`` and diff every backend pair.

    Returns a dict keyed by input stem -> list of pair diffs. Writes
    ``{stem}.{a}-vs-{b}.diff.png`` for each comparable pair.
    """
    from collections import defaultdict

    by_stem = defaultdict(dict)
    for png in report_dir.glob("*.png"):
        # name convention: {stem}.{backend}.png
        if png.name.endswith(".diff.png"):
            continue
        try:
            stem, backend = png.stem.rsplit(".", 1)
        except ValueError:
            continue
        if backend in backends:
            by_stem[stem][backend] = png

    out = {}
    for stem, paths in by_stem.items():
        pair_results = []
        names = sorted(paths.keys())
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                diff_out = report_dir / f"{stem}.{a}-vs-{b}.diff.png"
                pair_results.append(diff_pngs(
                    paths[a], paths[b],
                    identical_db=identical_db,
                    within_db=within_db,
                    diff_out=diff_out,
                ).__dict__)
        out[stem] = pair_results
    return out
