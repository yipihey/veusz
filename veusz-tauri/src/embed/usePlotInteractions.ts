/**
 * Shared pointer-interaction logic for the embed's plot surfaces — drag-rectangle
 * zoom, pan, hover tooltip, double-click reset, two-finger pinch-zoom, and 3D
 * rotate. Extracted from EmbedPlot so the WebGPU canvas (`EmbedPlot`) and the
 * SVG renderer (`SvgPlot`) share one implementation and never drift.
 *
 * Everything renderer-specific is injected: `toRenderPx` (client → render-space
 * pixels), `getPlotRect` (the figure element's rect, for overlay + pinch
 * geometry), and `requestRender` (a renderer-sized re-render). The maths is the
 * renderer-agnostic `navigate.ts` / `rotate3d.ts` helpers; the daemon round-trips
 * are `render.pixel_to_data` + `doc.get`.
 */

import { useRef, useState } from 'react';
import type React from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import {
  computeZoomOps, computeResetOps, computePanOps, computePinchOps,
  formatTooltip, type AxisHit, type SetOp,
} from './navigate';
import { computeRotateOps, type Angles } from './rotate3d';

type Store = UseBoundStore<StoreApi<DocState>>;
type Pt = { clientX: number; clientY: number };
type Rect = { left: number; top: number; width: number; height: number };

const DRAG_THRESHOLD = 4;
const ROTATE_DEG_PER_PX = 0.4;

/** Rubber-band rectangle in CSS px relative to the plot rect's top-left. */
export interface Band { left: number; top: number; width: number; height: number }
/** Tooltip box: one of left/right + top (CSS px in the plot rect) + text. */
export interface Tip { left?: number; right?: number; top: number; text: string }
/** Live pinch-gesture CSS transform applied to the rendered figure. */
export interface Preview { scale: number; ox: number; oy: number; tx: number; ty: number }

export interface PlotInteractionsConfig {
  store: Store;
  /** Path of the scene3d on the current page (drag rotates it), else null. */
  scene3dPath: string | null;
  /** Map a viewport (client) coordinate to render-space px (0..sceneW/H). */
  toRenderPx: (clientX: number, clientY: number) => [number, number];
  /** The figure element's bounding rect — overlays are positioned relative to
   *  its top-left, and pinch geometry uses it. */
  getPlotRect: () => Rect | null;
  /** Re-render at the renderer's own backing size after an edit. */
  requestRender: () => void;
}

export interface PlotInteractions {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onPointerLeave: () => void;
    onDoubleClick: () => void;
  };
  band: Band | null;
  tip: Tip | null;
  preview: Preview | null;
  rotating: boolean;
}

export function usePlotInteractions(cfg: PlotInteractionsConfig): PlotInteractions {
  const { scene3dPath, toRenderPx, getPlotRect } = cfg;

  const [band, setBand] = useState<Band | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [rotating, setRotating] = useState(false);

  const axisPaths = useRef<Set<string>>(new Set());
  const drag = useRef<null | {
    pointerId: number; mode: 'zoom' | 'pan' | 'rotate';
    sx: number; sy: number;        // start in render px (for pixelToData)
    cx: number; cy: number;        // start in CSS px relative to plot rect (for the band)
    moved: boolean;
    from?: AxisHit[]; ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  const rotateState = useRef<null | {
    scenePath: string; startAngles?: Angles; startClientX: number; startClientY: number;
  }>(null);
  const rotateBusy = useRef(false);
  const pendingRotate = useRef<null | { clientX: number; clientY: number; shift: boolean }>(null);
  const pinch = useRef<null | {
    id1: number; id2: number; startDist: number; startCx: number; startCy: number;
    data1?: AxisHit[]; data2?: AxisHit[]; ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  const pointers = useRef<Map<number, Pt>>(new Map());
  const lastHover = useRef(0);

  const rpc = () => cfg.store.getState().rpc;

  const applyAndRender = async (ops: SetOp[]) => {
    await cfg.store.getState().setValues(ops);
    cfg.requestRender();
  };

  // Current axis min/max for the given paths, for span-preserving pan/pinch.
  const fetchRanges = async (paths: Iterable<string>) => {
    const ranges = new Map<string, { min: number; max: number }>();
    for (const path of new Set(paths)) {
      const vals = await rpc().doc.get([`${path}/min`, `${path}/max`]);
      const mn = Number(vals[`${path}/min`]), mx = Number(vals[`${path}/max`]);
      if (Number.isFinite(mn) && Number.isFinite(mx)) ranges.set(path, { min: mn, max: mx });
    }
    return ranges;
  };

  // --- 3D rotation (scene3d pages) ----------------------------------------
  const pumpRotate = () => {
    if (rotateBusy.current) return;
    const r = rotateState.current, p = pendingRotate.current;
    if (!p || !r || !r.startAngles) return;
    pendingRotate.current = null;
    const dx = (p.clientX - r.startClientX) * ROTATE_DEG_PER_PX;
    const dy = (p.clientY - r.startClientY) * ROTATE_DEG_PER_PX;
    const ops = computeRotateOps(r.scenePath, r.startAngles, dx, dy, p.shift ? 'xz' : 'xy');
    rotateBusy.current = true;
    void applyAndRender(ops).finally(() => { rotateBusy.current = false; pumpRotate(); });
  };
  const queueRotate = (clientX: number, clientY: number, shift: boolean) => {
    pendingRotate.current = { clientX, clientY, shift };
    pumpRotate();
  };

  // --- two-finger pinch-zoom ----------------------------------------------
  const beginPinch = () => {
    const rect = getPlotRect();
    if (!rect) return;
    const ids = [...pointers.current.keys()];
    if (ids.length < 2) return;
    const [id1, id2] = ids;
    const a = pointers.current.get(id1)!, b = pointers.current.get(id2)!;
    const ax = a.clientX - rect.left, ay = a.clientY - rect.top;
    const bx = b.clientX - rect.left, by = b.clientY - rect.top;
    pinch.current = {
      id1, id2, startDist: Math.hypot(bx - ax, by - ay) || 1,
      startCx: (ax + bx) / 2, startCy: (ay + by) / 2,
    };
    drag.current = null;
    setBand(null);
    void (async () => {
      const [c1, c2] = [toRenderPx(a.clientX, a.clientY), toRenderPx(b.clientX, b.clientY)];
      const [d1, d2] = await Promise.all([
        rpc().render.pixelToData(c1[0], c1[1]), rpc().render.pixelToData(c2[0], c2[1]),
      ]);
      if (!pinch.current) return;
      pinch.current.data1 = d1.axes as AxisHit[];
      pinch.current.data2 = d2.axes as AxisHit[];
      const ranges = await fetchRanges([...d1.axes, ...d2.axes].map((x) => x.path));
      if (pinch.current) pinch.current.ranges = ranges;
    })();
  };

  const updatePinchPreview = () => {
    const p = pinch.current, rect = getPlotRect();
    if (!p || !rect) return;
    const a = pointers.current.get(p.id1), b = pointers.current.get(p.id2);
    if (!a || !b) return;
    const ax = a.clientX - rect.left, ay = a.clientY - rect.top;
    const bx = b.clientX - rect.left, by = b.clientY - rect.top;
    const dist = Math.hypot(bx - ax, by - ay) || 1;
    setPreview({
      scale: dist / p.startDist, ox: p.startCx, oy: p.startCy,
      tx: (ax + bx) / 2 - p.startCx, ty: (ay + by) / 2 - p.startCy,
    });
  };

  const commitPinch = (lifted: Pt, liftedId: number) => {
    const p = pinch.current;
    pinch.current = null;
    setPreview(null);
    if (!p || !p.data1 || !p.data2 || !p.ranges) return;
    const pos1 = p.id1 === liftedId ? lifted : pointers.current.get(p.id1);
    const pos2 = p.id2 === liftedId ? lifted : pointers.current.get(p.id2);
    if (!pos1 || !pos2) return;
    const c1 = toRenderPx(pos1.clientX, pos1.clientY), c2 = toRenderPx(pos2.clientX, pos2.clientY);
    void (async () => {
      const [e1, e2] = await Promise.all([
        rpc().render.pixelToData(c1[0], c1[1]), rpc().render.pixelToData(c2[0], c2[1]),
      ]);
      const ops = computePinchOps(p.data1!, p.data2!, e1.axes as AxisHit[], e2.axes as AxisHit[], p.ranges!);
      if (ops.length) await applyAndRender(ops);
    })();
  };

  // --- pointer handlers ----------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    if (pointers.current.size >= 2) { beginPinch(); return; }
    if (scene3dPath) {
      const sp = scene3dPath;
      drag.current = { pointerId: e.pointerId, mode: 'rotate', sx: 0, sy: 0, cx: 0, cy: 0, moved: false };
      rotateState.current = { scenePath: sp, startClientX: e.clientX, startClientY: e.clientY };
      void rpc().doc.get([`${sp}/xRotation`, `${sp}/yRotation`, `${sp}/zRotation`]).then((v) => {
        if (rotateState.current && rotateState.current.scenePath === sp) {
          rotateState.current.startAngles = {
            x: Number(v[`${sp}/xRotation`]) || 0,
            y: Number(v[`${sp}/yRotation`]) || 0,
            z: Number(v[`${sp}/zRotation`]) || 0,
          };
          pumpRotate();
        }
      });
      return;
    }
    const [x, y] = toRenderPx(e.clientX, e.clientY);
    const rect = getPlotRect();
    const cx = e.clientX - (rect?.left ?? 0), cy = e.clientY - (rect?.top ?? 0);
    const pan = e.pointerType === 'mouse' ? (e.shiftKey || e.button === 1) : true;
    drag.current = { pointerId: e.pointerId, mode: pan ? 'pan' : 'zoom', sx: x, sy: y, cx, cy, moved: false };
    if (pan) {
      void rpc().render.pixelToData(x, y).then(async (rr) => {
        if (!drag.current) return;
        drag.current.from = rr.axes as AxisHit[];
        const ranges = await fetchRanges(rr.axes.map((a) => a.path));
        if (drag.current) drag.current.ranges = ranges;
      });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    }
    if (pinch.current) { updatePinchPreview(); return; }
    const d = drag.current;
    if (d && d.pointerId === e.pointerId) {
      if (d.mode === 'rotate') {
        const r = rotateState.current;
        const dx = e.clientX - (r?.startClientX ?? e.clientX);
        const dy = e.clientY - (r?.startClientY ?? e.clientY);
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          if (!d.moved) setRotating(true);
          d.moved = true;
          queueRotate(e.clientX, e.clientY, e.shiftKey);
        }
        return;
      }
      const [x, y] = toRenderPx(e.clientX, e.clientY);
      if (Math.abs(x - d.sx) > DRAG_THRESHOLD || Math.abs(y - d.sy) > DRAG_THRESHOLD) d.moved = true;
      if (d.mode === 'zoom' && d.moved) {
        const rect = getPlotRect();
        const cx = e.clientX - (rect?.left ?? 0), cy = e.clientY - (rect?.top ?? 0);
        setBand({
          left: Math.min(d.cx, cx), top: Math.min(d.cy, cy),
          width: Math.abs(cx - d.cx), height: Math.abs(cy - d.cy),
        });
      }
      return;
    }
    if (scene3dPath) return;  // no data-value hover for 3D scenes
    if (e.pointerType !== 'mouse' || e.buttons !== 0) return;
    const now = performance.now();
    if (now - lastHover.current < 40) return;
    lastHover.current = now;
    const [x, y] = toRenderPx(e.clientX, e.clientY);
    void rpc().render.pixelToData(x, y).then((rr) => {
      rr.axes.forEach((a) => axisPaths.current.add(a.path));
      const text = formatTooltip(rr.axes as AxisHit[]);
      if (!text) { setTip(null); return; }
      const box = getPlotRect() ?? { left: 0, top: 0, width: 0, height: 0 };
      const relX = e.clientX - box.left, relY = e.clientY - box.top;
      const flipX = box.width > 0 && relX > box.width * 0.6;
      const liftY = box.height > 0 && relY > box.height * 0.85;
      setTip({
        ...(flipX ? { right: Math.max(4, box.width - relX + 12) } : { left: relX + 12 }),
        top: liftY ? Math.max(4, relY - 22) : relY + 12, text,
      });
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    const lifted = pointers.current.get(e.pointerId) ?? { clientX: e.clientX, clientY: e.clientY };
    if (pinch.current) { commitPinch(lifted, e.pointerId); pointers.current.delete(e.pointerId); return; }
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    if (d.mode === 'rotate') {
      if (d.moved) queueRotate(e.clientX, e.clientY, e.shiftKey);
      setRotating(false);
      return;
    }
    setBand(null);
    if (!d.moved) return;
    const [x, y] = toRenderPx(e.clientX, e.clientY);
    if (d.mode === 'zoom') {
      void (async () => {
        const [a, b] = await Promise.all([
          rpc().render.pixelToData(d.sx, d.sy), rpc().render.pixelToData(x, y),
        ]);
        const ops = computeZoomOps(a.axes as AxisHit[], b.axes as AxisHit[]);
        if (ops.length) await applyAndRender(ops);
      })();
    } else if (d.mode === 'pan' && d.from && d.ranges) {
      void (async () => {
        const to = await rpc().render.pixelToData(x, y);
        const ops = computePanOps(d.from!, to.axes as AxisHit[], d.ranges!);
        if (ops.length) await applyAndRender(ops);
      })();
    }
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinch.current = null; drag.current = null;
    pendingRotate.current = null; setRotating(false);
    setBand(null); setPreview(null);
  };

  const onPointerLeave = () => { setTip(null); };

  const onDoubleClick = () => {
    if (!axisPaths.current.size) return;
    void applyAndRender(computeResetOps(axisPaths.current));
  };

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave, onDoubleClick },
    band, tip, preview, rotating,
  };
}
