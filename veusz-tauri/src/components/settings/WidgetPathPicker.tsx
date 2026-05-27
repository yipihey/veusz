import type { LeafProps } from './types';

/**
 * `widget-path` / `widget-choice` / `axis` — reference another widget
 * by its path in the document tree. The host supplies the list of
 * eligible paths (computed from `doc.tree`, optionally filtered to
 * one widget type for `axis` / `widget-choice`).
 */
export function WidgetPathPicker({
  schema,
  value,
  onChange,
  candidates = [],
}: LeafProps & { candidates?: string[] }) {
  const cur = value == null ? '' : String(value);
  const listId = `wp-${schema.name}`;
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
        {candidates.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </span>
  );
}
