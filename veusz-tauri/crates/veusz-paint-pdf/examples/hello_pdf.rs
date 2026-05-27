//! Counterpart to `veusz-paint-tiny-skia/examples/hello_scene.rs`: build the
//! same scene, emit a PDF.
//!
//! Run:
//!   cargo run --release -p veusz-paint-pdf --example hello_pdf -- /tmp/hello.pdf

use std::fs::File;
use std::io::Write;

use veusz_paint_core::{
    Affine, Color, Fill, FillRule, GradientStop, LinearGradient, LineCap, LineJoin, Paint, Path,
    Painter, Rect, Scene, SceneRecorder, Stroke, TextLayout, TextStyle,
};
use veusz_paint_pdf::render_scene_to_pdf;

fn build_scene() -> Scene {
    let mut rec = SceneRecorder::new();

    // Blue filled rect with stroke.
    rec.set_paint(&Paint {
        fill: Some(Fill::Solid(Color::rgba8(40, 80, 200, 255))),
        stroke: Some(Stroke {
            color: Color::rgba8(0, 0, 0, 255), width: 2.0, dash: None,
            cap: LineCap::Butt, join: LineJoin::Miter, miter_limit: 4.0,
        }),
        anti_alias: true,
    });
    let r = Path::rect(Rect { x: 30.0, y: 40.0, w: 120.0, h: 80.0 });
    rec.fill_path(&r, FillRule::NonZero);
    rec.stroke_path(&r);

    // Cubic.
    rec.set_paint(&Paint {
        fill: None,
        stroke: Some(Stroke {
            color: Color::rgba8(200, 40, 40, 255), width: 3.0, dash: None,
            cap: LineCap::Round, join: LineJoin::Round, miter_limit: 4.0,
        }),
        anti_alias: true,
    });
    let mut curve = Path::new();
    curve.move_to(180.0, 160.0)
         .cubic_to(220.0, 40.0, 280.0, 200.0, 360.0, 80.0);
    rec.stroke_path(&curve);

    // Dashed line.
    rec.set_paint(&Paint {
        fill: None,
        stroke: Some(Stroke {
            color: Color::rgba8(0, 120, 0, 255), width: 1.5,
            dash: Some(vec![6.0, 4.0]),
            cap: LineCap::Butt, join: LineJoin::Miter, miter_limit: 4.0,
        }),
        anti_alias: true,
    });
    let mut dashed = Path::new();
    dashed.move_to(30.0, 200.0).line_to(370.0, 200.0);
    rec.stroke_path(&dashed);

    // Gradient (lowered to first-stop colour for now).
    rec.set_paint(&Paint {
        fill: Some(Fill::Linear(LinearGradient {
            start: (170.0, 0.0), end: (370.0, 0.0),
            stops: vec![
                GradientStop { offset: 0.0, color: Color::rgba8(255, 240, 0, 255) },
                GradientStop { offset: 1.0, color: Color::rgba8(255, 80, 80, 255) },
            ],
        })),
        stroke: None,
        anti_alias: true,
    });
    rec.fill_path(&Path::rect(Rect { x: 180.0, y: 20.0, w: 190.0, h: 16.0 }), FillRule::NonZero);

    // Rotated square inside a clip.
    rec.save();
    rec.push_clip_rect(Rect { x: 175.0, y: 175.0, w: 50.0, h: 50.0 });
    rec.concat_transform(Affine::translate(200.0, 200.0));
    rec.concat_transform(Affine::rotate(std::f64::consts::PI / 6.0));
    rec.concat_transform(Affine::translate(-15.0, -15.0));
    rec.set_paint(&Paint {
        fill: Some(Fill::Solid(Color::rgba8(120, 120, 120, 255))),
        stroke: None, anti_alias: true,
    });
    rec.fill_path(&Path::rect(Rect { x: 0.0, y: 0.0, w: 30.0, h: 30.0 }), FillRule::NonZero);
    rec.restore();

    // Text placeholder.
    rec.draw_text(
        &TextLayout {
            text: "veusz-paint-pdf (text placeholder)".into(),
            style: TextStyle { size_pt: 14.0, ..TextStyle::default() },
        },
        30.0, 30.0,
    );

    rec.into_scene()
}

fn main() {
    let scene = build_scene();
    println!("scene summary: {:?}", scene.summary());

    let pdf = render_scene_to_pdf(&scene, 400.0, 240.0, (1.0, 1.0, 1.0, 1.0)).expect("emit");
    let out_path = std::env::args().nth(1).unwrap_or_else(|| "/tmp/hello.pdf".into());
    let mut f = File::create(&out_path).expect("open");
    f.write_all(&pdf).expect("write");
    println!("wrote {} bytes to {}", pdf.len(), out_path);
}
