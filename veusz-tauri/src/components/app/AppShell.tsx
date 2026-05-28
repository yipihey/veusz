/**
 * Phase-1 app shell.
 *
 * Composes Tree (left sidebar) + PlotCanvas (center) + Inspector (right
 * sidebar) + DatasetPanel (bottom-right), all driven from a single
 * DocState store. Pure presentational composition — the store handles
 * RPC and state. Lifts no Tauri-specific imports so unit and e2e tests
 * can drive the same shell against mock or live daemons.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';
import { Tree, type SelectMode } from '../tree/Tree';
import { TreeContextMenu } from '../tree/TreeContextMenu';
import { Inspector } from '../inspector/Inspector';
import { SettingContextMenu } from '../inspector/SettingContextMenu';
import { DatasetPanel } from '../data/DatasetPanel';
import { DatasetContextMenu } from '../data/DatasetContextMenu';
import { DatasetFileContextMenu } from '../data/DatasetFileContextMenu';
import { PlotCanvas } from '../plot/PlotCanvas';
import { PlotContextMenu } from '../plot/PlotContextMenu';
import { flattenTreePaths, computeSelection } from './selection';
import { useKeyboardShortcuts } from '../../keys/shortcuts';

export interface AppShellProps {
  store: UseBoundStore<StoreApi<DocState>>;
  /** Default render size — caller may pass measured viewport dims later. */
  renderWidth?: number;
  renderHeight?: number;
  /** Tauri native file pickers (left unset, the buttons are hidden). */
  onPickCsv?: () => Promise<string | null>;
  onPickVsz?: () => Promise<string | null>;
  onPickSavePath?: () => Promise<string | null>;
  onPickExportPath?: () => Promise<string | null>;
}

export function AppShell({
  store,
  renderWidth = 600,
  renderHeight = 400,
  onPickCsv,
  onPickVsz,
  onPickSavePath,
  onPickExportPath,
}: AppShellProps) {
  const tree = store((s) => s.tree);
  const datasets = store((s) => s.datasets);
  const selected = store((s) => s.selected);
  const schema = store((s) => s.schema);
  const values = store((s) => s.values);
  const render = store((s) => s.render);
  const canUndo = store((s) => s.canUndo);
  const canRedo = store((s) => s.canRedo);
  const error = store((s) => s.error);
  const filename = store((s) => s.filename);
  const currentPage = store((s) => s.currentPage);
  const antialias = store((s) => s.antialias);
  const selectedDatasets = store((s) => s.selectedDatasets);

  const refreshAll = store((s) => s.refreshAll);
  const requestRender = store((s) => s.requestRender);
  const loadPlotPrefs = store((s) => s.loadPlotPrefs);
  const select = store((s) => s.select);
  const setValue = store((s) => s.setValue);
  const setValues = store((s) => s.setValues);
  const undo = store((s) => s.undo);
  const redo = store((s) => s.redo);
  const importCsv = store((s) => s.importCsv);
  const openFile = store((s) => s.openFile);
  const saveFile = store((s) => s.saveFile);
  const saveFileAs = store((s) => s.saveFileAs);
  const exportFile = store((s) => s.exportFile);
  const subscribeToDaemon = store((s) => s.subscribeToDaemon);

  // Anchor for Shift-range selection. Survives re-renders; not state
  // because changing it must not trigger a render.
  const anchorRef = useRef<string | null>(null);
  // Right-click target + inline-rename target for the tree context menu.
  const [ctxPath, setCtxPath] = useState<string | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  // Transient notice (e.g. the Edit-data stub message).
  const [notice, setNotice] = useState<string | null>(null);
  // Anchor for dataset Shift-range selection.
  const dsAnchorRef = useRef<string | null>(null);

  // Install global keyboard shortcuts (cut/copy/paste/undo/redo/etc.).
  // F2 routes up here to flip the selected tree row into rename mode.
  useKeyboardShortcuts(store, { onRename: setRenamingPath });

  const applySelection = (path: string, mode: SelectMode) => {
    const order = flattenTreePaths(store.getState().tree);
    const { selection, anchor } = computeSelection(
      store.getState().selected,
      path,
      mode,
      order,
      anchorRef.current,
    );
    anchorRef.current = anchor;
    void select(selection);
  };

  // Right-click: record the target and ensure it's in the selection
  // before the context menu opens (matches Qt, which selects the
  // row under the cursor if it isn't already selected).
  const handleContextMenu = (path: string) => {
    setCtxPath(path);
    if (!store.getState().selected.includes(path)) {
      anchorRef.current = path;
      void select([path]);
    }
  };

  const handleRenameCommit = (path: string, newName: string | null) => {
    setRenamingPath(null);
    if (newName) void store.getState().renameWidget(path, newName);
  };

  // Dataset-panel multi-select (replace/toggle/range over the flat
  // dataset order). Mirrors the tree's gesture model.
  const applyDatasetSelection = (name: string, mode: SelectMode = 'replace') => {
    const order = store.getState().datasets.map((d) => d.name);
    const { selection, anchor } = computeSelection(
      store.getState().selectedDatasets, name, mode, order, dsAnchorRef.current,
    );
    dsAnchorRef.current = anchor;
    store.getState().selectDatasets(selection);
    // Single-select also drives the details pane via the existing
    // onSelect contract used by the host below.
  };

  const handleDatasetContextMenu = (name: string) => {
    if (!store.getState().selectedDatasets.includes(name)) {
      dsAnchorRef.current = name;
      store.getState().selectDatasets([name]);
    }
  };

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  };

  // Full screen: prefer the Tauri window API (native feel); fall back
  // to the HTML5 Fullscreen API when running in a plain browser (dev
  // server / vitest), where __TAURI_INTERNALS__ is absent.
  const toggleFullScreen = () => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      void (async () => {
        const mod = '@tauri-apps/api/window';
        const { getCurrentWindow } = await import(/* @vite-ignore */ mod);
        const win = getCurrentWindow();
        const on = await win.isFullscreen();
        await win.setFullscreen(!on);
      })().catch(() => {});
      return;
    }
    if (typeof document !== 'undefined') {
      if (document.fullscreenElement) void document.exitFullscreen?.();
      else void document.documentElement.requestFullscreen?.();
    }
  };

  useEffect(() => {
    void refreshAll();
    void loadPlotPrefs();
    return subscribeToDaemon();
  }, [refreshAll, loadPlotPrefs, subscribeToDaemon]);

  // Re-render whenever the doc tree mutates (selection, edits, undo),
  // the current page changes, or the antialias toggle flips. Goes
  // through `requestRender` which coalesces inside a ~33 ms window so
  // slider drags don't fire 60 renders per second.
  const treeChangeKey = JSON.stringify(tree);
  useEffect(() => {
    if (tree && tree.children.length > 0) {
      requestRender(currentPage, renderWidth, renderHeight);
    }
  }, [treeChangeKey, renderWidth, renderHeight, requestRender, values, tree,
      currentPage, antialias]);

  const handleImport = async () => {
    if (!onPickCsv) return;
    const path = await onPickCsv();
    if (!path) return;
    await importCsv(path);
  };

  const handleOpen = async () => {
    if (!onPickVsz) return;
    const path = await onPickVsz();
    if (!path) return;
    await openFile(path);
  };

  const handleSave = async () => {
    if (filename) {
      await saveFile();
      return;
    }
    if (onPickSavePath) {
      const path = await onPickSavePath();
      if (path) await saveFileAs(path);
    }
  };

  const handleSaveAs = async () => {
    if (!onPickSavePath) return;
    const path = await onPickSavePath();
    if (path) await saveFileAs(path);
  };

  const handleExport = async () => {
    if (!onPickExportPath) return;
    const path = await onPickExportPath();
    if (path) await exportFile(path);
  };

  return (
    <div data-testid="app-shell" style={layout.root}>
      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        error={error}
        filename={filename}
        onOpen={onPickVsz ? handleOpen : undefined}
        onSave={onPickSavePath || filename ? handleSave : undefined}
        onSaveAs={onPickSavePath ? handleSaveAs : undefined}
        onExport={onPickExportPath ? handleExport : undefined}
      />

      <div style={layout.body}>
        <aside data-testid="app-tree" style={layout.sidebar}>
          <h4>Document</h4>
          {tree ? (
            <TreeContextMenu
              store={store}
              targetPath={ctxPath}
              onStartRename={setRenamingPath}
              renderWidth={renderWidth}
              renderHeight={renderHeight}
            >
              <div>
                <Tree
                  root={tree}
                  selected={selected}
                  onSelect={applySelection}
                  onContextMenu={handleContextMenu}
                  renamingPath={renamingPath}
                  onRenameCommit={handleRenameCommit}
                  cutPaths={store.getState().cutPaths}
                />
              </div>
            </TreeContextMenu>
          ) : (
            <p data-testid="app-tree-loading">Loading…</p>
          )}
        </aside>

        <main data-testid="app-plot" style={layout.center}>
          {render ? (
            <PlotCanvas
              png={render.png}
              width={render.width}
              height={render.height}
              bounds={render.bounds}
              selected={selected}
              onSelect={(p) => select(p === null ? [] : [p])}
              renderWithContextMenu={(canvas, zoom) => (
                <PlotContextMenu
                  store={store}
                  zoom={zoom}
                  renderWidth={renderWidth}
                  renderHeight={renderHeight}
                  onToggleFullScreen={toggleFullScreen}
                >
                  {canvas}
                </PlotContextMenu>
              )}
            />
          ) : (
            <p data-testid="app-plot-empty">No plot yet — import a CSV.</p>
          )}
        </main>

        <aside data-testid="app-inspector" style={layout.sidebar}>
          {schema && selected.length > 0 ? (
            <Inspector
              schema={schema}
              widgetPaths={selected}
              values={values}
              datasets={datasets.map((d) => d.name)}
              onChange={setValue}
              onChangeMany={setValues}
              settingMenu={(ctx, label) => (
                <SettingContextMenu
                  store={store}
                  info={{
                    path: ctx.path,
                    widgetPath: ctx.widgetPath,
                    isReference: ctx.isReference,
                    isStylesheet: ctx.isStylesheet,
                    // Copy-to labels use the owning widget's type/name.
                    widgetType: schema.typename ?? schema.typenames?.[0] ?? '',
                    widgetName: lastSegment(ctx.widgetPath),
                  }}
                >
                  {label}
                </SettingContextMenu>
              )}
            />
          ) : (
            <p data-testid="app-inspector-empty">Select a widget.</p>
          )}
        </aside>
      </div>

      <footer data-testid="app-datasets" style={layout.footer}>
        {notice && (
          <span data-testid="app-notice" role="status" style={{ color: '#555' }}>
            {notice}
          </span>
        )}
        <DatasetPanel
          datasets={datasets}
          selected={selectedDatasets}
          onSelect={applyDatasetSelection}
          onImport={onPickCsv ? handleImport : undefined}
          renderRowMenu={(name, node) => (
            <DatasetContextMenu
              store={store}
              targetName={name}
              onOpen={() => handleDatasetContextMenu(name)}
              onNotify={notify}
            >
              {node}
            </DatasetContextMenu>
          )}
          renderFileMenu={(filename, header) => (
            <DatasetFileContextMenu store={store} filename={filename}>
              {header}
            </DatasetFileContextMenu>
          )}
        />
      </footer>
    </div>
  );
}

function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  error,
  filename,
  onOpen,
  onSave,
  onSaveAs,
  onExport,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  error: string | null;
  filename: string | null;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onExport?: () => void;
}): ReactNode {
  return (
    <header data-testid="app-toolbar" style={layout.toolbar}>
      {onOpen && (
        <button type="button" data-testid="toolbar-open" onClick={() => onOpen()}>
          Open…
        </button>
      )}
      {onSave && (
        <button type="button" data-testid="toolbar-save" onClick={() => onSave()}>
          Save
        </button>
      )}
      {onSaveAs && (
        <button type="button" data-testid="toolbar-save-as" onClick={() => onSaveAs()}>
          Save As…
        </button>
      )}
      {onExport && (
        <button type="button" data-testid="toolbar-export" onClick={() => onExport()}>
          Export…
        </button>
      )}
      <span data-testid="toolbar-filename" style={{ flex: 1, color: '#666' }}>
        {filename ?? '(unsaved)'}
      </span>
      <button
        type="button"
        data-testid="toolbar-undo"
        disabled={!canUndo}
        onClick={() => onUndo()}
      >
        Undo
      </button>
      <button
        type="button"
        data-testid="toolbar-redo"
        disabled={!canRedo}
        onClick={() => onRedo()}
      >
        Redo
      </button>
      {error && (
        <span data-testid="app-error" role="alert" style={{ color: 'crimson' }}>
          {error}
        </span>
      )}
    </header>
  );
}

function lastSegment(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

const layout = {
  root: { display: 'flex', flexDirection: 'column' as const, height: '100vh' },
  toolbar: { display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid #ddd' },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  sidebar: { width: 280, padding: 8, overflow: 'auto', borderRight: '1px solid #ddd' },
  center: { flex: 1, padding: 8, overflow: 'auto', display: 'flex',
            alignItems: 'flex-start', justifyContent: 'center' },
  footer: { padding: 8, borderTop: '1px solid #ddd', maxHeight: 200, overflow: 'auto' },
};
