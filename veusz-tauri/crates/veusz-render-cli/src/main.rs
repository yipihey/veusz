//! `veusz-render` — render a Veusz **Scene-JSON** display list to PNG / SVG / PDF
//! with no Qt, no Python, and no GPU.
//!
//! This is the headless, native counterpart to the two existing scene
//! consumers:
//!   * the browser wasm renderer (`veusz-paint-wasm`, `scene_to_svg` /
//!     `render_scene_to_canvas`), and
//!   * the PyO3 bridge (`_paint_ext`, `render_scene_to_png` / `_pdf_bytes`).
//!
//! The scene itself is produced by the pure-Python + numpy headless wheel
//! (`veusz.paint.scene_recorder`), which needs no Qt. So the full pipeline
//!
//!     .vsz  --(python+numpy)-->  scene.json  --(this binary)-->  png/svg/pdf
//!
//! runs anywhere — CI, a server, a laptop without PyQt6 — which is the whole
//! point of the Rust backends. It uses the same pure-Rust software backends as
//! `_paint_ext` (tiny-skia for raster; the SVG and PDF emitters for vector), so
//! output matches the reference renderer byte-for-byte where those backends do.
//!
//! Usage:
//!     veusz-render <scene.json|-> --format png|svg|pdf \
//!         --width 720 --height 520 [--out fig.svg|-] \
//!         [--background r,g,b,a] [--scale N]
//!
//! `-` means stdin (input) / stdout (output). Format is inferred from `--out`'s
//! extension when `--format` is omitted. `--scale` multiplies the raster pixel
//! size (PNG only) for hi-DPI posters; SVG/PDF are resolution-independent.

use std::io::{Read, Write};
use std::process::ExitCode;

use veusz_paint_core::{Color, Scene};
use veusz_paint_pdf::render_scene_to_pdf;
use veusz_paint_svg::render_scene_to_svg;
use veusz_paint_tiny_skia::TinySkiaPainter;

const USAGE: &str = "\
veusz-render — render a Veusz Scene-JSON display list to PNG/SVG/PDF (no Qt, no Python, no GPU)

USAGE:
    veusz-render <INPUT> [OPTIONS]

ARGS:
    <INPUT>              Scene-JSON file, or `-` for stdin

OPTIONS:
    -f, --format FMT     png | svg | pdf   (default: inferred from --out, else png)
    -o, --out PATH       Output file, or `-` for stdout (default: stdout)
    -w, --width  N       Canvas width  in px (pt for pdf)   (default: 800)
    -h, --height N       Canvas height in px (pt for pdf)   (default: 600)
        --scale  N       Multiply raster size for hi-DPI PNG (default: 1)
        --background R,G,B,A   RGBA in 0..1 (default: 1,1,1,1 — opaque white)
        --help           Print this help
";

fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("veusz-render: {e}");
            ExitCode::FAILURE
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Format {
    Png,
    Svg,
    Pdf,
}

fn run() -> Result<(), String> {
    let mut args = std::env::args().skip(1).peekable();

    let mut input: Option<String> = None;
    let mut out: String = "-".into();
    let mut format: Option<Format> = None;
    let mut width: f64 = 800.0;
    let mut height: f64 = 600.0;
    let mut scale: f64 = 1.0;
    let mut background = (1.0f32, 1.0f32, 1.0f32, 1.0f32);

    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--help" => {
                print!("{USAGE}");
                return Ok(());
            }
            "-f" | "--format" => {
                format = Some(parse_format(&next(&mut args, &arg)?)?);
            }
            "-o" | "--out" => out = next(&mut args, &arg)?,
            "-w" | "--width" => width = parse_num(&next(&mut args, &arg)?, "--width")?,
            "--height" => height = parse_num(&next(&mut args, &arg)?, "--height")?,
            // `-h` is height here, not help (help is `--help`), matching the
            // Python render_poster convention.
            "-H" => height = parse_num(&next(&mut args, &arg)?, "--height")?,
            "--scale" => scale = parse_num(&next(&mut args, &arg)?, "--scale")?,
            "--background" => background = parse_background(&next(&mut args, &arg)?)?,
            other if other.starts_with('-') && other != "-" => {
                return Err(format!("unknown option {other:?} (try --help)"));
            }
            _ => {
                if input.is_some() {
                    return Err(format!("unexpected extra argument {arg:?}"));
                }
                input = Some(arg);
            }
        }
    }

    let input = input.ok_or("no input given (a scene-JSON file, or `-` for stdin)")?;

    // Format: explicit flag wins; else infer from the output extension; else PNG.
    let format = format.unwrap_or_else(|| infer_format(&out).unwrap_or(Format::Png));

    let scene_json = read_input(&input)?;
    let scene: Scene = serde_json::from_slice(&scene_json)
        .map_err(|e| format!("scene JSON decode failed: {e}"))?;

    let bytes: Vec<u8> = match format {
        Format::Png => {
            let w = (width * scale).round().max(1.0) as u32;
            let h = (height * scale).round().max(1.0) as u32;
            rasterise_png(&scene, w, h, background)?
        }
        Format::Svg => {
            render_scene_to_svg(&scene, width, height, background).into_bytes()
        }
        Format::Pdf => render_scene_to_pdf(&scene, width, height, background)?,
    };

    write_output(&out, &bytes)
}

/// Rasterise through the pure-Rust tiny-skia software backend — identical to
/// `_paint_ext::render_scene_to_png(... "tiny-skia")`.
fn rasterise_png(
    scene: &Scene,
    width: u32,
    height: u32,
    bg: (f32, f32, f32, f32),
) -> Result<Vec<u8>, String> {
    let mut painter = TinySkiaPainter::new(width, height)?;
    painter.clear(Color { r: bg.0, g: bg.1, b: bg.2, a: bg.3 });
    scene.replay(&mut painter);
    let mut out = Vec::with_capacity(4 * width as usize * height as usize);
    painter
        .write_png(&mut out)
        .map_err(|e| format!("PNG encode failed: {e}"))?;
    Ok(out)
}

fn next(
    args: &mut std::iter::Peekable<impl Iterator<Item = String>>,
    flag: &str,
) -> Result<String, String> {
    args.next().ok_or_else(|| format!("{flag} needs a value"))
}

fn parse_format(s: &str) -> Result<Format, String> {
    match s.to_ascii_lowercase().as_str() {
        "png" => Ok(Format::Png),
        "svg" => Ok(Format::Svg),
        "pdf" => Ok(Format::Pdf),
        other => Err(format!("unknown format {other:?} (expected png|svg|pdf)")),
    }
}

fn infer_format(out: &str) -> Option<Format> {
    let ext = out.rsplit('.').next()?.to_ascii_lowercase();
    match ext.as_str() {
        "png" => Some(Format::Png),
        "svg" => Some(Format::Svg),
        "pdf" => Some(Format::Pdf),
        _ => None,
    }
}

fn parse_num(s: &str, flag: &str) -> Result<f64, String> {
    s.parse::<f64>()
        .map_err(|_| format!("{flag} expects a number, got {s:?}"))
        .and_then(|v| {
            if v.is_finite() && v > 0.0 {
                Ok(v)
            } else {
                Err(format!("{flag} must be a positive finite number, got {s:?}"))
            }
        })
}

fn parse_background(s: &str) -> Result<(f32, f32, f32, f32), String> {
    let parts: Vec<&str> = s.split(',').collect();
    if parts.len() != 4 {
        return Err(format!(
            "--background expects R,G,B,A (four values in 0..1), got {s:?}"
        ));
    }
    let mut v = [0.0f32; 4];
    for (i, p) in parts.iter().enumerate() {
        v[i] = p
            .trim()
            .parse::<f32>()
            .map_err(|_| format!("--background component {:?} is not a number", p))?;
    }
    Ok((v[0], v[1], v[2], v[3]))
}

fn read_input(path: &str) -> Result<Vec<u8>, String> {
    if path == "-" {
        let mut buf = Vec::new();
        std::io::stdin()
            .read_to_end(&mut buf)
            .map_err(|e| format!("reading stdin: {e}"))?;
        Ok(buf)
    } else {
        std::fs::read(path).map_err(|e| format!("reading {path:?}: {e}"))
    }
}

fn write_output(path: &str, bytes: &[u8]) -> Result<(), String> {
    if path == "-" {
        std::io::stdout()
            .write_all(bytes)
            .map_err(|e| format!("writing stdout: {e}"))
    } else {
        std::fs::write(path, bytes).map_err(|e| format!("writing {path:?}: {e}"))
    }
}
