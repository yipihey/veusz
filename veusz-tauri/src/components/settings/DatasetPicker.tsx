import type { LeafProps } from './types';

/**
 * `dataset` — autocomplete against the document's dataset registry.
 * The component takes a `datasets` prop populated by the host (the
 * inspector queries `data.list` once and passes the names down).
 */
export function DatasetPicker({
  schema,
  value,
  onChange,
  datasets = [],
}: LeafProps & { datasets?: string[] }) {
  const cur = value == null ? '' : String(value);
  const listId = `ds-${schema.name}`;
  return (
    <span data-testid={`setting-${schema.name}`}>
      <input
        type="text"
        value={cur}
        list={listId}
        data-testid={`setting-${schema.name}-input`}
        aria-label={schema.usertext || schema.name}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {datasets.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </span>
  );
}
