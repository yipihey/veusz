# QPainter Audit — Concrete Enumeration

Companion to [`parallel-paint-backends-plan.md`](./parallel-paint-backends-plan.md). This file
is the first concrete artifact of the new-backends work: an enumeration of every QPainter
method Veusz widget code actually invokes, so the abstract `Painter` interface can be designed
from data rather than guesswork.

This is the **week-1 static-pass** result. The dynamic pass (instrumented
`RecordPaintEngine` running the full `.vsz` corpus) replaces this with measured call counts
during week 1 — see spike S1 in the main plan.

---

## 1. Static call-frequency table

Counts from `grep -rEo 'painter\.[a-zA-Z]+\(' veusz/`, deduped per call site (so a method
called inside a loop counts once).

| Method | Calls | Tier | Notes |
|---|---:|---|---|
| `setPen` | 72 | Core | Stroke style; dominant call. Pen carries color, width, dash pattern, cap, join, miter. |
| `setFont` | 30 | Core | Set font for subsequent `drawText` / `drawTextItem`. |
| `setBrush` | 28 | Core | Fill style. Brush carries color, gradient, pattern. |
| `save` | 27 | Core | Push state. |
| `restore` | 27 | Core | Pop state. |
| `setRenderHint` | 17 | Common | Antialiasing, text antialiasing, smooth pixmap. Reduced to a single `Quality` enum in the new interface. |
| `pen` | 15 | Edge | Read-back of current pen. Refactor to keep pen in caller state instead of querying painter. |
| `end` | 14 | Core | Finalize painting. Maps to drop / explicit `finish()` in Rust. |
| `drawLine` | 14 | Core | Single-line primitive. |
| `translate` | 12 | Core | Transform — collapses into `concat_transform` in new interface. |
| `device` | 11 | Edge | Query output `QPaintDevice` (mostly for DPI). Replace with DPI in painter constructor. |
| `rotate` | 6 | Core | Transform — collapses into `concat_transform`. |
| `drawRect` | 6 | Core | Rectangle primitive. |
| `updateMetaData` | 5 | n/a (custom) | Veusz-specific method on `PainterRoot` subclass, not QPainter. |
| `strokePath` | 5 | Core | Stroke a path with explicit pen (does not touch current pen). |
| `setClipRect` | 5 | Core | Axis-aligned clip — fast path. |
| `setClipPath` | 4 | Core | Path-based clip. |
| `drawImage` | 4 | Core | Raster blit. |
| `docColorAuto` | 4 | n/a (custom) | Veusz-specific, returns a color. |
| `docColor` | 4 | n/a (custom) | Veusz-specific, returns a color. |
| `scale` | 3 | Core | Transform — collapses into `concat_transform`. |
| `fillPath` | 3 | Core | Fill a path with explicit brush. |
| `drawText` | 3 | Core | Simple text. Most text actually goes through `utils.textrender`, not `drawText` directly. |
| `drawPath` | 3 | Core | Stroke + fill a path with current pen and brush. |
| `drawEllipse` | 3 | Core | Ellipse primitive. |
| `drawPolyline` | 2 | Core | Open polygonal line. |
| `setWindow` | 1 | Edge | Logical-coordinate window. Folded into transform on construction. |
| `fillRect` | 1 | Core | Fast filled rectangle. |
| `drawPolygon` | 1 | Core | Closed polygon. |
| `drawLines` | 1 | Core | Batched lines. |
| `clipPath` | 1 | Edge | Read current clip. Refactor to caller-side bookkeeping. |
| `brush` | 1 | Edge | Read current brush. Same as `pen`. |

Direct caller files (top): `veusz/widgets/axis.py`, `veusz/widgets/key.py`,
`veusz/widgets/page.py`, `veusz/widgets/graph.py`, `veusz/widgets/shape.py`,
`veusz/widgets/textlabel.py`, `veusz/widgets/colorbar.py`, `veusz/widgets/image.py`,
`veusz/utils/textrender.py`, `veusz/document/painthelper.py`,
`veusz/document/svg_export.py`.

---

## 2. Indirect QPainter calls via `src/qtloops/`

Bulk geometry from numpy arrays does not go through Python `painter.X()` — it's pushed to C++
via `qtloops`, which calls QPainter from inside C++. The static grep misses these. The
`RecordPaintEngine` catches them (they hit the same intercept). Functions:

| qtloops function | Underlying QPainter calls | Used by |
|---|---|---|
| `plotPathsToPainter` | `drawPath` per scaled glyph instance | Point/scatter plotters, vector field, error-bar caps |
| `plotLinesToPainter` | `drawLine` / `drawLines` | Error bars, line segments between points |
| `plotBoxesToPainter` | `drawRect` / `fillRect` | Bar/histogram boxes |
| `plotClippedPolygon` | `drawPolygon` after Sutherland-Hodgman clip | Filled regions, contour fills |
| `plotClippedPolyline` | `drawPolyline` after polyline clip | Contour lines, function curves |
| `plotImageAsRects` | `fillRect` per pixel | Image widget under specific scaling regimes |
| `plotNonlinearImageAsBoxes` | `fillRect` per non-uniform cell | Image widget on nonlinear axes |

For the new backends, these C++ helpers are **reimplemented in Rust** (matching the same
clipping and batching strategy) and submit one large `Path` to the abstract `Painter` rather
than thousands of individual calls. PyO3 + zero-copy numpy makes this practical.

---

## 3. The intercept ground truth: `PaintElement` types

`src/recordpaint/recordpaintengine.cpp` defines 22 paint-element subclasses. Because
`RecordPaintEngine` is the actual `QPaintEngine` driver used during normal Veusz rendering,
this is the **complete** set of operations Veusz emits to QPainter today — including any that
the Python grep misses.

Draw operations (10): `ellipseElement`, `ImageElement`, `lineElement`, `PathElement`,
`PixmapElement`, `pointElement`, `polyElement`, `rectElement`, `TextElement`,
`TiledPixmapElement`.

State operations (12): `BackgroundBrushElement`, `BackgroundModeElement`, `BrushElement`,
`BrushOriginElement`, `ClipRegionElement`, `ClipPathElement`, `CompositionElement`,
`FontElement`, `TransformElement`, `ClipEnabledElement`, `PenElement`, `HintsElement`.

The abstract `Painter` interface in §4 of the main plan covers every draw operation directly;
state operations either map 1:1 (`PenElement` → `set_paint` with stroke field;
`TransformElement` → `set_transform`; `ClipPathElement`/`ClipRegionElement` → `push_clip_*`;
`FontElement` → text subsystem; `HintsElement` → `set_render_quality`;
`CompositionElement` → `set_blend_mode`) or are folded into the constructor / caller-side
state (`BackgroundBrushElement`, `BackgroundModeElement`, `BrushOriginElement`,
`ClipEnabledElement` are largely vestigial in Veusz's usage; the dynamic pass will confirm
which can be dropped).

---

## 4. Tiering summary (for interface design input)

- **Core** (12 operations cover ~95% of call sites): `save`/`restore`, `setPen`, `setBrush`,
  `setFont`, transforms (translate/rotate/scale collapse), `setClipRect`/`setClipPath`,
  `drawLine`/`drawLines`/`drawPolyline`/`drawPolygon`/`drawRect`/`drawEllipse`/`drawPath`,
  `strokePath`/`fillPath`, `drawText`, `drawImage`, antialias hint.
- **Common**: dashed pen styles, linear/radial gradients (used in colorbar, image,
  ext-brush filling), `drawTiledPixmap`, brush patterns.
- **Edge**: `setBrushOrigin`, `setBackgroundMode`, polygon fill rule selection,
  `drawTextItem` glyph runs, `setWindow`, `device()`, `pen()`/`brush()`/`clipPath()`
  read-back.
- **Unsupported / fallback**: anything we discover in the dynamic pass that does not map
  cleanly. Listed explicitly here before Phase 2.

---

## 5. Dynamic-pass plan (week 1, spike S1)

1. Add a `VEUSZ_RECORD_TRACE=path/to/trace.jsonl` env var honored by
   `RecordPaintEngine`. Each PaintElement emits one JSON line: `{"op": "drawPath",
   "path_pts": 412, "stroke": {...}, "fill": null, "transform": [...]}`.
2. Run `tests/runselftest.py` and every `.vsz` in `examples/` + `tests/selftests/`
   (excluding 3D) headlessly with `VEUSZ_RECORD_TRACE` set per document.
3. Aggregate: per-method call counts, per-method argument shape histograms (path lengths,
   pen widths, dash patterns seen, brush types seen, font families seen, blend modes seen).
4. Replace §1 of this file with measured counts. Use the argument-shape histograms to drive
   the **Paint** value design in §4.2 of the main plan.
