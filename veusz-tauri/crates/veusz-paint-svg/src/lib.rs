//! Scene -> SVG emitter.
//!
//! Converts the abstract [`Scene`] from `veusz-paint-core` into a single
//! standalone SVG document. It is the vector counterpart of
//! `veusz-paint-pdf`: same input IR, resolution-independent output. Because it
//! is pure Rust with no Qt and no GPU, it runs both natively and in the
//! browser (wired through `veusz-paint-wasm`), giving the embed true
//! client-side vector export without the Qt `SVGPaintDevice`.
//!
//! Coordinate system
//! -----------------
//! SVG's user space is y-down with a top-left origin — exactly the Scene's
//! screen-pixel convention — so no axis flip is needed (unlike PDF).
//! Our [`Affine`] `(a,b,c,d,e,f)` maps `(x,y) -> (a·x+c·y+e, b·x+d·y+f)`,
//! which is precisely SVG `matrix(a b c d e f)`.
//!
//! State model
//! -----------
//! `save`/`restore` and transforms/clips are realised as nested `<g>` groups,
//! mirroring the PDF backend's `q`/`Q` bracketing: a `save` records the current
//! group depth; each transform/clip opens a `<g>`; `restore` closes every group
//! opened since its matching `save`. `pop_clip` is a no-op — clips are always
//! bracketed by a save/restore frame (guaranteed by the recording layer), so
//! the enclosing `restore` closes the clip group.
//!
//! What's in: paths (fill non-zero/even-odd, stroke), solid + linear/radial
//! gradient fills, dashes/caps/joins/miter, full affine transforms, rect & path
//! clips, RGBA images (embedded as base64 PNG `<image>`), batched markers, and
//! real vector `<text>`. Blend modes other than source-over are not emitted
//! (the audit shows Veusz rarely needs them).

#![forbid(unsafe_code)]

use std::fmt::Write as _;

use base64::Engine as _;
use veusz_paint_core::{
    Color, Fill, FillRule, LineCap, LineJoin, Paint, Path, PathVerb, Scene, SceneOp,
    Stroke, TextLayout,
};

/// Render a [`Scene`] into a standalone SVG document string.
///
/// `width`/`height` are the SVG canvas size in pixels (the `viewBox` is
/// `0 0 width height`). The canvas is filled with `background` first.
pub fn render_scene_to_svg(
    scene: &Scene,
    width: f64,
    height: f64,
    background: (f32, f32, f32, f32),
) -> String {
    let mut e = SvgEmitter::new(width, height, background);
    for op in &scene.ops {
        e.emit(op);
    }
    e.finish()
}

struct SvgEmitter {
    width: f64,
    height: f64,
    defs: String,
    body: String,
    /// Number of `<g>` elements currently open.
    group_depth: usize,
    /// Group depth recorded at each `save`.
    save_stack: Vec<usize>,
    /// Current paint, applied per drawing op.
    fill: Option<Fill>,
    stroke: Option<Stroke>,
    next_id: usize,
}

impl SvgEmitter {
    fn new(width: f64, height: f64, bg: (f32, f32, f32, f32)) -> Self {
        let mut body = String::new();
        if bg.3 > 0.0 {
            let _ = write!(
                body,
                "<rect x=\"0\" y=\"0\" width=\"{}\" height=\"{}\" fill=\"{}\"{}/>",
                num(width), num(height),
                rgb(Color::new(bg.0, bg.1, bg.2, bg.3)), opacity("fill", bg.3),
            );
        }
        Self {
            width, height, defs: String::new(), body,
            group_depth: 0, save_stack: Vec::new(),
            fill: None, stroke: None, next_id: 0,
        }
    }

    fn id(&mut self, prefix: &str) -> String {
        let n = self.next_id;
        self.next_id += 1;
        format!("{prefix}{n}")
    }

    fn emit(&mut self, op: &SceneOp) {
        match op {
            SceneOp::Save => self.save_stack.push(self.group_depth),
            SceneOp::Restore => {
                let target = self.save_stack.pop().unwrap_or(0);
                while self.group_depth > target {
                    self.body.push_str("</g>");
                    self.group_depth -= 1;
                }
            }
            // The recorder normalises set/concat to relative concatenation
            // (matching the PDF backend); both open a transform group.
            SceneOp::SetTransform(m) | SceneOp::ConcatTransform(m) => {
                let _ = write!(self.body, "<g transform=\"matrix({} {} {} {} {} {})\">",
                    num(m.a), num(m.b), num(m.c), num(m.d), num(m.e), num(m.f));
                self.group_depth += 1;
            }
            SceneOp::PushClipRect(r) => {
                let id = self.id("clip");
                let _ = write!(self.defs,
                    "<clipPath id=\"{id}\" clipPathUnits=\"userSpaceOnUse\">\
                     <rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\"/></clipPath>",
                    num(r.x), num(r.y), num(r.w), num(r.h));
                let _ = write!(self.body, "<g clip-path=\"url(#{id})\">");
                self.group_depth += 1;
            }
            SceneOp::PushClipPath { path, rule } => {
                let id = self.id("clip");
                let cr = if matches!(rule, FillRule::EvenOdd) { " clip-rule=\"evenodd\"" } else { "" };
                let _ = write!(self.defs,
                    "<clipPath id=\"{id}\" clipPathUnits=\"userSpaceOnUse\">\
                     <path d=\"{}\"{cr}/></clipPath>", path_d(path));
                let _ = write!(self.body, "<g clip-path=\"url(#{id})\">");
                self.group_depth += 1;
            }
            // Clips are bracketed by save/restore; the enclosing restore closes
            // the group, so there is nothing to do here.
            SceneOp::PopClip => {}
            SceneOp::SetPaint(p) => self.set_paint(p),
            SceneOp::SetBlendMode(_) | SceneOp::SetQuality(_) => {}
            SceneOp::StrokePath(p) => self.draw_path(p, FillRule::NonZero, false, true),
            SceneOp::FillPath { path, rule } => self.draw_path(path, *rule, true, false),
            SceneOp::DrawImage { image, dst, .. } => {
                if let Ok(uri) = png_data_uri(image) {
                    let _ = write!(self.body,
                        "<image x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" \
                         preserveAspectRatio=\"none\" href=\"{uri}\"/>",
                        num(dst.x), num(dst.y), num(dst.w), num(dst.h));
                }
            }
            SceneOp::DrawText { layout, x, y } => self.draw_text(layout, *x, *y),
            SceneOp::DrawMarkers { path, xs, ys, scales, fill, stroke } => {
                let n = xs.len().min(ys.len());
                for i in 0..n {
                    let s = scales.as_ref().filter(|v| !v.is_empty())
                        .map(|v| v[i % v.len()]).unwrap_or(1.0);
                    let _ = write!(self.body, "<g transform=\"matrix({} 0 0 {} {} {})\">",
                        num(s), num(s), num(xs[i]), num(ys[i]));
                    self.draw_path(path, FillRule::NonZero, *fill, *stroke);
                    self.body.push_str("</g>");
                }
            }
        }
    }

    fn set_paint(&mut self, p: &Paint) {
        self.fill = p.fill.clone();
        self.stroke = p.stroke.clone();
    }

    fn draw_path(&mut self, p: &Path, rule: FillRule, do_fill: bool, do_stroke: bool) {
        // Resolve fill/stroke into attribute strings first (gradients append to
        // defs, so do that before borrowing `body`).
        let fill_attr = if do_fill {
            match self.fill.clone() {
                Some(f) => self.fill_attrs(&f, rule),
                None => "fill=\"none\"".to_string(),
            }
        } else {
            "fill=\"none\"".to_string()
        };
        let stroke_attr = if do_stroke {
            self.stroke.clone().map(|s| stroke_attrs(&s)).unwrap_or_default()
        } else {
            String::new()
        };
        let _ = write!(self.body, "<path d=\"{}\" {fill_attr}{}{stroke_attr}/>",
            path_d(p), if stroke_attr.is_empty() { "" } else { " " });
    }

    /// Fill paint -> `fill=...` (+ `fill-rule`/`fill-opacity`). Gradients are
    /// emitted into `<defs>` and referenced by id.
    fn fill_attrs(&mut self, f: &Fill, rule: FillRule) -> String {
        let rule_attr = if matches!(rule, FillRule::EvenOdd) {
            " fill-rule=\"evenodd\""
        } else { "" };
        match f {
            Fill::Solid(c) => format!("fill=\"{}\"{}{rule_attr}", rgb(*c), opacity("fill", c.a)),
            Fill::Linear(g) => {
                let id = self.id("grad");
                let mut s = String::new();
                let _ = write!(s,
                    "<linearGradient id=\"{id}\" gradientUnits=\"userSpaceOnUse\" \
                     x1=\"{}\" y1=\"{}\" x2=\"{}\" y2=\"{}\">",
                    num(g.start.0), num(g.start.1), num(g.end.0), num(g.end.1));
                for st in &g.stops { let _ = write!(s, "{}", stop(st.offset, st.color)); }
                s.push_str("</linearGradient>");
                self.defs.push_str(&s);
                format!("fill=\"url(#{id})\"{rule_attr}")
            }
            Fill::Radial(g) => {
                let id = self.id("grad");
                let mut s = String::new();
                let _ = write!(s,
                    "<radialGradient id=\"{id}\" gradientUnits=\"userSpaceOnUse\" \
                     cx=\"{}\" cy=\"{}\" r=\"{}\">",
                    num(g.center.0), num(g.center.1), num(g.radius));
                for st in &g.stops { let _ = write!(s, "{}", stop(st.offset, st.color)); }
                s.push_str("</radialGradient>");
                self.defs.push_str(&s);
                format!("fill=\"url(#{id})\"{rule_attr}")
            }
        }
    }

    fn draw_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        let st = &layout.style;
        let weight = if st.weight != 400 { format!(" font-weight=\"{}\"", st.weight) } else { String::new() };
        let italic = if st.italic { " font-style=\"italic\"" } else { "" };
        let _ = write!(self.body,
            "<text x=\"{}\" y=\"{}\" font-family=\"{}\" font-size=\"{}\"{weight}{italic} \
             fill=\"{}\"{}>{}</text>",
            num(x), num(y), xml_attr(&st.family), num(st.size_pt),
            rgb(st.color), opacity("fill", st.color.a), xml_text(&layout.text));
    }

    fn finish(mut self) -> String {
        // Close any groups left open at the top level (transforms/clips applied
        // without a wrapping save).
        while self.group_depth > 0 {
            self.body.push_str("</g>");
            self.group_depth -= 1;
        }
        let mut out = String::new();
        let _ = write!(out,
            "<svg xmlns=\"http://www.w3.org/2000/svg\" \
             xmlns:xlink=\"http://www.w3.org/1999/xlink\" \
             width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">",
            num(self.width), num(self.height), num(self.width), num(self.height));
        if !self.defs.is_empty() {
            out.push_str("<defs>");
            out.push_str(&self.defs);
            out.push_str("</defs>");
        }
        out.push_str(&self.body);
        out.push_str("</svg>");
        out
    }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/// Format a coordinate compactly: integers without a decimal point, otherwise
/// up to 3 decimals with trailing zeros trimmed. Keeps the SVG small.
fn num(v: f64) -> String {
    if !v.is_finite() { return "0".to_string(); }
    if v.fract() == 0.0 && v.abs() < 1e15 { return format!("{}", v as i64); }
    let mut s = format!("{:.3}", v);
    while s.ends_with('0') { s.pop(); }
    if s.ends_with('.') { s.pop(); }
    s
}

fn to8(x: f32) -> u8 { (x.clamp(0.0, 1.0) * 255.0).round() as u8 }

fn rgb(c: Color) -> String {
    format!("rgb({},{},{})", to8(c.r), to8(c.g), to8(c.b))
}

/// `" {kind}-opacity=\"a\""` when `a < 1`, else empty.
fn opacity(kind: &str, a: f32) -> String {
    if a < 1.0 { format!(" {kind}-opacity=\"{}\"", num(a as f64)) } else { String::new() }
}

fn stop(offset: f32, c: Color) -> String {
    format!("<stop offset=\"{}\" stop-color=\"{}\"{}/>",
        num(offset as f64), rgb(c), opacity("stop", c.a))
}

fn stroke_attrs(s: &Stroke) -> String {
    let mut out = format!("stroke=\"{}\" stroke-width=\"{}\"", rgb(s.color), num(s.width));
    out.push_str(&opacity("stroke", s.color.a));
    match s.cap {
        LineCap::Butt => {}
        LineCap::Round => out.push_str(" stroke-linecap=\"round\""),
        LineCap::Square => out.push_str(" stroke-linecap=\"square\""),
    }
    match s.join {
        LineJoin::Miter => {}
        LineJoin::Round => out.push_str(" stroke-linejoin=\"round\""),
        LineJoin::Bevel => out.push_str(" stroke-linejoin=\"bevel\""),
    }
    if (s.miter_limit - 4.0).abs() > 1e-6 {
        let _ = write!(out, " stroke-miterlimit=\"{}\"", num(s.miter_limit));
    }
    if let Some(dash) = &s.dash {
        if !dash.is_empty() {
            let pat: Vec<String> = dash.iter().map(|x| num(*x)).collect();
            let _ = write!(out, " stroke-dasharray=\"{}\"", pat.join(","));
        }
    }
    out
}

fn path_d(p: &Path) -> String {
    let mut d = String::new();
    let mut i = 0;
    for verb in &p.verbs {
        match verb {
            PathVerb::MoveTo => { let _ = write!(d, "M{} {}", num(p.points[i]), num(p.points[i + 1])); i += 2; }
            PathVerb::LineTo => { let _ = write!(d, "L{} {}", num(p.points[i]), num(p.points[i + 1])); i += 2; }
            PathVerb::QuadTo => {
                let _ = write!(d, "Q{} {} {} {}",
                    num(p.points[i]), num(p.points[i + 1]), num(p.points[i + 2]), num(p.points[i + 3]));
                i += 4;
            }
            PathVerb::CubicTo => {
                let _ = write!(d, "C{} {} {} {} {} {}",
                    num(p.points[i]), num(p.points[i + 1]), num(p.points[i + 2]),
                    num(p.points[i + 3]), num(p.points[i + 4]), num(p.points[i + 5]));
                i += 6;
            }
            PathVerb::Close => d.push('Z'),
        }
    }
    d
}

fn xml_text(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;")
}

fn xml_attr(s: &str) -> String {
    xml_text(s).replace('"', "&quot;")
}

/// Encode an RGBA8 image as a `data:image/png;base64,...` URI.
fn png_data_uri(image: &veusz_paint_core::Image) -> Result<String, String> {
    let mut buf: Vec<u8> = Vec::new();
    {
        let mut enc = png::Encoder::new(&mut buf, image.width, image.height);
        enc.set_color(png::ColorType::Rgba);
        enc.set_depth(png::BitDepth::Eight);
        let mut writer = enc.write_header().map_err(|e| e.to_string())?;
        writer.write_image_data(&image.pixels).map_err(|e| e.to_string())?;
    }
    let b64 = base64::engine::general_purpose::STANDARD.encode(&buf);
    Ok(format!("data:image/png;base64,{b64}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use veusz_paint_core::*;

    fn scene_with(f: impl FnOnce(&mut SceneRecorder)) -> Scene {
        let mut r = SceneRecorder::new();
        f(&mut r);
        r.into_scene()
    }

    #[test]
    fn empty_scene_is_well_formed_svg() {
        let svg = render_scene_to_svg(&Scene::new(), 100.0, 80.0, (1.0, 1.0, 1.0, 1.0));
        assert!(svg.starts_with("<svg xmlns="));
        assert!(svg.ends_with("</svg>"));
        assert!(svg.contains("viewBox=\"0 0 100 80\""));
        assert!(svg.contains("<rect")); // background
    }

    #[test]
    fn filled_rect_emits_path_with_rgb_fill() {
        let s = scene_with(|r| {
            r.set_paint(&Paint {
                fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
                stroke: None, anti_alias: true,
            });
            r.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }), FillRule::NonZero);
        });
        let svg = render_scene_to_svg(&s, 50.0, 50.0, (1.0, 1.0, 1.0, 0.0));
        assert!(svg.contains("<path d=\"M0 0L10 0L10 10L0 10Z\""));
        assert!(svg.contains("fill=\"rgb(255,0,0)\""));
    }

    #[test]
    fn dashed_stroke_attrs() {
        let s = scene_with(|r| {
            r.set_paint(&Paint {
                fill: None,
                stroke: Some(Stroke {
                    color: Color::BLACK, width: 2.0, dash: Some(vec![4.0, 2.0]),
                    cap: LineCap::Round, join: LineJoin::Bevel, miter_limit: 4.0,
                }),
                anti_alias: true,
            });
            r.stroke_path(&Path::line(0.0, 0.0, 100.0, 0.0));
        });
        let svg = render_scene_to_svg(&s, 200.0, 50.0, (1.0, 1.0, 1.0, 0.0));
        assert!(svg.contains("stroke=\"rgb(0,0,0)\""));
        assert!(svg.contains("stroke-width=\"2\""));
        assert!(svg.contains("stroke-dasharray=\"4,2\""));
        assert!(svg.contains("stroke-linecap=\"round\""));
        assert!(svg.contains("fill=\"none\""));
    }

    #[test]
    fn save_restore_groups_are_balanced() {
        let s = scene_with(|r| {
            r.save();
            r.concat_transform(Affine::translate(5.0, 10.0));
            r.save();
            r.concat_transform(Affine::scale(2.0, 2.0));
            r.restore();
            r.restore();
        });
        let svg = render_scene_to_svg(&s, 50.0, 50.0, (1.0, 1.0, 1.0, 0.0));
        let opens = svg.matches("<g ").count();
        let closes = svg.matches("</g>").count();
        assert_eq!(opens, closes, "unbalanced <g>: {svg}");
        assert!(svg.contains("matrix(1 0 0 1 5 10)"));
        assert!(svg.contains("matrix(2 0 0 2 0 0)"));
    }

    #[test]
    fn linear_gradient_goes_to_defs() {
        let s = scene_with(|r| {
            r.set_paint(&Paint {
                fill: Some(Fill::Linear(LinearGradient {
                    start: (0.0, 0.0), end: (10.0, 0.0),
                    stops: vec![
                        GradientStop { offset: 0.0, color: Color::rgba8(255, 0, 0, 255) },
                        GradientStop { offset: 1.0, color: Color::rgba8(0, 0, 255, 255) },
                    ],
                })),
                stroke: None, anti_alias: true,
            });
            r.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 10.0 }), FillRule::NonZero);
        });
        let svg = render_scene_to_svg(&s, 20.0, 20.0, (1.0, 1.0, 1.0, 0.0));
        assert!(svg.contains("<defs><linearGradient"));
        assert!(svg.contains("<stop offset=\"0\" stop-color=\"rgb(255,0,0)\""));
        assert!(svg.contains("fill=\"url(#grad0)\""));
    }

    #[test]
    fn text_is_emitted_as_vector_text_escaped() {
        let s = scene_with(|r| {
            r.draw_text(&TextLayout {
                text: "a < b & c".into(),
                style: TextStyle { family: "serif".into(), size_pt: 12.0, weight: 700, italic: true, color: Color::BLACK },
            }, 5.0, 20.0);
        });
        let svg = render_scene_to_svg(&s, 50.0, 50.0, (1.0, 1.0, 1.0, 0.0));
        assert!(svg.contains("<text x=\"5\" y=\"20\""));
        assert!(svg.contains("font-family=\"serif\""));
        assert!(svg.contains("font-weight=\"700\""));
        assert!(svg.contains("font-style=\"italic\""));
        assert!(svg.contains(">a &lt; b &amp; c</text>"));
    }

    #[test]
    fn image_embeds_png_data_uri() {
        let s = scene_with(|r| {
            r.draw_image(
                &Image { width: 2, height: 1, pixels: vec![255,0,0,255, 0,255,0,255] },
                Rect { x: 0.0, y: 0.0, w: 20.0, h: 10.0 }, None);
        });
        let svg = render_scene_to_svg(&s, 20.0, 10.0, (1.0, 1.0, 1.0, 0.0));
        assert!(svg.contains("<image x=\"0\" y=\"0\" width=\"20\" height=\"10\""));
        assert!(svg.contains("href=\"data:image/png;base64,"));
    }

    #[test]
    fn markers_stamp_a_group_per_point() {
        let s = scene_with(|r| {
            r.set_paint(&Paint { fill: Some(Fill::Solid(Color::BLACK)), stroke: None, anti_alias: true });
            let dot = Path::rect(Rect { x: -1.0, y: -1.0, w: 2.0, h: 2.0 });
            r.draw_markers(&dot, &[10.0, 20.0], &[5.0, 6.0], None, true, false);
        });
        let svg = render_scene_to_svg(&s, 50.0, 50.0, (1.0, 1.0, 1.0, 0.0));
        assert!(svg.contains("matrix(1 0 0 1 10 5)"));
        assert!(svg.contains("matrix(1 0 0 1 20 6)"));
    }
}
