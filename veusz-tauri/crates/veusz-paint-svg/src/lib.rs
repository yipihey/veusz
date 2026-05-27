//! Scene -> SVG emitter.
//!
//! Converts the abstract [`Scene`] from `veusz-paint-core` into a standalone
//! SVG 1.1 document. Sibling crate to `veusz-paint-pdf`: same shape (state
//! stack, paint tracking, content emission), different output dialect.
//!
//! Shared between the tiny-skia and Vello backends — the input is the
//! backend-agnostic IR, not a backend's native primitives.
//!
//! What's in
//! ---------
//! * Page size + an opaque background rect.
//! * Path operations: stroke and fill (non-zero / even-odd), expressed as
//!   `<path d="..." fill="..." stroke="..." />` with the current paint
//!   tracked in a small state stack.
//! * Solid fills + stroke colours. Gradients fall back to the gradient's
//!   first stop colour, mirroring the PDF emitter; promotion to a real
//!   `<linearGradient>` / `<radialGradient>` resource is a future tweak.
//! * Dash patterns, line caps, line joins, miter limit, line width.
//! * Transforms: full affine via `transform="matrix(a b c d e f)"` on a
//!   wrapping `<g>`. `SetTransform` and `ConcatTransform` are both treated
//!   as concat (the recording layer normalises them; see the comment in
//!   `veusz-paint-pdf`).
//! * Clipping: rect and arbitrary path via `<clipPath>` definitions in
//!   `<defs>` plus `clip-path="url(#…)"` on the active `<g>`.
//! * `Save` / `Restore` wrap a fresh `<g>` so attribute scoping behaves
//!   like a true graphics-state stack.
//! * Image embedding: PNG-encoded RGBA delivered as a `data:image/png;base64`
//!   URL on `<image>`.
//! * Text: reuses the shared `veusz-paint-text` engine to extract per-glyph
//!   paths (same approach as the PDF backend's path-based fallback). The
//!   output therefore renders identically across SVG viewers and is
//!   self-contained (no font reference). Promotion to `<text>` with
//!   `font-family` can land later once we wire shaping metadata through.
//!
//! What's deferred
//! ---------------
//! * Real `<linearGradient>` / `<radialGradient>` resources.
//! * Blend modes beyond `SourceOver`.
//! * `<text>`-based text emission with selectable / searchable runs.
//!
//! SVG conventions
//! ---------------
//! SVG's y-axis points down, same as our `Affine` interpretation, so no
//! page-level y-flip is required (unlike the PDF backend). Numerical output
//! uses plain decimal with at most 6 fractional digits to keep file sizes
//! sane without losing visual fidelity at typical screen resolutions.

#![forbid(unsafe_code)]

use std::fmt::Write as _;

use base64::{engine::general_purpose::STANDARD as B64, Engine as _};

use veusz_paint_core::{
    Affine, Color, Fill, FillRule, LineCap, LineJoin, Paint, Path, PathVerb, Scene, SceneOp,
    Stroke, TextLayout,
};

/// Render a [`Scene`] into a single SVG 1.1 document.
///
/// `width` / `height` define the SVG `viewBox` and root `width` / `height`
/// (interpreted as user-space units, conventionally pixels at the SVG default
/// 96 DPI). The page background is painted as the first child rect using
/// `background`.
pub fn render_scene_to_svg(
    scene: &Scene,
    width: f64,
    height: f64,
    background: (f32, f32, f32, f32),
) -> Result<Vec<u8>, String> {
    let mut emitter = SvgEmitter::new(width, height, background);
    emitter.run(scene);
    Ok(emitter.finish())
}

// ---------------------------------------------------------------------------
// Emitter
// ---------------------------------------------------------------------------

#[derive(Clone, Debug)]
struct GraphicsState {
    /// Current fill paint colour, as an SVG `rgb(...)` string. None means
    /// "fill disabled" — `fill="none"`.
    fill_attr: Option<String>,
    /// Current stroke attributes, pre-formatted for splicing into a `<path>`.
    /// None means "stroke disabled" — `stroke="none"`.
    stroke_attrs: Option<String>,
    /// Group nesting depth opened for THIS save frame. Every push (clip,
    /// transform, …) we open a `<g …>`; the matching pop emits a `</g>`.
    /// Restored when the corresponding `Restore` fires.
    groups_in_frame: usize,
}

impl Default for GraphicsState {
    fn default() -> Self {
        Self {
            fill_attr: None,
            stroke_attrs: None,
            groups_in_frame: 0,
        }
    }
}

struct SvgEmitter {
    width: f64,
    height: f64,
    /// Body of the `<svg>` element (between the opening tag and `</svg>`).
    /// We assemble this into a final document in `finish()` along with the
    /// `<defs>` block.
    body: String,
    /// Definitions block (clipPath, eventually gradients/patterns).
    defs: String,
    /// Save / restore stack. The top is always the "current" state.
    states: Vec<GraphicsState>,
    /// Monotonically increasing counter for unique `clipPath` ids.
    next_clip_id: usize,
    /// Lazily initialised text engine, shared with the PDF emitter's
    /// fallback path.
    text_engine: Option<veusz_paint_text::TextEngine>,
}

impl SvgEmitter {
    fn new(width: f64, height: f64, background: (f32, f32, f32, f32)) -> Self {
        let mut body = String::new();
        // Background rect. We always emit one so even an empty scene
        // produces a sensible visible page. Alpha is honoured via
        // fill-opacity so transparent backgrounds work.
        let _ = write!(
            body,
            "<rect x=\"0\" y=\"0\" width=\"{}\" height=\"{}\" fill=\"{}\" \
             fill-opacity=\"{}\"/>",
            fmt_num(width),
            fmt_num(height),
            rgb_color(Color {
                r: background.0,
                g: background.1,
                b: background.2,
                a: background.3
            }),
            fmt_num(background.3 as f64),
        );
        Self {
            width,
            height,
            body,
            defs: String::new(),
            states: vec![GraphicsState::default()],
            next_clip_id: 0,
            text_engine: None,
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
                // Push a fresh state frame. Note we deliberately copy the
                // current paint forward — SVG attribute inheritance doesn't
                // do this for us because each `<path>` we emit names its own
                // fill/stroke explicitly. Copying matches the semantics of
                // Painter::save() (subsequent ops see the same paint until
                // overridden).
                let cloned = self.cur().clone();
                let mut fresh = GraphicsState::default();
                fresh.fill_attr = cloned.fill_attr;
                fresh.stroke_attrs = cloned.stroke_attrs;
                self.states.push(fresh);
            }
            SceneOp::Restore => {
                // Close out any unbalanced groups opened in this frame
                // (transforms / clips that didn't get their own Pop). This
                // mirrors PDF's q/Q stack semantics: a single q opens a
                // scope for any number of state mutations.
                let n = self.cur().groups_in_frame;
                for _ in 0..n {
                    self.body.push_str("</g>");
                }
                self.states.pop().expect("restore() without save()");
            }
            SceneOp::SetTransform(m) | SceneOp::ConcatTransform(m) => {
                self.open_group_with_transform(*m);
            }
            SceneOp::PushClipRect(r) => {
                // Materialise as a clipPath whose contents is a single rect.
                let id = self.alloc_clip_id();
                let _ = write!(
                    self.defs,
                    "<clipPath id=\"{}\"><rect x=\"{}\" y=\"{}\" \
                     width=\"{}\" height=\"{}\"/></clipPath>",
                    id,
                    fmt_num(r.x),
                    fmt_num(r.y),
                    fmt_num(r.w),
                    fmt_num(r.h),
                );
                self.open_group_with_clip(&id);
            }
            SceneOp::PushClipPath { path, rule } => {
                let id = self.alloc_clip_id();
                let rule_attr = match rule {
                    FillRule::NonZero => "nonzero",
                    FillRule::EvenOdd => "evenodd",
                };
                let _ = write!(
                    self.defs,
                    "<clipPath id=\"{}\" clip-rule=\"{}\"><path d=\"{}\"/></clipPath>",
                    id,
                    rule_attr,
                    path_d(path),
                );
                self.open_group_with_clip(&id);
            }
            SceneOp::PopClip => {
                // Close the matching `<g>` for the most recent Push. We
                // bookkept it as `groups_in_frame` so Restore can wind
                // down anything still open.
                if self.cur().groups_in_frame > 0 {
                    self.body.push_str("</g>");
                    self.cur_mut().groups_in_frame -= 1;
                }
            }
            SceneOp::SetPaint(p) => self.apply_paint(p),
            SceneOp::SetBlendMode(_) => {
                // Deferred — see crate-level docs. Veusz almost exclusively
                // paints SourceOver per the audit.
            }
            SceneOp::SetQuality(_) => { /* SVG has no raster hints */ }
            SceneOp::StrokePath(p) => {
                let stroke_attrs = match self.cur().stroke_attrs.as_ref() {
                    Some(s) => s.clone(),
                    None => return, // stroke disabled — no-op
                };
                let _ = write!(
                    self.body,
                    "<path d=\"{}\" fill=\"none\" {}/>",
                    path_d(p),
                    stroke_attrs,
                );
            }
            SceneOp::FillPath { path, rule } => {
                let fill_attr = match self.cur().fill_attr.as_ref() {
                    Some(s) => s.clone(),
                    None => return,
                };
                let rule_attr = match rule {
                    FillRule::NonZero => "nonzero",
                    FillRule::EvenOdd => "evenodd",
                };
                let _ = write!(
                    self.body,
                    "<path d=\"{}\" fill=\"{}\" fill-rule=\"{}\" stroke=\"none\"/>",
                    path_d(path),
                    fill_attr,
                    rule_attr,
                );
            }
            SceneOp::DrawImage { image, dst, .. } => {
                let data_url = match encode_image_as_data_url(image) {
                    Ok(s) => s,
                    Err(_) => return, // skip silently — image embed failed
                };
                let _ = write!(
                    self.body,
                    "<image x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" \
                     preserveAspectRatio=\"none\" href=\"{}\"/>",
                    fmt_num(dst.x),
                    fmt_num(dst.y),
                    fmt_num(dst.w),
                    fmt_num(dst.h),
                    data_url,
                );
            }
            SceneOp::DrawText { layout, x, y } => {
                self.emit_text(layout, *x, *y);
            }
        }
    }

    fn open_group_with_transform(&mut self, m: Affine) {
        let _ = write!(
            self.body,
            "<g transform=\"matrix({} {} {} {} {} {})\">",
            fmt_num(m.a),
            fmt_num(m.b),
            fmt_num(m.c),
            fmt_num(m.d),
            fmt_num(m.e),
            fmt_num(m.f),
        );
        self.cur_mut().groups_in_frame += 1;
    }

    fn open_group_with_clip(&mut self, id: &str) {
        let _ = write!(self.body, "<g clip-path=\"url(#{})\">", id);
        self.cur_mut().groups_in_frame += 1;
    }

    fn alloc_clip_id(&mut self) -> String {
        let id = format!("c{}", self.next_clip_id);
        self.next_clip_id += 1;
        id
    }

    fn apply_paint(&mut self, p: &Paint) {
        // Fill: solid colour, or first-stop colour for gradients.
        let new_fill = p.fill.as_ref().map(|f| {
            let c = primary_color(f);
            if c.a >= 1.0 {
                format!("{}", rgb_color(c))
            } else {
                // Embed alpha via the fill attribute itself by switching
                // to `rgba(...)`. We rely on the SVG 2 / browser-friendly
                // `rgba()` form; strict SVG 1.1 viewers would want a
                // separate `fill-opacity`, but every modern renderer
                // (librsvg, browser SVG impls, Inkscape) accepts rgba().
                rgba_color(c)
            }
        });
        let new_stroke = p.stroke.as_ref().map(format_stroke_attrs);
        let cur = self.cur_mut();
        cur.fill_attr = new_fill;
        cur.stroke_attrs = new_stroke;
    }

    fn emit_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        if self.text_engine.is_none() {
            self.text_engine = Some(veusz_paint_text::TextEngine::new());
        }
        let glyphs = self
            .text_engine
            .as_ref()
            .unwrap()
            .layout_to_glyph_paths(layout, (x, y));
        if glyphs.is_empty() {
            self.emit_text_placeholder(layout, x, y);
            return;
        }
        // Group all the glyph paths under a parent `<g>` carrying the
        // layout colour. Per-glyph we apply a `transform=matrix(...)` for
        // position.
        let _ = write!(
            self.body,
            "<g fill=\"{}\">",
            rgb_color(layout.style.color),
        );
        for g in glyphs {
            let _ = write!(
                self.body,
                "<path d=\"{}\" transform=\"matrix({} {} {} {} {} {})\"/>",
                path_d(&g.path),
                fmt_num(g.position.a),
                fmt_num(g.position.b),
                fmt_num(g.position.c),
                fmt_num(g.position.d),
                fmt_num(g.position.e),
                fmt_num(g.position.f),
            );
        }
        self.body.push_str("</g>");
    }

    fn emit_text_placeholder(&mut self, layout: &TextLayout, x: f64, y: f64) {
        // Mirrors the PDF / tiny-skia fallback: dashed bounding-box stroke.
        let w = 0.6 * layout.style.size_pt * (layout.text.chars().count() as f64);
        let h = layout.style.size_pt;
        let c = layout.style.color;
        let _ = write!(
            self.body,
            "<rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" \
             fill=\"none\" stroke=\"{}\" stroke-width=\"0.5\" \
             stroke-dasharray=\"2,2\"/>",
            fmt_num(x),
            fmt_num(y - h),
            fmt_num(w),
            fmt_num(h),
            rgb_color(c),
        );
    }

    fn finish(self) -> Vec<u8> {
        let mut out = String::new();
        out.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        // Standalone SVG 1.1 with xlink (needed by some older viewers for
        // `<image href>`; modern parsers accept either form).
        let _ = write!(
            out,
            "<svg xmlns=\"http://www.w3.org/2000/svg\" \
             xmlns:xlink=\"http://www.w3.org/1999/xlink\" \
             version=\"1.1\" \
             width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">",
            fmt_num(self.width),
            fmt_num(self.height),
            fmt_num(self.width),
            fmt_num(self.height),
        );
        if !self.defs.is_empty() {
            out.push_str("<defs>");
            out.push_str(&self.defs);
            out.push_str("</defs>");
        }
        out.push_str(&self.body);
        // Close any still-open save frames defensively. Well-formed scenes
        // shouldn't trigger this, but it's cheap insurance against widget
        // code that ships an unbalanced trace.
        for frame in self.states.iter().skip(1) {
            for _ in 0..frame.groups_in_frame {
                out.push_str("</g>");
            }
        }
        // The bottom-of-stack frame's groups close here too.
        if let Some(base) = self.states.first() {
            for _ in 0..base.groups_in_frame {
                out.push_str("</g>");
            }
        }
        out.push_str("</svg>");
        out.into_bytes()
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// SVG `path` `d` attribute from our verb-stream `Path`. Quadratic Beziers
/// stay quadratic — SVG has a real `Q` operator (unlike PDF, which only has
/// cubic).
fn path_d(p: &Path) -> String {
    let mut s = String::with_capacity(p.verbs.len() * 8);
    let mut i = 0;
    for verb in &p.verbs {
        if !s.is_empty() {
            s.push(' ');
        }
        match verb {
            PathVerb::MoveTo => {
                let _ = write!(s, "M {} {}", fmt_num(p.points[i]), fmt_num(p.points[i + 1]));
                i += 2;
            }
            PathVerb::LineTo => {
                let _ = write!(s, "L {} {}", fmt_num(p.points[i]), fmt_num(p.points[i + 1]));
                i += 2;
            }
            PathVerb::QuadTo => {
                let _ = write!(
                    s,
                    "Q {} {} {} {}",
                    fmt_num(p.points[i]),
                    fmt_num(p.points[i + 1]),
                    fmt_num(p.points[i + 2]),
                    fmt_num(p.points[i + 3]),
                );
                i += 4;
            }
            PathVerb::CubicTo => {
                let _ = write!(
                    s,
                    "C {} {} {} {} {} {}",
                    fmt_num(p.points[i]),
                    fmt_num(p.points[i + 1]),
                    fmt_num(p.points[i + 2]),
                    fmt_num(p.points[i + 3]),
                    fmt_num(p.points[i + 4]),
                    fmt_num(p.points[i + 5]),
                );
                i += 6;
            }
            PathVerb::Close => {
                s.push('Z');
            }
        }
    }
    s
}

/// Format a float into SVG-friendly decimal: up to 6 fractional digits,
/// trailing zeros stripped, infinities/NaN clamped to 0 (defensive — the
/// scene IR shouldn't carry them but we'd rather emit a parsable doc than
/// have a viewer choke).
fn fmt_num(v: f64) -> String {
    if !v.is_finite() {
        return "0".to_string();
    }
    // Integral fast-path: avoid emitting e.g. "100.000000" for "100".
    if v.fract() == 0.0 && v.abs() < 1e15 {
        return format!("{}", v as i64);
    }
    let s = format!("{:.6}", v);
    // Strip trailing zeros + a dangling dot.
    let trimmed = s.trim_end_matches('0').trim_end_matches('.');
    trimmed.to_string()
}

fn rgb_color(c: Color) -> String {
    let r = (c.r * 255.0).round().clamp(0.0, 255.0) as u8;
    let g = (c.g * 255.0).round().clamp(0.0, 255.0) as u8;
    let b = (c.b * 255.0).round().clamp(0.0, 255.0) as u8;
    format!("rgb({},{},{})", r, g, b)
}

fn rgba_color(c: Color) -> String {
    let r = (c.r * 255.0).round().clamp(0.0, 255.0) as u8;
    let g = (c.g * 255.0).round().clamp(0.0, 255.0) as u8;
    let b = (c.b * 255.0).round().clamp(0.0, 255.0) as u8;
    let a = c.a.clamp(0.0, 1.0);
    format!("rgba({},{},{},{})", r, g, b, fmt_num(a as f64))
}

fn primary_color(f: &Fill) -> Color {
    match f {
        Fill::Solid(c) => *c,
        Fill::Linear(g) => g.stops.first().map(|s| s.color).unwrap_or(Color::BLACK),
        Fill::Radial(g) => g.stops.first().map(|s| s.color).unwrap_or(Color::BLACK),
    }
}

fn format_stroke_attrs(s: &Stroke) -> String {
    let mut out = String::new();
    let _ = write!(out, "stroke=\"{}\"", rgb_color(s.color));
    if s.color.a < 1.0 {
        let _ = write!(out, " stroke-opacity=\"{}\"", fmt_num(s.color.a as f64));
    }
    let _ = write!(out, " stroke-width=\"{}\"", fmt_num(s.width));
    let cap = match s.cap {
        LineCap::Butt => "butt",
        LineCap::Round => "round",
        LineCap::Square => "square",
    };
    let join = match s.join {
        LineJoin::Miter => "miter",
        LineJoin::Round => "round",
        LineJoin::Bevel => "bevel",
    };
    let _ = write!(out, " stroke-linecap=\"{}\"", cap);
    let _ = write!(out, " stroke-linejoin=\"{}\"", join);
    let _ = write!(out, " stroke-miterlimit=\"{}\"", fmt_num(s.miter_limit));
    if let Some(dash) = &s.dash {
        let parts: Vec<String> = dash.iter().map(|x| fmt_num(*x)).collect();
        let _ = write!(out, " stroke-dasharray=\"{}\"", parts.join(","));
    }
    out
}

fn encode_image_as_data_url(image: &veusz_paint_core::Image) -> Result<String, String> {
    if image.width == 0 || image.height == 0 {
        return Err("zero-dimensioned image".into());
    }
    let mut png_bytes: Vec<u8> = Vec::new();
    {
        let mut enc = png::Encoder::new(&mut png_bytes, image.width, image.height);
        enc.set_color(png::ColorType::Rgba);
        enc.set_depth(png::BitDepth::Eight);
        let mut writer = enc
            .write_header()
            .map_err(|e| format!("PNG header write failed: {e}"))?;
        writer
            .write_image_data(&image.pixels)
            .map_err(|e| format!("PNG pixel write failed: {e}"))?;
    }
    let mut out = String::from("data:image/png;base64,");
    out.push_str(&B64.encode(&png_bytes));
    Ok(out)
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

    fn as_str(svg: &[u8]) -> &str {
        std::str::from_utf8(svg).expect("SVG must be valid UTF-8")
    }

    #[test]
    fn empty_scene_produces_valid_svg_header() {
        let svg = render_scene_to_svg(&Scene::new(), 100.0, 50.0, (1.0, 1.0, 1.0, 1.0))
            .expect("render");
        let s = as_str(&svg);
        assert!(s.starts_with("<?xml version=\"1.0\""),
                "must begin with XML declaration; got {:?}", &s[..40.min(s.len())]);
        assert!(s.contains("xmlns=\"http://www.w3.org/2000/svg\""),
                "must declare the SVG namespace");
        assert!(s.contains("viewBox=\"0 0 100 50\""),
                "must encode the page size in viewBox");
        assert!(s.ends_with("</svg>"), "must close the root element");
    }

    #[test]
    fn fill_red_rect_emits_path_with_fill_attribute() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }),
                          FillRule::NonZero);
        });
        let svg = render_scene_to_svg(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains("<path"), "expected a <path>; got {s}");
        assert!(s.contains("fill=\"rgb(255,0,0)\""),
                "expected red fill attribute; got {s}");
        assert!(s.contains("fill-rule=\"nonzero\""),
                "expected non-zero fill-rule; got {s}");
    }

    #[test]
    fn dashed_stroke_emits_stroke_dasharray() {
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
        let svg = render_scene_to_svg(&scene, 200.0, 50.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains("stroke-dasharray=\"4,2\""),
                "expected dash pattern in stroke-dasharray; got {s}");
        assert!(s.contains("stroke=\"rgb(0,0,0)\""),
                "expected black stroke colour");
    }

    #[test]
    fn quad_to_emitted_as_q_not_lowered_to_cubic() {
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
        let svg = render_scene_to_svg(&scene, 200.0, 200.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        // Look inside the d="..." attribute for a Q verb. SVG keeps Q as
        // a real op (per spec) — we don't lower it here.
        assert!(s.contains(" Q 50 100 100 0") || s.contains(" Q 50 100 100 0\""),
                "expected literal Q operator in path data; got {s}");
        assert!(!s.contains(" C "),
                "must NOT have lowered quadratic to a cubic");
    }

    #[test]
    fn image_embed_produces_data_url() {
        let scene = scene_with(|rec| {
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
        let svg = render_scene_to_svg(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains("<image"), "expected an <image> element");
        assert!(s.contains("href=\"data:image/png;base64,"),
                "expected a base64 PNG data URL; got {s}");
    }

    #[test]
    fn save_restore_balances_groups() {
        let scene = scene_with(|rec| {
            rec.save();
            rec.concat_transform(Affine::translate(10.0, 20.0));
            rec.save();
            rec.push_clip_rect(Rect { x: 0.0, y: 0.0, w: 5.0, h: 5.0 });
            rec.restore(); // closes the clip's <g>
            rec.restore(); // closes the transform's <g>
        });
        let svg = render_scene_to_svg(&scene, 50.0, 50.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        let opens = s.matches("<g ").count();
        let closes = s.matches("</g>").count();
        assert_eq!(opens, closes,
                   "open/close groups must balance; <g…>={opens} </g>={closes} in {s}");
    }

    // ---- additional coverage ------------------------------------------------

    #[test]
    fn transform_serialised_as_matrix_attr() {
        let scene = scene_with(|rec| {
            rec.concat_transform(Affine {
                a: 1.0, b: 0.0, c: 0.0, d: 1.0, e: 7.5, f: 0.0
            });
        });
        let svg = render_scene_to_svg(&scene, 50.0, 50.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains("transform=\"matrix(1 0 0 1 7.5 0)\""),
                "expected matrix(...) transform; got {s}");
    }

    #[test]
    fn cubic_path_emits_c_operator() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: None,
                stroke: Some(Stroke::default()),
                anti_alias: true,
            });
            let mut p = Path::new();
            p.move_to(0.0, 0.0);
            p.cubic_to(10.0, 20.0, 30.0, 40.0, 50.0, 60.0);
            rec.stroke_path(&p);
        });
        let svg = render_scene_to_svg(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains(" C 10 20 30 40 50 60"),
                "expected C op in d=; got {s}");
    }

    #[test]
    fn evenodd_fill_path_carries_correct_attribute() {
        let scene = scene_with(|rec| {
            rec.set_paint(&Paint {
                fill: Some(Fill::Solid(Color::rgba8(0, 128, 255, 255))),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }),
                          FillRule::EvenOdd);
        });
        let svg = render_scene_to_svg(&scene, 100.0, 100.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains("fill-rule=\"evenodd\""),
                "expected even-odd rule attribute; got {s}");
    }

    #[test]
    fn clip_path_uses_defs_and_url_reference() {
        let scene = scene_with(|rec| {
            rec.save();
            rec.push_clip_rect(Rect { x: 5.0, y: 5.0, w: 20.0, h: 20.0 });
            rec.set_paint(&Paint {
                fill: Some(Fill::Solid(Color::rgba8(255, 255, 0, 255))),
                stroke: None, anti_alias: true,
            });
            rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 100.0, h: 100.0 }),
                          FillRule::NonZero);
            rec.restore();
        });
        let svg = render_scene_to_svg(&scene, 50.0, 50.0,
                                      (1.0, 1.0, 1.0, 1.0)).unwrap();
        let s = as_str(&svg);
        assert!(s.contains("<defs>"), "expected a <defs> block; got {s}");
        assert!(s.contains("<clipPath id=\"c0\""),
                "expected clipPath in defs; got {s}");
        assert!(s.contains("clip-path=\"url(#c0)\""),
                "expected clip-path url reference; got {s}");
    }
}
