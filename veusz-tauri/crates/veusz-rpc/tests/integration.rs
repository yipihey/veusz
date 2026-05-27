//! Integration tests against a real `veuszd` subprocess.
//!
//! Skip silently if `veuszd` isn't on PATH — the daemon ships with the
//! veusz Python package, which won't always be installed in CI for the
//! Rust crate alone. Local devs running `cargo test` after
//! `pip install -e .` see green.

use serde_json::json;
use veusz_rpc::Sidecar;

fn veuszd_available() -> Option<std::path::PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        let candidate = dir.join("veuszd");
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    None
}

#[tokio::test]
async fn round_trip_ping_through_real_daemon() {
    let Some(veuszd) = veuszd_available() else {
        eprintln!("skipping: veuszd not on PATH");
        return;
    };
    let tmpdir = tempfile::tempdir().unwrap();
    let sock = tmpdir.path().join("veuszd.sock");
    let side = Sidecar::spawn(&veuszd, sock, true, false).await.unwrap();
    let r = side.client.call("ping", &json!({})).await.unwrap();
    assert_eq!(r, json!({"pong": true}));
    side.shutdown().await;
}

#[tokio::test]
async fn csv_to_render_endtoend() {
    let Some(veuszd) = veuszd_available() else {
        eprintln!("skipping: veuszd not on PATH");
        return;
    };
    let tmpdir = tempfile::tempdir().unwrap();
    let sock = tmpdir.path().join("veuszd.sock");
    let csv = tmpdir.path().join("square.csv");
    std::fs::write(&csv, "x,y\n0,0\n1,1\n2,4\n3,9\n4,16\n").unwrap();

    let side = Sidecar::spawn(&veuszd, sock, true, false).await.unwrap();
    let c = &side.client;

    c.call_obj("data.import", json!({"kind": "csv", "filename": csv.to_str().unwrap()}))
        .await
        .unwrap();
    c.call_obj("doc.add", json!({"parent": "/", "type": "page"})).await.unwrap();
    c.call_obj("doc.add", json!({"parent": "/page1", "type": "graph"})).await.unwrap();
    c.call_obj("doc.add", json!({"parent": "/page1/graph1", "type": "xy"})).await.unwrap();
    c.call_obj(
        "doc.set",
        json!({"ops": [
            {"path": "/page1/graph1/xy1/xData", "value": "x"},
            {"path": "/page1/graph1/xy1/yData", "value": "y"},
        ]}),
    )
    .await
    .unwrap();

    let r = c
        .call_obj("render.png", json!({"page": 0, "w": 320, "h": 240}))
        .await
        .unwrap();
    let png = r["png"].as_str().unwrap();
    assert!(!png.is_empty());
    let bounds = r["bounds"].as_object().unwrap();
    assert!(bounds.contains_key("/page1/graph1/xy1"));

    side.shutdown().await;
}

#[tokio::test]
async fn receives_doc_changed_notification_on_add() {
    let Some(veuszd) = veuszd_available() else {
        eprintln!("skipping: veuszd not on PATH");
        return;
    };
    let tmpdir = tempfile::tempdir().unwrap();
    let sock = tmpdir.path().join("veuszd.sock");
    let side = Sidecar::spawn(&veuszd, sock, true, false).await.unwrap();
    let mut rx = side.client.subscribe();
    side.client.call_obj("doc.add", json!({"parent": "/", "type": "page"}))
        .await
        .unwrap();
    let notif = tokio::time::timeout(std::time::Duration::from_secs(2), rx.recv())
        .await
        .expect("timeout waiting for notification")
        .expect("broadcast closed");
    assert_eq!(notif.method, "doc.changed");
    assert_eq!(notif.params["kind"], "add");
    assert_eq!(notif.params["paths"][0], "/page1");
    side.shutdown().await;
}

#[tokio::test]
async fn concurrent_calls_multiplex_correctly() {
    // The multiplexed reader-task design is the whole reason this
    // crate is more than a thin wrapper. Prove it.
    let Some(veuszd) = veuszd_available() else {
        eprintln!("skipping: veuszd not on PATH");
        return;
    };
    let tmpdir = tempfile::tempdir().unwrap();
    let sock = tmpdir.path().join("veuszd.sock");
    let side = Sidecar::spawn(&veuszd, sock, true, false).await.unwrap();
    let c = side.client.clone();

    let mut handles = Vec::new();
    for _ in 0..50 {
        let c = c.clone();
        handles.push(tokio::spawn(async move {
            c.call("ping", &json!({})).await
        }));
    }
    for h in handles {
        let r = h.await.unwrap().unwrap();
        assert_eq!(r, json!({"pong": true}));
    }
    side.shutdown().await;
}
