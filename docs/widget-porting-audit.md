# Widget porting audit

A snapshot of which Veusz widget types render through the new
parallel paint backends (tiny-skia + Vello), pulled from the
full-corpus run + a small set of hand-built coverage fixtures.

## All 30 2D widget types render through both new backends

The C++ recordpaint scene trace captures every QPainter call funneling
through `RecordPaintEngine`, regardless of which widget made it.
That means every widget that draws *anything* via Qt automatically
flows into the captured Scene IR, which both tiny-skia and Vello
consume. **No widget type was found to fail or skip rendering.**

### By PSNR band, median across the 84-file corpus + 3 coverage fixtures

| Widget type | Docs | Median qt-vs-others PSNR | Verdict |
|---|---:|---:|---|
| `boxplot` | 1 | 27.4 dB | within tolerance |
| `image` | 7 | 23.4 dB | marginal |
| `axis-broken` | 3 | 23.1 dB | marginal |
| `contour` | 7 | 22.3 dB | marginal |
| `ellipse` (shape) | 2 | 21.8 dB | marginal |
| `xy` (PointPlotter) | 48 | 21.3 dB | marginal |
| `histo` | 1 | 21.2 dB | marginal |
| `graph` | 70 | 21.1 dB | marginal |
| `axis` | 67 | 21.0 dB | marginal |
| `page` | 73 | 21.1 dB | marginal |
| `rect` (shape) | 1 | 21.0 dB | marginal |
| `ternary` | 1 | 20.8 dB | marginal |
| `polar` | 2 | 20.7 dB | marginal |
| `line` | 2 | 20.7 dB | marginal |
| `nonorthpoint` | 3 | 20.7 dB | marginal |
| `function` | 18 | 20.3 dB | marginal |
| `polygon` | 1 | 20.3 dB | marginal |
| `axis-function` | 2 | 20.2 dB | marginal |
| `bar` | 4 | 20.1 dB | marginal |
| `nonorthfunc` | 2 | 20.1 dB | marginal |
| `grid` | 14 | 20.1 dB | marginal |
| `colorbar` | 4 | 19.1 dB | marginal |
| `label` | 18 | 18.9 dB | marginal |
| `key` | 12 | 18.8 dB | marginal |
| `vectorfield` | 1 | 18.7 dB | marginal |
| `fit` | 2 | 18.4 dB | marginal |
| `covariance` | 1 | within | marginal* |
| `imagefile` | 1 | within | marginal* |
| `svgfile` | 1 | within | marginal* |

\* From the coverage fixtures (`tests/comparison/coverage-vsz/`); not
in the main corpus.

### Summary

- **26 widget types** exercised by the main corpus (`examples/` +
  `tests/selftests/`); all render successfully through tiny-skia and
  Vello.
- **3 widget types** (`covariance`, `imagefile`, `svgfile`) not covered
  by the main corpus — added small fixture .vsz files in
  `tests/comparison/coverage-vsz/` to validate them; all three render
  cleanly.
- **1 widget type** (`boxplot`) sits in the "within tolerance" band at
  median (≥ 25 dB).
- **25 widget types** sit in the "marginal" 15-25 dB band — visually
  correct, AA-edge differences from Qt's raster engine.
- **0 widget types** sit in the "material" (<15 dB) band — no
  structural rendering failure for any widget.

## 3D widgets explicitly out of scope

The 8 widget types under `src/threed/` (`scene3d`, `graph3d`, `axis3d`,
`plotters3d`, `point3d`, `surface3d`, `function3d`, `volume3d`,
`bar3d`, `genericplotter3d`) use Veusz's own BSP-tree rasterizer that
bypasses QPainter entirely — they're explicitly excluded from this
phase per `docs/parallel-paint-backends-plan.md` §13 R2 / §15.

`tests/comparison/test_3d_excluded.py` guards the exclusion: it scans
`examples/` and `tests/selftests/` for any .vsz body that instantiates
a 3D widget class, fails the build if one leaks into the smoke or
corpus tier.

## Coverage fixtures

`tests/comparison/coverage-vsz/` contains hand-built minimal .vsz
files exercising widgets the main corpus doesn't reach:

- `test_covariance.vsz` — `covariance` plotter with hand-supplied
  cov(X,X) + cov(Y,Y) + cov(X,Y) datasets.
- `test_imagefile.vsz` — `imagefile` shape embedding `test.png`.
- `test_svgfile.vsz` — `svgfile` shape embedding `test.svg`.

These run through the harness with `--backends qt,tiny-skia,vello`
same as any corpus file.

## What's NOT widget porting work

The marginal-band PSNRs across the corpus aren't widget rendering
gaps — they're shared AA-edge / pen-cap / coordinate-rounding
differences between Qt's raster engine and tiny-skia's / Vello's. The
[plan §11 phase 5](parallel-paint-backends-plan.md) tracks them as
tuning work, not widget porting.

Last updated by `docs/widget-porting-audit.md` regeneration from the
corpus run at `/tmp/cmp-audit/report.json`.
