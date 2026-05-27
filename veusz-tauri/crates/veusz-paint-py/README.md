# veusz-paint-py

PyO3 bridge between Veusz's Python tree and the Rust paint backends
(`veusz-paint-tiny-skia`, `veusz-paint-vello`, `veusz-paint-pdf`). The
crate compiles to a single `cdylib` named `_paint_ext`; at runtime the
extension is imported as `veusz.paint._paint_ext` and consumed by
`veusz/paint/factory.py`.

Plan reference: `docs/parallel-paint-backends-plan.md` §7 (Python
integration) and §7.4 (build & packaging).

## Layout

```
veusz-tauri/crates/veusz-paint-py/
├── Cargo.toml         # crate config; [lib] name = "_paint_ext", abi3-py310
├── pyproject.toml     # maturin build config
├── src/lib.rs         # PyO3 bindings (render_scene_to_png, scene_summary_json, …)
└── README.md          # this file
```

The Python source tree lives in the repository root, not under this
crate. `pyproject.toml` sets `[tool.maturin] python-source = "../../.."`
so maturin can resolve the dotted `module-name = "veusz.paint._paint_ext"`
target — the compiled `.so` ends up at `<repo>/veusz/paint/_paint_ext.abi3.so`,
which is exactly where the manual `scripts/build_paint_ext.sh` script
writes it.

## How to build locally

Three equivalent options. All three produce
`veusz/paint/_paint_ext.abi3.so`.

### A. `pip install -e` (preferred for CI / fresh checkouts)

```sh
pip install -e veusz-tauri/crates/veusz-paint-py/
```

This is the canonical install path: pip drives maturin via the
PEP-517 backend declared in `pyproject.toml`, builds the crate in
release mode, and drops the .so into the source tree as an editable
install. Subsequent `pip install -e` calls rebuild only if the Rust
sources changed.

### B. `maturin develop` (preferred for active Rust development)

```sh
maturin develop --release --manifest-path veusz-tauri/crates/veusz-paint-py/Cargo.toml
```

Same effect as the pip path but skips the wheel-pack/unpack step.
Requires a virtualenv (`VIRTUAL_ENV` or `CONDA_PREFIX`); the wrapper
script `scripts/build_paint_ext.sh` synthesises one from the system
interpreter when nothing is active.

### C. `scripts/build_paint_ext.sh` (wrapper; auto-picks A or the legacy path)

```sh
scripts/build_paint_ext.sh             # uses maturin if on PATH; else falls back to cargo
scripts/build_paint_ext.sh --debug     # debug profile
scripts/build_paint_ext.sh --no-maturin # force the legacy cargo + cp fallback
```

## Wheel layout

`maturin build --release` (run from this directory) produces a wheel
whose only payload is the `.so`:

```
veusz_paint_ext-0.0.0-cp310-abi3-…whl
├── veusz/paint/_paint_ext.abi3.so
└── veusz_paint_ext-0.0.0.dist-info/…
```

The dotted path means installing the wheel co-tenants the file with
the main `veusz` distribution: both write into
`<site-packages>/veusz/paint/`, and `from veusz.paint import _paint_ext`
just works. `pyproject.toml`'s `exclude` list keeps all other repo
files out of the wheel so we don't double-package the veusz Python
source.

## Verifying

```sh
python3 -c "from veusz.paint import _paint_ext; print(_paint_ext.available_backends())"
# -> ['tiny-skia', 'vello']     (on a box with a working wgpu adapter)
# -> ['tiny-skia']               (no Vulkan/Metal/DX12 available)
python3 -m pytest tests/comparison/
```

The full PyO3 surface is documented in `src/lib.rs` and exercised by
`tests/comparison/test_python_tiny_skia.py`.
