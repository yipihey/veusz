use veusz_paint_text::TextEngine;
use veusz_paint_core::{TextLayout, TextStyle, Color};

fn main() {
    let engine = TextEngine::new();
    // Test "0.1" at Arial size 13 (what spectrum.vsz captures)
    let layout = TextLayout {
        text: "0.1".into(),
        style: TextStyle {
            size_pt: 13.0,
            family: "Arial".into(),  // what's actually captured
            weight: 400, italic: false,
            color: Color::BLACK,
        },
    };
    let glyphs = engine.layout_to_glyph_paths(&layout, (37.0, 521.2));
    println!("Glyphs for \"0.1\" Arial size 13: {} glyphs", glyphs.len());
    for (i, g) in glyphs.iter().enumerate() {
        let n_verbs = g.path.verbs.len();
        println!("  glyph #{i} at ({:.1},{:.1}): {n_verbs} verbs",
                 g.position.e, g.position.f);
    }
    // Also try sans-serif
    let layout2 = TextLayout {
        text: "0.1".into(),
        style: TextStyle {
            size_pt: 13.0, family: "sans-serif".into(),
            weight: 400, italic: false, color: Color::BLACK,
        },
    };
    let glyphs = engine.layout_to_glyph_paths(&layout2, (37.0, 521.2));
    println!("Glyphs for \"0.1\" sans-serif size 13: {} glyphs", glyphs.len());
    for (i, g) in glyphs.iter().enumerate() {
        println!("  glyph #{i} at ({:.1},{:.1}): {} verbs",
                 g.position.e, g.position.f, g.path.verbs.len());
    }
}
