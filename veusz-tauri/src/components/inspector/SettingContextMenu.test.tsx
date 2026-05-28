/**
 * SettingContextMenu: right-click a property label → reset / copy-to /
 * use-as-default / unlink dispatch the matching store actions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';
import { createDocStore } from '../../state/doc';
import { SettingContextMenu, type SettingMenuInfo } from './SettingContextMenu';

function makeStore() {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const rec = (name: string) => (p: Record<string, unknown>) => {
    calls.push([name, p]);
    return { changeset: 1, value: null, stylesheet_path: '/StyleSheet/xy/marker' };
  };
  const t = mockTransport({
    'doc.tree': () => ({
      name: '', path: '/', type: 'document',
      children: [{
        name: 'page1', path: '/page1', type: 'page',
        children: [{
          name: 'graph1', path: '/page1/graph1', type: 'graph',
          children: [
            { name: 'xy1', path: '/page1/graph1/xy1', type: 'xy', children: [] },
            { name: 'xy2', path: '/page1/graph1/xy2', type: 'xy', children: [] },
          ],
        }],
      }],
    }),
    'data.list': () => [],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'file.info': () => ({ path: null, changeset: 0, modified: false }),
    'doc.reset_setting_default': rec('doc.reset_setting_default'),
    'doc.propagate_setting': rec('doc.propagate_setting'),
    'doc.set_setting_default': rec('doc.set_setting_default'),
    'doc.unlink_setting': rec('doc.unlink_setting'),
    'doc.schema': () => ({ typename: 'xy', mode: 'class', name: '', usertext: '', descr: '', setnsmode: '', settings: [], subgroups: [] }),
    'doc.get': () => ({}),
  });
  return { store: createDocStore(createRpc(t)), calls };
}

async function open(info: Partial<SettingMenuInfo> = {}) {
  const { store, calls } = makeStore();
  await store.getState().refreshAll(); // populate the tree
  const full: SettingMenuInfo = {
    path: '/page1/graph1/xy1/marker',
    widgetPath: '/page1/graph1/xy1',
    widgetType: 'xy',
    widgetName: 'xy1',
    isReference: false,
    isStylesheet: false,
    ...info,
  };
  render(
    <SettingContextMenu store={store} info={full}>
      <label data-testid="setting-label">Marker</label>
    </SettingContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId('setting-label'));
  await screen.findByTestId('setting-context-menu');
  return { store, calls };
}

describe('SettingContextMenu', () => {
  beforeEach(() => cleanup());

  it('Reset to default dispatches doc.reset_setting_default', async () => {
    const { calls } = await open();
    fireEvent.click(screen.getByTestId('setting-reset'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'doc.reset_setting_default')).toBe(true);
  });

  it('Copy-to scopes dispatch propagate_setting with the right scope', async () => {
    const { calls } = await open();
    fireEvent.click(screen.getByTestId('setting-copy-to'));
    fireEvent.click(await screen.findByTestId('setting-copy-all-type'));
    await new Promise((r) => setTimeout(r, 5));
    const call = calls.find((c) => c[0] === 'doc.propagate_setting');
    expect(call).toBeDefined();
    expect((call![1] as { scope: string }).scope).toBe('all_of_type');
  });

  it('Copy-to lists individual same-type widgets (excluding the owner)', async () => {
    const { calls } = await open();
    fireEvent.click(screen.getByTestId('setting-copy-to'));
    // xy2 is the other xy widget; xy1 (owner) must not be listed.
    expect(screen.queryByTestId('setting-copy-widget-/page1/graph1/xy1'))
      .not.toBeInTheDocument();
    const item = await screen.findByTestId('setting-copy-widget-/page1/graph1/xy2');
    fireEvent.click(item);
    await new Promise((r) => setTimeout(r, 5));
    const call = calls.find((c) => c[0] === 'doc.propagate_setting');
    expect(call).toBeDefined();
    expect((call![1] as { scope: string }).scope).toBe('widgets');
    expect((call![1] as { widget_paths: string[] }).widget_paths)
      .toEqual(['/page1/graph1/xy2']);
  });

  it('Use as default style dispatches doc.set_setting_default', async () => {
    const { calls } = await open();
    fireEvent.click(screen.getByTestId('setting-set-default'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'doc.set_setting_default')).toBe(true);
  });

  it('Unlink appears only for reference settings', async () => {
    await open({ isReference: false });
    expect(screen.queryByTestId('setting-unlink')).not.toBeInTheDocument();
    cleanup();
    const { calls } = await open({ isReference: true });
    fireEvent.click(screen.getByTestId('setting-unlink'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'doc.unlink_setting')).toBe(true);
  });

  it('hides Copy-to and Use-as-default for stylesheet settings', async () => {
    await open({ isStylesheet: true });
    expect(screen.queryByTestId('setting-copy-to')).not.toBeInTheDocument();
    expect(screen.queryByTestId('setting-set-default')).not.toBeInTheDocument();
    // Reset is still available.
    expect(screen.getByTestId('setting-reset')).toBeInTheDocument();
  });
});
