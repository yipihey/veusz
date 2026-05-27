# Comparison harness

Phase-1 scaffold for the parallel paint backends work. See
`docs/parallel-paint-backends-plan.md` §10 for the full spec.

## What's here

- `manifest.toml` — corpus definition (smoke / corpus / stress tiers) and
  enabled-backends list. The skip-list excludes 3D widgets explicitly.
- `veusz_render_compare.py` — render the corpus through each enabled
  backend. Phase-1 only renders; per-pixel and per-vector diff land in
  Phase 2 when there are at least two backends to compare.
- `aggregate_trace.py` — consume `VEUSZ_PAINT_TRACE` (Python-side) and
  `VEUSZ_RECORDPAINT_TRACE` (C++ RecordPaintEngine) JSONL traces into a
  measured call-frequency table. Spike S1 consumer.

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
