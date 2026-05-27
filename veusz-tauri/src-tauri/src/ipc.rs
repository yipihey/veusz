// JSON-RPC bridge between the Tauri shell and the veuszd sidecar.
//
// Phase-1 scaffold. The full implementation:
//
// * Spawn `veuszd --socket <tempdir>/veuszd-<pid>.sock` as a sidecar.
// * Health-probe with `ping` (5s deadline; surface a recoverable error
//   to the WebView on timeout so the user gets a "Reload" prompt).
// * Multiplex requests on a single UDS connection using
//   Content-Length framing (mirrors `veusz/daemon/framing.py`).
// * On shutdown: send `shutdown`, then SIGTERM, then SIGKILL after 2s.
//
// On Windows, swap `UnixStream` for `NamedPipe`. Same wire format.

use std::sync::Arc;

use serde::Serialize;
use thiserror::Error;
use tokio::sync::Mutex;

#[derive(Debug, Error)]
pub enum BridgeError {
    #[error("daemon not running")]
    NotRunning,
    #[error("rpc error: {0}")]
    Rpc(String),
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Serialize)]
struct _Request<'a> {
    jsonrpc: &'a str,
    id: u64,
    method: &'a str,
    params: serde_json::Value,
}

/// Shared bridge state. Currently a placeholder — connection management
/// lands when the sidecar lifecycle is implemented.
pub struct Bridge {
    _inner: Arc<Mutex<()>>,
}

impl Bridge {
    pub fn spawn(_handle: &tauri::AppHandle) -> Result<Self, BridgeError> {
        // TODO: spawn the veuszd sidecar via tauri-plugin-shell,
        // discover its socket path, open a UnixStream/NamedPipe, and
        // run a multiplexing reader loop.
        Ok(Self {
            _inner: Arc::new(Mutex::new(())),
        })
    }

    pub async fn call(
        &self,
        _method: &str,
        _params: serde_json::Value,
    ) -> Result<serde_json::Value, BridgeError> {
        Err(BridgeError::NotRunning)
    }
}
