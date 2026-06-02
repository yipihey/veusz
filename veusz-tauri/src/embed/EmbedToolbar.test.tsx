import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmbedToolbar } from './EmbedToolbar';
import { makeEmbedActionCtx } from './embedActionCtx';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';
import type { ActionCtx } from '../actions/types';

function rig(over: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  const adds: Array<Record<string, unknown>> = [];
  const handlers: Record<string, (p: Record<string, unknown>) => unknown> = {
    'doc.tree': () => ({ name: '', path: '/', type: 'document',
                        children: [{ name: 'page1', path: '/page1', type: 'page',
                                     children: [{ name: 'graph1', path: '/page1/graph1',
                                                  type: 'graph', children: [] }] }] }),
    'data.list': () => [],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'doc.insert_targets': () => ({ targets: {
      xy: '/page1/graph1', function: '/page1/graph1', fit: '/page1/graph1',
      bar: '/page1/graph1', key: '/page1/graph1', label: '/page1',
    } }),
    'file.recent_list': () => ({ paths: [] }),
    'plugins.list': () => ({ tools: [], datasets: [] }),
    'doc.add': (p) => { adds.push(p); return { path: `${p.parent}/new` }; },
    ...over,
  };
  const store = createDocStore(createRpc(mockTransport(handlers)));
  return { store, adds };
}

function buildCtx(store: ReturnType<typeof rig>['store'],
                  notify = vi.fn(),
                  openDialog?: (id: string) => void): ActionCtx {
  return makeEmbedActionCtx(store, {
    notify,
    openDialog: openDialog as (id: import('../actions/types').DialogId) => void,
  });
}

describe('EmbedToolbar — inline density', () => {
  it('renders Insert + Undo + Redo and hides the modal-only ids', async () => {
    const { store } = rig();
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="inline" />);
    expect(screen.getByTestId('embed-toolbar-inline')).toBeInTheDocument();
    expect(screen.getByTestId('embed-insert-btn')).toBeInTheDocument();
    expect(screen.getByTestId('embed-action-edit.undo')).toBeInTheDocument();
    expect(screen.getByTestId('embed-action-edit.redo')).toBeInTheDocument();
    // Modal-only controls must not be present in inline density.
    expect(screen.queryByTestId('embed-action-edit.cut')).toBeNull();
    expect(screen.queryByTestId('embed-action-edit.delete')).toBeNull();
    expect(screen.queryByTestId('embed-data-btn')).toBeNull();
    // No linked datasets in the rig → no Reload button.
    expect(screen.queryByTestId('embed-action-data.reload')).toBeNull();
  });

  it('Insert ▾ → Plotters → Points (XY) calls doc.add with the graph parent', async () => {
    const { store, adds } = rig();
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="inline" />);
    fireEvent.click(screen.getByTestId('embed-insert-btn'));
    expect(screen.getByTestId('embed-insert-menu')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('embed-insert-xy'));
    // doc.add is the RPC, called by store.addWidget under the hood.
    await new Promise((r) => setTimeout(r, 10));
    expect(adds.length).toBeGreaterThanOrEqual(1);
    expect(adds[0]).toMatchObject({ parent: '/page1/graph1', type: 'xy' });
  });

  it('Insert items disabled when their type is not in insertTargets', async () => {
    const { store } = rig({
      'doc.insert_targets': () => ({ targets: { /* nothing for xy */ } }),
    });
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="inline" />);
    fireEvent.click(screen.getByTestId('embed-insert-btn'));
    expect(screen.getByTestId('embed-insert-xy')).toBeDisabled();
  });
});

describe('EmbedToolbar — reload', () => {
  it('hides the Reload button when no dataset is linked', async () => {
    const { store } = rig();
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="full" />);
    expect(screen.queryByTestId('embed-action-data.reload')).toBeNull();
  });

  it('shows Reload when any dataset has a linked file/URL', async () => {
    const { store } = rig({
      'data.list': () => [
        { name: 'x', kind: 'numeric', dtype: 'float64', shape: [3],
          linked: 'http://example.com/x.csv' },
      ],
    });
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="full" />);
    expect(screen.getByTestId('embed-action-data.reload')).toBeInTheDocument();
  });

  it('clicking Reload calls onReload when provided (URL refetch + file reload)', async () => {
    const { store } = rig({
      'data.list': () => [
        { name: 'x', kind: 'numeric', dtype: 'float64', shape: [3],
          linked: 'http://example.com/x.csv' },
      ],
    });
    await store.getState().refreshAll();
    const onReload = vi.fn(() => Promise.resolve());
    render(<EmbedToolbar store={store} ctx={buildCtx(store)}
      density="full" onReload={onReload} />);
    fireEvent.click(screen.getByTestId('embed-action-data.reload'));
    await new Promise((r) => setTimeout(r, 0));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('falls back to data.reload action when onReload is not provided', async () => {
    let reloads = 0;
    const { store } = rig({
      'data.list': () => [
        { name: 'x', kind: 'numeric', dtype: 'float64', shape: [3],
          linked: '/tmp/x.csv' },
      ],
      'data.reload_file': () => { reloads++; return { reloaded: ['x'], errors: {} }; },
    });
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="full" />);
    fireEvent.click(screen.getByTestId('embed-action-data.reload'));
    await new Promise((r) => setTimeout(r, 10));
    expect(reloads).toBe(1);
  });
});

describe('EmbedToolbar — full density', () => {
  it('renders Insert/Edit/Data groups and page nav when >1 page', async () => {
    const { store } = rig({
      'doc.tree': () => ({
        name: '', path: '/', type: 'document', children: [
          { name: 'page1', path: '/page1', type: 'page', children: [] },
          { name: 'page2', path: '/page2', type: 'page', children: [] },
        ],
      }),
    });
    await store.getState().refreshAll();
    render(<EmbedToolbar store={store} ctx={buildCtx(store)} density="full" />);
    expect(screen.getByTestId('embed-toolbar-full')).toBeInTheDocument();
    expect(screen.getByTestId('embed-insert-btn')).toBeInTheDocument();
    expect(screen.getByTestId('embed-action-edit.cut')).toBeInTheDocument();
    expect(screen.getByTestId('embed-action-edit.delete')).toBeInTheDocument();
    expect(screen.getByTestId('embed-data-btn')).toBeInTheDocument();
    expect(screen.getByTestId('embed-action-view.prevpage')).toBeInTheDocument();
    expect(screen.getByTestId('embed-action-view.nextpage')).toBeInTheDocument();
    expect(screen.getByTestId('embed-toolbar-page').textContent).toMatch(/1\s*\/\s*2/);
  });

  it('Data ▾ → Create… opens the dataCreate dialog via openDialog', async () => {
    const { store } = rig();
    await store.getState().refreshAll();
    const openDialog = vi.fn();
    render(<EmbedToolbar store={store}
      ctx={buildCtx(store, undefined, openDialog as (id: string) => void)}
      density="full" />);
    fireEvent.click(screen.getByTestId('embed-data-btn'));
    fireEvent.click(screen.getByTestId('embed-data-data.create'));
    expect(openDialog).toHaveBeenCalledWith('dataCreate');
  });
});
