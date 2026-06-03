#!/usr/bin/env bash
# Regenerate the subset font embedded in veusz-paint-wasm for SceneOp::DrawText.
# Source: Liberation Sans Regular (SIL OFL 1.1), a standard freely-available
# font. We ship only the glyphs scientific plots use — Latin (+extended),
# Greek, Cyrillic, punctuation, super/subscripts, currency, letterlike,
# arrows, math operators, geometric shapes — which cuts ~411 KB -> ~107 KB.
# Re-run with a full LiberationSans-Regular.ttf if you need wider coverage.
set -euo pipefail
SRC="${1:?usage: subset-embed-font.sh <full LiberationSans-Regular.ttf>}"
OUT="$(dirname "$0")/../veusz-tauri/crates/veusz-paint-wasm/assets/LiberationSans-Subset.ttf"
python3 -m fontTools.subset "$SRC" \
  --unicodes="U+0000-024F,U+0250-02AF,U+0370-03FF,U+0400-04FF,U+1E00-1EFF,U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2200-22FF,U+2300-23FF,U+25A0-25FF,U+2600-26FF" \
  --layout-features='*' --no-hinting --output-file="$OUT"
echo "wrote $OUT ($(wc -c <"$OUT") bytes)"
