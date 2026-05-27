import type { LeafProps } from './types';

/**
 * `filename` / `filename-image` / `filename-svg` — file path text
 * input plus a Browse button that calls the Tauri native dialog at
 * runtime. In the React-only build we fall back to a plain text
 * input; the parent supplies an `onBrowse` callback when the Tauri
 * shell is live.
 */
export function FilePicker({
  schema,
  value,
  onChange,
  onBrowse,
}: LeafProps & { onBrowse?: () => Promise<string | null> | string | null }) {
  const cur = value == null ? '' : String(value);
  return (
    <span data-testid={`setting-${schema.name}`}>
      <input
        type="text"
        value={cur}
        data-testid={`setting-${schema.name}-path`}
        aria-label={schema.usertext || schema.name}
        onChange={(e) => onChange(e.target.value)}
      />
      {onBrowse && (
        <button
          type="button"
          data-testid={`setting-${schema.name}-browse`}
          onClick={async () => {
            const picked = await onBrowse();
            if (picked) onChange(picked);
          }}
        >
          Browse…
        </button>
      )}
    </span>
  );
}
