/**
 * PlotContextMenu: right-click opens a generic plot menu; items drive
 * the store (page nav / antialias / update policy / force render) and
 * the zoom callbacks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';
import { createDocStore } from '../../state/doc';
import { PlotContextMenu, type ZoomCommands } from './PlotContextMenu';
import type { WidgetTreeNode } from '../../rpc/types';

// Two pages so prev/next-page enabling can be checked.
const TREE: WidgetTreeNode = {
  name: '', path: '/', type: 'document',
  children: [
    { name: 'page1', path: '/page1', type: 'page', children: [] },
    { name: 'page2', path: '/page2', type: 'page', children: [] },
  ],
};

function makeStore(extra: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const t = mockTransport({
    'doc.tree': () => TREE,
    'data.list': () => [],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'file.info': () => ({ path: null, changeset: 0, modified: false }),
    'prefs.get': (p) => ({ key: (p as { key: string }).key, value:
      (p as { key: string }).key === 'plot.antialias' ? true : 'change' }),
    'prefs.set': (p) => {
      calls.push(['prefs.set', p]);
      return { ok: true, key: (p as { key: string }).key, value: (p as { value: unknown }).value };
    },
    'render.png': () => {
      calls.push(['render.png', {}]);
      return { png: '', width: 100, height: 100, bounds: {} };
    },
    ...extra,
  });
  return { store: createDocStore(createRpc(t)), calls };
}

function zoomSpies(): ZoomCommands & { _calls: string[] } {
  const _calls: string[] = [];
  return {
    _calls,
    zoomIn: () => _calls.push('zoomIn'),
    zoomOut: () => _calls.push('zoomOut'),
    zoom11: () => _calls.push('zoom11'),
    zoomWidth: () => _calls.push('zoomWidth'),
    zoomHeight: () => _calls.push('zoomHeight'),
    zoomPage: () => _calls.push('zoomPage'),
  };
}

async function open(store: ReturnType<typeof makeStore>['store'], zoom: ZoomCommands, onFs?: () => void) {
  render(
    <PlotContextMenu
      store={store}
      zoom={zoom}
      renderWidth={400}
      renderHeight={300}
      onToggleFullScreen={onFs}
    >
      <div data-testid="plot-trigger">canvas</div>
    </PlotContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId('plot-trigger'));
  await screen.findByTestId('plot-context-menu');
}

describe('PlotContextMenu', () => {
  beforeEach(() => cleanup());

  it('opens on right-click and shows the core items', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await open(store, zoomSpies(), () => {});
    expect(screen.getByTestId('plot-ctx-zoom')).toBeInTheDocument();
    expect(screen.getByTestId('plot-ctx-prev-page')).toBeInTheDocument();
    expect(screen.getByTestId('plot-ctx-next-page')).toBeInTheDocument();
    expect(screen.getByTestId('plot-ctx-force-update')).toBeInTheDocument();
    expect(screen.getByTestId('plot-ctx-antialias')).toBeInTheDocument();
  });

  it('Next page advances the store currentPage', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    expect(store.getState().currentPage).toBe(0);
    await open(store, zoomSpies());
    fireEvent.click(screen.getByTestId('plot-ctx-next-page'));
    expect(store.getState().currentPage).toBe(1);
  });

  it('Previous page is disabled on the first page', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await open(store, zoomSpies());
    expect(screen.getByTestId('plot-ctx-prev-page').getAttribute('aria-disabled'))
      .toBe('true');
  });

  it('Force update calls render.png immediately', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    await open(store, zoomSpies());
    fireEvent.click(screen.getByTestId('plot-ctx-force-update'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'render.png')).toBe(true);
  });

  it('Antialias toggle flips state and persists via prefs.set', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    await store.getState().loadPlotPrefs();
    expect(store.getState().antialias).toBe(true);
    await open(store, zoomSpies());
    fireEvent.click(screen.getByTestId('plot-ctx-antialias'));
    await new Promise((r) => setTimeout(r, 5));
    expect(store.getState().antialias).toBe(false);
    expect(calls.some((c) => c[0] === 'prefs.set'
      && (c[1] as { key: string }).key === 'plot.antialias')).toBe(true);
  });

  it('Full screen invokes the host handler', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    const onFs = vi.fn();
    await open(store, zoomSpies(), onFs);
    fireEvent.click(screen.getByTestId('plot-ctx-fullscreen'));
    expect(onFs).toHaveBeenCalled();
  });

  it('Zoom submenu items invoke the canvas zoom commands', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    const z = zoomSpies();
    await open(store, z);
    // Open the Zoom submenu, then click "Zoom in".
    fireEvent.click(screen.getByTestId('plot-ctx-zoom'));
    const item = await screen.findByTestId('plot-ctx-zoom-in');
    fireEvent.click(item);
    expect(z._calls).toContain('zoomIn');
  });
});
