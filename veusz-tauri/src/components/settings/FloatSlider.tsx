import type { LeafProps } from './types';

/**
 * `float-slider` — slider + numeric readout. Min/max come from the
 * schema; `step` and `scale` from optional schema metadata.
 */
export function FloatSlider({ schema, value, onChange }: LeafProps) {
  const num = typeof value === 'number' ? value : Number(value) || 0;
  const min = schema.minval ?? 0;
  const max = schema.maxval ?? 100;
  const step = (schema.step as number | undefined) ?? 1;
  return (
    <span data-testid={`setting-${schema.name}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={num}
        data-testid={`setting-${schema.name}-slider`}
        aria-label={schema.usertext || schema.name}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        type="number"
        value={num}
        min={min}
        max={max}
        step={step}
        data-testid={`setting-${schema.name}-num`}
        aria-label={`${schema.usertext || schema.name} value`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </span>
  );
}
