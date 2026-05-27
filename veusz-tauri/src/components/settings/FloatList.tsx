import { useState, useEffect } from 'react';
import type { LeafProps } from './types';

/**
 * `float-list` — comma-separated floats. Veusz also accepts `=expr`
 * (Python expression evaluated server-side) so we pass any string
 * containing characters outside the numeric set through unmodified.
 */
export function FloatList({ schema, value, onChange }: LeafProps) {
  const initial = Array.isArray(value)
    ? (value as number[]).join(', ')
    : typeof value === 'string'
      ? value
      : '';
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial]);

  const commit = (raw: string) => {
    if (raw.startsWith('=')) {
      onChange(raw);
      return;
    }
    if (raw.trim() === '') {
      onChange([]);
      return;
    }
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const nums = parts.map(Number);
    if (nums.every(Number.isFinite)) {
      onChange(nums);
    } else {
      // Pass through as a string and let the daemon try to eval/normalize
      onChange(raw);
    }
  };

  return (
    <input
      type="text"
      value={text}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
      }}
    />
  );
}
