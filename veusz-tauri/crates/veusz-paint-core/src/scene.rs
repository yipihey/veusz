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
}
