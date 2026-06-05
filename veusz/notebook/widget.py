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


def _json_safe_value(value):
    """Coerce a setting value from ``doc.get`` into a JSON-serialisable form for
    the properties panel. Most values are primitives; tuples/lists (FloatList,
    colours-as-sequences) are recursed, and anything exotic falls back to its
    string form (which the panel shows in a text input and round-trips as text).
    """
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, (list, tuple)):
        return [_json_safe_value(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _json_safe_value(v) for k, v in value.items()}
    if hasattr(value, "item"):  # numpy scalar
        try:
            return _json_safe_value(value.item())
        except Exception:  # noqa: BLE001
            pass
    return str(value)

# Default CDN hosting the pure-Rust Scene-IR -> SVG wasm backend
# (veusz_paint_wasm.js + veusz_paint_wasm_bg.wasm), published with CORS by
# .github/workflows/deploy-embed.yml. Used only as a FALLBACK when the wasm is
# not bundled in the wheel; override per widget with `wasm_base`.
DEFAULT_WASM_BASE = "https://yipihey.github.io/veusz/embed/v4.5.0/wasm"


def _load_bundled_wasm():
    """The wasm renderer shipped inside the wheel (``notebook/_assets``), as
    ``(glue_text, wasm_bytes)`` — or ``(None, b"")`` when absent (older wheels).
    Handed to the frontend over the comm so rendering needs no network. Loaded
    once and cached at module scope; the per-widget cost is the comm transfer."""
    import pathlib
    here = pathlib.Path(__file__).parent / "_assets"
    try:
        glue = (here / "veusz_paint_wasm.js").read_text(encoding="utf-8")
        wasm = (here / "veusz_paint_wasm_bg.wasm").read_bytes()
        return glue, wasm
    except Exception:  # noqa: BLE001 - any miss => fall back to the CDN
        return None, b""


_BUNDLED_WASM_GLUE, _BUNDLED_WASM_BYTES = _load_bundled_wasm()

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

// One instantiation per key per page, shared across widgets.
const _moduleCache = new Map();
function _instantiate(key, glueUrl, initArg, revoke) {
  if (!_moduleCache.has(key)) {
    const p = (async () => {
      try {
        const mod = await import(/* webpackIgnore: true */ glueUrl);
        await mod.default(initArg);
        return mod;
      } finally { if (revoke) revoke(); }
    })().catch((e) => { _moduleCache.delete(key); throw e; });
    _moduleCache.set(key, p);
  }
  return _moduleCache.get(key);
}

// Prefer the wasm BUNDLED in the wheel and handed over the comm (glue text +
// wasm bytes) — this needs ZERO network, so it works under VS Code's webview
// CSP and fully offline. Fall back to the CDN `wasm_base` only when a widget
// was created from a wheel that predates bundling.
function getWasm(model) {
  const glue = model.get("_wasm_glue");
  const view = model.get("_wasm_bytes");
  const len = view ? (view.byteLength || 0) : 0;
  if (glue && len > 0) {
    const key = "bundled:" + glue.length + ":" + len;
    if (_moduleCache.has(key)) return _moduleCache.get(key);
    // Copy to a standalone ArrayBuffer: a view over the comm buffer can read as
    // empty by the time WebAssembly.instantiate consumes it.
    let buf = null;
    if (view instanceof DataView || ArrayBuffer.isView(view)) {
      buf = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    } else if (view instanceof ArrayBuffer) {
      buf = view.slice(0);
    }
    if (buf && buf.byteLength > 0) {
      const url = URL.createObjectURL(new Blob([glue], { type: "text/javascript" }));
      return _instantiate(key, url, { module_or_path: buf }, () => URL.revokeObjectURL(url));
    }
    // else: bytes didn't survive the comm — fall through to the CDN.
  }
  const base = (model.get("wasm_base") || "").replace(/\/+$/, "");
  return _instantiate("cdn:" + base, `${base}/veusz_paint_wasm.js`,
                      { module_or_path: `${base}/veusz_paint_wasm_bg.wasm` }, null);
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

  // --- GUI properties panel (kernel-driven) -------------------------------
  // A widget chooser (from doc.tree) + auto-generated controls (from
  // doc.schema_at + current values) that write settings via doc.set and
  // re-render. Hidden until the reader opens it, and the schema is fetched
  // lazily, so a plain figure pays nothing for the editor.
  const editBar = document.createElement("div");
  editBar.style.cssText = "margin-top:4px;";
  const editToggle = document.createElement("button");
  editToggle.type = "button";
  editToggle.textContent = "⚙ Edit ▾";
  editToggle.style.cssText =
    "cursor:pointer;border:1px solid #d0d7de;border-radius:6px;padding:2px 10px;" +
    "font:12px sans-serif;background:#f6f8fa;color:#1f2328;";
  editBar.append(editToggle);

  const panel = document.createElement("div");
  panel.style.cssText =
    "display:none;margin-top:6px;border:1px solid #d0d7de;border-radius:6px;" +
    "padding:8px 10px;background:#fbfcfe;max-height:22em;overflow:auto;";
  const selRow = document.createElement("div");
  selRow.style.cssText = "display:flex;align-items:center;gap:6px;margin-bottom:6px;";
  const selLbl = document.createElement("span");
  selLbl.textContent = "Widget:";
  selLbl.style.cssText = "font:12px sans-serif;color:#57606a;";
  const sel = document.createElement("select");
  sel.style.cssText = "flex:1;font:12px sans-serif;padding:2px 4px;";
  selRow.append(selLbl, sel);
  const controls = document.createElement("div");
  panel.append(selRow, controls);

  el.append(box, status, hint, editBar, panel);

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
    if (!b64) { status.textContent = "(no figure yet)"; return; }
    const mine = ++token;
    if (!svgEl()) status.textContent = "rendering…";
    try {
      const mod = await getWasm(model);
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

  // --- properties panel logic --------------------------------------------
  const parseJSON = (s) => { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } };
  let inputsByPath = {};

  function flattenTree(node, depth, out) {
    if (node && node.path && node.path !== "/")
      out.push({ path: node.path, name: node.name, type: node.type, depth });
    (node && node.children || []).forEach((c) => flattenTree(c, depth + 1, out));
    return out;
  }
  function rebuildTree() {
    const t = parseJSON(model.get("tree_json"));
    if (!t) return;
    const items = flattenTree(t, 0, []);
    const prev = sel.value;
    sel.innerHTML = "";
    for (const it of items) {
      const o = document.createElement("option");
      o.value = it.path;
      o.textContent = " ".repeat(Math.max(0, it.depth - 1) * 2) + it.name + "  (" + it.type + ")";
      sel.append(o);
    }
    if (prev && items.some((i) => i.path === prev)) {
      sel.value = prev;
    } else if (items.length) {
      const g = items.find((i) => i.type === "graph") || items[items.length - 1];
      sel.value = g.path;
    }
  }
  const requestSelect = (path) => { if (path) sendAction({ type: "select", path }); };
  const sendSet = (path, value) => sendAction({ type: "set", path, value });

  function makeInput(s) {
    let elc, get;
    if (Array.isArray(s.vallist) && s.vallist.length) {
      elc = document.createElement("select");
      s.vallist.forEach((v, i) => {
        const o = document.createElement("option");
        o.value = String(v);
        o.textContent = (Array.isArray(s.descriptions) && s.descriptions[i]) || String(v);
        elc.append(o);
      });
      elc.value = String(s.value);
      get = () => elc.value;
      elc.addEventListener("change", () => sendSet(s.path, get()));
    } else if (s.typename === "bool") {
      elc = document.createElement("input");
      elc.type = "checkbox";
      elc.checked = s.value === true || s.value === "True";
      get = () => elc.checked;
      elc.addEventListener("change", () => sendSet(s.path, elc.checked));
    } else if (s.typename === "int" || s.typename === "float") {
      elc = document.createElement("input");
      elc.type = "number";
      if (s.typename === "int") elc.step = "1";
      if (s.value !== null && s.value !== undefined) elc.value = String(s.value);
      get = () => elc.value;
      const commit = () => sendSet(s.path, elc.value === "" ? "" : Number(elc.value));
      elc.addEventListener("change", commit);
    } else {
      elc = document.createElement("input");
      elc.type = "text";
      // a colour value also gets a native swatch picker beside it
      elc.value = s.value === null || s.value === undefined ? "" : String(s.value);
      get = () => elc.value;
      elc.addEventListener("change", () => sendSet(s.path, elc.value));
    }
    elc.style.cssText = (elc.type === "checkbox")
      ? "margin:0;"
      : "flex:1;min-width:0;font:12px sans-serif;padding:1px 4px;";
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;align-items:center;gap:6px;flex:1;justify-content:flex-end;";
    wrap.append(elc);
    if (s.typename === "color" && typeof s.value === "string" && /^#?[0-9a-fA-F]{6}$/.test(s.value.replace(/^#/, ""))) {
      const sw = document.createElement("input");
      sw.type = "color";
      sw.value = s.value[0] === "#" ? s.value : "#" + s.value;
      sw.style.cssText = "width:26px;height:20px;padding:0;border:1px solid #d0d7de;";
      sw.addEventListener("input", () => { elc.value = sw.value; sendSet(s.path, sw.value); });
      wrap.append(sw);
    }
    return { el: elc, wrap, set: (v) => {
      if (elc.type === "checkbox") elc.checked = v === true || v === "True";
      else elc.value = v === null || v === undefined ? "" : String(v);
    } };
  }
  function controlRow(s) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:8px;padding:2px 0;";
    const lbl = document.createElement("label");
    lbl.textContent = s.usertext || s.name;
    lbl.title = s.descr || "";
    lbl.style.cssText = "font:12px sans-serif;color:#1f2328;flex:0 0 42%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    const inp = makeInput(s);
    inputsByPath[s.path] = inp;
    row.append(lbl, inp.wrap);
    return row;
  }
  function renderGroup(group, parent, isRoot) {
    (group.settings || []).filter((s) => !s.hidden).forEach((s) => parent.append(controlRow(s)));
    (group.subgroups || []).forEach((sub) => {
      if (!sub.settings && !sub.subgroups) return;
      const det = document.createElement("details");
      det.style.cssText = "margin:4px 0;";
      const sum = document.createElement("summary");
      sum.textContent = sub.usertext || sub.name;
      sum.style.cssText = "cursor:pointer;font:600 12px sans-serif;color:#57606a;";
      det.append(sum);
      const inner = document.createElement("div");
      inner.style.cssText = "padding-left:8px;";
      renderGroup(sub, inner, false);
      det.append(inner);
      parent.append(det);
    });
  }
  function rebuildControls() {
    const schema = parseJSON(model.get("props_json"));
    controls.innerHTML = "";
    inputsByPath = {};
    if (!schema) { controls.textContent = ""; return; }
    renderGroup(schema, controls, true);
    if (!controls.childNodes.length)
      controls.textContent = "(no editable settings)";
  }

  sel.addEventListener("change", () => requestSelect(sel.value));
  editToggle.addEventListener("click", () => {
    const opening = panel.style.display === "none";
    panel.style.display = opening ? "block" : "none";
    editToggle.textContent = opening ? "⚙ Edit ▴" : "⚙ Edit ▾";
    if (opening) {
      rebuildTree();
      if (sel.value && !controls.childNodes.length) requestSelect(sel.value);
    }
  });
  model.on("change:tree_json", rebuildTree);
  model.on("change:props_json", rebuildControls);
  model.on("change:value_echo", () => {
    const u = parseJSON(model.get("value_echo"));
    if (!u) return;
    const inp = inputsByPath[u.path];
    if (inp && document.activeElement !== inp.el) inp.set(u.value);
  });
  rebuildTree();

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
    # Wasm renderer bundled in the wheel, handed to the frontend so rendering
    # needs no network (kernel -> frontend only, so the leading underscore is
    # fine — those sync outward; only frontend -> kernel ignores them).
    _wasm_glue = traitlets.Unicode("").tag(sync=True)
    _wasm_bytes = traitlets.Bytes(b"").tag(sync=True)
    # frontend -> kernel: an interaction request (JSON: zoom / reset / select /
    # set). NB: no leading underscore — ipywidgets does not sync underscore-
    # prefixed custom traits from the frontend, so the observer would never fire.
    action = traitlets.Unicode("").tag(sync=True)
    # kernel -> frontend: data for the GUI properties panel.
    tree_json = traitlets.Unicode("").tag(sync=True)    # the widget tree
    props_json = traitlets.Unicode("").tag(sync=True)   # schema+values of the selected widget
    value_echo = traitlets.Unicode("").tag(sync=True)   # coerced value after a single set

    def __init__(self, vsz: str | None = None, width: int = 640,
                 height: int = 480, dpi: int = 96,
                 wasm_base: str | None = None, deterministic: bool = False,
                 **kwargs):
        super().__init__(**kwargs)
        self.width = int(width)
        self.height = int(height)
        if wasm_base:
            self.wasm_base = wasm_base
        # Hand the bundled wasm renderer to the frontend when present (no CDN).
        if _BUNDLED_WASM_GLUE and _BUNDLED_WASM_BYTES:
            self._wasm_glue = _BUNDLED_WASM_GLUE
            self._wasm_bytes = _BUNDLED_WASM_BYTES
        self._dpi = int(dpi)
        # Axis paths touched by interactive zoom, so reset knows what to clear.
        self._zoomed_axes: set[str] = set()
        # The Veusz document + handler set, living in this kernel.
        self._bridge = Bridge(deterministic=deterministic)
        if vsz is not None:
            self.load_vsz(vsz)
        else:
            # Publish the default document's tree so the panel is usable even
            # before a .vsz is loaded.
            self._refresh_tree()

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
        self._refresh_tree()
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
        elif kind == "select":
            self._select_gui(a.get("path", ""))
        elif kind == "set":
            self._set_gui(a.get("path", ""), a.get("value"))

    # -- GUI properties panel (frontend tree/inspector) ---------------------
    def _refresh_tree(self):
        """Publish the document's widget tree to the panel's chooser."""
        import json
        try:
            tree = self._call("doc.tree", {})
        except Exception:  # noqa: BLE001 - keep the figure alive if introspection fails
            return
        self.tree_json = json.dumps(tree)

    def _inspector_model(self, path: str) -> dict:
        """Schema of the widget at ``path``, with each leaf augmented with its
        full setting ``path`` and current ``value`` so the panel can build and
        populate controls in one shot."""
        schema = self._call("doc.schema_at", {"path": path})
        leaves: list[dict] = []

        def walk(group, prefix):
            for s in group.get("settings", []):
                s["path"] = f"{prefix}/{s['name']}"
                leaves.append(s)
            for sub in group.get("subgroups", []):
                walk(sub, f"{prefix}/{sub['name']}")

        walk(schema, path.rstrip("/"))
        if leaves:
            values = self._call("doc.get", {"paths": [s["path"] for s in leaves]})
            for s in leaves:
                s["value"] = _json_safe_value(values.get(s["path"]))
        schema["widget_path"] = path
        return schema

    def _select_gui(self, path: str):
        import json
        if not path:
            return
        try:
            model = self._inspector_model(path)
        except Exception as exc:  # noqa: BLE001 - surface as an empty panel, not a crash
            self.props_json = json.dumps({"settings": [], "subgroups": [],
                                          "error": str(exc)})
            return
        self.props_json = json.dumps(model)

    def _set_gui(self, path: str, value):
        import json
        if not path:
            return
        try:
            res = self._call("doc.set", {"path": path, "value": value})
        except Exception as exc:  # noqa: BLE001 - bad value: report, don't crash
            self.value_echo = json.dumps({"path": path, "error": str(exc)})
            return
        self.render()
        diffs = res.get("diffs") if isinstance(res, dict) else None
        if diffs:
            d = diffs[0]
            self.value_echo = json.dumps({"path": d.get("path", path),
                                          "value": _json_safe_value(d.get("new"))})


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
