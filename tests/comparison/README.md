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

Once the extension is in place, the harness picks the backend up
automatically:

```sh
VEUSZ_PAINT_BACKEND=tiny-skia \
    python tests/comparison/veusz_render_compare.py --manifest --smoke \
        --backends qt,tiny-skia --out /tmp/cmp
```

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
