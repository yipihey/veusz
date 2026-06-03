#!/usr/bin/env bash
# Build veusz-paint-wasm and produce ready-to-serve JS bindings under
# veusz-tauri/crates/veusz-paint-wasm/pkg/. Pair with the harness at
# veusz-tauri/crates/veusz-paint-wasm/index.html.
#
# Usage: scripts/build_paint_wasm.sh
# Output: veusz-tauri/crates/veusz-paint-wasm/pkg/{*.js, *.wasm, *.d.ts}

set -euo pipefail

cd "$(dirname "$0")/.."

cargo build \
    -p veusz-paint-wasm \
    --target wasm32-unknown-unknown \
    --profile release-wasm \
    --manifest-path veusz-tauri/Cargo.toml

WASM_IN=veusz-tauri/target/wasm32-unknown-unknown/release-wasm/veusz_paint_wasm.wasm
PKG_OUT=veusz-tauri/crates/veusz-paint-wasm/pkg
mkdir -p "${PKG_OUT}"

wasm-bindgen "${WASM_IN}" --out-dir "${PKG_OUT}" --target web

echo "built ${PKG_OUT}/"
ls -lh "${PKG_OUT}/"
