# Bundled `veuszd` sidecar

A self-contained directory tree that `tauri.conf.json::bundle.externalBin`
can point at once Phase 5 (bundling) is wired. Every subdirectory of
`sidecar/` is one OS/arch target.

## Build

```
scripts/bundle-sidecar.sh                          # default triple = host
TRIPLE=aarch64-apple-darwin   scripts/bundle-sidecar.sh
TRIPLE=x86_64-pc-windows-msvc scripts/bundle-sidecar.sh   # Windows: TODO ps1
```

Sets up:

* `python/` — [python-build-standalone](https://github.com/astral-sh/python-build-standalone)
  interpreter (3.12 by default), pinned to a known tag for reproducibility.
* `veuszd` — relocatable shell-script launcher. Sets
  `PYTHONSAFEPATH=1` and `PYTHONNOUSERSITE=1` so neither cwd nor the
  user's `~/.local` can shadow the bundled veusz package.

`PyQt6`, `numpy`, and `veusz` are pip-installed into the bundled
site-packages. The Veusz C extensions (`veusz/helpers/*.so`) are
compiled in place against the bundled PyQt6's sip/Qt headers, so the
bundle is one self-contained unit with no host dependencies beyond
glibc / the OS's normal C++ runtime.

## Test

```
scripts/test-bundled-daemon.sh
```

Puts the bundled `veuszd` first on PATH, then runs:

* `cargo test -p veusz-tauri --test bridge`   — Rust Bridge integration
* `cargo test -p veusz-rpc --test integration` — Rust client integration
* `pnpm vitest run src/test/e2e-real-daemon.test.tsx` — Node AppShell e2e

If every test passes against the bundled binary, the sidecar is
release-ready *for that triple*.

## Spike results (Linux x86_64, May 2026)

| Metric | Value |
|---|---|
| Bundle size | 715 MB unpacked |
| PyQt6 in bundle | 260 MB |
| numpy in bundle | 42 MB |
| veusz in bundle | 17 MB |
| Python runtime | 396 MB (full stdlib + libs) |
| Shared objects | 211 .so files |
| Cold launch (`--help`) | ~200 ms |
| Full live-daemon test suite (8 tests) | ~7 s wall |

Bundled binary passes 100% of the same live-daemon tests the
dev-installed `veuszd` passes — there is **no functional gap** between
a developer install and a bundle. Risk #1 from the plan is resolved
for Linux x86_64; the script is designed so swapping the
`python-build-standalone` triple ports it to macOS arm64/x86_64 and
Windows x86_64 (Windows needs a .ps1 launcher sibling — TODO before
Phase 5).

## Why not PyInstaller / cx_Freeze / py2app

Veusz's `veusz/helpers/*.so` extensions link against the **exact**
PyQt6 sip ABI of the build environment. With PyInstaller, the host's
PyQt6 wheels get hoisted into the bundle but the extensions were built
against the developer's PyQt6, leading to ABI mismatches that surface
as silent import failures on end-user machines. python-build-standalone
sidesteps this by giving us a clean Python where we re-compile Veusz
fresh against the bundled PyQt6.

## Not in this directory

Per `.gitignore`, the built tree is **not committed**. Each CI runner
re-builds it as part of the release pipeline; for local development
you build once and the dev `veuszd` on PATH still works for everything
else.
