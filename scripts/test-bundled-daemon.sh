#!/usr/bin/env bash
# Drive the live-daemon test suites against the BUNDLED veuszd
# (as opposed to the dev-installed one on PATH).
#
# Risk-#1 verification: proves a freshly-built sidecar bundle is
# functionally equivalent to a dev install, end-to-end.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIPLE="${TRIPLE:-x86_64-unknown-linux-gnu}"
BUNDLE="$REPO_ROOT/veusz-tauri/sidecar/$TRIPLE"
LAUNCHER="$BUNDLE/veuszd"

if [[ ! -x "$LAUNCHER" ]]; then
    echo "no bundle at $LAUNCHER — run scripts/bundle-sidecar.sh first" >&2
    exit 2
fi

# Put the bundled launcher first on PATH so all live-daemon tests
# (Rust bridge + Node e2e) pick it up. Verify shadowing.
export PATH="$BUNDLE:$PATH"
WHICH_VEUSZD="$(command -v veuszd)"
if [[ "$WHICH_VEUSZD" != "$LAUNCHER" ]]; then
    echo "shadow failed: PATH veuszd is $WHICH_VEUSZD, expected $LAUNCHER" >&2
    exit 3
fi
echo "→ Driving tests against $LAUNCHER"

# Quick smoke
"$LAUNCHER" --help >/dev/null
echo "→ --help OK"

# Bridge integration test (real veuszd, real RPC)
echo "→ Rust: bridge integration"
QT_QPA_PLATFORM=offscreen \
  cargo test --manifest-path "$REPO_ROOT/veusz-tauri/Cargo.toml" \
    -p veusz-tauri --test bridge -- --test-threads=1

# Standalone rpc-crate live daemon test (also picks up PATH veuszd)
echo "→ Rust: veusz-rpc live daemon"
QT_QPA_PLATFORM=offscreen \
  cargo test --manifest-path "$REPO_ROOT/veusz-tauri/Cargo.toml" \
    -p veusz-rpc --test integration -- --test-threads=1

# Node-side e2e through the AppShell
echo "→ Node: AppShell e2e"
cd "$REPO_ROOT/veusz-tauri"
pnpm vitest run src/test/e2e-real-daemon.test.tsx

echo "→ All bundle tests passed."
