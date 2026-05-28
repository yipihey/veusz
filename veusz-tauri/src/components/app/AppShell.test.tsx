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
    'doc.insert_targets': () => ({ targets: {
      page: '/', graph: '/page1', xy: '/page1/graph1',
      axis: '/page1/graph1', function: '/page1/graph1',
      bar: '/page1/graph1', histo: '/page1/graph1', image: '/page1/graph1',
      contour: '/page1/graph1', key: '/page1/graph1', label: '/page1',
    } }),
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
    'file.recent_list': () => ({ paths: [{ path: '/docs/recent-a.vsz', exists: true }] }),
    'doc.schema_at': () => ({
      name: 'StyleSheet', mode: 'instance', usertext: '', descr: '',
      setnsmode: 'widgetsettings', settings: [], subgroups: [],
    }),
    'prefs.list': () => [
      { key: 'plot.antialias', value: true, default: true, type: 'boolean' },
      { key: 'render.default_dpi', value: 96, default: 96, type: 'number', min: 36, max: 600 },
      { key: 'ui.theme', value: 'system', default: 'system', type: 'string', choices: ['system', 'light', 'dark'] },
    ],
    'file.formats': () => [
      { extensions: ['pdf'], description: 'PDF' },
      { extensions: ['png'], description: 'PNG' },
    ],
    'data.peek': () => ({ values: [1, 2, 3], start: 0, total: 3 }),
    'data.set': (p) => ({ ok: true, len: (p as { values: number[] }).values.length }),
    'data.create': (p) => ({ created: [(p as { name: string }).name] }),
    'doc.new': () => ({ ok: true, changeset: 0 }),
    'doc.get_customs': () => ({ definition: [['pi', '3.14159']], import: [], color: [], colormap: [] }),
    'doc.set_customs': () => ({ ok: true, changeset: 1 }),
    'eval.python': (p) => ({ result: 42, stdout: `ran: ${(p as { code: string }).code}\n`, stderr: '' }),
    'plugins.list': () => ({
      tools: [
        { name: 'Replace text', menu: ['General', 'Replace text'], has_parameters: true,
          fields: [{ name: 'text1', descr: 'Find', default: '', kind: 'FieldText', items: [] }] },
      ],
      datasets: [
        { name: 'Add', menu: ['Add', 'Constant'],
          fields: [
            { name: 'ds_in', descr: 'Input dataset', default: '', kind: 'FieldDataset', items: [] },
            { name: 'value', descr: 'Value', default: 0, kind: 'FieldFloat', items: [] },
            { name: 'ds_out', descr: 'Output dataset', default: '', kind: 'FieldDataset', items: [] },
          ] },
      ],
    }),
    'plugins.run': () => ({ ok: true, created: ['x10'] }),
    'data.import': (p) => ({ imported: [`imported_${(p as { kind: string }).kind}`], errors: [] }),
    'file.export': (params) => ({
      ok: true,
      path: (params as { path: string }).path,
      pages: [0],
    }),
    // AppShell loads plot prefs (antialias, update_policy, backend) at boot.
    'prefs.get': (p) => {
      const key = (p as { key: string }).key;
      const value =
        key === 'plot.antialias' ? true
        : key === 'plot.backend' ? 'qt'
        : 'change';
      return { key, value };
    },
    'prefs.set': (p) => ({ ok: true, ...(p as Record<string, unknown>) }),
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

  it('renders the top menu bar (File/Edit/Insert/…)', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menubar'));
    expect(screen.getByTestId('menu-File')).toBeInTheDocument();
    expect(screen.getByTestId('menu-Edit')).toBeInTheDocument();
    expect(screen.getByTestId('menu-Insert')).toBeInTheDocument();
    expect(screen.getByTestId('menu-Data')).toBeInTheDocument();
    // Insert toolbar exposes the common widgets.
    expect(screen.getByTestId('tool-add.graph')).toBeInTheDocument();
  });

  it('toolbar insert button adds a widget via the registry → doc.add', async () => {
    const added: Array<Record<string, unknown>> = [];
    const { store } = rig({
      'doc.add': (p) => { added.push(p); return { path: '/page1/graph2' }; },
    });
    render(<AppShell store={store} />);
    // Enabled once insert targets load for the current selection.
    await waitFor(() => expect(screen.getByTestId('tool-add.graph')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('tool-add.graph'));
    await waitFor(() => expect(added.some((a) => a.type === 'graph')).toBe(true));
  });

  it('opening the File menu reveals Open, then clicking it invokes the picker', async () => {
    const onPickVsz = vi.fn().mockResolvedValue('/tmp/x.vsz');
    const opens: string[] = [];
    const { store } = rig({
      'file.open': (p) => { opens.push((p as { path: string }).path); return { ok: true, path: (p as { path: string }).path, changeset: 0 }; },
    });
    render(<AppShell store={store} onPickVsz={onPickVsz} />);
    await waitFor(() => screen.getByTestId('menu-File'));
    fireEvent.click(screen.getByTestId('menu-File'));
    fireEvent.click(screen.getByTestId('menu-item-file.open'));
    await waitFor(() => expect(opens).toEqual(['/tmp/x.vsz']));
  });

  it('Edit → Default styles opens the stylesheet dialog', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Edit'));
    fireEvent.click(screen.getByTestId('menu-Edit'));
    fireEvent.click(screen.getByTestId('menu-item-edit.stylesheet'));
    await waitFor(() => expect(screen.getByTestId('dialog-stylesheet')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('dialog-close'));
    await waitFor(() =>
      expect(screen.queryByTestId('dialog-stylesheet')).not.toBeInTheDocument());
  });

  it('File → Open Recent lists recent files and opens one', async () => {
    const opens: string[] = [];
    const { store } = rig({
      'file.open': (p) => { opens.push((p as { path: string }).path); return { ok: true, path: (p as { path: string }).path, changeset: 0 }; },
    });
    render(<AppShell store={store} />);
    // Wait until the recent list has loaded into the store.
    await waitFor(() => expect(store.getState().recentFiles.length).toBe(1));
    fireEvent.click(screen.getByTestId('menu-File'));
    fireEvent.mouseEnter(screen.getByTestId('submenu-Open Recent'));
    await waitFor(() => screen.getByTestId('recent-recent-a.vsz'));
    fireEvent.click(screen.getByTestId('recent-recent-a.vsz'));
    await waitFor(() => expect(opens).toEqual(['/docs/recent-a.vsz']));
  });

  it('Edit → Preferences opens a schema-driven dialog and writes via prefs.set', async () => {
    const sets: Array<Record<string, unknown>> = [];
    const { store } = rig({
      'prefs.set': (p) => { sets.push(p); return { ok: true, ...(p as Record<string, unknown>) }; },
    });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Edit'));
    fireEvent.click(screen.getByTestId('menu-Edit'));
    fireEvent.click(screen.getByTestId('menu-item-edit.prefs'));
    await waitFor(() => screen.getByTestId('pref-ui.theme'));
    fireEvent.change(screen.getByTestId('pref-ui.theme'), { target: { value: 'dark' } });
    await waitFor(() => expect(sets.some((x) => x.key === 'ui.theme' && x.value === 'dark')).toBe(true));
  });

  it('File → Export opens the dialog and exports with DPI + options', async () => {
    const onPickExportPath = vi.fn().mockResolvedValue('/tmp/out.png');
    const exports: Array<Record<string, unknown>> = [];
    const { store } = rig({
      'file.export': (p) => { exports.push(p); return { ok: true, path: (p as { path: string }).path, pages: [0] }; },
    });
    render(<AppShell store={store} onPickExportPath={onPickExportPath} />);
    await waitFor(() => screen.getByTestId('menu-File'));
    fireEvent.click(screen.getByTestId('menu-File'));
    fireEvent.click(screen.getByTestId('menu-item-file.export'));
    await waitFor(() => screen.getByTestId('export-run'));
    fireEvent.change(screen.getByTestId('export-dpi'), { target: { value: '200' } });
    fireEvent.click(screen.getByTestId('export-run'));
    await waitFor(() => expect(exports.length).toBe(1));
    const opts = exports[0].options as Record<string, unknown>;
    expect(opts.bitmapdpi).toBe(200);
  });

  it('Data → Editor opens the tabular data editor', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-item-data.edit'));
    await waitFor(() => screen.getByTestId('dataedit'));
    await waitFor(() => expect(screen.getByTestId('dataedit-values')).toHaveValue('1\n2\n3'));
  });

  it('Data → Create opens the dataset-create dialog and creates', async () => {
    const created: string[] = [];
    const { store } = rig({
      'data.create': (p) => { created.push((p as { name: string }).name); return { created: [(p as { name: string }).name] }; },
    });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-item-data.create'));
    await waitFor(() => screen.getByTestId('datadlg-create1d'));
    fireEvent.change(screen.getByTestId('dc-name'), { target: { value: 'mydata' } });
    fireEvent.change(screen.getByTestId('dc-expr'), { target: { value: 'x*2' } });
    fireEvent.click(screen.getByTestId('dc-create'));
    await waitFor(() => expect(created).toContain('mydata'));
  });

  it('Tools → Python console runs code via eval.python', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Tools'));
    fireEvent.click(screen.getByTestId('menu-Tools'));
    fireEvent.click(screen.getByTestId('menu-item-tools.console'));
    await waitFor(() => screen.getByTestId('console-input'));
    fireEvent.change(screen.getByTestId('console-input'), { target: { value: '1+1' } });
    fireEvent.click(screen.getByTestId('console-run'));
    await waitFor(() => expect(screen.getByTestId('console-log').textContent).toContain('ran: 1+1'));
  });

  it('Tools → plugin opens the param dialog and runs the plugin', async () => {
    const runs: Array<Record<string, unknown>> = [];
    const { store } = rig({ 'plugins.run': (p) => { runs.push(p); return { ok: true, created: [] }; } });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Tools'));
    fireEvent.click(screen.getByTestId('menu-Tools'));
    // The plugin is nested under its menu group (General → Replace text).
    await waitFor(() => screen.getByTestId('submenu-General'));
    fireEvent.mouseEnter(screen.getByTestId('submenu-General'));
    await waitFor(() => screen.getByTestId('plugin-item-Replace text'));
    fireEvent.click(screen.getByTestId('plugin-item-Replace text'));
    await waitFor(() => screen.getByTestId('plugin-form'));
    fireEvent.change(screen.getByTestId('plugin-field-text1'), { target: { value: 'foo' } });
    fireEvent.click(screen.getByTestId('plugin-run'));
    await waitFor(() => expect(runs.length).toBe(1));
    expect(runs[0]).toMatchObject({ kind: 'tools', name: 'Replace text', fields: { text1: 'foo' } });
  });

  it('Data → Operations runs a dataset plugin via plugins.run', async () => {
    const runs: Array<Record<string, unknown>> = [];
    const { store } = rig({ 'plugins.run': (p) => { runs.push(p); return { ok: true, created: ['x10'] }; } });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-Data'));
    fireEvent.mouseEnter(screen.getByTestId('submenu-Operations'));
    await waitFor(() => screen.getByTestId('submenu-Add'));
    fireEvent.mouseEnter(screen.getByTestId('submenu-Add'));
    await waitFor(() => screen.getByTestId('plugin-item-Add'));
    fireEvent.click(screen.getByTestId('plugin-item-Add'));
    await waitFor(() => screen.getByTestId('plugin-form'));
    fireEvent.change(screen.getByTestId('plugin-field-ds_in'), { target: { value: 'x' } });
    fireEvent.change(screen.getByTestId('plugin-field-value'), { target: { value: '10' } });
    fireEvent.change(screen.getByTestId('plugin-field-ds_out'), { target: { value: 'x10' } });
    fireEvent.click(screen.getByTestId('plugin-run'));
    await waitFor(() => expect(runs.length).toBe(1));
    expect(runs[0]).toMatchObject({ kind: 'dataset', name: 'Add', fields: { ds_in: 'x', value: 10, ds_out: 'x10' } });
  });

  it('Data → Import data file imports via data.import', async () => {
    const imports: Array<Record<string, unknown>> = [];
    const { store } = rig({
      'data.import': (p) => { imports.push(p); return { imported: ['col1'], errors: [] }; },
    });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-Data'));
    fireEvent.click(screen.getByTestId('menu-item-data.importfile'));
    await waitFor(() => screen.getByTestId('import-form'));
    fireEvent.change(screen.getByTestId('import-filename'), { target: { value: '/data/file.dat' } });
    fireEvent.change(screen.getByTestId('import-field-descriptor'), { target: { value: 'x y' } });
    fireEvent.click(screen.getByTestId('import-run'));
    await waitFor(() => expect(imports.length).toBe(1));
    expect(imports[0]).toMatchObject({
      kind: 'plaintext', filename: '/data/file.dat',
      options: { descriptor: 'x y' },
    });
  });

  it('Edit → Custom definitions loads the current definitions', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-Edit'));
    fireEvent.click(screen.getByTestId('menu-Edit'));
    fireEvent.click(screen.getByTestId('menu-item-edit.custom'));
    await waitFor(() => screen.getByTestId('custom'));
    await waitFor(() => expect(screen.getByTestId('custom-name-0')).toHaveValue('pi'));
  });

  it('View → Document tree toggles the tree panel', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('app-tree'));
    fireEvent.click(screen.getByTestId('menu-View'));
    fireEvent.click(screen.getByTestId('menu-item-view.tree'));
    await waitFor(() => expect(screen.queryByTestId('app-tree')).not.toBeInTheDocument());
  });

  it('File → New resets the document via doc.new', async () => {
    const news: number[] = [];
    const { store } = rig({ 'doc.new': () => { news.push(1); return { ok: true, changeset: 0 }; } });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('menu-File'));
    fireEvent.click(screen.getByTestId('menu-File'));
    fireEvent.click(screen.getByTestId('menu-item-file.new'));
    await waitFor(() => expect(news.length).toBe(1));
  });

  it('shows a page bar for multi-page documents', async () => {
    const twoPages = {
      name: '', path: '/', type: 'document', children: [
        { name: 'page1', path: '/page1', type: 'page', children: [] },
        { name: 'page2', path: '/page2', type: 'page', children: [] },
      ],
    };
    const { store } = rig({ 'doc.tree': () => twoPages });
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('page-bar'));
    expect(screen.getByTestId('page-label')).toHaveTextContent('Page 1 / 2');
  });

  it('defaults to the qt backend in the selector', async () => {
    const { store } = rig();
    render(<AppShell store={store} />);
    await waitFor(() => screen.getByTestId('backend-selector'));
    expect(screen.getByTestId('backend-qt')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('backend-vello')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switching backend re-renders via render.png with the chosen backend', async () => {
    const backends: string[] = [];
    const { store } = rig({
      'render.png': (p) => {
        const backend = (p as { backend?: string }).backend ?? 'qt';
        backends.push(backend);
        return {
          png: PNG_1PX, width: 100, height: 100,
          bounds: { '/page1/graph1/xy1': [10, 10, 90, 90] }, backend,
        };
      },
    });
    render(<AppShell store={store} />);
    // Initial render(s) go through the default qt backend.
    await waitFor(() => expect(backends).toContain('qt'));
    fireEvent.click(screen.getByTestId('backend-vello'));
    // The flip drives a fresh render through the vello backend.
    await waitFor(() => expect(backends).toContain('vello'));
    expect(screen.getByTestId('backend-vello')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('backend-qt')).toHaveAttribute('aria-pressed', 'false');
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
