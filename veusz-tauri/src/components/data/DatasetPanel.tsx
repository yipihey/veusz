import type { DataInfo } from '../../rpc/types';

/**
 * Dataset panel for the right sidebar. Listings come from `data.list`
 * and refresh on `doc.changed` events. Clicking a row asks the parent
 * to fetch a peek + stats; the parent passes those back as `details`.
 */
export interface DatasetPanelProps {
  datasets: DataInfo[];
  selected?: string;
  onSelect: (name: string) => void;
  onImport?: () => void;
  details?: {
    name: string;
    stats?: { min: number; max: number; mean: number; std: number; len: number };
    preview?: number[];
  };
}

export function DatasetPanel({
  datasets,
  selected,
  onSelect,
  onImport,
  details,
}: DatasetPanelProps) {
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
        <ul role="list">
          {datasets.map((d) => (
            <li key={d.name}>
              <button
                type="button"
                data-testid={`dataset-row-${d.name}`}
                data-selected={d.name === selected || undefined}
                onClick={() => onSelect(d.name)}
              >
                <strong>{d.name}</strong>{' '}
                <small>
                  {d.type} · {d.len ?? '?'} pts
                  {d.shape ? ` · shape ${d.shape.join('×')}` : ''}
                </small>
              </button>
            </li>
          ))}
        </ul>
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

function fmt(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1e6 || (n !== 0 && Math.abs(n) < 1e-3)) {
    return n.toExponential(3);
  }
  return n.toPrecision(4);
}
