// Veusz Tauri shell entrypoint.
//
// Phase 1 scaffold. The full implementation:
//
//  1. Spawn `veuszd` as a sidecar with --socket=<temp UDS path>.
//  2. Health-probe with JSON-RPC `ping` until ready (5s deadline).
//  3. Expose an `rpc` Tauri command that forwards `{method, params}`
//     to the daemon and returns the result.
//  4. On window-all-closed, send `shutdown`, then SIGTERM, then SIGKILL.
//
// The IPC layer (framing + connection pool) lives in `ipc.rs`.
// The frontend talks to it via `invoke('rpc', { method, params })`.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    veusz_tauri_lib::run();
}
