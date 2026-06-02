# Bug: tall/narrow images render incompletely in the WASM (browser) Vello backend

## Summary

A tall, narrow image (e.g. a vertical **colorbar** strip — Veusz emits these as a
`width=1, height=128` image stretched into a ~17×257 px destination rect) is
rendered **incompletely or not at all** by the browser WASM/WebGPU Vello backend
(`veusz-paint-wasm` → `render_scene_to_canvas`), while the **native** Vello
backend (`veusz-paint-py` → `render_scene_to_png(..., "vello")`) renders the same
scene **correctly**.

Square data images (e.g. 32×32, 64×64, 256×256) render fine in both backends, so
this is specific to the high-aspect-ratio image blit.

## Impact

Embedded `<veusz-figure>` documents that use a `colorbar` widget show the
colorbar's **axis and tick labels but no colour gradient** in the browser editor.
The same document exported server-side (PNG/SVG/PDF) is correct.

## Reproduction

`scene.json` is a captured Scene IR (one 32×32 data image + one `colorbar` whose
strip is a 1×128 image). Render it through each backend:

- **Native vello** (correct): `veusz.paint._paint_ext.render_scene_to_png(scene, 400, 400, (1,1,1,1), "vello")` → `server-vello.png` — colorbar fully filled.
- **WASM vello** (buggy): load `crates/veusz-paint-wasm/pkg`, call `render_scene_to_canvas(canvas, sceneBytes, 1,1,1,1)` → `wasm-vello.png` — colorbar strip only partially filled (upper portion blank).

(When reproducing standalone, install the `GPUAdapter.requestDevice` limit shim
that strips `maxInterStageShaderComponents` — see `velloWasm.ts::installLimitShim`
— or `requestDevice` rejects on recent Chrome before any rendering happens.)

The relevant scene op is:

```
DrawImage { image: {width:1, height:128, pixels:[...512 bytes...]},
            dst: {x:.., y:.., w:17.0, h:257.4}, src: null }
```

## Screenshots

- `server-vello.png` — colorbar gradient fully painted (correct).
- `wasm-vello.png` — same scene; colorbar gradient incomplete/blank.

## Notes on the code path

`crates/veusz-paint-wasm/src/lib.rs` `SceneOp::DrawImage` and
`crates/veusz-paint-vello/src/lib.rs` `emit_image` are byte-for-byte equivalent
(both build a `peniko::Image` with `scale_non_uniform(sx, sy)` and call
`scene.draw_image`). Same `vello = "0.3"`, `peniko = "0.2"`, `wgpu = "22"`. So the
divergence is in the **WebGPU runtime path** (browser wgpu→WebGPU) vs the native
adapter (Metal), not in the scene encoding — likely image sampling/upload for a
1-px-wide source upscaled ~17× in X and ~2× in Y.

## Suggested fixes (any one)

1. In `veusz-paint-wasm`, when an image's source width or height is 1 (a colorbar
   strip), tile/expand it to ≥2 px before upload, or draw it as a vertical
   `Gradient` brush fill instead of an image blit.
2. Upstream: confirm/report the vello 0.3 WebGPU image-blit behaviour for
   degenerate (1-px) source dimensions with non-uniform scale.

Reported from the EnzoNG.jl inline-visualization integration.
