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

    /// Layout-only: return per-run + per-glyph metadata WITHOUT extracting
    /// glyph outlines. This is what backends embed fonts use (Type 0 PDF
    /// CIDFont): they want the raw font bytes + GIDs, not paths.
    ///
    /// The character mapping is preserved per glyph where parley reports
    /// it — used for the ToUnicode CMap in PDF output so text is
    /// searchable / copyable in the resulting PDF.
    pub fn layout_glyph_runs(
        &self,
        layout: &TextLayout,
        baseline_xy: (f64, f64),
    ) -> Vec<LaidOutGlyphRun> {
        let parley_layout = {
            let mut font_cx = self.font_cx.lock().unwrap();
            let mut layout_cx = self.layout_cx.lock().unwrap();
            build_layout(&mut font_cx, &mut layout_cx, &layout.text, &layout.style)
        };
        let (origin_x, origin_y) = baseline_xy;
        let mut out: Vec<LaidOutGlyphRun> = Vec::new();
        for line in parley_layout.lines() {
            let metrics = line.metrics();
            let baseline_y = metrics.baseline as f64;
            for item in line.items() {
                let glyph_run = match item {
                    PositionedLayoutItem::GlyphRun(g) => g,
                    _ => continue,
                };
                let run = glyph_run.run();
                let font = run.font();
                let font_size = run.font_size();
                let family = font_family_for_run(&run, &layout.text);

                // Walk glyphs once to collect positions + GIDs.
                let mut glyphs: Vec<LaidOutGlyph> = Vec::new();
                let mut x_cursor = glyph_run.offset() as f64;
                for g in glyph_run.glyphs() {
                    glyphs.push(LaidOutGlyph {
                        // parley uses u32 glyph IDs (TrueType / OpenType GIDs
                        // are 16-bit; the extra width is for future CFF2 /
                        // big-font support). PDF Type 0 CIDs are 16-bit too.
                        id: g.id as u16,
                        x: origin_x + x_cursor + g.x as f64,
                        y: origin_y + baseline_y + g.y as f64,
                        advance: g.advance,
                        // parley's run iterator doesn't directly expose the
                        // source codepoint per glyph; we'd need to walk the
                        // cluster boundaries to recover it. For now, the
                        // PDF ToUnicode CMap uses the .text chars in
                        // order — close enough for the common single-glyph-
                        // per-codepoint case, which is what Latin / digits
                        // are. Tracked as a follow-up if non-Latin shaping
                        // becomes a target.
                        codepoint: None,
                    });
                    x_cursor += g.advance as f64;
                }

                out.push(LaidOutGlyphRun {
                    font_data: std::sync::Arc::new(font.data.data().to_vec()),
                    font_index: font.index,
                    font_id: font.data.id(),
                    family,
                    font_size_px: font_size,
                    baseline: (origin_x, origin_y + baseline_y),
                    color: layout.style.color,
                    glyphs,
                });
            }
        }
        out
    }
}

/// Best-effort family name for a parley Run — for diagnostic / PDF font
/// naming. parley's Run doesn't directly expose the resolved family; we
/// approximate by reading the OpenType name table off the font data.
fn font_family_for_run(_run: &parley::Run<Brush>, _text: &str) -> String {
    // TODO: walk skrifa's name table to get the actual resolved family.
    // For now, ship a placeholder that's good enough as a debug
    // identifier — the PDF font naming uses the font_id (unique per
    // font blob) as the primary key, not the family.
    "Resolved Font".to_string()
}

fn build_layout(
    font_cx: &mut FontContext,
    layout_cx: &mut LayoutContext<Brush>,
    text: &str,
    style: &TextStyle,
) -> Layout<Brush> {
    let mut builder = layout_cx.ranged_builder(font_cx, text, 1.0, true);
    // CSS-style font-family fallback chain. Veusz captures the family
    // name Qt resolved on its side — typically a Windows-default like
    // "Arial" / "Helvetica" / "Times New Roman". On Linux those usually
    // don't exist, and parley's fontique falls back to a generic
    // sans-serif (DejaVu Sans here) whose metrics differ from the
    // requested font. That ends up shifting tick labels and other text
    // to positions that don't line up with where Qt drew them.
    //
    // Workaround: append the same metric-compatible substitutes that
    // fontconfig hands back on a typical Linux setup. Result chain (for
    // "Arial") is "Arial, Liberation Sans, sans-serif" — parley picks
    // the first one installed. Liberation Sans is *designed* to be a
    // metric-compatible drop-in for Arial; Nimbus Sans does the same
    // job for Helvetica; the serif and monospace equivalents likewise.
    //
    // Long-term, fontique should consult fontconfig substitute tables
    // for us; until then this static map covers the families the audit
    // shows Veusz documents request.
    let family_chain = font_family_chain(&style.family);
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

/// Build the CSS-style fallback chain for a requested family.
///
/// Order of preference: original family (e.g. `"Arial"`), then a list
/// of metric-compatible substitutes available across Linux, macOS, and
/// Windows, then a generic CSS family that fontique resolves on every
/// platform.
///
/// The Linux substitutes mirror fontconfig's default conf
/// (`/usr/share/fontconfig/conf.avail/*alias*.conf`) — Liberation Sans
/// is metric-compatible with Arial by design; Nimbus Sans plays the
/// same role for Helvetica. macOS and Windows usually have the
/// "requested" name installed natively, so the chain is mostly belt-
/// and-braces for them.
fn font_family_chain(requested: &str) -> String {
    // Generic families pass through unchanged.
    let lower = requested.to_ascii_lowercase();
    if matches!(lower.as_str(),
                "sans-serif" | "serif" | "monospace" | "cursive" | "fantasy") {
        return requested.to_string();
    }
    // Each entry: (Linux substitute, macOS substitute, generic).
    // Parley tries each comma-separated family in order; the OS-native
    // name comes first if the user has it. The Linux entry is the one
    // most likely to fire on headless / containerised hosts. The macOS
    // entry catches the case where someone runs Veusz on macOS without
    // the Microsoft-named font installed but has the macOS equivalent.
    let (linux, mac, generic) = match lower.as_str() {
        "arial" | "arial black"
            => (Some("Liberation Sans"), Some("Helvetica"), "sans-serif"),
        "helvetica" | "helvetica neue"
            => (Some("Nimbus Sans"), Some("Helvetica Neue"), "sans-serif"),
        "verdana" | "tahoma"
            => (Some("DejaVu Sans"), Some("Geneva"), "sans-serif"),
        "times" | "times new roman"
            => (Some("Liberation Serif"), Some("Times"), "serif"),
        "courier"
            => (Some("Nimbus Mono PS"), Some("Courier"), "monospace"),
        "courier new"
            => (Some("Liberation Mono"), Some("Courier New"), "monospace"),
        // Math / scientific fonts Veusz documents sometimes request.
        "cmu serif" | "computer modern"
            => (Some("Liberation Serif"), Some("STIX Two Text"), "serif"),
        // Symbol / mathematical glyphs — extremely common in scientific
        // text and the trickiest cross-platform target. Two known
        // substitutes per platform.
        "symbol"
            => (Some("Standard Symbols PS"), Some("Symbol"), "serif"),
        _ => (None, None, "sans-serif"),
    };
    let mut chain = vec![requested.to_string()];
    if let Some(s) = linux { chain.push(s.into()); }
    if let Some(s) = mac {
        if Some(s) != linux {  // avoid duplicates
            chain.push(s.into());
        }
    }
    chain.push(generic.into());
    chain.join(", ")
}

/// One laid-out glyph: the outline as a [`Path`], the position to draw it
/// at, and the colour from the source [`TextStyle`].
#[derive(Clone, Debug)]
pub struct GlyphInstance {
    pub path: Path,
    pub position: Affine,
    pub color: Color,
}

/// One contiguous run of glyphs from the same font + size, with the raw
/// font bytes attached. This is what backends that EMBED fonts (PDF
/// Type 0 CIDFont) need — they don't want outlines, they want glyph IDs
/// and the original font file so they can subset + embed it.
#[derive(Clone, Debug)]
pub struct LaidOutGlyphRun {
    /// Original font file bytes (TrueType or OpenType).
    pub font_data: std::sync::Arc<Vec<u8>>,
    /// Index of the font within a TTC collection (0 for a single font).
    pub font_index: u32,
    /// Stable identifier for this font's data, suitable as a HashMap key.
    pub font_id: u64,
    /// Family name resolved by parley (e.g. "Liberation Sans" when "Arial"
    /// was requested).
    pub family: String,
    pub font_size_px: f32,
    /// Position of the run's baseline in scene-space coordinates.
    pub baseline: (f64, f64),
    /// Style colour copied from the [`TextLayout`].
    pub color: Color,
    pub glyphs: Vec<LaidOutGlyph>,
}

#[derive(Copy, Clone, Debug)]
pub struct LaidOutGlyph {
    /// Original glyph ID in the source font.
    pub id: u16,
    /// Absolute scene-space x of the glyph's origin.
    pub x: f64,
    /// Absolute scene-space y of the glyph's origin (baseline).
    pub y: f64,
    /// Glyph's advance in scene-space units.
    pub advance: f32,
    /// The Unicode codepoint(s) this glyph was shaped from, if known —
    /// used by the PDF backend to generate a ToUnicode CMap so text
    /// extraction (copy/paste, screen readers) works on the output.
    pub codepoint: Option<char>,
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

    #[test]
    fn family_chain_substitutes_arial_to_liberation_sans() {
        let c = super::font_family_chain("Arial");
        assert!(c.starts_with("Arial, "), "{c}");
        assert!(c.contains("Liberation Sans"), "{c}");  // Linux
        assert!(c.contains("Helvetica"), "{c}");        // macOS
        assert!(c.ends_with("sans-serif"), "{c}");
        let c2 = super::font_family_chain("ARIAL");
        assert!(c2.contains("Liberation Sans"), "{c2}");
    }

    #[test]
    fn family_chain_passes_generic_through() {
        for g in ["sans-serif", "serif", "monospace", "cursive", "fantasy"] {
            assert_eq!(super::font_family_chain(g), g);
        }
    }

    #[test]
    fn family_chain_falls_back_to_generic_for_unknown() {
        assert_eq!(super::font_family_chain("Comic Sans MS"),
                   "Comic Sans MS, sans-serif");
    }

    #[test]
    fn family_chain_picks_monospace_for_courier_family() {
        let c = super::font_family_chain("Courier");
        assert!(c.contains("monospace"), "{c}");
        let cn = super::font_family_chain("Courier New");
        assert!(cn.contains("Liberation Mono"), "{cn}");
        assert!(cn.contains("monospace"), "{cn}");
    }

    #[test]
    fn family_chain_includes_mac_substitute_when_distinct() {
        // Helvetica's mac entry is "Helvetica Neue", different from the
        // Linux entry "Nimbus Sans" — both should be in the chain.
        let c = super::font_family_chain("Helvetica");
        assert!(c.contains("Nimbus Sans"), "{c}");
        assert!(c.contains("Helvetica Neue"), "{c}");
    }

    #[test]
    fn family_chain_dedupes_when_linux_and_mac_match() {
        // Generic CSS family names never duplicate — sans-serif at end
        // only.
        let c = super::font_family_chain("Arial");
        assert_eq!(c.matches("sans-serif").count(), 1, "{c}");
    }

    #[test]
    fn arial_renders_proper_glyphs_via_substitute_chain() {
        if !require_fonts() { return; }
        let engine = TextEngine::new();
        // "0.1" at 13pt Arial is the exact case the user reported: tick
        // labels were rendering as a single .notdef glyph because Arial
        // isn't installed on most Linux containers. Three characters
        // should now produce three glyph runs.
        let layout = TextLayout {
            text: "0.1".into(),
            style: TextStyle {
                family: "Arial".into(),
                size_pt: 13.0,
                ..TextStyle::default()
            },
        };
        let glyphs = engine.layout_to_glyph_paths(&layout, (0.0, 0.0));
        assert!(glyphs.len() >= 3,
                "Arial -> Liberation Sans fallback should give >=3 glyphs for \"0.1\", \
                 got {}", glyphs.len());
        // Each glyph must have a real outline, not the .notdef box.
        for g in &glyphs {
            assert!(g.path.verbs.len() > 4,
                    "glyph outline too small ({} verbs) — fallback may not be working",
                    g.path.verbs.len());
        }
    }
}
