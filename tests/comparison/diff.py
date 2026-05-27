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


def _band(psnr: Optional[float], identical: float, within: float,
          ssim: Optional[float] = None,
          ssim_identical: float = 0.999, ssim_within: float = 0.97) -> str:
    """Combined PSNR + SSIM band classification.

    A diff is "identical" if PSNR ≥ identical OR SSIM ≥ ssim_identical
    (allows two near-perfect renders to land in the green band even when
    a few edge-AA pixels drag PSNR down).

    A diff is "within" if PSNR ≥ within OR SSIM ≥ ssim_within (lets
    structurally-similar renders pass even when concentrated edge errors
    knock the PSNR down).

    Otherwise "material" — visual structure differs and should be triaged.
    """
    if psnr is None:
        return "unknown"
    if psnr == float("inf") or psnr >= identical:
        return "identical"
    if ssim is not None and ssim >= ssim_identical:
        return "identical"
    if psnr >= within:
        return "within"
    if ssim is not None and ssim >= ssim_within:
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

    result.band = _band(result.psnr_db, identical_db, within_db, ssim=result.ssim)

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


# ---------------------------------------------------------------------------
# PDF diff: rasterise via Ghostscript, then run PSNR/SSIM as for PNGs.
# ---------------------------------------------------------------------------

def _gs_available() -> bool:
    import shutil
    return shutil.which("gs") is not None


def _pdf_to_png(pdf_path: Path, dpi: int = 96) -> Optional[Path]:
    """Rasterise ``pdf_path`` to a sibling PNG via Ghostscript. Returns
    the PNG path on success, None on failure. Cached: re-rasterises only
    if the PNG is missing or older than the PDF."""
    out = pdf_path.with_suffix(".gs.png")
    try:
        if (out.exists()
                and out.stat().st_mtime >= pdf_path.stat().st_mtime):
            return out
    except OSError:
        pass
    import subprocess
    try:
        subprocess.run(
            ["gs", "-sDEVICE=png16m", f"-r{dpi}", "-dNOPAUSE", "-dBATCH",
             f"-sOutputFile={out}", str(pdf_path)],
            check=True, capture_output=True, timeout=60,
        )
        return out if out.exists() else None
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None


def diff_pdfs(a_path: Path, b_path: Path,
              identical_db: float = 50.0,
              within_db: float = 35.0,
              diff_out: Optional[Path] = None,
              dpi: int = 96) -> DiffResult:
    """Diff two PDFs by rasterising each via Ghostscript at ``dpi`` and
    running PSNR/SSIM on the resulting bitmaps."""
    result = DiffResult(a_path=str(a_path), b_path=str(b_path))
    if not _gs_available():
        result.error = "ghostscript not available — PDF diff skipped"
        return result
    a_png = _pdf_to_png(a_path, dpi=dpi)
    b_png = _pdf_to_png(b_path, dpi=dpi)
    if a_png is None or b_png is None:
        result.error = "PDF rasterisation failed"
        return result
    # Off-by-one in MediaBox dimensions between QPainter's PDF export
    # (rounds-via-inches) and pdf-writer (page-pt direct) is common and
    # not a real difference. Crop both to a common size before delegating.
    try:
        import numpy as np
        from PIL import Image as _Image
        ai = np.asarray(_Image.open(a_png).convert("RGBA"))
        bi = np.asarray(_Image.open(b_png).convert("RGBA"))
        if ai.shape != bi.shape and abs(ai.shape[0] - bi.shape[0]) <= 2 \
                and abs(ai.shape[1] - bi.shape[1]) <= 2:
            h = min(ai.shape[0], bi.shape[0])
            w = min(ai.shape[1], bi.shape[1])
            ai = ai[:h, :w]
            bi = bi[:h, :w]
            # write back the cropped PNGs so diff_pngs sees same dims
            _Image.fromarray(ai, "RGBA").save(a_png)
            _Image.fromarray(bi, "RGBA").save(b_png)
    except Exception:
        # fall through — diff_pngs will report shape mismatch if it persists
        pass
    pdf_result = diff_pngs(a_png, b_png,
                           identical_db=identical_db,
                           within_db=within_db,
                           diff_out=diff_out)
    # Override paths so the result reports the original PDF inputs.
    pdf_result.a_path = str(a_path)
    pdf_result.b_path = str(b_path)
    return pdf_result


def pdf_compare_pairs(report_dir: Path, backends: list,
                      identical_db: float = 50.0,
                      within_db: float = 35.0,
                      dpi: int = 96) -> dict:
    """As :func:`render_compare_pairs` but for PDF outputs."""
    from collections import defaultdict
    by_stem = defaultdict(dict)
    for pdf in report_dir.glob("*.pdf"):
        try:
            stem, backend = pdf.stem.rsplit(".", 1)
        except ValueError:
            continue
        if backend in backends:
            by_stem[stem][backend] = pdf

    out = {}
    for stem, paths in by_stem.items():
        pair_results = []
        names = sorted(paths.keys())
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                diff_out = report_dir / f"{stem}.{a}-vs-{b}.pdf.diff.png"
                pair_results.append(diff_pdfs(
                    paths[a], paths[b],
                    identical_db=identical_db,
                    within_db=within_db,
                    diff_out=diff_out,
                    dpi=dpi,
                ).__dict__)
        out[stem] = pair_results
    return out


# ---------------------------------------------------------------------------
# SVG diff: rasterise via rsvg-convert (or Inkscape), then run PSNR/SSIM as
# for PNGs. Mirrors the PDF path, just with a different rasteriser.
# ---------------------------------------------------------------------------

def _svg_rasteriser():
    """Detect a working SVG rasteriser and return a function that takes
    ``(svg_path, png_path, dpi) -> bool``. Tries rsvg-convert first (the
    typical Linux librsvg2-bin tool), then Inkscape. Returns ``None`` if
    neither is installed."""
    import shutil
    import subprocess

    if shutil.which("rsvg-convert"):
        def _rasterise_rsvg(svg_path: Path, png_path: Path, dpi: int) -> bool:
            try:
                subprocess.run(
                    ["rsvg-convert", "-d", str(dpi), "-p", str(dpi),
                     "-o", str(png_path), str(svg_path)],
                    check=True, capture_output=True, timeout=60,
                )
                return png_path.exists()
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
                return False
        return _rasterise_rsvg

    if shutil.which("inkscape"):
        def _rasterise_inkscape(svg_path: Path, png_path: Path, dpi: int) -> bool:
            try:
                subprocess.run(
                    ["inkscape", f"--export-dpi={dpi}",
                     f"--export-filename={png_path}", str(svg_path)],
                    check=True, capture_output=True, timeout=60,
                )
                return png_path.exists()
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
                return False
        return _rasterise_inkscape

    return None


# Probe once at module load so callers see a stable answer; the harness
# can gracefully skip SVG diffs in environments without a rasteriser.
_SVG_RASTERISER = _svg_rasteriser()


def _svg_to_png(svg_path: Path, dpi: int = 96) -> Optional[Path]:
    """Rasterise ``svg_path`` to a sibling PNG via the detected rasteriser.
    Returns the PNG path on success, None on failure. Cached: re-rasterises
    only if the PNG is missing or older than the SVG."""
    if _SVG_RASTERISER is None:
        return None
    out = svg_path.with_suffix(".rsvg.png")
    try:
        if (out.exists()
                and out.stat().st_mtime >= svg_path.stat().st_mtime):
            return out
    except OSError:
        pass
    if _SVG_RASTERISER(svg_path, out, dpi):
        return out
    return None


def diff_svgs(a_path: Path, b_path: Path,
              identical_db: float = 50.0,
              within_db: float = 35.0,
              diff_out: Optional[Path] = None,
              dpi: int = 96) -> DiffResult:
    """Diff two SVGs by rasterising each at ``dpi`` and running PSNR/SSIM
    on the resulting bitmaps. Skips with an error tag if no SVG rasteriser
    is installed."""
    result = DiffResult(a_path=str(a_path), b_path=str(b_path))
    if _SVG_RASTERISER is None:
        result.error = ("no SVG rasteriser available "
                        "(install librsvg2-bin or inkscape) — SVG diff skipped")
        return result
    a_png = _svg_to_png(a_path, dpi=dpi)
    b_png = _svg_to_png(b_path, dpi=dpi)
    if a_png is None or b_png is None:
        result.error = "SVG rasterisation failed"
        return result
    # Off-by-one in viewport sizes between rasterisers is common; crop both
    # to a common size before delegating (same trick as diff_pdfs).
    try:
        import numpy as np
        from PIL import Image as _Image
        ai = np.asarray(_Image.open(a_png).convert("RGBA"))
        bi = np.asarray(_Image.open(b_png).convert("RGBA"))
        if ai.shape != bi.shape and abs(ai.shape[0] - bi.shape[0]) <= 2 \
                and abs(ai.shape[1] - bi.shape[1]) <= 2:
            h = min(ai.shape[0], bi.shape[0])
            w = min(ai.shape[1], bi.shape[1])
            ai = ai[:h, :w]
            bi = bi[:h, :w]
            _Image.fromarray(ai, "RGBA").save(a_png)
            _Image.fromarray(bi, "RGBA").save(b_png)
    except Exception:
        pass
    svg_result = diff_pngs(a_png, b_png,
                           identical_db=identical_db,
                           within_db=within_db,
                           diff_out=diff_out)
    svg_result.a_path = str(a_path)
    svg_result.b_path = str(b_path)
    return svg_result


def svg_compare_pairs(report_dir: Path, backends: list,
                      identical_db: float = 50.0,
                      within_db: float = 35.0,
                      dpi: int = 96) -> dict:
    """As :func:`pdf_compare_pairs` but for SVG outputs."""
    from collections import defaultdict
    by_stem = defaultdict(dict)
    for svg in report_dir.glob("*.svg"):
        try:
            stem, backend = svg.stem.rsplit(".", 1)
        except ValueError:
            continue
        if backend in backends:
            by_stem[stem][backend] = svg

    out = {}
    for stem, paths in by_stem.items():
        pair_results = []
        names = sorted(paths.keys())
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                diff_out = report_dir / f"{stem}.{a}-vs-{b}.svg.diff.png"
                pair_results.append(diff_svgs(
                    paths[a], paths[b],
                    identical_db=identical_db,
                    within_db=within_db,
                    diff_out=diff_out,
                    dpi=dpi,
                ).__dict__)
        out[stem] = pair_results
    return out
