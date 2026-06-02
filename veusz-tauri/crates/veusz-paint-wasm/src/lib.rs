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
//! Real glyph rendering is deferred for this first cut: fontique (the font
//! discovery layer Parley needs) calls into fontconfig at runtime, which
//! doesn't exist in the browser. SceneOp::DrawText falls back to a dashed
//! bounding-box placeholder — same shape as the placeholder tiny-skia and
//! PDF use when they can't find a system font. A future iteration ships a
//! WASM-friendly font source (one vendored TTF in a Blob would be enough
//! for axis labels).
//!
//! Build (called from `scripts/build_paint_wasm.sh`):
//!     cargo build -p veusz-paint-wasm --target wasm32-unknown-unknown --release
//!     wasm-bindgen target/wasm32-unknown-unknown/release/veusz_paint_wasm.wasm \
//!         --out-dir veusz-tauri/crates/veusz-paint-wasm/pkg --target web

use std::sync::Arc;

use peniko::{
    BlendMode as PenikoBlend, Brush, Color as PenikoColor, ColorStop, Compose, Extend,
    Fill as PenikoFill, Format as PenikoImageFormat, Gradient, Mix,
};
use peniko::kurbo::{Affine as KAffine, BezPath, PathEl, Point, Stroke as KStroke};
use skrifa::{
    instance::{LocationRef, Size as SkSize},
    outline::{DrawSettings, OutlinePen},
    raw::FontRef,
    GlyphId, MetadataProvider,
};

/// Vendored TTF used for SceneOp::DrawText in WASM. Liberation Sans
/// Regular (SIL OFL 1.1). Replaces fontique system-discovery, which is
/// fontconfig-bound and doesn't work in browsers. ~402 KB; sits next to
/// the 1.8 MB Vello wasm in pkg/. Acceptable for the phase-4 deliverable;
/// production should ship a smaller subset.
static EMBEDDED_FONT: &[u8] = include_bytes!("../assets/LiberationSans-Regular.ttf");

use vello::{AaConfig, RenderParams, Renderer, RendererOptions, Scene as VelloScene};

use veusz_paint_core::{
    Affine, BlendMode as VBlend, Color as VColor, Fill as VFill, FillRule,
    LineCap as VCap, LineJoin as VJoin, Paint as VPaint, Path as VPath, PathVerb,
    Rect as VRect, Scene as VScene, SceneOp, TextLayout,
};

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
// SceneBuilder — text path stubbed for WASM (no fontique).
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
struct GState {
    transform: KAffine,
    paint: Option<MaterializedPaint>,
    blend: VBlend,
    layers_in_frame: usize,
}

impl Default for GState {
    fn default() -> Self {
        Self {
            transform: KAffine::IDENTITY,
            paint: None,
            blend: VBlend::SourceOver,
            layers_in_frame: 0,
        }
    }
}

#[derive(Clone, Debug)]
struct MaterializedPaint {
    fill_brush: Option<Brush>,
    stroke_brush: Option<Brush>,
    stroke: Option<KStroke>,
}

fn build_scene(scene: &VScene) -> VelloScene {
    let mut out = VelloScene::new();
    let mut states: Vec<GState> = vec![GState::default()];

    for op in &scene.ops {
        match op {
            SceneOp::Save => {
                let mut cloned = states.last().unwrap().clone();
                cloned.layers_in_frame = 0;
                states.push(cloned);
            }
            SceneOp::Restore => {
                let popped = states.pop().unwrap();
                for _ in 0..popped.layers_in_frame { out.pop_layer(); }
            }
            SceneOp::SetTransform(m) => {
                states.last_mut().unwrap().transform = vaff_to_kaff(*m);
            }
            SceneOp::ConcatTransform(m) => {
                let s = states.last_mut().unwrap();
                s.transform = s.transform * vaff_to_kaff(*m);
            }
            SceneOp::PushClipRect(r) => {
                let mut p = BezPath::new();
                p.push(PathEl::MoveTo(Point::new(r.x, r.y)));
                p.push(PathEl::LineTo(Point::new(r.x + r.w, r.y)));
                p.push(PathEl::LineTo(Point::new(r.x + r.w, r.y + r.h)));
                p.push(PathEl::LineTo(Point::new(r.x, r.y + r.h)));
                p.push(PathEl::ClosePath);
                push_clip(&mut out, &mut states, &p);
            }
            SceneOp::PushClipPath { path, .. } => {
                let p = vpath_to_bez(path);
                push_clip(&mut out, &mut states, &p);
            }
            SceneOp::PopClip => {
                out.pop_layer();
                let n = &mut states.last_mut().unwrap().layers_in_frame;
                *n = n.saturating_sub(1);
            }
            SceneOp::SetPaint(p) => {
                states.last_mut().unwrap().paint = Some(materialise_paint(p));
            }
            SceneOp::SetBlendMode(m) => {
                states.last_mut().unwrap().blend = *m;
            }
            SceneOp::SetQuality(_) => {}
            SceneOp::StrokePath(path) => {
                let bez = vpath_to_bez(path);
                let cur = states.last().unwrap();
                if let Some(mp) = cur.paint.clone() {
                    if let (Some(brush), Some(stroke)) = (mp.stroke_brush, mp.stroke) {
                        out.stroke(&stroke, cur.transform, &brush, None, &bez);
                    }
                }
            }
            SceneOp::FillPath { path, rule } => {
                let bez = vpath_to_bez(path);
                let cur = states.last().unwrap();
                if let Some(mp) = cur.paint.clone() {
                    if let Some(brush) = mp.fill_brush {
                        out.fill(vrule_to_peniko(*rule), cur.transform, &brush, None, &bez);
                    }
                }
            }
            SceneOp::DrawImage { image, dst, src } => {
                // Workaround: vello 0.3's WebGPU image-blit pipeline renders
                // 1×N / N×1 sources incompletely (Veusz emits colorbar strips
                // as a 1×128 RGBA blob). Pad to ≥2×2 by duplicating; the dup
                // samples to the same colour, so the visible result is the
                // intended one. See bugreports/colorbar-wasm.
                let (pixels, src_w, src_h) = pad_degenerate_image(image);
                let img = peniko::Image::new(
                    peniko::Blob::new(Arc::new(pixels)),
                    PenikoImageFormat::Rgba8, src_w, src_h,
                );
                let sx = dst.w / src.map(|s| s.w).unwrap_or(src_w as f64);
                let sy = dst.h / src.map(|s| s.h).unwrap_or(src_h as f64);
                let sx2 = src.map(|s| s.x).unwrap_or(0.0);
                let sy2 = src.map(|s| s.y).unwrap_or(0.0);
                let xf = states.last().unwrap().transform
                    * KAffine::translate((dst.x, dst.y))
                    * KAffine::scale_non_uniform(sx, sy)
                    * KAffine::translate((-sx2, -sy2));
                out.draw_image(&img, xf);
            }
            SceneOp::DrawText { layout, x, y } => {
                emit_text_glyphs(&mut out, states.last().unwrap(), layout, *x, *y);
            }
            SceneOp::DrawMarkers { path, xs, ys, scales, fill, stroke } => {
                // One marker path instanced over the position arrays — this is
                // what makes browser-scale scatters viable (compact scene +
                // no per-marker op).
                let bez = vpath_to_bez(path);
                let cur = states.last().unwrap();
                let base_xf = cur.transform;
                let mp = cur.paint.clone();
                if let Some(mp) = mp {
                    let n = xs.len().min(ys.len());
                    for i in 0..n {
                        let mut xf = base_xf * KAffine::translate((xs[i], ys[i]));
                        if let Some(sc) = scales {
                            if !sc.is_empty() {
                                xf = xf * KAffine::scale(sc[i % sc.len()]);
                            }
                        }
                        if *fill {
                            if let Some(brush) = &mp.fill_brush {
                                out.fill(vrule_to_peniko(FillRule::NonZero), xf, brush, None, &bez);
                            }
                        }
                        if *stroke {
                            if let (Some(brush), Some(stroke_style)) = (&mp.stroke_brush, &mp.stroke) {
                                out.stroke(stroke_style, xf, brush, None, &bez);
                            }
                        }
                    }
                }
            }
        }
    }
    out
}

fn push_clip(out: &mut VelloScene, states: &mut Vec<GState>, path: &BezPath) {
    let cur = states.last().unwrap();
    let blend = vblend_to_blend(cur.blend);
    out.push_layer(blend, 1.0, cur.transform, path);
    states.last_mut().unwrap().layers_in_frame += 1;
}

/// Minimal WASM-friendly text layout: looks each character up in the
/// embedded font's cmap, fetches the outline + advance via skrifa,
/// concatenates left-to-right at the requested baseline.
///
/// No Parley layer (no line breaking, no bidi, no fallback) — Veusz
/// widgets pre-break their text, the audit shows we only need single-line
/// horizontal runs, and pulling Parley into WASM also pulls in
/// fontique/harfrust which don't compile cleanly here.
///
/// If the cmap doesn't have a glyph for some character (font subset gap),
/// the character is silently dropped — same behaviour skrifa-driven text
/// has in the native backends.
fn emit_text_glyphs(out: &mut VelloScene, cur: &GState,
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
            let glyph_xf = cur.transform * KAffine::translate((cursor_x, y));
            out.fill(PenikoFill::NonZero, glyph_xf, &brush, None, &pen.path);
        }
        cursor_x += glyph_metrics.advance_width(gid).unwrap_or(0.0) as f64;
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
// Conversions (deduplicated copy from veusz-paint-vello)
// ---------------------------------------------------------------------------

fn vaff_to_kaff(m: Affine) -> KAffine {
    KAffine::new([m.a, m.b, m.c, m.d, m.e, m.f])
}

/// Workaround for vello 0.3 + wgpu 22's WebGPU image-blit pipeline rendering
/// 1-pixel-wide / 1-pixel-tall sources incompletely (the native Metal /
/// Vulkan / DX12 paths are unaffected). Pads such images to ≥2×2 by
/// duplicating the lone row / column; sampling a uniform duplicate produces
/// the same colour, so the visible output matches the native render.
fn pad_degenerate_image(image: &veusz_paint_core::Image) -> (Vec<u8>, u32, u32) {
    let w = image.width as usize;
    let h = image.height as usize;
    if w >= 2 && h >= 2 {
        return (image.pixels.clone(), image.width, image.height);
    }
    let new_w = w.max(2);
    let new_h = h.max(2);
    let mut out = Vec::with_capacity(new_w * new_h * 4);
    for y in 0..new_h {
        let sy = y.min(h - 1);
        for x in 0..new_w {
            let sx = x.min(w - 1);
            let i = (sy * w + sx) * 4;
            out.extend_from_slice(&image.pixels[i..i + 4]);
        }
    }
    (out, new_w as u32, new_h as u32)
}

fn vrule_to_peniko(r: FillRule) -> PenikoFill {
    match r {
        FillRule::NonZero => PenikoFill::NonZero,
        FillRule::EvenOdd => PenikoFill::EvenOdd,
    }
}

fn vblend_to_blend(m: VBlend) -> PenikoBlend {
    match m {
        VBlend::SourceOver => PenikoBlend::new(Mix::Normal, Compose::SrcOver),
        VBlend::Multiply   => PenikoBlend::new(Mix::Multiply, Compose::SrcOver),
        VBlend::Plus       => PenikoBlend::new(Mix::Normal, Compose::Plus),
    }
}

fn vcolor_to_peniko(c: VColor) -> PenikoColor {
    PenikoColor::rgba(c.r as f64, c.g as f64, c.b as f64, c.a as f64)
}

fn vcap_to_kurbo(c: VCap) -> peniko::kurbo::Cap {
    match c {
        VCap::Butt => peniko::kurbo::Cap::Butt,
        VCap::Round => peniko::kurbo::Cap::Round,
        VCap::Square => peniko::kurbo::Cap::Square,
    }
}

fn vjoin_to_kurbo(j: VJoin) -> peniko::kurbo::Join {
    match j {
        VJoin::Miter => peniko::kurbo::Join::Miter,
        VJoin::Round => peniko::kurbo::Join::Round,
        VJoin::Bevel => peniko::kurbo::Join::Bevel,
    }
}

fn vpath_to_bez(p: &VPath) -> BezPath {
    let mut out = BezPath::new();
    let mut i = 0;
    for v in &p.verbs {
        match v {
            PathVerb::MoveTo => { out.move_to(Point::new(p.points[i], p.points[i+1])); i += 2; }
            PathVerb::LineTo => { out.line_to(Point::new(p.points[i], p.points[i+1])); i += 2; }
            PathVerb::QuadTo => {
                out.quad_to(
                    Point::new(p.points[i], p.points[i+1]),
                    Point::new(p.points[i+2], p.points[i+3]),
                );
                i += 4;
            }
            PathVerb::CubicTo => {
                out.curve_to(
                    Point::new(p.points[i], p.points[i+1]),
                    Point::new(p.points[i+2], p.points[i+3]),
                    Point::new(p.points[i+4], p.points[i+5]),
                );
                i += 6;
            }
            PathVerb::Close => out.close_path(),
        }
    }
    out
}

fn materialise_paint(p: &VPaint) -> MaterializedPaint {
    let fill_brush = p.fill.as_ref().map(brush_for_fill);
    let stroke_brush = p.stroke.as_ref().map(|s| Brush::Solid(vcolor_to_peniko(s.color)));
    let stroke = p.stroke.as_ref().map(|s| {
        let mut k = KStroke::new(s.width);
        k.start_cap = vcap_to_kurbo(s.cap);
        k.end_cap = vcap_to_kurbo(s.cap);
        k.join = vjoin_to_kurbo(s.join);
        k.miter_limit = s.miter_limit;
        if let Some(dash) = &s.dash {
            k.dash_pattern = dash.iter().copied().collect();
        }
        k
    });
    MaterializedPaint { fill_brush, stroke_brush, stroke }
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
    fn pad_degenerate_image_passes_through_2x2_or_larger() {
        // 2×2 input must be returned verbatim (no padding cost).
        let img = veusz_paint_core::Image {
            width: 2, height: 2,
            pixels: vec![0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3,3],
        };
        let (px, w, h) = pad_degenerate_image(&img);
        assert_eq!((w, h), (2, 2));
        assert_eq!(px, img.pixels);
    }

    #[test]
    fn pad_degenerate_image_expands_1_by_n_colorbar_to_2_by_n() {
        // The bug-report case: a 1×4 RGBA colorbar strip. Expand to 2×4
        // by duplicating the single column; each row carries its own
        // unique colour, which must be preserved.
        let img = veusz_paint_core::Image {
            width: 1, height: 4,
            pixels: vec![
                10, 20, 30, 40,    // row 0
                50, 60, 70, 80,    // row 1
                90,100,110,120,    // row 2
               130,140,150,160,    // row 3
            ],
        };
        let (px, w, h) = pad_degenerate_image(&img);
        assert_eq!((w, h), (2, 4));
        // Each row now has 2 identical pixels (the original duplicated).
        for r in 0..4_usize {
            let base = r * 2 * 4;
            assert_eq!(&px[base..base + 4], &px[base + 4..base + 8],
                "row {r}: duplicated columns must be identical");
        }
        // Row 2 must be the original (90, 100, 110, 120).
        assert_eq!(&px[16..20], &[90, 100, 110, 120]);
    }

    #[test]
    fn pad_degenerate_image_expands_n_by_1_to_n_by_2() {
        let img = veusz_paint_core::Image {
            width: 3, height: 1,
            pixels: vec![1,2,3,4, 5,6,7,8, 9,10,11,12],
        };
        let (px, w, h) = pad_degenerate_image(&img);
        assert_eq!((w, h), (3, 2));
        // The single row is duplicated, so the buffer is the input twice over.
        assert_eq!(&px[0..12], &img.pixels[..]);
        assert_eq!(&px[12..24], &img.pixels[..]);
    }

    #[test]
    fn pad_degenerate_image_expands_1_by_1_to_2_by_2() {
        // Edge case — the degenerate-in-both-axes input.
        let img = veusz_paint_core::Image {
            width: 1, height: 1, pixels: vec![42, 43, 44, 45],
        };
        let (px, w, h) = pad_degenerate_image(&img);
        assert_eq!((w, h), (2, 2));
        assert_eq!(px, vec![
            42, 43, 44, 45,  42, 43, 44, 45,
            42, 43, 44, 45,  42, 43, 44, 45,
        ]);
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
        // win is that build_scene + emit_text_glyphs completed end-to-end.
    }
}

fn brush_for_fill(f: &VFill) -> Brush {
    match f {
        VFill::Solid(c) => Brush::Solid(vcolor_to_peniko(*c)),
        VFill::Linear(g) => {
            let stops: Vec<ColorStop> = g.stops.iter()
                .map(|s| ColorStop { offset: s.offset, color: vcolor_to_peniko(s.color) })
                .collect();
            Brush::Gradient(Gradient::new_linear(
                Point::new(g.start.0, g.start.1),
                Point::new(g.end.0, g.end.1),
            ).with_stops(stops.as_slice()).with_extend(Extend::Pad))
        }
        VFill::Radial(g) => {
            let stops: Vec<ColorStop> = g.stops.iter()
                .map(|s| ColorStop { offset: s.offset, color: vcolor_to_peniko(s.color) })
                .collect();
            Brush::Gradient(Gradient::new_radial(
                Point::new(g.center.0, g.center.1),
                g.radius as f32,
            ).with_stops(stops.as_slice()).with_extend(Extend::Pad))
        }
    }
}
