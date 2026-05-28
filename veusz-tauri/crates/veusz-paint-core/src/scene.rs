//! Recorded form of a paint stream.
//!
//! A [`Scene`] is the canonical intermediate representation between widgets
//! (which speak [`Painter`]) and "recording" backends that consume the whole
//! page at once: PDF, SVG, Vello. The tiny-skia and QPainter backends can
//! also consume it for snapshotting and replay, even though they're
//! fundamentally immediate-mode.
//!
//! Use [`SceneRecorder`] to capture a stream of operations against the
//! [`Painter`] trait. [`Scene::replay`] flushes the captured stream onto any
//! other Painter — useful for testing, layer compositing, and serialization
//! round-trips.

use crate::{
    Affine, BlendMode, FillRule, Image, Paint, Painter, Path, Quality, Rect, TextLayout,
};
use serde::{Deserialize, Serialize};

/// serde codec for bulk coordinate arrays. Coordinates are screen-space
/// (device pixels), so f32 precision is ample and halves the bytes; the GPU
/// works in f32 anyway. In human-readable formats (JSON) the packed bytes are
/// base64'd into a string — far smaller and faster than a JSON number array
/// (no per-float text formatting). In binary formats (msgpack) they're a raw
/// `bin`, so this auto-upgrades to a zero-overhead blob if a binary envelope
/// is adopted. In-memory the type stays `Vec<f64>`, so backends are unchanged.
mod coord_blob {
    use base64::Engine as _;
    use serde::{Deserialize, Deserializer, Serializer};

    fn pack(v: &[f64]) -> Vec<u8> {
        let mut bytes = Vec::with_capacity(v.len() * 4);
        for &x in v {
            bytes.extend_from_slice(&(x as f32).to_le_bytes());
        }
        bytes
    }

    fn unpack(bytes: &[u8]) -> Vec<f64> {
        bytes
            .chunks_exact(4)
            .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]) as f64)
            .collect()
    }

    pub fn serialize<S: Serializer>(v: &Vec<f64>, s: S) -> Result<S::Ok, S::Error> {
        let bytes = pack(v);
        if s.is_human_readable() {
            s.serialize_str(&base64::engine::general_purpose::STANDARD.encode(&bytes))
        } else {
            s.serialize_bytes(&bytes)
        }
    }

    pub fn deserialize<'de, D: Deserializer<'de>>(d: D) -> Result<Vec<f64>, D::Error> {
        if d.is_human_readable() {
            let st = String::deserialize(d)?;
            let bytes = base64::engine::general_purpose::STANDARD
                .decode(st.as_bytes())
                .map_err(serde::de::Error::custom)?;
            Ok(unpack(&bytes))
        } else {
            let buf = serde_bytes::ByteBuf::deserialize(d)?;
            Ok(unpack(buf.as_ref()))
        }
    }
}

/// One recorded operation. Exhaustively mirrors [`Painter`]'s methods.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SceneOp {
    Save,
    Restore,
    SetTransform(Affine),
    ConcatTransform(Affine),
    PushClipRect(Rect),
    PushClipPath { path: Path, rule: FillRule },
    PopClip,
    SetPaint(Paint),
    SetBlendMode(BlendMode),
    SetQuality(Quality),
    StrokePath(Path),
    FillPath { path: Path, rule: FillRule },
    DrawImage { image: Image, dst: Rect, src: Option<Rect> },
    DrawText { layout: TextLayout, x: f64, y: f64 },
    /// Batched markers: stamp `path` (marker-local coords) at each
    /// `(xs[i], ys[i])`, optionally scaled by `scales[i]`, filling and/or
    /// stroking with the current paint. Collapses N markers into one op (and
    /// one small JSON payload of position arrays) so large scatters stay
    /// cheap to capture, serialize, and ship to the browser.
    DrawMarkers {
        path: Path,
        #[serde(with = "coord_blob")]
        xs: Vec<f64>,
        #[serde(with = "coord_blob")]
        ys: Vec<f64>,
        scales: Option<Vec<f64>>,
        fill: bool,
        stroke: bool,
    },
}

/// An ordered, serializable sequence of paint operations.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Scene {
    pub ops: Vec<SceneOp>,
}

impl Scene {
    pub fn new() -> Self { Self::default() }

    /// Replay every recorded op onto `target`.
    pub fn replay<P: Painter>(&self, target: &mut P) {
        for op in &self.ops {
            match op {
                SceneOp::Save => target.save(),
                SceneOp::Restore => target.restore(),
                SceneOp::SetTransform(m) => target.set_transform(*m),
                SceneOp::ConcatTransform(m) => target.concat_transform(*m),
                SceneOp::PushClipRect(r) => target.push_clip_rect(*r),
                SceneOp::PushClipPath { path, rule } => target.push_clip_path(path, *rule),
                SceneOp::PopClip => target.pop_clip(),
                SceneOp::SetPaint(p) => target.set_paint(p),
                SceneOp::SetBlendMode(m) => target.set_blend_mode(*m),
                SceneOp::SetQuality(q) => target.set_quality(*q),
                SceneOp::StrokePath(p) => target.stroke_path(p),
                SceneOp::FillPath { path, rule } => target.fill_path(path, *rule),
                SceneOp::DrawImage { image, dst, src } => target.draw_image(image, *dst, *src),
                SceneOp::DrawText { layout, x, y } => target.draw_text(layout, *x, *y),
                SceneOp::DrawMarkers { path, xs, ys, scales, fill, stroke } =>
                    target.draw_markers(path, xs, ys, scales.as_deref(), *fill, *stroke),
            }
        }
        target.finish();
    }

    /// Structural summary for the per-vector-path diff (plan §10.3).
    pub fn summary(&self) -> SceneSummary {
        let mut s = SceneSummary::default();
        for op in &self.ops {
            match op {
                SceneOp::StrokePath(p) => {
                    s.paths_stroked += 1;
                    s.path_verb_total += p.verbs.len();
                }
                SceneOp::FillPath { path, .. } => {
                    s.paths_filled += 1;
                    s.path_verb_total += path.verbs.len();
                }
                SceneOp::DrawText { layout, .. } => {
                    s.text_runs += 1;
                    s.text_chars += layout.text.chars().count();
                }
                SceneOp::DrawImage { .. } => s.images += 1,
                SceneOp::DrawMarkers { xs, ys, fill, stroke, .. } => {
                    s.markers += 1;
                    let n = xs.len().min(ys.len());
                    s.marker_instances += n;
                    if *fill { s.paths_filled += n; }
                    if *stroke { s.paths_stroked += n; }
                }
                SceneOp::Save => s.saves += 1,
                SceneOp::Restore => s.restores += 1,
                SceneOp::PushClipPath { .. } | SceneOp::PushClipRect(_) => s.clips_pushed += 1,
                SceneOp::PopClip => s.clips_popped += 1,
                _ => {}
            }
            s.total_ops += 1;
        }
        s
    }
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct SceneSummary {
    pub total_ops: usize,
    pub paths_stroked: usize,
    pub paths_filled: usize,
    pub path_verb_total: usize,
    pub text_runs: usize,
    pub text_chars: usize,
    pub images: usize,
    pub markers: usize,
    pub marker_instances: usize,
    pub saves: usize,
    pub restores: usize,
    pub clips_pushed: usize,
    pub clips_popped: usize,
}

/// A [`Painter`] that captures every operation into a [`Scene`].
#[derive(Debug, Default)]
pub struct SceneRecorder {
    pub scene: Scene,
}

impl SceneRecorder {
    pub fn new() -> Self { Self::default() }
    pub fn into_scene(self) -> Scene { self.scene }
}

impl Painter for SceneRecorder {
    fn save(&mut self) { self.scene.ops.push(SceneOp::Save); }
    fn restore(&mut self) { self.scene.ops.push(SceneOp::Restore); }
    fn set_transform(&mut self, m: Affine) { self.scene.ops.push(SceneOp::SetTransform(m)); }
    fn concat_transform(&mut self, m: Affine) { self.scene.ops.push(SceneOp::ConcatTransform(m)); }
    fn push_clip_rect(&mut self, r: Rect) { self.scene.ops.push(SceneOp::PushClipRect(r)); }
    fn push_clip_path(&mut self, p: &Path, rule: FillRule) {
        self.scene.ops.push(SceneOp::PushClipPath { path: p.clone(), rule });
    }
    fn pop_clip(&mut self) { self.scene.ops.push(SceneOp::PopClip); }
    fn set_paint(&mut self, p: &Paint) { self.scene.ops.push(SceneOp::SetPaint(p.clone())); }
    fn set_blend_mode(&mut self, m: BlendMode) { self.scene.ops.push(SceneOp::SetBlendMode(m)); }
    fn set_quality(&mut self, q: Quality) { self.scene.ops.push(SceneOp::SetQuality(q)); }
    fn stroke_path(&mut self, p: &Path) { self.scene.ops.push(SceneOp::StrokePath(p.clone())); }
    fn fill_path(&mut self, p: &Path, rule: FillRule) {
        self.scene.ops.push(SceneOp::FillPath { path: p.clone(), rule });
    }
    fn draw_image(&mut self, img: &Image, dst: Rect, src: Option<Rect>) {
        self.scene.ops.push(SceneOp::DrawImage { image: img.clone(), dst, src });
    }
    fn draw_text(&mut self, layout: &TextLayout, x: f64, y: f64) {
        self.scene.ops.push(SceneOp::DrawText { layout: layout.clone(), x, y });
    }
    fn draw_markers(&mut self, path: &Path, xs: &[f64], ys: &[f64],
                    scales: Option<&[f64]>, fill: bool, stroke: bool) {
        self.scene.ops.push(SceneOp::DrawMarkers {
            path: path.clone(), xs: xs.to_vec(), ys: ys.to_vec(),
            scales: scales.map(|s| s.to_vec()), fill, stroke,
        });
    }
    fn finish(&mut self) { /* no-op: scene is consumed by the caller */ }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::*;

    fn sample_scene() -> Scene {
        let mut rec = SceneRecorder::new();
        rec.save();
        rec.concat_transform(Affine::translate(5.0, 10.0));
        rec.set_paint(&Paint {
            fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
            stroke: None,
            anti_alias: true,
        });
        let r = Path::rect(Rect { x: 0.0, y: 0.0, w: 4.0, h: 4.0 });
        rec.fill_path(&r, FillRule::NonZero);
        rec.draw_text(
            &TextLayout { text: "hi".into(), style: TextStyle::default() },
            0.0, 0.0,
        );
        rec.restore();
        rec.finish();
        rec.into_scene()
    }

    #[test]
    fn scene_records_all_ops_in_order() {
        let scene = sample_scene();
        assert_eq!(scene.ops.len(), 6);
        assert!(matches!(scene.ops[0], SceneOp::Save));
        assert!(matches!(scene.ops[5], SceneOp::Restore));
    }

    #[test]
    fn scene_summary_counts_correctly() {
        let s = sample_scene().summary();
        assert_eq!(s.paths_filled, 1);
        assert_eq!(s.paths_stroked, 0);
        assert_eq!(s.text_runs, 1);
        assert_eq!(s.text_chars, 2);
        assert_eq!(s.saves, 1);
        assert_eq!(s.restores, 1);
        assert_eq!(s.total_ops, 6);
    }

    #[test]
    fn scene_replay_to_recorder_is_identity() {
        let original = sample_scene();
        let mut replay = SceneRecorder::new();
        original.replay(&mut replay);
        assert_eq!(original, replay.into_scene());
    }

    #[test]
    fn scene_json_roundtrip() {
        let original = sample_scene();
        let json = serde_json::to_string(&original).unwrap();
        let back: Scene = serde_json::from_str(&json).unwrap();
        assert_eq!(original, back);
    }

    #[test]
    fn drawmarkers_coords_are_base64_f32_in_json() {
        let mut rec = SceneRecorder::new();
        rec.set_paint(&Paint {
            fill: Some(Fill::Solid(Color::BLACK)), stroke: None, anti_alias: true,
        });
        let circle = Path::rect(Rect { x: -1.0, y: -1.0, w: 2.0, h: 2.0 });
        rec.draw_markers(&circle, &[1.5, 2.25, 3.0], &[10.0, 20.0, 30.0], None, true, false);
        let scene = rec.into_scene();

        let json = serde_json::to_string(&scene).unwrap();
        // Coords serialize as a base64 string, NOT a JSON number array.
        assert!(!json.contains("[1.5,2.25,3.0]"));

        let back: Scene = serde_json::from_str(&json).unwrap();
        match &back.ops[1] {
            SceneOp::DrawMarkers { xs, ys, fill, stroke, .. } => {
                assert_eq!(xs.len(), 3);
                assert!((xs[0] - 1.5).abs() < 1e-5);   // f32 round-trips these exactly
                assert!((ys[2] - 30.0).abs() < 1e-3);
                assert!(*fill && !*stroke);
            }
            other => panic!("expected DrawMarkers, got {other:?}"),
        }
    }
}
