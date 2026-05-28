/**
 * Generic data-import dialog covering the non-CSV formats (FITS, HDF5, 2D,
 * ND, plain text) over the daemon's data.import RPC. CSV keeps its dedicated
 * preview flow (Ctrl+I).
 *
 * For HDF5/FITS the dialog introspects the file (data.inspect_file) and lets
 * the user tick the datasets / HDUs / columns to import; the ticked paths are
 * passed straight through as the importer's `items` option. If the daemon
 * lacks h5py/astropy it degrades to a manual, comma-separated items field.
 * The simpler formats declare their key fields inline.
 */

import { useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';
import type { ImportItem } from '../../rpc/types';

type Store = UseBoundStore<StoreApi<DocState>>;

type FieldType = 'text' | 'bool' | 'list' | 'ints';
interface IField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
}

const KINDS: { id: string; label: string }[] = [
  { id: 'plaintext', label: 'Plain text' },
  { id: '2d', label: '2D grid' },
  { id: 'nd', label: 'N-dimensional' },
  { id: 'fits', label: 'FITS' },
  { id: 'hdf5', label: 'HDF5' },
];

/** Formats whose contents are browsed via data.inspect_file. */
const BROWSABLE = new Set(['fits', 'hdf5']);

const KIND_FIELDS: Record<string, IField[]> = {
  plaintext: [
    { name: 'descriptor', label: 'Descriptor', type: 'text', required: true, placeholder: 'e.g. x y +-' },
    { name: 'useblocks', label: 'Read blocks separately', type: 'bool' },
  ],
  '2d': [
    { name: 'datasetnames', label: 'Dataset names', type: 'list', required: true, placeholder: 'comma-separated' },
    { name: 'transpose', label: 'Transpose', type: 'bool' },
  ],
  nd: [
    { name: 'dataset', label: 'Dataset name', type: 'text', required: true },
    { name: 'shape', label: 'Shape', type: 'ints', placeholder: 'e.g. 3,4 (optional)' },
  ],
  // HDF5/FITS items come from the inspect checklist; this is the fallback
  // manual entry shown when introspection is unavailable.
  fits: [],
  hdf5: [],
};

const COMMON: IField[] = [
  { name: 'prefix', label: 'Name prefix', type: 'text' },
  { name: 'suffix', label: 'Name suffix', type: 'text' },
  { name: 'linked', label: 'Link to file', type: 'bool' },
];

export function ImportDialog({
  store, onClose, notify, onPickFile,
}: {
  store: Store;
  onClose: () => void;
  notify: (msg: string) => void;
  onPickFile?: () => Promise<string | null>;
}) {
  const [kind, setKind] = useState('plaintext');
  const [filename, setFilename] = useState('');
  const [vals, setVals] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  // HDF5/FITS introspection state.
  const [items, setItems] = useState<ImportItem[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [inspecting, setInspecting] = useState(false);
  // null = introspection succeeded (or not yet run); string = degraded reason.
  const [manualReason, setManualReason] = useState<string | null>(null);

  const browsable = BROWSABLE.has(kind);
  const fields = [...(KIND_FIELDS[kind] ?? []), ...COMMON];
  const set = (name: string, v: unknown) => setVals((p) => ({ ...p, [name]: v }));

  const resetBrowse = () => { setItems(null); setPicked(new Set()); setManualReason(null); };

  const itemsOption = (): string[] => {
    if (browsable && items) return [...picked];
    const manual = String(vals.items ?? '').trim();
    return manual ? manual.split(',').map((s) => s.trim()).filter(Boolean) : [];
  };

  const missing = (() => {
    if (!filename.trim()) return true;
    if (browsable) return itemsOption().length === 0;
    return (KIND_FIELDS[kind] ?? []).some(
      (f) => f.required && !String(vals[f.name] ?? '').trim());
  })();

  const inspect = async () => {
    if (!filename.trim()) return;
    setInspecting(true);
    try {
      const r = await store.getState().rpc.data.inspectFile(kind, filename.trim());
      if (r.available) { setItems(r.items); setManualReason(null); setPicked(new Set(r.items.map((i) => i.path))); }
      else { setItems(null); setManualReason(r.reason ?? 'introspection unavailable'); }
    } catch (e) {
      setItems(null);
      setManualReason((e as Error).message);
    } finally {
      setInspecting(false);
    }
  };

  const toggle = (path: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });

  const buildOptions = (): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = vals[f.name];
      if (f.type === 'bool') { if (raw) out[f.name] = true; continue; }
      const s = String(raw ?? '').trim();
      if (!s) continue;
      if (f.type === 'list') out[f.name] = s.split(',').map((x) => x.trim()).filter(Boolean);
      else if (f.type === 'ints') out[f.name] = s.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => !Number.isNaN(n));
      else out[f.name] = s;
    }
    if (browsable) out.items = itemsOption();
    return out;
  };

  const run = async () => {
    setBusy(true);
    const imported = await store.getState().importData(kind, filename.trim(), buildOptions());
    setBusy(false);
    const err = store.getState().error;
    if (err) { notify(err); return; }
    notify(imported.length ? `Imported ${imported.join(', ')}` : 'No datasets imported');
    onClose();
  };

  const browse = async () => {
    if (!onPickFile) return;
    const p = await onPickFile();
    if (p) { setFilename(p); resetBrowse(); }
  };

  return (
    <div data-testid="import-form" style={{ fontSize: 13, minWidth: 380 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 10px', alignItems: 'center' }}>
        <label htmlFor="import-kind">Format</label>
        <select id="import-kind" data-testid="import-kind" value={kind}
          onChange={(e) => { setKind(e.target.value); setVals({}); resetBrowse(); }}>
          {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>

        <label htmlFor="import-filename">File</label>
        <span style={{ display: 'flex', gap: 6 }}>
          <input id="import-filename" data-testid="import-filename" value={filename}
            placeholder="path to data file"
            onChange={(e) => { setFilename(e.target.value); resetBrowse(); }}
            style={{ flex: 1, boxSizing: 'border-box' }} />
          {onPickFile && (
            <button type="button" data-testid="import-browse" onClick={() => void browse()}>Browse…</button>
          )}
        </span>

        {fields.map((f) => (
          <FieldRow key={f.name} field={f} value={vals[f.name]} onChange={(v) => set(f.name, v)} />
        ))}
      </div>

      {browsable && (
        <div style={{ marginTop: 12 }}>
          <button type="button" data-testid="import-inspect"
            disabled={!filename.trim() || inspecting} onClick={() => void inspect()}>
            {inspecting ? 'Inspecting…' : 'Inspect file'}
          </button>

          {items && (
            <ul data-testid="import-items" style={{
              listStyle: 'none', margin: '8px 0 0', padding: 8, maxHeight: 200,
              overflow: 'auto', border: '1px solid #ddd', borderRadius: 4,
            }}>
              {items.length === 0 && <li style={{ color: '#888' }}>No importable items found.</li>}
              {items.map((it) => (
                <li key={it.path}>
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="checkbox" data-testid={`import-item-${it.path}`}
                      checked={picked.has(it.path)} onChange={() => toggle(it.path)} />
                    <code style={{ fontSize: 12 }}>{it.path}</code>
                    <span style={{ color: '#999', fontSize: 11 }}>
                      {it.kind}{it.shape.length ? ` [${it.shape.join('×')}]` : ''}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {manualReason && (
            <div data-testid="import-manual" style={{ marginTop: 8 }}>
              <div style={{ color: '#b45309', fontSize: 12, marginBottom: 4 }}>
                File browsing unavailable ({manualReason}). Enter items manually:
              </div>
              <input data-testid="import-items-manual" value={String(vals.items ?? '')}
                placeholder={kind === 'fits' ? '/hduname/column' : '/group/dataset'}
                onChange={(e) => set('items', e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button type="button" data-testid="import-cancel" onClick={onClose}>Cancel</button>
        <button type="button" data-testid="import-run" disabled={busy || missing} onClick={() => void run()}>
          {busy ? 'Importing…' : 'Import'}
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  field, value, onChange,
}: { field: IField; value: unknown; onChange: (v: unknown) => void }) {
  const id = `import-field-${field.name}`;
  const label = <label htmlFor={id}>{field.label}</label>;
  if (field.type === 'bool') {
    return (
      <>
        {label}
        <input id={id} data-testid={id} type="checkbox" checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)} style={{ justifySelf: 'start' }} />
      </>
    );
  }
  return (
    <>
      {label}
      <input id={id} data-testid={id} value={String(value ?? '')}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box' }} />
    </>
  );
}
