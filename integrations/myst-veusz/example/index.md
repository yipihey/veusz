---
title: A phase diagram, computed and plotted in your browser
# A kernelspec is what tells MyST this page is *executable*: without it the
# {code-cell} below renders as a static code block and the in-page compute
# "power button" (⏻) never appears — only the external Binder/JupyterHub
# launcher. With it (plus project.jupyter.lite), MyST shows the power button
# that boots the in-browser JupyterLite (Pyodide) kernel.
kernelspec:
  name: python
  display_name: Python (Pyodide)
---

This page is a **fully browser-native lab notebook**: the prose, the live Python
below, and the interactive Veusz figure all run on your device with **no server
and nothing to install**. Open it on a laptop or a phone.

## Compute, in the browser

First press the **power button (⏻) at the top of the page** to start the
in-browser kernel (JupyterLite / Pyodide — this downloads the runtime once, on
demand). Each cell then shows a **▶ run** button, so you can run the whole page
on your device. (Want to change the code? The published page shows code cells
read-only; use the **editable code box** further down — or "Launch notebook in
Jupyter" in the top toolbar for the full editor.) The cell below builds the kind
of two-phase distribution a simulation produces: a warm diffuse component and a
cool dense ridge.

```{code-cell} python
import numpy as np
rng = np.random.default_rng(7)
n = 6000
logrho = np.concatenate([rng.normal(-1.0, 0.7, n), rng.normal(1.2, 0.4, n)])
logT   = np.concatenate([4.2 + 0.55*rng.normal(-1.0, 0.7, n) + rng.normal(0, 0.2, n),
                         6.4 + rng.normal(0, 0.3, n)])
print(f"{logrho.size:,} cells")
print(f"log rho in [{logrho.min():.2f}, {logrho.max():.2f}]")
print(f"log T   in [{logT.min():.2f}, {logT.max():.2f}]")
```

## Plot, with Veusz

The figure below is a **real, live Veusz `density` widget** — a 2D histogram
(phase diagram) of the two arrays computed above. It runs **inside this
notebook's kernel** (a `VeuszWidget`, built on
[anywidget](https://anywidget.dev)): the binning happens where the data lives,
and only the finished scene — rendered to crisp vector **SVG** by the pure-Rust
backend, no Qt and no WebGPU — is shipped to the page. So the figure and the
cell above **share one dataset and one Pyodide, with no copy**.

Run the cell to draw it. The figure is **interactive**: **drag a rectangle to
zoom**, **double-click to reset**. And because it's live you can edit it too —
change settings or even the whole document in the editable boxes below, or
change the data in the first cell and re-run.

```{code-cell} python
# One-time setup: install the in-browser plotting stack into this kernel.
# (numpy is already loaded by the cell above.) One micropip call so the three
# wheels resolve and download together rather than serially.
import micropip
await micropip.install([
    "anywidget",
    "fonttools",
    "https://yipihey.github.io/veusz/embed/v4.5.0/veusz-4.5.0-py3-none-any.whl",
])

from veusz.notebook import VeuszWidget

# A compact phase-diagram document: a Veusz `density` 2D-histogram widget with a
# colour bar. The data is NOT embedded — we feed it from the kernel below, so the
# figure binds to THIS notebook's arrays.
PHASE = r"""SetCompatLevel(0)
Add('page', name='page1', autoadd=False)
To('page1')
Add('graph', name='graph1', autoadd=False)
To('graph1')
Add('axis', name='x', autoadd=False)
To('x')
Set('label', 'log \\rho')
To('..')
Add('axis', name='y', autoadd=False)
To('y')
Set('label', 'log T')
Set('direction', 'vertical')
To('..')
Add('density', name='dens', autoadd=False)
To('dens')
Set('xData', 'logrho')
Set('yData', 'logT')
Set('numBinsX', 120)
Set('numBinsY', 120)
Set('colorMap', 'viridis')
Set('colorScaling', 'log')
To('..')
Add('colorbar', name='colorbar1', autoadd=False)
To('colorbar1')
Set('widgetName', 'dens')
Set('label', 'counts')
To('..')
To('..')
To('..')
"""

fig = VeuszWidget(vsz=PHASE, width=640, height=560)
fig.set_data("logrho", logrho)   # the arrays from the cell above — shared, not copied
fig.set_data("logT", logT)
fig
```

### Edit it live

The published page renders the code cells above read-only, so here's an
**editable code box** — change it and press **▶ Run** (or ⌘/Ctrl+Enter). It runs
in the same kernel, so it sees `fig` and the data, and the figure above
**redraws in place**. Try a different colour map or bin count, or shift the
data:

```{code-cell} python
from veusz.notebook import VeuszCodeEditor
VeuszCodeEditor('''
# Edit me, then press Run — the phase diagram above updates.
fig.set_setting("/page1/graph1/dens/colorMap", "plasma")
fig.set_setting("/page1/graph1/dens/numBinsX", 80)
fig.set_setting("/page1/graph1/dens/numBinsY", 80)
print("redrew with", 80, "x", 80, "bins")
''')
```

### Edit the whole document

The settings tweak above is small; you can also edit the figure's **entire Veusz
document** — add widgets, change axes, swap the plot type — and rebuild it on the
same data. Edit and **Run**:

```{code-cell} python
VeuszCodeEditor(r'''
# The full Veusz document for the figure. Edit it and Run to rebuild `fig`
# above — then re-feed the same kernel arrays (load resets the datasets).
doc = """SetCompatLevel(0)
Add('page', name='page1', autoadd=False)
To('page1')
Add('graph', name='graph1', autoadd=False)
To('graph1')
Add('axis', name='x', autoadd=False)
To('x')
Set('label', 'log \\\\rho')
To('..')
Add('axis', name='y', autoadd=False)
To('y')
Set('label', 'log T')
Set('direction', 'vertical')
To('..')
Add('density', name='dens', autoadd=False)
To('dens')
Set('xData', 'logrho')
Set('yData', 'logT')
Set('numBinsX', 100)
Set('numBinsY', 100)
Set('colorMap', 'inferno')
Set('colorScaling', 'log')
To('..')
"""
fig.load_vsz(doc)
fig.set_data("logrho", logrho)
fig.set_data("logT", logT)
print("rebuilt the figure from the document above")
''')
```
