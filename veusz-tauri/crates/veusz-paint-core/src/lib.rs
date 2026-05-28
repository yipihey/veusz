//! Abstract Painter trait and the value types it operates on.
//!
//! This crate is the Rust mirror of `veusz/paint/protocol.py`. Keep the two
//! in lockstep: when an op is added on one side, add it on the other.
//!
//! Backends (`veusz-paint-tiny-skia`, `veusz-paint-vello`, `veusz-paint-pdf`,
//! `veusz-paint-svg`) implement [`Painter`] over their respective targets.
//! The Python QPainter shim lives in `veusz/paint/qt_backend.py` and does
//! not need this crate — Rust is only on the new-backend side.
//!
//! See `docs/parallel-paint-backends-plan.md` §4 for the design rationale.

#![forbid(unsafe_code)]

use serde::{Deserialize, Serialize};

pub mod scene;
pub use scene::{Scene, SceneOp, SceneRecorder, SceneSummary};

// ---------------------------------------------------------------------------
// Value types
// ---------------------------------------------------------------------------

/// Linear-sRGB color with straight alpha; channels in `[0, 1]`.
#[derive(Copy, Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

impl Color {
    pub const fn new(r: f32, g: f32, b: f32, a: f32) -> Self {
        Self { r, g, b, a }
    }
    pub fn rgba8(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self {
            r: r as f32 / 255.0,
            g: g as f32 / 255.0,
            b: b as f32 / 255.0,
            a: a as f32 / 255.0,
        }
    }
    pub const BLACK: Self = Self::new(0.0, 0.0, 0.0, 1.0);
    pub const TRANSPARENT: Self = Self::new(0.0, 0.0, 0.0, 0.0);
}

/// 2x3 affine matrix: `[a c e; b d f]`, mapping `(x, y) -> (a*x + c*y + e, b*x + d*y + f)`.
#[derive(Copy, Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Affine {
    pub a: f64,
    pub b: f64,
    pub c: f64,
    pub d: f64,
    pub e: f64,
    pub f: f64,
}

impl Affine {
    pub const IDENTITY: Self = Self { a: 1.0, b: 0.0, c: 0.0, d: 1.0, e: 0.0, f: 0.0 };
    pub const fn translate(tx: f64, ty: f64) -> Self {
        Self { a: 1.0, b: 0.0, c: 0.0, d: 1.0, e: tx, f: ty }
    }
    pub const fn scale(sx: f64, sy: f64) -> Self {
        Self { a: sx, b: 0.0, c: 0.0, d: sy, e: 0.0, f: 0.0 }
    }
    pub fn rotate(theta_rad: f64) -> Self {
        let (s, c) = theta_rad.sin_cos();
        Self { a: c, b: s, c: -s, d: c, e: 0.0, f: 0.0 }
    }
    /// Right-multiply: `self * other`.
    pub fn then(self, other: Affine) -> Affine {
        Affine {
            a: self.a * other.a + self.b * other.c,
            b: self.a * other.b + self.b * other.d,
            c: self.c * other.a + self.d * other.c,
            d: self.c * other.b + self.d * other.d,
            e: self.e * other.a + self.f * other.c + other.e,
            f: self.e * other.b + self.f * other.d + other.f,
        }
    }
}

impl Default for Affine {
    fn default() -> Self { Self::IDENTITY }
}

#[derive(Copy, Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum FillRule {
    NonZero,
    EvenOdd,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum LineCap { Butt, Round, Square }

#[derive(Copy, Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum LineJoin { Miter, Round, Bevel }

/// Blend modes Veusz actually uses (per the audit). Extend only after a
/// dynamic-pass measurement proves a real need.
#[derive(Copy, Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum BlendMode {
    SourceOver,
    Multiply,
    Plus,
}

/// Coarse render hint. Replaces QPainter's `setRenderHint` bitset.
#[derive(Copy, Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Quality {
    Fast,
    Balanced,
    Best,
}

// ---------------------------------------------------------------------------
// Fill / Stroke / Paint
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GradientStop {
    pub offset: f32,
    pub color: Color,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct LinearGradient {
    pub start: (f64, f64),
    pub end: (f64, f64),
    pub stops: Vec<GradientStop>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RadialGradient {
    pub center: (f64, f64),
    pub radius: f64,
    pub stops: Vec<GradientStop>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Fill {
    Solid(Color),
    Linear(LinearGradient),
    Radial(RadialGradient),
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Stroke {
    pub color: Color,
    pub width: f64,
    pub dash: Option<Vec<f64>>,
    pub cap: LineCap,
    pub join: LineJoin,
    pub miter_limit: f64,
}

impl Default for Stroke {
    fn default() -> Self {
        Self {
            color: Color::BLACK,
            width: 1.0,
            dash: None,
            cap: LineCap::Butt,
            join: LineJoin::Miter,
            miter_limit: 4.0,
        }
    }
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Paint {
    pub fill: Option<Fill>,
    pub stroke: Option<Stroke>,
    pub anti_alias: bool,
}

// ---------------------------------------------------------------------------
// Path
// ---------------------------------------------------------------------------

#[derive(Copy, Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PathVerb {
    MoveTo,
    LineTo,
    QuadTo,
    CubicTo,
    Close,
}

/// A 2D path described as a verb stream + a flat `[f64]` coordinate stream.
/// Indices into `points` are implicit from the verbs (MoveTo/LineTo = 2,
/// QuadTo = 4, CubicTo = 6, Close = 0).
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Path {
    pub verbs: Vec<PathVerb>,
    pub points: Vec<f64>,
}

impl Path {
    pub fn new() -> Self { Self::default() }

    pub fn move_to(&mut self, x: f64, y: f64) -> &mut Self {
        self.verbs.push(PathVerb::MoveTo);
        self.points.extend_from_slice(&[x, y]);
        self
    }
    pub fn line_to(&mut self, x: f64, y: f64) -> &mut Self {
        self.verbs.push(PathVerb::LineTo);
        self.points.extend_from_slice(&[x, y]);
        self
    }
    pub fn quad_to(&mut self, cx: f64, cy: f64, x: f64, y: f64) -> &mut Self {
        self.verbs.push(PathVerb::QuadTo);
        self.points.extend_from_slice(&[cx, cy, x, y]);
        self
    }
    pub fn cubic_to(&mut self, c1x: f64, c1y: f64, c2x: f64, c2y: f64,
                    x: f64, y: f64) -> &mut Self {
        self.verbs.push(PathVerb::CubicTo);
        self.points.extend_from_slice(&[c1x, c1y, c2x, c2y, x, y]);
        self
    }
    pub fn close(&mut self) -> &mut Self {
        self.verbs.push(PathVerb::Close);
        self
    }

    pub fn line(x1: f64, y1: f64, x2: f64, y2: f64) -> Self {
        let mut p = Self::new();
        p.move_to(x1, y1).line_to(x2, y2);
        p
    }
    pub fn rect(r: Rect) -> Self {
        let mut p = Self::new();
        p.move_to(r.x, r.y)
         .line_to(r.x + r.w, r.y)
         .line_to(r.x + r.w, r.y + r.h)
         .line_to(r.x, r.y + r.h)
         .close();
        p
    }
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TextStyle {
    pub family: String,
    pub size_pt: f64,
    pub weight: u16, // CSS-scale: 400 normal, 700 bold
    pub italic: bool,
    pub color: Color,
}

impl Default for TextStyle {
    fn default() -> Self {
        Self {
            family: "sans-serif".into(),
            size_pt: 10.0,
            weight: 400,
            italic: false,
            color: Color::BLACK,
        }
    }
}

/// Opaque to widget code; backends own the laid-out form internally.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TextLayout {
    pub text: String,
    pub style: TextStyle,
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

/// RGBA8, row-major, straight (un-premultiplied) alpha.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Image {
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
}

// ---------------------------------------------------------------------------
// Painter trait
// ---------------------------------------------------------------------------

/// The interface every backend implements.
pub trait Painter {
    // state stack
    fn save(&mut self);
    fn restore(&mut self);

    // transform
    fn set_transform(&mut self, m: Affine);
    fn concat_transform(&mut self, m: Affine);

    // clip
    fn push_clip_rect(&mut self, r: Rect);
    fn push_clip_path(&mut self, p: &Path, rule: FillRule);
    fn pop_clip(&mut self);

    // paint state
    fn set_paint(&mut self, p: &Paint);
    fn set_blend_mode(&mut self, m: BlendMode);
    fn set_quality(&mut self, q: Quality);

    // geometry
    fn stroke_path(&mut self, p: &Path);
    fn fill_path(&mut self, p: &Path, rule: FillRule);
    fn draw_image(&mut self, img: &Image, dst: Rect, src: Option<Rect>);

    // text
    fn draw_text(&mut self, layout: &TextLayout, x: f64, y: f64);

    // batched markers: stamp `path` (marker-local coords) at each
    // `(xs[i], ys[i])`, optionally scaled by `scales[i]`, filling and/or
    // stroking with the current paint. Default expands to per-marker
    // transform + fill/stroke; backends may specialise for instancing.
    fn draw_markers(&mut self, path: &Path, xs: &[f64], ys: &[f64],
                    scales: Option<&[f64]>, fill: bool, stroke: bool) {
        let n = xs.len().min(ys.len());
        for i in 0..n {
            self.save();
            self.concat_transform(Affine::translate(xs[i], ys[i]));
            if let Some(sc) = scales {
                if !sc.is_empty() {
                    let s = sc[i % sc.len()];
                    self.concat_transform(Affine::scale(s, s));
                }
            }
            if fill { self.fill_path(path, FillRule::NonZero); }
            if stroke { self.stroke_path(path); }
            self.restore();
        }
    }

    // lifecycle
    fn finish(&mut self);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn affine_identity_is_default() {
        assert_eq!(Affine::default(), Affine::IDENTITY);
    }

    #[test]
    fn affine_compose_translate_then_scale() {
        let t = Affine::translate(10.0, 20.0);
        let s = Affine::scale(2.0, 3.0);
        let m = t.then(s);
        // Apply to (1, 1): translate -> (11, 21); scale -> (22, 63)
        let (x, y) = (1.0, 1.0);
        let (nx, ny) = (m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f);
        assert!((nx - 22.0).abs() < 1e-9);
        assert!((ny - 63.0).abs() < 1e-9);
    }

    #[test]
    fn path_rect_has_five_verbs() {
        let p = Path::rect(Rect { x: 0.0, y: 0.0, w: 10.0, h: 5.0 });
        assert_eq!(p.verbs.len(), 5); // M, L, L, L, Close
        assert!(matches!(p.verbs[0], PathVerb::MoveTo));
        assert!(matches!(p.verbs[4], PathVerb::Close));
    }

    #[test]
    fn paint_roundtrip_json() {
        let paint = Paint {
            fill: Some(Fill::Solid(Color::rgba8(255, 128, 0, 200))),
            stroke: Some(Stroke::default()),
            anti_alias: true,
        };
        let s = serde_json::to_string(&paint).unwrap();
        let back: Paint = serde_json::from_str(&s).unwrap();
        assert_eq!(paint, back);
    }
}
