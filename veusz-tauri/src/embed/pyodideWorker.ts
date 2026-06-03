/**
 * Pyodide Web Worker — runs the in-browser Veusz runtime OFF the main thread.
 *
 * Historically the Pyodide bridge (`veusz.daemon.pyodide_bridge.Bridge`) ran in
 * the page context, so every RPC call executed Python synchronously on the UI
 * thread and froze the page during render/edit. This module is a dedicated
 * (module) Web Worker that owns Pyodide, the veusz wheel, and the per-figure
 * `Bridge`, so all of that work happens on a background thread and the UI stays
 * responsive.
 *
 * Protocol (postMessage, structured-clone-safe plain objects only):
 *
 *   page → worker:
 *     {type:'init',    config}          boot Pyodide + install the wheel
 *     {id, type:'call',    method, params}   one JSON-RPC call
 *     {id, type:'loadVsz', text, dataFiles}  write files + open the .vsz
 *
 *   worker → page:
 *     {type:'ready'}                    init finished (Pyodide + wheel up)
 *     {type:'init-error', message, stack}
 *     {id, result}                      reply to a call/loadVsz
 *     {id, error:{message,code,data}}   reply to a call/loadVsz
 *     {type:'notify', payload}          a Bridge push notification (JSON string)
 *
 * The worker CANNOT read the DOM, so every URL/config value (pyodide index,
 * wheel URL, extra wheels) arrives in the `init` message. The Vello/WebGPU
 * renderer is NOT here — it stays on the page and consumes the Scene IR these
 * handlers return; only the Pyodide bridge moves into the worker.
 *
 * Both sides of the Pyodide FFI exchange JSON *strings* (`dispatch_json`,
 * notify), and every postMessage payload is a plain JSON-able object, so there
 * are no PyProxy lifetime concerns crossing the worker boundary.
 */

/// <reference lib="webworker" />

// The dedicated-worker global. We avoid relying on the WebWorker lib being in
// tsconfig's `lib` (it isn't — the app targets DOM) by typing `self` narrowly
// to exactly the members we use.
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage(message: unknown): void;
};

/** Init payload — mirrors the URL-derived options the page used to read off
 *  `<veusz-figure>` attributes. Must be structured-clone-safe (plain data). */
export interface WorkerInitConfig {
  /** Pyodide distribution dir (must end in '/'). */
  pyodideIndexUrl: string;
  /** URL of the headless veusz wheel (built by W5). Optional in dev/source. */
  veuszWheelUrl?: string;
  /** Extra wheels to micropip-install (e.g. a pinned fonttools). */
  extraWheels?: string[];
}

interface PyodideLike {
  loadPackage(names: string[]): Promise<void>;
  pyimport(name: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  FS: { writeFile(path: string, data: string | Uint8Array): void };
}

interface PyodideBridgePy {
  dispatch_json(request: string): string;
  set_notify(callback: (message: string) => void): void;
}

// Inbound message shapes (page → worker).
type InitMsg = { type: 'init'; config: WorkerInitConfig };
type CallMsg = { id: number; type: 'call'; method: string; params?: Record<string, unknown> };
type LoadVszMsg = {
  id: number;
  type: 'loadVsz';
  text: string;
  // Sidecar data files: name (relative path) + bytes. Bytes survive
  // structured clone as a Uint8Array (its buffer is copied, not shared).
  dataFiles: { name: string; bytes: Uint8Array }[];
};
type InboundMsg = InitMsg | CallMsg | LoadVszMsg;

let _pyodide: PyodideLike | null = null;
let _bridge: PyodideBridgePy | null = null;
// Each figure (one worker) gets its own directory so sidecar data files written
// by basename never collide and relative imports resolve against the document's
// own directory — same scheme the old in-page runtime used.
const FIG_DIR = '/veusz/fig_0';
const VSZ_PATH = `${FIG_DIR}/figure.vsz`;

/** Boot Pyodide, install numpy/micropip + fonttools + the veusz wheel, and
 *  construct the per-figure Bridge. Wires the Bridge notify callback to forward
 *  push notifications to the page. Resolves once everything is importable. */
async function init(config: WorkerInitConfig): Promise<void> {
  const indexUrl = config.pyodideIndexUrl;
  // We run as a MODULE worker (`{type:'module'}`), where `importScripts` is not
  // available — load the ES-module build of the Pyodide loader with a dynamic
  // `import()` of `pyodide.mjs` (same module the in-page runtime used). The
  // `/* @vite-ignore */` keeps Vite from trying to bundle this runtime CDN URL.
  const pyMod = (await import(/* @vite-ignore */ `${indexUrl}pyodide.mjs`)) as {
    loadPyodide(cfg: { indexURL: string }): Promise<PyodideLike>;
  };
  const py = await pyMod.loadPyodide({ indexURL: indexUrl });

  await py.loadPackage(['numpy', 'micropip']);
  const micropip = py.pyimport('micropip') as {
    install(reqs: string | string[]): Promise<void>;
  };
  // fonttools is pure-Python (font metrics for the qtshim); scipy is installed
  // lazily by the fit handler only, so it is left out of the base boot.
  await micropip.install('fonttools');
  if (config.extraWheels?.length) await micropip.install(config.extraWheels);
  if (config.veuszWheelUrl) await micropip.install(config.veuszWheelUrl);

  // Each figure gets its own bridge (registers widgets + a fresh document under
  // qtshim). NB: Pyodide Python classes are instantiated by *calling* them, not
  // with `new` (which returns a bare JS object lacking the Python methods).
  const bridgeMod = py.pyimport('veusz.daemon.pyodide_bridge') as {
    Bridge: () => PyodideBridgePy;
  };
  const bridge = bridgeMod.Bridge();
  // Forward every Bridge push notification (a JSON string) to the page. The
  // page-side transport parses + fans these out to per-method subscribers.
  bridge.set_notify((message: string) => {
    ctx.postMessage({ type: 'notify', payload: message });
  });

  _pyodide = py;
  _bridge = bridge;
}

/** Run one JSON-RPC request through the Bridge. `dispatch_json` is JSON-in /
 *  JSON-out and never throws (handler errors come back as an `error` member),
 *  so we parse and split into `{result}` / `{error}` for the page. */
function handleCall(msg: CallMsg): void {
  if (!_bridge) {
    ctx.postMessage({ id: msg.id, error: { message: 'worker not initialised' } });
    return;
  }
  try {
    const req = JSON.stringify({
      jsonrpc: '2.0',
      id: msg.id,
      method: msg.method,
      params: msg.params ?? {},
    });
    const resp = JSON.parse(_bridge.dispatch_json(req)) as {
      result?: unknown;
      error?: { code: number; message: string; data?: unknown };
    };
    if (resp.error) {
      ctx.postMessage({ id: msg.id, error: resp.error });
    } else {
      ctx.postMessage({ id: msg.id, result: resp.result });
    }
  } catch (e) {
    ctx.postMessage({
      id: msg.id,
      error: { message: (e as Error).message ?? String(e) },
    });
  }
}

/** Write the .vsz text + any sidecar data files into Pyodide's in-worker FS,
 *  then dispatch `file.open` so recent-files + change notifications fire exactly
 *  like the desktop. Mirrors the old in-page `loadVsz`. */
async function handleLoadVsz(msg: LoadVszMsg): Promise<void> {
  if (!_pyodide || !_bridge) {
    ctx.postMessage({ id: msg.id, error: { message: 'worker not initialised' } });
    return;
  }
  try {
    const py = _pyodide;
    await py.runPythonAsync(
      `import os; os.makedirs(${JSON.stringify(FIG_DIR)}, exist_ok=True)`,
    );
    for (const f of msg.dataFiles) {
      const path = `${FIG_DIR}/${f.name}`;
      const dir = path.slice(0, path.lastIndexOf('/'));
      if (dir && dir !== FIG_DIR) {
        await py.runPythonAsync(
          `import os; os.makedirs(${JSON.stringify(dir)}, exist_ok=True)`,
        );
      }
      py.FS.writeFile(path, f.bytes);
    }
    py.FS.writeFile(VSZ_PATH, msg.text);
    // Reuse the same dispatch path as a normal call so error handling matches.
    handleCall({
      id: msg.id,
      type: 'call',
      method: 'file.open',
      params: { path: VSZ_PATH },
    });
  } catch (e) {
    ctx.postMessage({
      id: msg.id,
      error: { message: (e as Error).message ?? String(e) },
    });
  }
}

ctx.onmessage = (e: MessageEvent) => {
  const msg = e.data as InboundMsg;
  switch (msg.type) {
    case 'init':
      init(msg.config).then(
        () => ctx.postMessage({ type: 'ready' }),
        (err: unknown) =>
          ctx.postMessage({
            type: 'init-error',
            message: (err as Error)?.message ?? String(err),
            stack: (err as Error)?.stack,
          }),
      );
      break;
    case 'call':
      handleCall(msg);
      break;
    case 'loadVsz':
      void handleLoadVsz(msg);
      break;
  }
};
