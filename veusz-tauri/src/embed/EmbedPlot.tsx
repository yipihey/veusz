/**
 * The interactive plot surface for an embedded figure: renders the current
 * Scene IR to a canvas via the Vello/WebGPU WASM renderer, and adds navigate
 * interactions driven by the model — drag-rectangle zoom, pan, hover tooltip
 * (data values), double-click reset, and (touch) two-finger pinch-zoom. All
 * "what does this pixel mean" questions go through `render.pixel_to_data`;
 * zoom/pan/reset are plain `doc.set` edits of axis min/max, so they re-tick
 * correctly.
 *
 * Input is unified on Pointer Events so mouse, touch, and stylus share one
 * code path. The canvas is rendered at device-pixel resolution: a
 * ResizeObserver tracks the displayed CSS size and re-requests the scene at
 * `cssSize × devicePixelRatio`, so figures stay crisp on HiDPI / phone screens
 * instead of being upscaled from a fixed 600×400 bitmap.
 */

import { useEffect, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import {
  computeZoomOps, computeResetOps, computePanOps, computePinchOps,
  formatTooltip, type AxisHit, type SetOp,
} from './navigate';

type Store = UseBoundStore<StoreApi<DocState>>;

const DRAG_THRESHOLD = 4; // px before a press counts as a drag
const MAX_RENDER_DIM = 2400; // cap render resolution to bound cost on big/HiDPI screens

type Pt = { clientX: number; clientY: number };

export function EmbedPlot({
  store, width, height,
}: { store: Store; width: number; height: number }) {
  const render = store((s) => s.render);
  const tree = store((s) => s.tree);
  const currentPage = store((s) => s.currentPage);
  const values = store((s) => s.values);
  const requestRender = store((s) => s.requestRender);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Render (backing-store) resolution in device pixels. Starts from the props
  // as an aspect/fallback, then tracks the displayed size × devicePixelRatio.
  const [renderSize, setRenderSize] = useState({ w: width, h: height });
  // Rubber-band rectangle (canvas px) while zoom-dragging.
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [tip, setTip] = useState<
    { left?: number; right?: number; top: number; text: string } | null
  >(null);
  // Live CSS transform applied to the canvas during a pinch, for instant
  // feedback before the (async) re-render commits.
  const [preview, setPreview] = useState<
    { scale: number; ox: number; oy: number; tx: number; ty: number } | null
  >(null);

  // Axes discovered under the cursor — used to reset to Auto.
  const axisPaths = useRef<Set<string>>(new Set());
  // Single-pointer drag state (not React state: must not trigger re-render).
  const drag = useRef<null | {
    pointerId: number; mode: 'zoom' | 'pan'; sx: number; sy: number; moved: boolean;
    from?: AxisHit[]; ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  // Two-pointer pinch state.
  const pinch = useRef<null | {
    id1: number; id2: number;
    startDist: number; startCx: number; startCy: number; // CSS px, for preview
    data1?: AxisHit[]; data2?: AxisHit[];                 // start data, per axis
    ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  // Live pointer positions (client coords) keyed by pointerId.
  const pointers = useRef<Map<number, Pt>>(new Map());
  const lastHover = useRef(0);

  // Track the displayed size and render at device-pixel resolution.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const aspect = width > 0 ? height / width : 0.6667;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const compute = () => {
      const cssW = wrap.clientWidth || width;
      let w = Math.round(cssW * dpr);
      let h = Math.round(cssW * aspect * dpr);
      const m = Math.max(w, h);
      if (m > MAX_RENDER_DIM) { const f = MAX_RENDER_DIM / m; w = Math.round(w * f); h = Math.round(h * f); }
      if (w > 0 && h > 0) {
        setRenderSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
      }
    };
    compute();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [width, height]);

  // Drive rendering whenever the document, page, size, or a setting changes.
  useEffect(() => {
    if (tree && tree.children.length > 0) {
      requestRender(currentPage, renderSize.w, renderSize.h);
    }
  }, [tree, values, currentPage, renderSize.w, renderSize.h, requestRender]);

  // Paint the current scene to the canvas.
  useEffect(() => {
    const sb = render?.sceneB64;
    const cv = canvasRef.current;
    if (!sb || !cv) return;
    let cancelled = false;
    void (async () => {
      try {
        const { renderSceneToCanvas } = await import('../components/plot/velloWasm');
        if (!cancelled) await renderSceneToCanvas(cv, sb, [1, 1, 1, 1]);
      } catch (e) {
        if (!cancelled) console.error('embed scene render failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [render?.sceneB64, renderSize.w, renderSize.h]);

  const rpc = () => store.getState().rpc;

  // Map client coords to canvas (render) pixel coordinates.
  const toCanvasPx = (clientX: number, clientY: number): [number, number] => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return [
      (clientX - r.left) * (renderSize.w / r.width),
      (clientY - r.top) * (renderSize.h / r.height),
    ];
  };

  const applyAndRender = async (ops: SetOp[]) => {
    await store.getState().setValues(ops);
    requestRender(currentPage, renderSize.w, renderSize.h);
  };

  // --- Pinch (two pointers) ---------------------------------------------

  const beginPinch = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ids = [...pointers.current.keys()];
    if (ids.length < 2) return;
    const [id1, id2] = ids;
    const a = pointers.current.get(id1)!;
    const b = pointers.current.get(id2)!;
    const r = cv.getBoundingClientRect();
    const ax = a.clientX - r.left, ay = a.clientY - r.top;
    const bx = b.clientX - r.left, by = b.clientY - r.top;
    const startDist = Math.hypot(bx - ax, by - ay) || 1;
    pinch.current = {
      id1, id2, startDist,
      startCx: (ax + bx) / 2, startCy: (ay + by) / 2,
    };
    // Single-pointer gesture is superseded by the pinch.
    drag.current = null;
    setBand(null);
    // Capture the data under each finger + current ranges for the commit.
    void (async () => {
      const [c1, c2] = [toCanvasPx(a.clientX, a.clientY), toCanvasPx(b.clientX, b.clientY)];
      const [d1, d2] = await Promise.all([
        rpc().render.pixelToData(c1[0], c1[1]),
        rpc().render.pixelToData(c2[0], c2[1]),
      ]);
      if (!pinch.current) return;
      pinch.current.data1 = d1.axes as AxisHit[];
      pinch.current.data2 = d2.axes as AxisHit[];
      const ranges = new Map<string, { min: number; max: number }>();
      const paths = new Set([...d1.axes, ...d2.axes].map((x) => x.path));
      for (const path of paths) {
        const vals = await rpc().doc.get([`${path}/min`, `${path}/max`]);
        const mn = Number(vals[`${path}/min`]);
        const mx = Number(vals[`${path}/max`]);
        if (Number.isFinite(mn) && Number.isFinite(mx)) ranges.set(path, { min: mn, max: mx });
      }
      if (pinch.current) pinch.current.ranges = ranges;
    })();
  };

  const updatePinchPreview = () => {
    const p = pinch.current;
    const cv = canvasRef.current;
    if (!p || !cv) return;
    const a = pointers.current.get(p.id1);
    const b = pointers.current.get(p.id2);
    if (!a || !b) return;
    const r = cv.getBoundingClientRect();
    const ax = a.clientX - r.left, ay = a.clientY - r.top;
    const bx = b.clientX - r.left, by = b.clientY - r.top;
    const dist = Math.hypot(bx - ax, by - ay) || 1;
    setPreview({
      scale: dist / p.startDist,
      ox: p.startCx, oy: p.startCy,
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
    const c1 = toCanvasPx(pos1.clientX, pos1.clientY);
    const c2 = toCanvasPx(pos2.clientX, pos2.clientY);
    void (async () => {
      const [e1, e2] = await Promise.all([
        rpc().render.pixelToData(c1[0], c1[1]),
        rpc().render.pixelToData(c2[0], c2[1]),
      ]);
      const ops = computePinchOps(
        p.data1!, p.data2!, e1.axes as AxisHit[], e2.axes as AxisHit[], p.ranges!,
      );
      if (ops.length) await applyAndRender(ops);
    })();
  };

  // --- Single pointer (mouse drag / touch single-finger) ----------------

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    if (pointers.current.size >= 2) { beginPinch(); return; }

    const [x, y] = toCanvasPx(e.clientX, e.clientY);
    // Mouse: left-drag = zoom rectangle, shift/middle = pan. Touch/pen: a
    // single finger pans (pinch handles zoom), which matches phone expectations.
    const pan = e.pointerType === 'mouse' ? (e.shiftKey || e.button === 1) : true;
    drag.current = { pointerId: e.pointerId, mode: pan ? 'pan' : 'zoom', sx: x, sy: y, moved: false };
    if (pan) {
      // Capture starting data values + current ranges for the pan math.
      void rpc().render.pixelToData(x, y).then(async (rr) => {
        if (!drag.current) return;
        drag.current.from = rr.axes as AxisHit[];
        const ranges = new Map<string, { min: number; max: number }>();
        for (const a of rr.axes) {
          const vals = await rpc().doc.get([`${a.path}/min`, `${a.path}/max`]);
          const mn = Number(vals[`${a.path}/min`]);
          const mx = Number(vals[`${a.path}/max`]);
          if (Number.isFinite(mn) && Number.isFinite(mx)) ranges.set(a.path, { min: mn, max: mx });
        }
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
      const [x, y] = toCanvasPx(e.clientX, e.clientY);
      if (Math.abs(x - d.sx) > DRAG_THRESHOLD || Math.abs(y - d.sy) > DRAG_THRESHOLD) d.moved = true;
      if (d.mode === 'zoom' && d.moved) setBand({ x0: d.sx, y0: d.sy, x1: x, y1: y });
      // Pan commits on release: applying it live would move the axis range,
      // so the next pixel_to_data would read in the new (shifted) frame while
      // `from` stays in the original frame — drifting the gesture.
      return;
    }

    // Hover tooltip (mouse only, no button held; throttled).
    if (e.pointerType !== 'mouse' || e.buttons !== 0) return;
    const now = performance.now();
    if (now - lastHover.current < 40) return;
    lastHover.current = now;
    const [x, y] = toCanvasPx(e.clientX, e.clientY);
    void rpc().render.pixelToData(x, y).then((rr) => {
      rr.axes.forEach((a) => axisPaths.current.add(a.path));
      const text = formatTooltip(rr.axes as AxisHit[]);
      if (!text) { setTip(null); return; }
      const wrap = wrapRef.current;
      const wr = wrap ? wrap.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 };
      // Keep the tooltip inside the figure: anchor to the right edge when the
      // pointer is in the right ~40%, and lift it above the pointer near the
      // bottom, so it never spills off a small screen.
      const relX = e.clientX - wr.left;
      const relY = e.clientY - wr.top;
      const flipX = wr.width > 0 && relX > wr.width * 0.6;
      const liftY = wr.height > 0 && relY > wr.height * 0.85;
      setTip({
        ...(flipX ? { right: Math.max(4, wr.width - relX + 12) }
                  : { left: relX + 12 }),
        top: liftY ? Math.max(4, relY - 22) : relY + 12,
        text,
      });
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    const lifted = pointers.current.get(e.pointerId) ?? { clientX: e.clientX, clientY: e.clientY };

    if (pinch.current) {
      commitPinch(lifted, e.pointerId);
      pointers.current.delete(e.pointerId);
      return;
    }
    pointers.current.delete(e.pointerId);

    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    setBand(null);
    if (!d.moved) return;
    const [x, y] = toCanvasPx(e.clientX, e.clientY);
    if (d.mode === 'zoom') {
      void (async () => {
        const [a, b] = await Promise.all([
          rpc().render.pixelToData(d.sx, d.sy),
          rpc().render.pixelToData(x, y),
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
    pinch.current = null;
    drag.current = null;
    setBand(null);
    setPreview(null);
  };

  const onDoubleClick = () => {
    if (!axisPaths.current.size) return;
    void applyAndRender(computeResetOps(axisPaths.current));
  };

  return (
    <div ref={wrapRef} data-testid="embed-plot"
      style={{ position: 'relative', width: '100%', lineHeight: 0 }}
      onPointerLeave={() => { setTip(null); }}>
      <canvas
        ref={canvasRef}
        width={renderSize.w}
        height={renderSize.h}
        data-testid="embed-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDoubleClick={onDoubleClick}
        style={{
          width: '100%', height: 'auto', display: 'block',
          cursor: 'crosshair', touchAction: 'none',
          transform: preview
            ? `translate(${preview.tx}px, ${preview.ty}px) scale(${preview.scale})`
            : undefined,
          transformOrigin: preview ? `${preview.ox}px ${preview.oy}px` : undefined,
        }}
      />
      {band && (
        <div data-testid="embed-zoomband" style={{
          position: 'absolute', pointerEvents: 'none', border: '1px solid #1f6feb',
          background: 'rgba(31,111,235,0.12)',
          left: `${Math.min(band.x0, band.x1) / renderSize.w * 100}%`,
          top: `${Math.min(band.y0, band.y1) / renderSize.h * 100}%`,
          width: `${Math.abs(band.x1 - band.x0) / renderSize.w * 100}%`,
          height: `${Math.abs(band.y1 - band.y0) / renderSize.h * 100}%`,
        }} />
      )}
      {tip && (
        <div data-testid="embed-tooltip" style={{
          position: 'absolute', left: tip.left, right: tip.right, top: tip.top,
          pointerEvents: 'none',
          background: 'rgba(20,22,26,0.9)', color: '#fff', font: '12px system-ui',
          padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', zIndex: 5,
        }}>{tip.text}</div>
      )}
    </div>
  );
}
