import { describe, it, expect } from 'vitest';
import {
  computeZoomOps, computeResetOps, computePanOps, formatTooltip, type AxisHit,
} from './navigate';

const X = '/page1/graph1/x';
const Y = '/page1/graph1/y';

describe('computeZoomOps', () => {
  it('sets min/max to the spanned data range per shared axis', () => {
    const a: AxisHit[] = [
      { path: X, direction: 'horizontal', value: 2 },
      { path: Y, direction: 'vertical', value: 9 },
    ];
    const b: AxisHit[] = [
      { path: X, direction: 'horizontal', value: 8 },
      { path: Y, direction: 'vertical', value: 1 },
    ];
    expect(computeZoomOps(a, b)).toEqual([
      { path: `${X}/min`, value: 2 }, { path: `${X}/max`, value: 8 },
      { path: `${Y}/min`, value: 1 }, { path: `${Y}/max`, value: 9 },
    ]);
  });

  it('skips axes not present at both corners and degenerate spans', () => {
    const a: AxisHit[] = [{ path: X, direction: 'horizontal', value: 5 }];
    const b: AxisHit[] = [
      { path: X, direction: 'horizontal', value: 5 },   // zero span -> skip
      { path: Y, direction: 'vertical', value: 1 },       // only at b -> skip
    ];
    expect(computeZoomOps(a, b)).toEqual([]);
  });
});

describe('computeResetOps', () => {
  it('sets each axis back to Auto, de-duplicated', () => {
    expect(computeResetOps([X, Y, X])).toEqual([
      { path: `${X}/min`, value: 'Auto' }, { path: `${X}/max`, value: 'Auto' },
      { path: `${Y}/min`, value: 'Auto' }, { path: `${Y}/max`, value: 'Auto' },
    ]);
  });
});

describe('computePanOps', () => {
  it('shifts each axis so the grabbed point follows the cursor', () => {
    const from: AxisHit[] = [{ path: X, direction: 'horizontal', value: 5 }];
    const to: AxisHit[] = [{ path: X, direction: 'horizontal', value: 7 }];
    const ranges = new Map([[X, { min: 0, max: 10 }]]);
    // grabbed data 5 should move to where 7 was => shift by -2
    expect(computePanOps(from, to, ranges)).toEqual([
      { path: `${X}/min`, value: -2 }, { path: `${X}/max`, value: 8 },
    ]);
  });
});

describe('formatTooltip', () => {
  it('shows the first horizontal + vertical axis values', () => {
    expect(formatTooltip([
      { path: X, direction: 'horizontal', value: 1.23456 },
      { path: Y, direction: 'vertical', value: 42 },
    ])).toBe('x: 1.2346   y: 42');
  });
  it('uses exponential for very small/large magnitudes', () => {
    expect(formatTooltip([{ path: X, direction: 'horizontal', value: 1234567 }]))
      .toBe('x: 1.235e+6');
  });
});
