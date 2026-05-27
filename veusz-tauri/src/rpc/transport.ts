/**
 * Transport abstraction for the JSON-RPC client.
 *
 * A `Transport` is just `(method, params) => Promise<result>`. Three
 * implementations:
 *
 *  - `tauriTransport()`        uses `invoke('rpc', {method, params})`
 *                              — production runtime under the Tauri shell.
 *  - `mockTransport(handlers)` resolves against a map of handler fns
 *                              — used by unit tests.
 *  - `nodeTransport(client)`   wraps the `NodeRpcClient` from
 *                              `src/test/node-rpc.ts` — used by the
 *                              live-daemon e2e test.
 *
 * The split keeps the components and the Zustand store free of any
 * Tauri-specific imports, which is what lets the live-daemon e2e
 * exercise the real app shell in Node.
 */

export type Transport = (
  method: string,
  params?: Record<string, unknown>,
) => Promise<unknown>;

let _tauriInvoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;

export function tauriTransport(): Transport {
  return async (method, params = {}) => {
    if (!_tauriInvoke) {
      const mod = await import('@tauri-apps/api/core');
      _tauriInvoke = mod.invoke as unknown as typeof _tauriInvoke;
    }
    return _tauriInvoke!('rpc', { method, params });
  };
}

export function mockTransport(
  handlers: Record<string, (params: Record<string, unknown>) => unknown | Promise<unknown>>,
): Transport {
  return async (method, params = {}) => {
    const h = handlers[method];
    if (!h) throw new Error(`mockTransport: no handler for ${method}`);
    return await h(params);
  };
}

/** Wraps any object with `.call(method, params)` (e.g. `NodeRpcClient`). */
export function clientTransport(client: {
  call: <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>;
}): Transport {
  return (method, params) => client.call(method, params);
}
