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

## Headless browser test (Playwright)

A second test drives the harness through headless Chromium with WebGPU
flags enabled. It serves the repo over a local HTTP port, loads
`index.html`, waits for the renderer to come up, clicks the Render
button, and screenshots the canvas to `pkg/test-output/headless-render.png`.

```sh
# one-time: pkg/ build + npm deps + Chromium binary
scripts/build_paint_wasm.sh
cd veusz-tauri/crates/veusz-paint-wasm
npm install
npx playwright install --with-deps chromium   # ~150 MB

# run the test
npm run test:headless
```

The test exits 0 whenever it manages to reach a verdict — including the
graceful-skip branches below. Exit > 0 is reserved for real regressions
(blank canvas after a successful render, render() throwing, missing
pkg/).

### When the test skips

Headless Chromium's WebGPU support depends on the container's GPU /
Vulkan stack. The test recognises and skips on these environment issues
rather than failing the build:

| symptom in `diagnostic.log` | reported as |
|---|---|
| `navigator.gpu` undefined | Chromium built without WebGPU. |
| `requestAdapter` returned null | No adapter — Vulkan ICD not reachable. |
| `requestDevice` rejected with "limit … not recognized" | wgpu vs Chromium API mismatch — rebuild against the matching wgpu version. |

Real WebGPU on the host (a desktop Chromium or `npm run test:headless` on
a machine with a GPU + proper Vulkan/Metal driver) is the path that
exercises the renderer end-to-end. CI just confirms the harness loads
and the pipeline up to `requestDevice` works.

### History: Chromium compatibility

Before vello 0.4: wgpu 22's `DeviceDescriptor` declared the deprecated
`maxInterStageShaderComponents` limit, which Chromium 132+ rejects.
The headless test would skip at `requestDevice`. Fixed by bumping vello
to 0.4 (wgpu 23) — that wgpu drop the deprecated limit. The Playwright
test now reaches `render` cleanly on the bundled Chromium build.

## Text

Text in the WASM build uses a **vendored TTF** — Liberation Sans Regular
(SIL OFL 1.1), at `assets/LiberationSans-Regular.ttf`. The wasm bridge
opens it via `skrifa`, looks each character up in the cmap, draws the
outline + walks advance widths to lay glyphs left-to-right at the
requested baseline. No Parley / fontique / harfrust (those pull in
fontconfig which doesn't exist in browsers).

The font adds ~400 KB to the wasm bundle (final size ~2.9 MB). For
production a subset / WOFF2-stream is the obvious follow-up. The
character set is Latin-1 + a fair chunk of Latin Extended; non-Latin
scripts fall through to the .notdef glyph. Adding a second TTF is
straightforward — same skrifa-based code path.

## What's still deferred

* **Wide cross-browser support.** Firefox without the WebGPU flag and
  Safari pre-26 fall back to WebGL2 in wgpu, but Vello requires compute
  shaders and won't run on WebGL2. Stable Chromium is the supported path
  for this phase.
* **Multi-page documents.** The current API renders one page per call;
  multi-page docs hit the renderer once per page.

## Host-side tests

Four Rust unit tests run on the build host (no wasm32, no browser
required) and validate the font asset + skrifa integration:

```sh
cargo test -p veusz-paint-wasm
```

They confirm the embedded font parses, basic Latin glyphs have outlines
and advance widths, and the scene builder reaches `DrawText` without
panicking. Catches regressions before the build hits the browser.
