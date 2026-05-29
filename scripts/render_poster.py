#!/usr/bin/env python3
"""Render a ``.vsz`` to a static PNG poster for the web embed (no GPU).

The in-browser ``<veusz-figure>`` is WebGPU-only; on browsers without it (and
during the heavy Pyodide boot) it shows this poster instead of a blank box. We
build the poster by loading the document through the headless daemon
:class:`~veusz.daemon.pyodide_bridge.Bridge` and rendering a PNG. The default
backend is Qt — the reference renderer, which positions rotated/offset text
(axis titles) correctly — so the poster is a clean, accurate figure. When Qt
isn't available (no PyQt6) we fall back to the CPU ``tiny-skia`` backend, which
rasterises the same Scene IR the Vello/WebGPU renderer draws (its title-text
layout is less faithful, but it needs no Qt).

  python scripts/render_poster.py in.vsz -o out.png [--width 700 --height 500 --scale 2]
"""

import argparse
import base64
import os
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('vsz', help='input .vsz document')
    ap.add_argument('-o', '--out', required=True, help='output .png path')
    ap.add_argument('--width', type=int, default=700, help='logical width px')
    ap.add_argument('--height', type=int, default=500, help='logical height px')
    ap.add_argument('--dpi', type=int, default=96)
    ap.add_argument('--page', type=int, default=0)
    # Supersample: render at scale× the pixel size *and* scale× the dpi, which
    # keeps the layout identical but doubles resolution for a crisp poster.
    ap.add_argument('--scale', type=int, default=2)
    # Force a specific backend (default: try qt, then tiny-skia).
    ap.add_argument('--backend', choices=('qt', 'tiny-skia', 'vello'), default=None)
    args = ap.parse_args()

    # Real PyQt6 (if installed) needs an offscreen platform to run headless;
    # the pure-Python qtshim path ignores this. Set before importing veusz.
    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')

    from veusz.daemon.pyodide_bridge import Bridge

    bridge = Bridge()
    opened = bridge.dispatch('file.open', {'path': os.path.abspath(args.vsz)})
    if 'error' in opened:
        sys.exit(f"render_poster: load failed: {opened['error'].get('message')}")

    w, h = args.width * args.scale, args.height * args.scale
    dpi = args.dpi * args.scale

    png = None
    used = None
    errors = []
    backends = (args.backend,) if args.backend else ('qt', 'tiny-skia')
    for backend in backends:
        resp = bridge.dispatch('render.png', {
            'page': args.page, 'w': w, 'h': h, 'dpi': dpi, 'backend': backend})
        if 'result' in resp:
            png = base64.b64decode(resp['result']['png'])
            used = backend
            break
        errors.append(f"{backend}: {resp['error'].get('message')}")
    if png is None:
        sys.exit('render_poster: no usable backend (' + '; '.join(errors) + ')')

    with open(args.out, 'wb') as f:
        f.write(png)
    print(f'render_poster: wrote {args.out} '
          f'({len(png)} bytes, {w}x{h}, {used})')


if __name__ == '__main__':
    main()
