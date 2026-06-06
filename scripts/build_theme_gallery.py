#!/usr/bin/env python
"""Build a self-contained HTML gallery showing one complex figure rendered in
every document theme we ship (see veusz/daemon/handlers/_themes.py).

Each theme is applied exactly the way the ``doc.apply_theme`` RPC does — the
same setting batch + foreground/background custom colours — then the document
is exported to SVG (Qt engine, text as vector paths, so the page is fully
self-contained and needs no fonts/JS/daemon to view).

Run with a Qt-capable Veusz (the .venv here):

    QT_QPA_PLATFORM=offscreen .venv/bin/python scripts/build_theme_gallery.py \
        veusz-tauri/example/theme-gallery.html

The output is a single HTML file safe to publish on GitHub Pages.
"""

from __future__ import annotations

import html
import math
import os
import re
import sys
import tempfile

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')

import veusz.qtall as qt  # noqa: E402

_app = qt.QApplication.instance() or qt.QApplication(sys.argv or [''])

import veusz.widgets  # noqa: E402,F401  (registers widget types)
import veusz.document as document  # noqa: E402
from veusz.document import operations  # noqa: E402
from veusz.document.commandinterface import CommandInterface  # noqa: E402
from veusz.daemon.handlers import _themes  # noqa: E402


def build_figure(ci: CommandInterface) -> None:
    """A deliberately busy figure: a 1×2 grid of graphs that exercises the
    auto-colour sequence, fonts, gridlines, panel/border fills and a legend —
    everything a theme touches."""
    n = 140
    xs = [i * (4 * math.pi) / (n - 1) for i in range(n)]
    ci.SetData('x', xs)
    ci.SetData('sin', [math.sin(t) for t in xs])
    ci.SetData('damp', [math.cos(t) * math.exp(-0.12 * t) for t in xs])
    ci.SetData('prod', [math.sin(t) * math.cos(t) for t in xs])
    # a sparse scatter with error bars for the right-hand graph
    m = 14
    sx = [i * (4 * math.pi) / (m - 1) for i in range(m)]
    ci.SetData('sx', sx)
    ci.SetData('sy', [math.sin(t) + 0.12 * math.cos(5 * t) for t in sx])
    ci.SetData('serr', [0.08 + 0.04 * abs(math.cos(t)) for t in sx])

    ci.To('/')
    ci.To(ci.Add('page', name='page1'))
    ci.Set('width', '20cm')
    ci.Set('height', '9cm')

    # page title
    lbl = ci.Add('label', name='title')
    ci.Set(f'{lbl}/label', 'A complex Veusz figure')
    ci.Set(f'{lbl}/xPos', 0.5)
    ci.Set(f'{lbl}/yPos', 0.97)
    ci.Set(f'{lbl}/alignHorz', 'centre')
    ci.Set(f'{lbl}/alignVert', 'top')
    ci.Set(f'{lbl}/Text/size', '16pt')

    grid = ci.Add('grid', name='grid1')
    ci.Set(f'{grid}/rows', 1)
    ci.Set(f'{grid}/columns', 2)
    ci.Set(f'{grid}/topMargin', '1cm')

    # --- left graph: three curves + markers + legend -------------------
    g1 = ci.Add('graph', name='waves', autoadd=True)
    ci.To(g1)
    ci.Set('x/label', 'phase')
    ci.Set('y/label', 'amplitude')
    for ds, mk, title in (
        ('sin', 'none', 'sin x'),
        ('damp', 'circle', 'cos x · e^{-x/8}'),
        ('prod', 'none', 'sin x · cos x'),
    ):
        p = ci.Add('xy', xData='x', yData=ds, marker=mk)
        ci.Set(f'{p}/key', title)
        ci.Set(f'{p}/markerSize', '2pt')
    ci.Add('key', name='legend')
    ci.To('/page1/grid1')

    # --- right graph: scatter with error bars + a Fourier family ------
    g2 = ci.Add('graph', name='harmonics', autoadd=True)
    ci.To(g2)
    ci.Set('x/label', 'x')
    ci.Set('y/label', 'y')
    sc = ci.Add('xy', xData='sx', yData='sy', marker='diamond')
    ci.Set(f'{sc}/yData', 'sy,serr')      # symmetric error bars
    ci.Set(f'{sc}/key', 'samples')
    ci.Set(f'{sc}/PlotLine/hide', True)
    for k, expr in enumerate(('sin(x)', 'sin(3*x)/3', 'sin(5*x)/5'), start=1):
        fn = ci.Add('function', function=expr)
        ci.Set(f'{fn}/key', expr)
    ci.Add('key', name='legend')
    ci.To('/')


def export_svg(doc: document.Document) -> str:
    """Export the current document to a responsive, self-contained SVG string."""
    ci = CommandInterface(doc)
    f = tempfile.mktemp(suffix='.svg')
    try:
        ci.Export(f, page=[0])
        svg = open(f, encoding='utf-8').read()
    finally:
        if os.path.exists(f):
            os.remove(f)
    # Drop the XML prolog/doctype (we inline into HTML) and make it fluid:
    # add a viewBox from the px size, then let CSS size it (width:100%).
    svg = re.sub(r'^.*?<svg', '<svg', svg, count=1, flags=re.DOTALL)
    mw = re.search(r'<svg[^>]*\bwidth="([\d.]+)px"', svg)
    mh = re.search(r'<svg[^>]*\bheight="([\d.]+)px"', svg)
    if mw and mh:
        w, h = mw.group(1), mh.group(1)
        if 'viewBox' not in svg.split('>', 1)[0]:
            svg = svg.replace('<svg', f'<svg viewBox="0 0 {w} {h}"', 1)
    svg = re.sub(r'(<svg[^>]*?)\swidth="[\d.]+px"', r'\1', svg, count=1)
    svg = re.sub(r'(<svg[^>]*?)\sheight="[\d.]+px"', r'\1', svg, count=1)
    return svg


def apply_theme(doc: document.Document, theme_id: str) -> None:
    """Apply a theme to the document exactly as the doc.apply_theme RPC does."""
    setvals = _themes.settings_for(theme_id)
    ops = []
    for path, value in setvals.items():
        try:
            setn = doc.resolveSettingPath(None, path)
        except ValueError:
            continue
        ops.append(operations.OperationSettingSet(setn, value))
    overrides = _themes.colors_for(theme_id) or {}
    existing = [[str(n), v] for n, v in doc.evaluate.def_colors]
    merged = [[n, v] for n, v in existing if n not in overrides]
    merged += [[n, v] for n, v in overrides.items()]
    ops.append(operations.OperationSetCustom('color', merged))
    doc.applyOperation(operations.OperationMultiple(ops, descr=f'theme {theme_id}'))


PAGE_TMPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Veusz · figure themes</title>
<style>
  :root {{ color-scheme: light dark; }}
  body {{ margin: 0; font: 15px/1.5 system-ui, sans-serif; color: #1f2328;
          background: #f6f8fa; }}
  header {{ max-width: 1100px; margin: 0 auto; padding: 2.2rem 1.2rem 0.6rem; }}
  header h1 {{ margin: 0 0 .3rem; font-size: 1.6rem; }}
  header p {{ margin: .2rem 0; color: #57606a; }}
  header code {{ background: #eaeef2; padding: 1px 5px; border-radius: 4px; }}
  .grid {{ max-width: 1100px; margin: 1.2rem auto 3rem; padding: 0 1.2rem;
           display: grid; gap: 1.2rem;
           grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); }}
  .card {{ background: #fff; border: 1px solid #d0d7de; border-radius: 12px;
           overflow: hidden; box-shadow: 0 1px 3px #0000000f; }}
  .card .hd {{ padding: .7rem .9rem; border-bottom: 1px solid #eaeef2;
               display: flex; align-items: baseline; gap: .5rem; flex-wrap: wrap; }}
  .card .hd b {{ font-size: 1.05rem; }}
  .card .hd .meta {{ color: #6e7781; font-size: .82rem; }}
  .card .hd .desc {{ flex-basis: 100%; color: #57606a; font-size: .86rem; }}
  .card .fig {{ padding: .6rem .8rem .9rem; }}
  .card .fig svg {{ width: 100%; height: auto; display: block; }}
  footer {{ max-width: 1100px; margin: 0 auto 3rem; padding: 0 1.2rem;
            color: #8b949e; font-size: .85rem; }}
  @media (prefers-color-scheme: dark) {{
    body {{ background: #0d1117; color: #e6edf3; }}
    header p {{ color: #8b949e; }} header code {{ background: #21262d; }}
    .card {{ background: #161b22; border-color: #30363d; }}
    .card .hd {{ border-color: #21262d; }}
  }}
</style>
</head>
<body>
<header>
  <h1>Veusz figure themes</h1>
  <p>One complex figure — a 1×2 grid of plots with markers, error bars, a
     function family and legends — rendered in every theme the editor ships.
     Pick one from the toolbar's <b>🎨 Theme</b> menu (or call
     <code>doc.apply_theme</code>).</p>
  <p>Every panel below is a static SVG exported straight from Veusz — no
     scripts, no fonts to load.</p>
</header>
<div class="grid">
{cards}
</div>
<footer>Generated by <code>scripts/build_theme_gallery.py</code>.</footer>
</body>
</html>
"""

CARD_TMPL = """  <figure class="card">
    <figcaption class="hd">
      <b>{label}</b>
      <span class="meta">colorTheme: {colorTheme} · {font}</span>
      <span class="desc">{description}</span>
    </figcaption>
    <div class="fig">{svg}</div>
  </figure>"""


def main() -> int:
    out = sys.argv[1] if len(sys.argv) > 1 else 'theme-gallery.html'

    doc = document.Document()
    ci = CommandInterface(doc)
    build_figure(ci)

    cards = []
    for t in _themes.catalog():
        apply_theme(doc, t['id'])
        svg = export_svg(doc)
        cards.append(CARD_TMPL.format(
            label=html.escape(t['label']),
            colorTheme=html.escape(t['colorTheme']),
            font=html.escape(t['font']),
            description=html.escape(t['description']),
            svg=svg,
        ))
        print(f"  rendered {t['id']:12s} ({len(svg)//1024} KiB svg)")

    page = PAGE_TMPL.format(cards='\n'.join(cards))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(page)
    print(f"wrote {out} ({len(page)//1024} KiB, {len(cards)} themes)")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
