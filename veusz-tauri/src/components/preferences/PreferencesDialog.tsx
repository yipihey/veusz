/**
 * Preferences dialog — fully schema-driven from `prefs.list` (key, value,
 * default, type, and optional min/max/choices). Each pref renders a control
 * by type and writes through `prefs.set` on change. Grouped by the key prefix
 * (render / export / plot / ui / csv …), mirroring the Qt preferences tabs.
 */

import { useEffect, useState } from 'react';
import type { Rpc } from '../../rpc/client';

interface PrefItem {
  key: string;
  value: unknown;
  default: unknown;
  type: 'integer' | 'number' | 'boolean' | 'string';
  min?: number;
  max?: number;
  choices?: string[];
}

export function PreferencesDialog({ rpc }: { rpc: Rpc }) {
  const [prefs, setPrefs] = useState<PrefItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    rpc.prefs.list()
      .then((p) => { if (!cancelled) setPrefs(p as PrefItem[]); })
      .catch((e) => { if (!cancelled) setError((e as Error).message); });
    return () => { cancelled = true; };
  }, [rpc]);

  const update = async (key: string, value: unknown) => {
    setPrefs((p) => p?.map((x) => (x.key === key ? { ...x, value } : x)) ?? null);
    try {
      await rpc.prefs.set(key, value);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (error) return <p data-testid="prefs-error" style={{ color: 'crimson' }}>{error}</p>;
  if (!prefs) return <p data-testid="prefs-loading">Loading…</p>;

  const groups = new Map<string, PrefItem[]>();
  for (const p of prefs) {
    const g = p.key.split('.')[0];
    (groups.get(g) ?? groups.set(g, []).get(g)!).push(p);
  }

  return (
    <div data-testid="prefs" style={{ minWidth: 420 }}>
      {[...groups.entries()].map(([group, items]) => (
        <fieldset key={group} style={fs}>
          <legend style={{ textTransform: 'capitalize', color: '#555' }}>{group}</legend>
          {items.map((p) => (
            <label key={p.key} style={rowStyle} title={p.key}>
              <span style={{ flex: 1 }}>{prettify(p.key)}</span>
              <Control item={p} onChange={(v) => void update(p.key, v)} />
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

function Control({ item, onChange }: { item: PrefItem; onChange: (v: unknown) => void }) {
  const tid = `pref-${item.key}`;
  if (item.type === 'boolean') {
    return (
      <input
        type="checkbox" data-testid={tid}
        checked={!!item.value}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }
  if (item.type === 'string' && item.choices) {
    return (
      <select
        data-testid={tid} value={String(item.value)}
        onChange={(e) => onChange(e.target.value)}
      >
        {item.choices.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    );
  }
  if (item.type === 'integer' || item.type === 'number') {
    return (
      <input
        type="number" data-testid={tid}
        value={Number(item.value)}
        min={item.min} max={item.max}
        step={item.type === 'integer' ? 1 : 'any'}
        onChange={(e) => {
          const n = item.type === 'integer' ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        style={{ width: 90 }}
      />
    );
  }
  return (
    <input
      type="text" data-testid={tid}
      value={String(item.value ?? '')}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function prettify(key: string): string {
  const tail = key.split('.').slice(1).join('.') || key;
  return tail.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const fs: React.CSSProperties = {
  border: '1px solid #e2e2e2', borderRadius: 4, margin: '0 0 10px', padding: '4px 10px 8px',
};
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0', fontSize: 13,
};
