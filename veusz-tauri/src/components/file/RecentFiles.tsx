import { useEffect, useState } from 'react';
import type { Rpc } from '../../rpc/client';

/**
 * Recent files menu / submenu content. Pure component — fetches the
 * list on mount and on each `onChange` notification the host pumps
 * in. Wires the daemon's `file.recent_list/remove/clear` directly so
 * stale entries (deleted files) can be pruned by the user.
 */

export interface RecentFilesProps {
  rpc: Rpc;
  onPick: (path: string) => void;
}

interface Entry {
  path: string;
  exists: boolean;
}

export function RecentFiles({ rpc, onPick }: RecentFilesProps) {
  const [items, setItems] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const r = await rpc.file.recentList();
      setItems(r.paths);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => { void refresh(); }, [rpc]);

  if (error) {
    return <p data-testid="recent-error" role="alert" style={{ color: 'crimson' }}>{error}</p>;
  }

  if (items.length === 0) {
    return <p data-testid="recent-empty" style={{ color: '#888', fontSize: 13 }}>
      No recent files.
    </p>;
  }

  return (
    <div data-testid="recent-files">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((e) => (
          <li key={e.path} data-testid={`recent-row-${e.path}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              data-testid={`recent-open-${e.path}`}
              disabled={!e.exists}
              onClick={() => onPick(e.path)}
              title={e.exists ? e.path : `Missing: ${e.path}`}
              style={{
                flex: 1, textAlign: 'left',
                color: e.exists ? 'inherit' : '#888',
              }}
            >
              {basename(e.path)}
              {!e.exists && ' (missing)'}
            </button>
            <button
              type="button"
              data-testid={`recent-remove-${e.path}`}
              title="Remove from recent list"
              onClick={async () => {
                await rpc.file.recentRemove(e.path);
                void refresh();
              }}
            >×</button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="recent-clear-all"
        style={{ marginTop: 8 }}
        onClick={async () => {
          await rpc.file.recentClear();
          void refresh();
        }}
      >
        Clear all
      </button>
    </div>
  );
}

function basename(p: string): string {
  const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return i >= 0 ? p.slice(i + 1) : p;
}
