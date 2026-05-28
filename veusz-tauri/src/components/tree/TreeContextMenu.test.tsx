/**
 * TreeContextMenu: right-click opens the menu; items dispatch the
 * matching store actions. Radix renders content in a portal once the
 * trigger receives a contextmenu event.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';
import { createDocStore } from '../../state/doc';
import { TreeContextMenu } from './TreeContextMenu';
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

function makeStore(extra: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const record = (name: string) => (p: Record<string, unknown>) => {
    calls.push([name, p]);
    return {};
  };
  const t = mockTransport({
    'doc.tree': () => TREE,
    'data.list': () => [],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'file.info': () => ({ path: null, changeset: 0, modified: false }),
    'doc.serialize_widgets': (p) => {
      calls.push(['doc.serialize_widgets', p]);
      return { mime_type: 'text/x-vnd.veusz-widget-3', payload_b64: 'X', count: 1 };
    },
    'doc.remove': record('doc.remove'),
    'doc.set': (p) => {
      calls.push(['doc.set', p]);
      const ops = (p as { ops: Array<{ path: string; value: unknown }> }).ops;
      return { changeset: 1, diffs: ops.map((o) => ({ path: o.path, old: false, new: o.value })) };
    },
    'doc.move': record('doc.move'),
    'render.copy_image': () => ({
      format: 'png', mime_type: 'image/png', payload_b64: 'X',
      width: 100, height: 100,
    }),
    ...extra,
  });
  const store = createDocStore(createRpc(t));
  return { store, calls };
}

async function openMenuFor(store: ReturnType<typeof makeStore>['store'], path: string) {
  // Seed the selection so the menu acts on `path`.
  await store.getState().select([path]);
  render(
    <TreeContextMenu
      store={store}
      targetPath={path}
      onStartRename={() => {}}
      renderWidth={400}
      renderHeight={300}
    >
      <div data-testid="ctx-trigger">tree</div>
    </TreeContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId('ctx-trigger'));
}

describe('TreeContextMenu', () => {
  beforeEach(() => cleanup());

  it('opens on right-click and shows the core items', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await openMenuFor(store, '/page1/graph1/xy1');
    expect(await screen.findByTestId('tree-context-menu')).toBeInTheDocument();
    expect(screen.getByTestId('ctx-cut')).toBeInTheDocument();
    expect(screen.getByTestId('ctx-copy')).toBeInTheDocument();
    expect(screen.getByTestId('ctx-delete')).toBeInTheDocument();
    expect(screen.getByTestId('ctx-hide')).toBeInTheDocument();
  });

  it('Copy dispatches doc.serialize_widgets for the selection', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    await openMenuFor(store, '/page1/graph1/xy1');
    fireEvent.click(await screen.findByTestId('ctx-copy'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'doc.serialize_widgets')).toBe(true);
  });

  it('Hide writes hide=true via doc.set', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    await openMenuFor(store, '/page1/graph1/xy1');
    fireEvent.click(await screen.findByTestId('ctx-hide'));
    await new Promise((r) => setTimeout(r, 5));
    const setCall = calls.find((c) => c[0] === 'doc.set');
    expect(setCall).toBeDefined();
    const ops = (setCall![1] as { ops: Array<{ path: string; value: unknown }> }).ops;
    expect(ops).toEqual([{ path: '/page1/graph1/xy1/hide', value: true }]);
  });

  it('Delete removes the widget', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    await openMenuFor(store, '/page1/graph1/xy1');
    fireEvent.click(await screen.findByTestId('ctx-delete'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'doc.remove')).toBe(true);
  });

  it('Rename invokes onStartRename with the target', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    void store.getState().select(['/page1/graph1/xy1']);
    const onStartRename = vi.fn();
    render(
      <TreeContextMenu
        store={store}
        targetPath="/page1/graph1/xy1"
        onStartRename={onStartRename}
        renderWidth={400}
        renderHeight={300}
      >
        <div data-testid="ctx-trigger">tree</div>
      </TreeContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('ctx-trigger'));
    fireEvent.click(await screen.findByTestId('ctx-rename'));
    expect(onStartRename).toHaveBeenCalledWith('/page1/graph1/xy1');
  });

  it('disables destructive items when the root is in the selection', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await openMenuFor(store, '/');
    const cut = await screen.findByTestId('ctx-cut');
    expect(cut.getAttribute('aria-disabled')).toBe('true');
  });
});
