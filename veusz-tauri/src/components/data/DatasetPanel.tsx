import type { ReactNode } from 'react';
import type { DataInfo } from '../../rpc/types';
import type { SelectMode } from '../tree/Tree';

/**
 * Dataset panel for the right sidebar. Listings come from `data.list`
 * and refresh on `data.changed` events. Rows support multi-select
 * (Ctrl/Shift-click) and a right-click context menu; datasets linked
 * to a file are grouped under a header with its own file-level menu.
 *
 * Presentational: the context menus are injected via render props so
 * unit/e2e tests can render the panel without a store.
 */
export interface DatasetPanelProps {
  datasets: DataInfo[];
  /** Selected dataset names (multi-select). */
  selected?: string[];
  onSelect: (name: string, mode?: SelectMode) => void;
  onImport?: () => void;
  details?: {
    name: string;
    stats?: { min: number; max: number; mean: number; std: number; len: number };
    preview?: number[];
  };
  /** Wrap a dataset row with its right-click menu. */
  renderRowMenu?: (name: string, row: ReactNode) => ReactNode;
  /** Wrap a file-group header with its right-click menu. */
  renderFileMenu?: (filename: string, header: ReactNode) => ReactNode;
}

function modeFromEvent(e: React.MouseEvent): SelectMode {
  if (e.shiftKey) return 'range';
  if (e.ctrlKey || e.metaKey) return 'toggle';
  return 'replace';
}

export function DatasetPanel({
  datasets,
  selected = [],
  onSelect,
  onImport,
  details,
  renderRowMenu,
  renderFileMenu,
}: DatasetPanelProps) {
  const selectedSet = new Set(selected);

  // Partition into in-memory (linked falsy) and per-file groups.
  const inMemory = datasets.filter((d) => !d.linked);
  const fileGroups = new Map<string, DataInfo[]>();
  for (const d of datasets) {
    if (d.linked) {
      const arr = fileGroups.get(d.linked) ?? [];
      arr.push(d);
      fileGroups.set(d.linked, arr);
    }
  }

  const row = (d: DataInfo): ReactNode => {
    const node = (
      <li key={d.name}>
        <button
          type="button"
          data-testid={`dataset-row-${d.name}`}
          data-selected={selectedSet.has(d.name) || undefined}
          onClick={(e) => onSelect(d.name, modeFromEvent(e))}
        >
          <strong>{d.name}</strong>{' '}
          <small>
            {d.type} · {d.len ?? '?'} pts
            {d.shape ? ` · shape ${d.shape.join('×')}` : ''}
            {d.tags && d.tags.length ? ` · #${d.tags.join(' #')}` : ''}
          </small>
        </button>
      </li>
    );
    return renderRowMenu ? (
      <Fragmentish key={d.name}>{renderRowMenu(d.name, node)}</Fragmentish>
    ) : node;
  };

  return (
    <div data-testid="dataset-panel">
      <header>
        <h3>Datasets ({datasets.length})</h3>
        {onImport && (
          <button type="button" data-testid="dataset-import" onClick={onImport}>
            Import…
          </button>
        )}
      </header>
      {datasets.length === 0 ? (
        <p data-testid="dataset-empty">No datasets yet.</p>
      ) : (
        <>
          {inMemory.length > 0 && <ul role="list">{inMemory.map(row)}</ul>}
          {[...fileGroups.entries()].map(([filename, members]) => {
            const header = (
              <div data-testid={`dataset-file-${filename}`} style={{ fontWeight: 600, marginTop: 6 }}>
                📄 {basename(filename)}
              </div>
            );
            return (
              <section key={filename} data-testid={`dataset-filegroup-${filename}`}>
                {renderFileMenu ? renderFileMenu(filename, header) : header}
                <ul role="list">{members.map(row)}</ul>
              </section>
            );
          })}
        </>
      )}
      {details && details.stats && (
        <aside data-testid={`dataset-details-${details.name}`}>
          <h4>{details.name}</h4>
          <dl>
            <dt>min</dt><dd data-testid="dataset-min">{fmt(details.stats.min)}</dd>
            <dt>max</dt><dd data-testid="dataset-max">{fmt(details.stats.max)}</dd>
            <dt>mean</dt><dd data-testid="dataset-mean">{fmt(details.stats.mean)}</dd>
            <dt>std</dt><dd data-testid="dataset-std">{fmt(details.stats.std)}</dd>
            <dt>len</dt><dd data-testid="dataset-len">{details.stats.len}</dd>
          </dl>
          {details.preview && details.preview.length > 0 && (
            <pre data-testid="dataset-preview">
              {details.preview.slice(0, 20).map(fmt).join(', ')}
              {details.preview.length > 20 ? ' …' : ''}
            </pre>
          )}
        </aside>
      )}
    </div>
  );
}

/** Tiny passthrough so a render-prop result can carry a stable key. */
function Fragmentish({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function basename(path: string): string {
  const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return i >= 0 ? path.slice(i + 1) : path;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1e6 || (n !== 0 && Math.abs(n) < 1e-3)) {
    return n.toExponential(3);
  }
  return n.toPrecision(4);
}
