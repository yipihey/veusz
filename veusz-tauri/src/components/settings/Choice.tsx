import type { LeafProps } from './types';

/**
 * `choice` — strict enum. `choice-or-more` — same UI but the input
 * also accepts free text (we wrap with an `editable` flag on the
 * registry side; same component).
 */
export function Choice({ schema, value, onChange, editable = false }: LeafProps & { editable?: boolean }) {
  const options: Array<string | number> = (schema.vallist as Array<string | number>) ?? [];
  const labels: string[] = (schema.uilist as string[]) ?? options.map((v) => String(v));
  const cur = value == null ? '' : String(value);

  if (editable && !options.includes(cur as never)) {
    // Free-text mode for choice-or-more
    return (
      <input
        type="text"
        value={cur}
        list={`opt-${schema.name}`}
        data-testid={`setting-${schema.name}`}
        aria-label={schema.usertext || schema.name}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <select
      value={cur}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((v, i) => (
        <option key={String(v)} value={String(v)}>
          {labels[i] ?? String(v)}
        </option>
      ))}
    </select>
  );
}
