# veusz-tauri

Tauri 2 + React/TypeScript frontend for Veusz.

This directory is a stub. The full architecture and phasing are in
`/root/.claude/plans/yes-a-full-veusz-parallel-knuth.md`.

## What's here

* `src-tauri/` — Rust shell. Spawns the `veuszd` sidecar over a Unix
  domain socket (named pipe on Windows) and forwards JSON-RPC traffic
  from the WebView. Currently a manifest stub.
* `src/` — React/TS frontend. `src/rpc/` is the typed JSON-RPC client
  generated against the daemon's schema. `src/components/settings/` is
  the Setting → component registry (one leaf per Veusz Setting
  typename) — the architectural bet that makes the property inspector
  data-driven.
* `package.json`, `vite.config.ts`, `tsconfig.json` — frontend build.

## Status

| Phase | Done | Notes |
|---|---|---|
| Daemon | ✅ | See `veusz/daemon/` and `tests/daemon/`. JSON-RPC over UDS, schema extractor, render-to-PNG, hit-test, snapshot/restore. |
| Tauri Rust shell | stub | `src-tauri/` manifest only. Implement `bridge.rs` to forward `invoke()` → daemon RPC and back. |
| React frontend | stub | `src/main.tsx` boots an empty app. Inspector registry empty until P2. |
| Bundling / signing | not started | Phase 5. |

## How to run the daemon today

The daemon ships with the Veusz package and is callable as
`veuszd --socket /tmp/veuszd.sock`. See `veusz/daemon/cli.py` for the
flags and `tests/daemon/` for usage examples.

## Setting registry — typename coverage

The plan's registry covers the **43 typenames** the daemon emits today.
The drift sentinel at `tests/daemon/test_schema_golden.py::test_schema_known_setting_types_covered`
fails CI the moment Veusz introduces a new typename, so the registry
never silently lags.
