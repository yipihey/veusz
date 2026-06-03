---
title: A phase diagram, computed and plotted in your browser
---

This page is a **fully browser-native lab notebook**: the prose, the live Python
below, and the interactive Veusz figure all run on your device with **no server
and nothing to install**. Open it on a laptop or a phone.

## Compute, in the browser

The Python cell runs in a JupyterLite (Pyodide) kernel — click **run** and edit
it. It builds the kind of two-phase distribution a simulation produces: a warm
diffuse component and a cool dense ridge.

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

The figure below is a **real, live Veusz figure**, rendered interactively in the
browser via WebGPU — pinch to zoom, drag to pan, tap to open the editor; it
exports to a publication-quality vector PDF. It's embedded as an `{iframe}`,
the mechanism MyST renders safely (MyST sanitizes inline custom elements). It
loads from the deployed embed runtime, so it works here, on a phone, with
nothing installed.

:::{iframe} https://yipihey.github.io/veusz/example/
:width: 100%
:label: veusz-figure
A live, interactive Veusz figure served from the in-browser embed runtime.
:::

> **Where this is going:** the `myst-veusz` directive will point this iframe at a
> per-figure viewer (`figure.html?src=<your>.vsz`) so you write
> `:::{veusz} figures/phase.vsz:::` and get the density phase diagram. And the
> repo's `DataService` / `RemoteProvider` layer lets the figure read arrays from
> *this notebook's* kernel — binning where the data lives, shipping back only the
> grid — so the figure and the cell share one dataset and one Pyodide, no copy
> across the thread.
