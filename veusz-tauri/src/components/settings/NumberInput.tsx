import { useState, useEffect } from 'react';
import type { LeafProps } from './types';

/**
 * Used for both `int` and `float`. Accepts `=expr` to mean "treat as
 * Python expression" — Veusz's safeEvalHelper resolves it server-side.
 */
export function NumberInput({ schema, value, onChange }: LeafProps) {
  const isInt = schema.typename === 'int';
  const [text, setText] = useState(() =>
    value === null || value === undefined ? '' : String(value),
  );

  // Keep local text in sync if the upstream value changes (e.g. from
  // an undo).
  useEffect(() => {
    const upstream = value === null || value === undefined ? '' : String(value);
    setText(upstream);
  }, [value]);

  const commit = (raw: string) => {
    if (raw.startsWith('=')) {
      // Pass expression through unmodified; the daemon evaluates it.
      onChange(raw);
      return;
    }
    if (raw.trim() === '') {
      onChange(null);
      return;
    }
    const parsed = isInt ? parseInt(raw, 10) : parseFloat(raw);
    if (!Number.isFinite(parsed)) {
      // Bad input — revert to upstream
      setText(value === null || value === undefined ? '' : String(value));
      return;
    }
    onChange(parsed);
  };

  return (
    <input
      type="text"
      inputMode={isInt ? 'numeric' : 'decimal'}
      value={text}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      min={schema.minval}
      max={schema.maxval}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
      }}
    />
  );
}
