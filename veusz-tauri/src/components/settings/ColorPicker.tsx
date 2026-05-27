import type { LeafProps } from './types';

/**
 * `color` — accepts hex (#rrggbb), named ("red", "blue"), or "auto"
 * (resolved by Veusz against the parent widget's auto-color cycle).
 */
export function ColorPicker({ schema, value, onChange }: LeafProps) {
  const v = typeof value === 'string' ? value : 'auto';
  const isAuto = v === 'auto';
  const refVal = (value as { $ref?: string } | null | undefined)?.$ref;

  return (
    <span data-testid={`setting-${schema.name}`}>
      <label>
        <input
          type="checkbox"
          checked={isAuto}
          data-testid={`setting-${schema.name}-auto`}
          aria-label="auto"
          onChange={(e) => onChange(e.target.checked ? 'auto' : '#000000')}
        />
        Auto
      </label>
      {!isAuto && (
        <input
          type="color"
          value={normalizeHex(v)}
          data-testid={`setting-${schema.name}-color`}
          aria-label={schema.usertext || schema.name}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {refVal && (
        <span data-testid={`setting-${schema.name}-ref`}>
          ref: <code>{refVal}</code>
        </span>
      )}
    </span>
  );
}

function normalizeHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  // Browser <input type=color> demands #rrggbb; fall back to black for
  // names we can't easily resolve here. (Veusz keeps the canonical
  // value server-side.)
  return '#000000';
}
