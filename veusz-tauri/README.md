# veusz-tauri

A Tauri 2 + React/TypeScript frontend for Veusz, backed by a
headless Python daemon (`veuszd`) speaking JSON-RPC 2.0 over a Unix
domain socket. Plan at
`/root/.claude/plans/yes-a-full-veusz-parallel-knuth.md`.

## Project layout

```
veusz/daemon/                  Python daemon (veuszd entrypoint)
  cli.py                       --socket / --deterministic / --log-json
  server.py                    asyncio JSON-RPC 2.0 server, UDS framing
  framing.py                   LSP-style Content-Length framer
  notifier.py                  doc.changed / data.changed push channel
  schema.py                    widget + path schema extractor
  context.py                   QApplication + Document + render cache
  errors.py                    RpcError + JSON-RPC error codes
  handlers/                    one file per namespace (data, doc, render,
                               hittest, state, eval, file, fit, prefs)

veusz-tauri/
  crates/veusz-rpc/            Standalone Tauri-agnostic JSON-RPC client
                               (broadcast notifications, sidecar lifecycle).
  src-tauri/                   Tauri 2 Rust shell — spawns veuszd, bridges
                               invoke() → RPC, forwards notifications to
                               the WebView as veusz://notification events.
  src/                         React/TS frontend
    rpc/                       Transport (tauri / mock / node) + typed Rpc
    state/doc.ts               Zustand store mirroring the daemon
    components/
      app/AppShell.tsx         Phase-1 viewer composition
      tree/                    Document tree sidebar
      inspector/               Schema-driven property editor
      plot/PlotCanvas.tsx      PNG canvas + selection overlay + pan/zoom
      data/DatasetPanel.tsx    Dataset listing + stats
      data/CsvImportWizard.tsx Live-preview CSV wizard
      stylesheet/              Stylesheet editor (reuses Inspector)
      fit/FitDialog.tsx        Curve-fitting dialog
      file/RecentFiles.tsx     Recent-files menu
      settings/                Setting → React component registry (43)

scripts/
  bundle-sidecar.sh            python-build-standalone + Veusz → sidecar
  slim-sidecar.sh              Strips unused PyQt6/Qt6 → -25% bundle
  test-bundled-daemon.sh       Runs the live-daemon suite against bundle

tests/daemon/                  pytest contract tests (vs. live daemon)
```

## Build & test

```bash
# Daemon
pip install -e .                              # builds veusz/helpers/*.so
pytest tests/daemon                           # 74 tests

# Frontend
cd veusz-tauri
pnpm install
pnpm tsc --noEmit                             # type-check
pnpm vitest run                               # 115 tests

# Rust workspace (standalone client + Tauri shell)
cargo test --manifest-path veusz-tauri/Cargo.toml --workspace \
  -- --test-threads=1                         # 11 tests
cargo build --manifest-path veusz-tauri/Cargo.toml --bin veusz-tauri

# Bundled sidecar (Phase 5)
bash scripts/bundle-sidecar.sh                # ~715 MB
bash scripts/slim-sidecar.sh                  # → ~523 MB
bash scripts/test-bundled-daemon.sh           # 9 tests against the bundle

# Real GUI (needs display server)
cd veusz-tauri && pnpm build && cargo tauri dev
```

## Architecture invariants

* **The daemon never owns UI state.** Tree, datasets, selection,
  filename — all live in the Zustand store on the frontend. The
  daemon is a stateless RPC surface over `veusz.document.Document`.
* **One `Transport` interface, three implementations.** Components
  and the store never import Tauri directly; the unit tests use
  `mockTransport`, the live-daemon e2e uses `clientTransport`
  (Node UDS), production uses `tauriTransport`. Same React tree
  runs in all three.
* **Schema first.** The property inspector reads `doc.schema(...)`
  from the daemon and looks each Setting up in the React registry.
  Adding a new Veusz Setting subclass to the daemon either reuses
  an existing typename (free) or fails the registry-coverage test
  until a leaf component is added.
* **Renders are coalesced.** The store debounces `requestRender`
  to ~30 Hz so a slider drag fires one render per 33 ms regardless
  of input rate.

## Test counts (live)

| Layer | Count | Notes |
|---|---|---|
| Daemon (pytest) | 74 | core, doc, data, render, hittest, file, fit, prefs, notifications, csv preview, schema golden, undo/redo, stylesheet, recent files, export |
| Frontend (vitest) | 115 | Setting registry (43 typenames, schema-driven test), Inspector, Tree, DatasetPanel, PlotCanvas (pan/zoom), CsvImportWizard, StylesheetEditor, FitDialog, RecentFiles, AppShell, DocStore, e2e against live daemon |
| Rust workspace | 11 | framing unit tests + veusz-rpc live-daemon integration + Bridge spawn integration |
| **Total** | **200** | 0 regressions on 67/68 Veusz selftests |

## Risks resolved

| Plan risk | Status | Notes |
|---|---|---|
| #1 Bundling fragility | ✓ Linux | python-build-standalone + slim script; 523 MB, full live tests pass against the bundle |
| #2 Schema drift | ✓ | Drift sentinels on both sides — daemon and React tests both fail when Veusz adds a new typename |
| #3 IPC throughput | ✓ | Measured p95 11–14 ms (dev install / slim bundle); 30 Hz client-side coalesce gives 33 ms budget headroom |

## Still open

* **macOS / Windows bundling** — `bundle-sidecar.sh` is TRIPLE-aware
  but only Linux is exercised. macOS needs `codesign --deep` on every
  dylib; Windows needs a `.ps1` launcher sibling + EV cert.
* **Real GUI run** — `cargo tauri dev` on a workstation with a display.
  The bridge, transport, store, and components all pass tests against
  a live daemon; only the WebView frame itself is unverified.
* **`capture` flow** — Phase 4's live data streaming. Less interesting
  without a window; deferred.
* **Native menus** — currently the AppShell toolbar; Phase 5 will
  promote File / Edit / View / Plot / Help to native menu items via
  `tauri::menu::Menu`.
