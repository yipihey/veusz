# Comparison harness

Phase-1 scaffold for the parallel paint backends work. See
`docs/parallel-paint-backends-plan.md` §10 for the full spec.

## What's here

- `manifest.toml` — corpus definition (smoke / corpus / stress tiers) and
  enabled-backends list. The skip-list excludes 3D widgets explicitly.
- `veusz_render_compare.py` — render the corpus through each enabled
  backend, then (when more than one backend ran) emit per-pair diff PNGs
  and a JSON report keyed by tolerance band.
- `diff.py` — per-pixel diff math: PSNR over RGB, a luminance-correlation
  SSIM proxy, magenta visualisation. Pure Python with optional
  pillow + numpy. Six unit tests in `test_diff.py`.
- `aggregate_trace.py` — consume `VEUSZ_PAINT_TRACE` (Python-side) and
  `VEUSZ_RECORDPAINT_TRACE` (C++ RecordPaintEngine) JSONL traces into a
  measured call-frequency table. Spike S1 consumer.

## Diff math

The bands in `manifest.toml` `[tolerance]` are interpreted as:
PSNR ≥ `identical` (default 50 dB) → green, ≥ `within` (35 dB) → yellow,
otherwise → red. The harness prints a one-line summary at end of run.

## Running the diff unit tests

```sh
python3 -m pytest tests/comparison/test_diff.py -v
```

## Running the tiny-skia end-to-end tests

Requires a one-time build of the Rust PyO3 extension:

```sh
scripts/build_paint_ext.sh              # produces veusz/paint/_paint_ext.abi3.so
python3 -m pytest tests/comparison/test_python_tiny_skia.py -v
```

The bridge exposes both raster and vector emission from the same Scene:

```python
from veusz.paint import create_painter
p = create_painter(400, 240, backend="tiny-skia")
# … paint operations …
p.finish()
png_bytes = p.to_png()
pdf_bytes = p.to_pdf(width_pt=400, height_pt=240)  # A4 / letter / etc. via width_pt+height_pt
```

## Backends

Three backends are wired through the harness:

* **`qt`** — Veusz's existing `AsyncExport` (QPainter → QImage / QPrinter).
  Bit-identical to current Veusz output.
* **`tiny-skia`** — pure-Rust CPU rasteriser. Deterministic across machines;
  this is what runs in CI for snapshot regression tests.
* **`vello`** — wgpu compute backend. Native uses Vulkan / Metal / DX12;
  WASM/WebGPU target lands in plan §8 phase 4. Probed at module load and
  silently omitted on systems with no working wgpu adapter (e.g. CI without
  Vulkan).

Both `tiny-skia` and `vello` consume the **same** abstract `Scene` IR and
emit PDF via the **same** `pdf-writer`-based emitter, so the PDF column is
backend-agnostic.

## Rendering real `.vsz` documents through tiny-skia or Vello

```sh
scripts/build_paint_ext.sh                          # one-time
python tests/comparison/veusz_render_compare.py \
    --manifest --smoke \
    --backends qt,tiny-skia,vello \
    --out /tmp/cmp --keep-scene
```

Pipeline: load `.vsz` → drive Veusz widgets through
`SceneCapturingPainter` (QPainter subclass that records every paint
call as an abstract `SceneOp`) → ship recorded scene JSON to
`veusz.paint._paint_ext` for PNG + PDF emission → diff against the
QPainter reference output. Requires PyQt6; widgets are not modified.
`--keep-scene` writes the captured scene JSON next to the PNG / PDF for
debugging.

C++-originated calls from `qtloops` batches (`plotPathsToPainter`,
`plotLinesToPainter`, …) currently bypass the Python intercept — those
ops will show up in the QPainter render but not in the tiny-skia render.
The diff math flags these as material differences; the audit gives an
upper bound on the gap.

## Scene fixtures (CI without PyQt6)

`tests/comparison/fixtures/*.scene.json` are pre-recorded scenes that
exercise the full rendering pipeline (tiny-skia + pdf-writer + diff
math) **without needing PyQt6 or Veusz installed**. `test_fixtures.py`
parameterises over every fixture: each one must render to a valid PNG
and PDF, and produce bit-identical PNGs across runs (snapshot
determinism). Regenerate with:

```sh
python3 scripts/regen_scene_fixtures.py
```

Drop additional `.scene.json` files into the fixtures directory to
broaden the suite — once a PyQt6 dev env runs the harness with
`--keep-scene`, the resulting per-document scene JSON can be checked in
as a fixture for stable cross-platform regression coverage.

## How to run the dynamic-pass audit (spike S1)

Python-side (no rebuild needed):

```sh
VEUSZ_PAINT_TRACE=/tmp/py-trace.jsonl \
    python tests/comparison/veusz_render_compare.py --manifest --corpus \
        --out /tmp/render-out
python tests/comparison/aggregate_trace.py /tmp/py-trace.jsonl
```

C++-side (requires rebuilding `veusz/helpers/recordpaint*.so`):

```sh
VEUSZ_RECORDPAINT_TRACE=/tmp/cpp-trace.jsonl \
    python tests/comparison/veusz_render_compare.py --manifest --corpus \
        --out /tmp/render-out
python tests/comparison/aggregate_trace.py /tmp/cpp-trace.jsonl
```

Both can be set simultaneously to compare the Python-visible surface against
the ground-truth `qtloops`-inclusive intercept.
