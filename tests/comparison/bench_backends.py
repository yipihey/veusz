"""Benchmark the qt / tiny-skia / vello paint backends on large scatter plots.

Measures the daemon render path at increasing point counts and breaks the
non-qt backends into their two phases:
  - capture: build the Scene IR in Python (capture_document_scene). Shared by
    tiny-skia and vello; this is where batched markers (SceneOp::DrawMarkers)
    pay off — a scatter is one op + position arrays, not N per-point ops.
  - raster:  rasterise the Scene via the Rust extension (CPU tiny-skia / GPU
    vello), returning PNG bytes.
The `sceneMB` column is the serialized Scene size — the number that decides
whether a dataset is shippable to the browser-WASM renderer.

Run:
    QT_QPA_PLATFORM=offscreen python tests/comparison/bench_backends.py
    QT_QPA_PLATFORM=offscreen python tests/comparison/bench_backends.py 1000 100000 1000000

Requires PyQt6 + the built `veusz.paint._paint_ext` extension
(scripts/build_paint_ext.sh); exits cleanly if either is missing.
"""
import os
import sys
import time

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

try:
    from PyQt6 import QtWidgets
except ImportError:
    print("PyQt6 not available; skipping benchmark.")
    raise SystemExit(0)

import numpy as np

try:
    from veusz.paint import _paint_ext
except ImportError:
    print("veusz.paint._paint_ext not built (scripts/build_paint_ext.sh); skipping.")
    raise SystemExit(0)

import veusz.widgets  # noqa: F401  register widget classes
import veusz.dataimport  # noqa: F401
from veusz import document as vzdoc
from veusz.document.commandinterface import CommandInterface
from veusz.document import painthelper
from veusz.paint.qt_capture import capture_document_scene
from veusz import qtall as qt

W, H, DPI = 1000, 800, 96
BG = (1.0, 1.0, 1.0, 1.0)

_app = QtWidgets.QApplication.instance() or QtWidgets.QApplication([""])


def build_doc(n, seed=0):
    rng = np.random.default_rng(seed)
    doc = vzdoc.Document()
    ci = CommandInterface(doc)
    ci.SetData("x", rng.standard_normal(n))
    ci.SetData("y", rng.standard_normal(n))
    ci.Add("page", name="page1")
    ci.To("/page1")
    ci.Add("graph", name="graph1", autoadd=False)
    ci.To("graph1")
    ci.Add("axis", name="x")
    ci.Add("axis", name="y", direction="vertical")
    ci.Add("xy", name="pts")
    ci.To("pts")
    ci.Set("xData", "x")
    ci.Set("yData", "y")
    ci.Set("marker", "circle")
    ci.Set("markerSize", "2pt")
    ci.Set("PlotLine/hide", True)
    return doc


def best(fn, iters):
    return min((_timed(fn) for _ in range(iters)))


def _timed(fn):
    t0 = time.perf_counter()
    fn()
    return time.perf_counter() - t0


def time_qt(doc, iters):
    def once():
        ph = painthelper.PaintHelper(doc, (W, H), dpi=(DPI, DPI))
        doc.paintTo(ph, 0)
        img = qt.QImage(W, H, qt.QImage.Format.Format_ARGB32_Premultiplied)
        img.fill(0)
        p = qt.QPainter(img)
        ph.renderToPainter(p)
        p.end()
        buf = qt.QBuffer()
        buf.open(qt.QIODevice.OpenModeFlag.WriteOnly)
        img.save(buf, "PNG")
    return best(once, iters)


def main(argv):
    counts = [int(a) for a in argv] or [1_000, 10_000, 50_000, 100_000, 200_000]

    # Warm vello (device + pipeline compile) and tiny-skia.
    warm = capture_document_scene(build_doc(100), 0, pagesize_px=(W, H), dpi=(DPI, DPI))
    for be in ("vello", "tiny-skia"):
        try:
            _paint_ext.render_scene_to_png(warm, W, H, BG, be)
        except Exception as e:  # vello may be unavailable on a headless box
            print(f"(warm {be} failed: {e})")

    avail = set(_paint_ext.available_backends())
    print(f"backends available: {sorted(avail)}  page={W}x{H}@{DPI}dpi")
    print(f"{'N':>9} | {'qt':>8} | {'capture':>8} | {'tskia-r':>8} | {'vello-r':>8} "
          f"| {'vello-tot':>9} | {'sceneMB':>7}")
    print("-" * 80)
    for n in counts:
        doc = build_doc(n)
        iters = 3 if n <= 50_000 else 2
        qt_t = time_qt(doc, iters)
        cap_t = best(lambda: capture_document_scene(
            doc, 0, pagesize_px=(W, H), dpi=(DPI, DPI)), iters)
        scene = capture_document_scene(doc, 0, pagesize_px=(W, H), dpi=(DPI, DPI))
        ts_t = best(lambda: _paint_ext.render_scene_to_png(scene, W, H, BG, "tiny-skia"),
                    iters) if "tiny-skia" in avail else float("nan")
        vl_t = best(lambda: _paint_ext.render_scene_to_png(scene, W, H, BG, "vello"),
                    iters) if "vello" in avail else float("nan")
        print(f"{n:>9} | {qt_t*1e3:>7.0f}m | {cap_t*1e3:>7.0f}m | {ts_t*1e3:>7.0f}m "
              f"| {vl_t*1e3:>7.0f}m | {(cap_t+vl_t)*1e3:>8.0f}m | {len(scene)/1e6:>6.1f}")


if __name__ == "__main__":
    main(sys.argv[1:])
