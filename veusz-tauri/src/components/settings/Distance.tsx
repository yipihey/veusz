import { useEffect, useState } from 'react';
import type { LeafProps } from './types';

const UNIT_RE = /^(-?\d+(?:\.\d+)?)\s*(pt|cm|mm|in|%|\/)?$/;

/**
 * `distance` / `distance-or-auto` / `displacement` — unit-aware text input.
 * Veusz accepts values like "1pt", "3cm", "50%". This component splits
 * the text and the unit so the user can change either independently.
 */
export function Distance({ schema, value, onChange, allowAuto = false }: LeafProps & { allowAuto?: boolean }) {
  const cur = typeof value === 'string' ? value : '';
  const isAuto = cur.toLowerCase() === 'auto';

  const initial = (() => {
    if (isAuto) return { num: '', unit: 'pt' };
    const m = cur.match(UNIT_RE);
    return { num: m?.[1] ?? '', unit: m?.[2] ?? 'pt' };
  })();
  const [num, setNum] = useState(initial.num);
  const [unit, setUnit] = useState(initial.unit);

  useEffect(() => {
    if (isAuto) return;
    const m = cur.match(UNIT_RE);
    if (m) {
      setNum(m[1] ?? '');
      setUnit(m[2] ?? 'pt');
    }
  }, [cur, isAuto]);

  const commit = (n: string, u: string) => {
    if (n.trim() === '') return;
    onChange(`${n}${u}`);
  };

  return (
    <span data-testid={`setting-${schema.name}`}>
      {allowAuto && (
        <label>
          <input
            type="checkbox"
            checked={isAuto}
            data-testid={`setting-${schema.name}-auto`}
            aria-label="auto"
            onChange={(e) => onChange(e.target.checked ? 'Auto' : '1pt')}
          />
          Auto
        </label>
      )}
      {!isAuto && (
        <>
          <input
            type="text"
            inputMode="decimal"
            value={num}
            data-testid={`setting-${schema.name}-num`}
            aria-label={`${schema.usertext || schema.name} value`}
            onChange={(e) => setNum(e.target.value)}
            onBlur={(e) => commit(e.target.value, unit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit((e.target as HTMLInputElement).value, unit);
            }}
          />
          <select
            value={unit}
            data-testid={`setting-${schema.name}-unit`}
            aria-label={`${schema.usertext || schema.name} unit`}
            onChange={(e) => {
              setUnit(e.target.value);
              commit(num, e.target.value);
            }}
          >
            {['pt', 'cm', 'mm', 'in', '%'].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </>
      )}
    </span>
  );
}
