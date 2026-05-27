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
  let fileInfo: { path: string | null; changeset: number; modified: boolean } =
    { path: null, changeset: 0, modified: false };
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
    'file.info': () => fileInfo,
    'file.open': (params) => {
      const p = (params as { path: string }).path;
      fileInfo = { path: p, changeset: 0, modified: false };
      return { ok: true, path: p, changeset: 0 };
    },
    'file.save': () => {
      if (!fileInfo.path) throw new Error('no filename');
      return { ok: true, path: fileInfo.path, changeset: fileInfo.changeset };
    },
    'file.save_as': (params) => {
      const p = (params as { path: string }).path;
      fileInfo = { ...fileInfo, path: p };
      return { ok: true, path: p, changeset: fileInfo.changeset };
    },
    'file.export': (params) => ({
      ok: true,
      path: (params as { path: string }).path,
      pages: ((params as { pages?: number[] }).pages) ?? [0],
    }),
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

  it('refreshFileInfo populates filename', async () => {
    const { store } = makeStore({
      'file.info': () => ({ path: '/tmp/foo.vsz', changeset: 3, modified: true }),
    });
    await store.getState().refreshFileInfo();
    expect(store.getState().filename).toBe('/tmp/foo.vsz');
  });

  it('openFile updates filename and clears selection', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await store.getState().select('/page1/graph1/xy1');
    expect(store.getState().selected).toBe('/page1/graph1/xy1');
    await store.getState().openFile('/tmp/loaded.vsz');
    expect(store.getState().filename).toBe('/tmp/loaded.vsz');
    expect(store.getState().selected).toBeNull();
  });

  it('saveFile without a current filename surfaces an error', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    const result = await store.getState().saveFile();
    expect(result).toBeNull();
    expect(store.getState().error).toMatch(/Save As/);
  });

  it('saveFileAs sets the filename, then saveFile succeeds', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await store.getState().saveFileAs('/tmp/out.vsz');
    expect(store.getState().filename).toBe('/tmp/out.vsz');
    const path = await store.getState().saveFile();
    expect(path).toBe('/tmp/out.vsz');
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

  it('exportFile returns the daemon-confirmed path', async () => {
    const exports: Array<{ path: string; pages?: number[] }> = [];
    const { store } = makeStore({
      'file.export': (params) => {
        const p = params as { path: string; pages?: number[] };
        exports.push(p);
        return { ok: true, path: p.path, pages: p.pages ?? [0] };
      },
    });
    const out = await store.getState().exportFile('/tmp/plot.pdf', [0, 1]);
    expect(out).toBe('/tmp/plot.pdf');
    expect(exports).toEqual([{ path: '/tmp/plot.pdf', pages: [0, 1], options: {} }]);
  });

  it('requestRender coalesces a burst of calls into one render', async () => {
    let renderCalls = 0;
    const { store } = makeStore({
      'render.png': () => {
        renderCalls++;
        return { png: '', width: 100, height: 100, bounds: {} };
      },
    });
    // 10 rapid calls in immediate succession
    for (let i = 0; i < 10; i++) {
      store.getState().requestRender(0, 100, 100);
    }
    // Wait past the coalesce window
    await new Promise((r) => setTimeout(r, 80));
    expect(renderCalls).toBe(1);
  });

  it('requestRender uses the latest viewport args after coalescing', async () => {
    const sizes: Array<[number, number]> = [];
    const { store } = makeStore({
      'render.png': (params) => {
        const p = params as { w: number; h: number };
        sizes.push([p.w, p.h]);
        return { png: '', width: p.w, height: p.h, bounds: {} };
      },
    });
    store.getState().requestRender(0, 100, 100);
    store.getState().requestRender(0, 200, 200);
    store.getState().requestRender(0, 400, 300);
    await new Promise((r) => setTimeout(r, 80));
    expect(sizes).toEqual([[400, 300]]);
  });

  it('subscribeToDaemon refreshes tree on doc.changed notifications', async () => {
    let treeCalls = 0;
    const t = mockTransport({
      'doc.tree': () => { treeCalls++; return TREE; },
      'data.list': () => [],
      'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
      'file.info': () => ({ path: null, changeset: 0, modified: false }),
    });
    const rpc = createRpc(t);
    const store = createDocStore(rpc);
    const off = store.getState().subscribeToDaemon();
    await store.getState().refreshAll();
    const before = treeCalls;
    t.emit('doc.changed', { changeset: 1, paths: ['/page1'], kind: 'add' });
    await new Promise((r) => setTimeout(r, 5));
    expect(treeCalls).toBeGreaterThan(before);
    off();
  });

  it('subscribeToDaemon refreshes datasets on data.changed notifications', async () => {
    let listCalls = 0;
    const t = mockTransport({
      'doc.tree': () => TREE,
      'data.list': () => { listCalls++; return []; },
      'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
      'file.info': () => ({ path: null, changeset: 0, modified: false }),
    });
    const rpc = createRpc(t);
    const store = createDocStore(rpc);
    const off = store.getState().subscribeToDaemon();
    await store.getState().refreshAll();
    const before = listCalls;
    t.emit('data.changed', { names: ['x'], kind: 'set' });
    await new Promise((r) => setTimeout(r, 5));
    expect(listCalls).toBeGreaterThan(before);
    off();
  });
});
