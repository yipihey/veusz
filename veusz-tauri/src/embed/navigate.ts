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
