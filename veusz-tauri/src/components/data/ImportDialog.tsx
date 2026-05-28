/**
 * Generic data-import dialog covering the non-CSV formats (FITS, HDF5, 2D,
 * ND, plain text) over the daemon's data.import RPC. CSV keeps its dedicated
 * preview flow (Ctrl+I). Each format declares its key fields; common
 * prefix/suffix/linked options apply to all. File-tree browsing for HDF5/FITS
 * (selecting HDUs/datasets visually) is a follow-on — items are entered by
 * path here, matching the importer's documented `items` syntax.
 */

import { useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';

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
  fits: [
    { name: 'items', label: 'Items', type: 'list', required: true, placeholder: '/  or  /hduname/column' },
  ],
  hdf5: [
    { name: 'items', label: 'Items', type: 'list', required: true, placeholder: '/group/dataset' },
  ],
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

  const fields = [...(KIND_FIELDS[kind] ?? []), ...COMMON];
  const set = (name: string, v: unknown) => setVals((p) => ({ ...p, [name]: v }));

  const missing = !filename.trim()
    || (KIND_FIELDS[kind] ?? []).some((f) => f.required && !String(vals[f.name] ?? '').trim());

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
    if (p) setFilename(p);
  };

  return (
    <div data-testid="import-form" style={{ fontSize: 13, minWidth: 380 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 10px', alignItems: 'center' }}>
        <label htmlFor="import-kind">Format</label>
        <select id="import-kind" data-testid="import-kind" value={kind}
          onChange={(e) => { setKind(e.target.value); setVals({}); }}>
          {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>

        <label htmlFor="import-filename">File</label>
        <span style={{ display: 'flex', gap: 6 }}>
          <input id="import-filename" data-testid="import-filename" value={filename}
            placeholder="path to data file"
            onChange={(e) => setFilename(e.target.value)}
            style={{ flex: 1, boxSizing: 'border-box' }} />
          {onPickFile && (
            <button type="button" data-testid="import-browse" onClick={() => void browse()}>Browse…</button>
          )}
        </span>

        {fields.map((f) => (
          <FieldRow key={f.name} field={f} value={vals[f.name]} onChange={(v) => set(f.name, v)} />
        ))}
      </div>

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
