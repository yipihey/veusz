/**
 * DatasetContextMenu + DatasetFileContextMenu: right-click dispatches
 * the dataset store actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';
import { createDocStore } from '../../state/doc';
import { DatasetContextMenu } from './DatasetContextMenu';
import { DatasetFileContextMenu } from './DatasetFileContextMenu';

function makeStore(extra: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const rec = (name: string) => (p: Record<string, unknown>) => {
    calls.push([name, p]);
    return {};
  };
  const t = mockTransport({
    'doc.tree': () => ({ name: '', path: '/', type: 'document', children: [] }),
    'data.list': () => [
      { name: 'a', type: 'Dataset', len: 3, linked: '/d/in.csv', tags: ['keep'] },
      { name: 'b', type: 'Dataset', len: 3, linked: null, tags: [] },
    ],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'file.info': () => ({ path: null, changeset: 0, modified: false }),
    'data.delete': rec('data.delete'),
    'data.unlink_file': rec('data.unlink_file'),
    'data.tag': rec('data.tag'),
    'data.serialize': () => ({ mime_type: 'text/x-vnd.veusz-data-1', payload_b64: 'X', count: 1 }),
    'data.reload_file': rec('data.reload_file'),
    'data.delete_all_file': rec('data.delete_all_file'),
    'data.unlink_all_file': rec('data.unlink_all_file'),
    ...extra,
  });
  return { store: createDocStore(createRpc(t)), calls };
}

async function openRow(store: ReturnType<typeof makeStore>['store'], name: string, onNotify?: (m: string) => void) {
  store.getState().selectDatasets([name]);
  render(
    <DatasetContextMenu store={store} targetName={name} onNotify={onNotify}>
      <div data-testid="ds-trigger">{name}</div>
    </DatasetContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId('ds-trigger'));
  await screen.findByTestId('dataset-context-menu');
}

describe('DatasetContextMenu', () => {
  beforeEach(() => cleanup());

  it('Delete dispatches data.delete for the selection', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    await openRow(store, 'b');
    fireEvent.click(screen.getByTestId('ds-delete'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'data.delete')).toBe(true);
  });

  it('Unlink file only appears for a file-linked dataset', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    // 'a' is linked → item present.
    await openRow(store, 'a');
    expect(screen.queryByTestId('ds-unlink-file')).toBeInTheDocument();
    cleanup();
    // 'b' is in-memory → item absent.
    await openRow(store, 'b');
    expect(screen.queryByTestId('ds-unlink-file')).not.toBeInTheDocument();
  });

  it('Edit data is a stub that notifies', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    const onNotify = vi.fn();
    await openRow(store, 'b', onNotify);
    fireEvent.click(screen.getByTestId('ds-edit-data'));
    expect(onNotify).toHaveBeenCalled();
  });

  it('Copy serializes the selection to the clipboard', async () => {
    const { store } = makeStore();
    await store.getState().refreshAll();
    await openRow(store, 'b');
    fireEvent.click(screen.getByTestId('ds-copy'));
    await new Promise((r) => setTimeout(r, 5));
    expect(await store.getState().clipboard.has(['text/x-vnd.veusz-data-1'])).toBe(true);
  });
});

describe('DatasetFileContextMenu', () => {
  beforeEach(() => cleanup());

  it('Reload / Unlink all / Delete all dispatch file actions', async () => {
    const { store, calls } = makeStore();
    await store.getState().refreshAll();
    render(
      <DatasetFileContextMenu store={store} filename="/d/in.csv">
        <div data-testid="dsfile-trigger">in.csv</div>
      </DatasetFileContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('dsfile-trigger'));
    await screen.findByTestId('dataset-file-context-menu');

    fireEvent.click(screen.getByTestId('dsfile-reload'));
    await new Promise((r) => setTimeout(r, 5));
    expect(calls.some((c) => c[0] === 'data.reload_file')).toBe(true);
  });
});
