# Bringing up `veusz-tauri` on macOS

Everything was developed on Linux x86_64. This document is the
shortest path from "fresh checkout on a Mac" to "see the GUI running,
optionally signed + notarized."

## Prerequisites (one-time)

Tested on macOS 14+ Apple Silicon (M-series). x86_64 path is the
same; substitute `x86_64-apple-darwin` for `aarch64-apple-darwin`
below.

| Tool | Install |
|---|---|
| Xcode Command Line Tools | `xcode-select --install` |
| Homebrew | https://brew.sh |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Node 22 + pnpm | `brew install node pnpm` |
| Qt build deps | `brew install qt qmake` (only needed for `pip install -e .` dev install) |
| Tauri 2 prereqs | macOS already ships everything (no webkit2gtk to install — uses system WKWebView) |

For codesigning + notarization (optional, only for distribution):

* An Apple Developer Program membership ($99/yr)
* A **Developer ID Application** certificate installed via Xcode → Settings → Accounts → "Manage Certificates"
* An app-specific password from <https://appleid.apple.com> for `notarytool`

## Step 1 — clone & install

```bash
git clone https://github.com/yipihey/veusz.git
cd veusz
git checkout claude/brush-embedded-library-jvNlD

# Python daemon dev install (needed for the test suite + ad-hoc work)
python3 -m venv .venv && source .venv/bin/activate
pip install -e .

# Frontend
cd veusz-tauri
pnpm install
```

Verify:

```bash
cd ..    # back to repo root
pytest tests/daemon -q                              # → 74 passed
cd veusz-tauri && pnpm vitest run --reporter=dot    # → 115 passed
cd .. && cargo test --manifest-path veusz-tauri/Cargo.toml --workspace -- --test-threads=1
                                                    # → 11 passed
```

All three layers should be green. If they're not, **do not proceed to
the bundle step** — fix the failures first.

## Step 2 — build the bundled `veuszd` sidecar

The `bundle-sidecar.sh` script is TRIPLE-aware:

```bash
TRIPLE=aarch64-apple-darwin bash scripts/bundle-sidecar.sh    # Apple Silicon
TRIPLE=x86_64-apple-darwin  bash scripts/bundle-sidecar.sh    # Intel
```

It will:

1. Download a `python-build-standalone` interpreter for the chosen triple (the URL is generated dynamically — about 100 MB).
2. `pip install` numpy, PyQt6, and the local Veusz source into the bundled site-packages. **The Veusz C extensions (`veusz/helpers/*.so`) are compiled in place against the bundled PyQt6's sip headers** — sidesteps the PyInstaller ABI-mismatch trap.
3. Drop a relocatable shell-script launcher at `veusz-tauri/sidecar/<triple>/veuszd`.

Expected output: `Bundle ready: ~715M`.

### Optional: slim it (recommended)

```bash
TRIPLE=aarch64-apple-darwin bash scripts/slim-sidecar.sh
```

Strips unused PyQt6 modules (QtQuick / QtQml / Qt3D / Designer / Pdf / Multimedia) and Python `test/` `idle_test/` `turtledemo/` `ensurepip/`. On Linux this saved 181 MB (-25%); macOS should land similarly.

### Verify the bundle

```bash
bash scripts/test-bundled-daemon.sh
```

Runs the full live-daemon test matrix (Rust Bridge integration, Rust client integration, Node AppShell e2e) against the bundled `veuszd` rather than the dev install. Expect **9/9 passes**.

If a Rust test fails with "veuszd not on PATH", confirm the script set `PATH` correctly — its first line should print the launcher path.

## Step 3 — run the Tauri shell live

```bash
cd veusz-tauri
pnpm build                              # vite → dist/
cargo tauri dev                         # opens a real WKWebView
```

**Note**: `cargo tauri dev` boots the daemon via `veuszd` on PATH, not the bundled sidecar. To use the bundled one, prepend it to `PATH` first:

```bash
export PATH="$(pwd)/sidecar/aarch64-apple-darwin:$PATH"
cargo tauri dev
```

What you should see:

* A window titled "Veusz" at 1280×800.
* Empty document view, "(unsaved)" in the toolbar, "Select a widget." in the right pane.
* The DataPanel at the bottom shows "No datasets yet."
* No crashes in the terminal.

### Likely first-launch gotchas

| Symptom | Fix |
|---|---|
| `cannot find webkit2gtk-4.1.pc` | macOS doesn't use it — Tauri picks the system WKWebView automatically. If this error appears, double-check you're not accidentally on a Linux build slice. |
| Gatekeeper kills `veuszd` on launch | Bundle isn't signed. Either run from inside the source tree (Gatekeeper trusts dev builds via xattr) or sign before testing (Step 4). |
| `error: cannot infer python3 path` | The launcher's `readlink` traversal didn't find the bundled interpreter. Confirm `sidecar/<triple>/python/bin/python3` exists. The portable launcher (this branch) uses a `while [-h ...]` loop, not `readlink -f`. |
| Tauri compile fails on missing `Cargo.lock` workspace member | Run `cargo generate-lockfile --manifest-path veusz-tauri/Cargo.toml`. |

## Step 4 — codesign for distribution (optional)

```bash
security find-identity -v -p codesigning
# Pick the "Developer ID Application" line — the FULL string after the
# parenthesis (e.g. "Developer ID Application: Tom Abel (XXXXXXXXXX)")

IDENTITY='Developer ID Application: <Your Name> (XXXXXXXXXX)' \
TRIPLE=aarch64-apple-darwin \
    bash scripts/codesign-mac-sidecar.sh
```

The script signs **every** `.so`, `.dylib`, `.framework`, the bundled `python3` binary, and the launcher — in deepest-first order. The Hardened Runtime entitlements at `veusz-tauri/src-tauri/Entitlements.plist` are critical: they enable JIT (V8/WKWebView), disable library validation (so the bundled PyQt6 doesn't need to be from the same Team ID), and allow unsigned executable memory (Python's runtime).

Expected output: `Signed N files.` followed by two `--verify` passes.

## Step 5 — notarize (optional)

One-time keychain setup:

```bash
xcrun notarytool store-credentials VEUSZ_NOTARY \
    --apple-id "you@example.com" \
    --team-id "XXXXXXXXXX" \
    --password "abcd-efgh-ijkl-mnop"   # an app-specific password
```

Then submit:

```bash
TRIPLE=aarch64-apple-darwin bash scripts/notarize-mac-sidecar.sh
```

Apple's service typically responds within 5–15 minutes. The script zips the bundle, submits, waits, then runs `stapler staple` on the launcher + interpreter so Gatekeeper accepts them offline.

## Step 6 — full `.app` bundle (later)

`cargo tauri build` produces the unbundled .app. Once we wire the sidecar slot in `tauri.conf.json::bundle.externalBin` to point at the directory we just signed, `tauri build` produces a Universal2 or arch-specific `.app` with the daemon embedded. The pieces are in place — `bundle.macOS.minimumSystemVersion` is set to 11.0, `bundle.category` is Education, hardened-runtime entitlements are wired — but exercising the full `tauri build` path needs to happen on a Mac.

## Reference

* Plan: `/root/.claude/plans/yes-a-full-veusz-parallel-knuth.md`
* Sidecar README: `veusz-tauri/sidecar/README.md`
* Top-level project README: `veusz-tauri/README.md`
* Branch: `claude/brush-embedded-library-jvNlD`, head pushed live

## What I can't validate without a Mac

This document, the macOS scripts, and the Tauri config changes were
written and parse-checked on Linux x86_64. The codesign / notarize
scripts have never executed. Things to watch for on your first run:

* `python-build-standalone` does ship aarch64-apple-darwin and
  x86_64-apple-darwin install-only tarballs at the pinned tag (20260510)
  — confirmed via the GitHub API in this session.
* macOS `bash` is 3.2 — old. The scripts avoid `[[ -v ]]`, `mapfile`,
  associative arrays. The launcher's symlink-resolving loop is bash 3-safe.
* If `pip install -e .` fails on `qmake not found`, you may need
  `brew install qt && export QMAKE=$(brew --prefix qt)/bin/qmake` before
  the build.

If anything in Steps 1–3 breaks, ping me and I'll fix it before you
move on to signing.
