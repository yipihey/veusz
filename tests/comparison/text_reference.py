"""Build a side-by-side text rendering reference document.

Five curated .vsz files render through Qt, tiny-skia, and Vello; the
output PNGs are tiled into a single side-by-side reference PNG per
document, then assembled into a single HTML file at
``tests/comparison/text-reference/index.html`` with thumbnails and
links to per-document full-resolution comparisons.

This is the Phase-5 deliverable that lets reviewers sign off on the
"acceptable text rendering difference" between Qt and the new
backends — plan §13 R1 / §14 spike S2.

The fixtures are chosen to cover the four text patterns the audit
shows Veusz documents lean on:

  spectrum.vsz       axis tick labels at small (10-13 pt) sizes
  labels.vsz         large rotated text + math-style subscripts
  barplots.vsz       category labels under bars + key entries
  boxplot.vsz        long axis titles with units
  ternary.vsz        rotated text along three axes

Run:
    QT_QPA_PLATFORM=offscreen python tests/comparison/text_reference.py
Output:
    tests/comparison/text-reference/
        index.html
        spectrum.tile.png
        labels.tile.png
        ...
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUT_DIR = REPO_ROOT / "tests" / "comparison" / "text-reference"

DOCS = [
    ("spectrum", "examples/spectrum.vsz",
     "Axis tick labels — small (10-13 pt) Liberation Sans on linear axes."),
    ("labels", "examples/labels.vsz",
     "Large rotated text + math-style subscripts."),
    ("barplots", "examples/barplots.vsz",
     "Category labels under bars + key entries."),
    ("boxplot", "examples/boxplot.vsz",
     "Long axis titles with units."),
    ("ternary", "examples/ternary.vsz",
     "Rotated text along three axes."),
]


def _render_doc(stem: str, vsz_path: Path, dpi: int = 96) -> dict:
    sys.path.insert(0, str(Path(__file__).parent))
    from veusz_render_compare import render_one, _ensure_veusz_registered
    _ensure_veusz_registered()
    results = {}
    for backend in ("qt", "tiny-skia", "vello"):
        r = render_one(vsz_path, backend, OUT_DIR, dpi=dpi)
        results[backend] = r
    return results


def _build_tile(stem: str, results: dict) -> Path:
    """Tile the three backend PNGs side by side into a single image."""
    from PIL import Image, ImageDraw, ImageFont
    pngs = {b: r.png for b, r in results.items() if r.png and r.png.exists()}
    if len(pngs) != 3:
        return None
    images = {b: Image.open(p).convert("RGBA") for b, p in pngs.items()}
    # All three are the same dimensions — pull width/height from the first.
    w, h = next(iter(images.values())).size
    label_h = 28
    tile = Image.new("RGB", (w * 3 + 8, h + label_h + 4), "white")
    draw = ImageDraw.Draw(tile)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 16)
    except (OSError, IOError):
        font = ImageFont.load_default()
    # Composite each backend's PNG over a white background so transparent
    # pixels (Qt's default) look the way a viewer renders them.
    for i, b in enumerate(("qt", "tiny-skia", "vello")):
        bg = Image.new("RGB", (w, h), "white")
        bg.paste(images[b], mask=images[b].split()[3])
        tile.paste(bg, (i * (w + 4), label_h))
        draw.text((i * (w + 4) + 6, 4), b, fill="black", font=font)
    out = OUT_DIR / f"{stem}.tile.png"
    tile.save(out)
    return out


def _build_index(per_doc: list) -> Path:
    """Build the index.html that links into each tile."""
    html_parts = ['''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Veusz text rendering reference: Qt vs tiny-skia vs Vello</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 1400px; margin: 1.5em auto; padding: 0 1em; }
  h1 { margin-bottom: 0.2em; }
  .meta { color: #666; margin-bottom: 1em; }
  .doc { margin: 2em 0; border-top: 1px solid #ddd; padding-top: 1em; }
  .doc h2 { margin-bottom: 0.2em; }
  .doc .blurb { color: #555; margin-bottom: 0.8em; }
  .tile img { max-width: 100%; height: auto; border: 1px solid #ccc; }
  .legend { display: flex; gap: 1em; margin-top: 0.5em; font-size: 0.9em; color: #555; }
  .legend > span { flex: 1; }
</style>
</head>
<body>
<h1>Veusz text rendering reference</h1>
<p class="meta">Qt (left) vs tiny-skia (middle) vs Vello (right) for five
documents that exercise the text patterns the audit identified. Generated
by <code>tests/comparison/text_reference.py</code>. Composited over white
so transparent backgrounds in Qt's default PNG export render the way a
viewer sees them.</p>
''']
    for stem, blurb, tile in per_doc:
        if tile is None:
            html_parts.append(
                f'<div class="doc"><h2>{stem}</h2><p class="blurb">{blurb}</p>'
                f'<p><em>render missing</em></p></div>')
            continue
        html_parts.append(f'''
<div class="doc">
  <h2>{stem}</h2>
  <p class="blurb">{blurb}</p>
  <div class="tile"><img src="{tile.name}" alt="{stem} tile"></div>
  <div class="legend">
    <span>qt — QPainter via QImage</span>
    <span>tiny-skia — captured Scene -> tiny_skia::Pixmap</span>
    <span>vello — captured Scene -> vello (wgpu)</span>
  </div>
</div>''')
    html_parts.append('</body></html>')
    out = OUT_DIR / "index.html"
    out.write_text("\n".join(html_parts), encoding="utf-8")
    return out


def main() -> int:
    os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    per_doc = []
    for stem, vsz_rel, blurb in DOCS:
        vsz_path = REPO_ROOT / vsz_rel
        if not vsz_path.exists():
            print(f"missing fixture: {vsz_path}", file=sys.stderr)
            per_doc.append((stem, blurb, None))
            continue
        print(f"rendering {stem} -> {vsz_path.name}")
        results = _render_doc(stem, vsz_path)
        tile = _build_tile(stem, results)
        per_doc.append((stem, blurb, tile))
    index = _build_index(per_doc)
    print(f"\nwrote {index}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
