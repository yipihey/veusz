# Veusz in a Jupyter notebook

[`veusz-phase-diagram.ipynb`](./veusz-phase-diagram.ipynb) is a self-contained
example: it computes a two-component distribution and renders it as a **live,
interactive `VeuszWidget`** (a Veusz `density` 2-D histogram). The figure runs
*inside the kernel* — it's an [anywidget](https://anywidget.dev), so the same
notebook works unchanged across editors — and rasterises to vector SVG with a
**WebAssembly backend bundled in the wheel** (no Qt, no server, no network).

## Run it

**Local Jupyter / VS Code** (real `.ipynb` on disk, autosaved):

```bash
pip install anywidget fonttools numpy \
    https://yipihey.github.io/veusz/embed/v4.5.0/veusz-4.5.0-py3-none-any.whl
jupyter lab veusz-phase-diagram.ipynb      # or: open it in VS Code
```

**JupyterLite / Pyodide** (in-browser, no install): the notebook's first cell
`micropip.install(...)`s the stack automatically — just run the cells.

Drag a rectangle on the figure to **zoom**, double-click to **reset**, and edit
settings live (e.g. `fig.set_setting("/page1/graph1/dens/colorMap", "plasma")`).

## How it renders in different viewers

The figure is a Jupyter **widget**, so whether it shows depends on whether the
viewer runs widget JavaScript and has the widget state:

| Viewer | Interactive figure? | Notes |
|---|---|---|
| JupyterLab / Notebook / **VS Code** / JupyterLite / Colab | ✅ full (zoom, edit) | live kernel; the wasm is bundled, so no network needed |
| **`nbconvert --to html`** | ✅ renders (no zoom) | **verified** — embeds the widget state (incl. the bundled wasm) and renders in any JS-capable browser; loads only the standard ipywidgets manager (require.js) from a CDN. Save/execute the notebook *with widget state* first (a live Jupyter save, or a recent `nbconvert --execute`). |
| nbviewer | ✅ renders (no zoom) | renders embedded widget state |
| **GitHub** `.ipynb` preview | ❌ static text only | GitHub strips widget JavaScript for *all* ipywidgets — it shows the `text/plain` repr, not the figure. This is a GitHub limitation, not specific to Veusz. |

**For a figure that renders on GitHub or any no-JS page**, publish via the
[`myst-veusz`](../myst-veusz) path instead (the MyST site runs the figure live
through thebe), or embed a pre-rendered image.

### Why `nbconvert --to html` works but GitHub doesn't

`nbconvert --to html` embeds the saved widget state and the ipywidgets HTML
manager, so a browser re-instantiates the figure from that state (our wasm
travels inside the state, so it needs no extra fetch). GitHub's notebook
renderer deliberately runs no widget JavaScript, so there is no static image to
fall back to — the kernel can't pre-render one (the pure-Python wheel has no Qt
or GPU paint path; rendering happens in the browser via wasm).
