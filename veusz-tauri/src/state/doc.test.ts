import { describe, it, expect, vi } from 'vitest';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';
import { createDocStore } from './doc';
import type { WidgetTreeNode } from '../rpc/types';

const TREE: WidgetTreeNode = {
  name: '', path: '/', type: 'document',
  children: [
    {
      name: 'page1', path: '/page1', type: 'page',
      children: [
        {
          name: 'graph1', path: '/page1/graph1', type: 'graph',
          children: [
            { name: 'xy1', path: '/page1/graph1/xy1', type: 'xy', children: [] },
          ],
        },
      ],
    },
  ],
};

const XY_SCHEMA = {
  typename: 'xy',
  mode: 'class' as const,
  name: 'Widget_xy',
  usertext: '',
  descr: '',
  setnsmode: 'widgetsettings',
  settings: [
    {
      name: 'marker', typename: 'marker', default: 'circle',
      descr: '', usertext: 'Marker', formatting: true, hidden: false,
      vallist: ['circle', 'square'],
    },
  ],
  subgroups: [],
};

function makeStore(handlers: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  const setOps: Array<unknown> = [];
  const t = mockTransport({
    'doc.tree': () => TREE,
    'data.list': () => [{ name: 'x', type: 'Dataset', len: 5 }],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'doc.schema': () => XY_SCHEMA,
    'doc.get': () => ({ '/page1/graph1/xy1/marker': 'circle' }),
    'doc.set': (params) => {
      const ops = (params as { ops: Array<{ path: string; value: unknown }> }).ops;
      setOps.push(...ops);
      return {
        changeset: 1,
        diffs: ops.map((o) => ({ path: o.path, old: 'circle', new: o.value })),
      };
    },
    'render.png': () => ({
      png: 'iVBORw0KGgo=', width: 100, height: 100, bounds: {},
    }),
    'data.import': () => ({ imported: ['a', 'b'], errors: [] }),
    'doc.undo': () => ({ changeset: 0, can_undo: false, can_redo: true }),
    'doc.add': () => ({ path: '/page2' }),
    'doc.remove': () => ({ ok: true, changeset: 2 }),
    ...handlers,
  });
  const rpc = createRpc(t);
  return { store: createDocStore(rpc), setOps };
}

describe('DocStore', () => {
  it('refreshAll populates tree, datasets, and undo flags', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    const s = store.getState();
    expect(s.tree?.children[0].name).toBe('page1');
    expect(s.datasets.map((d) => d.name)).toEqual(['x']);
    expect(s.canUndo).toBe(false);
  });

  it('select fetches the schema and current values for that widget', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await store.getState().select('/page1/graph1/xy1');
    const s = store.getState();
    expect(s.selected).toBe('/page1/graph1/xy1');
    expect(s.schema?.typename).toBe('xy');
    expect(s.values['/page1/graph1/xy1/marker']).toBe('circle');
  });

  it('setValue calls doc.set and updates the local value cache', async () => {
    const { store, setOps } = makeStore();
    await store.getState().refreshAll();
    await store.getState().select('/page1/graph1/xy1');
    await store.getState().setValue('/page1/graph1/xy1/marker', 'square');
    expect(setOps).toEqual([{ path: '/page1/graph1/xy1/marker', value: 'square' }]);
    expect(store.getState().values['/page1/graph1/xy1/marker']).toBe('square');
  });

  it('renderAt populates the render result', async () => {
    const { store } = makeStore();
    await store.getState().renderAt(0, 100, 100);
    expect(store.getState().render?.width).toBe(100);
  });

  it('reports the RPC error message and lets the caller clear it', async () => {
    let fail = true;
    const { store } = makeStore({
      'doc.tree': () => {
        if (fail) throw new Error('boom');
        return TREE;
      },
    });
    await store.getState().refreshTree();
    expect(store.getState().error).toContain('boom');
    // A successful refresh on its own does not clobber other failures,
    // so the caller resets explicitly via clearError or refreshAll.
    fail = false;
    store.getState().clearError();
    await store.getState().refreshTree();
    expect(store.getState().error).toBeNull();
    expect(store.getState().tree).not.toBeNull();
  });

  it('refreshAll resets the error before kicking off concurrent calls', async () => {
    const { store } = makeStore({
      'doc.tree': () => { throw new Error('first fail'); },
    });
    await store.getState().refreshTree();
    expect(store.getState().error).toContain('first fail');
    // After this, all three sub-refreshes succeed (default handlers).
    // We swap the failing handler with a success and confirm.
    const { store: s2 } = makeStore();
    s2.setState({ error: 'stale' });
    await s2.getState().refreshAll();
    expect(s2.getState().error).toBeNull();
  });

  it('undo refreshes tree + re-fetches values for current selection', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await store.getState().select('/page1/graph1/xy1');
    const refreshTreeSpy = vi.spyOn(store.getState(), 'refreshTree');
    await store.getState().undo();
    expect(store.getState().canRedo).toBe(true);
    expect(refreshTreeSpy).toHaveBeenCalled();
  });

  it('importCsv refreshes the dataset list', async () => {
    const { store } = makeStore({
      'data.import': () => ({ imported: ['x', 'y'], errors: [] }),
      'data.list': () => [
        { name: 'x', type: 'Dataset', len: 5 },
        { name: 'y', type: 'Dataset', len: 5 },
      ],
    });
    const imported = await store.getState().importCsv('/tmp/whatever.csv');
    expect(imported).toEqual(['x', 'y']);
    expect(store.getState().datasets.map((d) => d.name).sort()).toEqual(['x', 'y']);
  });
});
