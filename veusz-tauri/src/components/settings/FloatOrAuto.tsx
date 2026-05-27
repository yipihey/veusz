import type { LeafProps } from './types';
import { NumberInput } from './NumberInput';

/**
 * `float-or-auto` / `int-or-auto` — Auto checkbox + number input.
 * The sentinel "Auto" (case-sensitive in Veusz) means unset/auto-fit.
 */
export function FloatOrAuto({ schema, value, onChange }: LeafProps) {
  const isAuto = typeof value === 'string' && value.toLowerCase() === 'auto';
  return (
    <span data-testid={`setting-${schema.name}`}>
      <label>
        <input
          type="checkbox"
          checked={isAuto}
          data-testid={`setting-${schema.name}-auto`}
          aria-label="auto"
          onChange={(e) => onChange(e.target.checked ? 'Auto' : 0)}
        />
        Auto
      </label>
      {!isAuto && (
        <NumberInput
          schema={schema}
          value={value}
          onChange={onChange}
        />
      )}
    </span>
  );
}
