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
