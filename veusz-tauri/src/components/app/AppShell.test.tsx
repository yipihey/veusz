import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AppShell } from './AppShell';
import { createDocStore } from '../../state/doc';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';
import type { WidgetTreeNode } from '../../rpc/types';

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
      vallist: ['circle', 'square', 'diamond'],
    },
  ],
  subgroups: [],
};

const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function rig(over: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  let canUndo = false, canRedo = false;
  const setOps: Array<unknown> = [];
  const handlers: Record<string, (p: Record<string, unknown>) => unknown> = {
    'doc.tree': () => TREE,
    'data.list': () => [
      { name: 'x', type: 'Dataset', len: 5, shape: [5] },
      { name: 'y', type: 'Dataset', len: 5, shape: [5] },
    ],
    'doc.can_undo': () => ({ can_undo: canUndo, can_redo: canRedo }),
    'doc.schema': () => XY_SCHEMA,
    'doc.get': () => ({ '/page1/graph1/xy1/marker': 'circle' }),
    'doc.set': (params) => {
      const ops = (params as { ops: Array<{ path: string; value: unknown }> }).ops;
      setOps.push(...ops);
      canUndo = true;
      return {
        changeset: 1,
        diffs: ops.map((o) => ({ path: o.path, old: 'circle', new: o.value })),
      };
    },
    'render.png': () => ({
      png: PNG_1PX, width: 100, height: 100,
      bounds: { '/page1/graph1/xy1': [10, 10, 90, 90] },
    }),
    'doc.undo': () => {
      canUndo = false; canRedo = true;
      return { changeset: 0, can_undo: false, can_redo: true };
    },
    'file.info': () => ({ path: null, changeset: 0, modified: false }),
    'file.export': (params) => ({
      ok: true,
      path: (params as { path: string }).path,
      pages: [0],
    }),
    ...over,
  };
  const t = mockTransport(handlers);
  const rpc = createRpc(t);
  return { store: createDocStore(rpc), handlers, get setOps() { return setOps; } };
}

describe('AppShell (mock RPC)', () => {
  it('boots: tree, inspector empty, plot empty', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('tree'));
    expect(screen.getByTestId('app-inspector-empty')).toBeInTheDocument();
  });

  it('after refresh, the tree shows the doc + plot renders', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() =>
      expect(screen.getByTestId('tree-node-/page1/graph1/xy1')).toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByTestId('plot-png')).toBeInTheDocument());
  });

  it('clicking a tree node selects → inspector populates', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('tree-node-/page1/graph1/xy1'));
    fireEvent.click(screen.getByTestId('tree-node-/page1/graph1/xy1'));
    await waitFor(() => screen.getByTestId('inspector'));
    expect(screen.getByTestId('inspector')).toHaveAttribute('data-widget', '/page1/graph1/xy1');
    expect(screen.getByTestId('row-marker')).toBeInTheDocument();
  });

  it('editing a leaf flows: setting → store.setValue → doc.set RPC', async () => {
    const { store, setOps } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('tree-node-/page1/graph1/xy1'));
    fireEvent.click(screen.getByTestId('tree-node-/page1/graph1/xy1'));
    await waitFor(() => screen.getByTestId('inspector'));
    fireEvent.change(screen.getByTestId('setting-marker'), { target: { value: 'square' } });
    await waitFor(() =>
      expect(setOps).toEqual([
        { path: '/page1/graph1/xy1/marker', value: 'square' },
      ]),
    );
  });

  it('toolbar Undo enables after an edit and re-disables after undo', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('tree-node-/page1/graph1/xy1'));
    fireEvent.click(screen.getByTestId('tree-node-/page1/graph1/xy1'));
    await waitFor(() => screen.getByTestId('inspector'));
    expect(screen.getByTestId('toolbar-undo')).toBeDisabled();
    fireEvent.change(screen.getByTestId('setting-marker'), { target: { value: 'square' } });
    await waitFor(() => expect(screen.getByTestId('toolbar-undo')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('toolbar-undo'));
    await waitFor(() => expect(screen.getByTestId('toolbar-undo')).toBeDisabled());
  });

  it('clicking on the plot canvas selects the widget under the cursor', async () => {
    const { store } = rig();
    // happy-dom returns zero rects; stub to natural size so coords are mapped correctly
    Element.prototype.getBoundingClientRect = function () {
      return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100,
               x: 0, y: 0, toJSON() { return this; } } as DOMRect;
    };
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('plot-overlay'));
    fireEvent.click(screen.getByTestId('plot-overlay'), { clientX: 50, clientY: 50 });
    await waitFor(() => screen.getByTestId('inspector'));
    expect(screen.getByTestId('inspector')).toHaveAttribute('data-widget', '/page1/graph1/xy1');
  });

  it('surfaces an RPC error in a banner', async () => {
    const { store } = rig({
      'doc.tree': () => { throw new Error('daemon ate it'); },
    });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('app-error'));
    expect(screen.getByTestId('app-error')).toHaveTextContent('daemon ate it');
  });

  it('Open button calls onPickVsz then file.open', async () => {
    const onPickVsz = vi.fn().mockResolvedValue('/tmp/loaded.vsz');
    const opens: string[] = [];
    const { store } = rig({
      'file.open': (params) => {
        opens.push((params as { path: string }).path);
        return { ok: true, path: (params as { path: string }).path, changeset: 0 };
      },
    });
    render(<AppShell store={store} onPickVsz={onPickVsz} />);
    await waitFor(() => screen.getByTestId('toolbar-open'));
    fireEvent.click(screen.getByTestId('toolbar-open'));
    await waitFor(() => expect(opens).toEqual(['/tmp/loaded.vsz']));
    await waitFor(() =>
      expect(screen.getByTestId('toolbar-filename')).toHaveTextContent('/tmp/loaded.vsz'),
    );
  });

  it('Save As button calls onPickSavePath then file.save_as', async () => {
    const onPickSavePath = vi.fn().mockResolvedValue('/tmp/new.vsz');
    const savedPaths: string[] = [];
    const { store } = rig({
      'file.save_as': (params) => {
        const p = (params as { path: string }).path;
        savedPaths.push(p);
        return { ok: true, path: p, changeset: 1 };
      },
    });
    render(<AppShell store={store} onPickSavePath={onPickSavePath} />);
    await waitFor(() => screen.getByTestId('toolbar-save-as'));
    fireEvent.click(screen.getByTestId('toolbar-save-as'));
    await waitFor(() => expect(savedPaths).toEqual(['/tmp/new.vsz']));
  });

  it('Save (with existing filename) calls file.save directly', async () => {
    const saves: number[] = [];
    const { store } = rig({
      'file.info': () => ({ path: '/tmp/existing.vsz', changeset: 1, modified: true }),
      'file.save': () => {
        saves.push(Date.now());
        return { ok: true, path: '/tmp/existing.vsz', changeset: 1 };
      },
    });
    render(<AppShell store={store} />);
    await waitFor(() =>
      expect(screen.getByTestId('toolbar-filename')).toHaveTextContent('/tmp/existing.vsz'),
    );
    fireEvent.click(screen.getByTestId('toolbar-save'));
    await waitFor(() => expect(saves.length).toBe(1));
  });

  it('toolbar-filename shows (unsaved) for a new document', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('toolbar-filename'));
    expect(screen.getByTestId('toolbar-filename')).toHaveTextContent('(unsaved)');
  });

  it('Export button calls onPickExportPath then file.export', async () => {
    const onPickExportPath = vi.fn().mockResolvedValue('/tmp/out.pdf');
    const exports: Array<Record<string, unknown>> = [];
    const { store } = rig({
      'file.export': (params) => {
        exports.push(params);
        return { ok: true, path: (params as { path: string }).path, pages: [0] };
      },
    });
    render(<AppShell store={store} onPickExportPath={onPickExportPath} />);
    await waitFor(() => screen.getByTestId('toolbar-export'));
    fireEvent.click(screen.getByTestId('toolbar-export'));
    await waitFor(() => expect(exports.length).toBe(1));
    expect((exports[0] as { path: string }).path).toBe('/tmp/out.pdf');
  });

  it('hooks the Import button to the supplied picker', async () => {
    const onPickCsv = vi.fn().mockResolvedValue('/path/to/data.csv');
    const imported: Array<{ kind: string; filename: string }> = [];
    const { store } = rig({
      'data.import': (params) => {
        imported.push(params as { kind: string; filename: string });
        return { imported: ['a'], errors: [] };
      },
    });
    render(<AppShell store={store} onPickCsv={onPickCsv} />);
    await waitFor(() => screen.getByTestId('dataset-import'));
    fireEvent.click(within(screen.getByTestId('app-datasets')).getByTestId('dataset-import'));
    await waitFor(() =>
      expect(imported).toEqual([{ kind: 'csv', filename: '/path/to/data.csv', options: {} }]),
    );
  });
});
