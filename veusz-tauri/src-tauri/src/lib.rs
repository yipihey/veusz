// Tauri shell library — split out so unit tests can target it without
// linking the binary entrypoint.

pub mod clipboard;
pub mod ipc;

use tauri::{generate_handler, Manager, RunEvent};

#[tauri::command]
async fn rpc(
    method: String,
    params: serde_json::Value,
    state: tauri::State<'_, ipc::Bridge>,
) -> Result<serde_json::Value, String> {
    state.call(&method, params).await.map_err(|e| e.to_string())
}

pub fn run() {
    tracing_subscriber::fmt().json().init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Spawn veuszd sidecar with a fresh UDS path. The bridge
            // owns the connection lifecycle and tears down on app exit.
            let bridge = ipc::Bridge::spawn(&app.handle())?;
            // Pump daemon-side notifications into Tauri events so the
            // frontend's `tauriTransport().subscribe(...)` listeners
            // actually fire.
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let state = handle.state::<ipc::Bridge>();
                if let Err(e) = state.forward_notifications_to(handle.clone()).await {
                    tracing::error!("notification forwarder failed: {e}");
                }
            });
            app.manage(bridge);
            Ok(())
        })
        .invoke_handler(generate_handler![
            rpc,
            clipboard::clipboard_write_mime,
            clipboard::clipboard_write_image_png,
            clipboard::clipboard_read_mime,
            clipboard::clipboard_has_mime,
        ])
        .build(tauri::generate_context!())
        .expect("Tauri app failed to build")
        .run(|app, event| {
            // Graceful daemon shutdown on app exit. Without this the
            // OS reaps veuszd, which works but leaves the UDS file
            // and skips the daemon's tidy-up logging.
            if let RunEvent::Exit = event {
                let bridge = app.state::<ipc::Bridge>();
                tauri::async_runtime::block_on(bridge.shutdown());
            }
        });
}
