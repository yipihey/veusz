import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { mountRemoteEditor, mountRemoteEditorFromComm } from './mountRemote';
import { mockTransport, type CommLike } from '../rpc/transport';

// Minimal daemon stand-in: just enough handlers for the store's refreshAll()
// and the figure's first paint. jsdom has no WebGPU, so the live plot can't
// render here — we assert the *wiring* (store built from the injected
// transport, figure mounted, transport actually called). The live render is
// covered by the Veusz.jl Playwright e2e.
function daemonHandlers(spy?: (m: string) => void) {
  const h: Record<string, (p: Record<string, unknown>) => unknown> = {
    'doc.tree': () => ({ name: '', path: '/', type: 'document', children: [] }),
    'data.list': () => [],
    'doc.colormaps': () => ({ colormaps: [], samples: 24 }),
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'doc.insert_targets': () => ({ targets: {} }),
    'file.recent_list': () => ({ paths: [] }),
    'file.info': () => ({ path: null }),
    'plugins.list': () => ({ tools: [], datasets: [] }),
    'prefs.get': (p) => ({ key: (p as { key: string }).key, value: 'change' }),
    'prefs.set': () => ({ ok: true }),
  };
  if (!spy) return h;
  const wrapped: typeof h = {};
  for (const [k, fn] of Object.entries(h)) wrapped[k] = (p) => { spy(k); return fn(p); };
  return wrapped;
}

describe('mountRemoteEditor', () => {
  it('mounts the editor against an injected transport and drives it', async () => {
    const called: string[] = [];
    const transport = mockTransport(daemonHandlers((m) => called.push(m)));
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handle = mountRemoteEditor(container, transport);
    expect(handle.store).toBeTruthy();

    // refreshAll() must have pulled the document from the daemon over the
    // injected transport, and the figure must have mounted some DOM.
    await waitFor(() => expect(called).toContain('doc.tree'));
    await waitFor(() => expect(container.querySelector('[data-testid]')).toBeTruthy());

    // The remote editor defaults to the SVG renderer, so it must NOT gate on
    // WebGPU (jsdom has none) — the needs-webgpu message must be absent.
    expect(container.querySelector('[data-testid="veusz-needs-webgpu"]')).toBeNull();

    handle.unmount();
    container.remove();
  });

  it('mountRemoteEditorFromComm wraps a host comm', async () => {
    // A fake comm wired to the same handler set (relay → daemon → reply).
    const handlers = daemonHandlers();
    let onMsg: ((d: unknown) => void) | null = null;
    const comm: CommLike = {
      send: (data) => {
        const r = data as { id: number; method: string; params: Record<string, unknown> };
        queueMicrotask(async () => {
          try {
            const result = await handlers[r.method]?.(r.params ?? {});
            onMsg?.({ id: r.id, result: result ?? null });
          } catch (e) {
            onMsg?.({ id: r.id, error: { code: -32603, message: String(e) } });
          }
        });
      },
      onMessage: (h) => { onMsg = h; },
    };
    const sendSpy = vi.spyOn(comm, 'send');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handle = mountRemoteEditorFromComm(container, comm, { initialEditing: false });
    await waitFor(() => expect(sendSpy).toHaveBeenCalled());
    expect(handle.store).toBeTruthy();

    handle.unmount();
    container.remove();
  });
});
