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
    'doc.colormaps': () => ({ colormaps: [], samples: 24 }),
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'doc.insert_targets': () => ({ targets: {} }),
    'file.recent_list': () => ({ paths: [] }),
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
    await store.getState().select(['/page1/graph1/xy1']);
    const s = store.getState();
    expect(s.selected).toEqual(['/page1/graph1/xy1']);
    expect(s.schema?.typename).toBe('xy');
    expect(s.values['/page1/graph1/xy1/marker']).toBe('circle');
  });

  it('setValue calls doc.set and updates the local value cache', async () => {
    const { store, setOps } = makeStore();
    await store.getState().refreshAll();
    await store.getState().select(['/page1/graph1/xy1']);
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
    await store.getState().select(['/page1/graph1/xy1']);
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
    await store.getState().select(['/page1/graph1/xy1']);
    expect(store.getState().selected).toEqual(['/page1/graph1/xy1']);
    await store.getState().openFile('/tmp/loaded.vsz');
    expect(store.getState().filename).toBe('/tmp/loaded.vsz');
    expect(store.getState().selected).toEqual([]);
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

// --- Context-menu actions (Phase 1) ---------------------------------------

describe('DocStore context-menu actions', () => {
  it('renameWidget routes to rpc.doc.rename and refreshes the tree', async () => {
    let renamedTo: string | null = null;
    let treeCalls = 0;
    const { store } = makeStore({
      'doc.rename': (params) => {
        const p = params as { path: string; name: string };
        renamedTo = p.name;
        return { path: '/page1/graph1/' + p.name, changeset: 1 };
      },
      'doc.tree': () => { treeCalls++; return TREE; },
    });
    const out = await store.getState().renameWidget('/page1/graph1/xy1', 'scatter');
    expect(renamedTo).toBe('scatter');
    expect(out).toBe('/page1/graph1/scatter');
    expect(treeCalls).toBeGreaterThan(0);
  });

  it('moveWidget routes direction through to the daemon', async () => {
    const directions: string[] = [];
    const { store } = makeStore({
      'doc.move': (params) => {
        const p = params as { direction: string };
        directions.push(p.direction);
        return { path: '/page1/graph1/xy1', moved: true, changeset: 1 };
      },
    });
    await store.getState().moveWidget('/page1/graph1/xy1', 'up');
    await store.getState().moveWidget('/page1/graph1/xy1', 'down');
    expect(directions).toEqual(['up', 'down']);
  });

  it('duplicateWidget returns the new path', async () => {
    const { store } = makeStore({
      'doc.duplicate': () =>
        ({ path: '/page1/graph1/xy1_copy', changeset: 1 }),
    });
    const out = await store.getState().duplicateWidget('/page1/graph1/xy1');
    expect(out).toBe('/page1/graph1/xy1_copy');
  });

  it('setHidden writes one /hide op per selected path in a single batch', async () => {
    let lastOps: Array<{ path: string; value: unknown }> | null = null;
    const { store } = makeStore({
      'doc.set': (params) => {
        const ops = (params as { ops: Array<{ path: string; value: unknown }> }).ops;
        lastOps = ops;
        return {
          changeset: 1,
          diffs: ops.map((o) => ({ path: o.path, old: false, new: o.value })),
        };
      },
    });
    await store.getState().setHidden(
      ['/page1/graph1/xy1', '/page1/graph1/xy2'], true,
    );
    expect(lastOps).toEqual([
      { path: '/page1/graph1/xy1/hide', value: true },
      { path: '/page1/graph1/xy2/hide', value: true },
    ]);
  });

  it('copyWidgets writes the daemon-returned MIME bytes to the clipboard', async () => {
    let serialized: { paths?: string[] } = {};
    const { store } = makeStore({
      'doc.serialize_widgets': (params) => {
        serialized = params as { paths: string[] };
        return {
          mime_type: 'text/x-vnd.veusz-widget-3',
          payload_b64: 'PAYLOAD',
          count: 1,
        };
      },
    });
    await store.getState().copyWidgets(['/page1/graph1/xy1']);
    expect(serialized.paths).toEqual(['/page1/graph1/xy1']);
    // The clipboard now reports as having a widget payload.
    const cb = store.getState().clipboard;
    expect(await cb.has(['text/x-vnd.veusz-widget-3'])).toBe(true);
  });

  it('cutWidgets serializes, writes the clipboard, then removes', async () => {
    const removed: string[] = [];
    const { store } = makeStore({
      'doc.serialize_widgets': () => ({
        mime_type: 'text/x-vnd.veusz-widget-3',
        payload_b64: 'CUT', count: 1,
      }),
      'doc.remove': (params) => {
        removed.push((params as { path: string }).path);
        return { ok: true, changeset: 1 };
      },
    });
    await store.getState().cutWidgets(['/page1/graph1/xy1']);
    expect(removed).toEqual(['/page1/graph1/xy1']);
    // The cut path is tracked so the tree (Phase 2) can render an
    // italic-pending affordance if it wants — even though the actual
    // remove happens immediately (Qt parity).
    expect(store.getState().cutPaths).toEqual(['/page1/graph1/xy1']);
  });

  it('pasteWidgets posts the clipboard payload to the daemon', async () => {
    let pasteArgs: { parent?: string; mime_type?: string } = {};
    const { store } = makeStore({
      'doc.serialize_widgets': () => ({
        mime_type: 'text/x-vnd.veusz-widget-3',
        payload_b64: 'WIRE', count: 1,
      }),
      'doc.paste_widgets_mime': (params) => {
        pasteArgs = params as { parent: string; mime_type: string };
        return { paths: ['/page1/graph1/xy_pasted'], changeset: 2 };
      },
    });
    // Seed the clipboard via copy.
    await store.getState().copyWidgets(['/page1/graph1/xy1']);
    const pasted = await store.getState().pasteWidgets('/page1/graph1');
    expect(pasted).toEqual(['/page1/graph1/xy_pasted']);
    expect(pasteArgs.parent).toBe('/page1/graph1');
    expect(pasteArgs.mime_type).toBe('text/x-vnd.veusz-widget-3');
  });

  it('canPasteWidgets returns false when the clipboard is empty', async () => {
    const { store } = makeStore();
    expect(await store.getState().canPasteWidgets('/page1/graph1')).toBe(false);
  });

  it('propagateSetting forwards scope and widget_paths', async () => {
    let captured: { scope?: string; widget_paths?: string[] } = {};
    const { store } = makeStore({
      'doc.propagate_setting': (params) => {
        captured = params as { scope: string; widget_paths: string[] };
        return { changeset: 1 };
      },
    });
    await store.getState().propagateSetting(
      '/page1/graph1/xy1/marker',
      'widgets',
      ['/page1/graph1/xy2'],
    );
    expect(captured.scope).toBe('widgets');
    expect(captured.widget_paths).toEqual(['/page1/graph1/xy2']);
  });

  it('deleteDatasets routes a name list to data.delete', async () => {
    let deletedNames: string[] | null = null;
    const { store } = makeStore({
      'data.delete': (params) => {
        deletedNames = (params as { names: string[] }).names;
        return { deleted: deletedNames };
      },
    });
    await store.getState().deleteDatasets(['a', 'b']);
    expect(deletedNames).toEqual(['a', 'b']);
  });

  it('tagDatasets / untagDatasets forward both the names and the tag', async () => {
    let lastTag = '';
    let lastNames: string[] = [];
    const { store } = makeStore({
      'data.tag': (params) => {
        const p = params as { names: string[]; tag: string };
        lastNames = p.names; lastTag = p.tag;
        return { tagged: p.names, tag: p.tag };
      },
      'data.untag': (params) => {
        const p = params as { names: string[]; tag: string };
        lastNames = p.names; lastTag = p.tag;
        return { untagged: p.names, tag: p.tag };
      },
    });
    await store.getState().tagDatasets(['a', 'b'], 'important');
    expect(lastTag).toBe('important');
    expect(lastNames).toEqual(['a', 'b']);
    await store.getState().untagDatasets(['a'], 'important');
    expect(lastNames).toEqual(['a']);
  });

  it('setValues batches multi-path edits into a single doc.set call', async () => {
    let lastOps: Array<{ path: string; value: unknown }> = [];
    let setCalls = 0;
    const { store } = makeStore({
      'doc.set': (params) => {
        setCalls++;
        const ops = (params as { ops: Array<{ path: string; value: unknown }> }).ops;
        lastOps = ops;
        return {
          changeset: 1,
          diffs: ops.map((o) => ({ path: o.path, old: 'circle', new: o.value })),
        };
      },
    });
    await store.getState().setValues([
      { path: '/page1/graph1/xy1/marker', value: 'square' },
      { path: '/page1/graph1/xy2/marker', value: 'square' },
    ]);
    expect(setCalls).toBe(1);
    expect(lastOps.length).toBe(2);
  });

  void vi;
});
