//! Scene -> PDF emitter.
//!
//! Converts the abstract [`Scene`] from `veusz-paint-core` into a PDF
//! document via the `pdf-writer` crate. Shared between the tiny-skia and
//! Vello backends — the input is the backend-agnostic IR, not the
//! backend's native primitives.
//!
//! What's in
//! ---------
//! * Page size, white-or-coloured background.
//! * Path operations: stroke, fill (non-zero / even-odd), with current
//!   stroke/fill state.
//! * Solid fills and stroke colors.
//! * Gradient fills: linear (axial / type 2) and radial (type 3) as real
//!   PDF shading patterns, with an Exponential (2-stop) or Stitching
//!   (multi-stop) tint function. The pattern `/Matrix` bakes in the live CTM
//!   so the gradient lands in the same user space as the path.
//! * Dash patterns, line caps, line joins, miter limit, line width.
//! * Transforms: full affine concatenation. PDF's `cm` operator takes our
//!   `Affine` directly; we also track the accumulated CTM for gradients.
//! * Clipping: rect and arbitrary path, using PDF's `W` (clip) operator.
//!   `save`/`restore` honor PDF's `q`/`Q` graphics-state stack.
//! * Image embedding: RGBA8 -> 8-bit-per-channel RGB image with a
//!   Flate-compressed SMask alpha channel. The `src` crop rect is honored
//!   by copying out the cropped pixels (PDF has no source sampler).
//! * Blend modes: SourceOver (Normal) and Multiply via per-mode ExtGState
//!   resources. `Plus` (additive) has no PDF separable-blend equivalent and
//!   degrades to Normal — see `apply_blend_mode`.
//!
//! What's deferred
//! ---------------
//! * Text. Real glyphs are drawn as filled paths via Parley + skrifa, with
//!   a dashed bounding-box placeholder when no font is found. Subsetted
//!   Type0/CIDFont embedding (smaller streams, selectable text) lands with
//!   the font-embedding integration (plan §5).
//!
//! PDF conventions
//! ---------------
//! PDF's y-axis points up; we paint with our `Affine` interpreted in a
//! top-left origin like screen coords. The page's CTM is set on entry to
//! flip y, so caller code can keep using its existing coordinate
//! conventions.

#![forbid(unsafe_code)]

use pdf_writer::types::{BlendMode, FunctionShadingType, LineCapStyle, LineJoinStyle};
use pdf_writer::{Content, Filter, Finish, Name, Pdf, Rect as PdfRect, Ref, TextStr};

use veusz_paint_core::{
    Affine, BlendMode as VBlendMode, Color, Fill, FillRule, Paint, Path, PathVerb, Scene,
    SceneOp, Stroke, TextLayout, Rect as VRect, LineCap, LineJoin,
};

/// Render a [`Scene`] into a single-page PDF.
///
/// `width` / `height` are page dimensions in PDF points (1/72 inch). The
/// page background is filled with `background` before scene replay.
pub fn render_scene_to_pdf(
    scene: &Scene,
    width: f64,
    height: f64,
    background: (f32, f32, f32, f32),
) -> Result<Vec<u8>, String> {
    let mut emitter = PdfEmitter::new(width, height, background);
    emitter.run(scene);
    emitter.finish()
}

// ---------------------------------------------------------------------------
// Emitter
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
struct GraphicsState {
    /// Current fill: solid colour (eager `rg`), a gradient shading pattern
    /// (set lazily at fill time, since it needs the live CTM), or none.
    fill: FillState,
    has_stroke_color: bool,
    /// Number of clip frames pushed at this save level. Restored on pop.
    clips_in_frame: usize,
    /// Accumulated CTM (including the page's base y-flip). Tracked so a
    /// gradient pattern can bake the live transform into its `/Matrix` —
    /// PDF pattern matrices map pattern space to the page's *default*
    /// coordinate system, not through the CTM in force at fill time.
    ctm: Affine,
}

/// What the current paint's fill is, if any.
#[derive(Clone, Debug)]
enum FillState {
    None,
    /// A solid colour was already emitted with `rg`.
    Solid,
    /// A gradient; the shading objects are written at `finish()`. Carries
    /// the gradient plus the CTM captured when the paint was applied, so the
    /// pattern's `/Matrix` reproduces the user space the coords were given in.
    Gradient(Box<Fill>, Affine),
}

impl GraphicsState {
    fn new(ctm: Affine) -> Self {
        Self {
            fill: FillState::None,
            has_stroke_color: false,
            clips_in_frame: 0,
            ctm,
        }
    }
}

struct PdfEmitter {
    width: f64,
    height: f64,
    content: Content,
    states: Vec<GraphicsState>,
    images: Vec<EmbeddedImage>, // collected during run, written at finish
    text_engine: Option<veusz_paint_text::TextEngine>,
    /// Gradient shading patterns collected during run, written + named
    /// (`/Sh0`, `/Sh1`, ...) at finish. Each carries the gradient and the
    /// pattern `/Matrix` (the captured CTM).
    gradients: Vec<(Fill, Affine)>,
    /// Distinct non-Normal blend modes seen, written as ExtGState resources
    /// (`/Gs0`, ...) at finish.
    blend_states: Vec<BlendMode>,
}

struct EmbeddedImage {
    width: u32,
    height: u32,
    rgb: Vec<u8>,   // 3 bytes/pixel, flate-deflated below
    alpha: Vec<u8>, // 1 byte/pixel
}

impl PdfEmitter {
    fn new(width: f64, height: f64, background: (f32, f32, f32, f32)) -> Self {
        let mut content = Content::new();
        // Flip the y-axis so screen-style coords work. This is the page's
        // base CTM; we track it so gradient pattern matrices land in the
        // same coordinate system the paths are drawn in.
        let base_ctm = Affine { a: 1.0, b: 0.0, c: 0.0, d: -1.0, e: 0.0, f: height };
        content.transform([1.0, 0.0, 0.0, -1.0, 0.0, height as f32]);
        // Paint the page background.
        content.save_state();
        content.set_fill_rgb(background.0, background.1, background.2);
        content.rect(0.0, 0.0, width as f32, height as f32);
        content.fill_nonzero();
        content.restore_state();

        Self {
            width,
            height,
            content,
            states: vec![GraphicsState::new(base_ctm)],
            images: Vec::new(),
            text_engine: None,
            gradients: Vec::new(),
            blend_states: Vec::new(),
        }
    }

    fn cur(&self) -> &GraphicsState {
        self.states.last().expect("state stack underflow")
    }

    fn cur_mut(&mut self) -> &mut GraphicsState {
        self.states.last_mut().expect("state stack underflow")
    }

    fn run(&mut self, scene: &Scene) {
        for op in &scene.ops {
            self.emit(op);
        }
    }

    fn emit(&mut self, op: &SceneOp) {
        match op {
            SceneOp::Save => {
                self.content.save_state();
                // Inherit the parent's fill / stroke / CTM (PDF's `q` saves
                // the whole graphics state); only the clip counter resets.
                let mut cloned = self.cur().clone();
                cloned.clips_in_frame = 0;
                self.states.push(cloned);
            }
            SceneOp::Restore => {
                self.content.restore_state();
                self.states.pop().expect("restore() without save()");
            }
            SceneOp::SetTransform(m) => {
                // Replace CTM: PDF doesn't have a "set", only "concat". We
                // approximate by restoring + saving + concatenating. The
                // outer save_state / restore_state still bracket correctly
                // because we don't change the save depth.
                // For now we treat SetTransform as a relative concat — same
                // semantics as ConcatTransform, since widget code uses
                // concat-style state and the recorder normalises both.
                self.concat(*m);
            }
            SceneOp::ConcatTransform(m) => self.concat(*m),
            SceneOp::PushClipRect(r) => {
                self.content.rect(r.x as f32, r.y as f32, r.w as f32, r.h as f32);
                self.content.clip_nonzero();
                self.content.end_path();
                self.cur_mut().clips_in_frame += 1;
            }
            SceneOp::PushClipPath { path, rule } => {
                emit_path(&mut self.content, path);
                match rule {
                    FillRule::NonZero => self.content.clip_nonzero(),
                    FillRule::EvenOdd => self.content.clip_even_odd(),
                };
                self.content.end_path();
                self.cur_mut().clips_in_frame += 1;
            }
            SceneOp::PopClip => {
                // PDF has no "pop clip" without save/restore. Real Veusz
                // clips are always pushed inside a save() frame (the
                // recording layer guarantees this); pop_clip is a no-op for
                // PDF. We just decrement our counter for diagnostics.
                let n = &mut self.cur_mut().clips_in_frame;
                *n = n.saturating_sub(1);
            }
            SceneOp::SetPaint(p) => self.apply_paint(p),
            SceneOp::SetBlendMode(m) => self.apply_blend_mode(*m),
            SceneOp::SetQuality(_) => { /* PDF doesn't have raster hints */ }
            SceneOp::StrokePath(p) => {
                if !self.cur().has_stroke_color { return; }
                emit_path(&mut self.content, p);
                self.content.stroke();
            }
            SceneOp::FillPath { path, rule } => {
                match self.cur().fill.clone() {
                    FillState::None => {}
                    FillState::Solid => {
                        emit_path(&mut self.content, path);
                        match rule {
                            FillRule::NonZero => self.content.fill_nonzero(),
                            FillRule::EvenOdd => self.content.fill_even_odd(),
                        };
                    }
                    FillState::Gradient(fill, ctm) => {
                        let name = self.register_gradient(*fill, ctm);
                        self.content.save_state();
                        self.content.set_fill_color_space(pdf_writer::types::ColorSpaceOperand::Pattern);
                        self.content.set_fill_pattern(
                            std::iter::empty::<f32>(),
                            Name(name.as_bytes()),
                        );
                        emit_path(&mut self.content, path);
                        match rule {
                            FillRule::NonZero => self.content.fill_nonzero(),
                            FillRule::EvenOdd => self.content.fill_even_odd(),
                        };
                        self.content.restore_state();
                    }
                }
            }
            SceneOp::DrawImage { image, dst, src } => {
                // Honor the `src` crop rect: PDF can't sample a sub-rectangle
                // of an XObject the way the raster backends do, so we embed
                // only the cropped pixels and map *those* onto `dst`. Matches
                // vello / tiny-skia (which crop the source then scale to dst).
                let id = self.embed_image(image, *src);
                // Place the image: PDF's image operator expects a unit
                // square mapped via CTM.
                self.content.save_state();
                self.content.transform([
                    dst.w as f32, 0.0, 0.0, dst.h as f32,
                    dst.x as f32, dst.y as f32,
                ]);
                self.content.x_object(Name(format!("Im{}", id).as_bytes()));
                self.content.restore_state();
            }
            SceneOp::DrawText { layout, x, y } => {
                self.emit_text(layout, *x, *y);
            }
            SceneOp::DrawMarkers { path, xs, ys, scales, fill, stroke } => {
                // Markers with a gradient fill: register the pattern once and
                // set it as the fill colour before instancing (the gradient
                // is shared across markers; matrix is the captured CTM).
                let fill_pattern = match self.cur().fill.clone() {
                    FillState::Gradient(g, ctm) => Some(self.register_gradient(*g, ctm)),
                    _ => None,
                };
                let has_fill = *fill && !matches!(self.cur().fill, FillState::None);
                let has_stroke = self.cur().has_stroke_color;
                if has_fill {
                    if let Some(name) = &fill_pattern {
                        self.content.set_fill_color_space(
                            pdf_writer::types::ColorSpaceOperand::Pattern);
                        self.content.set_fill_pattern(
                            std::iter::empty::<f32>(), Name(name.as_bytes()));
                    }
                }
                let n = xs.len().min(ys.len());
                for i in 0..n {
                    let s = scales.as_ref()
                        .filter(|v| !v.is_empty())
                        .map(|v| v[i % v.len()])
                        .unwrap_or(1.0);
                    // CTM concat: scale the marker then translate to (x, y),
                    // bracketed so it doesn't leak into the next marker.
                    self.content.save_state();
                    self.content.transform([
                        s as f32, 0.0, 0.0, s as f32, xs[i] as f32, ys[i] as f32,
                    ]);
                    // NOTE: a gradient marker fill samples one page-space
                    // shading shared by all instances (a shading pattern's
                    // matrix is fixed to the captured CTM, so it can't follow
                    // each marker's per-instance scale/translate). Veusz
                    // markers are effectively always solid, so this is fine.
                    if has_fill {
                        emit_path(&mut self.content, path);
                        self.content.fill_nonzero();
                    }
                    if *stroke && has_stroke {
                        emit_path(&mut self.content, path);
                        self.content.stroke();
                    }
                    self.content.restore_state();
                }
            }
        }
    }

    fn concat(&mut self, m: Affine) {
        self.content.transform([
            m.a as f32, m.b as f32, m.c as f32, m.d as f32,
            m.e as f32, m.f as f32,
        ]);
        // PDF `cm` premultiplies the operand onto the CTM (row-vector
        // convention): CTM' = m · CTM.
        let cur = self.cur().ctm;
        self.cur_mut().ctm = m.then(cur);
    }

    fn apply_paint(&mut self, p: &Paint) {
        match &p.fill {
            Some(Fill::Solid(c)) => {
                self.content.set_fill_rgb(c.r, c.g, c.b);
                self.cur_mut().fill = FillState::Solid;
            }
            Some(grad @ (Fill::Linear(_) | Fill::Radial(_))) => {
                // Defer: the shading pattern + its `/Matrix` (the live CTM)
                // are emitted at fill time, since `cm` may still change.
                let ctm = self.cur().ctm;
                self.cur_mut().fill = FillState::Gradient(Box::new(grad.clone()), ctm);
            }
            None => {
                self.cur_mut().fill = FillState::None;
            }
        }
        if let Some(stroke) = &p.stroke {
            self.apply_stroke(stroke);
            self.cur_mut().has_stroke_color = true;
        } else {
            self.cur_mut().has_stroke_color = false;
        }
    }

    /// Register a gradient as a shading pattern, returning the resource name
    /// (`Sh0`, `Sh1`, ...) to reference with `scn`. The shading + tint
    /// function objects are written at `finish()`; here we just record the
    /// gradient and its pattern matrix.
    fn register_gradient(&mut self, fill: Fill, ctm: Affine) -> String {
        let idx = self.gradients.len();
        self.gradients.push((fill, ctm));
        format!("Sh{idx}")
    }

    /// Apply a blend mode. SourceOver is PDF's default (Normal) — no op.
    /// Multiply maps directly. `Plus` (additive) has no PDF separable blend
    /// equivalent, so we leave it Normal (documented limitation); the audit
    /// shows Veusz uses Plus only in a couple of niche overlays.
    fn apply_blend_mode(&mut self, m: VBlendMode) {
        let pdf_mode = match m {
            VBlendMode::SourceOver => BlendMode::Normal,
            VBlendMode::Multiply => BlendMode::Multiply,
            VBlendMode::Plus => BlendMode::Normal, // no PDF additive blend
        };
        // Normal is the default graphics state; skip the resource churn.
        if matches!(pdf_mode, BlendMode::Normal) {
            return;
        }
        // Reuse an ExtGState resource if we've already emitted this mode.
        let idx = match self.blend_states.iter().position(|b| *b == pdf_mode) {
            Some(i) => i,
            None => {
                self.blend_states.push(pdf_mode);
                self.blend_states.len() - 1
            }
        };
        self.content.set_parameters(Name(format!("Gs{idx}").as_bytes()));
    }

    fn apply_stroke(&mut self, s: &Stroke) {
        self.content.set_stroke_rgb(s.color.r, s.color.g, s.color.b);
        self.content.set_line_width(s.width as f32);
        self.content.set_line_cap(match s.cap {
            LineCap::Butt => LineCapStyle::ButtCap,
            LineCap::Round => LineCapStyle::RoundCap,
            LineCap::Square => LineCapStyle::ProjectingSquareCap,
        });
        self.content.set_line_join(match s.join {
            LineJoin::Miter => LineJoinStyle::MiterJoin,
            LineJoin::Round => LineJoinStyle::RoundJoin,
            LineJoin::Bevel => LineJoinStyle::BevelJoin,
        });
        self.content.set_miter_limit(s.miter_limit as f32);
        if let Some(dash) = &s.dash {
            let pat: Vec<f32> = dash.iter().map(|x| *x as f32).collect();
            self.content.set_dash_pattern(pat, 0.0);
        } else {
            self.content.set_dash_pattern(std::iter::empty::<f32>(), 0.0);
        }
    }

    fn embed_image(&mut self, image: &veusz_paint_core::Image, src: Option<VRect>) -> usize {
        // Resolve the source crop into integer pixel bounds (the raster
        // backends sample a `src` sub-rectangle of the image before scaling
        // to `dst`; PDF has no equivalent sampler, so we copy the crop out).
        // `src` is in image pixel space; clamp to the image and round to
        // whole pixels so we copy a well-defined block.
        let (cx, cy, cw, ch) = match src {
            Some(s) => {
                let x0 = s.x.max(0.0).min(image.width as f64);
                let y0 = s.y.max(0.0).min(image.height as f64);
                let x1 = (s.x + s.w).max(0.0).min(image.width as f64);
                let y1 = (s.y + s.h).max(0.0).min(image.height as f64);
                let x0 = x0.floor() as u32;
                let y0 = y0.floor() as u32;
                // ceil the far edge so a fractional crop still includes the
                // partially-covered pixel, then guarantee at least 1px.
                let w = ((x1.ceil() as u32).saturating_sub(x0)).max(1)
                    .min(image.width - x0.min(image.width.saturating_sub(1)));
                let h = ((y1.ceil() as u32).saturating_sub(y0)).max(1)
                    .min(image.height - y0.min(image.height.saturating_sub(1)));
                (x0.min(image.width.saturating_sub(1)), y0.min(image.height.saturating_sub(1)), w, h)
            }
            None => (0, 0, image.width, image.height),
        };

        let n = (cw * ch) as usize;
        let mut rgb = Vec::with_capacity(3 * n);
        let mut alpha = Vec::with_capacity(n);
        for row in cy..cy + ch {
            for col in cx..cx + cw {
                let i = ((row * image.width + col) * 4) as usize;
                rgb.push(image.pixels[i]);
                rgb.push(image.pixels[i + 1]);
                rgb.push(image.pixels[i + 2]);
                alpha.push(image.pixels[i + 3]);
            }
        }
        let id = self.images.len();
        self.images.push(EmbeddedImage {
            width: cw, height: ch, rgb, alpha,
        });
        id
    }

    fn emit_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        // Real text via Parley + skrifa: glyphs as filled paths in PDF.
        // Portable (no font subsetting required), at the cost of larger
        // streams. PDF Type0/CIDFont embedding lands in a follow-up.
        if self.text_engine.is_none() {
            self.text_engine = Some(veusz_paint_text::TextEngine::new());
        }
        let glyphs = self.text_engine.as_ref().unwrap()
            .layout_to_glyph_paths(layout, (x, y));
        if glyphs.is_empty() {
            self.emit_text_placeholder(layout, x, y);
            return;
        }
        self.content.save_state();
        self.content.set_fill_rgb(
            layout.style.color.r, layout.style.color.g, layout.style.color.b);
        for g in glyphs {
            self.content.save_state();
            self.content.transform([
                g.position.a as f32, g.position.b as f32,
                g.position.c as f32, g.position.d as f32,
                g.position.e as f32, g.position.f as f32,
            ]);
            emit_path(&mut self.content, &g.path);
            self.content.fill_nonzero();
            self.content.restore_state();
        }
        self.content.restore_state();
    }

    fn emit_text_placeholder(&mut self, layout: &TextLayout, x: f64, y: f64) {
        // Fallback when no fonts are available.
        let w = 0.6 * layout.style.size_pt * (layout.text.chars().count() as f64);
        let h = layout.style.size_pt;
        self.content.save_state();
        self.content.set_stroke_rgb(
            layout.style.color.r, layout.style.color.g, layout.style.color.b);
        self.content.set_line_width(0.5);
        self.content.set_dash_pattern([2.0_f32, 2.0_f32], 0.0);
        self.content.rect(x as f32, (y - h) as f32, w as f32, h as f32);
        self.content.stroke();
        self.content.restore_state();
    }

    fn finish(self) -> Result<Vec<u8>, String> {
        // Assemble the final PDF.
        let mut pdf = Pdf::new();

        let mut next_id: i32 = 1;
        let mut alloc = || -> Ref { let r = Ref::new(next_id); next_id += 1; r };
        let catalog_id = alloc();
        let page_tree_id = alloc();
        let page_id = alloc();
        let content_id = alloc();

        // pre-allocate image object refs
        let mut image_refs: Vec<(Ref, Ref)> = Vec::new();
        for _ in &self.images {
            let img_ref = alloc();
            let smask_ref = alloc();
            image_refs.push((img_ref, smask_ref));
        }

        // Pre-allocate gradient refs: one shading-pattern object + one tint
        // function object per gradient.
        let mut gradient_refs: Vec<(Ref, Ref)> = Vec::new();
        for _ in &self.gradients {
            let pattern_ref = alloc();
            let func_ref = alloc();
            gradient_refs.push((pattern_ref, func_ref));
        }

        // Pre-allocate one ExtGState object per distinct blend mode.
        let mut blend_refs: Vec<Ref> = Vec::new();
        for _ in &self.blend_states {
            blend_refs.push(alloc());
        }

        pdf.catalog(catalog_id).pages(page_tree_id);
        pdf.pages(page_tree_id).count(1).kids([page_id]);

        let mut page = pdf.page(page_id);
        page.parent(page_tree_id)
            .media_box(PdfRect::new(0.0, 0.0, self.width as f32, self.height as f32))
            .contents(content_id);

        let has_resources = !self.images.is_empty()
            || !gradient_refs.is_empty()
            || !blend_refs.is_empty();
        if has_resources {
            let mut resources = page.resources();
            if !self.images.is_empty() {
                let mut x_objects = resources.x_objects();
                for (i, (img_ref, _)) in image_refs.iter().enumerate() {
                    x_objects.pair(Name(format!("Im{}", i).as_bytes()), *img_ref);
                }
                x_objects.finish();
            }
            if !gradient_refs.is_empty() {
                let mut patterns = resources.patterns();
                for (i, (pattern_ref, _)) in gradient_refs.iter().enumerate() {
                    patterns.pair(Name(format!("Sh{}", i).as_bytes()), *pattern_ref);
                }
                patterns.finish();
            }
            if !blend_refs.is_empty() {
                let mut ext = resources.ext_g_states();
                for (i, gs_ref) in blend_refs.iter().enumerate() {
                    ext.pair(Name(format!("Gs{}", i).as_bytes()), *gs_ref);
                }
                ext.finish();
            }
            resources.finish();
        }
        page.finish();

        // Content stream — Flate-compressed.
        let content_bytes = self.content.finish();
        let compressed = compress(&content_bytes);
        pdf.stream(content_id, &compressed)
            .filter(Filter::FlateDecode);

        // Image objects.
        //
        // ImageXObject derefs to Stream, so once we call .filter() we lose
        // the ImageXObject method surface (.width, .height, .color_space,
        // ...). Call those first, .filter() last.
        for (i, image) in self.images.iter().enumerate() {
            let (img_ref, smask_ref) = image_refs[i];

            // RGB image stream
            let rgb_compressed = compress(&image.rgb);
            let mut x = pdf.image_xobject(img_ref, &rgb_compressed);
            x.width(image.width as i32);
            x.height(image.height as i32);
            x.bits_per_component(8);
            x.color_space().device_rgb();
            x.s_mask(smask_ref);
            x.filter(Filter::FlateDecode);
            x.finish();

            // Alpha as a single-channel SMask
            let alpha_compressed = compress(&image.alpha);
            let mut sm = pdf.image_xobject(smask_ref, &alpha_compressed);
            sm.width(image.width as i32);
            sm.height(image.height as i32);
            sm.bits_per_component(8);
            sm.color_space().device_gray();
            sm.filter(Filter::FlateDecode);
            sm.finish();
        }

        // Gradient objects: tint function + axial/radial shading + the
        // shading pattern that the content stream references by `/ShN`.
        for (i, (fill, ctm)) in self.gradients.iter().enumerate() {
            let (pattern_ref, func_ref) = gradient_refs[i];
            let stops = match fill {
                Fill::Linear(g) => &g.stops,
                Fill::Radial(g) => &g.stops,
                Fill::Solid(_) => continue, // never registered as a gradient
            };
            // Sub-function refs for the >2-stop stitching case. Allocated
            // lazily so the common 2-stop path stays at one function object.
            let mut sub_refs: Vec<Ref> = Vec::new();
            if stops.len() > 2 {
                for _ in 0..stops.len().saturating_sub(1) {
                    sub_refs.push(alloc());
                }
            }
            write_tint_function(&mut pdf, func_ref, stops, &sub_refs);
            for (seg, sub_ref) in sub_refs.iter().enumerate() {
                // Each segment interpolates between two adjacent stops.
                write_exponential_segment(
                    &mut pdf, *sub_ref, stops[seg].color, stops[seg + 1].color);
            }

            // Shading dictionary (carried inline on the pattern).
            let (kind, coords): (FunctionShadingType, Vec<f32>) = match fill {
                Fill::Linear(g) => (
                    FunctionShadingType::Axial,
                    vec![g.start.0 as f32, g.start.1 as f32,
                         g.end.0 as f32, g.end.1 as f32],
                ),
                Fill::Radial(g) => (
                    FunctionShadingType::Radial,
                    // Concentric circles: inner radius 0 at the centre out to
                    // `radius`.
                    vec![g.center.0 as f32, g.center.1 as f32, 0.0,
                         g.center.0 as f32, g.center.1 as f32, g.radius as f32],
                ),
                Fill::Solid(_) => unreachable!(),
            };
            let mut pattern = pdf.shading_pattern(pattern_ref);
            // Bake the captured CTM into the pattern matrix so the gradient
            // lands in the same user space the path coords were given in.
            pattern.matrix([
                ctm.a as f32, ctm.b as f32, ctm.c as f32,
                ctm.d as f32, ctm.e as f32, ctm.f as f32,
            ]);
            let mut shading = pattern.function_shading();
            shading.shading_type(kind);
            shading.color_space().device_rgb();
            shading.coords(coords);
            shading.function(func_ref);
            // Clamp (pad) beyond the gradient endpoints, matching the raster
            // backends' Extend::Pad.
            shading.extend([true, true]);
            shading.finish();
        }

        // Blend-mode ExtGState objects.
        for (i, mode) in self.blend_states.iter().enumerate() {
            pdf.ext_graphics(blend_refs[i]).blend_mode(*mode);
        }

        pdf.document_info(alloc())
            .producer(TextStr("veusz-paint-pdf"));

        Ok(pdf.finish())
    }
}

/// Write the tint function that maps the shading parameter t in [0,1] to an
/// RGB colour. Two stops collapse to a single Exponential (type 2); more
/// stops use a Stitching function (type 3) over per-segment Exponentials.
fn write_tint_function(pdf: &mut Pdf, func_ref: Ref,
                       stops: &[veusz_paint_core::GradientStop], sub_refs: &[Ref]) {
    if stops.len() <= 1 {
        // Degenerate: a constant colour. Emit a flat exponential.
        let c = stops.first().map(|s| s.color).unwrap_or(Color::BLACK);
        let mut f = pdf.exponential_function(func_ref);
        f.domain([0.0, 1.0]);
        f.range([0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
        f.c0([c.r, c.g, c.b]);
        f.c1([c.r, c.g, c.b]);
        f.n(1.0);
        return;
    }
    if stops.len() == 2 {
        let (a, b) = (stops[0].color, stops[1].color);
        let mut f = pdf.exponential_function(func_ref);
        f.domain([0.0, 1.0]);
        f.range([0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
        f.c0([a.r, a.g, a.b]);
        f.c1([b.r, b.g, b.b]);
        f.n(1.0);
        return;
    }
    // Multi-stop: stitch the per-segment exponentials at the stop offsets.
    let mut f = pdf.stitching_function(func_ref);
    f.domain([0.0, 1.0]);
    f.range([0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
    f.functions(sub_refs.iter().copied());
    // Interior stop offsets are the stitch boundaries.
    let bounds: Vec<f32> = stops[1..stops.len() - 1].iter().map(|s| s.offset).collect();
    f.bounds(bounds);
    // Each sub-function spans the full [0,1] domain.
    let mut encode = Vec::with_capacity(sub_refs.len() * 2);
    for _ in sub_refs {
        encode.push(0.0);
        encode.push(1.0);
    }
    f.encode(encode);
}

/// One linear RGB interpolation segment between two colours, as an
/// Exponential function with n = 1.
fn write_exponential_segment(pdf: &mut Pdf, id: Ref, a: Color, b: Color) {
    let mut f = pdf.exponential_function(id);
    f.domain([0.0, 1.0]);
    f.range([0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
    f.c0([a.r, a.g, a.b]);
    f.c1([b.r, b.g, b.b]);
    f.n(1.0);
}

fn emit_path(content: &mut Content, p: &Path) {
    let mut i = 0;
    for verb in &p.verbs {
        match verb {
            PathVerb::MoveTo => {
                content.move_to(p.points[i] as f32, p.points[i + 1] as f32);
                i += 2;
            }
            PathVerb::LineTo => {
                content.line_to(p.points[i] as f32, p.points[i + 1] as f32);
                i += 2;
            }
            PathVerb::QuadTo => {
                // PDF has no quadratic primitive; convert to a cubic by
                // raising degree: C1 = M + 2/3 (Q - M), C2 = E + 2/3 (Q - E).
                let (mx, my) = current_point(p, i);
                let (cx, cy) = (p.points[i] as f32, p.points[i + 1] as f32);
                let (ex, ey) = (p.points[i + 2] as f32, p.points[i + 3] as f32);
                let c1 = (mx + 2.0 / 3.0 * (cx - mx), my + 2.0 / 3.0 * (cy - my));
                let c2 = (ex + 2.0 / 3.0 * (cx - ex), ey + 2.0 / 3.0 * (cy - ey));
                content.cubic_to(c1.0, c1.1, c2.0, c2.1, ex, ey);
                i += 4;
            }
            PathVerb::CubicTo => {
                content.cubic_to(
                    p.points[i] as f32, p.points[i + 1] as f32,
                    p.points[i + 2] as f32, p.points[i + 3] as f32,
                    p.points[i + 4] as f32, p.points[i + 5] as f32,
                );
                i += 6;
            }
            PathVerb::Close => { content.close_path(); }
        }
    }
}

/// Best-effort current-point extraction for `quad_to` -> cubic conversion.
/// pdf-writer's `Content` doesn't expose state; we rewalk the verb stream
/// up to `idx` to find the last point. Acceptable since this is only used
/// when a widget emits a quad, which the audit shows is rare.
fn current_point(p: &Path, idx: usize) -> (f32, f32) {
    let mut last = (0.0_f32, 0.0_f32);
    let mut i = 0;
    for verb in &p.verbs {
        if i >= idx { break; }
        match verb {
            PathVerb::MoveTo | PathVerb::LineTo => {
                last = (p.points[i] as f32, p.points[i + 1] as f32);
                i += 2;
            }
            PathVerb::QuadTo => {
                last = (p.points[i + 2] as f32, p.points[i + 3] as f32);
                i += 4;
            }
            PathVerb::CubicTo => {
                last = (p.points[i + 4] as f32, p.points[i + 5] as f32);
                i += 6;
            }
            PathVerb::Close => {}
        }
    }
    last
}

fn compress(data: &[u8]) -> Vec<u8> {
    use flate2::write::ZlibEncoder;
    use flate2::Compression;
    use std::io::Write;
    let mut enc = ZlibEncoder::new(Vec::new(), Compression::default());
    enc.write_all(data).expect("zlib encode (in-memory write)");
    enc.finish().expect("zlib finish")
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use veusz_paint_core::*;

    fn scene_with(ops: impl FnOnce(&mut SceneRecorder)) -> Scene {
        let mut rec = SceneRecorder::new();
        ops(&mut rec);
        rec.into_scene()
    }

    #[test]
    fn empty_scene_produces_valid_pdf_header() {
        let pdf = render_scene_to_pdf(&Scene::new(), 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        assert!(pdf.starts_with(b"%PDF-"), "must begin with PDF magic");
        assert!(pdf.windows(5).any(|w| w == b"%%EOF"),
                "must contain %%EOF marker");
    }

    #[test]
    fn fill_red_rect_produces_pdf_with_rg_op() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }),
                          FillRule::NonZero);
        });
        let pdf = render_scene_to_pdf(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        assert!(pdf.starts_with(b"%PDF-"));
        // The compressed stream is flate-encoded, so we can't grep the raw
        // bytes. Decompress and look for the "rg" operator.
        let body = decompress_first_stream(&pdf).expect("first stream");
        assert!(body.windows(2).any(|w| w == b"rg" || w == b"RG"),
                "expected color operator in content stream");
        // And the fill ("f" or "f*") operator.
        assert!(body.split(|b| *b == b' ' || *b == b'\n')
                    .any(|tok| tok == b"f" || tok == b"f*"),
                "expected fill operator");
    }

    #[test]
    fn save_restore_balanced_in_output() {
        let scene = scene_with(|rec| {
            rec.save();
            rec.save();
            rec.restore();
            rec.restore();
        });
        let pdf = render_scene_to_pdf(&scene, 50.0, 50.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let body = decompress_first_stream(&pdf).expect("first stream");
        // Same number of `q` and `Q` tokens.
        let q = body.split(|b| *b == b'\n').filter(|l| *l == b"q").count();
        let big_q = body.split(|b| *b == b'\n').filter(|l| *l == b"Q").count();
        assert!(q > 0 && q == big_q, "q={q} Q={big_q}, must match");
    }

    #[test]
    fn dashed_stroke_emits_dash_op() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: None,
                stroke: Some(Stroke {
                    color: Color::BLACK, width: 1.0,
                    dash: Some(vec![4.0, 2.0]),
                    cap: LineCap::Butt, join: LineJoin::Miter, miter_limit: 4.0,
                }),
                anti_alias: true,
            });
            let mut p = Path::new();
            p.move_to(0.0, 0.0); p.line_to(100.0, 0.0);
            rec.stroke_path(&p);
        });
        let pdf = render_scene_to_pdf(&scene, 200.0, 50.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let body = decompress_first_stream(&pdf).expect("first stream");
        // PDF dash op is `d` with an array prefix.
        assert!(body.windows(2).any(|w| w == b" d" || w == b"]d"),
                "expected dash operator");
    }

    #[test]
    fn quad_to_is_lowered_to_cubic() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: None,
                stroke: Some(Stroke::default()),
                anti_alias: true,
            });
            let mut p = Path::new();
            p.move_to(0.0, 0.0);
            p.quad_to(50.0, 100.0, 100.0, 0.0);
            rec.stroke_path(&p);
        });
        let pdf = render_scene_to_pdf(&scene, 200.0, 200.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let body = decompress_first_stream(&pdf).expect("first stream");
        // `c` is the PDF cubic-Bezier operator. `v`/`y` are reduced forms;
        // we always emit the full form.
        assert!(body.split(|b| *b == b'\n')
                    .any(|tok| tok.ends_with(b" c")),
                "expected cubic operator after quad lowering");
    }

    #[test]
    fn image_embed_writes_two_xobjects() {
        let scene = scene_with(|rec| {
            // 2x2 image: red, green, blue, white at half-alpha
            let pixels: Vec<u8> = vec![
                255, 0, 0, 255,
                0, 255, 0, 255,
                0, 0, 255, 255,
                255, 255, 255, 128,
            ];
            rec.draw_image(
                &Image { width: 2, height: 2, pixels },
                Rect { x: 0.0, y: 0.0, w: 50.0, h: 50.0 },
                None,
            );
        });
        let pdf = render_scene_to_pdf(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        // Count occurrences of "/Subtype /Image"
        let count = pdf.windows(b"/Subtype /Image".len())
            .filter(|w| *w == b"/Subtype /Image").count();
        // One image + one SMask = 2 image XObjects.
        assert!(count >= 2, "expected >=2 image xobjects, got {count}");
    }

    #[test]
    fn image_src_crop_shrinks_embedded_dimensions() {
        // 4x4 image; crop the top-left 2x2. The embedded XObject must report
        // Width 2 / Height 2, not 4/4 (proves the src rect is honored).
        let pixels: Vec<u8> = (0..4 * 4 * 4).map(|i| (i % 256) as u8).collect();
        let scene = scene_with(|rec| {
            rec.draw_image(
                &Image { width: 4, height: 4, pixels },
                Rect { x: 0.0, y: 0.0, w: 40.0, h: 40.0 },
                Some(Rect { x: 0.0, y: 0.0, w: 2.0, h: 2.0 }),
            );
        });
        let pdf = render_scene_to_pdf(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        // The RGB XObject (the larger of the two streams) carries the crop
        // dimensions. Look for "/Width 2" and "/Height 2", and confirm the
        // uncropped "/Width 4" is absent.
        assert!(pdf.windows(b"/Width 2".len()).any(|w| w == b"/Width 2"),
                "cropped image should report /Width 2");
        assert!(pdf.windows(b"/Height 2".len()).any(|w| w == b"/Height 2"),
                "cropped image should report /Height 2");
        assert!(!pdf.windows(b"/Width 4".len()).any(|w| w == b"/Width 4"),
                "no XObject should still report the uncropped /Width 4");
    }

    #[test]
    fn linear_gradient_emits_shading_pattern() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: Some(Fill::Linear(LinearGradient {
                    start: (0.0, 0.0),
                    end: (10.0, 0.0),
                    stops: vec![
                        GradientStop { offset: 0.0, color: Color::rgba8(255, 0, 0, 255) },
                        GradientStop { offset: 1.0, color: Color::rgba8(0, 0, 255, 255) },
                    ],
                })),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }),
                          FillRule::NonZero);
        });
        let pdf = render_scene_to_pdf(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        // A type-2 (axial) shading must be present, plus a Pattern XObject.
        assert!(pdf.windows(b"/ShadingType 2".len())
                    .any(|w| w == b"/ShadingType 2"),
                "expected an axial shading dictionary");
        assert!(pdf.windows(b"/PatternType".len())
                    .any(|w| w == b"/PatternType"),
                "expected a shading pattern");
        // And the content stream selects the Pattern colour space + scn.
        let body = decompress_first_stream(&pdf).expect("first stream");
        assert!(body.windows(b"/Pattern".len()).any(|w| w == b"/Pattern"),
                "expected /Pattern color space in content");
        assert!(body.windows(b"scn".len()).any(|w| w == b"scn"),
                "expected scn pattern-fill operator");
    }

    #[test]
    fn radial_gradient_emits_type3_shading() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: Some(Fill::Radial(RadialGradient {
                    center: (5.0, 5.0),
                    radius: 5.0,
                    stops: vec![
                        GradientStop { offset: 0.0, color: Color::rgba8(255, 255, 255, 255) },
                        GradientStop { offset: 0.5, color: Color::rgba8(128, 128, 0, 255) },
                        GradientStop { offset: 1.0, color: Color::rgba8(0, 0, 0, 255) },
                    ],
                })),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }),
                          FillRule::NonZero);
        });
        let pdf = render_scene_to_pdf(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        assert!(pdf.windows(b"/ShadingType 3".len())
                    .any(|w| w == b"/ShadingType 3"),
                "expected a radial shading dictionary");
        // 3 stops -> a stitching tint function (type 3) over exponentials.
        assert!(pdf.windows(b"/FunctionType 3".len())
                    .any(|w| w == b"/FunctionType 3"),
                "multi-stop gradient should use a stitching function");
    }

    #[test]
    fn multiply_blend_mode_emits_ext_gstate() {
        let scene = scene_with(|rec| {
            rec.set_blend_mode(VBlendMode::Multiply);
            rec.set_paint(&Paint {
                fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }),
                          FillRule::NonZero);
        });
        let pdf = render_scene_to_pdf(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        assert!(pdf.windows(b"/BM /Multiply".len())
                    .any(|w| w == b"/BM /Multiply"),
                "expected a Multiply blend ExtGState");
        let body = decompress_first_stream(&pdf).expect("first stream");
        assert!(body.windows(b"gs".len()).any(|w| w == b"gs"),
                "expected gs (set graphics state) operator");
    }

    // ---- helpers ---------------------------------------------------------

    fn decompress_first_stream(pdf: &[u8]) -> Option<Vec<u8>> {
        let needle = b"stream";
        let start = pdf.windows(needle.len()).position(|w| w == needle)?;
        let mut p = start + needle.len();
        // skip CRLF / LF after "stream"
        while p < pdf.len() && (pdf[p] == b'\r' || pdf[p] == b'\n') { p += 1; }
        let end_needle = b"endstream";
        let end = pdf[p..].windows(end_needle.len())
            .position(|w| w == end_needle)? + p;
        let raw = &pdf[p..end];
        // strip trailing newline before endstream
        let raw = if raw.last() == Some(&b'\n') { &raw[..raw.len() - 1] } else { raw };
        let raw = if raw.last() == Some(&b'\r') { &raw[..raw.len() - 1] } else { raw };

        use flate2::read::ZlibDecoder;
        use std::io::Read;
        let mut dec = ZlibDecoder::new(raw);
        let mut out = Vec::new();
        dec.read_to_end(&mut out).ok()?;
        Some(out)
    }
}
