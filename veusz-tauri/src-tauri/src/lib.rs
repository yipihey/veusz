// Tauri shell library — split out so unit tests can target it without
// linking the binary entrypoint.

mod ipc;

use tauri::{Manager, generate_handler};

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
            app.manage(bridge);
            Ok(())
        })
        .invoke_handler(generate_handler![rpc])
        .run(tauri::generate_context!())
        .expect("Tauri app failed to start");
}
