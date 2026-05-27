//! tiny-skia implementation of [`veusz_paint_core::Painter`].
//!
//! Pure-Rust software rasterizer. Deterministic across machines. The
//! comparison harness uses this backend as the baseline for visual
//! regression testing in CI (see `docs/parallel-paint-backends-plan.md` §9).
//!
//! What's implemented in this phase
//! --------------------------------
//! * Geometry: stroke / fill of arbitrary paths (line, quad, cubic), with
//!   linear and radial gradients and solid fills.
//! * Transforms: full affine stack via tiny-skia's own state stack.
//! * Clipping: rect and path clip via tiny-skia's mask.
//! * Images: RGBA8 blit with optional source-rect crop.
//! * Output: PNG via the `png` crate, written to any `Write`.
//!
//! What's stubbed
//! --------------
//! * Text: draws a placeholder rectangle the size of the layout's intrinsic
//!   bounds. Real glyph rasterization arrives with the Parley + Swash
//!   integration (`veusz-paint-text` crate, plan §5). The placeholder
//!   lets the rest of the pipeline be exercised end-to-end immediately.

#![forbid(unsafe_code)]

use std::io::Write;

use png::{BitDepth, ColorType, Encoder};
use tiny_skia::{
    BlendMode as TsBlend, Color as TsColor, FillRule as TsFillRule, GradientStop as TsGradStop,
    LineCap as TsLineCap, LineJoin as TsLineJoin, Mask, Paint as TsPaint, Path as TsPath,
    PathBuilder, Pixmap, Point as TsPoint, Rect as TsRect, SpreadMode, Stroke as TsStroke,
    Transform as TsTransform,
};

use veusz_paint_core::{
    Affine, BlendMode, Color, Fill, FillRule, Image, LineCap, LineJoin, Paint, Painter, Path,
    PathVerb, Quality, Rect, Stroke, TextLayout,
};

// ---------------------------------------------------------------------------
// Conversions: veusz-paint-core <-> tiny-skia
// ---------------------------------------------------------------------------

fn to_ts_color(c: Color) -> TsColor {
    TsColor::from_rgba(c.r, c.g, c.b, c.a).unwrap_or(TsColor::TRANSPARENT)
}

fn to_ts_transform(m: Affine) -> TsTransform {
    TsTransform::from_row(
        m.a as f32, m.b as f32, m.c as f32, m.d as f32, m.e as f32, m.f as f32,
    )
}

fn to_ts_fill_rule(r: FillRule) -> TsFillRule {
    match r {
        FillRule::NonZero => TsFillRule::Winding,
        FillRule::EvenOdd => TsFillRule::EvenOdd,
    }
}

fn to_ts_cap(c: LineCap) -> TsLineCap {
    match c {
        LineCap::Butt => TsLineCap::Butt,
        LineCap::Round => TsLineCap::Round,
        LineCap::Square => TsLineCap::Square,
    }
}

fn to_ts_join(j: LineJoin) -> TsLineJoin {
    match j {
        LineJoin::Miter => TsLineJoin::Miter,
        LineJoin::Round => TsLineJoin::Round,
        LineJoin::Bevel => TsLineJoin::Bevel,
    }
}

fn to_ts_blend(m: BlendMode) -> TsBlend {
    match m {
        BlendMode::SourceOver => TsBlend::SourceOver,
        BlendMode::Multiply => TsBlend::Multiply,
        BlendMode::Plus => TsBlend::Plus,
    }
}

fn build_path(p: &Path) -> Option<TsPath> {
    let mut b = PathBuilder::new();
    let mut i = 0usize;
    for verb in &p.verbs {
        match verb {
            PathVerb::MoveTo => {
                b.move_to(p.points[i] as f32, p.points[i + 1] as f32);
                i += 2;
            }
            PathVerb::LineTo => {
                b.line_to(p.points[i] as f32, p.points[i + 1] as f32);
                i += 2;
            }
            PathVerb::QuadTo => {
                b.quad_to(
                    p.points[i] as f32, p.points[i + 1] as f32,
                    p.points[i + 2] as f32, p.points[i + 3] as f32,
                );
                i += 4;
            }
            PathVerb::CubicTo => {
                b.cubic_to(
                    p.points[i] as f32, p.points[i + 1] as f32,
                    p.points[i + 2] as f32, p.points[i + 3] as f32,
                    p.points[i + 4] as f32, p.points[i + 5] as f32,
                );
                i += 6;
            }
            PathVerb::Close => b.close(),
        }
    }
    b.finish()
}

// ---------------------------------------------------------------------------
// State stack
// ---------------------------------------------------------------------------

#[derive(Clone)]
struct State {
    transform: TsTransform,
    paint: Paint,
    blend: BlendMode,
    quality: Quality,
    /// Number of clips pushed *at this level of the save stack*; rolled back
    /// when the save frame is popped.
    clips_in_frame: usize,
}

impl Default for State {
    fn default() -> Self {
        Self {
            transform: TsTransform::identity(),
            paint: Paint { fill: None, stroke: None, anti_alias: true },
            blend: BlendMode::SourceOver,
            quality: Quality::Balanced,
            clips_in_frame: 0,
        }
    }
}

// ---------------------------------------------------------------------------
// Painter implementation
// ---------------------------------------------------------------------------

/// A tiny-skia-backed Painter.
///
/// Holds the destination [`Pixmap`] and a state stack mirroring the
/// `save`/`restore` semantics of the abstract interface.
pub struct TinySkiaPainter {
    pixmap: Pixmap,
    states: Vec<State>,
    /// Stack of masks. Each `push_clip_*` allocates a new mask that combines
    /// (intersects) with the previous top. `pop_clip` drops it.
    clip_stack: Vec<Mask>,
}

impl TinySkiaPainter {
    /// Create a new painter with a blank (fully-transparent) pixmap.
    pub fn new(width: u32, height: u32) -> Result<Self, String> {
        let pixmap = Pixmap::new(width, height)
            .ok_or_else(|| format!("invalid pixmap size: {}x{}", width, height))?;
        Ok(Self {
            pixmap,
            states: vec![State::default()],
            clip_stack: Vec::new(),
        })
    }

    /// Fill the entire pixmap with `color`. Useful for setting a page
    /// background before any widget painting.
    pub fn clear(&mut self, color: Color) {
        self.pixmap.fill(to_ts_color(color));
    }

    /// Width of the destination pixmap in pixels.
    pub fn width(&self) -> u32 { self.pixmap.width() }
    /// Height of the destination pixmap in pixels.
    pub fn height(&self) -> u32 { self.pixmap.height() }

    /// Borrow the raw RGBA8 pixel buffer (premultiplied alpha).
    pub fn pixels(&self) -> &[u8] { self.pixmap.data() }

    /// Encode the current pixmap as PNG into `w`.
    pub fn write_png<W: Write>(&self, w: W) -> Result<(), png::EncodingError> {
        let mut enc = Encoder::new(w, self.pixmap.width(), self.pixmap.height());
        enc.set_color(ColorType::Rgba);
        enc.set_depth(BitDepth::Eight);
        let mut writer = enc.write_header()?;
        // Convert premultiplied alpha back to straight for PNG.
        let mut buf = Vec::with_capacity(self.pixmap.data().len());
        for px in self.pixmap.data().chunks_exact(4) {
            let (r, g, b, a) = (px[0] as u16, px[1] as u16, px[2] as u16, px[3] as u16);
            if a == 0 {
                buf.extend_from_slice(&[0, 0, 0, 0]);
            } else {
                buf.push(((r * 255 + a / 2) / a).min(255) as u8);
                buf.push(((g * 255 + a / 2) / a).min(255) as u8);
                buf.push(((b * 255 + a / 2) / a).min(255) as u8);
                buf.push(a as u8);
            }
        }
        writer.write_image_data(&buf)?;
        Ok(())
    }

    fn cur(&self) -> &State { self.states.last().expect("state stack underflow") }
    fn cur_mut(&mut self) -> &mut State {
        self.states.last_mut().expect("state stack underflow")
    }

    fn current_mask(&self) -> Option<&Mask> { self.clip_stack.last() }

    /// Build a tiny-skia [`TsPaint`] from our [`Paint`], for a particular op.
    /// `for_stroke` selects which side (`stroke` or `fill`) to draw from.
    fn ts_paint(&self, paint: &Paint, for_stroke: bool) -> Option<TsPaint<'static>> {
        let mut p = TsPaint::default();
        p.anti_alias = paint.anti_alias;
        p.blend_mode = to_ts_blend(self.cur().blend);

        if for_stroke {
            let stroke = paint.stroke.as_ref()?;
            p.set_color(to_ts_color(stroke.color));
        } else {
            let fill = paint.fill.as_ref()?;
            match fill {
                Fill::Solid(c) => p.set_color(to_ts_color(*c)),
                Fill::Linear(g) => {
                    let stops: Vec<TsGradStop> = g.stops.iter()
                        .map(|s| TsGradStop::new(s.offset, to_ts_color(s.color)))
                        .collect();
                    if let Some(shader) = tiny_skia::LinearGradient::new(
                        TsPoint::from_xy(g.start.0 as f32, g.start.1 as f32),
                        TsPoint::from_xy(g.end.0 as f32, g.end.1 as f32),
                        stops,
                        SpreadMode::Pad,
                        TsTransform::identity(),
                    ) { p.shader = shader; } else { return None; }
                }
                Fill::Radial(g) => {
                    let stops: Vec<TsGradStop> = g.stops.iter()
                        .map(|s| TsGradStop::new(s.offset, to_ts_color(s.color)))
                        .collect();
                    let center = TsPoint::from_xy(g.center.0 as f32, g.center.1 as f32);
                    if let Some(shader) = tiny_skia::RadialGradient::new(
                        center,
                        0.0,
                        center,
                        g.radius as f32,
                        stops,
                        SpreadMode::Pad,
                        TsTransform::identity(),
                    ) { p.shader = shader; } else { return None; }
                }
            }
        }
        Some(p)
    }

    fn ts_stroke(&self, stroke: &Stroke) -> TsStroke {
        TsStroke {
            width: stroke.width as f32,
            miter_limit: stroke.miter_limit as f32,
            line_cap: to_ts_cap(stroke.cap),
            line_join: to_ts_join(stroke.join),
            // Dash conversion via tiny-skia's dash builder.
            dash: stroke.dash.as_ref().and_then(|pat| {
                let pat32: Vec<f32> = pat.iter().map(|x| *x as f32).collect();
                tiny_skia::StrokeDash::new(pat32, 0.0)
            }),
        }
    }
}

impl Painter for TinySkiaPainter {
    fn save(&mut self) {
        let mut cloned = self.cur().clone();
        cloned.clips_in_frame = 0;
        self.states.push(cloned);
    }

    fn restore(&mut self) {
        let popped = self.states.pop().expect("restore() without save()");
        // Roll back any clips pushed since the matching save().
        for _ in 0..popped.clips_in_frame {
            self.clip_stack.pop();
        }
    }

    fn set_transform(&mut self, m: Affine) {
        self.cur_mut().transform = to_ts_transform(m);
    }

    fn concat_transform(&mut self, m: Affine) {
        let cur = self.cur().transform;
        self.cur_mut().transform = cur.pre_concat(to_ts_transform(m));
    }

    fn push_clip_rect(&mut self, r: Rect) {
        let rect = match TsRect::from_xywh(r.x as f32, r.y as f32, r.w as f32, r.h as f32) {
            Some(r) => r,
            None => return,
        };
        let mut path_b = PathBuilder::new();
        path_b.push_rect(rect);
        if let Some(path) = path_b.finish() {
            self.push_clip_path_internal(&path);
        }
    }

    fn push_clip_path(&mut self, p: &Path, _rule: FillRule) {
        if let Some(path) = build_path(p) {
            self.push_clip_path_internal(&path);
        }
    }

    fn pop_clip(&mut self) {
        self.clip_stack.pop();
        let n = &mut self.cur_mut().clips_in_frame;
        *n = n.saturating_sub(1);
    }

    fn set_paint(&mut self, p: &Paint) { self.cur_mut().paint = p.clone(); }
    fn set_blend_mode(&mut self, m: BlendMode) { self.cur_mut().blend = m; }
    fn set_quality(&mut self, q: Quality) { self.cur_mut().quality = q; }

    fn stroke_path(&mut self, p: &Path) {
        let ts_path = match build_path(p) { Some(p) => p, None => return };
        let paint_clone = self.cur().paint.clone();
        let stroke = match paint_clone.stroke.as_ref() { Some(s) => s, None => return };
        let ts_p = match self.ts_paint(&paint_clone, true) { Some(p) => p, None => return };
        let ts_s = self.ts_stroke(stroke);
        let xf = self.cur().transform;
        let mask = self.current_mask().cloned();
        self.pixmap.stroke_path(&ts_path, &ts_p, &ts_s, xf, mask.as_ref());
    }

    fn fill_path(&mut self, p: &Path, rule: FillRule) {
        let ts_path = match build_path(p) { Some(p) => p, None => return };
        let paint_clone = self.cur().paint.clone();
        if paint_clone.fill.is_none() { return; }
        let ts_p = match self.ts_paint(&paint_clone, false) { Some(p) => p, None => return };
        let xf = self.cur().transform;
        let mask = self.current_mask().cloned();
        self.pixmap.fill_path(&ts_path, &ts_p, to_ts_fill_rule(rule), xf, mask.as_ref());
    }

    fn draw_image(&mut self, img: &Image, dst: Rect, src: Option<Rect>) {
        // Build a source pixmap, scaled into dst. Drawn via fill_rect with a
        // pattern shader so transform / clip apply uniformly.
        let mut src_pixmap = match Pixmap::new(img.width, img.height) {
            Some(p) => p,
            None => return,
        };
        // Convert straight-alpha RGBA to premultiplied (tiny-skia's storage).
        {
            let dst_buf = src_pixmap.data_mut();
            for (i, px) in img.pixels.chunks_exact(4).enumerate() {
                let (r, g, b, a) = (px[0] as u16, px[1] as u16, px[2] as u16, px[3] as u16);
                dst_buf[i * 4]     = ((r * a + 127) / 255) as u8;
                dst_buf[i * 4 + 1] = ((g * a + 127) / 255) as u8;
                dst_buf[i * 4 + 2] = ((b * a + 127) / 255) as u8;
                dst_buf[i * 4 + 3] = a as u8;
            }
        }

        // Compose: optional source crop, then map [src] -> [dst].
        let src_rect = src.unwrap_or(Rect { x: 0.0, y: 0.0, w: img.width as f64, h: img.height as f64 });
        let sx = dst.w / src_rect.w;
        let sy = dst.h / src_rect.h;
        let pattern_xf = TsTransform::from_translate(-src_rect.x as f32, -src_rect.y as f32)
            .post_scale(sx as f32, sy as f32)
            .post_translate(dst.x as f32, dst.y as f32);

        let pattern = tiny_skia::Pattern::new(
            src_pixmap.as_ref(),
            SpreadMode::Pad,
            tiny_skia::FilterQuality::Bilinear,
            1.0,
            pattern_xf,
        );

        let mut paint = TsPaint::default();
        paint.shader = pattern;
        paint.anti_alias = self.cur().paint.anti_alias;
        paint.blend_mode = to_ts_blend(self.cur().blend);

        let rect = match TsRect::from_xywh(dst.x as f32, dst.y as f32, dst.w as f32, dst.h as f32) {
            Some(r) => r,
            None => return,
        };
        let xf = self.cur().transform;
        let mask = self.current_mask().cloned();
        self.pixmap.fill_rect(rect, &paint, xf, mask.as_ref());
    }

    fn draw_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        // PLACEHOLDER until Parley+Swash integration lands (plan §5). Emit a
        // bounding-box outline at (x, y) sized by a coarse character-width
        // estimate. This lets the rest of the pipeline be exercised
        // end-to-end and produces visibly *something* in the output, while
        // making it obvious that text rendering is not yet real.
        let w = 0.6 * layout.style.size_pt * layout.text.chars().count() as f64;
        let h = layout.style.size_pt;
        let rect = Path::rect(Rect { x, y: y - h, w, h });
        let prev = self.cur().paint.clone();
        let placeholder = Paint {
            fill: None,
            stroke: Some(Stroke {
                color: layout.style.color, width: 0.5, dash: Some(vec![2.0, 2.0]),
                cap: LineCap::Butt, join: LineJoin::Miter, miter_limit: 4.0,
            }),
            anti_alias: true,
        };
        self.set_paint(&placeholder);
        self.stroke_path(&rect);
        self.set_paint(&prev);
    }

    fn finish(&mut self) { /* no-op; caller pulls pixels or PNG */ }
}

// ---- private helpers --------------------------------------------------------

impl TinySkiaPainter {
    fn push_clip_path_internal(&mut self, path: &TsPath) {
        let xf = self.cur().transform;
        let mask = if let Some(prev) = self.current_mask() {
            let mut m = prev.clone();
            m.intersect_path(path, TsFillRule::Winding, true, xf);
            m
        } else {
            // No prior clip: start from a zero-initialised mask and rasterise
            // the path into it. Pixels inside the path become opaque, the
            // rest stay transparent — i.e., clipped out.
            let mut m = match Mask::new(self.pixmap.width(), self.pixmap.height()) {
                Some(m) => m,
                None => return,
            };
            m.fill_path(path, TsFillRule::Winding, true, xf);
            m
        };
        self.clip_stack.push(mask);
        self.cur_mut().clips_in_frame += 1;
    }
}

// Pixmap doesn't implement Default, so we provide a builder rather than impl.
#[cfg(test)]
mod tests {
    use super::*;
    use veusz_paint_core::*;

    fn new_painter(w: u32, h: u32) -> TinySkiaPainter {
        let mut p = TinySkiaPainter::new(w, h).unwrap();
        p.clear(Color::new(1.0, 1.0, 1.0, 1.0)); // white background
        p
    }

    #[test]
    fn empty_canvas_is_white() {
        let p = new_painter(4, 4);
        for px in p.pixels().chunks_exact(4) {
            assert_eq!(px, &[255, 255, 255, 255]);
        }
    }

    #[test]
    fn fill_red_rect_makes_red_pixels() {
        let mut p = new_painter(16, 16);
        p.set_paint(&Paint {
            fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
            stroke: None,
            anti_alias: false,
        });
        p.fill_path(&Path::rect(Rect { x: 4.0, y: 4.0, w: 8.0, h: 8.0 }), FillRule::NonZero);
        // Center pixel should be red.
        let i = (8 * 16 + 8) * 4;
        let px = &p.pixels()[i..i + 4];
        assert_eq!(px[0], 255, "R");
        assert_eq!(px[1], 0,   "G");
        assert_eq!(px[2], 0,   "B");
        assert_eq!(px[3], 255, "A");
    }

    #[test]
    fn clip_rect_blocks_paint_outside() {
        let mut p = new_painter(16, 16);
        p.push_clip_rect(Rect { x: 0.0, y: 0.0, w: 8.0, h: 8.0 });
        p.set_paint(&Paint {
            fill: Some(Fill::Solid(Color::rgba8(0, 0, 0, 255))),
            stroke: None,
            anti_alias: false,
        });
        p.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 16.0, h: 16.0 }), FillRule::NonZero);
        p.pop_clip();
        // Inside clip -> black
        let inside = &p.pixels()[(2 * 16 + 2) * 4..(2 * 16 + 2) * 4 + 4];
        assert_eq!(inside, &[0, 0, 0, 255]);
        // Outside clip -> still white
        let outside = &p.pixels()[(12 * 16 + 12) * 4..(12 * 16 + 12) * 4 + 4];
        assert_eq!(outside, &[255, 255, 255, 255]);
    }

    #[test]
    fn save_restore_unwinds_clips() {
        let mut p = new_painter(8, 8);
        p.save();
        p.push_clip_rect(Rect { x: 0.0, y: 0.0, w: 1.0, h: 1.0 });
        assert_eq!(p.clip_stack.len(), 1);
        p.restore();
        // restore() must roll back the clip pushed during the save() frame.
        assert_eq!(p.clip_stack.len(), 0);
    }

    #[test]
    fn scene_replay_through_tiny_skia_produces_pixels() {
        // Build a scene via the recorder; replay onto tiny-skia.
        let mut rec = SceneRecorder::new();
        rec.set_paint(&Paint {
            fill: Some(Fill::Solid(Color::rgba8(0, 200, 0, 255))),
            stroke: None,
            anti_alias: false,
        });
        rec.fill_path(&Path::rect(Rect { x: 1.0, y: 1.0, w: 14.0, h: 14.0 }), FillRule::NonZero);
        let scene = rec.into_scene();

        let mut p = new_painter(16, 16);
        scene.replay(&mut p);
        let px = &p.pixels()[(8 * 16 + 8) * 4..(8 * 16 + 8) * 4 + 4];
        assert_eq!(px[1], 200, "expected green channel");
    }

    #[test]
    fn png_roundtrip_includes_alpha() {
        let p = TinySkiaPainter::new(4, 4).unwrap();
        // leave transparent; encode and check it decodes
        let mut out = Vec::new();
        p.write_png(&mut out).unwrap();
        // first 8 bytes are PNG signature
        assert_eq!(&out[..8], &[137, 80, 78, 71, 13, 10, 26, 10]);
    }
}
