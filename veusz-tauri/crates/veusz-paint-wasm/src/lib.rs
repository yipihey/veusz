//! wasm-bindgen bridge: `veusz-paint-core::Scene` -> Vello via WebGPU,
//! rendered onto an `HTMLCanvasElement`.
//!
//! Strategic deliverable (plan §8): the `.vsz` document can be rendered in
//! a browser with no Python and no Qt anywhere in the render path. The
//! daemon ships a Scene-JSON blob over RPC; this WASM module deserialises
//! it and asks Vello to paint it on a `<canvas>` via the browser's WebGPU.
//!
//! Text in WASM
//! ------------
//! Parley's font *discovery* layer (fontique) calls into fontconfig /
//! CoreText, which don't exist in the browser. But that discovery is the
//! only browser-hostile part: with `veusz-paint-text`'s `system-fonts`
//! feature turned off, parley + fontique build std-only for wasm32, and we
//! seed the engine with one vendored TTF (Liberation Sans) via
//! [`veusz_paint_text::TextEngine::with_embedded_font`]. So [`WasmTextRenderer`]
//! now delegates to the SAME layout engine the native backends use — gaining
//! real shaping and multi-line text — instead of the old bespoke
//! single-line cmap+skrifa path.
//!
//! Build (called from `scripts/build_paint_wasm.sh`):
//!     cargo build -p veusz-paint-wasm --target wasm32-unknown-unknown --release
//!     wasm-bindgen target/wasm32-unknown-unknown/release/veusz_paint_wasm.wasm \
//!         --out-dir veusz-tauri/crates/veusz-paint-wasm/pkg --target web

use peniko::{Brush, Color as PenikoColor, Fill as PenikoFill};
use peniko::kurbo::{Affine as KAffine, BezPath, Point};

use veusz_paint_vello_common::{build_vello_scene, vcolor_to_peniko, TextRenderer};

/// Vendored TTF used for SceneOp::DrawText in WASM. Liberation Sans
/// (SIL OFL 1.1), subset to the glyphs scientific plots use — Latin
/// (+extended), Greek, Cyrillic, punctuation, super/subscripts, currency,
/// letterlike, arrows, math operators, geometric shapes — which cuts the
/// embedded font ~411 KB -> ~107 KB. Regenerate with
/// `scripts/subset-embed-font.sh <full LiberationSans-Regular.ttf>` if wider
/// coverage is ever needed. Replaces fontique system-discovery (fontconfig-
/// bound, unavailable in browsers).
static EMBEDDED_FONT: &[u8] = include_bytes!("../assets/LiberationSans-Subset.ttf");

use vello::{AaConfig, RenderParams, Renderer, RendererOptions, Scene as VelloScene};

use veusz_paint_core::{Image, Scene as VScene, TextLayout};

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::HtmlCanvasElement;

// ---------------------------------------------------------------------------
// Public JS surface
// ---------------------------------------------------------------------------

#[wasm_bindgen(start)]
pub fn _start() {
    console_error_panic_hook::set_once();
}

/// One-shot render of a scene JSON blob onto a canvas via WebGPU.
///
/// Builds a fresh wgpu Device + Vello Renderer per call. For interactive
/// embedding (zoom, pan, re-render on document change), use
/// [`VelloCanvasRenderer`] which caches the device + pipelines.
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub async fn render_scene_to_canvas(
    canvas: HtmlCanvasElement,
    scene_json: &[u8],
    background_r: f32, background_g: f32, background_b: f32, background_a: f32,
) -> Result<(), JsValue> {
    let mut r = VelloCanvasRenderer::new(canvas).await?;
    r.render(scene_json, background_r, background_g, background_b, background_a).await
}

/// Persistent renderer over a single `<canvas>`. Reuse across frames so we
/// don't tear down the wgpu device and re-compile Vello's pipelines.
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub struct VelloCanvasRenderer {
    inner: RendererInner,
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
impl VelloCanvasRenderer {
    #[wasm_bindgen(constructor)]
    pub async fn new(canvas: HtmlCanvasElement) -> Result<VelloCanvasRenderer, JsValue> {
        let inner = RendererInner::new(canvas)
            .await
            .map_err(|e| JsValue::from_str(&e))?;
        Ok(Self { inner })
    }

    pub async fn render(
        &mut self,
        scene_json: &[u8],
        background_r: f32, background_g: f32, background_b: f32, background_a: f32,
    ) -> Result<(), JsValue> {
        self.inner
            .render(scene_json, (background_r, background_g, background_b, background_a))
            .await
            .map_err(|e| JsValue::from_str(&e))
    }

    pub fn resize(&mut self, width: u32, height: u32) -> Result<(), JsValue> {
        self.inner.resize(width, height).map_err(|e| JsValue::from_str(&e))
    }
}

/// Convert a Scene-JSON blob to a standalone SVG string — true client-side
/// vector export, no Qt and no GPU. `scene_json` is the same payload
/// `render_scene_to_canvas` takes (base64-decode `render.scene`'s `scene_b64`).
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn scene_to_svg(scene_json: &[u8], width: f64, height: f64) -> Result<String, JsValue> {
    let scene: VScene = serde_json::from_slice(scene_json)
        .map_err(|e| JsValue::from_str(&format!("scene JSON decode: {e}")))?;
    // Seed the SVG text engine with the same vendored font the canvas path uses,
    // so axis labels emit real glyph outlines instead of the dashed placeholder
    // (fontique discovers no system fonts in the browser).
    Ok(veusz_paint_svg::render_scene_to_svg_with_embedded_font(
        &scene, width, height, (1.0, 1.0, 1.0, 1.0), EMBEDDED_FONT))
}

// ---------------------------------------------------------------------------
// Renderer plumbing
// ---------------------------------------------------------------------------

#[cfg(target_arch = "wasm32")]
struct RendererInner {
    instance: wgpu::Instance,
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    surface_config: wgpu::SurfaceConfiguration,
    renderer: Renderer,
}

#[cfg(target_arch = "wasm32")]
impl RendererInner {
    async fn new(canvas: HtmlCanvasElement) -> Result<Self, String> {
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::BROWSER_WEBGPU,
            ..Default::default()
        });

        let surface_target = wgpu::SurfaceTarget::Canvas(canvas.clone());
        let surface = instance
            .create_surface(surface_target)
            .map_err(|e| format!("create_surface: {e}"))?;

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::HighPerformance,
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .ok_or_else(|| "no WebGPU adapter — browser lacks support".to_string())?;

        let (device, queue) = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    label: Some("veusz-paint-wasm"),
                    required_features: wgpu::Features::default(),
                    required_limits: adapter.limits(),
                    memory_hints: wgpu::MemoryHints::default(),
                },
                None,
            )
            .await
            .map_err(|e| format!("request_device: {e}"))?;

        let caps = surface.get_capabilities(&adapter);
        let surface_format = caps
            .formats
            .iter()
            .copied()
            .find(|f| !f.is_srgb())
            .or_else(|| caps.formats.first().copied())
            .unwrap_or(wgpu::TextureFormat::Rgba8Unorm);

        let width = canvas.width().max(1);
        let height = canvas.height().max(1);
        let surface_config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: surface_format,
            width,
            height,
            present_mode: wgpu::PresentMode::Fifo,
            alpha_mode: wgpu::CompositeAlphaMode::Auto,
            view_formats: vec![],
            desired_maximum_frame_latency: 2,
        };
        surface.configure(&device, &surface_config);

        let renderer = Renderer::new(
            &device,
            RendererOptions {
                surface_format: Some(surface_format),
                use_cpu: false,
                antialiasing_support: vello::AaSupport {
                    area: true, msaa8: false, msaa16: true,
                },
                num_init_threads: None,
            },
        )
        .map_err(|e| format!("vello renderer init: {e}"))?;

        Ok(Self { instance, surface, device, queue, surface_config, renderer })
    }

    fn resize(&mut self, width: u32, height: u32) -> Result<(), String> {
        if width == 0 || height == 0 { return Ok(()); }
        self.surface_config.width = width;
        self.surface_config.height = height;
        self.surface.configure(&self.device, &self.surface_config);
        Ok(())
    }

    async fn render(
        &mut self,
        scene_json: &[u8],
        background: (f32, f32, f32, f32),
    ) -> Result<(), String> {
        let scene: VScene = serde_json::from_slice(scene_json)
            .map_err(|e| format!("scene JSON decode: {e}"))?;
        let vello_scene = build_scene(&scene);

        let surface_texture = self
            .surface
            .get_current_texture()
            .map_err(|e| format!("surface get_current_texture: {e:?}"))?;

        let params = RenderParams {
            base_color: PenikoColor::rgba(
                background.0 as f64, background.1 as f64,
                background.2 as f64, background.3 as f64),
            width: self.surface_config.width,
            height: self.surface_config.height,
            antialiasing_method: AaConfig::Msaa16,
        };

        self.renderer
            .render_to_surface(&self.device, &self.queue, &vello_scene,
                               &surface_texture, &params)
            .map_err(|e| format!("vello render: {e}"))?;
        surface_texture.present();
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Scene translation — shared dispatch + the WASM-specific text/image paths.
// ---------------------------------------------------------------------------

/// Process-wide embedded-font text engine. Built once (registering the
/// vendored TTF is not free) and reused across renders. wasm is single
/// threaded, so a `thread_local` is the natural home; `Rc` lets the
/// per-call renderer borrow it without re-registering the font.
thread_local! {
    static TEXT_ENGINE: std::rc::Rc<Option<veusz_paint_text::TextEngine>> =
        std::rc::Rc::new(veusz_paint_text::TextEngine::with_embedded_font(EMBEDDED_FONT));
}

/// Translate a Scene into a `vello::Scene`. The dispatch loop + the
/// kurbo/peniko conversions live in `veusz-paint-vello-common` (shared with
/// the native `veusz-paint-vello` backend); this crate only supplies the two
/// browser-specific bits: the embedded-font text path ([`WasmTextRenderer`])
/// and the degenerate-image pad ([`pad_degenerate_image`]).
fn build_scene(scene: &VScene) -> VelloScene {
    let engine = TEXT_ENGINE.with(|e| e.clone());
    let text = WasmTextRenderer { engine: engine.as_ref().as_ref() };
    build_vello_scene(scene, &text, &pad_degenerate_image)
}

/// vello 0.3 / wgpu 22 has a WebGPU blit bug that drops 1xN / Nx1 images
/// (the image-atlas blit degenerates when a dimension is 1). Pad such images
/// out to 2 in the offending dimension by duplicating the single row/column,
/// so the sampled result is unchanged but the blit path is well-formed.
/// Non-degenerate images pass through borrowed (no copy).
fn pad_degenerate_image(img: &Image) -> std::borrow::Cow<'_, Image> {
    if img.width != 1 && img.height != 1 {
        return std::borrow::Cow::Borrowed(img);
    }
    let new_w = img.width.max(2);
    let new_h = img.height.max(2);
    let mut pixels = Vec::with_capacity((new_w * new_h * 4) as usize);
    for y in 0..new_h {
        let src_y = y.min(img.height - 1);
        for x in 0..new_w {
            let src_x = x.min(img.width - 1);
            let i = ((src_y * img.width + src_x) * 4) as usize;
            pixels.extend_from_slice(&img.pixels[i..i + 4]);
        }
    }
    std::borrow::Cow::Owned(Image { width: new_w, height: new_h, pixels })
}

/// `TextRenderer` for the browser backend. Delegates to the shared
/// `veusz-paint-text` engine (Parley shaping + skrifa outlines), seeded with
/// the vendored embedded font — the SAME layout path the native backends use.
/// This replaces the old bespoke single-line cmap walk, so the browser now
/// gets real shaping and multi-line text (the engine advances the baseline
/// per line).
///
/// `engine` is `None` only if the embedded font failed to register (it
/// shouldn't — the asset is vendored and tested); then text is skipped, the
/// same graceful no-op the native backends fall back to when no fonts exist.
struct WasmTextRenderer<'a> {
    engine: Option<&'a veusz_paint_text::TextEngine>,
}

impl TextRenderer for WasmTextRenderer<'_> {
    fn draw_text(&self, out: &mut VelloScene, transform: KAffine,
                 layout: &TextLayout, x: f64, y: f64) {
        let engine = match self.engine { Some(e) => e, None => return };
        // `(x, y)` is the first line's baseline (Qt's drawText convention); the
        // engine anchors it there and offsets later lines by the line height.
        let glyphs = engine.layout_to_glyph_paths(layout, (x, y));
        if glyphs.is_empty() {
            return;
        }
        let brush = Brush::Solid(vcolor_to_peniko(layout.style.color));
        for g in glyphs {
            // The engine's glyph paths are already in screen-y-down outline
            // coordinates; `g.position` carries the per-glyph translate. Fold
            // both into the current transform and fill.
            let glyph_xf = transform * vpath_affine_to_kurbo(g.position);
            let bez = vpath_to_kurbo_bez(&g.path);
            out.fill(PenikoFill::NonZero, glyph_xf, &brush, None, &bez);
        }
    }
}

/// Convert a [`veusz_paint_core::Affine`] (glyph baseline transform) to kurbo.
fn vpath_affine_to_kurbo(m: veusz_paint_core::Affine) -> KAffine {
    KAffine::new([m.a, m.b, m.c, m.d, m.e, m.f])
}

/// Convert a [`veusz_paint_core::Path`] (glyph outline) to a kurbo `BezPath`.
fn vpath_to_kurbo_bez(p: &veusz_paint_core::Path) -> BezPath {
    use veusz_paint_core::PathVerb;
    let mut out = BezPath::new();
    let mut i = 0;
    for v in &p.verbs {
        match v {
            PathVerb::MoveTo => { out.move_to(Point::new(p.points[i], p.points[i + 1])); i += 2; }
            PathVerb::LineTo => { out.line_to(Point::new(p.points[i], p.points[i + 1])); i += 2; }
            PathVerb::QuadTo => {
                out.quad_to(
                    Point::new(p.points[i], p.points[i + 1]),
                    Point::new(p.points[i + 2], p.points[i + 3]),
                );
                i += 4;
            }
            PathVerb::CubicTo => {
                out.curve_to(
                    Point::new(p.points[i], p.points[i + 1]),
                    Point::new(p.points[i + 2], p.points[i + 3]),
                    Point::new(p.points[i + 4], p.points[i + 5]),
                );
                i += 6;
            }
            PathVerb::Close => out.close_path(),
        }
    }
    out
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
// These compile to the host target (e.g. x86_64-linux-gnu) and verify the
// font-handling code without needing a WebGPU browser. The wasm-bindgen
// surface compiles only on wasm32; that's exercised by the build script and
// the Node smoke test.

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use super::*;
    use veusz_paint_core::*;

    #[test]
    fn embedded_font_is_present() {
        assert!(EMBEDDED_FONT.len() > 10_000, "font asset must be present");
    }

    #[test]
    fn embedded_font_engine_registers_and_lays_out() {
        // The wasm text path: build the engine from the embedded font with NO
        // system fonts, and confirm it produces real glyph outlines.
        let engine = veusz_paint_text::TextEngine::with_embedded_font(EMBEDDED_FONT)
            .expect("embedded font must register");
        let layout = TextLayout {
            text: "Hello".into(),
            style: TextStyle { size_pt: 16.0, ..TextStyle::default() },
        };
        let glyphs = engine.layout_to_glyph_paths(&layout, (0.0, 20.0));
        assert!(glyphs.len() >= 5, "expected >=5 glyphs, got {}", glyphs.len());
        for g in &glyphs {
            assert!(!g.path.verbs.is_empty(), "glyph 'Hello' must have outlines");
        }
    }

    #[test]
    fn embedded_font_engine_handles_multiline() {
        // Multi-line is the headline win over the old bespoke renderer: the
        // second line's baseline must sit below the first.
        let engine = veusz_paint_text::TextEngine::with_embedded_font(EMBEDDED_FONT)
            .expect("embedded font registers");
        let layout = TextLayout {
            text: "ab\ncd".into(),
            style: TextStyle { size_pt: 16.0, ..TextStyle::default() },
        };
        let glyphs = engine.layout_to_glyph_paths(&layout, (0.0, 20.0));
        assert!(!glyphs.is_empty());
        let max_y = glyphs.iter().map(|g| g.position.f).fold(f64::MIN, f64::max);
        assert!(max_y > 20.0 + 8.0,
                "second line must advance the baseline, got max_y={max_y}");
    }

    #[test]
    fn build_scene_with_text_does_not_panic() {
        // A scene with a single DrawText; we don't run the GPU — just
        // confirm the WASM-side scene builder reaches text emission and
        // delegates to veusz-paint-text successfully.
        let mut rec = SceneRecorder::new();
        rec.draw_text(
            &TextLayout {
                text: "Veusz".into(),
                style: TextStyle {
                    family: "sans-serif".into(),
                    size_pt: 14.0,
                    weight: 400,
                    italic: false,
                    color: Color::rgba8(0, 0, 0, 255),
                },
            },
            10.0, 30.0,
        );
        let scene = rec.into_scene();
        let _vello_scene = build_scene(&scene);
        // No assertion on internal vello::Scene state (it's opaque); the
        // win is that build_scene + WasmTextRenderer completed end-to-end.
    }
}
