#!/usr/bin/env bash
# Render a Veusz .vsz to PNG / SVG / PDF with NO Qt and NO GPU.
#
# Two pure, Qt-free halves:
#   1. .vsz -> Scene-JSON      via scripts/capture_scene.py  (Python + numpy;
#      qtall falls back to the pure-Python qtshim when PyQt6 is absent)
#   2. Scene-JSON -> image     via the `veusz-render` Rust CLI (tiny-skia /
#      the SVG & PDF emitters — the same backends the browser wasm and the
#      _paint_ext PyO3 bridge use)
#
# So this works in CI, on a server, or on a laptop with neither PyQt6 nor the
# native paint extension built — the whole point of the Rust backends.
#
# Usage:
#   scripts/render_vsz.sh INPUT.vsz OUTPUT.{png,svg,pdf} [DPI]
#
# Env overrides:
#   PYTHON         python interpreter that has numpy (default: python3)
#   VEUSZ_RENDER   path to the veusz-render binary
#                  (default: veusz-tauri/target/release/veusz-render)
set -euo pipefail

if [ $# -lt 2 ]; then
  sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
fi

VSZ=$1
OUT=$2
DPI=${3:-192}

PY=${PYTHON:-python3}
HERE=$(cd "$(dirname "$0")/.." && pwd)
BIN=${VEUSZ_RENDER:-"$HERE/veusz-tauri/target/release/veusz-render"}

if [ ! -x "$BIN" ]; then
  echo "render_vsz: veusz-render not found at $BIN" >&2
  echo "  build it: (cd veusz-tauri && cargo build --release -p veusz-render-cli)" >&2
  exit 1
fi

SCENE=$(mktemp -t veusz-scene.XXXXXX.json)
trap 'rm -f "$SCENE"' EXIT

# Half 1: capture the scene at the page's natural aspect ratio; --print-size
# tells us the exact px canvas so the render matches the scene.
SIZE=$("$PY" "$HERE/scripts/capture_scene.py" "$VSZ" --dpi "$DPI" -o "$SCENE" --print-size)

# Half 2: render the scene (format inferred from OUT's extension).
"$BIN" "$SCENE" --width "${SIZE% *}" --height "${SIZE#* }" -o "$OUT"
echo "rendered $OUT (${SIZE/ /x} px from a ${DPI}dpi capture)" >&2
