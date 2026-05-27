#!/usr/bin/env bash
# Build a self-contained `veuszd` sidecar bundle.
#
# Produces a directory tree under `veusz-tauri/sidecar/<triple>/` containing:
#
#   python/        — python-build-standalone interpreter
#   veuszd         — thin shell-script launcher that points at python/bin/python3
#                    and invokes `python -m veusz.daemon.cli`
#
# The Tauri shell points its `externalBin` slot at this directory once
# Phase-5 bundling is wired. Until then, the bundle is independently
# runnable for the Week-1 spike:
#
#     ./veusz-tauri/sidecar/x86_64-unknown-linux-gnu/veuszd \
#         --socket /tmp/bundled.sock --deterministic
#
# Risk #1 from the plan — the largest open question on the project —
# is "does python-build-standalone + Veusz + PyQt6 + the C-extension
# helpers package cleanly?" This script is the spike answer. It also
# exercises the same install path that macOS / Windows scripts will
# use (with different python-build-standalone tarballs).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIPLE="${TRIPLE:-x86_64-unknown-linux-gnu}"
OUT_DIR="$REPO_ROOT/veusz-tauri/sidecar/$TRIPLE"
PBS_TARBALL="${PBS_TARBALL:-}"           # explicit path overrides download
PBS_TAG="${PBS_TAG:-20260510}"
PBS_PYVER="${PBS_PYVER:-3.12.13}"

case "$TRIPLE" in
    x86_64-unknown-linux-gnu)   PBS_TRIPLE="x86_64-unknown-linux-gnu" ;;
    aarch64-unknown-linux-gnu)  PBS_TRIPLE="aarch64-unknown-linux-gnu" ;;
    x86_64-apple-darwin)        PBS_TRIPLE="x86_64-apple-darwin" ;;
    aarch64-apple-darwin)       PBS_TRIPLE="aarch64-apple-darwin" ;;
    x86_64-pc-windows-msvc)     PBS_TRIPLE="x86_64-pc-windows-msvc-shared" ;;
    *)                          echo "unknown TRIPLE: $TRIPLE" >&2; exit 2 ;;
esac

echo "→ Triple: $TRIPLE"
echo "→ python-build-standalone: $PBS_TAG / cpython-$PBS_PYVER"
echo "→ Output: $OUT_DIR"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# 1. Acquire python-build-standalone tarball
if [[ -z "$PBS_TARBALL" ]]; then
    PBS_TARBALL="/tmp/pbs-${PBS_TAG}-${PBS_TRIPLE}.tar.gz"
    if [[ ! -f "$PBS_TARBALL" ]]; then
        URL="https://github.com/astral-sh/python-build-standalone/releases/download/${PBS_TAG}/cpython-${PBS_PYVER}%2B${PBS_TAG}-${PBS_TRIPLE}-install_only.tar.gz"
        echo "→ Downloading $URL"
        curl -sLf "$URL" -o "$PBS_TARBALL"
    fi
fi

# 2. Unpack into the sidecar dir
echo "→ Unpacking interpreter"
tar -xzf "$PBS_TARBALL" -C "$OUT_DIR"
PY_EXE="$OUT_DIR/python/bin/python3"
[[ -x "$PY_EXE" ]] || { echo "no python3 in tarball"; exit 1; }

# 3. Install Veusz + runtime deps into the bundled site-packages.
#    --no-warn-script-location keeps output clean; --no-binary :none:
#    is *not* used because PyQt6 + numpy need wheels, and Veusz itself
#    needs to compile its C extensions in place from the local source.
echo "→ Installing dependencies"
"$PY_EXE" -m pip install --quiet --upgrade pip setuptools wheel
"$PY_EXE" -m pip install --quiet numpy "PyQt6>=6.5"
echo "→ Installing veusz (compiles helpers/qtloops.so against bundled PyQt6)"
"$PY_EXE" -m pip install --quiet "$REPO_ROOT"

# 4. Produce a launcher.
#    On Linux/macOS this is a shell script; Windows uses a .cmd shim
#    (handled by a sibling bundle-sidecar.ps1 — out of scope for the
#    Linux spike).
LAUNCHER="$OUT_DIR/veuszd"
cat > "$LAUNCHER" <<'EOF'
#!/usr/bin/env bash
# Self-contained veuszd launcher. Points at the bundled python and
# the bundled veusz package — never the caller's cwd or user
# site-packages.
#
# PYTHONSAFEPATH=1 (3.11+) keeps `-m` from prepending cwd to sys.path,
# which would otherwise let a sibling `veusz/` directory shadow the
# bundled one (this bit us in the Risk #1 spike).
# PYTHONNOUSERSITE=1 stops `~/.local/lib/...` from leaking in.
#
# Resolves through symlinks WITHOUT `readlink -f` (GNU-only) so the
# same launcher works on macOS / BSDs / Linux.
script="${BASH_SOURCE[0]}"
while [ -h "$script" ]; do
    here=$(cd "$(dirname "$script")" >/dev/null 2>&1 && pwd)
    script=$(readlink "$script")
    [[ "$script" != /* ]] && script="$here/$script"
done
HERE=$(cd "$(dirname "$script")" >/dev/null 2>&1 && pwd)
export PYTHONSAFEPATH=1
export PYTHONNOUSERSITE=1
exec "$HERE/python/bin/python3" -m veusz.daemon.cli "$@"
EOF
chmod +x "$LAUNCHER"

# 5. Sanity-check
echo "→ Sanity check"
"$LAUNCHER" --help >/dev/null
echo "→ Bundle ready: $(du -sh "$OUT_DIR" | cut -f1) at $OUT_DIR"
echo "   Launcher: $LAUNCHER"
