import { describe, it, expect, vi } from 'vitest';
import { workerTransport, type WorkerLike } from './transport';

/**
 * A fake Web Worker mirroring `embed/pyodideWorker.ts`'s protocol, but running
 * the dispatch inline so the transport can be unit-tested without real Pyodide
 * (which can't run in jsdom/happy-dom). It echoes the bridge's JSON contract:
 * `{id, result|error}` replies and `{type:'notify', payload}` pushes, and — to
 * exercise the singleton-worker multiplexing — supports MANY logical listeners
 * (one per `workerTransport`) and tags both replies and pushes with the
 * originating `bridgeId`, exactly like the real shared worker.
 */
function fakeWorker(): WorkerLike & {
  push(method: string, params: unknown, bridgeId?: string): void;
  listenerCount(): number;
  terminated: boolean;
} {
  const listeners = new Set<(e: MessageEvent) => void>();
  // Broadcast to every attached transport, like a real worker's single port
  // delivering to all `addEventListener('message')` handlers.
  const emit = (data: unknown) => listeners.forEach((l) => l({ data } as MessageEvent));
  return {
    terminated: false,
    postMessage(message: unknown) {
      const m = message as {
        bridgeId?: string;
        id: number;
        type: string;
        method?: string;
        params?: Record<string, unknown>;
        text?: string;
      };
      const tag = m.bridgeId; // echo back so the multiplexing filter matches
      // Reply asynchronously, like a real worker thread would.
      queueMicrotask(() => {
        if (m.type === 'call') {
          if (m.method === 'ping') {
            emit({ bridgeId: tag, id: m.id, result: { pong: true } });
          } else if (m.method === 'boom') {
            emit({ bridgeId: tag, id: m.id, error: { code: -32603, message: 'kaboom', data: { x: 1 } } });
          } else {
            emit({ bridgeId: tag, id: m.id, result: { echo: m.params } });
          }
        } else if (m.type === 'loadVsz') {
          emit({ bridgeId: tag, id: m.id, result: { opened: m.text } });
        }
      });
    },
    addEventListener(_type: 'message', l: (e: MessageEvent) => void) {
      listeners.add(l);
    },
    removeEventListener(_type: 'message', l: (e: MessageEvent) => void) {
      listeners.delete(l);
    },
    terminate() {
      this.terminated = true;
    },
    listenerCount() {
      return listeners.size;
    },
    push(method: string, params: unknown, bridgeId?: string) {
      emit({ bridgeId, type: 'notify', payload: JSON.stringify({ jsonrpc: '2.0', method, params }) });
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

/**
 * Singleton-worker multiplexing: two logical bridges (two figures) share ONE
 * fake worker. Each `workerTransport` is created with a distinct `bridgeId`, so
 * replies and notifications must route only to the owning transport.
 */
describe('workerTransport bridgeId routing (shared worker)', () => {
  it('tags outbound messages with the bridgeId', () => {
    const w = fakeWorker();
    const posted: { bridgeId?: string }[] = [];
    const orig = w.postMessage.bind(w);
    w.postMessage = (m: unknown) => { posted.push(m as { bridgeId?: string }); orig(m); };
    const a = workerTransport(w, 'A');
    void a.call('ping');
    expect(posted.at(-1)?.bridgeId).toBe('A');
  });

  it('routes call replies to the originating bridge only', async () => {
    const w = fakeWorker();
    const a = workerTransport(w, 'A');
    const b = workerTransport(w, 'B');
    // Two transports over one worker; ids overlap (both start at 1) but the
    // bridgeId tag keeps replies apart.
    const [ra, rb] = await Promise.all([a.call('echo', { who: 'a' }), b.call('echo', { who: 'b' })]);
    expect(ra).toEqual({ echo: { who: 'a' } });
    expect(rb).toEqual({ echo: { who: 'b' } });
  });

  it('routes push notifications to the matching bridge only', () => {
    const w = fakeWorker();
    const a = workerTransport(w, 'A');
    const b = workerTransport(w, 'B');
    const onA = vi.fn();
    const onB = vi.fn();
    a.subscribe('doc.changed', onA);
    b.subscribe('doc.changed', onB);

    w.push('doc.changed', { n: 1 }, 'A');
    expect(onA).toHaveBeenCalledWith({ n: 1 });
    expect(onB).not.toHaveBeenCalled();

    w.push('doc.changed', { n: 2 }, 'B');
    expect(onB).toHaveBeenCalledWith({ n: 2 });
    expect(onA).toHaveBeenCalledTimes(1);
  });

  it('dispose() detaches the bridge and stops delivery; the other survives', () => {
    const w = fakeWorker();
    const a = workerTransport(w, 'A');
    const b = workerTransport(w, 'B');
    const onA = vi.fn();
    const onB = vi.fn();
    a.subscribe('doc.changed', onA);
    b.subscribe('doc.changed', onB);
    expect(w.listenerCount()).toBe(2);

    a.dispose();
    expect(w.listenerCount()).toBe(1); // A detached from the shared worker

    w.push('doc.changed', { n: 1 }, 'A');
    w.push('doc.changed', { n: 2 }, 'B');
    expect(onA).not.toHaveBeenCalled(); // disposed bridge gets nothing
    expect(onB).toHaveBeenCalledWith({ n: 2 }); // sibling still live
  });

  it('dispose() rejects in-flight calls', async () => {
    const w = fakeWorker();
    // A worker that never replies, so the call stays pending until dispose.
    w.postMessage = () => {};
    const a = workerTransport(w, 'A');
    const p = a.call('ping');
    a.dispose();
    await expect(p).rejects.toThrow('transport disposed');
  });
});
