//! Text layout + glyph-to-path conversion.
//!
//! Replaces the dashed-bounding-box placeholder in
//! `veusz-paint-tiny-skia` and `veusz-paint-pdf` with real glyph rendering.
//!
//! Pipeline
//! --------
//! 1. **Layout** with Parley: a `TextLayout` from `veusz-paint-core` gets
//!    turned into a `parley::Layout` containing positioned glyphs.
//! 2. **Outline extraction** with skrifa: each glyph ID is resolved to a
//!    [`veusz_paint_core::Path`] in font-design-space, then transformed
//!    into output-space coordinates by the layout-supplied glyph position.
//! 3. **Render** by replaying the resulting `(Path, Affine)` pairs against
//!    any [`veusz_paint_core::Painter`].
//!
//! Because everything reduces to paths, both tiny-skia (which rasterises
//! the paths) and pdf-writer (which emits them as PDF path operators) get
//! the same text rendering for free — no per-backend codepath, no glyph
//! rasterisation difference.
//!
//! What's not done in this first pass
//! ----------------------------------
//! * Font subsetting / embedding in PDF. Glyphs go in as paths, so the
//!   PDF is portable but bigger than ideal for long documents. Worth
//!   revisiting if file size becomes a concern.
//! * Vertical writing modes. Veusz uses horizontal text exclusively per
//!   the audit; revisit if a non-Latin / CJK widget needs it.
//! * Emoji, color fonts. Out of scope.

#![forbid(unsafe_code)]

use std::borrow::Cow;

use parley::{
    Alignment, FontContext, FontFamily, FontStyle, FontWeight, Layout, LayoutContext,
    PositionedLayoutItem, StyleProperty,
};
use skrifa::{
    instance::{LocationRef, Size},
    outline::{DrawSettings, OutlinePen},
    raw::FontRef,
    GlyphId, MetadataProvider,
};

use veusz_paint_core::{Affine, Color, Path, TextLayout, TextStyle};

// Parley's `Brush` trait requires `Default + Clone + PartialEq + Debug +
// 'static`. We don't actually use parley to propagate colours — we have
// them on our `TextStyle` already — so we parameterise its types with
// `()` and pull glyph colour from the `TextLayout` we passed in.
type Brush = ();

/// Globally-shared font + layout contexts. Parley's contexts cache shaped
/// runs and font metadata; we keep one of each per process and lock them
/// per call. Layout is fast enough that this is not a bottleneck.
pub struct TextEngine {
    font_cx: std::sync::Mutex<FontContext>,
    layout_cx: std::sync::Mutex<LayoutContext<Brush>>,
}

impl Default for TextEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl TextEngine {
    pub fn new() -> Self {
        // FontContext::new pulls system fonts via fontique when the
        // `system` feature is enabled (default). We rely on that to find
        // DejaVu / Noto / Arial on host systems; the wgpu/wasm target
        // will need a different bootstrap.
        Self {
            font_cx: std::sync::Mutex::new(FontContext::new()),
            layout_cx: std::sync::Mutex::new(LayoutContext::new()),
        }
    }

    /// Lay out `layout` and return a list of `(Path, Affine, Color)` triples
    /// representing every glyph, ready to feed to a [`Painter`]: for each
    /// triple, set the paint to a solid fill with `Color`, push the
    /// transform `Affine.translate(x, y)`, and fill `Path`. The pen
    /// adapter in tiny-skia / PDF does this directly.
    pub fn layout_to_glyph_paths(
        &self,
        layout: &TextLayout,
        baseline_xy: (f64, f64),
    ) -> Vec<GlyphInstance> {
        let style = &layout.style;
        let parley_layout = {
            let mut font_cx = self.font_cx.lock().unwrap();
            let mut layout_cx = self.layout_cx.lock().unwrap();
            build_layout(&mut font_cx, &mut layout_cx, &layout.text, style)
        };
        let mut out = Vec::new();
        let (origin_x, origin_y) = baseline_xy;

        for line in parley_layout.lines() {
            // baseline-relative y for this line
            let line_metrics = line.metrics();
            let baseline_y = line_metrics.baseline as f64;
            for item in line.items() {
                let glyph_run = match item {
                    PositionedLayoutItem::GlyphRun(g) => g,
                    _ => continue,
                };
                let run = glyph_run.run();
                let font = run.font();
                let font_size = run.font_size();
                // Open the font with skrifa for outline extraction.
                let font_ref = match FontRef::from_index(font.data.as_ref(), font.index) {
                    Ok(r) => r,
                    Err(_) => continue,
                };
                let outlines = font_ref.outline_glyphs();
                let scale_size = Size::new(font_size);

                let mut x_cursor = glyph_run.offset() as f64;
                for glyph in glyph_run.glyphs() {
                    let gx = origin_x + x_cursor + glyph.x as f64;
                    let gy = origin_y + baseline_y + glyph.y as f64;
                    let glyph_id = GlyphId::from(glyph.id);
                    if let Some(outline) = outlines.get(glyph_id) {
                        let mut pen = OutlineToPath::default();
                        let _ = outline.draw(
                            DrawSettings::unhinted(scale_size, LocationRef::default()),
                            &mut pen,
                        );
                        // Glyph outlines come out in font-em coords with y-up
                        // (PostScript convention). Flip y to our screen-y-down
                        // convention and translate to position.
                        let path = pen.finish();
                        out.push(GlyphInstance {
                            path,
                            position: Affine::translate(gx, gy),
                            color: style.color,
                        });
                    }
                    x_cursor += glyph.advance as f64;
                }
            }
        }
        out
    }

    /// Convenience: measured width + height of the laid-out text.
    pub fn measure(&self, layout: &TextLayout) -> (f64, f64) {
        let mut font_cx = self.font_cx.lock().unwrap();
        let mut layout_cx = self.layout_cx.lock().unwrap();
        let parley_layout = build_layout(&mut font_cx, &mut layout_cx,
                                          &layout.text, &layout.style);
        (parley_layout.width() as f64, parley_layout.height() as f64)
    }
}

fn build_layout(
    font_cx: &mut FontContext,
    layout_cx: &mut LayoutContext<Brush>,
    text: &str,
    style: &TextStyle,
) -> Layout<Brush> {
    let mut builder = layout_cx.ranged_builder(font_cx, text, 1.0, true);
    // CSS-style font-family fallback chain: try the requested family first,
    // fall back to sans-serif if it isn't installed. Veusz captures
    // family names like "Arial" via Qt's font system; "Arial" isn't on
    // every machine (e.g. headless Linux containers ship DejaVu Sans).
    // Without a fallback, parley returns the .notdef glyph for every
    // character and tick labels render as a single missing-glyph box.
    let family_chain = if style.family.eq_ignore_ascii_case("sans-serif")
        || style.family.eq_ignore_ascii_case("serif")
        || style.family.eq_ignore_ascii_case("monospace") {
        style.family.clone()
    } else {
        format!("{}, sans-serif", style.family)
    };
    builder.push_default(StyleProperty::FontFamily(FontFamily::Source(
        Cow::Owned(family_chain),
    )));
    builder.push_default(StyleProperty::FontSize(style.size_pt as f32));
    builder.push_default(StyleProperty::FontWeight(FontWeight::new(style.weight as f32)));
    builder.push_default(StyleProperty::FontStyle(if style.italic {
        FontStyle::Italic
    } else {
        FontStyle::Normal
    }));
    let mut layout = builder.build(text);
    // Single line, no wrapping. Veusz widgets pre-break text where they
    // want it — we don't try to wrap.
    layout.break_all_lines(None);
    layout.align(Alignment::Start, parley::AlignmentOptions::default());
    layout
}

/// One laid-out glyph: the outline as a [`Path`], the position to draw it
/// at, and the colour from the source [`TextStyle`].
#[derive(Clone, Debug)]
pub struct GlyphInstance {
    pub path: Path,
    pub position: Affine,
    pub color: Color,
}

/// Convenience helper: draw `layout` at `(x, y)` against any
/// [`Painter`], using `engine` for layout.
///
/// `(x, y)` is the **top-left** of the layout box, NOT the baseline. This
/// matches the convention the abstract `draw_text(layout, x, y)` uses in
/// [`veusz_paint_core::Painter`].
pub fn draw_text_into_painter<P: veusz_paint_core::Painter>(
    engine: &TextEngine,
    painter: &mut P,
    layout: &TextLayout,
    x: f64,
    y: f64,
) {
    use veusz_paint_core::{Fill, FillRule, Paint};

    let glyphs = engine.layout_to_glyph_paths(layout, (x, y));
    if glyphs.is_empty() {
        return;
    }
    // All glyphs in this run share a colour. Set paint once, then for each
    // glyph apply its position transform inside a save/restore.
    let paint = Paint {
        fill: Some(Fill::Solid(layout.style.color)),
        stroke: None,
        anti_alias: true,
    };
    painter.set_paint(&paint);
    for g in glyphs {
        painter.save();
        painter.concat_transform(g.position);
        painter.fill_path(&g.path, FillRule::NonZero);
        painter.restore();
    }
}

// ---------------------------------------------------------------------------
// OutlineToPath: skrifa's OutlinePen sink, accumulating into a Path
// ---------------------------------------------------------------------------

#[derive(Default)]
struct OutlineToPath {
    path: Path,
}

impl OutlineToPath {
    fn finish(self) -> Path { self.path }
}

impl OutlinePen for OutlineToPath {
    fn move_to(&mut self, x: f32, y: f32) {
        // Glyph y is up-positive (PostScript). Flip to screen y-down.
        self.path.move_to(x as f64, -y as f64);
    }
    fn line_to(&mut self, x: f32, y: f32) {
        self.path.line_to(x as f64, -y as f64);
    }
    fn quad_to(&mut self, cx: f32, cy: f32, x: f32, y: f32) {
        self.path.quad_to(cx as f64, -cy as f64, x as f64, -y as f64);
    }
    fn curve_to(&mut self, c1x: f32, c1y: f32, c2x: f32, c2y: f32, x: f32, y: f32) {
        self.path.cubic_to(
            c1x as f64, -c1y as f64,
            c2x as f64, -c2y as f64,
            x as f64, -y as f64,
        );
    }
    fn close(&mut self) {
        self.path.close();
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// Skip helper: when fontique can't find any system fonts (CI without
    /// fonts installed), parley returns an empty layout. We accept that
    /// gracefully rather than failing the test.
    fn require_fonts() -> bool {
        let engine = TextEngine::new();
        let style = TextStyle::default();
        let layout = TextLayout { text: "X".into(), style };
        let glyphs = engine.layout_to_glyph_paths(&layout, (0.0, 0.0));
        !glyphs.is_empty()
    }

    #[test]
    fn measure_returns_positive_dims_when_fonts_present() {
        if !require_fonts() {
            eprintln!("no fonts available; skipping");
            return;
        }
        let engine = TextEngine::new();
        let layout = TextLayout { text: "Hello".into(), style: TextStyle::default() };
        let (w, h) = engine.measure(&layout);
        assert!(w > 0.0, "width must be positive, got {w}");
        assert!(h > 0.0, "height must be positive, got {h}");
    }

    #[test]
    fn glyph_paths_have_outlines() {
        if !require_fonts() {
            eprintln!("no fonts available; skipping");
            return;
        }
        let engine = TextEngine::new();
        let layout = TextLayout {
            text: "ABCDE".into(),
            style: TextStyle { size_pt: 24.0, ..TextStyle::default() },
        };
        let glyphs = engine.layout_to_glyph_paths(&layout, (10.0, 30.0));
        assert!(glyphs.len() >= 5, "expected at least 5 glyphs for 'ABCDE'");
        for g in &glyphs {
            assert!(!g.path.verbs.is_empty(),
                    "every glyph must have a non-empty outline");
        }
        // Each glyph's position should be a translation with monotonically
        // increasing x.
        let xs: Vec<f64> = glyphs.iter().map(|g| g.position.e).collect();
        for w in xs.windows(2) {
            assert!(w[1] >= w[0],
                    "glyph x positions must increase: {} -> {}", w[0], w[1]);
        }
    }

    #[test]
    fn empty_string_yields_no_glyphs() {
        let engine = TextEngine::new();
        let layout = TextLayout { text: String::new(), style: TextStyle::default() };
        assert_eq!(engine.layout_to_glyph_paths(&layout, (0.0, 0.0)).len(), 0);
    }
}
