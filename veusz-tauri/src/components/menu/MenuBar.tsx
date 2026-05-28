/**
 * Top menu bar — renders the MENUS tree from the action registry. Dependency-
 * free (click to open, hover to switch between open menus, Escape / click-away
 * to close, nested submenus on hover). Enabled/checked/label come from live
 * store state so items grey out exactly like the Qt menus.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import type { DocState } from '../../state/doc';
import type { DocStore } from '../../keys/shortcuts';
import type { PluginInfo } from '../../rpc/types';
import { ACTIONS } from '../../actions/actions';
import { MENUS } from '../../actions/menus';
import { actionLabel, type ActionCtx, type MenuItem } from '../../actions/types';

export function MenuBar({ store, ctx }: { store: DocStore; ctx: ActionCtx }) {
  const s = store();
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === null) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const close = () => setOpen(null);
  const runAction = (id: string) => {
    close();
    const act = ACTIONS[id];
    if (act) void act.run(ctx);
  };

  return (
    <div ref={ref} role="menubar" data-testid="menubar" style={bar}>
      {MENUS.map((menu, i) => (
        <div key={menu.label} style={{ position: 'relative' }}>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={open === i}
            data-testid={`menu-${menu.label}`}
            onClick={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => { if (open !== null) setOpen(i); }}
            style={{ ...topBtn, background: open === i ? '#e6effd' : 'transparent' }}
          >
            {menu.label}
          </button>
          {open === i && (
            <MenuPanel items={menu.items} state={s} ctx={ctx} onRun={runAction} onClose={close} />
          )}
        </div>
      ))}
    </div>
  );
}

function MenuPanel({
  items, state, ctx, onRun, onClose,
}: {
  items: MenuItem[]; state: DocState; ctx: ActionCtx;
  onRun: (id: string) => void; onClose: () => void;
}) {
  return (
    <div role="menu" style={panel}>
      {items.map((it, idx) => {
        if (it.kind === 'separator') return <div key={idx} style={separator} />;
        if (it.kind === 'recent') {
          return <RecentItems key={idx} state={state} ctx={ctx} onClose={onClose} />;
        }
        if (it.kind === 'plugins') {
          return (
            <PluginItems key={idx} which={it.which} state={state} ctx={ctx} onClose={onClose} />
          );
        }
        if (it.kind === 'submenu') {
          return (
            <SubMenu key={idx} label={it.label} items={it.items}
              state={state} ctx={ctx} onRun={onRun} onClose={onClose} />
          );
        }
        const act = ACTIONS[it.id];
        if (!act) return null;
        if (act.visible && !act.visible(state)) return null;
        const enabled = act.enabled ? act.enabled(state) : true;
        const checked = act.checked ? act.checked(state) : undefined;
        return (
          <button
            key={idx}
            type="button"
            role="menuitem"
            disabled={!enabled}
            data-testid={`menu-item-${it.id}`}
            onClick={() => onRun(it.id)}
            style={item(enabled)}
          >
            <span>
              {checked !== undefined ? (checked ? '✓ ' : '  ') : ''}
              {actionLabel(act, state)}
            </span>
            {act.shortcut && <span style={shortcut}>{act.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}

function RecentItems({
  state, ctx, onClose,
}: { state: DocState; ctx: ActionCtx; onClose: () => void }) {
  const files = state.recentFiles;
  if (!files.length) {
    return <div data-testid="recent-empty" style={{ ...item(false), justifyContent: 'flex-start' }}>No recent files</div>;
  }
  const base = (p: string) => p.split('/').filter(Boolean).pop() ?? p;
  return (
    <Fragment>
      {files.map((f) => (
        <button
          key={f.path}
          type="button"
          role="menuitem"
          disabled={!f.exists}
          data-testid={`recent-${base(f.path)}`}
          title={f.path}
          onClick={() => { onClose(); void ctx.store.getState().openFile(f.path); }}
          style={item(f.exists)}
        >
          <span>{base(f.path)}</span>
        </button>
      ))}
      <div style={separator} />
      <button
        type="button"
        role="menuitem"
        data-testid="recent-clear"
        onClick={() => { onClose(); void ctx.store.getState().clearRecentFiles(); }}
        style={item(true)}
      >
        <span>Clear recent</span>
      </button>
    </Fragment>
  );
}

type PNode =
  | { type: 'group'; label: string; children: PNode[] }
  | { type: 'leaf'; label: string; plugin: PluginInfo };

/** Group plugins into a nested tree by their menu paths (e.g. Colors → Swap). */
function buildPluginTree(plugins: PluginInfo[]): PNode[] {
  const roots: PNode[] = [];
  for (const p of plugins) {
    const path = p.menu.length ? p.menu : [p.name];
    let level = roots;
    path.forEach((seg, i) => {
      if (i === path.length - 1) {
        level.push({ type: 'leaf', label: seg, plugin: p });
        return;
      }
      let grp = level.find((n) => n.type === 'group' && n.label === seg) as
        Extract<PNode, { type: 'group' }> | undefined;
      if (!grp) { grp = { type: 'group', label: seg, children: [] }; level.push(grp); }
      level = grp.children;
    });
  }
  return roots;
}

function PluginItems({
  which, state, ctx, onClose,
}: {
  which: 'tools' | 'dataset'; state: DocState; ctx: ActionCtx; onClose: () => void;
}) {
  const plugins = which === 'tools' ? state.plugins.tools : state.plugins.datasets;
  if (!plugins.length) {
    return (
      <div data-testid={`plugins-${which}-empty`}
        style={{ ...item(false), justifyContent: 'flex-start' }}>
        No plugins
      </div>
    );
  }
  return (
    <PluginNodes nodes={buildPluginTree(plugins)} which={which} ctx={ctx} onClose={onClose} />
  );
}

function PluginNodes({
  nodes, which, ctx, onClose,
}: {
  nodes: PNode[]; which: 'tools' | 'dataset'; ctx: ActionCtx; onClose: () => void;
}) {
  return (
    <Fragment>
      {nodes.map((n) =>
        n.type === 'group' ? (
          <PluginGroup key={`g:${n.label}`} node={n} which={which} ctx={ctx} onClose={onClose} />
        ) : (
          <button
            key={`l:${n.plugin.name}`}
            type="button"
            role="menuitem"
            data-testid={`plugin-item-${n.plugin.name}`}
            onClick={() => { onClose(); ctx.openPlugin(which, n.plugin); }}
            style={item(true)}
          >
            <span>{n.label}</span>
          </button>
        ),
      )}
    </Fragment>
  );
}

function PluginGroup({
  node, which, ctx, onClose,
}: {
  node: Extract<PNode, { type: 'group' }>;
  which: 'tools' | 'dataset'; ctx: ActionCtx; onClose: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button type="button" role="menuitem" aria-haspopup="true" aria-expanded={hover}
        data-testid={`submenu-${node.label}`} style={item(true)}>
        <span>{node.label}</span>
        <span aria-hidden>{'▸'}</span>
      </button>
      {hover && (
        <div style={{ position: 'absolute', left: '100%', top: -4 }}>
          <div role="menu" style={panel}>
            <PluginNodes nodes={node.children} which={which} ctx={ctx} onClose={onClose} />
          </div>
        </div>
      )}
    </div>
  );
}

function SubMenu({
  label, items, state, ctx, onRun, onClose,
}: {
  label: string; items: MenuItem[]; state: DocState; ctx: ActionCtx;
  onRun: (id: string) => void; onClose: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={hover}
        data-testid={`submenu-${label}`}
        style={item(true)}
      >
        <span>{label}</span>
        <span aria-hidden>{'▸'}</span>
      </button>
      {hover && (
        <div style={{ position: 'absolute', left: '100%', top: -4 }}>
          <MenuPanel items={items} state={state} ctx={ctx} onRun={onRun} onClose={onClose} />
        </div>
      )}
    </div>
  );
}

const bar: React.CSSProperties = {
  display: 'flex', gap: 2, padding: '2px 4px', borderBottom: '1px solid #ddd',
  background: '#fafafa', font: '13px system-ui, sans-serif', userSelect: 'none',
};
const topBtn: React.CSSProperties = {
  border: 'none', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', font: 'inherit',
};
const panel: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, minWidth: 200, zIndex: 1000,
  background: '#fff', border: '1px solid #ccc', borderRadius: 4, padding: 4,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
};
const separator: React.CSSProperties = { height: 1, background: '#e2e2e2', margin: '4px 6px' };
const shortcut: React.CSSProperties = { color: '#999', marginLeft: 24, fontSize: 11 };
function item(enabled: boolean): React.CSSProperties {
  return {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
    padding: '4px 8px', borderRadius: 3, cursor: enabled ? 'pointer' : 'default',
    color: enabled ? '#111' : '#aaa', font: 'inherit', whiteSpace: 'nowrap',
  };
}
