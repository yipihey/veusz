/**
 * Parameter form for a tools / dataset plugin. Mirrors Qt's plugin dialog:
 * builds one input per plugin field (typed by the Field subclass name the
 * daemon reports), then runs the plugin via store.runPlugin and reports any
 * datasets it created. Tools plugins mutate the document; dataset plugins
 * create datasets.
 */

import { useMemo, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';
import type { PluginField, PluginInfo } from '../../rpc/types';

type Store = UseBoundStore<StoreApi<DocState>>;

/** Initial form value for a field, derived from its declared default + kind. */
function initialValue(f: PluginField): unknown {
  if (f.kind === 'FieldBool') return Boolean(f.default);
  if (f.kind.endsWith('Multi')) return Array.isArray(f.default) ? f.default.join(', ') : '';
  if (f.default == null) return '';
  return f.default;
}

/** Coerce a form value back to what the plugin's apply() expects. */
function coerce(f: PluginField, v: unknown): unknown {
  if (f.kind === 'FieldBool') return Boolean(v);
  if (f.kind.endsWith('Multi')) {
    return String(v).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (f.kind === 'FieldInt') {
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? 0 : n;
  }
  if (f.kind === 'FieldFloat') {
    const n = parseFloat(String(v));
    return Number.isNaN(n) ? 0 : n;
  }
  return v;
}

export function PluginDialog({
  store, kind, plugin, onClose, notify,
}: {
  store: Store;
  kind: 'tools' | 'dataset';
  plugin: PluginInfo;
  onClose: () => void;
  notify: (msg: string) => void;
}) {
  const datasetNames = store((s) => s.datasets).map((d) => d.name);
  const selected = store((s) => s.selected);
  const fields = useMemo(
    () => plugin.fields.filter((f) => f.name !== 'currentwidget'),
    [plugin],
  );
  const [vals, setVals] = useState<Record<string, unknown>>(() => {
    const o: Record<string, unknown> = {};
    for (const f of fields) {
      // Widget fields default to the current selection so tools plugins act
      // on the chosen widget rather than always the document root.
      o[f.name] = f.kind === 'FieldWidget' && selected.length
        ? selected[0]
        : initialValue(f);
    }
    return o;
  });
  const [busy, setBusy] = useState(false);

  const set = (name: string, v: unknown) =>
    setVals((prev) => ({ ...prev, [name]: v }));

  const run = async () => {
    setBusy(true);
    const out: Record<string, unknown> = {};
    for (const f of fields) out[f.name] = coerce(f, vals[f.name]);
    const created = await store.getState().runPlugin(kind, plugin.name, out);
    setBusy(false);
    const err = store.getState().error;
    if (err) { notify(err); return; }
    notify(created.length
      ? `${plugin.name}: created ${created.join(', ')}`
      : `Ran ${plugin.name}`);
    onClose();
  };

  return (
    <div data-testid="plugin-form" style={{ fontSize: 13, minWidth: 360 }}>
      <p style={{ marginTop: 0, color: '#666' }}>{plugin.menu.join(' → ')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 10px', alignItems: 'center' }}>
        {fields.map((f) => (
          <FieldRow
            key={f.name}
            field={f}
            value={vals[f.name]}
            datasets={datasetNames}
            onChange={(v) => set(f.name, v)}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button type="button" data-testid="plugin-cancel" onClick={onClose}>Cancel</button>
        <button type="button" data-testid="plugin-run" disabled={busy} onClick={() => void run()}>
          {busy ? 'Running…' : 'Run'}
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  field, value, datasets, onChange,
}: {
  field: PluginField;
  value: unknown;
  datasets: string[];
  onChange: (v: unknown) => void;
}) {
  const id = `plugin-field-${field.name}`;
  const label = (
    <label htmlFor={id} title={field.descr} style={{ color: '#333' }}>{field.descr}</label>
  );

  if (field.kind === 'FieldBool') {
    return (
      <>
        {label}
        <input id={id} data-testid={id} type="checkbox"
          checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)}
          style={{ justifySelf: 'start' }} />
      </>
    );
  }

  if (field.kind === 'FieldCombo' && field.items.length) {
    return (
      <>
        {label}
        <select id={id} data-testid={id} value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}>
          {field.items.map((it) => <option key={it} value={it}>{it}</option>)}
        </select>
      </>
    );
  }

  const isDataset = field.kind.startsWith('FieldDataset');
  const isNumber = field.kind === 'FieldInt' || field.kind === 'FieldFloat';
  const listId = isDataset ? `${id}-list` : undefined;
  return (
    <>
      {label}
      <span>
        <input
          id={id}
          data-testid={id}
          type={isNumber ? 'number' : 'text'}
          step={field.kind === 'FieldFloat' ? 'any' : undefined}
          list={listId}
          value={String(value ?? '')}
          placeholder={field.kind.endsWith('Multi') ? 'comma-separated' : ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        {isDataset && (
          <datalist id={listId}>
            {datasets.map((d) => <option key={d} value={d} />)}
          </datalist>
        )}
      </span>
    </>
  );
}
