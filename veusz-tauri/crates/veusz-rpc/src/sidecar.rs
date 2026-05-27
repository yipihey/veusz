//! Spawn `veuszd` as a subprocess and connect to it.
//!
//! Sidecar lifecycle:
//!  - Allocate a temp UDS path.
//!  - `spawn veuszd --socket <path> [--deterministic] [--log-json]`.
//!  - Poll connect() until success or 5s deadline.
//!  - On drop: send `shutdown` RPC, then SIGTERM, then SIGKILL after 2s.

use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::Duration;

use tokio::process::{Child, Command};
use tokio::time::Instant;

use crate::{Client, Error};

pub struct Sidecar {
    socket_path: PathBuf,
    child: Option<Child>,
    pub client: Client,
}

impl Sidecar {
    /// Spawn `veuszd` and connect.
    pub async fn spawn(
        program: impl AsRef<Path>,
        socket_path: impl Into<PathBuf>,
        deterministic: bool,
        log_json: bool,
    ) -> Result<Self, Error> {
        let socket_path = socket_path.into();
        // Make sure stale socket doesn't break the bind.
        let _ = std::fs::remove_file(&socket_path);

        let mut cmd = Command::new(program.as_ref());
        cmd.arg("--socket").arg(&socket_path);
        if deterministic {
            cmd.arg("--deterministic");
        }
        if log_json {
            cmd.arg("--log-json");
        }
        cmd.stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::inherit())
            .kill_on_drop(true);

        let child = cmd.spawn()?;

        // Poll until the daemon's socket exists and accepts.
        let deadline = Instant::now() + Duration::from_secs(5);
        let client = loop {
            if Instant::now() > deadline {
                return Err(Error::Io(std::io::Error::new(
                    std::io::ErrorKind::TimedOut,
                    "veuszd did not open socket within 5s",
                )));
            }
            if socket_path.exists() {
                match Client::connect(&socket_path).await {
                    Ok(c) => break c,
                    Err(_) => {
                        tokio::time::sleep(Duration::from_millis(20)).await;
                        continue;
                    }
                }
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        };

        // Sanity-ping so callers know the daemon is healthy.
        client
            .call("ping", &serde_json::json!({}))
            .await
            .map_err(|e| match e {
                Error::Rpc { code, message } => Error::Rpc { code, message },
                other => other,
            })?;

        Ok(Self {
            socket_path,
            child: Some(child),
            client,
        })
    }

    /// Best-effort graceful shutdown.
    pub async fn shutdown(mut self) {
        // Ask politely first.
        let _ = self.client.call("shutdown", &serde_json::json!({})).await;
        if let Some(mut child) = self.child.take() {
            // Give it 2s to exit cleanly.
            let exited = tokio::time::timeout(Duration::from_secs(2), child.wait()).await;
            if exited.is_err() {
                let _ = child.kill().await;
            }
        }
        let _ = std::fs::remove_file(&self.socket_path);
    }
}

impl Drop for Sidecar {
    fn drop(&mut self) {
        // We can't await here; rely on kill_on_drop + socket cleanup.
        let _ = std::fs::remove_file(&self.socket_path);
    }
}
