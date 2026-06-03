import { describe, it, expect, vi } from 'vitest';
import { workerTransport, type WorkerLike } from './transport';

/**
 * A fake Web Worker mirroring `embed/pyodideWorker.ts`'s protocol, but running
 * the dispatch inline so the transport can be unit-tested without real Pyodide
 * (which can't run in jsdom/happy-dom). It echoes the bridge's JSON contract:
 * `{id, result|error}` replies and `{type:'notify', payload}` pushes.
 */
function fakeWorker(): WorkerLike & {
  push(method: string, params: unknown): void;
  terminated: boolean;
} {
  let listener: ((e: MessageEvent) => void) | null = null;
  const emit = (data: unknown) => listener?.({ data } as MessageEvent);
  return {
    terminated: false,
    postMessage(message: unknown) {
      const m = message as {
        id: number;
        type: string;
        method?: string;
        params?: Record<string, unknown>;
        text?: string;
      };
      // Reply asynchronously, like a real worker thread would.
      queueMicrotask(() => {
        if (m.type === 'call') {
          if (m.method === 'ping') {
            emit({ id: m.id, result: { pong: true } });
          } else if (m.method === 'boom') {
            emit({ id: m.id, error: { code: -32603, message: 'kaboom', data: { x: 1 } } });
          } else {
            emit({ id: m.id, result: { echo: m.params } });
          }
        } else if (m.type === 'loadVsz') {
          emit({ id: m.id, result: { opened: m.text } });
        }
      });
    },
    addEventListener(_type: 'message', l: (e: MessageEvent) => void) {
      listener = l;
    },
    terminate() {
      this.terminated = true;
    },
    push(method: string, params: unknown) {
      emit({ type: 'notify', payload: JSON.stringify({ jsonrpc: '2.0', method, params }) });
    },
  };
}

describe('workerTransport', () => {
  it('round-trips a call correlated by id', async () => {
    const t = workerTransport(fakeWorker());
    expect(await t.call('ping')).toEqual({ pong: true });
    expect(await t.call('whatever', { a: 1 })).toEqual({ echo: { a: 1 } });
  });

  it('resolves concurrent calls to the right promise', async () => {
    const t = workerTransport(fakeWorker());
    const [a, b] = await Promise.all([t.call('ping'), t.call('echo', { n: 2 })]);
    expect(a).toEqual({ pong: true });
    expect(b).toEqual({ echo: { n: 2 } });
  });

  it('rejects with the JSON-RPC error (code + data preserved)', async () => {
    const t = workerTransport(fakeWorker());
    await expect(t.call('boom')).rejects.toMatchObject({
      message: 'kaboom', code: -32603, data: { x: 1 },
    });
  });

  it('request() drives loadVsz through the same id correlation', async () => {
    const t = workerTransport(fakeWorker());
    expect(await t.request('loadVsz', { text: 'X', dataFiles: [] })).toEqual({ opened: 'X' });
  });

  it('delivers push notifications to the matching subscriber only', () => {
    const w = fakeWorker();
    const t = workerTransport(w);
    const onDoc = vi.fn();
    const onData = vi.fn();
    t.subscribe('doc.changed', onDoc);
    t.subscribe('data.changed', onData);

    w.push('doc.changed', { changeset: 3 });
    expect(onDoc).toHaveBeenCalledWith({ changeset: 3 });
    expect(onData).not.toHaveBeenCalled();
  });

  it('stops delivering after unsubscribe', () => {
    const w = fakeWorker();
    const t = workerTransport(w);
    const fn = vi.fn();
    const off = t.subscribe('doc.changed', fn);
    w.push('doc.changed', {});
    off();
    w.push('doc.changed', {});
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
