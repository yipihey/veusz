/**
 * Phase-1 app shell.
 *
 * Composes Tree (left sidebar) + PlotCanvas (center) + Inspector (right
 * sidebar) + DatasetPanel (bottom-right), all driven from a single
 * DocState store. Pure presentational composition — the store handles
 * RPC and state. Lifts no Tauri-specific imports so unit and e2e tests
 * can drive the same shell against mock or live daemons.
 */

import { useEffect, type ReactNode } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';
import { Tree } from '../tree/Tree';
import { Inspector } from '../inspector/Inspector';
import { DatasetPanel } from '../data/DatasetPanel';
import { PlotCanvas } from '../plot/PlotCanvas';

export interface AppShellProps {
  store: UseBoundStore<StoreApi<DocState>>;
  /** Default render size — caller may pass measured viewport dims later. */
  renderWidth?: number;
  renderHeight?: number;
  /** Optional escape hatches that the host wires up (Tauri native dialog). */
  onPickCsv?: () => Promise<string | null>;
}

export function AppShell({
  store,
  renderWidth = 600,
  renderHeight = 400,
  onPickCsv,
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

  const refreshAll = store((s) => s.refreshAll);
  const renderAt = store((s) => s.renderAt);
  const select = store((s) => s.select);
  const setValue = store((s) => s.setValue);
  const undo = store((s) => s.undo);
  const redo = store((s) => s.redo);
  const importCsv = store((s) => s.importCsv);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  // Re-render whenever the doc tree mutates (selection, edits, undo).
  // The render call is itself debounceable in v2; v1 just fires on
  // every relevant change.
  const treeChangeKey = JSON.stringify(tree);
  useEffect(() => {
    if (tree && tree.children.length > 0) {
      void renderAt(0, renderWidth, renderHeight);
    }
  }, [treeChangeKey, renderWidth, renderHeight, renderAt, values, tree]);

  const handleImport = async () => {
    if (!onPickCsv) return;
    const path = await onPickCsv();
    if (!path) return;
    await importCsv(path);
  };

  return (
    <div data-testid="app-shell" style={layout.root}>
      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        error={error}
      />

      <div style={layout.body}>
        <aside data-testid="app-tree" style={layout.sidebar}>
          <h4>Document</h4>
          {tree ? (
            <Tree root={tree} selected={selected ?? undefined} onSelect={select} />
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
              selected={selected ?? undefined}
              onSelect={select}
            />
          ) : (
            <p data-testid="app-plot-empty">No plot yet — import a CSV.</p>
          )}
        </main>

        <aside data-testid="app-inspector" style={layout.sidebar}>
          {schema && selected ? (
            <Inspector
              schema={schema}
              widgetPath={selected}
              values={values}
              datasets={datasets.map((d) => d.name)}
              onChange={setValue}
            />
          ) : (
            <p data-testid="app-inspector-empty">Select a widget.</p>
          )}
        </aside>
      </div>

      <footer data-testid="app-datasets" style={layout.footer}>
        <DatasetPanel
          datasets={datasets}
          onSelect={() => {}}
          onImport={onPickCsv ? handleImport : undefined}
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
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  error: string | null;
}): ReactNode {
  return (
    <header data-testid="app-toolbar" style={layout.toolbar}>
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

const layout = {
  root: { display: 'flex', flexDirection: 'column' as const, height: '100vh' },
  toolbar: { display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid #ddd' },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  sidebar: { width: 280, padding: 8, overflow: 'auto', borderRight: '1px solid #ddd' },
  center: { flex: 1, padding: 8, overflow: 'auto', display: 'flex',
            alignItems: 'flex-start', justifyContent: 'center' },
  footer: { padding: 8, borderTop: '1px solid #ddd', maxHeight: 200, overflow: 'auto' },
};
