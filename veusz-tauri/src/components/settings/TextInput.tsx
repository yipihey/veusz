import type { LeafProps } from './types';

export function TextInput({ schema, value, onChange }: LeafProps) {
  return (
    <input
      type="text"
      value={value == null ? '' : String(value)}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
