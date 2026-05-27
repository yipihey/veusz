# veusz-paint-wasm

Compiles `veusz-paint-vello` to WebAssembly and exposes a small JS API for
rendering a Veusz `Scene` JSON blob onto an `HTMLCanvasElement` via WebGPU.

This is the **phase-4 strategic deliverable** from
[`docs/parallel-paint-backends-plan.md`](../../../docs/parallel-paint-backends-plan.md):
a `.vsz` document renders in a browser with **no Python and no Qt** in the
render path. The `veuszd` daemon ships a Scene blob over RPC; this wasm
module deserialises it and asks Vello to paint it on a canvas.

## Build

```sh
rustup target add wasm32-unknown-unknown      # one-time
cargo install wasm-bindgen-cli --version 0.2.122   # one-time
scripts/build_paint_wasm.sh                   # produces pkg/
```

Output: `pkg/veusz_paint_wasm.js`, `pkg/veusz_paint_wasm_bg.wasm`,
`pkg/veusz_paint_wasm.d.ts` (~1.8 MB wasm). Gitignored; regenerate via the
script above.

## Browser harness

```sh
scripts/build_paint_wasm.sh
python3 -m http.server --directory veusz-tauri/crates/veusz-paint-wasm 8080
# open http://localhost:8080/index.html in a WebGPU-capable browser
```

The harness loads `tests/comparison/fixtures/synthetic_plot.scene.json`,
runs it through the WASM/Vello pipeline, and paints onto a 400×240 canvas.
Requires Chromium 113+ (default), Firefox Nightly (with WebGPU flag), or
Safari Technology Preview.

## Node smoke test

WebGPU isn't available in Node, but the JS bindings still parse and import
cleanly — a regression in the wasm32 build is caught here without needing a
browser:

```sh
scripts/build_paint_wasm.sh
node veusz-tauri/crates/veusz-paint-wasm/test_node_smoke.mjs
```

## What's deferred

* **Real text in wasm.** `fontique` (Parley's font discovery layer) calls
  fontconfig at runtime, which doesn't exist in browsers. The wasm build
  falls back to the dashed-bounding-box placeholder for `SceneOp::DrawText`
  — same shape tiny-skia and PDF use when no fonts are available. A future
  iteration ships a WASM-friendly font source (one vendored TTF in a Blob
  would be enough for axis labels).
* **Wide cross-browser support.** Firefox without the WebGPU flag and
  Safari pre-26 fall back to WebGL2 in wgpu, but Vello requires compute
  shaders and won't run on WebGL2. Stable Chromium is the supported path
  for this phase.
