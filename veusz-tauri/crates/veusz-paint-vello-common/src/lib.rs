//! Shared `Scene -> vello::Scene` translator.
//!
//! `veusz-paint-vello` (native GPU) and `veusz-paint-wasm` (WebGPU in a
//! browser) used to carry byte-for-byte copies of the entire `SceneOp`
//! dispatch loop plus the `GState` / `MaterializedPaint` structs and the
//! `v*_to_*` conversion helpers — the wasm crate's comments literally read
//! "deduplicated copy from veusz-paint-vello". This crate holds the single
//! authoritative copy.
//!
//! Why a separate crate (not just a `pub fn` in `veusz-paint-vello`)?
//! ----------------------------------------------------------------
//! `veusz-paint-vello` depends on `veusz-paint-text` -> `fontique`, which
//! is fontconfig-bound and does not compile cleanly for `wasm32`. Pulling
//! the native vello crate into the wasm crate just to reuse the translator
//! would drag that whole dependency tree onto the wasm target. So the
//! shared translator lives here, depending only on `vello` / `peniko` /
//! `kurbo` (all wasm-clean) and `veusz-paint-core`. Both backends depend on
//! this crate.
//!
//! What's parameterised
//! --------------------
//! The two real differences between the backends are handled via injection
//! points so the dispatch loop itself stays identical:
//!
//! * **Text** — `veusz-paint-vello` lays glyphs out with Parley (via
//!   `veusz-paint-text`); `veusz-paint-wasm` uses an embedded-font
//!   cmap+skrifa path. Each crate supplies a [`TextRenderer`].
//! * **Image preprocess** — `veusz-paint-wasm` has to pad 1xN / Nx1 images
//!   to work around a vello 0.3 / wgpu 22 WebGPU blit bug; the native crate
//!   passes the image through unchanged. Each crate supplies an
//!   [`ImageHook`].
//!
//! Device / surface setup (offscreen texture vs canvas surface) and PNG
//! readback stay in the respective backends — they're genuinely different.

#![forbid(unsafe_code)]

use peniko::{
    BlendMode as PenikoBlend, Brush, Color as PenikoColor, ColorStop, Compose, Extend,
    Fill as PenikoFill, Format as PenikoImageFormat, Gradient, Mix,
};
use peniko::kurbo::{Affine as KAffine, BezPath, PathEl, Point, Stroke as KStroke};
use vello::Scene as VelloScene;

use veusz_paint_core::{
    Affine, BlendMode as VBlend, Color as VColor, Fill as VFill, FillRule, Image,
    LineCap as VCap, LineJoin as VJoin, Paint as VPaint, Path as VPath, PathVerb,
    Rect as VRect, Scene as VScene, SceneOp, TextLayout,
};

// ---------------------------------------------------------------------------
// Injection points
// ---------------------------------------------------------------------------

/// Renders a `DrawText` op into the in-progress vello scene.
///
/// Each backend supplies its own implementation: the native crate routes
/// through Parley (`veusz-paint-text`), the wasm crate through an embedded
/// font + skrifa. The translator hands the renderer the current transform
/// (already resolved from the graphics-state stack) plus the baseline
/// origin; the renderer is responsible for laying out glyphs and filling
/// them onto `scene`.
pub trait TextRenderer {
    fn draw_text(&self, scene: &mut VelloScene, transform: KAffine,
                 layout: &TextLayout, x: f64, y: f64);
}

/// Optional last-chance rewrite of an image just before it's handed to
/// vello. The native backend uses [`identity_image_hook`]; the wasm backend
/// injects a degenerate-image pad (vello 0.3 / wgpu 22 WebGPU blit bug for
/// 1xN images). Returning `Cow::Borrowed` avoids a copy in the common case.
///
/// The higher-ranked `for<'i>` bound ties the returned `Cow`'s lifetime to
/// the borrow of *that* call's `&Image`, not to the hook value itself — so a
/// borrowing identity hook and an owning pad hook both fit one signature.
pub trait ImageHook {
    fn rewrite<'i>(&self, img: &'i Image) -> std::borrow::Cow<'i, Image>;
}

impl<F> ImageHook for F
where
    F: for<'i> Fn(&'i Image) -> std::borrow::Cow<'i, Image>,
{
    fn rewrite<'i>(&self, img: &'i Image) -> std::borrow::Cow<'i, Image> {
        self(img)
    }
}

/// Image hook that passes the image through unchanged. Used by the native
/// vello backend.
pub fn identity_image_hook(img: &Image) -> std::borrow::Cow<'_, Image> {
    std::borrow::Cow::Borrowed(img)
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/// Translate a backend-agnostic [`Scene`](VScene) into a `vello::Scene`.
///
/// `text` renders `DrawText` ops; `image_hook` gets a last-chance rewrite of
/// each image before it's drawn (pass [`identity_image_hook`] for none).
pub fn build_vello_scene(
    scene: &VScene,
    text: &dyn TextRenderer,
    image_hook: &dyn ImageHook,
) -> VelloScene {
    let mut builder = SceneBuilder::new(text, image_hook);
    for op in &scene.ops {
        builder.emit(op);
    }
    builder.finish()
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

struct SceneBuilder<'a> {
    scene: VelloScene,
    states: Vec<GState>,
    text: &'a dyn TextRenderer,
    image_hook: &'a dyn ImageHook,
}

impl<'a> SceneBuilder<'a> {
    fn new(text: &'a dyn TextRenderer, image_hook: &'a dyn ImageHook) -> Self {
        Self {
            scene: VelloScene::new(),
            states: vec![GState::default()],
            text,
            image_hook,
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
                let xf = self.cur().transform;
                self.text.draw_text(&mut self.scene, xf, layout, *x, *y);
            }
            SceneOp::DrawMarkers { path, xs, ys, scales, fill, stroke } => {
                // One marker path, instanced over the position arrays — keeps
                // huge scatters cheap (no per-marker op or path clone).
                let bez = vpath_to_bez(path);
                let base_xf = self.cur().transform;
                let mp = self.cur().paint.clone();
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
                                self.scene.fill(vrule_to_peniko(FillRule::NonZero), xf, brush, None, &bez);
                            }
                        }
                        if *stroke {
                            if let (Some(brush), Some(stroke_style)) = (&mp.stroke_brush, &mp.stroke) {
                                self.scene.stroke(stroke_style, xf, brush, None, &bez);
                            }
                        }
                    }
                }
            }
        }
    }

    fn push_clip(&mut self, path: &BezPath, _rule: FillRule) {
        let xf = self.cur().transform;
        let blend = vblend_to_blend(self.cur().blend);
        self.scene.push_layer(blend, 1.0, xf, path);
        self.cur_mut().layers_in_frame += 1;
    }

    fn emit_image(&mut self, image: &Image, dst: VRect, src: Option<VRect>) {
        // Optional backend rewrite (wasm pads degenerate images; native is
        // identity), then build a peniko::Image — it consumes a Blob, so we
        // copy the raw RGBA bytes in.
        let image = self.image_hook.rewrite(image);
        let img = peniko::Image::new(
            peniko::Blob::new(std::sync::Arc::new(image.pixels.clone())),
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
}

// ---------------------------------------------------------------------------
// Conversions: veusz-paint-core <-> kurbo/peniko/vello
// ---------------------------------------------------------------------------

pub fn vaff_to_kaff(m: Affine) -> KAffine {
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

pub fn vcolor_to_peniko(c: VColor) -> PenikoColor {
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

pub fn vpath_to_bez(p: &VPath) -> BezPath {
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
