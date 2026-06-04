//! Integration tests for the `veusz-render` binary: a Scene-JSON display list
//! in, PNG / SVG / PDF out — no Qt, no Python, no GPU.

use std::process::Command;

/// Path to the binary cargo built for this test (provided by Cargo).
fn bin() -> &'static str {
    env!("CARGO_BIN_EXE_veusz-render")
}

/// Write `bytes` to a temp file under the test's target dir and return its path.
fn tmp(name: &str, bytes: &[u8]) -> std::path::PathBuf {
    let mut p = std::env::temp_dir();
    p.push(format!("veusz-render-test-{}-{name}", std::process::id()));
    std::fs::write(&p, bytes).unwrap();
    p
}

/// A trivial but valid scene: one filled rectangle on the canvas. Exercises the
/// path/fill machinery in every backend rather than just the blank background.
const RECT_SCENE: &str = r#"{"ops":[
  {"SetPaint":{"fill":{"Solid":{"r":0.2,"g":0.4,"b":0.8,"a":1.0}},"stroke":null,"anti_alias":true}},
  {"FillPath":{"path":{"verbs":["MoveTo","LineTo","LineTo","LineTo","Close"],
    "points":[10,10, 90,10, 90,60, 10,60]},"rule":"NonZero"}}
]}"#;

fn run(args: &[&str]) -> std::process::Output {
    Command::new(bin()).args(args).output().expect("spawn veusz-render")
}

#[test]
fn empty_scene_renders_each_format() {
    let scene = tmp("empty.json", b"{\"ops\":[]}");
    let s = scene.to_str().unwrap();

    let png = tmp("empty.png", b"");
    let out = run(&[s, "-f", "png", "-w", "40", "--height", "30", "-o", png.to_str().unwrap()]);
    assert!(out.status.success(), "png: {}", String::from_utf8_lossy(&out.stderr));
    // PNG magic.
    assert_eq!(&std::fs::read(&png).unwrap()[..4], b"\x89PNG");

    let svg = tmp("empty.svg", b"");
    let out = run(&[s, "-f", "svg", "-w", "40", "--height", "30", "-o", svg.to_str().unwrap()]);
    assert!(out.status.success());
    let svg_text = std::fs::read_to_string(&svg).unwrap();
    assert!(svg_text.starts_with("<svg"));
    assert!(svg_text.contains("width=\"40\""));

    let pdf = tmp("empty.pdf", b"");
    let out = run(&[s, "-f", "pdf", "-w", "40", "--height", "30", "-o", pdf.to_str().unwrap()]);
    assert!(out.status.success());
    assert_eq!(&std::fs::read(&pdf).unwrap()[..5], b"%PDF-");
}

#[test]
fn format_inferred_from_output_extension() {
    let scene = tmp("rect.json", RECT_SCENE.as_bytes());
    let out_svg = tmp("inferred.svg", b"");
    // No -f: format should come from the .svg extension.
    let out = run(&[
        scene.to_str().unwrap(),
        "-w", "100", "--height", "70",
        "-o", out_svg.to_str().unwrap(),
    ]);
    assert!(out.status.success(), "{}", String::from_utf8_lossy(&out.stderr));
    let svg = std::fs::read_to_string(&out_svg).unwrap();
    assert!(svg.starts_with("<svg"));
    // The filled rect should appear as a path with our fill colour.
    assert!(svg.contains("<path"), "expected a path for the rect");
}

#[test]
fn scale_multiplies_raster_size() {
    let scene = tmp("empty2.json", b"{\"ops\":[]}");
    let png = tmp("scaled.png", b"");
    let out = run(&[
        scene.to_str().unwrap(),
        "-f", "png", "-w", "50", "--height", "40", "--scale", "3",
        "-o", png.to_str().unwrap(),
    ]);
    assert!(out.status.success());
    // 50x40 @ 3x = 150x120. PNG IHDR width is bytes 16..20 big-endian.
    let bytes = std::fs::read(&png).unwrap();
    let w = u32::from_be_bytes([bytes[16], bytes[17], bytes[18], bytes[19]]);
    let h = u32::from_be_bytes([bytes[20], bytes[21], bytes[22], bytes[23]]);
    assert_eq!((w, h), (150, 120));
}

#[test]
fn bad_input_fails_cleanly() {
    let bad = tmp("bad.json", b"{not json");
    let out = run(&[bad.to_str().unwrap(), "-f", "png", "-o", "/dev/null"]);
    assert!(!out.status.success());
    assert!(String::from_utf8_lossy(&out.stderr).contains("decode failed"));

    let out = run(&["/no/such/file.json", "-f", "png", "-o", "/dev/null"]);
    assert!(!out.status.success());
}
