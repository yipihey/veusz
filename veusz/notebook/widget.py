"""A live, kernel-shared Veusz figure for Jupyter / JupyterLite notebooks.

`VeuszWidget` is an `anywidget <https://anywidget.dev>`_ that renders a Veusz
document **inside the notebook kernel** — no separate Pyodide instance and no
server. The figure is displayed as an interactive cell output:

* The document model + the daemon JSON-RPC handlers run in the kernel
  (:class:`veusz.daemon.pyodide_bridge.Bridge`). The page widgets are captured
  to the abstract *Scene IR* by ``render.scene`` (pure Python, no Qt paint).
* The Scene IR is rasterised to vector **SVG** in the browser by the pure-Rust
  ``veusz-paint-svg`` wasm backend (loaded from the deployed embed CDN). The
  notebook's arrays therefore never leave the kernel — only the finished scene
  (a few KB of SVG) crosses the comm to JS.
* Because the widget runs in the kernel, it reads the notebook's data directly:
  push arrays in with :meth:`set_data`, and any edit (:meth:`set_setting`,
  :meth:`set_data`, :meth:`load_vsz`) re-renders the figure in place.

The frontend↔kernel sync rides anywidget's managed Jupyter comm, so this works
unchanged under classic Jupyter, JupyterLab, and JupyterLite/thebe (verified).

Usage (in a notebook cell)::

    import micropip; await micropip.install("anywidget")  # JupyterLite only
    from veusz.notebook import VeuszWidget

    w = VeuszWidget(vsz=open("phase.vsz").read(), width=640, height=640)
    w.set_data("logrho", logrho)     # arrays computed in an earlier cell
    w.set_data("logT", logT)
    w                                # display it

`anywidget` is an optional runtime dependency (install it with micropip in
JupyterLite, or ``pip install anywidget`` elsewhere); importing this module
without it raises a clear error.
"""

from __future__ import annotations

try:
    import anywidget
    import traitlets
except ImportError as exc:  # pragma: no cover - exercised only without the dep
    raise ImportError(
        "VeuszWidget needs the 'anywidget' package. In JupyterLite run "
        "`import micropip; await micropip.install(\"anywidget\")`; elsewhere "
        "`pip install anywidget`."
    ) from exc

from ..daemon.pyodide_bridge import Bridge

# Default CDN hosting the pure-Rust Scene-IR -> SVG wasm backend
# (veusz_paint_wasm.js + veusz_paint_wasm_bg.wasm), published with CORS by
# .github/workflows/deploy-embed.yml. Override per widget with `wasm_base`.
DEFAULT_WASM_BASE = "https://yipihey.github.io/veusz/embed/v4.5.0/wasm"

# The anywidget frontend (ESM). Loads the wasm SVG backend lazily and redraws
# whenever the kernel syncs a new Scene IR. Kept as an inline string so it ships
# in the pure-Python embed wheel with no package_data wiring.
_ESM = r"""
function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// One wasm load per (base) per page; shared across widgets.
const _moduleCache = new Map();
function loadWasm(base) {
  if (!_moduleCache.has(base)) {
    const p = (async () => {
      const mod = await import(/* webpackIgnore: true */ `${base}/veusz_paint_wasm.js`);
      await mod.default({ module_or_path: `${base}/veusz_paint_wasm_bg.wasm` });
      return mod;
    })().catch((e) => { _moduleCache.delete(base); throw e; });
    _moduleCache.set(base, p);
  }
  return _moduleCache.get(base);
}

function render({ model, el }) {
  el.innerHTML = "";
  const box = document.createElement("div");
  box.className = "veusz-widget";
  box.style.cssText = "max-width:100%;";
  const status = document.createElement("div");
  status.style.cssText = "font:12px sans-serif;color:#888;";
  el.append(box, status);

  let token = 0;
  async function draw() {
    const b64 = model.get("scene_b64");
    const w = model.get("width");
    const h = model.get("height");
    const base = (model.get("wasm_base") || "").replace(/\/+$/, "");
    if (!b64) { box.innerHTML = ""; status.textContent = "(no figure yet)"; return; }
    const mine = ++token;
    status.textContent = "rendering…";
    try {
      const mod = await loadWasm(base);
      if (mine !== token) return;  // a newer scene arrived; drop this one
      if (typeof mod.scene_to_svg !== "function") {
        status.textContent = "this runtime has no SVG backend (wasm_base too old)";
        return;
      }
      const svg = mod.scene_to_svg(base64ToBytes(b64), w, h);
      box.innerHTML = svg;
      const s = box.querySelector("svg");
      if (s) {
        if (!s.getAttribute("viewBox")) s.setAttribute("viewBox", `0 0 ${w} ${h}`);
        s.removeAttribute("width");
        s.removeAttribute("height");
        s.style.maxWidth = "100%";
        s.style.height = "auto";
      }
      status.textContent = "";
    } catch (e) {
      status.textContent = "render error: " + (e && e.message ? e.message : e);
    }
  }

  model.on("change:scene_b64", draw);
  model.on("change:width", draw);
  model.on("change:height", draw);
  draw();
}

export default { render };
"""


class VeuszWidget(anywidget.AnyWidget):
    """A live Veusz figure rendered in the notebook kernel (see module docs)."""

    _esm = _ESM

    # Synced state (kernel -> frontend). The Scene IR is base64-encoded JSON.
    scene_b64 = traitlets.Unicode("").tag(sync=True)
    width = traitlets.Int(640).tag(sync=True)
    height = traitlets.Int(480).tag(sync=True)
    wasm_base = traitlets.Unicode(DEFAULT_WASM_BASE).tag(sync=True)

    def __init__(self, vsz: str | None = None, width: int = 640,
                 height: int = 480, dpi: int = 96,
                 wasm_base: str | None = None, deterministic: bool = False,
                 **kwargs):
        super().__init__(**kwargs)
        self.width = int(width)
        self.height = int(height)
        if wasm_base:
            self.wasm_base = wasm_base
        self._dpi = int(dpi)
        # The Veusz document + handler set, living in this kernel.
        self._bridge = Bridge(deterministic=deterministic)
        if vsz is not None:
            self.load_vsz(vsz)

    # -- kernel-side document operations; each re-renders --------------------
    def _call(self, method: str, params: dict):
        resp = self._bridge.dispatch(method, params)
        if "error" in resp:
            err = resp["error"]
            raise RuntimeError(f"{method} failed: {err.get('message', err)}")
        return resp.get("result")

    def load_vsz(self, text: str):
        """Load a ``.vsz`` document from its text and render it."""
        self._call("file.open", {"path": self._write_vsz(text)})
        return self.render()

    def _write_vsz(self, text: str) -> str:
        import os
        import tempfile
        path = os.path.join(tempfile.gettempdir(), "veusz_widget.vsz")
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        return path

    def set_data(self, name: str, values, dtype: str = "float64"):
        """Set (or replace) a 1-D dataset from a sequence/array, then render.

        ``values`` is consumed in-kernel — if it's a numpy array it's converted
        to a list here and never crosses to JS, so large notebook arrays stay
        on the kernel side; only the rendered scene is shipped out.
        """
        seq = values.tolist() if hasattr(values, "tolist") else list(values)
        self._call("data.set", {"name": name, "values": seq, "dtype": dtype})
        return self.render()

    def set_setting(self, path: str, value):
        """Set a widget/setting value by document path (e.g.
        ``/page1/graph1/x/min``) and re-render."""
        self._call("doc.set", {"path": path, "value": value})
        return self.render()

    def render(self):
        """Re-capture the current page's Scene IR and push it to the frontend."""
        result = self._call("render.scene", {
            "page": 0, "w": self.width, "h": self.height, "dpi": self._dpi,
        })
        self.scene_b64 = result["scene_b64"]
        # Mirror the renderer's reported size (it may clamp/round).
        self.width = int(result.get("width", self.width))
        self.height = int(result.get("height", self.height))
        return self
