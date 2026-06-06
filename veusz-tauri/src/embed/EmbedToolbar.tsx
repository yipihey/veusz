/**
 * Compact, action-driven toolbar for `<veusz-figure>`. Reuses the existing
 * `ACTIONS` registry from `src/actions/actions.ts` — so an "Insert → XY"
 * button does exactly what the desktop AppShell does, gated by the same
 * `enabled(state)` predicates (e.g. `add.xy` only enables when the daemon's
 * `doc.insert_targets` says 'xy' can land somewhere from the current
 * selection).
 *
 * Two layouts via `density`:
 *  - `inline`: a single Insert ▾ dropdown + Undo + Redo. Fits in the figure
 *    header card next to the Download menu.
 *  - `full`:   Insert ▾, Edit row (Cut/Copy/Paste/Delete/Move-up/down/
 *    Copy-as-image), a Data ▾ dropdown (Create / Create 2D / Filter /
 *    Histogram / Edit / Custom), and page-nav when the document has >1 page.
 *
 * Insert ▾ mirrors the upstream Veusz Insert menu structure exactly — it
 * loops over `INSERT_WIDGETS` (Pages & Graphs / Axes / Plotters / 3D /
 * Annotations / Shapes), each leaf is `add.<typename>`.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { ACTIONS, INSERT_WIDGETS } from '../actions/actions';
import type { ActionCtx, Action } from '../actions/types';
import { actionLabel } from '../actions/types';
import { ThemePicker } from './ThemePicker';

type Store = UseBoundStore<StoreApi<DocState>>;

export interface EmbedToolbarProps {
  store: Store;
  ctx: ActionCtx;
  density: 'inline' | 'full';
  /** Override the Reload button's behavior. The WASM embed passes a callback
   *  that re-fetches every URL data source (via the urlLinks controller) *and*
   *  reloads file-based linked data — so a single click refreshes everything,
   *  not just filesystem links. When omitted the button falls back to the
   *  standard `data.reload` action (file-only). When the document has no
   *  linked datasets the button is hidden either way. */
  onReload?: () => Promise<void> | void;
}

export function EmbedToolbar({ store, ctx, density, onReload }: EmbedToolbarProps) {
  const s = store();  // reactive — re-renders when state changes (enabled flips, page nav, etc.)
  const npages = s.tree?.children.length ?? 0;
  const inline = density === 'inline';
  const hasLinked = s.datasets.some((d) => d.linked);

  return (
    <div
      data-testid={inline ? 'embed-toolbar-inline' : 'embed-toolbar-full'}
      style={inline ? rowInline : rowFull}
    >
      <InsertDropdown state={s} ctx={ctx} compact={inline} />
      <ActionBtn id="edit.undo" state={s} ctx={ctx} label="↶" title="Undo" />
      <ActionBtn id="edit.redo" state={s} ctx={ctx} label="↷" title="Redo" />
      {hasLinked && (
        <ReloadBtn ctx={ctx} compact={inline} onReload={onReload} />
      )}

      {!inline && (
        <>
          <Sep />
          <ActionBtn id="edit.cut"      state={s} ctx={ctx} label="✂ Cut" />
          <ActionBtn id="edit.copy"     state={s} ctx={ctx} label="⧉ Copy" />
          <ActionBtn id="edit.paste"    state={s} ctx={ctx} label="↥ Paste" />
          <ActionBtn id="edit.delete"   state={s} ctx={ctx} label="🗑 Delete" />
          <Sep />
          <ActionBtn id="edit.moveup"   state={s} ctx={ctx} label="▲" title="Move up" />
          <ActionBtn id="edit.movedown" state={s} ctx={ctx} label="▼" title="Move down" />
          <Sep />
          <DataDropdown state={s} ctx={ctx} />
          <Sep />
          <ThemeControl store={store} />
          {npages > 1 && (
            <>
              <Sep />
              <ActionBtn id="view.prevpage" state={s} ctx={ctx} label="◀" title="Previous page" />
              <span style={{ fontSize: 12, color: '#666' }}
                data-testid="embed-toolbar-page">{s.currentPage + 1} / {npages}</span>
              <ActionBtn id="view.nextpage" state={s} ctx={ctx} label="▶" title="Next page" />
            </>
          )}
        </>
      )}
    </div>
  );
}

// --- pieces ---------------------------------------------------------------

function ActionBtn({
  id, state, ctx, label, title,
}: {
  id: string; state: DocState; ctx: ActionCtx; label?: string; title?: string;
}) {
  const a = ACTIONS[id] as Action | undefined;
  if (!a) return null;
  const visible = a.visible ? a.visible(state) : true;
  if (!visible) return null;
  const enabled = a.enabled ? a.enabled(state) : true;
  const text = label ?? actionLabel(a, state);
  const hint = title ?? actionLabel(a, state)
                       + (a.shortcut ? `  (${a.shortcut})` : '');
  return (
    <button
      type="button"
      data-testid={`embed-action-${id}`}
      onClick={() => { void a.run(ctx); }}
      disabled={!enabled}
      title={hint}
      style={btn(enabled)}
    >{text}</button>
  );
}

function Sep() {
  return <span style={{ width: 1, height: 18, background: '#e2e4e8' }} />;
}

function ReloadBtn({
  ctx, compact, onReload,
}: {
  ctx: ActionCtx;
  compact: boolean;
  onReload?: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const a = ACTIONS['data.reload'] as Action | undefined;
  const click = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (onReload) await onReload();
      else if (a) await a.run(ctx);
    } finally { setBusy(false); }
  };
  const hint = (a?.shortcut ? `Reload data  (${a.shortcut})` : 'Reload data')
             + (onReload ? ' — refetch URL sources and reload linked files'
                         : '');
  return (
    <button
      type="button"
      data-testid="embed-action-data.reload"
      onClick={() => { void click(); }}
      disabled={busy}
      title={hint}
      style={btn(!busy)}
    >{busy ? '⟳' : '↻'}{compact ? '' : ' Reload'}</button>
  );
}

function InsertDropdown({
  state, ctx, compact,
}: { state: DocState; ctx: ActionCtx; compact: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }} data-testid="embed-insert">
      <button
        type="button"
        data-testid="embed-insert-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Insert a new element"
        style={btn(true)}
      >＋ {compact ? '' : 'Insert '}▾</button>
      {open && (
        <div role="menu" data-testid="embed-insert-menu" style={menu}>
          {INSERT_WIDGETS.map((g) => (
            <Fragment key={g.group}>
              <div style={groupHdr}>{g.group}</div>
              {g.items.map(([type, label]) => {
                const id = `add.${type}`;
                const a = ACTIONS[id];
                if (!a) return null;
                const en = a.enabled ? a.enabled(state) : true;
                return (
                  <button
                    key={type}
                    type="button"
                    data-testid={`embed-insert-${type}`}
                    onClick={() => { if (en) { setOpen(false); void a.run(ctx); } }}
                    disabled={!en}
                    title={en
                      ? label
                      : `${label} — not allowed from the current selection`}
                    style={menuItem(en)}
                  >{label}</button>
                );
              })}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

const DATA_IDS = ['data.create', 'data.create2d', 'data.filter',
                  'data.histogram', 'data.edit', 'edit.custom'] as const;

function DataDropdown({ state, ctx }: { state: DocState; ctx: ActionCtx }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }} data-testid="embed-data">
      <button
        type="button"
        data-testid="embed-data-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Data operations"
        style={btn(true)}
      >∑ Data ▾</button>
      {open && (
        <div role="menu" data-testid="embed-data-menu" style={menu}>
          {DATA_IDS.map((id) => {
            const a = ACTIONS[id];
            if (!a) return null;
            const en = a.enabled ? a.enabled(state) : true;
            return (
              <button
                key={id}
                type="button"
                data-testid={`embed-data-${id}`}
                onClick={() => { if (en) { setOpen(false); void a.run(ctx); } }}
                disabled={!en}
                style={menuItem(en)}
              >{actionLabel(a, state)}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ThemeControl({ store }: { store: Store }) {
  const themes = store((s) => s.themes);
  const applyTheme = store((s) => s.applyTheme);
  const [busy, setBusy] = useState(false);
  const apply = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try { await applyTheme(id); } finally { setBusy(false); }
  };
  return <ThemePicker themes={themes} onApply={(id) => void apply(id)} disabled={busy} />;
}

// --- styles ---------------------------------------------------------------

const rowInline: React.CSSProperties = { display: 'flex', gap: 4, alignItems: 'center' };
const rowFull: React.CSSProperties = {
  display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap',
};
const menu: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
  background: '#fff', border: '1px solid #d0d3d9', borderRadius: 6,
  boxShadow: '0 8px 24px rgba(0,0,0,0.18)', padding: 4, minWidth: 200,
  maxHeight: '70vh', overflowY: 'auto',
};
const groupHdr: React.CSSProperties = {
  fontSize: 10.5, color: '#888', textTransform: 'uppercase',
  padding: '6px 6px 2px', letterSpacing: '0.04em',
};
const menuItem = (enabled: boolean): React.CSSProperties => ({
  display: 'block', width: '100%', textAlign: 'left',
  padding: '4px 8px', background: 'transparent', border: 'none',
  cursor: enabled ? 'pointer' : 'default',
  color: enabled ? '#222' : '#aaa',
  font: '13px system-ui, sans-serif', borderRadius: 3,
});
const btn = (enabled: boolean): React.CSSProperties => ({
  border: '1px solid #d0d3d9', borderRadius: 6, padding: '3px 9px',
  cursor: enabled ? 'pointer' : 'default',
  fontSize: 12, lineHeight: 1.2,
  background: '#fff', color: enabled ? '#222' : '#aaa',
});
