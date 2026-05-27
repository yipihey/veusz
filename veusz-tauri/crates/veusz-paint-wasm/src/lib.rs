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
#[wasm_bindgen]
pub struct VelloCanvasRenderer {
    inner: RendererInner,
}

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

struct RendererInner {
    instance: wgpu::Instance,
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    surface_config: wgpu::SurfaceConfiguration,
    renderer: Renderer,
}

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
                let img = peniko::Image::new(
                    peniko::Blob::new(Arc::new(image.pixels.clone())),
                    PenikoImageFormat::Rgba8, image.width, image.height,
                );
                let sx = dst.w / src.map(|s| s.w).unwrap_or(image.width as f64);
                let sy = dst.h / src.map(|s| s.h).unwrap_or(image.height as f64);
                let sx2 = src.map(|s| s.x).unwrap_or(0.0);
                let sy2 = src.map(|s| s.y).unwrap_or(0.0);
                let xf = states.last().unwrap().transform
                    * KAffine::translate((dst.x, dst.y))
                    * KAffine::scale_non_uniform(sx, sy)
                    * KAffine::translate((-sx2, -sy2));
                out.draw_image(&img, xf);
            }
            SceneOp::DrawText { layout, x, y } => {
                emit_text_placeholder(&mut out, states.last().unwrap(), layout, *x, *y);
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

fn emit_text_placeholder(
    out: &mut VelloScene, cur: &GState, layout: &TextLayout, x: f64, y: f64,
) {
    // Same placeholder shape tiny-skia / PDF use when no fonts are
    // available: a dashed bounding-box stroke at the layout's intrinsic
    // size. Lets the rest of the scene render correctly while real text
    // in WASM waits on a fontique-friendly font source.
    let w = 0.6 * layout.style.size_pt * (layout.text.chars().count() as f64);
    let h = layout.style.size_pt;
    let mut p = BezPath::new();
    p.push(PathEl::MoveTo(Point::new(x, y - h)));
    p.push(PathEl::LineTo(Point::new(x + w, y - h)));
    p.push(PathEl::LineTo(Point::new(x + w, y)));
    p.push(PathEl::LineTo(Point::new(x, y)));
    p.push(PathEl::ClosePath);
    let brush = Brush::Solid(vcolor_to_peniko(layout.style.color));
    let mut stroke = KStroke::new(0.5);
    stroke.dash_pattern = vec![2.0, 2.0].into_iter().collect();
    out.stroke(&stroke, cur.transform, &brush, None, &p);
}

// ---------------------------------------------------------------------------
// Conversions (deduplicated copy from veusz-paint-vello)
// ---------------------------------------------------------------------------

fn vaff_to_kaff(m: Affine) -> KAffine {
    KAffine::new([m.a, m.b, m.c, m.d, m.e, m.f])
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
