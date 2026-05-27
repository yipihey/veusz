import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecentFiles } from './RecentFiles';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';

function rpcWith(handlers: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  return createRpc(mockTransport({
    'file.recent_list': () => ({ paths: [] }),
    'file.recent_clear': () => ({ ok: true }),
    'file.recent_remove': () => ({ ok: true }),
    ...handlers,
  }));
}

describe('RecentFiles', () => {
  it('shows empty state when there are no recent files', async () => {
    render(<RecentFiles rpc={rpcWith()} onPick={() => {}} />);
    await waitFor(() => screen.getByTestId('recent-empty'));
  });

  it('lists recent paths with basenames', async () => {
    const rpc = rpcWith({
      'file.recent_list': () => ({
        paths: [
          { path: '/tmp/a.vsz', exists: true },
          { path: '/home/u/b.vsz', exists: true },
        ],
      }),
    });
    render(<RecentFiles rpc={rpc} onPick={() => {}} />);
    await waitFor(() => screen.getByTestId('recent-files'));
    expect(screen.getByTestId('recent-open-/tmp/a.vsz')).toHaveTextContent('a.vsz');
    expect(screen.getByTestId('recent-open-/home/u/b.vsz')).toHaveTextContent('b.vsz');
  });

  it('clicking an entry calls onPick with the full path', async () => {
    const onPick = vi.fn();
    const rpc = rpcWith({
      'file.recent_list': () => ({
        paths: [{ path: '/tmp/x.vsz', exists: true }],
      }),
    });
    render(<RecentFiles rpc={rpc} onPick={onPick} />);
    await waitFor(() => screen.getByTestId('recent-open-/tmp/x.vsz'));
    fireEvent.click(screen.getByTestId('recent-open-/tmp/x.vsz'));
    expect(onPick).toHaveBeenCalledWith('/tmp/x.vsz');
  });

  it('missing entries are visually marked and not clickable', async () => {
    const onPick = vi.fn();
    const rpc = rpcWith({
      'file.recent_list': () => ({
        paths: [{ path: '/tmp/gone.vsz', exists: false }],
      }),
    });
    render(<RecentFiles rpc={rpc} onPick={onPick} />);
    await waitFor(() => screen.getByTestId('recent-open-/tmp/gone.vsz'));
    const btn = screen.getByTestId('recent-open-/tmp/gone.vsz');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('(missing)');
    fireEvent.click(btn);
    expect(onPick).not.toHaveBeenCalled();
  });

  it('Remove (×) button removes the entry then refreshes', async () => {
    const removed: string[] = [];
    let list = [{ path: '/tmp/a.vsz', exists: true }, { path: '/tmp/b.vsz', exists: true }];
    const rpc = rpcWith({
      'file.recent_list': () => ({ paths: list }),
      'file.recent_remove': (p) => {
        const path = (p as { path: string }).path;
        removed.push(path);
        list = list.filter((e) => e.path !== path);
        return { ok: true };
      },
    });
    render(<RecentFiles rpc={rpc} onPick={() => {}} />);
    await waitFor(() => screen.getByTestId('recent-open-/tmp/a.vsz'));
    fireEvent.click(screen.getByTestId('recent-remove-/tmp/a.vsz'));
    await waitFor(() =>
      expect(screen.queryByTestId('recent-open-/tmp/a.vsz')).not.toBeInTheDocument(),
    );
    expect(removed).toEqual(['/tmp/a.vsz']);
  });

  it('Clear all wipes the list', async () => {
    const cleared: number[] = [];
    let list = [{ path: '/tmp/a.vsz', exists: true }];
    const rpc = rpcWith({
      'file.recent_list': () => ({ paths: list }),
      'file.recent_clear': () => { cleared.push(1); list = []; return { ok: true }; },
    });
    render(<RecentFiles rpc={rpc} onPick={() => {}} />);
    await waitFor(() => screen.getByTestId('recent-clear-all'));
    fireEvent.click(screen.getByTestId('recent-clear-all'));
    await waitFor(() => screen.getByTestId('recent-empty'));
    expect(cleared).toEqual([1]);
  });
});
