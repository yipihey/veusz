#!/usr/bin/env bash
# Submit a signed veuszd sidecar bundle to Apple's notarization service.
#
# Prereqs:
#   - scripts/codesign-mac-sidecar.sh has been run successfully.
#   - You have an App-Specific Password for notarytool stored in the
#     keychain under the profile name "VEUSZ_NOTARY" (or override
#     PROFILE below). One-time setup:
#         xcrun notarytool store-credentials VEUSZ_NOTARY \
#             --apple-id "you@example.com" \
#             --team-id "XXXXXXXXXX" \
#             --password "abcd-efgh-ijkl-mnop"
#
# Notarytool wants a single archive, so we zip the whole sidecar
# directory, submit, then `stapler staple` the resulting ticket back
# onto every signed binary that Gatekeeper looks at.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIPLE="${TRIPLE:-$(uname -m)-apple-darwin}"
[[ "$TRIPLE" == "arm64-apple-darwin" ]] && TRIPLE="aarch64-apple-darwin"
BUNDLE="$REPO_ROOT/veusz-tauri/sidecar/$TRIPLE"
PROFILE="${PROFILE:-VEUSZ_NOTARY}"

[[ -d "$BUNDLE" ]] || { echo "no bundle at $BUNDLE" >&2; exit 2; }

ZIP="$BUNDLE.zip"
echo "→ Zipping bundle to $ZIP"
( cd "$(dirname "$BUNDLE")" && ditto -c -k --keepParent "$(basename "$BUNDLE")" "$ZIP" )

echo "→ Submitting to Apple notarization (this can take several minutes)"
xcrun notarytool submit "$ZIP" --keychain-profile "$PROFILE" --wait

# Apple's stapler can attach the ticket directly to a .dylib or signed
# binary; .so files in a sidecar bundle technically don't NEED stapling
# (the kernel checks notarization status online for unstapled binaries
# on first launch), but stapling the launcher works offline.
echo "→ Stapling notarization ticket"
xcrun stapler staple "$BUNDLE/veuszd" || true
xcrun stapler staple "$BUNDLE/python/bin/python3" || true

echo "→ Done. Bundle is signed + notarized + stapled."
echo "   Spot-check with:  spctl -a -t exec -vv $BUNDLE/veuszd"
