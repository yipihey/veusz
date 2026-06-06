/**
 * Floating, resizable editor modal for an embedded figure. Hosts the live plot
 * (EmbedPlot) next to the desktop Tree + Inspector, so editing happens in a
 * roomy window instead of the cramped inline card. The window is user-resizable
 * (native CSS `resize`) and has a full-screen toggle. Rendered in a portal to
 * document.body so it overlays the whole page regardless of where the figure
 * sits in the host layout.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { Tree } from '../components/tree/Tree';
import { Inspector } from '../components/inspector/Inspector';
import { DataDialog, type DataMode } from '../components/data/DataDialog';
import { DataEditDialog } from '../components/data/DataEditDialog';
import { CustomDialog } from '../components/data/CustomDialog';
import { EmbedPlot } from './EmbedPlot';
import { SvgPlot } from './SvgPlot';
import { EmbedToolbar } from './EmbedToolbar';
import { makeEmbedActionCtx } from './embedActionCtx';
import type { DialogId } from '../actions/types';

type Store = UseBoundStore<StoreApi<DocState>>;

export function EditorModal({
  store, title, width, height, renderer = 'vello', toolbar, onReload, onClose,
}: {
  store: Store;
  title?: string;
  width: number;
  height: number;
  /** Plot renderer: 'vello' (WebGPU canvas) or 'svg' (no-WebGPU SVG). */
  renderer?: 'vello' | 'svg';
  /** Extra controls (e.g. the Download menu) shown in the modal header. */
  toolbar?: React.ReactNode;
  /** Reload-data hook forwarded to the modal toolbar — see VeuszFigureProps. */
  onReload?: () => Promise<void> | void;
  onClose: () => void;
}) {
  const Plot = renderer === 'svg' ? SvgPlot : EmbedPlot;
  const tree = store((s) => s.tree);
  const selected = store((s) => s.selected);
  const schema = store((s) => s.schema);
  const values = store((s) => s.values);
  const datasets = store((s) => s.datasets);
  const colormaps = store((s) => s.colormaps);
  const error = store((s) => s.error);
  const [full, setFull] = useState(false);
  const [busy, setBusy] = useState(false);
  // Subset of ActionCtx.openDialog(id) routed to a portal-mounted dialog
  // here — Data Create / Create 2D / Filter / Histogram / Edit / Custom.
  // Other dialog ids (preferences / export / fit / …) fall back to notify.
  const [dialog, setDialog] = useState<DialogId | null>(null);

  // Lock the host page's scroll while the editor is open, so the mouse wheel
  // scrolls the inspector/tree panel (overflow:auto) instead of the gallery
  // behind the modal.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Lock both <html> and <body> — in standards mode the viewport scroller is
    // usually <html>, so locking only <body> may not stop the page.
    const de = document.documentElement, bo = document.body;
    const prevDe = de.style.overflow, prevBo = bo.style.overflow;
    de.style.overflow = 'hidden';
    bo.style.overflow = 'hidden';
    return () => { de.style.overflow = prevDe; bo.style.overflow = prevBo; };
  }, []);

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

  // ActionCtx wired to this modal: notify via the store's error slot
  // (already surfaced in the header) and route the half-dozen data dialogs
  // we host into a portal-mounted dialog.
  const SUPPORTED: ReadonlySet<DialogId> = new Set<DialogId>([
    'dataCreate', 'dataCreate2d', 'filter', 'histogram', 'dataEdit', 'custom',
  ]);
  const ctx = makeEmbedActionCtx(store, {
    notify: (m) => store.setState({ error: m }),
    openDialog: (id) => {
      if (SUPPORTED.has(id)) setDialog(id);
      else store.setState({ error: `"${id}" dialog is unavailable in the embed.` });
    },
    toggleFullScreen: () => setFull((f) => !f),
  });
  const DATA_MODES: Partial<Record<DialogId, DataMode>> = {
    dataCreate: 'create1d', dataCreate2d: 'create2d',
    filter: 'filter', histogram: 'histogram',
  };
  const closeDialog = () => setDialog(null);
  const notify = (m: string) => store.setState({ error: m });

  return createPortal(
    <div data-testid="veusz-modal" style={backdrop}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={full ? winFull : win} data-testid="veusz-modal-window">
        <header style={hdr}>
          <strong style={{ fontSize: 14 }}>{title ?? 'Edit figure'}</strong>
          <EmbedToolbar store={store} density="full" ctx={ctx} onReload={onReload} />
          <button type="button" data-testid="veusz-reset" onClick={() => void reset()}
            disabled={!store.getState().canUndo || busy}
            style={hbtn} title="Reset all edits to the original figure">⟲ Reset</button>
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
            <Plot store={store} width={width} height={height} />
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
                colormaps={colormaps}
                onChange={(path, value) => { void store.getState().setValue(path, value); }}
                onChangeMany={(ops) => { void store.getState().setValues(ops); }}
              />
            ) : <p style={{ color: '#888', fontSize: 13 }}>Select a widget to edit.</p>}
          </aside>
        </div>

        {dialog && (
          <div style={dialogBackdrop}
            onMouseDown={(e) => { if (e.target === e.currentTarget) closeDialog(); }}>
            <div style={dialogPanel}
              data-testid={`embed-dialog-${dialog}`}>
              <div style={dialogHdr}>
                <strong style={{ fontSize: 13 }}>{DIALOG_TITLES[dialog]}</strong>
                <span style={{ flex: 1 }} />
                <button type="button" data-testid="embed-dialog-close"
                  onClick={closeDialog} style={hbtn}>Close</button>
              </div>
              <div style={{ padding: 12 }}>
                {DATA_MODES[dialog] && (
                  <DataDialog store={store} mode={DATA_MODES[dialog]!}
                    onClose={closeDialog} notify={notify} />
                )}
                {dialog === 'dataEdit' && (
                  <DataEditDialog store={store} notify={notify} />
                )}
                {dialog === 'custom' && (
                  <CustomDialog store={store} notify={notify} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

const DIALOG_TITLES: Partial<Record<DialogId, string>> = {
  dataCreate: 'Create dataset',
  dataCreate2d: 'Create 2D dataset',
  filter: 'Filter data',
  histogram: 'Histogram',
  dataEdit: 'Data editor',
  custom: 'Custom definitions',
};

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
  padding: 10, overflow: 'auto', overscrollBehavior: 'contain', background: '#fff',
};
const dialogBackdrop: React.CSSProperties = {
  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.30)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
};
const dialogPanel: React.CSSProperties = {
  background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  minWidth: 420, maxWidth: '90%', maxHeight: '85%', overflow: 'auto',
};
const dialogHdr: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
  borderBottom: '1px solid #eee',
};
