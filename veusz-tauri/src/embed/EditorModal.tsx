/**
 * Floating, resizable editor modal for an embedded figure. Hosts the live plot
 * (EmbedPlot) next to the desktop Tree + Inspector, so editing happens in a
 * roomy window instead of the cramped inline card. The window is user-resizable
 * (native CSS `resize`) and has a full-screen toggle. Rendered in a portal to
 * document.body so it overlays the whole page regardless of where the figure
 * sits in the host layout.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { Tree } from '../components/tree/Tree';
import { Inspector } from '../components/inspector/Inspector';
import { EmbedPlot } from './EmbedPlot';

type Store = UseBoundStore<StoreApi<DocState>>;

export function EditorModal({
  store, title, width, height, toolbar, onClose,
}: {
  store: Store;
  title?: string;
  width: number;
  height: number;
  /** Extra controls (e.g. the Download menu) shown in the modal header. */
  toolbar?: React.ReactNode;
  onClose: () => void;
}) {
  const tree = store((s) => s.tree);
  const selected = store((s) => s.selected);
  const schema = store((s) => s.schema);
  const values = store((s) => s.values);
  const datasets = store((s) => s.datasets);
  const error = store((s) => s.error);
  const canUndo = store((s) => s.canUndo);
  const canRedo = store((s) => s.canRedo);
  const [full, setFull] = useState(false);
  const [busy, setBusy] = useState(false);

  const undo = () => { void store.getState().undo(); };
  const redo = () => { void store.getState().redo(); };
  // Reset = revert every edit back to the originally-loaded document by
  // undoing until there's nothing left (loading the doc isn't undoable).
  const reset = async () => {
    setBusy(true);
    try {
      for (let i = 0; i < 1000 && store.getState().canUndo; i++) {
        await store.getState().undo();
      }
    } finally { setBusy(false); }
  };

  return createPortal(
    <div data-testid="veusz-modal" style={backdrop}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={full ? winFull : win} data-testid="veusz-modal-window">
        <header style={hdr}>
          <strong style={{ fontSize: 14 }}>{title ?? 'Edit figure'}</strong>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" data-testid="veusz-undo" onClick={undo} disabled={!canUndo || busy}
              style={hbtn} title="Undo last change">↶ Undo</button>
            <button type="button" data-testid="veusz-redo" onClick={redo} disabled={!canRedo || busy}
              style={hbtn} title="Redo">↷ Redo</button>
            <button type="button" data-testid="veusz-reset" onClick={() => void reset()} disabled={!canUndo || busy}
              style={hbtn} title="Reset all edits to the original figure">⟲ Reset</button>
          </div>
          {error && <span data-testid="veusz-error" style={{ color: 'crimson', fontSize: 12 }}>{error}</span>}
          <span style={{ flex: 1 }} />
          {toolbar}
          <button type="button" data-testid="veusz-modal-fullscreen" onClick={() => setFull((f) => !f)}
            style={hbtn} title={full ? 'Exit full screen' : 'Full screen'}>{full ? '🗗' : '⛶'}</button>
          <button type="button" data-testid="veusz-modal-close" onClick={onClose}
            style={hbtn} title="Close (Esc)">✕</button>
        </header>
        <div style={body}>
          <div style={plotArea}>
            <EmbedPlot store={store} width={width} height={height} />
          </div>
          <aside style={side} data-testid="veusz-edit-panel">
            {tree ? (
              <Tree root={tree} selected={selected}
                onSelect={(path: string) => { void store.getState().select([path]); }} />
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
        </div>
      </div>
    </div>,
    document.body,
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  font: '14px system-ui, sans-serif',
};
const win: React.CSSProperties = {
  width: 'min(1100px, 92vw)', height: 'min(760px, 88vh)',
  minWidth: 320, minHeight: 240, resize: 'both', overflow: 'hidden',
  background: '#fff', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
  display: 'flex', flexDirection: 'column',
};
const winFull: React.CSSProperties = {
  ...win, width: '100vw', height: '100vh', borderRadius: 0, resize: 'none',
};
const hdr: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
  borderBottom: '1px solid #eee', background: '#fafbfc', flex: '0 0 auto',
};
const hbtn: React.CSSProperties = {
  border: '1px solid #d0d3d9', borderRadius: 6, background: '#fff',
  cursor: 'pointer', fontSize: 13, padding: '3px 9px', lineHeight: 1,
};
const body: React.CSSProperties = {
  flex: '1 1 auto', display: 'flex', minHeight: 0, alignItems: 'stretch',
};
const plotArea: React.CSSProperties = {
  flex: '1 1 auto', minWidth: 0, minHeight: 0, padding: 10, background: '#fff',
};
const side: React.CSSProperties = {
  flex: '0 0 320px', width: 320, borderLeft: '1px solid #eee',
  padding: 10, overflow: 'auto', background: '#fff',
};
