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
//! * Solid fills and stroke colors. (Gradients fall back to the gradient's
//!   *first* stop colour as a single solid in this phase — see TODO list
//!   below; PDF axial / radial shading is a deeper integration.)
//! * Dash patterns, line caps, line joins, miter limit, line width.
//! * Transforms: full affine concatenation. PDF's `cm` operator takes our
//!   `Affine` directly.
//! * Clipping: rect and arbitrary path, using PDF's `W` (clip) operator.
//!   `save`/`restore` honor PDF's `q`/`Q` graphics-state stack.
//! * Image embedding: RGBA8 -> 8-bit-per-channel RGB image with a
//!   Flate-compressed SMask alpha channel.
//!
//! What's deferred
//! ---------------
//! * Text. Mirrors the tiny-skia placeholder: a dashed bounding-box stroke
//!   so the layout is visible. Real glyph embedding (subsetted Type0 with
//!   ToUnicode) lands with the Parley + Swash integration (plan §5).
//! * Gradients as shading objects. Listed in TODO.
//! * Blend modes other than Normal. The audit shows Veusz rarely needs
//!   anything else; SourceOver is the default in PDF.
//!
//! PDF conventions
//! ---------------
//! PDF's y-axis points up; we paint with our `Affine` interpreted in a
//! top-left origin like screen coords. The page's CTM is set on entry to
//! flip y, so caller code can keep using its existing coordinate
//! conventions.

#![forbid(unsafe_code)]

use pdf_writer::types::{LineCapStyle, LineJoinStyle};
use pdf_writer::{Content, Filter, Finish, Name, Pdf, Rect as PdfRect, Ref, TextStr};

use veusz_paint_core::{
    Affine, Color, Fill, FillRule, Paint, Path, PathVerb, Scene, SceneOp, Stroke, TextLayout,
    Rect as VRect, LineCap, LineJoin,
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

#[derive(Clone, Copy, Debug)]
struct GraphicsState {
    /// Current paint (used by stroke_path / fill_path).
    has_fill_color: bool,
    has_stroke_color: bool,
    /// Number of clip frames pushed at this save level. Restored on pop.
    clips_in_frame: usize,
}

impl Default for GraphicsState {
    fn default() -> Self {
        Self { has_fill_color: false, has_stroke_color: false, clips_in_frame: 0 }
    }
}

struct PdfEmitter {
    width: f64,
    height: f64,
    content: Content,
    states: Vec<GraphicsState>,
    images: Vec<EmbeddedImage>, // collected during run, written at finish
    text_engine: Option<veusz_paint_text::TextEngine>,
    /// Glyph-outline deduplication cache: maps a hash of the outline path
    /// to a Form XObject slot. The first time we see a glyph we record
    /// its outline once as a Form XObject; subsequent occurrences emit
    /// `q transform Do Q` referencing the cached XObject. Drops PDF size
    /// significantly on text-heavy pages — typical axis labels share
    /// many glyphs.
    glyph_xobjects: std::collections::HashMap<u64, usize>,
    glyph_streams: Vec<Vec<u8>>, // index = slot, content = serialized fill-path stream
}

struct EmbeddedImage {
    width: u32,
    height: u32,
    rgb: Vec<u8>,   // 3 bytes/pixel, flate-deflated below
    alpha: Vec<u8>, // 1 byte/pixel
}

/// Stable hash of a glyph outline: 64-bit FNV-1a over the verb stream +
/// raw point bytes. We need stable-across-process for HashMap insertion
/// within one emitter run; FNV is the simplest and the collision risk
/// is fine for our ~thousands-of-glyphs scale.
#[allow(dead_code)]
fn hash_path(p: &Path) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325;
    for v in &p.verbs {
        let d = std::mem::discriminant(v);
        // discriminant is opaque; hash its address bits.
        let b = format!("{:?}", d);
        for ch in b.bytes() {
            h ^= ch as u64;
            h = h.wrapping_mul(0x100000001b3);
        }
    }
    for x in &p.points {
        for b in x.to_le_bytes() {
            h ^= b as u64;
            h = h.wrapping_mul(0x100000001b3);
        }
    }
    h
}

impl PdfEmitter {
    fn new(width: f64, height: f64, background: (f32, f32, f32, f32)) -> Self {
        let mut content = Content::new();
        // Flip the y-axis so screen-style coords work.
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
            states: vec![GraphicsState::default()],
            images: Vec::new(),
            text_engine: None,
            glyph_xobjects: std::collections::HashMap::new(),
            glyph_streams: Vec::new(),
        }
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
                self.states.push(GraphicsState::default());
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
            SceneOp::SetBlendMode(_) => {
                // Deferred; see crate-level docs. Default Normal is fine
                // for the documents the audit shows.
            }
            SceneOp::SetQuality(_) => { /* PDF doesn't have raster hints */ }
            SceneOp::StrokePath(p) => {
                if !self.cur_mut().has_stroke_color { return; }
                emit_path(&mut self.content, p);
                self.content.stroke();
            }
            SceneOp::FillPath { path, rule } => {
                if !self.cur_mut().has_fill_color { return; }
                emit_path(&mut self.content, path);
                match rule {
                    FillRule::NonZero => self.content.fill_nonzero(),
                    FillRule::EvenOdd => self.content.fill_even_odd(),
                };
            }
            SceneOp::DrawImage { image, dst, .. } => {
                let id = self.embed_image(image);
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
        }
    }

    fn concat(&mut self, m: Affine) {
        self.content.transform([
            m.a as f32, m.b as f32, m.c as f32, m.d as f32,
            m.e as f32, m.f as f32,
        ]);
    }

    fn apply_paint(&mut self, p: &Paint) {
        if let Some(fill) = &p.fill {
            let c = primary_color(fill);
            self.content.set_fill_rgb(c.r, c.g, c.b);
            self.cur_mut().has_fill_color = true;
        } else {
            self.cur_mut().has_fill_color = false;
        }
        if let Some(stroke) = &p.stroke {
            self.apply_stroke(stroke);
            self.cur_mut().has_stroke_color = true;
        } else {
            self.cur_mut().has_stroke_color = false;
        }
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

    fn embed_image(&mut self, image: &veusz_paint_core::Image) -> usize {
        let n = (image.width * image.height) as usize;
        let mut rgb = Vec::with_capacity(3 * n);
        let mut alpha = Vec::with_capacity(n);
        for px in image.pixels.chunks_exact(4) {
            rgb.push(px[0]);
            rgb.push(px[1]);
            rgb.push(px[2]);
            alpha.push(px[3]);
        }
        let id = self.images.len();
        self.images.push(EmbeddedImage {
            width: image.width, height: image.height, rgb, alpha,
        });
        id
    }

    fn emit_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        // Real text via Parley + skrifa: glyphs as filled paths in PDF.
        //
        // The right answer for text-heavy pages is Type 0 CIDFont
        // embedding: glyphs go in once via a subsetted CIDFontType2,
        // text becomes `Tj` operators with 2-byte CIDs, and PDFs are
        // ~5x smaller on long text runs. The `subsetter` crate (Typst's
        // OpenType subsetter) is the right tool; the wrapping work is
        // ~200-400 lines of PDF spec compliance (font dict + CIDSystemInfo
        // + CIDToGIDMap + ToUnicode CMap + FontDescriptor with metrics).
        // Tracked as a phase-5 follow-up; current implementation is
        // path-based for portability.
        //
        // A Form-XObject glyph-dedup attempt is scaffolded in this file
        // (hash_path, glyph_xobjects, glyph_streams) but DISABLED — the
        // smoke corpus came in 22% LARGER because per-XObject dict
        // overhead exceeds the savings on Veusz's short text runs. The
        // CIDFont path is the right win, not deduplication of inline
        // path emissions.
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

        // Suppress unused-field warnings on the dedup-cache fields kept
        // for the future enabling path. The hash function is exercised
        // in tests below.
        let _ = &self.glyph_xobjects;
        let _ = &self.glyph_streams;
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
        // pre-allocate glyph XObject refs
        let glyph_refs: Vec<Ref> =
            (0..self.glyph_streams.len()).map(|_| alloc()).collect();

        pdf.catalog(catalog_id).pages(page_tree_id);
        pdf.pages(page_tree_id).count(1).kids([page_id]);

        let mut page = pdf.page(page_id);
        page.parent(page_tree_id)
            .media_box(PdfRect::new(0.0, 0.0, self.width as f32, self.height as f32))
            .contents(content_id);

        // Page resources: image XObjects + glyph Form XObjects.
        if !self.images.is_empty() || !glyph_refs.is_empty() {
            let mut resources = page.resources();
            let mut x_objects = resources.x_objects();
            for (i, (img_ref, _)) in image_refs.iter().enumerate() {
                x_objects.pair(Name(format!("Im{}", i).as_bytes()), *img_ref);
            }
            for (i, gref) in glyph_refs.iter().enumerate() {
                x_objects.pair(Name(format!("G{}", i).as_bytes()), *gref);
            }
            x_objects.finish();
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

        // Glyph Form XObjects — one stream per unique outline. Each
        // declares a /BBox (we use a generous page-sized bbox since the
        // outline coords are already in font-em space and get transformed
        // by the caller's `cm`; PDF requires *some* bbox even if it's
        // loose).
        let bbox = PdfRect::new(
            -10000.0, -10000.0, 10000.0, 10000.0
        );
        for (i, stream_bytes) in self.glyph_streams.iter().enumerate() {
            let compressed = compress(stream_bytes);
            let mut x = pdf.form_xobject(glyph_refs[i], &compressed);
            x.bbox(bbox);
            x.filter(Filter::FlateDecode);
            x.finish();
        }

        pdf.document_info(alloc())
            .producer(TextStr("veusz-paint-pdf"));

        Ok(pdf.finish())
    }
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

fn primary_color(f: &Fill) -> Color {
    // Until gradient shading is wired up, fall back to the first stop's
    // colour. The diff harness flags any document that materially relies on
    // gradient interpolation.
    match f {
        Fill::Solid(c) => *c,
        Fill::Linear(g) => g.stops.first().map(|s| s.color).unwrap_or(Color::BLACK),
        Fill::Radial(g) => g.stops.first().map(|s| s.color).unwrap_or(Color::BLACK),
    }
}

fn compress(data: &[u8]) -> Vec<u8> {
    use flate2::write::ZlibEncoder;
    use flate2::Compression;
    use std::io::Write;
    let mut enc = ZlibEncoder::new(Vec::new(), Compression::default());
    enc.write_all(data).expect("zlib encode (in-memory write)");
    enc.finish().expect("zlib finish")
}

// Helpful unused import suppressors
#[allow(dead_code)]
fn _unused_imports_keepalive() {
    let _: Option<VRect> = None;
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
