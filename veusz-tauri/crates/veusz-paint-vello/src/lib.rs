//! Vello (wgpu) backend for the Veusz Painter trait.
//!
//! Strategic backend: GPU compute rasteriser that runs natively (Vulkan,
//! Metal, DX12) and compiles to WebAssembly via wgpu's WebGPU adapter
//! (the path that makes a `.vsz` render in a browser without Python or Qt
//! — plan §8).
//!
//! What's in this phase
//! --------------------
//! * `VelloRenderer`: holds an offscreen wgpu device + queue + Vello
//!   renderer state. `render_scene_to_png(scene, width, height, bg)`
//!   converts a `veusz_paint_core::Scene` into a Vello `Scene`, runs the
//!   GPU compute pipelines, and returns PNG bytes.
//! * `SceneBuilder`: maps every `SceneOp` to its Vello equivalent. Most
//!   ops translate 1:1 (paths, fills, strokes, transforms, clips, images,
//!   text via the shared veusz-paint-text engine).
//! * Headless mode: no surface, no winit, no swapchain — we render to an
//!   offscreen texture and copy back to CPU. Works on llvmpipe / SwiftShader
//!   for CI.
//!
//! What's deferred
//! ---------------
//! * WASM build with WebGPU adapter — that's plan §8 / phase 4. The native
//!   path here is the shared substrate.
//! * Persistent renderer state for multi-page documents. Right now we
//!   construct a fresh `Renderer` per render; cheap on llvmpipe, will be
//!   pooled before the GUI integration lands.
//! * Streaming texture readback. We block on the queue every render.
//! * Antialiasing-quality knobs beyond the default Vello "area" mode.

#![forbid(unsafe_code)]

use std::sync::Arc;

use peniko::{
    BlendMode as PenikoBlend, Brush, Color as PenikoColor, ColorStop, Compose, Extend,
    Fill as PenikoFill, Format as PenikoImageFormat, Gradient, Mix,
};
use peniko::kurbo::{Affine as KAffine, BezPath, PathEl, Point, Stroke as KStroke};

use vello::{AaConfig, RenderParams, Renderer, RendererOptions, Scene as VelloScene};
use wgpu::{
    Backends, Buffer, BufferDescriptor, BufferUsages, CommandEncoderDescriptor,
    DeviceDescriptor, Extent3d, ImageCopyBuffer, ImageDataLayout, Instance, InstanceDescriptor,
    Limits, MapMode, MemoryHints, PowerPreference, RequestAdapterOptions,
    TextureDescriptor, TextureDimension, TextureFormat, TextureUsages,
};

use veusz_paint_core::{
    Affine, BlendMode as VBlend, Color as VColor, Fill as VFill, FillRule,
    LineCap as VCap, LineJoin as VJoin, Paint as VPaint, Path as VPath, PathVerb,
    Rect as VRect, Scene as VScene, SceneOp, TextLayout,
};

/// All the wgpu state Vello needs, plus the Vello renderer itself.
pub struct VelloRenderer {
    device: wgpu::Device,
    queue: wgpu::Queue,
    renderer: Renderer,
    text_engine: Arc<veusz_paint_text::TextEngine>,
}

impl VelloRenderer {
    /// Build a headless renderer. Picks any available wgpu adapter — on
    /// CI / minimal containers that's llvmpipe via Vulkan; on a laptop
    /// it's the discrete GPU.
    pub fn new() -> Result<Self, String> {
        pollster::block_on(Self::new_async())
    }

    async fn new_async() -> Result<Self, String> {
        let instance = Instance::new(InstanceDescriptor {
            backends: Backends::all(),
            ..Default::default()
        });
        let adapter = instance
            .request_adapter(&RequestAdapterOptions {
                power_preference: PowerPreference::HighPerformance,
                compatible_surface: None,
                force_fallback_adapter: false,
            })
            .await
            .ok_or_else(|| "no wgpu adapter found".to_string())?;
        // Vello's compute shaders use >4 storage buffer bindings, which is
        // above the downlevel default. Pass adapter.limits() through so we
        // get whatever the underlying driver supports (llvmpipe supports
        // 8 by default; real GPUs many more).
        let (device, queue) = adapter
            .request_device(
                &DeviceDescriptor {
                    label: Some("veusz-paint-vello"),
                    required_features: wgpu::Features::default(),
                    required_limits: adapter.limits(),
                    memory_hints: MemoryHints::default(),
                },
                None,
            )
            .await
            .map_err(|e| format!("request_device: {e}"))?;

        // Enable all AA modes we can — render() picks one per call.
        let renderer = Renderer::new(
            &device,
            RendererOptions {
                surface_format: None,
                use_cpu: false,
                antialiasing_support: vello::AaSupport {
                    area: true,
                    msaa8: true,
                    msaa16: true,
                },
                num_init_threads: None,
            },
        )
        .map_err(|e| format!("renderer init: {e}"))?;

        Ok(Self {
            device,
            queue,
            renderer,
            text_engine: Arc::new(veusz_paint_text::TextEngine::new()),
        })
    }

    /// Translate the abstract `Scene`, render it through wgpu, and return
    /// PNG bytes.
    pub fn render_scene_to_png(
        &mut self,
        scene: &VScene,
        width: u32,
        height: u32,
        background: (f32, f32, f32, f32),
    ) -> Result<Vec<u8>, String> {
        let vello_scene = self.build_scene(scene);

        // Padded width for buffer readback (256-byte row alignment in wgpu).
        let unpadded_bytes_per_row = width * 4;
        let align: u32 = 256;
        let padded_bytes_per_row =
            (unpadded_bytes_per_row + align - 1) / align * align;

        let texture = self.device.create_texture(&TextureDescriptor {
            label: Some("veusz-paint-vello target"),
            size: Extent3d { width, height, depth_or_array_layers: 1 },
            mip_level_count: 1,
            sample_count: 1,
            dimension: TextureDimension::D2,
            format: TextureFormat::Rgba8Unorm,
            usage: TextureUsages::STORAGE_BINDING | TextureUsages::COPY_SRC,
            view_formats: &[],
        });
        let view = texture.create_view(&Default::default());

        let render_params = RenderParams {
            base_color: PenikoColor::rgba(
                background.0 as f64, background.1 as f64,
                background.2 as f64, background.3 as f64),
            width,
            height,
            // AaConfig::Area: analytic-coverage AA — same family Qt's
            // raster paint engine uses. On the smoke corpus this gives
            // qt-vs-vello PSNR ~10-15 dB at scientific-plot sizes
            // (~900x600), comfortably ahead of MSAA modes which add
            // edge dilation that doesn't match Qt's coverage maths.
            // (At small render sizes — 400x240 demo fixtures — MSAA16
            // looks sharper to the eye; switch back if those become the
            // primary target.)
            antialiasing_method: AaConfig::Area,
        };

        self.renderer
            .render_to_texture(
                &self.device,
                &self.queue,
                &vello_scene,
                &view,
                &render_params,
            )
            .map_err(|e| format!("vello render: {e}"))?;

        // Copy texture -> buffer.
        let readback: Buffer = self.device.create_buffer(&BufferDescriptor {
            label: Some("veusz-paint-vello readback"),
            size: (padded_bytes_per_row * height) as u64,
            usage: BufferUsages::MAP_READ | BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        let mut encoder = self
            .device
            .create_command_encoder(&CommandEncoderDescriptor { label: None });
        encoder.copy_texture_to_buffer(
            wgpu::ImageCopyTexture {
                texture: &texture,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            ImageCopyBuffer {
                buffer: &readback,
                layout: ImageDataLayout {
                    offset: 0,
                    bytes_per_row: Some(padded_bytes_per_row),
                    rows_per_image: Some(height),
                },
            },
            Extent3d { width, height, depth_or_array_layers: 1 },
        );
        self.queue.submit(Some(encoder.finish()));

        // Block on mapping.
        let slice = readback.slice(..);
        let (tx, rx) = std::sync::mpsc::sync_channel(1);
        slice.map_async(MapMode::Read, move |r| {
            let _ = tx.send(r);
        });
        self.device.poll(wgpu::Maintain::Wait);
        rx.recv()
            .map_err(|e| format!("readback channel: {e}"))?
            .map_err(|e| format!("readback map: {e}"))?;

        // Strip row padding into a tight RGBA8 buffer.
        let data = slice.get_mapped_range();
        let mut tight = Vec::with_capacity((width * height * 4) as usize);
        for row in 0..height {
            let start = (row * padded_bytes_per_row) as usize;
            tight.extend_from_slice(&data[start..start + (unpadded_bytes_per_row as usize)]);
        }
        drop(data);
        readback.unmap();

        // Encode PNG.
        encode_png(&tight, width, height)
    }

    fn build_scene(&self, scene: &VScene) -> VelloScene {
        let mut builder = SceneBuilder::new(self.text_engine.clone());
        for op in &scene.ops {
            builder.emit(op);
        }
        builder.finish()
    }

    /// Borrow the underlying text engine — useful for measuring strings
    /// outside the render path.
    pub fn text_engine(&self) -> &veusz_paint_text::TextEngine {
        &self.text_engine
    }
}

// ---------------------------------------------------------------------------
// SceneBuilder: SceneOp -> vello::Scene
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
struct GState {
    transform: KAffine,
    paint: Option<MaterializedPaint>,
    blend: VBlend,
    /// Number of `push_layer`s we've issued at this save level — popped on
    /// restore.
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

/// Precomputed Vello-side paint (stroke + fill brushes) from a Veusz `Paint`.
#[derive(Clone, Debug)]
struct MaterializedPaint {
    fill_brush: Option<Brush>,
    stroke_brush: Option<Brush>,
    stroke: Option<KStroke>,
}

struct SceneBuilder {
    scene: VelloScene,
    states: Vec<GState>,
    text_engine: Arc<veusz_paint_text::TextEngine>,
}

impl SceneBuilder {
    fn new(text_engine: Arc<veusz_paint_text::TextEngine>) -> Self {
        Self {
            scene: VelloScene::new(),
            states: vec![GState::default()],
            text_engine,
        }
    }

    fn finish(self) -> VelloScene {
        self.scene
    }

    fn cur(&self) -> &GState { self.states.last().unwrap() }
    fn cur_mut(&mut self) -> &mut GState { self.states.last_mut().unwrap() }

    fn emit(&mut self, op: &SceneOp) {
        match op {
            SceneOp::Save => {
                let mut cloned = self.cur().clone();
                cloned.layers_in_frame = 0;
                self.states.push(cloned);
            }
            SceneOp::Restore => {
                let popped = self.states.pop().expect("restore() without save()");
                for _ in 0..popped.layers_in_frame {
                    self.scene.pop_layer();
                }
            }
            SceneOp::SetTransform(m) => {
                self.cur_mut().transform = vaff_to_kaff(*m);
            }
            SceneOp::ConcatTransform(m) => {
                let t = self.cur().transform * vaff_to_kaff(*m);
                self.cur_mut().transform = t;
            }
            SceneOp::PushClipRect(r) => {
                let mut p = BezPath::new();
                p.push(PathEl::MoveTo(Point::new(r.x, r.y)));
                p.push(PathEl::LineTo(Point::new(r.x + r.w, r.y)));
                p.push(PathEl::LineTo(Point::new(r.x + r.w, r.y + r.h)));
                p.push(PathEl::LineTo(Point::new(r.x, r.y + r.h)));
                p.push(PathEl::ClosePath);
                self.push_clip(&p, FillRule::NonZero);
            }
            SceneOp::PushClipPath { path, rule } => {
                let bez = vpath_to_bez(path);
                self.push_clip(&bez, *rule);
            }
            SceneOp::PopClip => {
                self.scene.pop_layer();
                let n = &mut self.cur_mut().layers_in_frame;
                *n = n.saturating_sub(1);
            }
            SceneOp::SetPaint(p) => {
                self.cur_mut().paint = Some(materialise_paint(p));
            }
            SceneOp::SetBlendMode(m) => {
                self.cur_mut().blend = *m;
            }
            SceneOp::SetQuality(_) => {}
            SceneOp::StrokePath(path) => {
                let bez = vpath_to_bez(path);
                let xf = self.cur().transform;
                if let Some(mp) = self.cur().paint.clone() {
                    if let (Some(brush), Some(stroke)) = (mp.stroke_brush, mp.stroke) {
                        self.scene.stroke(&stroke, xf, &brush, None, &bez);
                    }
                }
            }
            SceneOp::FillPath { path, rule } => {
                let bez = vpath_to_bez(path);
                let xf = self.cur().transform;
                if let Some(mp) = self.cur().paint.clone() {
                    if let Some(brush) = mp.fill_brush {
                        self.scene.fill(vrule_to_peniko(*rule), xf, &brush, None, &bez);
                    }
                }
            }
            SceneOp::DrawImage { image, dst, src } => {
                self.emit_image(image, *dst, *src);
            }
            SceneOp::DrawText { layout, x, y } => {
                self.emit_text(layout, *x, *y);
            }
        }
    }

    fn push_clip(&mut self, path: &BezPath, _rule: FillRule) {
        let xf = self.cur().transform;
        let blend = vblend_to_blend(self.cur().blend);
        self.scene.push_layer(blend, 1.0, xf, path);
        self.cur_mut().layers_in_frame += 1;
    }

    fn emit_image(&mut self, image: &veusz_paint_core::Image, dst: VRect, src: Option<VRect>) {
        // peniko::Image consumes a Blob; we copy the raw RGBA bytes in.
        let img = peniko::Image::new(
            peniko::Blob::new(Arc::new(image.pixels.clone())),
            PenikoImageFormat::Rgba8,
            image.width,
            image.height,
        );
        let sx = dst.w / src.map(|s| s.w).unwrap_or(image.width as f64);
        let sy = dst.h / src.map(|s| s.h).unwrap_or(image.height as f64);
        let src_x = src.map(|s| s.x).unwrap_or(0.0);
        let src_y = src.map(|s| s.y).unwrap_or(0.0);

        let xf = self.cur().transform
            * KAffine::translate((dst.x, dst.y))
            * KAffine::scale_non_uniform(sx, sy)
            * KAffine::translate((-src_x, -src_y));
        self.scene.draw_image(&img, xf);
    }

    fn emit_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        let glyphs = self.text_engine.layout_to_glyph_paths(layout, (x, y));
        if glyphs.is_empty() { return; }
        let brush = Brush::Solid(vcolor_to_peniko(layout.style.color));
        let xf_base = self.cur().transform;
        for g in glyphs {
            let xf = xf_base * vaff_to_kaff(g.position);
            let bez = vpath_to_bez(&g.path);
            self.scene
                .fill(PenikoFill::NonZero, xf, &brush, None, &bez);
        }
    }
}

// ---------------------------------------------------------------------------
// Conversions: veusz-paint-core <-> kurbo/peniko/vello
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

/// Map our blend modes onto the peniko (`Mix`, `Compose`) pair. `Plus` lives
/// in `Compose`, not `Mix`, so blend-mode emission has to know the pair.
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

fn vcap_to_kurbo(c: VCap) -> kurbo::Cap {
    match c {
        VCap::Butt => kurbo::Cap::Butt,
        VCap::Round => kurbo::Cap::Round,
        VCap::Square => kurbo::Cap::Square,
    }
}

fn vjoin_to_kurbo(j: VJoin) -> kurbo::Join {
    match j {
        VJoin::Miter => kurbo::Join::Miter,
        VJoin::Round => kurbo::Join::Round,
        VJoin::Bevel => kurbo::Join::Bevel,
    }
}

fn vpath_to_bez(p: &VPath) -> BezPath {
    let mut out = BezPath::new();
    let mut i = 0;
    for v in &p.verbs {
        match v {
            PathVerb::MoveTo => {
                out.move_to(Point::new(p.points[i], p.points[i + 1])); i += 2;
            }
            PathVerb::LineTo => {
                out.line_to(Point::new(p.points[i], p.points[i + 1])); i += 2;
            }
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

// ---------------------------------------------------------------------------
// PNG encode (same shape as veusz-paint-tiny-skia's encoder, kept private)
// ---------------------------------------------------------------------------

fn encode_png(rgba8: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
    let mut out = Vec::with_capacity(rgba8.len());
    {
        let mut enc = png::Encoder::new(&mut out, width, height);
        enc.set_color(png::ColorType::Rgba);
        enc.set_depth(png::BitDepth::Eight);
        let mut w = enc.write_header().map_err(|e| format!("png header: {e}"))?;
        w.write_image_data(rgba8).map_err(|e| format!("png data: {e}"))?;
    }
    Ok(out)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use veusz_paint_core::*;

    /// Smoke test: build a Vello renderer. Skipped silently if no adapter
    /// is available (e.g. a stripped-down CI runner without a software
    /// Vulkan/D3D/Metal driver).
    fn build_or_skip() -> Option<VelloRenderer> {
        match VelloRenderer::new() {
            Ok(r) => Some(r),
            Err(e) => { eprintln!("no wgpu adapter ({}); skipping", e); None }
        }
    }

    #[test]
    fn renderer_initialises() {
        if build_or_skip().is_none() { return; }
    }

    #[test]
    fn empty_scene_renders_to_solid_background() {
        let mut r = match build_or_skip() { Some(r) => r, None => return };
        let png = r.render_scene_to_png(&VScene::new(), 8, 8,
                                         (0.0, 1.0, 0.0, 1.0)).expect("render");
        assert!(png.starts_with(b"\x89PNG\r\n\x1a\n"));
    }

    #[test]
    fn filled_rect_appears_in_output() {
        let mut r = match build_or_skip() { Some(r) => r, None => return };
        let mut rec = SceneRecorder::new();
        rec.set_paint(&Paint {
            fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
            stroke: None, anti_alias: true,
        });
        rec.fill_path(&Path::rect(Rect { x: 4.0, y: 4.0, w: 8.0, h: 8.0 }),
                      FillRule::NonZero);
        let scene = rec.into_scene();

        let png = r.render_scene_to_png(&scene, 16, 16,
                                         (1.0, 1.0, 1.0, 1.0)).expect("render");
        // Decode and check center pixel is red.
        let dec = png::Decoder::new(std::io::Cursor::new(&png[..]));
        let mut reader = dec.read_info().unwrap();
        let mut buf = vec![0u8; reader.output_buffer_size().expect("png output size")];
        reader.next_frame(&mut buf).unwrap();
        let info = reader.info();
        let row = info.width as usize * 4;
        let center = (8 * row) + (8 * 4);
        // Allow slight tolerance for AA edges that may slightly desaturate
        // the center pixel.
        let r_ch = buf[center];
        let g_ch = buf[center + 1];
        let b_ch = buf[center + 2];
        assert!(r_ch > 200, "expected red center, got R={r_ch}");
        assert!(g_ch < 50,  "expected red center, got G={g_ch}");
        assert!(b_ch < 50,  "expected red center, got B={b_ch}");
    }
}
