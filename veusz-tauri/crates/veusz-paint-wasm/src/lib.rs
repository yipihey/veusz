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
//! Parley's font-discovery layer (fontique) calls into fontconfig at
//! runtime, which doesn't exist in the browser, so we can't reuse the
//! native `veusz-paint-text` path. Instead [`WasmTextRenderer`] lays text
//! out directly against one vendored TTF (Liberation Sans) via skrifa:
//! cmap lookup + glyph outlines, single-line horizontal runs. That's all
//! Veusz's pre-broken widget text needs.
//!
//! Build (called from `scripts/build_paint_wasm.sh`):
//!     cargo build -p veusz-paint-wasm --target wasm32-unknown-unknown --release
//!     wasm-bindgen target/wasm32-unknown-unknown/release/veusz_paint_wasm.wasm \
//!         --out-dir veusz-tauri/crates/veusz-paint-wasm/pkg --target web

use peniko::{Brush, Color as PenikoColor, Fill as PenikoFill};
use peniko::kurbo::{Affine as KAffine, BezPath, Point};
use skrifa::{
    instance::{LocationRef, Size as SkSize},
    outline::{DrawSettings, OutlinePen},
    raw::FontRef,
    GlyphId, MetadataProvider,
};

use veusz_paint_vello_common::{build_vello_scene, vcolor_to_peniko, TextRenderer};

/// Vendored TTF used for SceneOp::DrawText in WASM. Liberation Sans
/// Regular (SIL OFL 1.1). Replaces fontique system-discovery, which is
/// fontconfig-bound and doesn't work in browsers. ~402 KB; sits next to
/// the 1.8 MB Vello wasm in pkg/. Acceptable for the phase-4 deliverable;
/// production should ship a smaller subset.
static EMBEDDED_FONT: &[u8] = include_bytes!("../assets/LiberationSans-Regular.ttf");

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
    Ok(veusz_paint_svg::render_scene_to_svg(&scene, width, height, (1.0, 1.0, 1.0, 1.0)))
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

/// Translate a Scene into a `vello::Scene`. The dispatch loop + the
/// kurbo/peniko conversions live in `veusz-paint-vello-common` (shared with
/// the native `veusz-paint-vello` backend); this crate only supplies the two
/// browser-specific bits: the embedded-font text path ([`WasmTextRenderer`])
/// and the degenerate-image pad ([`pad_degenerate_image`]).
fn build_scene(scene: &VScene) -> VelloScene {
    build_vello_scene(scene, &WasmTextRenderer, &pad_degenerate_image)
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

/// `TextRenderer` for the browser backend. Minimal WASM-friendly text
/// layout: looks each character up in the embedded font's cmap, fetches the
/// outline + advance via skrifa, concatenates left-to-right at the requested
/// baseline.
///
/// No Parley layer (no line breaking, no bidi, no fallback) — Veusz widgets
/// pre-break their text, the audit shows we only need single-line horizontal
/// runs, and pulling Parley into WASM also pulls in fontique/harfrust which
/// don't compile cleanly here.
///
/// If the cmap doesn't have a glyph for some character (font subset gap), the
/// character is silently dropped — same behaviour skrifa-driven text has in
/// the native backends.
struct WasmTextRenderer;

impl TextRenderer for WasmTextRenderer {
    fn draw_text(&self, out: &mut VelloScene, transform: KAffine,
                 layout: &TextLayout, x: f64, y: f64) {
        let font = match FontRef::new(EMBEDDED_FONT) {
            Ok(f) => f,
            Err(_) => return,  // embedded font corrupt — shouldn't happen
        };
        let size = SkSize::new(layout.style.size_pt as f32);
        let cmap = font.charmap();
        let glyph_metrics = font.glyph_metrics(size, LocationRef::default());
        let outlines = font.outline_glyphs();
        let brush = Brush::Solid(vcolor_to_peniko(layout.style.color));

        let mut cursor_x = x;
        for ch in layout.text.chars() {
            let gid = cmap.map(ch).unwrap_or(GlyphId::new(0));
            let outline = match outlines.get(gid) { Some(o) => o, None => continue };

            let mut pen = OutlineToPath::default();
            let _ = outline.draw(
                DrawSettings::unhinted(size, LocationRef::default()),
                &mut pen,
            );
            if !pen.path.elements().is_empty() {
                let glyph_xf = transform * KAffine::translate((cursor_x, y));
                out.fill(PenikoFill::NonZero, glyph_xf, &brush, None, &pen.path);
            }
            cursor_x += glyph_metrics.advance_width(gid).unwrap_or(0.0) as f64;
        }
    }
}

/// skrifa OutlinePen sink that builds a kurbo BezPath in y-flipped (screen)
/// coordinates. Glyph outlines come out y-up (PostScript); we flip on the
/// fly to match the rest of the pipeline's y-down convention.
#[derive(Default)]
struct OutlineToPath {
    path: BezPath,
}

impl OutlinePen for OutlineToPath {
    fn move_to(&mut self, gx: f32, gy: f32) {
        self.path.move_to(Point::new(gx as f64, -gy as f64));
    }
    fn line_to(&mut self, gx: f32, gy: f32) {
        self.path.line_to(Point::new(gx as f64, -gy as f64));
    }
    fn quad_to(&mut self, cx: f32, cy: f32, gx: f32, gy: f32) {
        self.path.quad_to(
            Point::new(cx as f64, -cy as f64),
            Point::new(gx as f64, -gy as f64),
        );
    }
    fn curve_to(&mut self, c1x: f32, c1y: f32, c2x: f32, c2y: f32,
                gx: f32, gy: f32) {
        self.path.curve_to(
            Point::new(c1x as f64, -c1y as f64),
            Point::new(c2x as f64, -c2y as f64),
            Point::new(gx as f64, -gy as f64),
        );
    }
    fn close(&mut self) {
        self.path.close_path();
    }
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
    fn embedded_font_is_present_and_parses() {
        assert!(EMBEDDED_FONT.len() > 10_000, "font asset must be present");
        let font = FontRef::new(EMBEDDED_FONT).expect("font must parse");
        // Must have a usable cmap and a few well-known glyphs.
        let cmap = font.charmap();
        for ch in ['A', 'a', '0', ' '] {
            let gid = cmap.map(ch).unwrap_or(GlyphId::new(0));
            assert_ne!(gid.to_u32(), 0,
                       "embedded font is missing a basic Latin glyph for {ch:?}");
        }
    }

    #[test]
    fn embedded_font_yields_non_empty_outlines() {
        let font = FontRef::new(EMBEDDED_FONT).expect("font parses");
        let size = SkSize::new(16.0);
        let cmap = font.charmap();
        let outlines = font.outline_glyphs();
        let gid = cmap.map('A').unwrap();
        let outline = outlines.get(gid).expect("glyph 'A' has an outline");
        let mut pen = OutlineToPath::default();
        outline
            .draw(DrawSettings::unhinted(size, LocationRef::default()), &mut pen)
            .expect("draw");
        let elements: Vec<_> = pen.path.elements().iter().collect();
        assert!(elements.len() >= 4,
                "glyph 'A' outline must have several path elements, got {}",
                elements.len());
    }

    #[test]
    fn glyph_advance_widths_are_positive() {
        let font = FontRef::new(EMBEDDED_FONT).unwrap();
        let size = SkSize::new(12.0);
        let cmap = font.charmap();
        let metrics = font.glyph_metrics(size, LocationRef::default());
        let mut total = 0.0_f32;
        for ch in "Hello".chars() {
            let gid = cmap.map(ch).unwrap();
            let adv = metrics.advance_width(gid).unwrap_or(0.0);
            assert!(adv > 0.0, "advance width for {ch:?} should be > 0");
            total += adv;
        }
        // 'Hello' at 12pt should occupy somewhere between 25 and 60 user-space units.
        assert!(total > 25.0 && total < 60.0,
                "total width for 'Hello' at 12pt out of range: {total}");
    }

    #[test]
    fn build_scene_with_text_does_not_panic() {
        // A scene with a single DrawText; we don't run the GPU — just
        // confirm the WASM-side scene builder reaches text emission and
        // calls into the skrifa outline path successfully.
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
