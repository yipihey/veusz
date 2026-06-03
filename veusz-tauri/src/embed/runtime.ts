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
 * ONE WORKER PER PAGE. The worker is a module-level, ref-counted SINGLETON:
 * every `<veusz-figure>` on the page shares it, so Pyodide + the veusz wheel
 * boot exactly once regardless of how many figures there are (the old model
 * spawned one worker — one whole Pyodide — per figure, i.e. N× memory). Each
 * figure gets a unique `bridgeId`; its `workerTransport` tags traffic with that
 * id so the shared worker routes calls/notifications to the right Bridge.
 * `VeuszRuntime.dispose()` drops that figure's bridge and decrements the
 * refcount; the worker is terminated only when the LAST figure goes away.
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
 * Page-level worker singleton + refcount.
 *
 * `_worker` is created lazily on the first figure and reused by every later
 * one; `_refcount` tracks how many live figures (bridges) hold it. The worker
 * is terminated and the singleton cleared when the count returns to zero, so a
 * page that adds then removes all its figures leaves no orphan thread, and a
 * later figure spins a fresh worker.
 *
 * MANUAL VERIFICATION (can't run real Pyodide in jsdom):
 *  1. Put TWO `<veusz-figure>` on a page (both eager / both clicked). In
 *     DevTools → Sources → Threads (or `performance.memory`), confirm exactly
 *     ONE pyodideWorker thread exists — not two. Both figures render.
 *  2. Remove one figure from the DOM (e.g. `el.remove()`). The other keeps
 *     rendering/editing; the worker thread is STILL present (refcount 2 → 1).
 *  3. Remove the LAST figure. The worker thread disappears (refcount 1 → 0 →
 *     `terminate()`), freeing the Pyodide heap.
 *  4. Add a figure again afterwards → a fresh worker is spawned and boots
 *     Pyodide once more.
 *  5. (indexURL cache) Set `pyodide-index` to the same dist a co-hosted
 *     notebook's Pyodide uses → the Pyodide core download is served from the
 *     browser cache (one network fetch shared), not fetched twice.
 */
let _worker: Worker | null = null;
let _refcount = 0;
let _bridgeSeq = 0;

/** Get (creating on first use) the shared Pyodide worker.
 *
 * Vite's module-worker form `new Worker(new URL('./pyodideWorker.ts',
 * import.meta.url), { type: 'module' })` makes Vite emit the worker as a
 * separate chunk and rewrite the URL — both in dev and in the library build. */
function getSharedWorker(): Worker {
  if (!_worker) {
    _worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return _worker;
}

/** Drop a reference to the shared worker; terminate it at zero. */
function releaseSharedWorker(): void {
  _refcount = Math.max(0, _refcount - 1);
  if (_refcount === 0 && _worker) {
    _worker.terminate();
    _worker = null;
  }
}

/**
 * Add this figure's Bridge to the shared worker and complete its init
 * handshake. We post `{bridgeId, type:'init', config}` and resolve once the
 * worker replies `{bridgeId, type:'ready'}`, or reject with the real boot error
 * on `{bridgeId, type:'init-error'}` (so the embed UI shows a meaningful
 * message). Only messages tagged with THIS bridgeId settle the handshake, so
 * concurrent figures booting at once don't cross wires. A worker-level `error`
 * (module failed to load/parse) carries no bridgeId, so it fails the first
 * pending handshake.
 */
function initBridge(
  worker: Worker,
  bridgeId: string,
  config: WorkerInitConfig,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };
    const onMessage = (e: MessageEvent) => {
      const msg = e.data as { bridgeId?: string; type?: string; message?: string };
      if (msg.bridgeId !== bridgeId) return;
      if (msg.type === 'ready') {
        cleanup();
        resolve();
      } else if (msg.type === 'init-error') {
        cleanup();
        reject(new Error(msg.message || 'Pyodide worker failed to start'));
      }
    };
    const onError = (e: ErrorEvent) => {
      cleanup();
      reject(new Error(e.message || 'Pyodide worker error'));
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({ bridgeId, type: 'init', config });
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

  // Grab the shared worker and reserve a slot up front. We bump the refcount
  // BEFORE the async init so that a teardown racing an in-flight boot can't
  // terminate the worker out from under us; if init throws we release it.
  const worker = getSharedWorker();
  _refcount += 1;
  const bridgeId = `fig_${_bridgeSeq++}`;
  let disposed = false;

  // Boot Pyodide (first figure) + add this figure's Bridge inside the worker.
  // We can't report the worker's fine-grained stages without an extra channel,
  // so show coarse progress around the one long await.
  progress('Loading runtime…');
  try {
    await initBridge(worker, bridgeId, {
      pyodideIndexUrl: opts.pyodideIndexUrl ?? DEFAULT_PYODIDE_INDEX,
      veuszWheelUrl: opts.veuszWheelUrl,
      extraWheels: opts.extraWheels,
    });
  } catch (e) {
    releaseSharedWorker();
    throw e;
  }

  // Per-figure transport, tagged with this bridgeId so it only sees its own
  // replies/notifications over the shared worker.
  const transport: WorkerTransport = workerTransport(worker, bridgeId);

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
    dispose: () => {
      // Idempotent: a double dispose must not double-decrement the refcount.
      if (disposed) return;
      disposed = true;
      // Tell the worker to drop this figure's Bridge, detach our transport,
      // then release our hold on the shared worker (terminating it at zero).
      try {
        worker.postMessage({ bridgeId, type: 'dispose' });
      } catch {
        // Worker may already be terminated by a concurrent last-release; ignore.
      }
      transport.dispose();
      releaseSharedWorker();
    },
  };
}
