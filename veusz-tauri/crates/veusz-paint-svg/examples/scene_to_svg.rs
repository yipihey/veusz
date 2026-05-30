//! Convert a captured Scene-JSON file to SVG.
//!
//!   cargo run -p veusz-paint-svg --example scene_to_svg -- scene.json [w] [h] > out.svg
//!
//! The input is the raw JSON the daemon's `render.scene` emits (base64-decode
//! its `scene_b64`). Handy for eyeballing the emitter against real documents.

use veusz_paint_core::Scene;
use veusz_paint_svg::render_scene_to_svg;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let path = args.get(1).expect("usage: scene_to_svg <scene.json> [w] [h]");
    let w: f64 = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(700.0);
    let h: f64 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(500.0);
    let bytes = std::fs::read(path).expect("read scene file");
    let scene: Scene = serde_json::from_slice(&bytes).expect("parse Scene JSON");
    print!("{}", render_scene_to_svg(&scene, w, h, (1.0, 1.0, 1.0, 1.0)));
}
