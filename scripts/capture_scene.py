#!/usr/bin/env python3
"""Capture a .vsz to its Scene IR (JSON) at a given pixel size.

Used by ``veusz-tauri/scripts/veusz-embed.mjs --self-contained`` to bake the
scene into a single HTML file. Writes the scene bytes to stdout (or to ``-o``)
so it pipes cleanly into a build script.

  python3 scripts/capture_scene.py path/to/plot.vsz --width 800 --height 600
"""

from __future__ import annotations

import argparse
import os
import sys

# Make `import veusz` work no matter how this script is invoked. Running it by
# absolute path (e.g. from scripts/render_vsz.sh) puts scripts/ on sys.path[0],
# NOT the repo root, so the source `veusz/` package next to it isn't importable
# unless veusz happens to be pip-installed. Add the repo root explicitly.
_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('vsz', help='Veusz document to capture')
    # Width/height default to the document's NATURAL page size (so the scene's
    # aspect ratio matches the .vsz — forcing a mismatched canvas squashes the
    # plot). Override either to crop/letterbox deliberately; resolution is set
    # by --dpi (a 15cm page at 192dpi ≈ 1134px), not by the pixel size.
    ap.add_argument('--width', type=int, default=None,
                    help='Canvas width in px (default: natural page size at --dpi)')
    ap.add_argument('--height', type=int, default=None,
                    help='Canvas height in px (default: natural page size at --dpi)')
    ap.add_argument('--dpi', type=int, default=96)
    ap.add_argument('--page', type=int, default=0)
    ap.add_argument('-o', '--output', default='-',
                    help="Output path (default '-': stdout)")
    ap.add_argument('--print-size', action='store_true',
                    help='Print the captured "WIDTH HEIGHT" (px) to stderr — '
                         'feed it to `veusz-render --width W --height H` so the '
                         'raster/vector output matches the scene exactly.')
    args = ap.parse_args()

    # Keep stdout pristine — it carries the scene bytes (when -o '-') and the
    # --print-size value. veusz emits stray status prints (e.g. the stylesheet
    # default-font notice) to stdout; route them to stderr for the duration of
    # the import/load/capture, then restore the real stdout for output.
    _real_stdout = sys.stdout
    sys.stdout = sys.stderr

    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    # Prefer a real Qt (best fidelity for some rotated/offset text), but fall
    # back cleanly to the pure-Python qtshim when PyQt6 is absent — the whole
    # point of the Rust backends is that capture works with no Qt installed
    # (headless CI, a laptop without PyQt6, Pyodide). qtall already swaps itself
    # for qtshim on a failed PyQt6 import; we just skip the QApplication setup.
    try:
        from PyQt6.QtWidgets import QApplication
        globals()['_app'] = QApplication.instance() or QApplication(sys.argv)
    except ImportError:
        pass

    # Force text measurement to use the SAME font the in-browser Vello/WASM
    # renderer draws with (LiberationSans-Regular via fonttools). Otherwise
    # textrender lays out positions for Qt's system font and the renderer
    # uses a different one — italic runs (axis labels' "x" / "y") end up
    # overlapping or gapping with the surrounding roman text. The Pyodide
    # path already does this; here we wire it for the desktop capture too,
    # BEFORE any veusz module captures a reference to qt.QFontMetricsF
    # (textrender.py:42 does ``FontMetrics = qt.QFontMetricsF`` at import).
    # With the shim active qtall already *is* qtshim, so this is a no-op there.
    from veusz import qtall as _qt
    from veusz import qtshim as _qtshim
    _qt.QFontMetricsF = _qtshim.QFontMetricsF
    _qt.QFontMetrics = _qtshim.QFontMetrics

    import veusz.widgets  # noqa: F401  — registers widget types
    import veusz.dataimport  # noqa: F401
    from veusz import document
    from veusz.paint.qt_capture import capture_document_scene

    doc = document.Document()
    doc.load(args.vsz)

    dpi = (float(args.dpi), float(args.dpi))
    # Resolve the page size to use. Default: the document's natural page
    # dimensions converted to px at --dpi (matches the .vsz aspect ratio).
    if args.width and args.height:
        pagesize_px = (args.width, args.height)
    else:
        from veusz.document.painthelper import PaintHelper
        pages = [c for c in doc.basewidget.children if c.typename == 'page']
        if not pages:
            sys.exit('capture_scene: document has no pages')
        tmp = PaintHelper(doc, (800, 600), dpi=dpi)
        nat_w = int(pages[args.page].settings.get('width').convert(tmp))
        nat_h = int(pages[args.page].settings.get('height').convert(tmp))
        pagesize_px = (max(args.width or nat_w, 1), max(args.height or nat_h, 1))

    scene = capture_document_scene(
        doc, page=args.page, pagesize_px=pagesize_px, dpi=dpi)

    # Restore the real stdout for the actual output (scene bytes / size).
    sys.stdout = _real_stdout

    if args.print_size:
        # Clean channel: stdout (scene bytes go to -o here). Lets a caller do
        #   SIZE=$(capture_scene.py fig.vsz --dpi 192 -o s.json --print-size)
        #   veusz-render s.json --width ${SIZE% *} --height ${SIZE#* } -o fig.svg
        if args.output == '-':
            sys.exit('capture_scene: --print-size needs -o FILE (stdout carries the scene)')
        print(f'{pagesize_px[0]} {pagesize_px[1]}')
    data = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    if args.output == '-':
        sys.stdout.buffer.write(data)
    else:
        with open(args.output, 'wb') as f:
            f.write(data)


if __name__ == '__main__':
    main()
