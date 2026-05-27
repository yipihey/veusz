import type { LeafProps } from './types';
import { FloatOrAuto } from './FloatOrAuto';

/**
 * `axis-bound` — context-aware: if the parent axis is in `datetime`
 * mode the value is an ISO date; otherwise it's a number with an
 * "Auto" sentinel. Per the plan we need the parent's `mode` setting
 * to flip rendering — passed in via `siblings`.
 */
export function AxisBound({ schema, value, onChange, siblings }: LeafProps) {
  const isDateAxis = siblings?.mode === 'datetime';
  if (!isDateAxis) {
    return <FloatOrAuto schema={schema} value={value} onChange={onChange} />;
  }
  const cur = typeof value === 'string' ? value : '';
  const isAuto = cur.toLowerCase() === 'auto';
  return (
    <span data-testid={`setting-${schema.name}`}>
      <label>
        <input
          type="checkbox"
          checked={isAuto}
          data-testid={`setting-${schema.name}-auto`}
          aria-label="auto"
          onChange={(e) => onChange(e.target.checked ? 'Auto' : '')}
        />
        Auto
      </label>
      {!isAuto && (
        <input
          type="datetime-local"
          value={cur}
          data-testid={`setting-${schema.name}-date`}
          aria-label={schema.usertext || schema.name}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </span>
  );
}
