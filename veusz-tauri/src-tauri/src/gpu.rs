//! Native, in-process GPU rendering via Vello (wgpu -> Metal/Vulkan/DX12).
//!
//! The Python daemon builds the abstract Scene IR and ships it to the
//! webview (the `render.scene` RPC); these commands rasterise that scene on
//! the *local* GPU inside the Tauri process and hand a PNG back.
//!
//! Why native rather than WebGPU in the WKWebView: feature flags don't apply
//! to WKWebView (WebGPU only works there when the installed WebKit defaults
//! it on, which is flaky/version-dependent). Native wgpu uses Metal directly
//! on macOS and is always available, so this is the reliable "GPU in the app"
//! path. It reuses the exact `VelloRenderer` the PyO3 bridge already drives.

use std::sync::{Mutex, MutexGuard, OnceLock};

use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine as _;
use veusz_paint_core::Scene;
use veusz_paint_vello::VelloRenderer;

/// One Vello renderer per process — owns the wgpu device and the compiled
/// compute pipelines. Mirrors `veusz-paint-py`'s singleton so behaviour and
/// output match the server-side `vello` backend exactly.
fn vello_renderer() -> Result<MutexGuard<'static, VelloRenderer>, String> {
    static CELL: OnceLock<Result<Mutex<VelloRenderer>, String>> = OnceLock::new();
    let cell = CELL.get_or_init(|| VelloRenderer::new().map(Mutex::new));
    match cell {
        Ok(m) => Ok(m.lock().expect("vello renderer mutex poisoned")),
        Err(e) => Err(e.clone()),
    }
}

/// Whether a native GPU Vello renderer can be constructed in this process.
/// The frontend probes this before offering the "Vello (GPU)" render path
/// and degrades to the server-side backend when it's false.
#[tauri::command]
pub fn gpu_available() -> bool {
    vello_renderer().is_ok()
}

/// Rasterise a base64 Scene-IR JSON to a base64 PNG on the local GPU.
///
/// `scene` is base64 of the JSON produced by `render.scene` (the same bytes
/// `_paint_ext` consumes). `bg` is RGBA in 0..1; pass `[0,0,0,0]` for a
/// transparent page (the page widget paints its own background).
#[tauri::command]
pub async fn gpu_render_scene(
    scene: String,
    w: u32,
    h: u32,
    bg: (f32, f32, f32, f32),
) -> Result<String, String> {
    // The render blocks on the GPU queue; run it off the async runtime so
    // the UI thread is never stalled.
    tauri::async_runtime::spawn_blocking(move || render_scene_b64(&scene, w, h, bg))
        .await
        .map_err(|e| format!("render task join failed: {e}"))?
}

/// Sync core of [`gpu_render_scene`]: base64 Scene JSON in, base64 PNG out.
/// Factored out so it can be unit-tested without a Tauri/async runtime.
fn render_scene_b64(scene_b64: &str, w: u32, h: u32, bg: (f32, f32, f32, f32)) -> Result<String, String> {
    let scene_json = B64
        .decode(scene_b64.as_bytes())
        .map_err(|e| format!("scene base64 decode failed: {e}"))?;
    let scene: Scene = serde_json::from_slice(&scene_json)
        .map_err(|e| format!("scene JSON decode failed: {e}"))?;
    let mut renderer = vello_renderer()?;
    let png = renderer.render_scene_to_png(&scene, w, h, bg)?;
    Ok(B64.encode(png))
}

/// Warm the renderer (constructs the device + compiles Vello pipelines) off
/// the hot path. Called from `setup()`; errors are ignored here — they
/// surface through `gpu_available()`.
pub fn warm() {
    // `.is_ok()` drops the guard at end of statement; binding the guard to
    // `_` would trip the let_underscore_lock lint.
    let _ = vello_renderer().is_ok();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renders_scene_b64_to_png_when_gpu_available() {
        // Skip cleanly on machines with no working wgpu adapter (headless CI).
        if !gpu_available() {
            eprintln!("no GPU adapter; skipping native vello render test");
            return;
        }
        // An empty scene must still produce a valid PNG of the requested size.
        let scene_b64 = B64.encode(br#"{"ops":[]}"#);
        let png_b64 = render_scene_b64(&scene_b64, 16, 16, (1.0, 1.0, 1.0, 1.0))
            .expect("render should succeed when a GPU is available");
        let png = B64.decode(png_b64.as_bytes()).expect("valid base64 png");
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n");
    }
}
