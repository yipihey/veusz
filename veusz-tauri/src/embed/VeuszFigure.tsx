/**
 * The embeddable figure component: a compact, interactive Veusz figure backed
 * by the in-browser (Pyodide) runtime. Shows the plot with navigate
 * interactions (EmbedPlot) and a collapsible edit panel that reuses the
 * desktop Tree + Inspector — so "edit" is the real inspector running against
 * the Pyodide transport, not a reimplementation.
 *
 * Requires WebGPU (Chrome / Safari 26+); shows a clear message otherwise,
 * since the browser render path has no server-side fallback.
 */

import { useEffect, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { Tree } from '../components/tree/Tree';
import { Inspector } from '../components/inspector/Inspector';
import { EmbedPlot } from './EmbedPlot';

type Store = UseBoundStore<StoreApi<DocState>>;

export interface VeuszFigureProps {
  store: Store;
  /** Render resolution (canvas pixels); the canvas scales to fit its column. */
  width?: number;
  height?: number;
  /** Show the edit affordances (panel toggle). Default true. */
  editable?: boolean;
  title?: string;
}

export function VeuszFigure({
  store, width = 600, height = 400, editable = true, title,
}: VeuszFigureProps) {
  const tree = store((s) => s.tree);
  const selected = store((s) => s.selected);
  const schema = store((s) => s.schema);
  const values = store((s) => s.values);
  const datasets = store((s) => s.datasets);
  const error = store((s) => s.error);
  const webgpu = store((s) => s.webgpuAvailable);
  const [editing, setEditing] = useState(false);

  // Component-lifecycle setup, mirroring AppShell: subscribe to push events,
  // select the browser render path, probe WebGPU, and load the document state.
  useEffect(() => {
    const s = store.getState();
    void s.setBackend('vello-wasm');
    void s.probeWebgpu();
    void s.loadPlotPrefs();
    void s.refreshAll();
    return s.subscribeToDaemon();
  }, [store]);

  if (webgpu === false) {
    return (
      <div data-testid="veusz-figure" style={card}>
        <div data-testid="veusz-needs-webgpu" style={{ padding: 16, color: '#b06000' }}>
          This interactive figure needs WebGPU. Open in Chrome or Safari 26+.
        </div>
      </div>
    );
  }

  return (
    <div data-testid="veusz-figure" style={card}>
      <div style={bar}>
        <strong style={{ fontSize: 13 }}>{title ?? 'Veusz figure'}</strong>
        <span style={{ flex: 1 }} />
        {error && <span data-testid="veusz-error" style={{ color: 'crimson', fontSize: 12 }}>{error}</span>}
        {editable && (
          <button type="button" data-testid="veusz-edit-toggle"
            aria-pressed={editing} onClick={() => setEditing((v) => !v)} style={btn(editing)}>
            Edit
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: 0, padding: 8 }}>
          <EmbedPlot store={store} width={width} height={height} />
        </div>

        {editing && (
          <aside data-testid="veusz-edit-panel" style={panel}>
            {tree ? (
              <Tree
                root={tree}
                selected={selected}
                onSelect={(path: string) => { void store.getState().select([path]); }}
              />
            ) : <p style={{ color: '#888' }}>Loading…</p>}
            <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '8px 0' }} />
            {schema && selected.length > 0 ? (
              <Inspector
                schema={schema}
                widgetPaths={selected}
                values={values}
                datasets={datasets.map((d) => d.name)}
                onChange={(path, value) => { void store.getState().setValue(path, value); }}
                onChangeMany={(ops) => { void store.getState().setValues(ops); }}
              />
            ) : <p style={{ color: '#888', fontSize: 13 }}>Select a widget to edit.</p>}
          </aside>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  border: '1px solid #e2e4e8', borderRadius: 10, overflow: 'hidden',
  background: '#fff', font: '14px system-ui, sans-serif',
};
const bar: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
  borderBottom: '1px solid #eee', background: '#fafbfc',
};
const panel: React.CSSProperties = {
  width: 300, flex: '0 0 300px', borderLeft: '1px solid #eee',
  padding: 8, overflow: 'auto', maxHeight: 520,
};
function btn(active: boolean): React.CSSProperties {
  return {
    border: '1px solid #d0d3d9', borderRadius: 6, padding: '3px 10px',
    cursor: 'pointer', fontSize: 12,
    background: active ? '#1f6feb' : '#fff', color: active ? '#fff' : '#222',
  };
}
