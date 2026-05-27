import type { LeafProps } from './types';

export function Bool({ schema, value, onChange }: LeafProps) {
  const checked = Boolean(value);
  return (
    <input
      type="checkbox"
      checked={checked}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}
