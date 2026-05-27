import type { LeafProps } from './types';

/**
 * `line-style` — named dash patterns. Functionally a Choice; v2 can
 * upgrade to SVG-rendered swatches.
 */
export function LineStylePicker({ schema, value, onChange }: LeafProps) {
  const options = (schema.vallist as string[]) ?? [];
  return (
    <select
      value={value == null ? '' : String(value)}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
