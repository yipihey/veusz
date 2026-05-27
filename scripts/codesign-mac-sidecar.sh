#!/usr/bin/env bash
# Codesign a bundled veuszd sidecar so it passes macOS Gatekeeper.
#
# Usage:
#     IDENTITY="Developer ID Application: <Name> (TEAMID)" \
#         scripts/codesign-mac-sidecar.sh
#
# Bundle layout signed (deepest first — Apple's signing graph is acyclic):
#     sidecar/<triple>/python/lib/.../*.so      Python C extensions
#     sidecar/<triple>/python/lib/.../*.dylib   Qt + Python core libs
#     sidecar/<triple>/python/bin/python3       interpreter binary
#     sidecar/<triple>/veuszd                   shell launcher
#
# Every binary gets the Hardened Runtime entitlements at
# src-tauri/Entitlements.plist — necessary because:
#   - The bundled Python interpreter loads many .so files at runtime
#     (PyQt6, veusz/helpers/*.so), which fail under library validation
#     unless we disable it.
#   - V8 inside WebKit needs allow-jit + allow-unsigned-executable-memory.
#
# After signing, run `notarize-mac-sidecar.sh` (or notarytool directly)
# to submit to Apple's notarization service.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIPLE="${TRIPLE:-$(uname -m)-apple-darwin}"
# Normalize Apple Silicon arch name
[[ "$TRIPLE" == "arm64-apple-darwin" ]] && TRIPLE="aarch64-apple-darwin"
BUNDLE="$REPO_ROOT/veusz-tauri/sidecar/$TRIPLE"
ENTITLEMENTS="$REPO_ROOT/veusz-tauri/src-tauri/Entitlements.plist"

if [[ -z "${IDENTITY:-}" ]]; then
    echo "Set IDENTITY to your 'Developer ID Application' signing cert," >&2
    echo "e.g. IDENTITY='Developer ID Application: Tom Abel (XXXXXXXXXX)'" >&2
    echo "Find yours with:  security find-identity -v -p codesigning" >&2
    exit 2
fi
[[ -d "$BUNDLE" ]] || { echo "no bundle at $BUNDLE" >&2; exit 2; }
[[ -f "$ENTITLEMENTS" ]] || { echo "missing $ENTITLEMENTS" >&2; exit 2; }

SIGN_OPTS=(
    --force
    --options runtime
    --timestamp
    --entitlements "$ENTITLEMENTS"
    --sign "$IDENTITY"
)

count=0
sign_one() {
    /usr/bin/codesign "${SIGN_OPTS[@]}" "$1"
    count=$((count + 1))
}

echo "→ Signing C extensions (.so)"
while IFS= read -r f; do
    sign_one "$f"
done < <(find "$BUNDLE/python" -name "*.so" -type f)

echo "→ Signing dynamic libraries (.dylib)"
while IFS= read -r f; do
    sign_one "$f"
done < <(find "$BUNDLE/python" -name "*.dylib" -type f)

echo "→ Signing Mach-O frameworks"
while IFS= read -r f; do
    sign_one "$f"
done < <(find "$BUNDLE/python" -name "*.framework" -type d)

echo "→ Signing Python interpreter"
sign_one "$BUNDLE/python/bin/python3"
# python3 is usually a symlink to python3.X; sign the target too.
target=$(readlink "$BUNDLE/python/bin/python3" 2>/dev/null || true)
if [[ -n "$target" && -f "$BUNDLE/python/bin/$target" ]]; then
    sign_one "$BUNDLE/python/bin/$target"
fi

echo "→ Signing launcher"
sign_one "$BUNDLE/veuszd"

echo "→ Signed $count files."
echo "→ Verifying"
/usr/bin/codesign --verify --deep --strict --verbose=2 "$BUNDLE/veuszd"
/usr/bin/codesign --verify --deep --strict --verbose=2 "$BUNDLE/python/bin/python3"
echo "→ Done. Run scripts/notarize-mac-sidecar.sh next."
