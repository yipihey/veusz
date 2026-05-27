//! JSON-RPC bridge between the Tauri shell and the veuszd sidecar.
//!
//! Delegates the wire-level work to the `veusz-rpc` crate (kept
//! Tauri-agnostic so its `cargo test` runs without webview deps).
//! This file is the Tauri-specific glue: spawn the sidecar at app
//! startup, hold the client handle in Tauri state, and surface
//! `Bridge::call` to the `#[tauri::command] rpc` handler.

use std::path::PathBuf;

use thiserror::Error;
use tokio::sync::Mutex;

#[derive(Debug, Error)]
pub enum BridgeError {
    #[error("daemon not running")]
    NotRunning,
    #[error("rpc error: {0}")]
    Rpc(String),
}

impl From<veusz_rpc::Error> for BridgeError {
    fn from(e: veusz_rpc::Error) -> Self {
        BridgeError::Rpc(e.to_string())
    }
}

/// Shared bridge state. One per Tauri app.
pub struct Bridge {
    sidecar: Mutex<Option<veusz_rpc::Sidecar>>,
}

impl Bridge {
    /// Production spawn — blocks on the underlying async helper from
    /// the Tauri setup hook (which is sync). The `AppHandle` is
    /// retained for later (data-dir lookup, etc.) even though we
    /// don't use it yet.
    pub fn spawn<R: tauri::Runtime>(_handle: &tauri::AppHandle<R>) -> Result<Self, BridgeError> {
        tauri::async_runtime::block_on(Self::spawn_with(
            default_veuszd_path(),
            default_socket_path(),
        ))
    }

    /// Spawn with explicit program + socket path. Async so test code
    /// running inside its own tokio runtime can `.await` it directly
    /// (production wraps this in `block_on` from the Tauri setup hook).
    pub async fn spawn_with(program: PathBuf, socket: PathBuf) -> Result<Self, BridgeError> {
        let sidecar = veusz_rpc::Sidecar::spawn(&program, &socket, true, true).await?;
        Ok(Self {
            sidecar: Mutex::new(Some(sidecar)),
        })
    }

    pub async fn call(
        &self,
        method: &str,
        params: serde_json::Value,
    ) -> Result<serde_json::Value, BridgeError> {
        let guard = self.sidecar.lock().await;
        let side = guard.as_ref().ok_or(BridgeError::NotRunning)?;
        Ok(side.client.call_obj(method, params).await?)
    }

    pub async fn shutdown(&self) {
        let mut guard = self.sidecar.lock().await;
        if let Some(s) = guard.take() {
            s.shutdown().await;
        }
    }
}

fn default_socket_path() -> PathBuf {
    std::env::temp_dir().join(format!("veuszd-{}.sock", std::process::id()))
}

fn default_veuszd_path() -> PathBuf {
    // Bundled sidecar lives next to the app binary on every OS once
    // `tauri.conf.json::bundle.externalBin` is wired (Phase 5).
    // During `tauri dev` we fall back to `veuszd` on PATH (the
    // dev-installed Python venv).
    PathBuf::from("veuszd")
}
