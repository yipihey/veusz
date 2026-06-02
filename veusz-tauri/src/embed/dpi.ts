/**
 * HiDPI helpers for the browser embed. Drives both the canvas backing-store
 * resolution (so WebGPU rasterises into the user's physical pixels) and the
 * `dpi` we pass to `render.scene` (so text + line widths scale linearly with
 * the supersample — the figure's visual size in CSS pixels is unchanged).
 *
 * The relationship `render.scene` expects: pixel-space page width = `w`,
 * physical page width (in inches) = `w / dpi`. Keeping `w/dpi` constant
 * across DPR settings means rendering twice as many pixels for the same
 * physical page, i.e. clean supersampling.
 */

/** Veusz's logical-pixel-per-inch baseline (matches the desktop default). */
export const BASE_DPI = 96;

/** Clamp for the runtime DPR — above 3× the GPU pixel budget grows fast
 *  (9× area at DPR=3) with very little perceived gain past that. */
const MIN_DPR = 1;
const MAX_DPR = 3;

/** A user-set override (via `<veusz-figure dpi-scale="2.5">` or programmatic
 *  setter) wins over `window.devicePixelRatio`. Stored module-level so it
 *  takes effect for newly-mounted figures; existing renders survive on
 *  whatever DPR they captured (re-mount to pick up a new override). */
let dprOverride: number | null = null;

export function setDisplayDprOverride(v: number | null) {
  dprOverride = v == null || !Number.isFinite(v) || v <= 0 ? null : v;
}

/** Effective DPR for the current display. Uses `window.devicePixelRatio`
 *  when available, falls back to 2 (a sensible default for the dominant
 *  retina-class screens) when the embed runs outside a window (SSR / Node
 *  smoke tests). Clamped to [1, 3]. */
export function displayDpr(): number {
  const raw = dprOverride
    ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 2);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.min(MAX_DPR, Math.max(MIN_DPR, raw));
}
