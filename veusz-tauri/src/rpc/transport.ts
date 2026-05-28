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
