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
  box.style.cssText = "position:relative;max-width:100%;touch-action:none;user-select:none;";
  // Rubber-band rectangle overlay for drag-to-zoom.
  const rubber = document.createElement("div");
  rubber.style.cssText =
    "position:absolute;display:none;pointer-events:none;border:1px solid #1f6feb;" +
    "background:rgba(31,111,235,0.12);z-index:2;";
  box.appendChild(rubber);
  const status = document.createElement("div");
  status.style.cssText = "font:12px sans-serif;color:#888;";
  const hint = document.createElement("div");
  hint.style.cssText = "font:11px sans-serif;color:#aaa;margin-top:2px;";
  hint.textContent = "drag to zoom · double-click to reset";
  el.append(box, status, hint);

  const svgEl = () => box.querySelector("svg");
  let token = 0, actionN = 0;
  function sendAction(obj) {
    obj.n = ++actionN;
    model.set("action", JSON.stringify(obj));
    model.save_changes();
    status.textContent = "updating…";
  }

  async function draw() {
    const b64 = model.get("scene_b64");
    const w = model.get("width");
    const h = model.get("height");
    const base = (model.get("wasm_base") || "").replace(/\/+$/, "");
    if (!b64) { status.textContent = "(no figure yet)"; return; }
    const mine = ++token;
    if (!svgEl()) status.textContent = "rendering…";
    try {
      const mod = await loadWasm(base);
      if (mine !== token) return;  // a newer scene arrived; drop this one
      if (typeof mod.scene_to_svg !== "function") {
        status.textContent = "this runtime has no SVG backend (wasm_base too old)";
        return;
      }
      const svg = mod.scene_to_svg(base64ToBytes(b64), w, h);
      [...box.querySelectorAll("svg")].forEach((n) => n.remove());  // keep `rubber`
      box.insertAdjacentHTML("beforeend", svg);
      const s = svgEl();
      if (s) {
        if (!s.getAttribute("viewBox")) s.setAttribute("viewBox", `0 0 ${w} ${h}`);
        s.removeAttribute("width");
        s.removeAttribute("height");
        s.style.maxWidth = "100%";
        s.style.height = "auto";
        s.style.display = "block";
        s.style.touchAction = "none";
      }
      status.textContent = "";
    } catch (e) {
      status.textContent = "render error: " + (e && e.message ? e.message : e);
    }
  }

  // --- pointer interaction: drag a rectangle to zoom ----------------------
  // Pixel coords are mapped into the figure's render space (0..w, 0..h) so the
  // kernel can resolve them to data coords (render.pixel_to_data) regardless of
  // the SVG's displayed size.
  let drag = null;
  const px = (clientX, r, w) => ((clientX - r.left) / r.width) * w;
  const py = (clientY, r, h) => ((clientY - r.top) / r.height) * h;
  box.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 || !svgEl()) return;
    drag = { sx: ev.clientX, sy: ev.clientY };
    const b = box.getBoundingClientRect();
    rubber.style.display = "block";
    rubber.style.left = (ev.clientX - b.left) + "px";
    rubber.style.top = (ev.clientY - b.top) + "px";
    rubber.style.width = "0px"; rubber.style.height = "0px";
    try { box.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
  });
  box.addEventListener("pointermove", (ev) => {
    if (!drag) return;
    const b = box.getBoundingClientRect();
    rubber.style.left = (Math.min(drag.sx, ev.clientX) - b.left) + "px";
    rubber.style.top = (Math.min(drag.sy, ev.clientY) - b.top) + "px";
    rubber.style.width = Math.abs(ev.clientX - drag.sx) + "px";
    rubber.style.height = Math.abs(ev.clientY - drag.sy) + "px";
  });
  box.addEventListener("pointerup", (ev) => {
    if (!drag) return;
    rubber.style.display = "none";
    const s = svgEl(); const d = drag; drag = null;
    if (!s) return;
    if (Math.abs(ev.clientX - d.sx) < 6 || Math.abs(ev.clientY - d.sy) < 6) return;  // a click, not a drag
    const r = s.getBoundingClientRect();
    const w = model.get("width"), h = model.get("height");
    const x0 = px(d.sx, r, w), y0 = py(d.sy, r, h);
    const x1 = px(ev.clientX, r, w), y1 = py(ev.clientY, r, h);
    sendAction({ type: "zoom", x0: Math.min(x0, x1), y0: Math.min(y0, y1),
                 x1: Math.max(x0, x1), y1: Math.max(y0, y1) });
  });
  box.addEventListener("dblclick", () => sendAction({ type: "reset" }));

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
    # frontend -> kernel: an interaction request (JSON: zoom rect / reset).
    # NB: no leading underscore — ipywidgets does not sync underscore-prefixed
    # custom traits from the frontend, so the observer would never fire.
    action = traitlets.Unicode("").tag(sync=True)

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
        # Axis paths touched by interactive zoom, so reset knows what to clear.
        self._zoomed_axes: set[str] = set()
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

    # -- interaction (frontend pointer events -> axis edits) ----------------
    def _axes_at(self, x: float, y: float) -> list:
        """Axes under a render-space pixel, each ``{path, direction, value}``."""
        out = self._call("render.pixel_to_data", {"x": float(x), "y": float(y)})
        return out.get("axes", []) if out else []

    def _zoom(self, x0, y0, x1, y1):
        """Zoom so the dragged rectangle's corners become each axis's range.

        Resolving both corners to data values gives absolute min/max, so this
        works whether the axes were Auto-ranged or already zoomed."""
        from collections import defaultdict
        vals: dict[str, list] = defaultdict(list)
        for entry in self._axes_at(x0, y0) + self._axes_at(x1, y1):
            vals[entry["path"]].append(entry["value"])
        changed = False
        for path, vs in vals.items():
            if len(vs) >= 2:
                lo, hi = min(vs), max(vs)
                if hi > lo:
                    self._call("doc.set", {"path": f"{path}/min", "value": float(lo)})
                    self._call("doc.set", {"path": f"{path}/max", "value": float(hi)})
                    self._zoomed_axes.add(path)
                    changed = True
        if changed:
            self.render()

    def reset_zoom(self):
        """Return every zoomed axis to automatic ranging and re-render."""
        paths = set(self._zoomed_axes)
        if not paths:  # nothing recorded — discover the axes under the centre
            paths = {e["path"] for e in self._axes_at(self.width / 2, self.height / 2)}
        for path in paths:
            self._call("doc.set", {"path": f"{path}/min", "value": "Auto"})
            self._call("doc.set", {"path": f"{path}/max", "value": "Auto"})
        self._zoomed_axes.clear()
        if paths:
            self.render()

    @traitlets.observe("action")
    def _on_action(self, change):
        import json
        try:
            a = json.loads(change["new"] or "{}")
        except Exception:  # noqa: BLE001
            return
        kind = a.get("type")
        if kind == "zoom":
            self._zoom(a["x0"], a["y0"], a["x1"], a["y1"])
        elif kind == "reset":
            self.reset_zoom()


# The editor frontend (ESM): a <textarea> + Run button + an output pane. Editing
# syncs `code`; Run bumps `run_count` (the kernel observes it and executes).
_EDITOR_ESM = r"""
// Try to build a CodeMirror 6 editor (lazy CDN import). Returns an
// {get,set,focus} handle, or null if anything fails — the caller then keeps the
// plain <textarea>, so the editor always works even offline / if the CDN is down.
async function tryCodeMirror(host, initial, onChange, onRun) {
  try {
    const E = "https://esm.sh";
    const [view, state, commands, langpy, language] = await Promise.all([
      import(`${E}/@codemirror/view@6`),
      import(`${E}/@codemirror/state@6`),
      import(`${E}/@codemirror/commands@6`),
      import(`${E}/@codemirror/lang-python@6`),
      import(`${E}/@codemirror/language@6`),
    ]);
    const { EditorView, keymap, lineNumbers, highlightActiveLine } = view;
    const { EditorState } = state;
    const { defaultKeymap, history, historyKeymap, indentWithTab } = commands;
    const v = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: initial,
        extensions: [
          lineNumbers(), history(), highlightActiveLine(),
          language.syntaxHighlighting(language.defaultHighlightStyle),
          langpy.python(), language.indentUnit.of("    "),
          keymap.of([
            { key: "Mod-Enter", preventDefault: true, run: () => { onRun(); return true; } },
            indentWithTab, ...defaultKeymap, ...historyKeymap,
          ]),
          EditorView.updateListener.of((u) => { if (u.docChanged) onChange(v.state.doc.toString()); }),
          EditorView.theme({
            "&": { fontSize: "13px", backgroundColor: "#f6f8fa" },
            ".cm-content": { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" },
            ".cm-gutters": { backgroundColor: "#f6f8fa", border: "0" },
            "&.cm-focused": { outline: "none" },
          }),
        ],
      }),
    });
    return {
      get: () => v.state.doc.toString(),
      set: (s) => { if (s !== v.state.doc.toString())
        v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: s } }); },
      focus: () => v.focus(),
    };
  } catch (e) {
    return null;
  }
}

function render({ model, el }) {
  el.innerHTML = "";
  el.style.cssText = "border:1px solid #d0d7de;border-radius:6px;overflow:hidden;";

  const host = document.createElement("div");
  host.style.cssText = "background:#f6f8fa;max-height:24em;overflow:auto;";

  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 10px;background:#fff;border-top:1px solid #eaeef2;";
  const run = document.createElement("button");
  run.textContent = "▶ Run";
  run.style.cssText =
    "cursor:pointer;border:1px solid #1a7f37;border-radius:6px;padding:3px 12px;font-size:13px;" +
    "background:#1f883d;color:#fff;";
  const hint = document.createElement("span");
  hint.textContent = "edit and run — ⌘/Ctrl+Enter";
  hint.style.cssText = "font:11px sans-serif;color:#8b949e;";
  bar.append(run, hint);

  const out = document.createElement("pre");
  out.style.cssText =
    "margin:0;padding:0 12px;max-height:12em;overflow:auto;white-space:pre-wrap;" +
    "font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#57606a;";
  const showOut = () => {
    const t = model.get("output") || "";
    out.textContent = t;
    out.style.padding = t ? "8px 12px" : "0 12px";
  };

  const fire = () => {
    model.set("code", editor.get());
    model.set("run_count", model.get("run_count") + 1);
    model.save_changes();
    run.disabled = true; run.style.opacity = "0.6"; out.textContent = "running…";
  };

  // Always-present <textarea> fallback; upgraded to CodeMirror if it loads.
  const ta = document.createElement("textarea");
  ta.spellcheck = false;
  ta.value = model.get("code");
  ta.style.cssText =
    "display:block;width:100%;box-sizing:border-box;border:0;outline:none;resize:vertical;" +
    "min-height:5.5em;padding:10px 12px;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;" +
    "background:#f6f8fa;color:#1f2328;";
  ta.addEventListener("input", () => { model.set("code", ta.value); model.save_changes(); });
  ta.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); fire(); }
  });
  host.appendChild(ta);
  let editor = { get: () => ta.value, set: (s) => { if (ta.value !== s) ta.value = s; }, focus: () => ta.focus() };

  tryCodeMirror(host, model.get("code"),
    (v) => { model.set("code", v); model.save_changes(); }, fire)
    .then((cm) => { if (cm) { ta.remove(); editor = cm; } });

  run.addEventListener("click", fire);
  model.on("change:done", () => { run.disabled = false; run.style.opacity = "1"; showOut(); });
  model.on("change:output", showOut);
  model.on("change:code", () => editor.set(model.get("code")));

  el.append(host, bar, out);
  showOut();
}
export default { render };
"""


class VeuszCodeEditor(anywidget.AnyWidget):
    """An in-page, editable Python cell that runs in the notebook kernel.

    MyST's published site renders ``{code-cell}`` blocks as run-only static code
    — there is no inline source editor. This widget restores editing: a code box
    with a Run button whose contents execute **in the kernel's own namespace**
    (via the IPython shell), so snippets can drive objects already defined on the
    page — e.g. a displayed :class:`VeuszWidget` — and the figure redraws in
    place. stdout/stderr and tracebacks are shown beneath the editor.

    Usage::

        from veusz.notebook import VeuszCodeEditor
        VeuszCodeEditor('fig.set_setting("/page1/graph1/dens/colorMap", "plasma")')
    """

    _esm = _EDITOR_ESM
    code = traitlets.Unicode("").tag(sync=True)
    output = traitlets.Unicode("").tag(sync=True)
    run_count = traitlets.Int(0).tag(sync=True)   # frontend -> kernel: please run
    done = traitlets.Int(0).tag(sync=True)         # kernel -> frontend: run finished

    def __init__(self, code: str = "", **kwargs):
        super().__init__(**kwargs)
        self.code = code

    @traitlets.observe("run_count")
    def _on_run(self, _change):
        import contextlib
        import io
        import traceback
        # Execute in the live user namespace so the snippet sees `fig`, `logrho`,
        # … exactly as a notebook cell would (and its edits to a displayed widget
        # propagate). Fall back to module globals outside IPython.
        ns = None
        try:
            from IPython import get_ipython
            ip = get_ipython()
            if ip is not None:
                ns = ip.user_ns
        except Exception:
            ns = None
        if ns is None:
            ns = globals()
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
                exec(self.code, ns)  # noqa: S102 - intentional: user-authored cell
            self.output = buf.getvalue()
        except Exception:  # noqa: BLE001 - surface the traceback to the reader
            self.output = buf.getvalue() + traceback.format_exc()
        finally:
            self.done += 1
