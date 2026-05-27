//! JSON-RPC client for the Veusz headless daemon (`veuszd`).
//!
//! Pure-Rust, Tauri-agnostic. The Tauri shell wraps this; CLI tools and
//! integration tests can use it directly. Speaks LSP-style
//! `Content-Length` framing over a Unix domain socket (or, on Windows,
//! a named pipe — `pipe` module gated by `cfg(windows)`, not yet
//! implemented).
//!
//! Concurrency model: one underlying connection, multiplexed by `id`.
//! Calls are matched to responses through a `HashMap<id, oneshot::Sender>`
//! managed by a single reader task. The Rust shell can fire many
//! concurrent `render.png` requests from different React panels
//! without head-of-line blocking on the socket.

mod framing;
mod sidecar;

#[cfg(unix)]
mod unix_transport;

pub use sidecar::Sidecar;

use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::io::AsyncWriteExt;
use tokio::sync::{broadcast, oneshot, Mutex};
use tokio::task::JoinHandle;

#[derive(Debug, Error)]
pub enum Error {
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
    #[error("framing: {0}")]
    Framing(#[from] framing::Error),
    #[error("daemon returned error {code}: {message}")]
    Rpc { code: i64, message: String },
    #[error("connection closed before reply")]
    Closed,
    #[error("json: {0}")]
    Json(#[from] serde_json::Error),
}

#[derive(Debug, Serialize)]
struct Request<'a> {
    jsonrpc: &'a str,
    id: u64,
    method: &'a str,
    params: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct Response {
    #[serde(default)]
    id: Option<serde_json::Value>,
    #[serde(default)]
    result: Option<serde_json::Value>,
    #[serde(default)]
    error: Option<RpcErrorBody>,
}

/// A notification pushed by the daemon (no `id`).
#[derive(Debug, Clone, Deserialize)]
pub struct Notification {
    pub method: String,
    #[serde(default)]
    pub params: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct RpcErrorBody {
    code: i64,
    message: String,
}

type Pending = Arc<Mutex<HashMap<u64, oneshot::Sender<Response>>>>;

/// JSON-RPC client over an already-connected stream. Clone freely;
/// every clone shares the underlying transport.
#[derive(Clone)]
pub struct Client {
    inner: Arc<ClientInner>,
}

struct ClientInner {
    writer: Mutex<tokio::io::WriteHalf<unix_transport::Stream>>,
    pending: Pending,
    notifications: broadcast::Sender<Notification>,
    next_id: AtomicU64,
    // Held so the reader task is cancelled when the last Client clone drops.
    _reader: JoinHandle<()>,
}

impl Client {
    /// Connect to a running daemon at the given UDS path.
    #[cfg(unix)]
    pub async fn connect(path: impl AsRef<std::path::Path>) -> Result<Self, Error> {
        let stream = unix_transport::connect(path.as_ref()).await?;
        let (reader, writer) = tokio::io::split(stream);
        // Wrap the reader in a single BufReader for the connection's
        // lifetime — the framer keeps buffered bytes across frame
        // boundaries, so a fresh BufReader per call would discard them.
        let buf_reader = tokio::io::BufReader::new(reader);
        let pending: Pending = Arc::new(Mutex::new(HashMap::new()));
        // 128 slots — enough that a slow subscriber doesn't drop common
        // bursts. Subscribers that lag past this see a Lagged error.
        let (notif_tx, _) = broadcast::channel::<Notification>(128);
        let reader_task = tokio::spawn(reader_loop(
            buf_reader,
            pending.clone(),
            notif_tx.clone(),
        ));
        Ok(Self {
            inner: Arc::new(ClientInner {
                writer: Mutex::new(writer),
                pending,
                notifications: notif_tx,
                next_id: AtomicU64::new(0),
                _reader: reader_task,
            }),
        })
    }

    /// Subscribe to push notifications from the daemon. Returns a
    /// `broadcast::Receiver`; each subscriber sees every notification.
    pub fn subscribe(&self) -> broadcast::Receiver<Notification> {
        self.inner.notifications.subscribe()
    }

    /// Issue an RPC. Returns the daemon's ``result`` field.
    pub async fn call<P: Serialize>(
        &self,
        method: &str,
        params: &P,
    ) -> Result<serde_json::Value, Error> {
        let id = self.inner.next_id.fetch_add(1, Ordering::Relaxed);
        let (tx, rx) = oneshot::channel();
        self.inner.pending.lock().await.insert(id, tx);
        let req = Request {
            jsonrpc: "2.0",
            id,
            method,
            params: serde_json::to_value(params)?,
        };
        let body = framing::encode(&req)?;
        {
            let mut w = self.inner.writer.lock().await;
            w.write_all(&body).await?;
            w.flush().await?;
        }
        let resp = rx.await.map_err(|_| {
            // The reader dropped the sender — either because the
            // daemon disconnected mid-flight or the reader task panicked.
            Error::Closed
        })?;
        if let Some(err) = resp.error {
            return Err(Error::Rpc {
                code: err.code,
                message: err.message,
            });
        }
        Ok(resp.result.unwrap_or(serde_json::Value::Null))
    }

    /// Convenience: call with named JSON object parameters.
    pub async fn call_obj(
        &self,
        method: &str,
        params: serde_json::Value,
    ) -> Result<serde_json::Value, Error> {
        self.call(method, &params).await
    }
}

async fn reader_loop(
    mut reader: tokio::io::BufReader<tokio::io::ReadHalf<unix_transport::Stream>>,
    pending: Pending,
    notifications: broadcast::Sender<Notification>,
) {
    loop {
        let msg = match framing::read(&mut reader).await {
            Ok(Some(v)) => v,
            Ok(None) => break,
            Err(e) => {
                tracing::warn!("framing read error: {e}");
                break;
            }
        };
        // First try notification (has `method`, no `id`); fall back to
        // response. Either may be present per JSON-RPC 2.0.
        if msg.get("id").is_none() {
            if let Ok(notif) = serde_json::from_value::<Notification>(msg) {
                let _ = notifications.send(notif);
            }
            continue;
        }
        let resp: Response = match serde_json::from_value(msg) {
            Ok(r) => r,
            Err(e) => {
                tracing::warn!("json decode error: {e}");
                continue;
            }
        };
        let id = match resp.id.as_ref().and_then(|v| v.as_u64()) {
            Some(id) => id,
            None => continue, // notification handled above
        };
        if let Some(tx) = pending.lock().await.remove(&id) {
            let _ = tx.send(resp);
        }
    }
    // Drain pending requests so callers don't hang forever.
    pending.lock().await.clear();
}
