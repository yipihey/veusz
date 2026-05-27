"""veusz-render-compare — comparison harness for parallel paint backends.

Takes a ``.vsz`` file, renders it through each enabled backend to PNG and PDF,
emits per-pixel diff visualizations and a JSON report. See
``docs/parallel-paint-backends-plan.md`` §10 for the full spec.

This is the **scaffold**. Phase 2 fills in the diff math (PSNR/SSIM) and the
per-vector-path diff once a tiny-skia backend exists. Right now the harness
exercises one backend at a time — useful immediately for the
``VEUSZ_PAINT_TRACE`` dynamic-pass audit (spike S1) because it gives us a
consistent way to run the corpus headlessly.

Usage
-----
    python tests/comparison/veusz_render_compare.py \
        --backends qt \
        --out /tmp/render-compare \
        examples/spectrum.vsz

    # full smoke set, all enabled backends from manifest:
    python tests/comparison/veusz_render_compare.py --manifest --smoke
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

try:
    import tomllib  # py3.11+
except ImportError:  # pragma: no cover
    import tomli as tomllib  # type: ignore

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANIFEST = REPO_ROOT / "tests" / "comparison" / "manifest.toml"


@dataclass
class RenderResult:
    backend: str
    vsz: Path
    png: Optional[Path] = None
    pdf: Optional[Path] = None
    error: Optional[str] = None
    elapsed_s: float = 0.0


@dataclass
class CompareReport:
    inputs: List[Path] = field(default_factory=list)
    results: List[RenderResult] = field(default_factory=list)
    diffs: List[dict] = field(default_factory=list)  # populated once we have >1 backend

    def to_dict(self) -> dict:
        return {
            "inputs": [str(p) for p in self.inputs],
            "results": [r.__dict__ for r in self.results],
            "diffs": self.diffs,
        }


def load_manifest() -> dict:
    with open(MANIFEST, "rb") as fp:
        return tomllib.load(fp)


def gather_corpus(manifest: dict, tier: str) -> List[Path]:
    if tier == "smoke":
        return [REPO_ROOT / p for p in manifest["smoke"]["files"]]
    if tier == "corpus":
        import fnmatch
        include = manifest["corpus"]["include_globs"]
        exclude = manifest["corpus"]["exclude_globs"]
        out: List[Path] = []
        for glob in include:
            for p in sorted(REPO_ROOT.glob(glob)):
                rel = p.relative_to(REPO_ROOT).as_posix()
                if any(fnmatch.fnmatch(rel, ex) for ex in exclude):
                    continue
                out.append(p)
        return out
    if tier == "stress":
        return [REPO_ROOT / p for p in manifest["stress"].get("files", [])]
    raise ValueError(f"unknown tier {tier!r}")


_VEUSZ_REGISTERED = False


def _ensure_veusz_registered() -> None:
    """Veusz registers its widget classes and importers via import-time
    side effects. Make sure we've imported the right subpackages before
    Document.load tries to instantiate anything — otherwise widgetfactory
    raises KeyError on the first widget type it sees."""
    global _VEUSZ_REGISTERED
    if _VEUSZ_REGISTERED:
        return
    os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
    # Bootstrap the scene-trace env var BEFORE any Qt paint code runs.
    # The C++ recordpaint engine caches the env var on first paint call;
    # we need our path established before that.
    try:
        from veusz.paint.scene_from_trace import _bootstrap_trace_path
        _bootstrap_trace_path()
    except ImportError:
        pass
    # A QApplication must exist before any QPainter-using code runs.
    from PyQt6 import QtWidgets  # noqa: F401
    import sys as _sys
    if QtWidgets.QApplication.instance() is None:
        # The reference must be kept alive — store on the module.
        global _veusz_app  # noqa: PLW0603
        _veusz_app = QtWidgets.QApplication(_sys.argv)
    import veusz.widgets        # noqa: F401  registers widget classes
    import veusz.dataimport     # noqa: F401  registers data importers
    _VEUSZ_REGISTERED = True


def _gc_settle() -> None:
    """Force a full GC cycle. The harness's render order (qt -> tiny-skia
    -> vello, repeated per .vsz) interacts with the C++ recordpaint trace
    file via offset semantics: a previous render's QPainter::end() may not
    have fired its Restore op into the file by the time the next render
    snapshots the file offset, leading to a slice that's structurally
    unbalanced. Forcing GC at render boundaries eliminates this race."""
    import gc
    # Two passes — first one frees lingering Python wrappers, second one
    # any cyclic refs they revealed. The QPainter -> RecordPaintDevice
    # -> RecordPaintEngine graph has occasional cycles via the engine's
    # device backpointer.
    gc.collect()
    gc.collect()


def render_one(vsz: Path, backend: str, out_dir: Path, dpi: int = 96,
               keep_scene: bool = False) -> RenderResult:
    """Render a single ``.vsz`` through ``backend``, write PNG and PDF.

    Dispatches by backend:

    * ``qt`` — Veusz's existing ``AsyncExport`` (PDF via QPrinter, PNG via
      QImage). Bit-identical to current Veusz output.
    * ``tiny-skia`` — paint widgets into a ``SceneCapturingPainter`` (no
      widget code changes), then ship the recorded scene to the Rust
      ``_paint_ext`` extension for PNG + PDF emission.
    * ``vello`` — not implemented yet; returns an error.

    ``keep_scene`` writes the captured scene JSON next to the PNG / PDF for
    debugging.
    """
    import time

    os.environ["VEUSZ_PAINT_BACKEND"] = backend
    result = RenderResult(backend=backend, vsz=vsz)
    t0 = time.time()
    _gc_settle()  # see _gc_settle's docstring
    try:
        if backend == "qt":
            _render_qt(vsz, out_dir, dpi, result)
        elif backend in ("tiny-skia", "vello"):
            _render_scene_backend(vsz, out_dir, dpi, result, keep_scene=keep_scene)
        else:
            result.error = f"unknown backend {backend!r}"
    except Exception as exc:
        result.error = f"{type(exc).__name__}: {exc}"
    finally:
        _gc_settle()
        result.elapsed_s = time.time() - t0
    return result


def _render_qt(vsz: Path, out_dir: Path, dpi: int, result: RenderResult) -> None:
    """Existing Veusz export path via AsyncExport."""
    _ensure_veusz_registered()
    from veusz import document
    from veusz.document import export

    doc = document.Document()
    doc.load(str(vsz))

    png_path = out_dir / f"{vsz.stem}.{result.backend}.png"
    pdf_path = out_dir / f"{vsz.stem}.{result.backend}.pdf"

    runner = export.AsyncExport(doc, bitmapdpi=dpi)
    runner.add(str(png_path), [0])
    runner.add(str(pdf_path), [0])
    runner.finish()

    result.png = png_path if png_path.exists() else None
    result.pdf = pdf_path if pdf_path.exists() else None


def _render_scene_backend(vsz: Path, out_dir: Path, dpi: int, result: RenderResult,
                           *, keep_scene: bool = False) -> None:
    """Capture widget paint as a Scene, render via the named Scene backend.

    Both ``tiny-skia`` and ``vello`` go through the same pipeline:
    :func:`veusz.paint.qt_capture.capture_document_scene` drives Veusz's
    PaintHelper through a SceneCapturingPainter (no widget code changes),
    then ships the recorded Scene to the Rust ``_paint_ext`` extension.

    PDF emission is currently shared (vector format, raster-backend-agnostic).
    """
    _ensure_veusz_registered()
    from veusz import document
    # Prefer the C++ recordpaint scene-trace channel: it sees QPainter
    # calls originating from qtloops C++ helpers, which the Python-side
    # SceneCapturingPainter cannot intercept. Falls back to the Python
    # capture path if the C++ scene channel isn't available.
    try:
        from veusz.paint.scene_from_trace import capture_document_scene_via_trace as _capture
        _via_trace = True
    except ImportError:
        from veusz.paint.qt_capture import capture_document_scene as _capture
        _via_trace = False
    try:
        from veusz.paint import _paint_ext  # type: ignore
    except ImportError:
        result.error = (f"{result.backend} backend requires "
                        "veusz.paint._paint_ext; build with "
                        "scripts/build_paint_ext.sh")
        return

    doc = document.Document()
    doc.load(str(vsz))

    # Honor an explicit Document/paintBackend setting if the .vsz pins
    # one — overrides the CLI/manifest backend selection. Lets users
    # save a backend choice into the document (plan §7.2). "auto" or
    # missing setting falls through to the harness's chosen backend.
    try:
        pinned = doc.basewidget.settings.get('paintBackend').val
        if pinned and pinned != 'auto' and pinned != result.backend:
            result.backend = pinned
    except (AttributeError, KeyError, ValueError):
        pass

    scene_json = _capture(doc, page=0)
    page_w, page_h = _page_pixel_size(doc, page=0, dpi=dpi)

    png_path = out_dir / f"{vsz.stem}.{result.backend}.png"
    pdf_path = out_dir / f"{vsz.stem}.{result.backend}.pdf"

    # PNG: transparent background, matching Veusz's default Qt-side PNG
    # export (export.py:117). Comparing white-on-white to transparent
    # background otherwise dominates the diff with structural-difference
    # noise.
    png_bytes = _paint_ext.render_scene_to_png(
        scene_json, page_w, page_h, (0.0, 0.0, 0.0, 0.0), result.backend)
    png_path.write_bytes(png_bytes)
    result.png = png_path

    # PDF is vector — always emitted via pdf-writer, backend-agnostic.
    # PDFs are opaque white (matching Qt's QPrinter default), so background
    # stays (1, 1, 1, 1) here.
    page_w_pt = page_w * 72.0 / dpi
    page_h_pt = page_h * 72.0 / dpi
    pdf_bytes = _paint_ext.render_scene_to_pdf_bytes(
        scene_json, page_w_pt, page_h_pt, (1.0, 1.0, 1.0, 1.0), "tiny-skia")
    pdf_path.write_bytes(pdf_bytes)
    result.pdf = pdf_path

    if keep_scene:
        scene_path = out_dir / f"{vsz.stem}.{result.backend}.scene.json"
        scene_path.write_bytes(scene_json)


def _page_pixel_size(doc, page: int, dpi: int) -> "tuple[int, int]":
    """Best-effort page-pixel-size lookup. Mirrors what Veusz's PaintHelper
    picks up: page width/height are DistancePhysical settings, converted
    to pixels through a PaintHelper at the requested DPI."""
    pages = [c for c in doc.basewidget.children if c.typename == "page"]
    if not pages:
        return (int(8 * dpi), int(6 * dpi))  # 8x6 inch default
    pw = pages[page]
    try:
        from veusz.document.painthelper import PaintHelper
        # Sacrificial helper just for unit conversion; the actual paint
        # helper is built inside capture_document_scene.
        ph = PaintHelper(doc, (int(8 * dpi), int(6 * dpi)), dpi=(dpi, dpi))
        w = pw.settings.get("width").convert(ph)
        h = pw.settings.get("height").convert(ph)
        return int(w), int(h)
    except Exception:
        return (int(8 * dpi), int(6 * dpi))


def render_scene_fixture(scene_json: bytes, stem: str, backend: str,
                         out_dir: Path, width_px: int, height_px: int,
                         dpi: int = 96) -> RenderResult:
    """Render a pre-recorded scene fixture through ``backend``.

    Accepts ``tiny-skia`` or ``vello``. Lets CI exercise the rendering
    pipeline on captured-once scene JSON without needing PyQt6 or a real
    Veusz document. Fixtures live in ``tests/comparison/fixtures/`` and
    are produced by running the harness against a real .vsz with
    ``--keep-scene``.
    """
    import time

    result = RenderResult(backend=backend, vsz=Path(f"<fixture:{stem}>"))
    t0 = time.time()
    try:
        if backend not in ("tiny-skia", "vello"):
            result.error = (f"render_scene_fixture supports tiny-skia and "
                            f"vello, got {backend!r}")
            return result
        from veusz.paint import _paint_ext  # type: ignore

        png_bytes = _paint_ext.render_scene_to_png(
            scene_json, width_px, height_px, (1.0, 1.0, 1.0, 1.0), backend)
        png_path = out_dir / f"{stem}.{backend}.png"
        png_path.write_bytes(png_bytes)
        result.png = png_path

        # PDF is always emitted via pdf-writer (vector); backend choice
        # is irrelevant to the PDF column.
        page_w_pt = width_px * 72.0 / dpi
        page_h_pt = height_px * 72.0 / dpi
        pdf_bytes = _paint_ext.render_scene_to_pdf_bytes(
            scene_json, page_w_pt, page_h_pt, (1.0, 1.0, 1.0, 1.0), "tiny-skia")
        pdf_path = out_dir / f"{stem}.{backend}.pdf"
        pdf_path.write_bytes(pdf_bytes)
        result.pdf = pdf_path
    except Exception as exc:
        result.error = f"{type(exc).__name__}: {exc}"
    finally:
        result.elapsed_s = time.time() - t0
    return result


def run(inputs: List[Path], backends: List[str], out_dir: Path,
        dpi: int = 96, identical_db: float = 50.0,
        within_db: float = 35.0,
        keep_scene: bool = False) -> CompareReport:
    out_dir.mkdir(parents=True, exist_ok=True)
    report = CompareReport(inputs=inputs)
    for vsz in inputs:
        for backend in backends:
            res = render_one(vsz, backend, out_dir, dpi=dpi,
                             keep_scene=keep_scene)
            report.results.append(res)
            status = "ok" if res.error is None else f"FAIL ({res.error})"
            print(f"  {backend:10s}  {vsz.name:30s}  {res.elapsed_s:6.2f}s  {status}")

    # Diff math runs when >1 backend produced PNGs in this directory.
    if len(backends) > 1:
        try:
            from diff import render_compare_pairs, pdf_compare_pairs
        except ImportError:
            import sys as _sys
            _sys.path.insert(0, str(Path(__file__).parent))
            from diff import render_compare_pairs, pdf_compare_pairs
        diffs = render_compare_pairs(out_dir, backends,
                                     identical_db=identical_db,
                                     within_db=within_db)
        report.diffs = [d for stem_diffs in diffs.values() for d in stem_diffs]
        bands = [d["band"] for d in report.diffs]
        print(f"\nPNG diff summary: "
              f"identical={bands.count('identical')} "
              f"within={bands.count('within')} "
              f"material={bands.count('material')} "
              f"unknown={bands.count('unknown')}")

        # PDF diffs are rasterised through Ghostscript at the same dpi.
        # Stored alongside PNG diffs but tagged so they can be filtered.
        pdf_diffs = pdf_compare_pairs(out_dir, backends,
                                       identical_db=identical_db,
                                       within_db=within_db,
                                       dpi=dpi)
        flat = [d for stem_diffs in pdf_diffs.values() for d in stem_diffs]
        for d in flat:
            d["kind"] = "pdf"
        for d in report.diffs:
            d["kind"] = "png"
        report.diffs += flat
        pbands = [d["band"] for d in flat]
        if flat:
            print(f"PDF diff summary: "
                  f"identical={pbands.count('identical')} "
                  f"within={pbands.count('within')} "
                  f"material={pbands.count('material')} "
                  f"unknown={pbands.count('unknown')}")

    (out_dir / "report.json").write_text(json.dumps(report.to_dict(), indent=2, default=str))
    return report


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("vsz", nargs="*", type=Path, help="explicit .vsz files (overrides --manifest)")
    p.add_argument("--manifest", action="store_true", help="use manifest.toml corpus")
    p.add_argument("--smoke", action="store_true", help="manifest mode: smoke tier")
    p.add_argument("--corpus", action="store_true", help="manifest mode: full corpus tier")
    p.add_argument("--backends", default=None,
                   help="comma-separated subset of qt,tiny-skia,vello")
    p.add_argument("--out", default=None, help="output dir (default: temp dir)")
    p.add_argument("--dpi", type=int, default=96)
    p.add_argument("--keep-scene", action="store_true",
                   help="for tiny-skia: also write the captured scene JSON")
    args = p.parse_args(argv)

    manifest = load_manifest()
    backends = (args.backends.split(",") if args.backends
                else manifest["backends"]["enabled"])

    if args.vsz:
        inputs = args.vsz
    elif args.manifest:
        tier = "smoke" if args.smoke else ("corpus" if args.corpus else "smoke")
        inputs = gather_corpus(manifest, tier)
    else:
        p.print_help()
        return 2

    out_dir = Path(args.out) if args.out else Path(tempfile.mkdtemp(prefix="veusz-cmp-"))
    print(f"writing to {out_dir}")
    print(f"backends: {backends}")
    print(f"inputs: {len(inputs)}")
    tol = manifest["tolerance"]
    run(inputs, backends, out_dir, dpi=args.dpi,
        identical_db=tol["identical"], within_db=tol["within"],
        keep_scene=args.keep_scene)
    return 0


if __name__ == "__main__":
    sys.exit(main())
