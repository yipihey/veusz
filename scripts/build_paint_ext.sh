#!/usr/bin/env bash
# Build the `veusz.paint._paint_ext` PyO3 extension and drop it into the
# package tree so `from veusz.paint import create_painter; create_painter(..., backend="tiny-skia")`
# can find it without an editable install.
#
# Usage:   scripts/build_paint_ext.sh [--debug]
# Output:  veusz/paint/_paint_ext.abi3.so
#
# When `pip install .` lands on the Veusz build, maturin will produce this
# .so as part of the wheel; this script is the developer fast-path.

set -euo pipefail

cd "$(dirname "$0")/.."

PROFILE=release
TARGET_DIR=veusz-tauri/target/release
if [[ "${1:-}" == "--debug" ]]; then
    PROFILE=dev
    TARGET_DIR=veusz-tauri/target/debug
fi

cargo build -p veusz-paint-py --profile "${PROFILE}" --manifest-path veusz-tauri/Cargo.toml

# Linux: lib_paint_ext.so   macOS: lib_paint_ext.dylib
SRC=""
for ext in so dylib; do
    if [[ -f "${TARGET_DIR}/lib_paint_ext.${ext}" ]]; then
        SRC="${TARGET_DIR}/lib_paint_ext.${ext}"
        break
    fi
done
if [[ -z "${SRC}" ]]; then
    echo "could not locate built extension under ${TARGET_DIR}" >&2
    exit 1
fi

DEST=veusz/paint/_paint_ext.abi3.so
cp "${SRC}" "${DEST}"
echo "installed ${DEST}"
python3 -c "from veusz.paint import _paint_ext; print('module loads; backends:', _paint_ext.available_backends())"
