import { useMemo, useRef, useState } from 'react';
import type { ColormapInfo } from '../../rpc/types';
import type { LeafProps } from './types';

/**
 * `colormap` — a chooser with a swatch-preview trigger that opens a panel with
 * a streaming search box and a scrollable, swatch-previewed list. The colormap
 * list (`colormaps`) is supplied by the host (the store loads `doc.colormaps`
 * once). With no list it degrades to a plain text input, so the figure still
 * works offline / before the list arrives.
 */
export function colormapGradient(colors: Array<[number, number, number]>, step: boolean): string {
  const rgb = (c: [number, number, number]) => `rgb(${c[0]},${c[1]},${c[2]})`;
  if (!colors || !colors.length) return '#e1e4e8';
  if (step) {
    const n = colors.length;
    return (
      'linear-gradient(to right,' +
      colors
        .map((c, i) => `${rgb(c)} ${((i / n) * 100).toFixed(2)}% ${(((i + 1) / n) * 100).toFixed(2)}%`)
        .join(',') +
      ')'
    );
  }
  return 'linear-gradient(to right,' + colors.map(rgb).join(',') + ')';
}

export function ColormapPicker({
  schema,
  value,
  onChange,
  colormaps = [],
}: LeafProps & { colormaps?: ColormapInfo[] }) {
  const cur = value == null ? '' : String(value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const byName = useMemo(() => {
    const m = new Map<string, ColormapInfo>();
    for (const c of colormaps) m.set(c.name, c);
    return m;
  }, [colormaps]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? colormaps.filter((c) => c.name.toLowerCase().includes(q)) : colormaps;
  }, [colormaps, query]);

  // No list available — fall back to a free-text input (still editable).
  if (!colormaps.length) {
    return (
      <input
        type="text"
        value={cur}
        data-testid={`setting-${schema.name}`}
        aria-label={schema.usertext || schema.name}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  const current = byName.get(cur) ?? null;
  const choose = (name: string) => {
    setOpen(false);
    setQuery('');
    onChange(name);
  };

  return (
    <span data-testid={`setting-${schema.name}`} style={{ position: 'relative', display: 'inline-block', minWidth: 180 }}>
      <button
        type="button"
        data-testid={`setting-${schema.name}-trigger`}
        aria-label={schema.usertext || schema.name}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) setTimeout(() => searchRef.current?.focus(), 0);
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', cursor: 'pointer',
          border: '1px solid #d0d7de', borderRadius: 6, padding: '2px 6px', background: '#fff',
        }}
      >
        <span style={{
          flex: 1, height: 16, borderRadius: 3, border: '1px solid #00000022', minWidth: 40,
          background: current ? colormapGradient(current.colors, current.step) : '#e1e4e8',
        }} />
        <span style={{ font: '12px sans-serif', color: '#1f2328', whiteSpace: 'nowrap' }}>{cur || '(none)'}</span>
        <span style={{ color: '#6e7781', fontSize: 10 }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div
          data-testid={`setting-${schema.name}-panel`}
          style={{
            position: 'absolute', zIndex: 30, left: 0, right: 0, marginTop: 4,
            border: '1px solid #d0d7de', borderRadius: 6, background: '#fff',
            boxShadow: '0 6px 18px #00000022', overflow: 'hidden',
          }}
        >
          <input
            ref={searchRef}
            type="text"
            placeholder="search colormaps…"
            value={query}
            data-testid={`setting-${schema.name}-search`}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box', border: 0,
              borderBottom: '1px solid #eaeef2', padding: '5px 8px', font: '12px sans-serif', outline: 'none',
            }}
          />
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            {matches.length === 0 && (
              <div style={{ padding: 8, color: '#8b949e', font: '12px sans-serif' }}>no match</div>
            )}
            {matches.map((c) => (
              <div
                key={c.name}
                data-testid={`cmap-opt-${c.name}`}
                onClick={() => choose(c.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px', cursor: 'pointer',
                  background: c.name === cur ? '#ddf4ff' : undefined,
                }}
              >
                <span style={{
                  flex: 1, height: 14, borderRadius: 3, border: '1px solid #00000022', minWidth: 60,
                  background: colormapGradient(c.colors, c.step),
                }} />
                <span style={{ font: '12px sans-serif', color: '#1f2328', whiteSpace: 'nowrap' }}>
                  {c.name}{c.step ? ' ⋯' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}
