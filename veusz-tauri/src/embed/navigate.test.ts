import { describe, it, expect } from 'vitest';
import {
  computeZoomOps, computeResetOps, computePanOps, computePinchOps,
  formatTooltip, type AxisHit,
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

describe('computePinchOps', () => {
  const h = (path: string, value: number): AxisHit => ({ path, direction: 'horizontal', value });

  it('zooms in when the fingers spread, keeping content under each finger', () => {
    // Linear axis data(p)=0.1p over [0,10]. Fingers start at px 20,80 (data
    // 2,8) and spread to px 10,90 (old-range data 1,9).
    const start1 = [h(X, 2)], start2 = [h(X, 8)];
    const end1 = [h(X, 1)], end2 = [h(X, 9)];
    const ranges = new Map([[X, { min: 0, max: 10 }]]);
    expect(computePinchOps(start1, start2, end1, end2, ranges)).toEqual([
      { path: `${X}/min`, value: 1.25 }, { path: `${X}/max`, value: 8.75 },
    ]);
  });

  it('zooms out when the fingers come together', () => {
    // Inverse of the above: fingers start wide (data 1,9) and pinch to 2,8.
    const start1 = [h(X, 1)], start2 = [h(X, 9)];
    const end1 = [h(X, 2)], end2 = [h(X, 8)];
    const ranges = new Map([[X, { min: 0, max: 10 }]]);
    const ops = computePinchOps(start1, start2, end1, end2, ranges);
    expect(ops[0].value as number).toBeCloseTo(-5 / 3, 6); // span grows past [0,10]
    expect(ops[1].value as number).toBeCloseTo(35 / 3, 6);
  });

  it('skips axes where the fingers cross or collapse', () => {
    const ranges = new Map([[X, { min: 0, max: 10 }]]);
    // end fingers map to the same data → degenerate.
    expect(computePinchOps([h(X, 2)], [h(X, 8)], [h(X, 5)], [h(X, 5)], ranges)).toEqual([]);
    // crossed: k would be negative.
    expect(computePinchOps([h(X, 2)], [h(X, 8)], [h(X, 9)], [h(X, 1)], ranges)).toEqual([]);
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
