//! OS clipboard commands backed by NSPasteboard (macOS).
//!
//! The legacy Qt Veusz copies widgets and datasets onto the system
//! clipboard under custom MIME types (`text/x-vnd.veusz-widget-3`,
//! `text/x-vnd.veusz-data-1`). The off-the-shelf
//! `tauri-plugin-clipboard-manager` only handles text / HTML / image,
//! so it can't touch those slots. We go straight to NSPasteboard and
//! read/write arbitrary pasteboard types by name.
//!
//! These are plain `#[tauri::command]`s (not plugin commands), so they
//! need no capability/ACL grant — the same reason the existing
//! `invoke('rpc')` works without a capabilities file. They're also
//! exercised by a native `cargo test` round-trip, so the read/write
//! path is verified without a running WebView.
//!
//! Cross-app interop with the legacy Qt app is best-effort: we write
//! the bytes under the literal MIME-type string. Whether Qt round-trips
//! them depends on Qt's own MIME→UTI pasteboard mapping, which isn't a
//! documented contract — but within this app (and across app restarts
//! / multiple windows) the round-trip is exact.

use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine as _;

// Standard pasteboard type for PNG image data (NSPasteboardTypePNG).
// Writing under this lets any app (Preview, Notes, …) paste the plot.
const PNG_PASTEBOARD_TYPE: &str = "public.png";

#[cfg(target_os = "macos")]
mod imp {
    use objc2_app_kit::NSPasteboard;
    use objc2_foundation::{NSData, NSString};

    fn pasteboard() -> objc2::rc::Retained<NSPasteboard> {
        // NSPasteboard is documented thread-safe; generalPasteboard
        // takes no MainThreadMarker, so this is callable from a Tauri
        // command worker thread.
        NSPasteboard::generalPasteboard()
    }

    /// Replace the clipboard contents with `bytes` under every type in
    /// `types`. Returns true if all writes succeeded.
    pub fn write(types: &[&str], bytes: &[u8]) -> bool {
        let pb = pasteboard();
        pb.clearContents();
        let data = NSData::with_bytes(bytes);
        let mut ok = true;
        for t in types {
            let ty = NSString::from_str(t);
            ok &= pb.setData_forType(Some(&data), &ty);
        }
        ok
    }

    pub fn read(mime: &str) -> Option<Vec<u8>> {
        let pb = pasteboard();
        let ty = NSString::from_str(mime);
        pb.dataForType(&ty).map(|d| d.to_vec())
    }

    pub fn has(mime: &str) -> bool {
        read(mime).is_some()
    }
}

#[cfg(not(target_os = "macos"))]
mod imp {
    // Non-macOS: no native clipboard yet. The frontend detects the
    // unsupported result and falls back to its in-memory backend.
    pub fn write(_types: &[&str], _bytes: &[u8]) -> bool {
        false
    }
    pub fn read(_mime: &str) -> Option<Vec<u8>> {
        None
    }
    pub fn has(_mime: &str) -> bool {
        false
    }
}

fn decode(b64: &str) -> Result<Vec<u8>, String> {
    B64.decode(b64.as_bytes()).map_err(|e| e.to_string())
}

/// Write raw bytes to the clipboard under a single MIME type.
#[tauri::command]
pub fn clipboard_write_mime(mime: String, b64: String) -> Result<bool, String> {
    let bytes = decode(&b64)?;
    Ok(imp::write(&[&mime], &bytes))
}

/// Write a PNG to the clipboard under the standard image type (so other
/// apps can paste it) plus `image/png` for symmetry.
#[tauri::command]
pub fn clipboard_write_image_png(b64: String) -> Result<bool, String> {
    let bytes = decode(&b64)?;
    Ok(imp::write(&[PNG_PASTEBOARD_TYPE, "image/png"], &bytes))
}

/// Read clipboard bytes for a MIME type, returned base64-encoded, or
/// null if the clipboard holds no data of that type.
#[tauri::command]
pub fn clipboard_read_mime(mime: String) -> Option<String> {
    imp::read(&mime).map(|b| B64.encode(b))
}

/// Whether the clipboard currently holds data of the given MIME type.
#[tauri::command]
pub fn clipboard_has_mime(mime: String) -> bool {
    imp::has(&mime)
}

/// Exposed for the integration test (and any future Rust caller).
#[cfg(target_os = "macos")]
pub mod testing {
    pub fn write(types: &[&str], bytes: &[u8]) -> bool {
        super::imp::write(types, bytes)
    }
    pub fn read(mime: &str) -> Option<Vec<u8>> {
        super::imp::read(mime)
    }
}
