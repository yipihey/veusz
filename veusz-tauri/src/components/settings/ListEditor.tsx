import type { LeafProps } from './types';

/**
 * Generic list editor for `str-multi` (Strings), `line-multi` (LineSet),
 * `fill-multi` (FillSet). Renders the list as a textarea of JSON lines
 * for the v1 functional cut — visual row editors (drag-reorder,
 * inline color/style controls) are Phase-2 polish.
 *
 * The daemon already accepts these as JSON arrays via doc.set, so a
 * round-trip is straightforward.
 */
export function ListEditor({ schema, value, onChange }: LeafProps) {
  const initial = Array.isArray(value) ? JSON.stringify(value, null, 2) : '';
  return (
    <textarea
      defaultValue={initial}
      rows={Math.max(3, initial.split('\n').length)}
      data-testid={`setting-${schema.name}`}
      aria-label={schema.usertext || schema.name}
      onBlur={(e) => {
        const raw = e.target.value.trim();
        if (raw === '') {
          onChange([]);
          return;
        }
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            onChange(parsed);
          } else {
            onChange(raw); // let daemon reject
          }
        } catch {
          onChange(raw); // let daemon reject
        }
      }}
    />
  );
}
