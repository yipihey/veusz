# myst-veusz example — a browser-native lab notebook

A minimal MyST project showing the end-to-end vision: prose + a **live Python
cell** (JupyterLite/Pyodide, runs in the browser, no server) + a **live Veusz
figure**, all client-side. Open it on a laptop or a phone — nothing to install.

## Run / preview locally

```bash
cd integrations/myst-veusz/example
npx mystmd start          # dev server with live preview at http://localhost:3000
# or a static build to deploy:
npx mystmd build --html   # static site under _build/html/
```

`myst.yml` enables in-browser execution (`jupyter: lite: true`) and registers the
`../src/index.mjs` plugin.

## How the figure is embedded

MyST sanitizes inline custom elements, so the interactive figure is embedded via
MyST's native `{iframe}` directive pointing at the deployed Veusz embed runtime
(`https://yipihey.github.io/veusz/...`). The included `figures/phase.vsz` is a
density phase diagram intended for the `myst-veusz` `:::{veusz}:::` directive once
its per-figure viewer (`figure.html?src=...`) is deployed — at which point the
iframe points at *your* `.vsz` and the figure can share this notebook's kernel
data via the repo's `DataService`/`RemoteProvider` layer.
