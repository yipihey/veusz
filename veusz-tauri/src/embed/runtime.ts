/**
 * Boot the Veusz runtime inside Pyodide (CPython compiled to WebAssembly) so
 * the document model + the daemon's JSON-RPC handlers run entirely in the
 * browser — no server. Returns a `Transport` that the existing `Rpc`/store use
 * unchanged (see `workerTransport`), plus a `loadVsz` helper.
 *
 * Pyodide now runs inside a dedicated Web Worker (`pyodideWorker.ts`) rather
 * than on the page, so RPC calls no longer block the UI thread during
 * render/edit. This module spawns that worker, performs the init handshake,
 * and adapts its message protocol to the `Transport` interface — nothing
 * downstream (store, client, components) changes.
 *
 * The heavy runtime (Pyodide core, numpy, the veusz wheel, fonttools) loads
 * from a CDN by default so an author's page hosts only their `.vsz` + a small
 * loader; pass explicit URLs to vendor it for a self-contained bundle.
 *
 * Rendering is NOT done in the worker: handlers return the abstract Scene IR
 * (`render.scene`), which the Vello/WebGPU WASM renderer rasterises on a canvas
 * ON THE PAGE. We set `__VEUSZ_WASM_BASE__` (a page global) so that renderer
 * loads from `wasmBase`; only the Pyodide bridge moved into the worker.
 */

import { workerTransport, type Transport, type WorkerTransport } from '../rpc/transport';
import type { WorkerInitConfig } from './pyodideWorker';
import type { LocalDataFile } from './localData';

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
  /** Load a .vsz from its text; resolves once the document + datasets exist.
   *  Sidecar data files (from `ImportFile`/`ImportFileCSV`/… relative paths)
   *  are written next to the document first so those imports resolve. */
  loadVsz: (text: string, dataFiles?: LocalDataFile[]) => Promise<unknown>;
  /** Tear down the worker (and its Pyodide) — used by the custom element on
   *  disconnect so a removed figure frees its background thread. */
  dispose: () => void;
}

/**
 * Spawn the Pyodide worker and complete its init handshake.
 *
 * Vite's module-worker form `new Worker(new URL('./pyodideWorker.ts',
 * import.meta.url), { type: 'module' })` makes Vite emit the worker as a
 * separate chunk and rewrite the URL — both in dev and in the library build.
 * We pass all Pyodide config in the `init` message (the worker can't read the
 * DOM) and resolve once it posts `ready`, or reject with the real boot error
 * on `init-error` (so the embed UI shows a meaningful message).
 */
function spawnWorker(config: WorkerInitConfig): Promise<Worker> {
  const worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
    type: 'module',
  });
  return new Promise<Worker>((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      const msg = e.data as { type?: string; message?: string };
      if (msg.type === 'ready') {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        resolve(worker);
      } else if (msg.type === 'init-error') {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        worker.terminate();
        reject(new Error(msg.message || 'Pyodide worker failed to start'));
      }
    };
    // A worker-level `error` (e.g. the module failed to load / parse) never
    // reaches the init promise via a message, so surface it here too.
    const onError = (e: ErrorEvent) => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      worker.terminate();
      reject(new Error(e.message || 'Pyodide worker error'));
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({ type: 'init', config });
  });
}

export async function bootVeuszRuntime(opts: RuntimeOptions = {}): Promise<VeuszRuntime> {
  const progress = opts.onProgress ?? (() => {});
  if (opts.wasmBase) {
    // The Vello/WebGPU renderer runs on the PAGE (not the worker), so this
    // global must be set here on the main thread.
    (globalThis as unknown as { __VEUSZ_WASM_BASE__?: string }).__VEUSZ_WASM_BASE__ =
      opts.wasmBase;
  }

  // Boot Pyodide + install the wheel inside the worker. We can't report the
  // worker's fine-grained stages without an extra channel, so show coarse
  // progress around the one long await.
  progress('Loading runtime…');
  const worker = await spawnWorker({
    pyodideIndexUrl: opts.pyodideIndexUrl ?? DEFAULT_PYODIDE_INDEX,
    veuszWheelUrl: opts.veuszWheelUrl,
    extraWheels: opts.extraWheels,
  });

  const transport: WorkerTransport = workerTransport(worker);

  const loadVsz = (text: string, dataFiles: LocalDataFile[] = []) =>
    // The .vsz text + sidecar bytes are written into the worker's in-memory FS
    // there (it owns Pyodide); `request` correlates the reply by id like a
    // normal call and resolves with the `file.open` result.
    transport.request('loadVsz', {
      text,
      dataFiles: dataFiles.map((f) => ({ name: f.name, bytes: f.bytes })),
    });

  progress('Ready');
  return {
    transport,
    loadVsz,
    dispose: () => worker.terminate(),
  };
}
