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


def render_one(vsz: Path, backend: str, out_dir: Path, dpi: int = 96) -> RenderResult:
    """Render a single ``.vsz`` through ``backend``, write PNG and PDF."""
    import time

    os.environ["VEUSZ_PAINT_BACKEND"] = backend
    result = RenderResult(backend=backend, vsz=vsz)
    t0 = time.time()
    try:
        # Defer the Veusz import: it requires Qt to be importable, and we
        # want to fail loudly only when actually rendering.
        from veusz import document
        from veusz.document import export

        doc = document.Document()
        doc.load(str(vsz))

        png_path = out_dir / f"{vsz.stem}.{backend}.png"
        pdf_path = out_dir / f"{vsz.stem}.{backend}.pdf"

        # Use AsyncExport's synchronous path via ExportBitmapRunnable/
        # ExportPDFRunnable rather than the threaded queue.
        runner = export.AsyncExport(doc, bitmapdpi=dpi)
        runner.add(str(png_path), [0])
        runner.add(str(pdf_path), [0])
        runner.finish()

        result.png = png_path if png_path.exists() else None
        result.pdf = pdf_path if pdf_path.exists() else None
    except Exception as exc:
        result.error = f"{type(exc).__name__}: {exc}"
    finally:
        result.elapsed_s = time.time() - t0
    return result


def run(inputs: List[Path], backends: List[str], out_dir: Path,
        dpi: int = 96) -> CompareReport:
    out_dir.mkdir(parents=True, exist_ok=True)
    report = CompareReport(inputs=inputs)
    for vsz in inputs:
        for backend in backends:
            res = render_one(vsz, backend, out_dir, dpi=dpi)
            report.results.append(res)
            status = "ok" if res.error is None else f"FAIL ({res.error})"
            print(f"  {backend:10s}  {vsz.name:30s}  {res.elapsed_s:6.2f}s  {status}")
    # TODO Phase 2: populate report.diffs with PSNR/SSIM once we have >1
    # backend producing output.
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
    run(inputs, backends, out_dir, dpi=args.dpi)
    return 0


if __name__ == "__main__":
    sys.exit(main())
