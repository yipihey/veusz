# Parallel Paint Backends for Veusz — Implementation Plan

Status: planning, no production code yet.
Branch: `claude/parallel-paint-backends-R9bme` (rebased over the Tauri / `veuszd` work).
Target review time: < 30 minutes.

Companion artifact: [`qpainter-audit.md`](./qpainter-audit.md) — concrete enumeration of the
QPainter surface area Veusz actually uses today, gathered before the interface design begins.

---

## 1. Goal and Scope

Add **two alternative paint backends** alongside the existing Qt/QPainter backend, switchable at
runtime:

1. **tiny-skia** — pure-Rust software rasterizer; deterministic; CI-friendly; the regression
   baseline.
2. **Vello** — wgpu-based GPU compute rasterizer; native (Vulkan/Metal/DX12) **and** WebAssembly
   (WebGPU) targets; the "render a `.vsz` in the browser with no Python and no Qt" backend.

Constraints (non-negotiable, restated):

- QPainter backend is untouched — current PDF/SVG/PNG output bit-identical, no behavior change for
  existing users. We refactor by **extracting an interface that QPainter already satisfies**, not
  by rewriting the existing pipeline.
- Widget paint code targets an abstract `Painter` interface. QPainter becomes the *first*
  implementation, not the API.
- The interface is the **minimal subset Veusz actually uses**, derived from audit, not a port of
  QPainter.
- New backends implemented in **Rust**, exposed to Python via **PyO3**, switched by env var
  (`VEUSZ_PAINT_BACKEND={qt|tiny-skia|vello}`) or `.vsz` document option.
- **3D widgets out of scope** (separate engine in `src/threed/`; see §13).
- **No QPainter removal**, no export-pipeline rewrite, no perf tuning beyond "fast enough to
  test."

---

## 2. Why this is tractable: the existing RecordPaintEngine

Veusz already ships a complete intercept of every QPainter call widgets make:
`src/recordpaint/recordpaintengine.cpp` is a `QPaintEngine` whose only job is to capture every
operation widgets perform on a `RecordPaintDevice`, store it as a `PaintElement` subclass, and
replay later onto another QPainter.

The set of `PaintElement` subclasses (ellipseElement, ImageElement, lineElement, PathElement,
PixmapElement, pointElement, polyElement, rectElement, TextElement, TiledPixmapElement,
BackgroundBrushElement, BackgroundModeElement, BrushElement, BrushOriginElement,
ClipRegionElement, ClipPathElement, CompositionElement, FontElement, TransformElement,
ClipEnabledElement, PenElement, HintsElement) **is a working enumeration of the QPainter
surface Veusz actually uses**.

This gives us two leverage points:

- The audit isn't a guess — we already have a runtime intercept that proves which methods are
  actually invoked. We can run the full test corpus through it and dump call counts.
- We can prototype new backends by reading the recorded `PaintElement` stream and translating
  each element to tiny-skia / Vello calls — long before widgets are refactored to target the
  abstract interface directly. **This collapses risk dramatically.** (See spike S1 below.)

---

## 3. The QPainter Audit (week 1, most important deliverable)

### 3.1 Method

Three signals, combined:

1. **Static grep** of `painter.*` calls under `veusz/widgets/`, `veusz/document/`,
   `veusz/utils/`, `veusz/setting/` — already done as a first pass, see `qpainter-audit.md`.
2. **Dynamic intercept** via `RecordPaintEngine`. Instrument `recordpaintengine.cpp` (debug
   build) to emit a per-document JSONL trace of every operation and its arguments. Run every
   `.vsz` in `examples/` and `tests/selftests/` (91 files) through headless export. Aggregate
   call counts and unique argument shapes (pen styles, brush types, clip-path complexity).
3. **C++ helper survey** in `src/qtloops/qtloops.h` for batched-geometry routines that bypass
   the Python `painter.*` interface — `plotPathsToPainter`, `plotLinesToPainter`,
   `plotBoxesToPainter`, `plotClippedPolygon`, `plotClippedPolyline`, `plotImageAsRects`,
   `plotNonlinearImageAsBoxes`. These end up calling QPainter from C++; the recorder catches
   them, the grep does not.

### 3.2 Expected output

A table in `qpainter-audit.md` with: method name → call count → fraction of documents that use
it → grouping band. Initial draft already populated from the static pass; the dynamic pass
upgrades it during week 1.

### 3.3 Tiering (criterion for inclusion in the abstract interface)

- **Core** (must work on all three backends): `save`/`restore`, `setPen`, `setBrush`,
  `setFont`, `setTransform`/`translate`/`rotate`/`scale`, `setClipRect`/`setClipPath`,
  `drawLine`/`drawLines`/`drawPolyline`/`drawPolygon`/`drawRect`/`drawEllipse`/`drawPath`,
  `strokePath`/`fillPath`, `drawText` (simple), `drawImage`, antialiasing hint.
- **Common** (work on all three, shim acceptable): dashed pen styles, linear/radial gradients,
  text alignment flags, composition modes (SourceOver, Multiply, Plus — limited set actually
  used), `drawTiledPixmap`, brush patterns (cross-hatch etc.).
- **Edge** (one or two widgets — fold into core ops or document carve-out):
  `setBrushOrigin`, `setBackgroundMode`, non-Even/WindingFill polygon rules,
  `drawTextItem` with custom glyph runs, `setWindow`.
- **Unsupported** (explicit fallback path or refactor): `QPicture`/`QPrinter`-specific calls,
  EMF-specific paths, `device()` introspection (replace with DPI passed in at painter
  construction).

### 3.4 First-pass result (from the static pass alone)

See `qpainter-audit.md` §1 for the full table. Headline: ~25 distinct QPainter methods are
called across `veusz/` (excluding 3D). Top by raw call count: `setPen` (72), `setFont` (30),
`setBrush` (28), `save`/`restore` (27 each), `setRenderHint` (17), `drawLine` (14),
`translate` (12), `device` (11), `drawImage`/`drawRect`/`setClipRect`/`setClipPath`/`strokePath`
each between 4–6. Twelve operations cover well over 95% of call sites. This is a small enough
surface to design cleanly.

---

## 4. The Abstract `Painter` Interface

### 4.1 Shape (illustrative — final shape follows audit)

A Rust trait, also exposed as a Python protocol via PyO3:

```rust
pub trait Painter {
    // state stack
    fn save(&mut self);
    fn restore(&mut self);

    // transform
    fn set_transform(&mut self, m: Affine);  // overwrite
    fn concat_transform(&mut self, m: Affine); // multiply (translate/rotate/scale collapse here)

    // clip
    fn push_clip_rect(&mut self, r: Rect);
    fn push_clip_path(&mut self, p: &Path, rule: FillRule);
    fn pop_clip(&mut self);

    // paint state
    fn set_paint(&mut self, p: &Paint);       // unified Pen+Brush (see §4.2)
    fn set_blend_mode(&mut self, m: BlendMode);
    fn set_render_quality(&mut self, q: Quality);

    // geometry
    fn stroke_path(&mut self, p: &Path);
    fn fill_path(&mut self, p: &Path, rule: FillRule);
    fn draw_image(&mut self, img: &Image, dst: Rect, src: Option<Rect>);

    // text — its own subsystem, see §5
    fn draw_text(&mut self, layout: &TextLayout, x: f64, y: f64);
}
```

Notes:
- `translate` / `rotate` / `scale` collapse into `concat_transform`. The QPainter shim
  reconstitutes them where needed.
- `setPen` and `setBrush` collapse into a single `Paint` value with `stroke` and `fill`
  sub-fields. QPainter shim splits them on output. This eliminates the "which one is current?"
  state ambiguity that bites scene-graph backends.
- `drawLine`, `drawLines`, `drawRect`, `drawEllipse`, `drawPolygon`, `drawPolyline` collapse
  into `stroke_path` / `fill_path` over a small set of `Path::line/rect/ellipse/polyline/...`
  constructors. The QPainter shim restores the fast-path call where it matters.
- `Path` is its own immutable, sendable value (clonable across thread/FFI boundary).
- No `device()` — DPI and page size are constructor parameters.

### 4.2 `Paint` value

```rust
pub struct Paint {
    pub fill: Option<Fill>,        // Solid(Color) | LinearGradient(...) | RadialGradient(...) | Pattern(...)
    pub stroke: Option<Stroke>,    // width, dash pattern, line cap, line join, miter limit, color/gradient
    pub anti_alias: bool,
}
```

Modeled on the **intersection** of QPainter's pen+brush, Skia's `SkPaint`, and Vello's
`Brush`+`Stroke`. Captures what Veusz uses; nothing more.

### 4.3 Why this shape

- Matches Vello's scene API closely: Vello takes paths + paints + transforms + clips.
- Matches tiny-skia's primitives 1:1.
- QPainter shim is straightforward — every operation maps to a small handful of QPainter calls.
- PDF/SVG emitters can walk this interface as a scene graph.

### 4.4 Recording vs. immediate mode

Backends may choose either:
- **Immediate** (QPainter, tiny-skia): apply each call as it arrives.
- **Recording** (Vello, PDF, SVG): build a scene/document, render at end.

The interface is the same; the recording-mode backends accumulate into a `Scene` value and
flush at end-of-page.

---

## 5. Text Rendering Subsystem

Shared between tiny-skia and Vello backends:

- **fontique** — font discovery, system font fallback.
- **Parley** — text layout (line breaking, justification, bidi, multi-font runs).
- **Swash** — shaping and glyph rasterization (raster path) / glyph outline extraction (vector
  path, for PDF/SVG/Vello).

The interface surface for text is:

```rust
struct TextStyle { font_family, font_size, weight, style, features, color, ... }
struct TextLayout(...) // built by layout engine, immutable, sendable
impl TextLayout {
    fn measure(&self) -> Metrics;
    fn glyph_runs(&self) -> impl Iterator<Item = GlyphRun>;
}
```

QPainter backend gets a parallel `QPainter`-based shim implementation of the same trait —
**we do not run Parley+Swash on the QPainter backend**, since Qt has its own text stack and we
must preserve current output exactly.

This means **the two new backends share a text stack different from Qt's.** That divergence is
unavoidable and is the single biggest visible-difference risk; see §13.

---

## 6. PDF and SVG from the Abstract Scene

- **PDF**: `pdf-writer` crate. New code path that consumes the abstract scene representation
  and emits PDF. Shared between tiny-skia and Vello backends (the scene representation is
  backend-agnostic). Text written as either glyph outlines (always portable) or embedded
  font subsets (smaller files, requires Swash → CFF/TrueType subsetter — second-stage work).
- **SVG**: a small SVG emitter against the same abstract scene. Mirrors the existing
  `SVGPaintEngine` (`veusz/document/svg_export.py`) so we can diff outputs and verify path
  serialization.

The **existing** Qt-based PDF/SVG/PNG export paths (`veusz/document/export.py` —
`ExportPDFRunnable`, `ExportSVGRunnable`, `ExportBitmapRunnable`) are not touched. The new
backends grow their own export functions that take a `.vsz` and produce a file directly via
the abstract scene → emitter, parallel to but independent of the Qt pipeline.

---

## 7. Rust Crate Architecture and PyO3 Boundary

```
veusz-paint/                       (Cargo workspace, lives under veusz-tauri/crates/ alongside veusz-rpc)
├── veusz-paint-core/              # Painter trait, Path, Paint, Color, Affine, Scene, TextLayout
│                                  # No backend deps. Pure types.
├── veusz-paint-text/              # Parley + Swash + fontique integration. TextLayout impl.
├── veusz-paint-tiny-skia/         # Painter impl over tiny_skia::Pixmap.
│                                  # Emits PNG via image crate.
├── veusz-paint-vello/             # Painter impl that builds a vello::Scene.
│                                  # Owns wgpu adapter selection (native + WebGPU).
├── veusz-paint-pdf/               # Scene -> PDF via pdf-writer.
├── veusz-paint-svg/               # Scene -> SVG (string).
├── veusz-paint-py/                # PyO3 module: exposes Painter trait + factory.
│                                  # Compiled as veusz_paint *.so / *.pyd.
└── veusz-paint-wasm/              # cdylib for wasm32-unknown-unknown.
                                   # Exposes scene-render + PNG-blob over wasm-bindgen.
                                   # No PyO3.
```

### 7.1 PyO3 boundary

Python side (`veusz/paint/`, new package):

```python
from veusz_paint import Painter, Path, Paint, Color, BlendMode, FillRule, Quality
# Painter is a Python object that holds a Box<dyn Painter> on the Rust side.
# Created via:
painter = veusz_paint.create("tiny-skia", width=800, height=600, dpi=96)
# or:
painter = veusz_paint.create("vello", width=800, height=600, dpi=96)
# or the QPainter shim:
painter = veusz_paint.create_qt(qpainter)  # wraps an existing QPainter
```

### 7.2 Runtime switch

- `VEUSZ_PAINT_BACKEND={qt|tiny-skia|vello}` environment variable.
- `.vsz` option `Document/paintBackend` (overrides env, settable per-document for
  reproducibility).
- Default: `qt`. Existing users see no change.
- Switch enforced at the point where Veusz constructs the painter for a render —
  `PaintHelper.painter()` in `veusz/document/painthelper.py:178`.

### 7.3 PyO3 hot path: paths and polylines

Bulk numpy arrays of x/y coordinates currently flow into `qtloops.plotPathsToPainter`. We need
the same fast path for the new backends. PyO3 + `numpy` crate gives us zero-copy access to
`np.ndarray` data. The Rust side builds `Path` once and submits to the active Painter. Skip
per-point Python round-trips.

### 7.4 Build & packaging

- Use `maturin` to build the `veusz-paint-py` wheel.
- Add to `pyproject.toml` as optional dependency: `veusz[paint-new] = ["veusz_paint>=0.1"]`.
- Wheels for Linux/macOS/Windows × py3.10/3.11/3.12, plus `wasm32-unknown-unknown` artifact
  for the WASM/web target (built separately, distributed with the `veusz-tauri` frontend).

---

## 8. Vello Backend Specifics

### 8.1 Native

- `wgpu` with default backend (Vulkan/Metal/DX12/GL fallback).
- Headless render path: create an offscreen `wgpu::Texture`, draw scene, read back to CPU,
  emit PNG via `image` crate.
- For interactive paths later: surface integration via `winit` is out of scope here, but the
  scene representation is compatible with eventual interactive embedding (in particular into
  the `veusz-tauri` Tauri shell — see §11).

### 8.2 WebAssembly

- Crate compiles to `wasm32-unknown-unknown`.
- Uses `wgpu` with the `webgpu` feature (WebGPU adapter). Falls back to WebGL2 backend where
  WebGPU is unavailable (Firefox without flag, older Safari).
- Wrapper exposed via `wasm-bindgen` accepts a JSON scene blob and returns a PNG `Uint8Array`
  or paints directly to an `HTMLCanvasElement`.
- Browser harness target: load a `.vsz`, parse it (we need a small JS-side or WASM-side
  parser for the `.vsz` subset — see §8.3), build the scene, render. **No Python, no Qt.**

### 8.3 .vsz parsing in WASM

`.vsz` is Python source. We do not run Python in WASM in this phase. Two options:

1. Pre-bake: server (or `veuszd` daemon) converts `.vsz` → a JSON scene representation. The
   browser only needs the scene + the Vello renderer. Realistic for the embed-in-browser
   strategic test.
2. Future: port `.vsz` evaluation to WASM (Pyodide or a Rust-side subset interpreter).
   Document the path but do not implement in this phase.

We adopt option 1. The Tauri frontend already talks to `veuszd` for everything else; the
strategic test is "browser receives scene, renders without Qt/Python in the rendering path."

### 8.4 Browser embed path (documented, not implemented)

- `veuszd` exposes a `render.scene` RPC that returns the abstract scene as a JSON blob.
- Frontend ships a JS/WASM wrapper around `veusz-paint-vello` that ingests the blob.
- Result: interactive figure pages in the Tauri shell *and* in standalone browser embeds
  (e.g. a `<veusz-figure>` web component).

---

## 9. tiny-skia Backend Specifics

- `tiny_skia::Pixmap` as the surface.
- No GPU. CPU-only, deterministic across machines — this is **what runs in CI**.
- Emits PNG directly via the `png` crate (no `tiny-skia` ↔ Qt round trip).
- PDF/SVG via the shared `veusz-paint-pdf` / `veusz-paint-svg` crates over the abstract scene
  (tiny-skia is irrelevant to those — the scene representation is the input).
- Snapshot tests use this backend's PNG output as the regression baseline once the comparison
  harness reports an acceptable diff against QPainter.

---

## 10. Comparison Harness

Tool: `veusz-render-compare` (Python script under `tests/comparison/`, calling the daemon).

### 10.1 Inputs

- A `.vsz` file.
- A backend set (default: all three).
- Output formats (default: PNG and PDF).

### 10.2 Outputs

Per input, into a results directory:
- `{file}.qt.png`, `{file}.tiny-skia.png`, `{file}.vello.png`
- `{file}.qt.pdf`, `{file}.tiny-skia.pdf`, `{file}.vello.pdf`
- `{file}.qt-vs-tiny-skia.diff.png` — per-pixel diff visualization
- `{file}.qt-vs-vello.diff.png`
- `{file}.tiny-skia-vs-vello.diff.png`
- `{file}.report.json` — per-pair: `pixels_total`, `pixels_diff`, `max_channel_delta`,
  `psnr`, `ssim`, plus a vector-level summary (number of paths in scene, mean glyph-position
  delta in text runs).
- `summary.csv` — one row per (input, backend-pair) for easy filtering.

### 10.3 Per-vector-path diff

In addition to per-pixel raster diff, the harness records each backend's abstract scene to
JSON (path count, glyph count, total path length, text run bounding boxes, transform stack
depth at peak). This gives us **structural** diffs that survive minor anti-aliasing
differences and catch genuine "we drew a different shape" bugs.

### 10.4 Tolerance bands

- **Identical**: PSNR > 50 dB. Reported green.
- **Within tolerance**: PSNR > 35 dB (anti-aliasing, text hinting differences only). Reported
  yellow.
- **Material**: PSNR < 35 dB. Reported red. Must be triaged before backend is declared usable
  for that document class.

### 10.5 CI

tiny-skia × tiny-skia self-comparison verifies determinism. tiny-skia vs Qt comparison drives
the visual regression suite for the 91-file corpus. Any new red row blocks PR merge.

---

## 11. Phased Milestones with Effort Estimates

Engineer-weeks, single contributor. Pad for review/integration.

| # | Phase | Weeks | Deliverable | Definition of Done |
|---|---|---|---|---|
| 1 | Audit + interface + QPainter shim + harness scaffold + xy spike | 1–2 | `qpainter-audit.md` (complete), `veusz-paint-core` crate with `Painter` trait, QPainter Python shim, `veusz-render-compare` skeleton, `xy.py` widget refactored | xy widget renders bit-identical via the shim; comparison tool runs on one input |
| 2 | tiny-skia backend; PDF via pdf-writer; text via Parley+Swash; full harness | 3–6 | tiny-skia produces PNG and PDF for the corpus; comparison reports populated | 80%+ of `tests/selftests/` + `examples/` (excluding 3D) renders within tolerance vs QPainter |
| 3 | Vello backend on native wgpu; shared text + PDF/SVG | 7–10 | Vello produces PNG and PDF natively; harness extended to all three | Vello matches tiny-skia raster within tolerance on 80%+ corpus |
| 4 | Vello on WASM; browser harness; scene JSON over `veuszd` | 11–13 | `.vsz` (via daemon) renders to a `<canvas>` in a headless browser test, no Python/Qt in the render path | One curated `.vsz` renders correctly in headless Chromium via the WASM bundle |
| 5 | Tuning, text parity, edge widgets, sign-off | 14–16 | Side-by-side text reference doc approved; remaining red corpus rows addressed or carved out | All non-3D corpus rows green or yellow; 3D rows skipped with explicit reason |

**3D widgets out of scope** for all phases. Documented in §13 and the corpus filter.

### 11.1 Why xy.py for the spike

The user-suggested `xy` widget — `veusz/widgets/point.py` (`PointPlotter`) — exercises the
broadest set of QPainter operations: paths, fills, strokes, markers (glyphs), text labels,
error bars (lines), and image-based markers. If the abstract interface can handle xy without
exception, it can handle most widgets. Spike output: a refactored `point.py` calling the
abstract interface, rendering identically through the QPainter shim, plus the first
tiny-skia output for that widget.

---

## 12. Test Corpus Strategy

Three tiers, all under `tests/comparison/`:

1. **Smoke** (~10 files): one per major widget family — axis, bar, contour, histogram, image,
   key, polar, ternary, shape, textlabel. Runs on every commit. Targets: identical vs QPainter
   on the QPainter shim path; within tolerance vs QPainter on tiny-skia/Vello.
2. **Corpus** (~80 files): all of `examples/*.vsz` + `tests/selftests/*.vsz` minus 3D minus
   any feature-gated unsupported. Runs on PR and nightly. The 80% target in Phase 2 is
   measured against this set.
3. **Stress** (curated, ~5 files): pathological inputs — 10⁵-point scatter, deeply nested
   clip paths, mixed Latin/CJK/RTL text, huge color tables. Used in Phase 5 tuning.

The corpus filter (which files are skipped because they use 3D / out-of-scope features) lives
in `tests/comparison/manifest.toml` and is itself reviewed during the plan sign-off.

---

## 13. Risks and Mitigations

| # | Risk | Likelihood | Severity | Mitigation | De-risk in week 1? |
|---|---|---|---|---|---|
| R1 | Text rendering differs visibly from Qt (Parley+Swash ≠ Qt's font stack) | Almost certain | High (scientific users notice) | Side-by-side text reference doc; explicit "acceptable difference" sign-off; document fallback to Qt-rendered glyphs-as-paths option | Yes — spike S2 |
| R2 | 3D pipeline (`src/threed/`) is its own engine, not QPainter-routed | N/A — known | N/A | **Out of scope.** Corpus filter skips 3D widgets. Document explicitly so it does not surprise reviewers | Already done in this doc |
| R3 | PDF via `pdf-writer` from a Rust scene is new ground; existing Qt PDF is mature | Medium | High (PDF is Veusz's #1 export) | Compare PDF page-by-page rendered through Ghostscript → PNG against QPainter PNG; build the PDF emitter early (Phase 2), not last | Partially — design spike S3 |
| R4 | Font availability and fallback differ across backends & OSes | High | Medium | Document font resolution model: tiny-skia/Vello use `fontique`; Qt uses Qt's stack. Define a "vendored fonts" set Veusz ships for the new backends to guarantee CI determinism | Yes — spike S2 |
| R5 | QPainter shim has subtle differences (e.g. coordinate rounding, pen-cap behavior) introducing accidental regressions in existing pipeline | Medium | High | Run full existing test suite through the shim *before* refactoring widgets; any diff blocks the shim landing | Yes — spike S1 |
| R6 | WASM + wgpu + WebGPU adapter availability is uneven across browsers | Medium | Medium | Target Chromium + Firefox (WebGL2 fallback) only in Phase 4; document Safari status; do not block on Safari WebGPU | Yes — spike S4 |
| R7 | PyO3 cost on the hot path (batched-geometry calls from `qtloops`) regresses paint speed | Low–Medium | Medium | Zero-copy numpy via `numpy` crate; benchmark in Phase 2 against a fixed `tests/selftests/` subset; stop here unless results require deeper work (perf is not the goal of this phase) | Partial — measure during S1 |
| R8 | Composition modes / blend modes Veusz uses that tiny-skia or Vello cannot replicate | Low (Veusz uses mostly SourceOver) | Low | Audit identifies the set used; document non-portable modes; fall back to SourceOver with a warning | Yes — folded into audit |
| R9 | Recording-paint-engine intercept misses some QPainter calls (because DirectPainter is sometimes used) | Medium | Medium | Static grep cross-checks the dynamic intercept; any method seen by grep but not by intercept is reviewed | Yes — folded into audit |
| R10 | Build complexity: shipping a Rust+PyO3 extension across wheels + a wasm32 cdylib | Medium | Medium | Use `maturin` for wheels; reuse the `veusz-tauri/crates/` Cargo workspace; piggyback on the cross-platform binary release pipeline that already builds `veuszd` | No — Phase 1 setup |

---

## 14. Proposed Spikes (week 1, in parallel)

Each spike is < 3 days and resolves a risk faster than analysis.

- **S1 — RecordPaintEngine instrumentation + JSONL dump.** Add a debug build flag to
  `recordpaintengine.cpp` that writes every PaintElement to a JSONL stream. Run the corpus.
  Produces (a) the dynamic call-count audit, (b) a faithful intermediate representation we
  can immediately feed to a stub tiny-skia backend without touching widget code. Resolves
  R5, R7, R9 simultaneously.

- **S2 — Text rendering reference document.** Pick five representative `.vsz` files containing
  axis labels, mixed-size text, math notation, and non-Latin text. Render text both through
  Qt and through a standalone Parley+Swash test harness. Build a side-by-side PDF.
  **Get human sign-off before Phase 2 starts.** Resolves R1, R4.

- **S3 — pdf-writer "hello scene" spike.** Take a hand-built tiny scene (rectangles, paths,
  one text run) and emit it both via `pdf-writer` and via QPainter→QPrinter. Open both in
  Acrobat/Preview, diff via Ghostscript-rendered PNGs. Confirms `pdf-writer` is sufficient.
  Resolves R3.

- **S4 — Vello WASM Hello World.** Compile Vello to wasm32, render a colored triangle in
  Chromium and Firefox (with WebGL2 fallback). Confirms toolchain works. Resolves R6.

---

## 15. Out of Scope (explicit)

- **Removing Qt.** New backends sit alongside the existing one. Qt removal, if it happens,
  is a downstream consequence.
- **3D widgets** (`Scene3D`, `Graph3D`, `Axis3D`, `Plotters3D`, `Point3D`, `Surface3D`,
  `Function3D`, `Volume3D`). Separate engine in `src/threed/`. Out of scope for all phases.
  Corpus filter excludes them.
- **Replacing the QPainter export pipeline** (`veusz/document/export.py`). The existing
  PDF/SVG/PNG/EMF/EPS export paths from QPainter are untouched.
- **Performance optimization beyond "fast enough to test."** Correctness is the goal of this
  phase. Perf work is a follow-up if results justify it.
- **Pyodide / Python-in-WASM.** Phase 4 uses `veuszd` to produce a JSON scene; the WASM
  bundle only renders. A future phase may evaluate Pyodide.
- **Interactive Vello widget in Veusz GUI.** The native Vello backend renders pages; embedding
  a live Vello canvas as a Qt widget is a follow-up.

---

## 16. Open Questions for Reviewer

1. Default backend in tests once tiny-skia is green — stay on Qt or flip to tiny-skia? Recommend
   staying on Qt to preserve existing test semantics; tiny-skia runs as a parallel CI lane.
2. Vendored font set for backend-portability determinism — adopt DejaVu (Veusz already
   recommends it in docs) or a smaller subset?
3. Phase 4 WASM acceptance criterion: one curated `.vsz` end-to-end, or the smoke tier?
   Recommend one curated `.vsz`; smoke tier in WASM is Phase 5 polish.
