//! NSPasteboard round-trip: write bytes under a custom MIME type and a
//! PNG type, read them back, assert byte-identical. Verifies the
//! clipboard read/write path natively, without a WebView.
//!
//! macOS-only — on other platforms the native backend is a no-op and
//! the frontend falls back to its in-memory clipboard.

#![cfg(target_os = "macos")]

use veusz_tauri_lib::clipboard::testing;

#[test]
fn custom_mime_round_trips() {
    let mime = "text/x-vnd.veusz-widget-3";
    let payload = b"1\nxy\n'xy1'\n'/page1/graph1/xy1'\n0\n";
    assert!(testing::write(&[mime], payload), "write should succeed");
    let got = testing::read(mime).expect("data present for the written type");
    assert_eq!(got, payload, "round-tripped bytes must be identical");
}

#[test]
fn png_round_trips_under_public_png() {
    // A minimal PNG signature is enough to prove the bytes survive.
    let png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR";
    assert!(testing::write(&["public.png", "image/png"], png));
    assert_eq!(testing::read("public.png").as_deref(), Some(&png[..]));
    assert_eq!(testing::read("image/png").as_deref(), Some(&png[..]));
}

#[test]
fn read_absent_type_is_none() {
    // Write one type, then read a different, unwritten one.
    testing::write(&["application/x-veusz-test-marker"], b"x");
    assert!(testing::read("application/x-definitely-not-present").is_none());
}
