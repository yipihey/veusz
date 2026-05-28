"""Feature-complete parity checks for the scene paint backends.

The parity bar for this stage is *feature completeness* — "nothing
missing" — not pixel fidelity (font engines differ across backends, so
pixel-exact text is out of scope). These tests assert, for a
representative slice of the example corpus:

  1. The captured Scene contains the op categories the document implies
     (axis labels -> DrawText; axis/tick/grid lines -> StrokePath; bars /
     markers / fills -> FillPath). This directly guards the gaps that were
     closed in this stage: the C++ ``qtloops`` batches (ticks, error bars,
     gridlines, markers) and ``drawText`` capture.
  2. Every scene backend (tiny-skia, vello) rasterises each example to a
     valid, non-trivially-inked PNG — catching gross capture omissions.

Skips cleanly without PyQt6 / the Rust extension so frontend-only CI
stays green.
"""

from __future__ import annotations

import io
import json
from pathlib import Path as FsPath

import pytest

pytest.importorskip("PyQt6")
ext = pytest.importorskip("veusz.paint._paint_ext")
pytest.importorskip("PIL")
import numpy as np  # noqa: E402
from PIL import Image as PilImage  # noqa: E402

REPO = FsPath(__file__).resolve().parents[2]

# Representative examples exercising distinct paint paths: bars + error
# bars + legend (barplots), line + markers + fit (sin), scatter markers +
# colorbar + background (coloredpoints), analytic curves (functions),
# non-orthogonal axes (polar).
EXAMPLES = ["barplots", "sin", "coloredpoints", "functions", "polar"]

PAGE = (700, 500)
DPI = (96.0, 96.0)


@pytest.fixture(scope="module")
def _qt_app():
    import os
    import sys
    os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
    from PyQt6 import QtWidgets
    app = QtWidgets.QApplication.instance() or QtWidgets.QApplication(
        sys.argv if sys.argv else [""])
    import veusz.widgets  # noqa: F401  register widget classes
    import veusz.dataimport  # noqa: F401  register importers
    return app


def _load(name: str):
    from veusz import document as vzdoc
    doc = vzdoc.Document()
    doc.load(str(REPO / "examples" / f"{name}.vsz"))
    return doc


def _capture(doc) -> bytes:
    from veusz.paint.qt_capture import capture_document_scene
    return capture_document_scene(doc, 0, pagesize_px=PAGE, dpi=DPI)


def _op_kinds(scene_json: bytes) -> set:
    kinds = set()
    for op in json.loads(scene_json)["ops"]:
        kinds.add(op if isinstance(op, str) else next(iter(op)))
    return kinds


def _ink_fraction(png_bytes: bytes) -> float:
    """Fraction of pixels that carry drawn ink — opaque and not near-white.

    Background is transparent here, so this measures actual content
    (bars/lines/text/markers) and ignores the empty page."""
    arr = np.asarray(PilImage.open(io.BytesIO(png_bytes)).convert("RGBA"))
    alpha = arr[..., 3]
    rgb = arr[..., :3].astype(int)
    near_white = (rgb > 245).all(axis=-1)
    ink = (alpha > 8) & (~near_white)
    return float(ink.mean())


@pytest.mark.parametrize("name", EXAMPLES)
def test_scene_has_expected_op_categories(_qt_app, name):
    kinds = _op_kinds(_capture(_load(name)))
    # Each example is a graph: axis labels (text), axis/tick/grid lines
    # (stroke) and at least one fill (bars / markers / background) must all
    # be present in the captured scene.
    assert "DrawText" in kinds, f"{name}: no text captured (drawText gap)"
    assert "StrokePath" in kinds, f"{name}: no stroke geometry (qtloops gap)"
    assert "FillPath" in kinds, f"{name}: no fills captured"


@pytest.mark.parametrize("name", EXAMPLES)
@pytest.mark.parametrize("backend", ["tiny-skia", "vello"])
def test_backend_renders_non_empty(_qt_app, name, backend):
    if backend not in ext.available_backends():
        pytest.skip(f"{backend} backend unavailable in this runtime")
    scene = _capture(_load(name))
    png = ext.render_scene_to_png(scene, PAGE[0], PAGE[1],
                                  (0.0, 0.0, 0.0, 0.0), backend)
    assert png[:8] == b"\x89PNG\r\n\x1a\n"
    frac = _ink_fraction(png)
    assert frac > 0.01, f"{name}/{backend}: raster nearly empty (ink={frac:.4f})"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
