---
title: A phase diagram, computed and plotted in your browser
---

This page is a **fully browser-native lab notebook**: the prose, the live Python
below, and the interactive Veusz figure all run on your device with **no server
and nothing to install**. Open it on a laptop or a phone.

## Compute, in the browser

The Python cell below is **live and editable**. First press the **power button
(⏻) at the top of the page** to start the in-browser kernel (JupyterLite /
Pyodide — this downloads the runtime once, on demand). Then each cell shows a
**▶ run** button and becomes an editable input — change the numbers, re-run,
and watch the output update, entirely on your device. It builds the kind of
two-phase distribution a simulation produces: a warm diffuse component and a
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

The figure below is a **real Veusz `density` widget** — a 2D histogram (phase
diagram) of the two columns above. It shows inline as a crisp **SVG** (vector
axes and labels, the density as an image), rendered with no Qt and no browser
by the pure-Rust backend (`scripts/render_vsz.sh`). **Click it to open the live,
interactive figure full-page** — pinch to zoom, drag to pan, edit, and export a
publication-quality vector PDF, on its own full viewport so fullscreen and
sizing just work. It works here, on a phone, with nothing installed.

:::{veusz} https://yipihey.github.io/veusz/notebook/phase.vsz
:poster: figures/phase.svg
:width: 640
:height: 640
:alt: Phase diagram (log T vs log rho) — click to open the interactive figure
:::

> **Where this is going:** the `DataService` / `RemoteProvider` layer in the repo
> lets the figure read arrays straight from *this notebook's* kernel — binning
> where the data lives, shipping back only the grid — so the figure and the cell
> above share one dataset and one Pyodide, with no copy across the thread.
