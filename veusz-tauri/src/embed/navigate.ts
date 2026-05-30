/**
 * Pure helpers for the embed's navigate interactions. Kept free of React/DOM
 * so the zoom/reset/tooltip logic is unit-testable. The actual mouse handling
 * lives in EmbedPlot.tsx.
 *
 * Coordinates come from `render.pixel_to_data`, which maps a canvas pixel to
 * the data value on every axis under it. Zoom = set each axis's min/max to the
 * data range spanned by the drag rectangle; reset = set them back to 'Auto'.
 */

export interface AxisHit {
  path: string;
  direction: 'horizontal' | 'vertical';
  value: number;
}

export interface SetOp {
  path: string;
  value: number | string;
}

/**
 * Given the per-axis data values at two opposite drag-rectangle corners,
 * produce the doc.set ops that zoom each shared axis to that range. An axis is
 * only zoomed if it appears at both corners and the span is non-degenerate.
 */
export function computeZoomOps(cornerA: AxisHit[], cornerB: AxisHit[]): SetOp[] {
  const byPathB = new Map(cornerB.map((a) => [a.path, a]));
  const ops: SetOp[] = [];
  for (const a of cornerA) {
    const b = byPathB.get(a.path);
    if (!b) continue;
    const lo = Math.min(a.value, b.value);
    const hi = Math.max(a.value, b.value);
    if (!(hi > lo) || !Number.isFinite(lo) || !Number.isFinite(hi)) continue;
    ops.push({ path: `${a.path}/min`, value: lo });
    ops.push({ path: `${a.path}/max`, value: hi });
  }
  return ops;
}

/** doc.set ops that return the given axes to auto-ranging. */
export function computeResetOps(axisPaths: Iterable<string>): SetOp[] {
  const ops: SetOp[] = [];
  for (const path of new Set(axisPaths)) {
    ops.push({ path: `${path}/min`, value: 'Auto' });
    ops.push({ path: `${path}/max`, value: 'Auto' });
  }
  return ops;
}

/** Pan ops: shift each shared axis by (from - to) in data units, so the point
 *  under `from` moves to `to`. Preserves the current span. */
export function computePanOps(
  from: AxisHit[],
  to: AxisHit[],
  ranges: Map<string, { min: number; max: number }>,
): SetOp[] {
  const byPathTo = new Map(to.map((a) => [a.path, a]));
  const ops: SetOp[] = [];
  for (const f of from) {
    const t = byPathTo.get(f.path);
    const r = ranges.get(f.path);
    if (!t || !r) continue;
    const d = f.value - t.value;
    if (!Number.isFinite(d)) continue;
    ops.push({ path: `${f.path}/min`, value: r.min + d });
    ops.push({ path: `${f.path}/max`, value: r.max + d });
  }
  return ops;
}

/**
 * Two-finger pinch: produce the doc.set ops so the data points under each
 * finger at gesture *start* end up under each finger at gesture *end* (the
 * standard "content sticks to your fingers" behavior), per shared axis.
 *
 * Inputs are the per-axis data values from `render.pixel_to_data` at four
 * sample points — finger 1 & 2 at the start, and finger 1 & 2 at the end —
 * plus the axis ranges captured at the start. We never need the axis pixel
 * extent: for a linear axis with `data(p) = a·p + b`, writing the start data
 * (d1,d2) and the end data measured under the *old* range (e1,e2) gives the
 * scale `k = (d2−d1)/(e2−e1)`, and the new range is
 *   min' = d1 + k·(min₀ − e1),  max' = d1 + k·(max₀ − e1).
 * (For log axes this is approximate, the same simplification the pan/zoom
 * helpers already make.)
 */
export function computePinchOps(
  start1: AxisHit[],
  start2: AxisHit[],
  end1: AxisHit[],
  end2: AxisHit[],
  ranges: Map<string, { min: number; max: number }>,
): SetOp[] {
  const s2 = new Map(start2.map((a) => [a.path, a]));
  const e1m = new Map(end1.map((a) => [a.path, a]));
  const e2m = new Map(end2.map((a) => [a.path, a]));
  const ops: SetOp[] = [];
  for (const f of start1) {
    const b = s2.get(f.path);
    const g1 = e1m.get(f.path);
    const g2 = e2m.get(f.path);
    const r = ranges.get(f.path);
    if (!b || !g1 || !g2 || !r) continue;
    const d1 = f.value, d2 = b.value, e1 = g1.value, e2 = g2.value;
    const den = e2 - e1;
    if (!Number.isFinite(den) || den === 0) continue;
    const k = (d2 - d1) / den;
    if (!Number.isFinite(k) || k <= 0) continue; // crossed/degenerate fingers
    const a = d1 + k * (r.min - e1);
    const c = d1 + k * (r.max - e1);
    if (!Number.isFinite(a) || !Number.isFinite(c)) continue;
    const lo = Math.min(a, c), hi = Math.max(a, c);
    if (!(hi > lo)) continue;
    ops.push({ path: `${f.path}/min`, value: lo });
    ops.push({ path: `${f.path}/max`, value: hi });
  }
  return ops;
}

/** A short, human-readable readout for a hover tooltip, e.g. "x: 1.23   y: 4.5".
 *  Uses the first horizontal + first vertical axis under the point. */
export function formatTooltip(axes: AxisHit[]): string {
  const fmt = (v: number) => {
    const a = Math.abs(v);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(3);
    return Number(v.toPrecision(5)).toString();
  };
  const x = axes.find((a) => a.direction === 'horizontal');
  const y = axes.find((a) => a.direction === 'vertical');
  const parts: string[] = [];
  if (x) parts.push(`x: ${fmt(x.value)}`);
  if (y) parts.push(`y: ${fmt(y.value)}`);
  return parts.join('   ');
}
