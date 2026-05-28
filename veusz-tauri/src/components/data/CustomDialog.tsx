/**
 * Custom definitions editor — constants/functions ("definition"), module
 * imports, and named colors. Loads via doc.get_customs and replaces a whole
 * type's list via doc.set_customs. (Colormaps are out of scope here.)
 */

import { useEffect, useState } from 'react';
import type { DocStore } from '../../keys/shortcuts';

type Ctype = 'definition' | 'import' | 'color';
const TYPES: { id: Ctype; label: string; nameHint: string; valHint: string }[] = [
  { id: 'definition', label: 'Definitions', nameHint: 'pi  or  f(x)', valHint: '3.14159  or  x**2' },
  { id: 'import', label: 'Imports', nameHint: 'numpy', valHint: 'arange, sin' },
  { id: 'color', label: 'Colors', nameHint: 'brand', valHint: '#ff8800' },
];

export function CustomDialog({
  store, notify,
}: { store: DocStore; notify: (m: string) => void }) {
  const rpc = store.getState().rpc;
  const [ctype, setCtype] = useState<Ctype>('definition');
  const [rows, setRows] = useState<[string, string][]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    rpc.doc.getCustoms().then((c) => {
      if (!cancelled) setRows((c[ctype] ?? []).map(([n, v]) => [n, String(v)]));
    }).catch((e: unknown) => notify((e as Error).message));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctype]);

  const update = (i: number, col: 0 | 1, v: string) =>
    setRows((r) => r.map((row, j) => (j === i ? (col === 0 ? [v, row[1]] : [row[0], v]) : row)));

  const save = async () => {
    setBusy(true);
    try {
      const entries = rows.filter(([n]) => n.trim());
      await rpc.doc.setCustoms(ctype, entries as [string, unknown][]);
      notify(`Saved ${entries.length} ${ctype}(s)`);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const hint = TYPES.find((t) => t.id === ctype)!;

  return (
    <div data-testid="custom" style={{ minWidth: 420, fontSize: 13 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {TYPES.map((t) => (
          <button
            key={t.id} type="button" data-testid={`custom-tab-${t.id}`}
            aria-pressed={ctype === t.id}
            onClick={() => setCtype(t.id)}
            style={{ fontWeight: ctype === t.id ? 700 : 400 }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th>Name</th><th>Definition</th><th />
          </tr>
        </thead>
        <tbody data-testid="custom-rows">
          {rows.map((row, i) => (
            <tr key={i}>
              <td><input data-testid={`custom-name-${i}`} value={row[0]} placeholder={hint.nameHint} onChange={(e) => update(i, 0, e.target.value)} style={{ width: '95%' }} /></td>
              <td><input data-testid={`custom-val-${i}`} value={row[1]} placeholder={hint.valHint} onChange={(e) => update(i, 1, e.target.value)} style={{ width: '95%' }} /></td>
              <td><button type="button" data-testid={`custom-del-${i}`} onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <button type="button" data-testid="custom-add" onClick={() => setRows((r) => [...r, ['', '']])}>+ Add</button>
        <button type="button" data-testid="custom-save" disabled={busy} onClick={() => void save()}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
