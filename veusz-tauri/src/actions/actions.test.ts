import { describe, it, expect, vi } from 'vitest';
import { ACTIONS } from './actions';
import { MENUS } from './menus';
import { TOOLBARS } from './toolbars';
import type { ActionCtx, MenuItem } from './types';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';

function rig(over: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  const adds: Array<Record<string, unknown>> = [];
  const store = createDocStore(createRpc(mockTransport({
    'doc.tree': () => ({ name: '', path: '/', type: 'document', children: [] }),
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'doc.insert_targets': () => ({ targets: { graph: '/page1', page: '/' } }),
    'doc.add': (p) => { adds.push(p); return { path: '/new' }; },
    ...over,
  })));
  const notify = vi.fn();
  const ctx: ActionCtx = {
    store, openDialog: vi.fn(), pick: {}, notify, toggleFullScreen: vi.fn(),
    openUrl: vi.fn(),
  };
  return { store, ctx, adds, notify };
}

function collectIds(items: MenuItem[]): string[] {
  const ids: string[] = [];
  for (const it of items) {
    if (it.kind === 'action') ids.push(it.id);
    else if (it.kind === 'submenu') ids.push(...collectIds(it.items));
  }
  return ids;
}

describe('action registry', () => {
  it('every menu item id resolves to a registered action', () => {
    const missing = MENUS.flatMap((m) => collectIds(m.items)).filter((id) => !ACTIONS[id]);
    expect(missing).toEqual([]);
  });

  it('every toolbar action id resolves to a registered action', () => {
    const missing = TOOLBARS.flatMap((g) => g.actions).filter((id) => !ACTIONS[id]);
    expect(missing).toEqual([]);
  });

  it('insert action adds the widget at the resolved parent', async () => {
    const { store, ctx, adds } = rig();
    // Simulate insert targets having been loaded for the selection.
    store.setState({ insertTargets: { graph: '/page1' } });
    await ACTIONS['add.graph'].run(ctx);
    await new Promise((r) => setTimeout(r, 0));
    const add = adds.find((a) => a.type === 'graph');
    expect(add).toBeTruthy();
    expect(add?.parent).toBe('/page1');
  });

  it('insert action is disabled when no valid target exists', () => {
    const { store } = rig();
    store.setState({ insertTargets: {} });
    expect(ACTIONS['add.xy'].enabled?.(store.getState())).toBe(false);
    store.setState({ insertTargets: { xy: '/page1/graph1' } });
    expect(ACTIONS['add.xy'].enabled?.(store.getState())).toBe(true);
  });

  it('data.reload triggers a daemon reload', async () => {
    const reloads: number[] = [];
    const { ctx } = rig({ 'data.reload_file': () => { reloads.push(1); return { reloaded: [], errors: {} }; } });
    await ACTIONS['data.reload'].run(ctx);
    await new Promise((r) => setTimeout(r, 0));
    expect(reloads.length).toBe(1);
  });

  it('file.open with no picker notifies rather than throwing', async () => {
    const { ctx, notify } = rig();
    await ACTIONS['file.open'].run(ctx);
    expect(notify).toHaveBeenCalled();
  });

  it('edit.undo is disabled until canUndo, enabled after', () => {
    const { store } = rig();
    expect(ACTIONS['edit.undo'].enabled?.(store.getState())).toBe(false);
    store.setState({ canUndo: true });
    expect(ACTIONS['edit.undo'].enabled?.(store.getState())).toBe(true);
  });
});
