/**
 * Transport abstraction for the JSON-RPC client.
 *
 * A `Transport` exposes:
 *  - `call(method, params)` — request/response
 *  - `subscribe(method, fn)` — register a listener for push notifications
 *
 * Three implementations:
 *
 *  - `tauriTransport()`        wraps Tauri `invoke('rpc', ...)` for calls
 *                              and `listen('veusz://notification')` for
 *                              pushes. Production runtime.
 *  - `mockTransport(handlers)` resolves against a map of handler fns;
 *                              has a manual `emit(method, params)` to
 *                              simulate push events in unit tests.
 *  - `clientTransport(client)` wraps the Node `NodeRpcClient` (which
 *                              owns the real UDS connection) — used by
 *                              the live-daemon e2e.
 *  - `pyodideTransport(bridge)` drives an in-process Pyodide `Bridge`
 *                              synchronously (kept for the contract test).
 *  - `workerTransport(worker)` drives the Pyodide `Bridge` running inside a
 *                              Web Worker, so RPC no longer blocks the UI
 *                              thread. The in-browser embed runtime uses this.
 */

export type Unsubscribe = () => void;
export type NotificationListener = (params: unknown) => void;

export interface Transport {
  call(method: string, params?: Record<string, unknown>): Promise<unknown>;
  subscribe(method: string, fn: NotificationListener): Unsubscribe;
}

let _tauriInvoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;
let _tauriListen: ((event: string, fn: (e: { payload: unknown }) => void) => Promise<() => void>) | null = null;

export function tauriTransport(): Transport {
  return {
    call: async (method, params = {}) => {
      if (!_tauriInvoke) {
        const mod = await import('@tauri-apps/api/core');
        _tauriInvoke = mod.invoke as unknown as typeof _tauriInvoke;
      }
      return _tauriInvoke!('rpc', { method, params });
    },
    subscribe: (method, fn) => {
      // We pipe the daemon's notifications through the Rust shell as
      // `veusz://notification` events with payload `{method, params}`.
      // The shell listens to the broadcast receiver and emits.
      let off: (() => void) | null = null;
      (async () => {
        if (!_tauriListen) {
          const mod = await import('@tauri-apps/api/event');
          _tauriListen = mod.listen as unknown as typeof _tauriListen;
        }
        off = await _tauriListen!('veusz://notification', (e) => {
          const payload = e.payload as { method: string; params: unknown };
          if (payload?.method === method) fn(payload.params);
        });
      })();
      return () => { off?.(); };
    },
  };
}

export interface MockTransport extends Transport {
  emit(method: string, params: unknown): void;
}

export function mockTransport(
  handlers: Record<string, (params: Record<string, unknown>) => unknown | Promise<unknown>>,
): MockTransport {
  const listeners = new Map<string, Set<NotificationListener>>();
  return {
    call: async (method, params = {}) => {
      const h = handlers[method];
      if (!h) throw new Error(`mockTransport: no handler for ${method}`);
      return await h(params);
    },
    subscribe: (method, fn) => {
      let ls = listeners.get(method);
      if (!ls) {
        ls = new Set();
        listeners.set(method, ls);
      }
      ls.add(fn);
      return () => { ls!.delete(fn); };
    },
    emit: (method, params) => {
      listeners.get(method)?.forEach((fn) => fn(params));
    },
  };
}

/**
 * The Veusz runtime running inside Pyodide. Produced by
 * `embed/runtime.ts`; here we only need its JSON-in/JSON-out dispatch and a
 * way to register the push-notification callback. Both sides of the FFI
 * exchange JSON strings, so there are no PyProxy lifetime concerns.
 */
export interface PyodideBridge {
  dispatch_json(request: string): string;
  set_notify(callback: (message: string) => void): void;
}

/**
 * Transport backed by the in-browser (Pyodide) Veusz runtime. Calls run the
 * Python handlers synchronously and resolve immediately; push notifications
 * arrive through the bridge's single notify callback and fan out to
 * per-method subscribers. Drop-in for the same `Transport` the daemon uses.
 */
export function pyodideTransport(bridge: PyodideBridge): Transport {
  const listeners = new Map<string, Set<NotificationListener>>();
  let nextId = 1;

  bridge.set_notify((message: string) => {
    let parsed: { method?: string; params?: unknown };
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }
    if (parsed.method) listeners.get(parsed.method)?.forEach((fn) => fn(parsed.params));
  });

  return {
    call: async (method, params = {}) => {
      const req = JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params });
      const resp = JSON.parse(bridge.dispatch_json(req)) as {
        result?: unknown;
        error?: { code: number; message: string; data?: unknown };
      };
      if (resp.error) {
        const err = new Error(resp.error.message || 'rpc error') as Error & {
          code?: number; data?: unknown;
        };
        err.code = resp.error.code;
        err.data = resp.error.data;
        throw err;
      }
      return resp.result;
    },
    subscribe: (method, fn) => {
      let ls = listeners.get(method);
      if (!ls) {
        ls = new Set();
        listeners.set(method, ls);
      }
      ls.add(fn);
      return () => { ls!.delete(fn); };
    },
  };
}

/**
 * Minimal view of a Web Worker — exactly the members `workerTransport` uses.
 * Lets us drive the transport from a fake in unit tests (no real Worker) while
 * the real {@link Worker} satisfies it structurally.
 */
export interface WorkerLike {
  postMessage(message: unknown): void;
  addEventListener(type: 'message', listener: (e: MessageEvent) => void): void;
  terminate?(): void;
}

/**
 * Transport backed by the Veusz runtime running inside a Web Worker (see
 * `embed/pyodideWorker.ts`). This is the off-main-thread successor to
 * {@link pyodideTransport}: instead of calling `bridge.dispatch_json`
 * synchronously on the UI thread, it posts `{id, type:'call', method, params}`
 * to the worker and resolves the matching Promise when `{id, result|error}`
 * comes back. Push notifications arrive as `{type:'notify', payload}` (a JSON
 * string, same as the bridge's notify callback) and fan out to per-method
 * subscribers. Same `Transport` surface, so nothing downstream changes.
 *
 * The returned object also exposes `request(type, extra)` — a generic
 * id-correlated round-trip the runtime uses for the `loadVsz` message, so call
 * and loadVsz share one pending-id map and one error contract.
 */
export interface WorkerTransport extends Transport {
  /** Generic id-correlated round-trip to the worker (used for `loadVsz`).
   *  Resolves with the worker's `result` or rejects with its `error`. */
  request(type: string, extra: Record<string, unknown>): Promise<unknown>;
}

export function workerTransport(worker: WorkerLike): WorkerTransport {
  const listeners = new Map<string, Set<NotificationListener>>();
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>();
  let nextId = 1;

  worker.addEventListener('message', (e: MessageEvent) => {
    const msg = e.data as {
      id?: number;
      result?: unknown;
      error?: { code?: number; message?: string; data?: unknown };
      type?: string;
      payload?: string;
    };
    // Push notification (no id): fan out to per-method subscribers. `payload`
    // is the same JSON string the in-process bridge produced.
    if (msg.type === 'notify') {
      let parsed: { method?: string; params?: unknown };
      try {
        parsed = JSON.parse(msg.payload ?? '');
      } catch {
        return;
      }
      if (parsed.method) listeners.get(parsed.method)?.forEach((fn) => fn(parsed.params));
      return;
    }
    // Reply to a call/loadVsz — settle the matching pending promise.
    if (typeof msg.id === 'number') {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) {
        const err = new Error(msg.error.message || 'rpc error') as Error & {
          code?: number; data?: unknown;
        };
        err.code = msg.error.code;
        err.data = msg.error.data;
        p.reject(err);
      } else {
        p.resolve(msg.result);
      }
    }
  });

  const request = (type: string, extra: Record<string, unknown>): Promise<unknown> => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, type, ...extra });
    });
  };

  return {
    call: (method, params = {}) => request('call', { method, params }),
    request,
    subscribe: (method, fn) => {
      let ls = listeners.get(method);
      if (!ls) {
        ls = new Set();
        listeners.set(method, ls);
      }
      ls.add(fn);
      return () => { ls!.delete(fn); };
    },
  };
}

/** Wraps a `NodeRpcClient` (which already owns request/response + on()). */
export function clientTransport(client: {
  call: <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>;
  on: (method: string, fn: NotificationListener) => Unsubscribe;
}): Transport {
  return {
    call: (method, params) => client.call(method, params),
    subscribe: (method, fn) => client.on(method, fn),
  };
}
