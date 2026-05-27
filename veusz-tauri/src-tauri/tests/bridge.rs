//! Integration test: spawn a real `veuszd` *through the Bridge* (the
//! exact production code path the Tauri shell uses), drive a few RPCs
//! through it, and assert the wire format works end-to-end.
//!
//! Skips silently when `veuszd` isn't on PATH so a dev who builds the
//! Rust workspace without the Python side installed still sees green.

use serde_json::json;
use std::path::PathBuf;

fn veuszd_path() -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        let candidate = dir.join("veuszd");
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    None
}

/// Exercises `Bridge::spawn_with` — the same path the production
/// `Bridge::spawn(&handle)` lands on, just without needing a Tauri
/// runtime to be alive in the test process.
#[tokio::test]
async fn bridge_round_trips_through_real_daemon() {
    let Some(veuszd) = veuszd_path() else {
        eprintln!("skipping: veuszd not on PATH");
        return;
    };
    let tmpdir = tempfile::tempdir().unwrap();
    let sock = tmpdir.path().join("bridge.sock");
    let bridge = veusz_tauri_lib::ipc::Bridge::spawn_with(veuszd, sock)
        .await
        .expect("bridge spawn");

    let r = bridge.call("ping", json!({})).await.expect("ping");
    assert_eq!(r, json!({"pong": true}));

    let v = bridge.call("version", json!({})).await.expect("version");
    assert!(v.get("veusz").is_some());

    let types = bridge
        .call("doc.widget_types", json!({}))
        .await
        .expect("widget_types");
    let arr = types.as_array().expect("array");
    assert!(arr.iter().any(|t| t == "xy"));

    bridge.shutdown().await;
}

#[tokio::test]
async fn bridge_csv_to_render_endtoend() {
    let Some(veuszd) = veuszd_path() else {
        eprintln!("skipping: veuszd not on PATH");
        return;
    };
    let tmpdir = tempfile::tempdir().unwrap();
    let sock = tmpdir.path().join("bridge.sock");
    let csv = tmpdir.path().join("square.csv");
    std::fs::write(&csv, "x,y\n0,0\n1,1\n2,4\n3,9\n4,16\n").unwrap();

    let bridge = veusz_tauri_lib::ipc::Bridge::spawn_with(veuszd, sock).await.unwrap();
    bridge
        .call(
            "data.import",
            json!({"kind": "csv", "filename": csv.to_str().unwrap()}),
        )
        .await
        .unwrap();
    bridge
        .call("doc.add", json!({"parent": "/", "type": "page"}))
        .await
        .unwrap();
    bridge
        .call("doc.add", json!({"parent": "/page1", "type": "graph"}))
        .await
        .unwrap();
    bridge
        .call("doc.add", json!({"parent": "/page1/graph1", "type": "xy"}))
        .await
        .unwrap();
    bridge
        .call(
            "doc.set",
            json!({"ops": [
                {"path": "/page1/graph1/xy1/xData", "value": "x"},
                {"path": "/page1/graph1/xy1/yData", "value": "y"},
            ]}),
        )
        .await
        .unwrap();
    let r = bridge
        .call("render.png", json!({"page": 0, "w": 320, "h": 240}))
        .await
        .unwrap();
    assert!(r["png"].as_str().unwrap().len() > 100);
    assert!(r["bounds"].as_object().unwrap().contains_key("/page1/graph1/xy1"));

    bridge.shutdown().await;
}
