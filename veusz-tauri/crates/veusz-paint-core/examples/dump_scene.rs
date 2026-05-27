use veusz_paint_core::*;
fn main() {
    let mut rec = SceneRecorder::new();
    rec.save();
    rec.concat_transform(Affine::translate(5.0, 10.0));
    rec.set_paint(&Paint {
        fill: Some(Fill::Solid(Color::rgba8(255, 0, 0, 255))),
        stroke: Some(Stroke::default()),
        anti_alias: true,
    });
    rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 4.0, h: 4.0 }), FillRule::NonZero);
    rec.restore();
    let scene = rec.into_scene();
    println!("{}", serde_json::to_string_pretty(&scene).unwrap());
}
