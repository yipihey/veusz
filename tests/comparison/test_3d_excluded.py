"""Test that the comparison harness manifest correctly excludes all 3D
widget documents. The plan (§13 R2 / §15) puts 3D out of scope: the
src/threed/ engine has its own rasterizer and does not flow through
QPainter, so the abstract Painter pipeline can't render it correctly.

This test guards three properties:

  1. Every .vsz file under examples/ or tests/selftests/ that uses a
     3D widget class is matched by the manifest's exclude_globs.
  2. The smoke tier doesn't accidentally pull in a 3D file.
  3. The corpus tier's resolved file list contains no 3D widget files.

A regression here would let a 3D document into the harness, where it
would render through the QPainter pipeline correctly but produce blank
output through tiny-skia / Vello (because Scene3D's draw method
bypasses QPainter), inflating "material" diff counts misleadingly.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

try:
    import tomllib
except ImportError:  # py < 3.11
    import tomli as tomllib  # type: ignore

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MANIFEST = REPO_ROOT / "tests" / "comparison" / "manifest.toml"

# Widget typenames that live in src/threed/ and bypass QPainter.
_THREED_WIDGET_TYPES = {
    "scene3d", "graph3d", "axis3d", "plotters3d", "point3d",
    "surface3d", "function3d", "volume3d", "bar3d",
    "genericplotter3d",  # base class for the per-plot 3D widgets
}


def _files_using_3d() -> list[Path]:
    """Find every .vsz file in the corpus tiers whose script body
    instantiates one of the 3D widget types."""
    pattern = re.compile(
        r"['\"](" + "|".join(_THREED_WIDGET_TYPES) + r")['\"]"
    )
    matches: list[Path] = []
    for glob in ("examples/*.vsz", "tests/selftests/*.vsz"):
        for p in sorted(REPO_ROOT.glob(glob)):
            try:
                body = p.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if pattern.search(body):
                matches.append(p)
    return matches


def _load_manifest() -> dict:
    with open(MANIFEST, "rb") as fp:
        return tomllib.load(fp)


def _resolve_corpus_tier(manifest: dict) -> list[Path]:
    import fnmatch
    include = manifest["corpus"]["include_globs"]
    exclude = manifest["corpus"]["exclude_globs"]
    out: list[Path] = []
    for glob in include:
        for p in sorted(REPO_ROOT.glob(glob)):
            rel = p.relative_to(REPO_ROOT).as_posix()
            if any(fnmatch.fnmatch(rel, ex) for ex in exclude):
                continue
            out.append(p)
    return out


def test_every_3d_file_is_excluded():
    """No `.vsz` whose body instantiates a 3D widget class is allowed
    to flow into the harness's corpus or smoke tiers."""
    manifest = _load_manifest()
    threed_files = _files_using_3d()
    assert threed_files, (
        "expected at least the bundled examples/3d_*.vsz to use 3D "
        "widgets — if all 3D examples were removed, drop this test"
    )

    smoke = {REPO_ROOT / p for p in manifest["smoke"]["files"]}
    leaked_smoke = sorted(set(threed_files) & smoke)
    assert not leaked_smoke, \
        f"3D documents leaked into smoke tier: {leaked_smoke}"

    corpus = set(_resolve_corpus_tier(manifest))
    leaked_corpus = sorted(set(threed_files) & corpus)
    assert not leaked_corpus, \
        f"3D documents leaked into corpus tier: {leaked_corpus}"


def test_threed_widget_typenames_are_complete():
    """If src/threed/ grows a new widget type Veusz exposes, the
    audit list above should grow too — otherwise a new 3D example
    could slip through."""
    # Walk veusz/widgets/ for files whose typename mentions 3d.
    widgets_dir = REPO_ROOT / "veusz" / "widgets"
    if not widgets_dir.exists():
        pytest.skip("veusz/widgets not present (sdist?)")
    discovered = set()
    typename_re = re.compile(r"typename\s*=\s*['\"]([^'\"]+)['\"]")
    for py in sorted(widgets_dir.glob("*3d*.py")) + sorted(widgets_dir.glob("*3D*.py")):
        body = py.read_text(encoding="utf-8", errors="ignore")
        for m in typename_re.finditer(body):
            tn = m.group(1).lower()
            if "3d" in tn:
                discovered.add(tn)
    new = discovered - _THREED_WIDGET_TYPES
    assert not new, (
        f"new 3D widget typenames found that the audit set doesn't cover: "
        f"{sorted(new)}. Add to _THREED_WIDGET_TYPES."
    )


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
