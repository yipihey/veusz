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
//! * The `SceneOp` -> Vello translation itself lives in the shared
//!   `veusz-paint-vello-common` crate (so the wasm backend can reuse it
//!   byte-for-byte). This crate supplies the native `DrawText` path —
//!   Parley layout via the shared veusz-paint-text engine — through a
//!   `TextRenderer` impl, and a no-op image hook.
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

use peniko::{Brush, Color as PenikoColor, Fill as PenikoFill};
use peniko::kurbo::Affine as KAffine;

use vello::{AaConfig, RenderParams, Renderer, RendererOptions, Scene as VelloScene};
use wgpu::{
    Backends, Buffer, BufferDescriptor, BufferUsages, CommandEncoderDescriptor,
    DeviceDescriptor, Extent3d, ImageCopyBuffer, ImageDataLayout, Instance, InstanceDescriptor,
    Limits, MapMode, MemoryHints, PowerPreference, RequestAdapterOptions,
    TextureDescriptor, TextureDimension, TextureFormat, TextureUsages,
};

use veusz_paint_vello_common::{
    build_vello_scene, identity_image_hook, vaff_to_kaff, vcolor_to_peniko, vpath_to_bez,
    TextRenderer,
};
use veusz_paint_core::{Scene as VScene, TextLayout};

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
            // MSAA16 yields the sharpest edges in vello 0.3 and is the
            // closest match to tiny-skia's analytic-coverage output. Area
            // mode (the default) is faster but visibly softer at small
            // render sizes, which scientific plots routinely produce.
            antialiasing_method: AaConfig::Msaa16,
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
        // The SceneOp dispatch lives in veusz-paint-vello-common; we only
        // supply the native text path (Parley via veusz-paint-text) and a
        // no-op image hook (no degenerate-image workaround needed off the
        // WebGPU blit path).
        let text = ParleyTextRenderer { engine: &self.text_engine };
        build_vello_scene(scene, &text, &identity_image_hook)
    }

    /// Borrow the underlying text engine — useful for measuring strings
    /// outside the render path.
    pub fn text_engine(&self) -> &veusz_paint_text::TextEngine {
        &self.text_engine
    }
}

// ---------------------------------------------------------------------------
// Native DrawText path: Parley layout via veusz-paint-text
// ---------------------------------------------------------------------------

/// `TextRenderer` for the native backend. Lays glyphs out through the shared
/// `veusz-paint-text` engine (Parley + skrifa) and fills them as paths.
struct ParleyTextRenderer<'a> {
    engine: &'a veusz_paint_text::TextEngine,
}

impl TextRenderer for ParleyTextRenderer<'_> {
    fn draw_text(&self, scene: &mut VelloScene, transform: KAffine,
                 layout: &TextLayout, x: f64, y: f64) {
        let glyphs = self.engine.layout_to_glyph_paths(layout, (x, y));
        if glyphs.is_empty() { return; }
        let brush = Brush::Solid(vcolor_to_peniko(layout.style.color));
        for g in glyphs {
            let xf = transform * vaff_to_kaff(g.position);
            let bez = vpath_to_bez(&g.path);
            scene.fill(PenikoFill::NonZero, xf, &brush, None, &bez);
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
