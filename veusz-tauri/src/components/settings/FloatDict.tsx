import { useState, useEffect } from 'react';
import type { LeafProps } from './types';

/**
 * `float-dict` — `key=value` lines, one per pair. Veusz stores it as
 * `dict[str, float]` server-side and accepts either a dict literal or
 * a Python expression. We use a textarea for simplicity; structured
 * row editing is Phase-2 polish.
 */
export function FloatDict({ schema, value, onChange }: LeafProps) {
  const initial = formatInitial(value);
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial]);

  const commit = (raw: string) => {
    if (raw.startsWith('=')) {
      onChange(raw);
      return;
    }
    const lines = raw.split('\n').map((s) => s.trim()).filter(Boolean);
    const out: Record<string, number> = {};
    for (const line of lines) {
      const [k, v] = line.split('=', 2).map((s) => s?.trim());
      if (!k) continue;
      const n = Number(v);
      if (!Number.isFinite(n)) {
        // Garbage line: pass the raw text through unchanged so the
        // daemon can either eval it or reject it.
        onChange(raw);
        return;
      }
      out[k] = n;
    }
    onChange(out);
  };

  return (
    <textarea
      value={text}
      rows={Math.max(2, text.split('\n').length)}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
    />
  );
}

function formatInitial(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value as Record<string, number>)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
  }
  return '';
}
