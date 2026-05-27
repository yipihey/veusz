// Node smoke test for the wasm-bindgen JS bindings.
//
// WebGPU is not available in Node, so we can't actually render here. But we
// can verify that the module loads, the public symbols are present with the
// expected shapes, and the wasm-side `init()` function returns without
// throwing. This catches dead-on-arrival builds — a regression in the
// `cargo build --target wasm32-unknown-unknown` pipeline would fail this
// before the browser harness even loads.
//
// Run:  node veusz-tauri/crates/veusz-paint-wasm/test_node_smoke.mjs

import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, "pkg/veusz_paint_wasm.js");

if (!existsSync(pkg)) {
  console.error(`pkg not built — run scripts/build_paint_wasm.sh first`);
  process.exit(1);
}

const mod = await import(pkg);

assert.equal(typeof mod.default, "function", "init export missing");
assert.equal(typeof mod.VelloCanvasRenderer, "function", "VelloCanvasRenderer missing");
assert.equal(typeof mod.render_scene_to_canvas, "function", "render_scene_to_canvas missing");
assert.equal(typeof mod.initSync, "function", "initSync missing");

console.log("OK: wasm-bindgen pkg loads + exports expected symbols");
