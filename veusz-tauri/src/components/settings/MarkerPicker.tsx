import type { LeafProps } from './types';

/**
 * `marker` is just a Choice with a known vallist of glyph names. The
 * eventual visual upgrade (a grid of SVG glyphs) is opt-in;
 * functionally a Choice already works.
 */
export function MarkerPicker({ schema, value, onChange }: LeafProps) {
  const options = (schema.vallist as string[]) ?? [];
  return (
    <select
      value={value == null ? '' : String(value)}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}
