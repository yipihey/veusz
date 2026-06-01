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


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('vsz', help='Veusz document to capture')
    ap.add_argument('--width', type=int, default=800)
    ap.add_argument('--height', type=int, default=600)
    ap.add_argument('--dpi', type=int, default=96)
    ap.add_argument('--page', type=int, default=0)
    ap.add_argument('-o', '--output', default='-',
                    help="Output path (default '-': stdout)")
    args = ap.parse_args()

    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    # QFontDatabase needs a live QGuiApplication; create one BEFORE importing
    # veusz (whose stylesheet bootstrap touches the font database at import).
    # Keep the QApplication on a module-global so it isn't garbage-collected.
    from PyQt6.QtWidgets import QApplication
    globals()['_app'] = QApplication.instance() or QApplication(sys.argv)

    # Force text measurement to use the SAME font the in-browser Vello/WASM
    # renderer draws with (LiberationSans-Regular via fonttools). Otherwise
    # textrender lays out positions for Qt's system font and the renderer
    # uses a different one — italic runs (axis labels' "x" / "y") end up
    # overlapping or gapping with the surrounding roman text. The Pyodide
    # path already does this; here we wire it for the desktop capture too,
    # BEFORE any veusz module captures a reference to qt.QFontMetricsF
    # (textrender.py:42 does ``FontMetrics = qt.QFontMetricsF`` at import).
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
    scene = capture_document_scene(
        doc, page=args.page,
        pagesize_px=(args.width, args.height),
        dpi=(float(args.dpi), float(args.dpi)))
    data = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    if args.output == '-':
        sys.stdout.buffer.write(data)
    else:
        with open(args.output, 'wb') as f:
            f.write(data)


if __name__ == '__main__':
    main()
