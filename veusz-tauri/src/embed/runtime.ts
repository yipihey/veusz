/**
 * Boot the Veusz runtime inside Pyodide (CPython compiled to WebAssembly) so
 * the document model + the daemon's JSON-RPC handlers run entirely in the
 * browser — no server. Returns a `Transport` that the existing `Rpc`/store use
 * unchanged (see `pyodideTransport`), plus a `loadVsz` helper and the raw
 * Pyodide instance.
 *
 * The heavy runtime (Pyodide core, numpy, the veusz wheel, fonttools) loads
 * from a CDN by default so an author's page hosts only their `.vsz` + a small
 * loader; pass explicit URLs to vendor it for a self-contained bundle.
 *
 * Rendering is NOT done here: handlers return the abstract Scene IR
 * (`render.scene`), which the Vello/WebGPU WASM renderer rasterises on a
 * canvas. We set `__VEUSZ_WASM_BASE__` so that renderer loads from `wasmBase`.
 */

import { pyodideTransport, type PyodideBridge, type Transport } from '../rpc/transport';

const PYODIDE_VERSION = '0.26.4';
const DEFAULT_PYODIDE_INDEX =
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export interface RuntimeOptions {
  /** Pyodide distribution dir (must end in '/'). Defaults to jsDelivr. */
  pyodideIndexUrl?: string;
  /** URL of the headless veusz wheel (built by W5). Required unless the
   *  package is already importable in the Pyodide FS (dev/source mode). */
  veuszWheelUrl?: string;
  /** Extra wheels to micropip-install (e.g. a pinned fonttools). */
  extraWheels?: string[];
  /** Base URL the Vello WASM renderer loads from (sets __VEUSZ_WASM_BASE__). */
  wasmBase?: string;
  /** Progress callback for the loading UI. */
  onProgress?: (stage: string) => void;
}

export interface VeuszRuntime {
  transport: Transport;
  bridge: PyodideBridge;
  /** Load a .vsz from its text; resolves once the document + datasets exist. */
  loadVsz: (text: string) => Promise<unknown>;
  /** The raw Pyodide instance (escape hatch). */
  pyodide: PyodideLike;
}

interface PyodideLike {
  loadPackage(names: string[]): Promise<void>;
  pyimport(name: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  FS: { writeFile(path: string, data: string): void };
}

// The heavy runtime (Pyodide + numpy + veusz + fonttools) is loaded once and
// shared across every figure on the page; each figure gets its own Bridge
// (its own document) below.
let _sharedPyodide: Promise<PyodideLike> | null = null;

async function ensurePyodide(opts: RuntimeOptions): Promise<PyodideLike> {
  if (_sharedPyodide) return _sharedPyodide;
  const indexUrl = opts.pyodideIndexUrl ?? DEFAULT_PYODIDE_INDEX;
  const progress = opts.onProgress ?? (() => {});
  _sharedPyodide = (async () => {
    progress('Loading Pyodide…');
    const pyMod = (await import(/* @vite-ignore */ `${indexUrl}pyodide.mjs`)) as {
      loadPyodide(cfg: { indexURL: string }): Promise<PyodideLike>;
    };
    const py = await pyMod.loadPyodide({ indexURL: indexUrl });
    progress('Loading numpy…');
    await py.loadPackage(['numpy', 'micropip']);
    progress('Installing Veusz…');
    const micropip = py.pyimport('micropip') as {
      install(reqs: string | string[]): Promise<void>;
    };
    // fonttools is pure-Python (font metrics for the qtshim); scipy is left
    // out of the base boot — only the fit handler needs it (install lazily).
    await micropip.install('fonttools');
    if (opts.extraWheels?.length) await micropip.install(opts.extraWheels);
    if (opts.veuszWheelUrl) await micropip.install(opts.veuszWheelUrl);
    return py;
  })().catch((e) => { _sharedPyodide = null; throw e; });
  return _sharedPyodide;
}

let _vszSeq = 0;

export async function bootVeuszRuntime(opts: RuntimeOptions = {}): Promise<VeuszRuntime> {
  const progress = opts.onProgress ?? (() => {});
  if (opts.wasmBase) {
    (globalThis as unknown as { __VEUSZ_WASM_BASE__?: string }).__VEUSZ_WASM_BASE__ =
      opts.wasmBase;
  }

  const py = await ensurePyodide(opts);

  progress('Starting renderer…');
  // Each figure gets its own bridge (registers widgets + a fresh document
  // under qtshim), so multiple embeds on a page are independent.
  const bridgeMod = py.pyimport('veusz.daemon.pyodide_bridge') as {
    Bridge: new () => PyodideBridge;
  };
  const bridge = new bridgeMod.Bridge();
  const transport = pyodideTransport(bridge);

  const vszPath = `/veusz/figure_${_vszSeq++}.vsz`;
  const loadVsz = async (text: string) => {
    // Write into Pyodide's in-memory FS and reuse the file.open handler so
    // recent-files + change notifications fire exactly like the desktop.
    try {
      py.FS.writeFile(vszPath, text);
    } catch {
      await py.runPythonAsync(`import os; os.makedirs('/veusz', exist_ok=True)`);
      py.FS.writeFile(vszPath, text);
    }
    return transport.call('file.open', { path: vszPath });
  };

  progress('Ready');
  return { transport, bridge, loadVsz, pyodide: py };
}
