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
 * SINGLETON, MANY BRIDGES. One worker is shared by EVERY `<veusz-figure>` on a
 * page (see `runtime.ts`), so Pyodide + the veusz wheel are booted exactly once
 * no matter how many figures the page hosts (N figures used to mean N× Pyodide,
 * i.e. N× memory). Each figure owns its own `Bridge` (its own document) keyed by
 * a `bridgeId` the page assigns; messages carry that id so the worker routes
 * each call/loadVsz/notify to the right Bridge.
 *
 * Protocol (postMessage, structured-clone-safe plain objects only). EVERY
 * inbound/outbound message carries the `bridgeId` it belongs to:
 *
 *   page → worker:
 *     {bridgeId, type:'init',    config}          ensure Pyodide is up (booted on
 *                                                 the FIRST init) + add a Bridge
 *     {bridgeId, id, type:'call',    method, params}   one JSON-RPC call
 *     {bridgeId, id, type:'loadVsz', text, dataFiles}  write files + open the .vsz
 *     {bridgeId, type:'dispose'}                  drop this Bridge; when the last
 *                                                 Bridge is gone the worker
 *                                                 self-terminates
 *
 *   worker → page:
 *     {bridgeId, type:'ready'}                    init finished for this bridge
 *     {bridgeId, type:'init-error', message, stack}
 *     {bridgeId, id, result}                      reply to a call/loadVsz
 *     {bridgeId, id, error:{message,code,data}}   reply to a call/loadVsz
 *     {bridgeId, type:'notify', payload}          a Bridge push notification
 *                                                 (JSON string)
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
  close(): void;
};

/** Init payload — mirrors the URL-derived options the page used to read off
 *  `<veusz-figure>` attributes. Must be structured-clone-safe (plain data).
 *  Only the FIRST figure's config boots Pyodide; later figures reuse it (the
 *  page is expected to pass consistent URLs — they all share one Pyodide). */
export interface WorkerInitConfig {
  /** Pyodide distribution dir (must end in '/'). Threaded through as Pyodide's
   *  `indexURL`, so it CAN be pointed at the same dist a co-hosted notebook's
   *  Pyodide uses — the browser then serves the core download from cache rather
   *  than fetching it twice. */
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

// Inbound message shapes (page → worker). Every message names its `bridgeId`.
type InitMsg = { bridgeId: string; type: 'init'; config: WorkerInitConfig };
type CallMsg = {
  bridgeId: string;
  id: number;
  type: 'call';
  method: string;
  params?: Record<string, unknown>;
};
type LoadVszMsg = {
  bridgeId: string;
  id: number;
  type: 'loadVsz';
  text: string;
  // Sidecar data files: name (relative path) + bytes. Bytes survive
  // structured clone as a Uint8Array (its buffer is copied, not shared).
  dataFiles: { name: string; bytes: Uint8Array }[];
};
type DisposeMsg = { bridgeId: string; type: 'dispose' };
type InboundMsg = InitMsg | CallMsg | LoadVszMsg | DisposeMsg;

/** The single, page-shared Pyodide. Booted lazily on the first `init` and then
 *  reused by every Bridge. A boot in flight is tracked as a Promise so that two
 *  figures racing to mount don't boot Pyodide twice. */
let _pyodide: PyodideLike | null = null;
let _pyodideBoot: Promise<PyodideLike> | null = null;

/** One Bridge (one document) per figure, keyed by the page-assigned bridgeId. */
const _bridges = new Map<string, PyodideBridgePy>();

// Each figure gets its own directory so sidecar data files written by basename
// never collide and relative imports resolve against the document's own
// directory — same scheme the old in-page runtime used. The bridgeId is
// sanitised into a filesystem-safe segment.
function figDir(bridgeId: string): string {
  const safe = bridgeId.replace(/[^A-Za-z0-9_-]/g, '_');
  return `/veusz/${safe}`;
}
function vszPath(bridgeId: string): string {
  return `${figDir(bridgeId)}/figure.vsz`;
}

/** Boot the page-shared Pyodide ONCE: load numpy/micropip, install fonttools,
 *  any extra wheels, then the veusz wheel. Concurrent callers await the same
 *  in-flight Promise so Pyodide is never booted twice. `indexURL` comes from the
 *  first figure's config (see {@link WorkerInitConfig.pyodideIndexUrl}). */
async function ensurePyodide(config: WorkerInitConfig): Promise<PyodideLike> {
  if (_pyodide) return _pyodide;
  if (_pyodideBoot) return _pyodideBoot;
  const boot = (async () => {
    const indexUrl = config.pyodideIndexUrl;
    // We run as a MODULE worker (`{type:'module'}`), where `importScripts` is
    // not available — load the ES-module build of the Pyodide loader with a
    // dynamic `import()` of `pyodide.mjs` (same module the in-page runtime
    // used). The `/* @vite-ignore */` keeps Vite from bundling this CDN URL.
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

    _pyodide = py;
    return py;
  })();
  // Track the in-flight boot so concurrent figures await ONE boot, but clear it
  // on failure so a later figure can retry (a stuck rejected promise would
  // otherwise doom every subsequent figure on the page).
  _pyodideBoot = boot;
  boot.catch(() => {
    if (_pyodideBoot === boot) _pyodideBoot = null;
  });
  return boot;
}

/** Ensure Pyodide is up (booting it on the first figure) and create a fresh
 *  Bridge for `bridgeId`. Each Bridge registers widgets + a fresh document under
 *  qtshim; the heavy Pyodide/wheel install happens at most once for the page. */
async function init(bridgeId: string, config: WorkerInitConfig): Promise<void> {
  const py = await ensurePyodide(config);

  // Idempotent: a re-init for an existing bridgeId reuses its Bridge.
  if (_bridges.has(bridgeId)) return;

  // NB: Pyodide Python classes are instantiated by *calling* them, not with
  // `new` (which returns a bare JS object lacking the Python methods).
  const bridgeMod = py.pyimport('veusz.daemon.pyodide_bridge') as {
    Bridge: () => PyodideBridgePy;
  };
  const bridge = bridgeMod.Bridge();
  // Forward every Bridge push notification (a JSON string) to the page, tagged
  // with this figure's bridgeId so the page-side transport routes it to the
  // right figure before fanning out to per-method subscribers.
  bridge.set_notify((message: string) => {
    ctx.postMessage({ bridgeId, type: 'notify', payload: message });
  });

  _bridges.set(bridgeId, bridge);
}

/** Run one JSON-RPC request through the named Bridge. `dispatch_json` is
 *  JSON-in / JSON-out and never throws (handler errors come back as an `error`
 *  member), so we parse and split into `{result}` / `{error}` for the page. */
function handleCall(msg: CallMsg): void {
  const bridge = _bridges.get(msg.bridgeId);
  if (!bridge) {
    ctx.postMessage({
      bridgeId: msg.bridgeId,
      id: msg.id,
      error: { message: 'worker bridge not initialised' },
    });
    return;
  }
  try {
    const req = JSON.stringify({
      jsonrpc: '2.0',
      id: msg.id,
      method: msg.method,
      params: msg.params ?? {},
    });
    const resp = JSON.parse(bridge.dispatch_json(req)) as {
      result?: unknown;
      error?: { code: number; message: string; data?: unknown };
    };
    if (resp.error) {
      ctx.postMessage({ bridgeId: msg.bridgeId, id: msg.id, error: resp.error });
    } else {
      ctx.postMessage({ bridgeId: msg.bridgeId, id: msg.id, result: resp.result });
    }
  } catch (e) {
    ctx.postMessage({
      bridgeId: msg.bridgeId,
      id: msg.id,
      error: { message: (e as Error).message ?? String(e) },
    });
  }
}

/** Write the .vsz text + any sidecar data files into Pyodide's in-worker FS
 *  (under this bridge's own dir), then dispatch `file.open` so recent-files +
 *  change notifications fire exactly like the desktop. Mirrors the old in-page
 *  `loadVsz`. */
async function handleLoadVsz(msg: LoadVszMsg): Promise<void> {
  if (!_pyodide || !_bridges.has(msg.bridgeId)) {
    ctx.postMessage({
      bridgeId: msg.bridgeId,
      id: msg.id,
      error: { message: 'worker bridge not initialised' },
    });
    return;
  }
  try {
    const py = _pyodide;
    const dir = figDir(msg.bridgeId);
    await py.runPythonAsync(
      `import os; os.makedirs(${JSON.stringify(dir)}, exist_ok=True)`,
    );
    for (const f of msg.dataFiles) {
      const path = `${dir}/${f.name}`;
      const subdir = path.slice(0, path.lastIndexOf('/'));
      if (subdir && subdir !== dir) {
        await py.runPythonAsync(
          `import os; os.makedirs(${JSON.stringify(subdir)}, exist_ok=True)`,
        );
      }
      py.FS.writeFile(path, f.bytes);
    }
    py.FS.writeFile(vszPath(msg.bridgeId), msg.text);
    // Reuse the same dispatch path as a normal call so error handling matches.
    handleCall({
      bridgeId: msg.bridgeId,
      id: msg.id,
      type: 'call',
      method: 'file.open',
      params: { path: vszPath(msg.bridgeId) },
    });
  } catch (e) {
    ctx.postMessage({
      bridgeId: msg.bridgeId,
      id: msg.id,
      error: { message: (e as Error).message ?? String(e) },
    });
  }
}

/** Drop a figure's Bridge. When the last Bridge is gone the worker has nothing
 *  left to serve, so it self-terminates (`close()`) to free Pyodide's memory —
 *  the main thread also calls `terminate()` at refcount zero, so this is a
 *  belt-and-braces second path, not the sole one. */
function handleDispose(bridgeId: string): void {
  _bridges.delete(bridgeId);
  if (_bridges.size === 0) {
    // No documents left. Closing here releases the (large) Pyodide heap even if
    // the page somehow loses its handle before calling terminate().
    ctx.close();
  }
}

ctx.onmessage = (e: MessageEvent) => {
  const msg = e.data as InboundMsg;
  switch (msg.type) {
    case 'init':
      init(msg.bridgeId, msg.config).then(
        () => ctx.postMessage({ bridgeId: msg.bridgeId, type: 'ready' }),
        (err: unknown) =>
          ctx.postMessage({
            bridgeId: msg.bridgeId,
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
    case 'dispose':
      handleDispose(msg.bridgeId);
      break;
  }
};
