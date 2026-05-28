/**
 * Minimal tabular data editor — view/edit a 1-D numeric dataset's values via
 * `data.peek` (read) + `data.set` (write). Editing replaces the whole array,
 * so when a dataset is larger than the loaded window it's shown read-only to
 * avoid truncating it (a paged cell-editor is a later refinement).
 */

import { useEffect, useState } from 'react';
import type { DocStore } from '../../keys/shortcuts';

const MAX_LOAD = 100_000;

export function DataEditDialog({
  store, notify, initialName,
}: { store: DocStore; notify: (m: string) => void; initialName?: string }) {
  const s = store();
  const names = s.datasets.map((d) => d.name);
  const [name, setName] = useState(initialName ?? s.selectedDatasets[0] ?? names[0] ?? '');
  const [text, setText] = useState('');
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    setLoading(true);
    s.rpc.data.peek(name, 0, MAX_LOAD)
      .then((r) => {
        if (cancelled) return;
        setText(r.values.join('\n'));
        setTotal(r.total);
        setLoaded(r.values.length);
      })
      .catch((e) => { if (!cancelled) notify((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const truncated = total > loaded;

  const save = async () => {
    const vals = text.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean).map(Number);
    if (vals.some((v) => Number.isNaN(v))) { notify('All values must be numbers.'); return; }
    setBusy(true);
    try {
      await s.rpc.data.set(name, vals);
      await s.refreshDatasets();
      notify(`Saved ${name} (${vals.length} values)`);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="dataedit" style={{ minWidth: 360, fontSize: 13 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span>Dataset</span>
        <select
          data-testid="dataedit-name" value={name}
          onChange={(e) => setName(e.target.value)}
        >
          {names.length === 0 && <option value="">(no datasets)</option>}
          {names.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span style={{ color: '#888', fontSize: 11 }}>
          {loading ? 'loading…' : total ? `${total} values` : ''}
        </span>
      </label>

      {truncated && (
        <p data-testid="dataedit-truncated" style={{ color: '#b45309', fontSize: 11 }}>
          Showing first {loaded} of {total} — too large to edit here (read-only).
        </p>
      )}

      <textarea
        data-testid="dataedit-values"
        value={text}
        readOnly={truncated}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{ width: '100%', height: 240, font: '12px monospace', boxSizing: 'border-box' }}
      />

      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <button
          type="button" data-testid="dataedit-save"
          disabled={busy || truncated || !name}
          onClick={() => void save()}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
