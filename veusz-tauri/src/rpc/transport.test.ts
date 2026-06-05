import { describe, it, expect, vi } from 'vitest';
import { pyodideTransport, type PyodideBridge } from './transport';

/** A fake Pyodide bridge mirroring veusz/daemon/pyodide_bridge.py's contract:
 *  dispatch_json(req)->resp string, and a single set_notify callback. */
function fakeBridge(): PyodideBridge & { push(method: string, params: unknown): void } {
  let notify: ((m: string) => void) | null = null;
  return {
    dispatch_json(req: string): string {
      const r = JSON.parse(req) as { id: number; method: string; params: Record<string, unknown> };
      if (r.method === 'ping') {
        return JSON.stringify({ jsonrpc: '2.0', id: r.id, result: { pong: true } });
      }
      if (r.method === 'boom') {
        return JSON.stringify({ jsonrpc: '2.0', id: r.id, error: { code: -32603, message: 'kaboom', data: { x: 1 } } });
      }
      return JSON.stringify({ jsonrpc: '2.0', id: r.id, result: { echo: r.params } });
    },
    set_notify(cb: (m: string) => void) { notify = cb; },
    push(method: string, params: unknown) {
      notify?.(JSON.stringify({ jsonrpc: '2.0', method, params }));
    },
  };
}

describe('pyodideTransport', () => {
  it('round-trips a call through dispatch_json', async () => {
    const t = pyodideTransport(fakeBridge());
    expect(await t.call('ping')).toEqual({ pong: true });
    expect(await t.call('whatever', { a: 1 })).toEqual({ echo: { a: 1 } });
  });

  it('rejects with the JSON-RPC error (code + data preserved)', async () => {
    const t = pyodideTransport(fakeBridge());
    await expect(t.call('boom')).rejects.toMatchObject({
      message: 'kaboom', code: -32603, data: { x: 1 },
    });
  });

  it('delivers push notifications to the matching subscriber only', () => {
    const bridge = fakeBridge();
    const t = pyodideTransport(bridge);
    const onDoc = vi.fn();
    const onData = vi.fn();
    t.subscribe('doc.changed', onDoc);
    t.subscribe('data.changed', onData);

    bridge.push('doc.changed', { changeset: 3 });
    expect(onDoc).toHaveBeenCalledWith({ changeset: 3 });
    expect(onData).not.toHaveBeenCalled();
  });

  it('stops delivering after unsubscribe', () => {
    const bridge = fakeBridge();
    const t = pyodideTransport(bridge);
    const fn = vi.fn();
    const off = t.subscribe('doc.changed', fn);
    bridge.push('doc.changed', {});
    off();
    bridge.push('doc.changed', {});
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

import { commTransport, type CommLike } from './transport';

/** A fake host comm wired to a fake kernel relay: messages the transport
 *  `send`s are answered as a subprocess daemon would, and the relay can push
 *  unsolicited notifications. */
function fakeComm() {
  let onMsg: ((d: unknown) => void) | null = null;
  let onClose: (() => void) | null = null;
  const comm: CommLike & {
    pushNotify(method: string, params: unknown): void;
    close(): void;
  } = {
    send(data) {
      const r = data as { id: number; method: string; params: Record<string, unknown> };
      // Relay → daemon → reply, delivered back over the comm asynchronously.
      queueMicrotask(() => {
        if (r.method === 'ping') onMsg?.({ id: r.id, result: { pong: true } });
        else if (r.method === 'boom') onMsg?.({ id: r.id, error: { code: -32603, message: 'kaboom', data: { x: 1 } } });
        else onMsg?.({ id: r.id, result: { echo: r.params } });
      });
    },
    onMessage(h) { onMsg = h; },
    onClose(h) { onClose = h; },
    pushNotify(method, params) { onMsg?.({ method, params }); },
    close() { onClose?.(); },
  };
  return comm;
}

describe('commTransport', () => {
  it('round-trips a call over the comm', async () => {
    const t = commTransport(fakeComm());
    expect(await t.call('ping')).toEqual({ pong: true });
    expect(await t.call('whatever', { a: 1 })).toEqual({ echo: { a: 1 } });
  });

  it('rejects with the JSON-RPC error (code + data preserved)', async () => {
    const t = commTransport(fakeComm());
    await expect(t.call('boom')).rejects.toMatchObject({
      message: 'kaboom', code: -32603, data: { x: 1 },
    });
  });

  it('delivers id-less notifications to the matching subscriber only', () => {
    const comm = fakeComm();
    const t = commTransport(comm);
    const onDoc = vi.fn();
    const onData = vi.fn();
    t.subscribe('doc.changed', onDoc);
    t.subscribe('data.changed', onData);
    comm.pushNotify('doc.changed', { changeset: 7 });
    expect(onDoc).toHaveBeenCalledWith({ changeset: 7 });
    expect(onData).not.toHaveBeenCalled();
  });

  it('rejects in-flight calls when the comm closes', async () => {
    const comm = fakeComm();
    const t = commTransport(comm);
    // never answered: make send a no-op for this one, then close
    const p = t.call('hang');
    comm.close();
    await expect(p).rejects.toThrow(/comm closed/);
  });
});

import { websocketComm } from './transport';

// A fake WebSocket: captures sends, lets the test drive open/message/close.
class FakeWS {
  static last: FakeWS | null = null;
  listeners: Record<string, Array<(e: any) => void>> = {};
  sent: string[] = [];
  constructor(public url: string) { FakeWS.last = this; }
  addEventListener(type: string, fn: (e: any) => void) { (this.listeners[type] ??= []).push(fn); }
  send(data: string) { this.sent.push(data); }
  emit(type: string, e?: any) { (this.listeners[type] ?? []).forEach((fn) => fn(e)); }
}

describe('websocketComm', () => {
  it('queues sends until open, then flushes; parses incoming JSON', () => {
    const comm = websocketComm('ws://x', FakeWS as unknown as { new (u: string): WebSocket });
    const ws = FakeWS.last!;
    // send before open -> queued
    comm.send({ id: 1, method: 'ping' });
    expect(ws.sent).toHaveLength(0);
    ws.emit('open');
    expect(JSON.parse(ws.sent[0])).toEqual({ id: 1, method: 'ping' });
    // after open, sends go straight through
    comm.send({ id: 2, method: 'version' });
    expect(JSON.parse(ws.sent[1])).toEqual({ id: 2, method: 'version' });
    // incoming JSON is parsed and handed to onMessage
    const got: unknown[] = [];
    comm.onMessage((d) => got.push(d));
    ws.emit('message', { data: JSON.stringify({ id: 1, result: { pong: true } }) });
    expect(got).toEqual([{ id: 1, result: { pong: true } }]);
  });

  it('drives commTransport end-to-end (round-trip over the fake socket)', async () => {
    const comm = websocketComm('ws://x', FakeWS as unknown as { new (u: string): WebSocket });
    const ws = FakeWS.last!;
    ws.emit('open');
    const t = commTransport(comm);
    const p = t.call('ping');
    // relay would answer; echo the id back with a result
    const sent = JSON.parse(ws.sent[ws.sent.length - 1]) as { id: number };
    ws.emit('message', { data: JSON.stringify({ id: sent.id, result: { pong: true } }) });
    expect(await p).toEqual({ pong: true });
  });
});
