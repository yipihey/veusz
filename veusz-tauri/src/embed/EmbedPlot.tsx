/**
 * The interactive plot surface for an embedded figure: renders the current
 * Scene IR to a canvas via the Vello/WebGPU WASM renderer, and adds navigate
 * interactions driven by the model — drag-rectangle zoom, pan, hover tooltip
 * (data values), double-click reset, and (touch) two-finger pinch-zoom.
 *
 * The figure is laid out **contain-fit**: it scales to fit its container in
 * both dimensions (preserving the page aspect), centred, and renders at
 * device-pixel resolution (size × devicePixelRatio) so it stays crisp on
 * HiDPI screens. Input is unified on Pointer Events (mouse, touch, stylus).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import {
  computeZoomOps, computeResetOps, computePanOps, computePinchOps,
  formatTooltip, type AxisHit, type SetOp,
} from './navigate';
import { computeRotateOps, findScene3dPath, type Angles } from './rotate3d';
import { displayDpr, BASE_DPI } from './dpi';

type Store = UseBoundStore<StoreApi<DocState>>;

const DRAG_THRESHOLD = 4;
// Drag sensitivity for 3D rotation, in degrees of rotation per CSS pixel of
// pointer travel. ~0.4 gives a full half-turn over a ~450px drag, which feels
// controllable with both mouse and touch.
const ROTATE_DEG_PER_PX = 0.4;
// Cap for the backing store's longest side. Raised from the original 2400
// to keep 3× retina renders of typical embed sizes (≤1200 logical px) from
// hitting the cap. WebGPU MAX_TEXTURE_DIMENSION_2D is 8192 on every shipping
// browser, so 4096 is well within budget.
const MAX_RENDER_DIM = 4096;

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
  const figRef = useRef<HTMLDivElement>(null);

  // Fixed backing-store resolution (rendered once; never churned on resize).
  // The supersample tracks the screen's devicePixelRatio so the WebGPU
  // rasterisation lands at the user's actual physical pixels — sharp on 2×/
  // 3× retina, no waste on 1× monitors. dpi scales with the supersample so
  // the figure's visual size in CSS pixels stays the same as the unscaled
  // case (`render.scene` interprets `w/dpi` as page-size in inches).
  const dpr = useMemo(() => displayDpr(), []);
  const renderSize = useMemo(() => {
    let w = Math.max(1, Math.round(width * dpr));
    let h = Math.max(1, Math.round(height * dpr));
    const m = Math.max(w, h);
    if (m > MAX_RENDER_DIM) { const f = MAX_RENDER_DIM / m; w = Math.round(w * f); h = Math.round(h * f); }
    return { w, h };
  }, [width, height, dpr]);
  const renderDpi = Math.round(BASE_DPI * (renderSize.w / Math.max(width, 1)));
  // Path of the scene3d on the current page, if any. When set, a drag rotates
  // the scene (camera) instead of doing a 2D zoom/pan — the 2D axis gestures
  // don't apply to a 3D view.
  const scene3dPath = useMemo(
    () => (tree ? findScene3dPath(tree.children[currentPage] ?? null) : null),
    [tree, currentPage],
  );
  // CSS display size of the fitted figure box (contain), updated on resize.
  // Only changes the canvas's *style* size, not its backing store.
  const [disp, setDisp] = useState({ w: width, h: height });
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [tip, setTip] = useState<{ left?: number; right?: number; top: number; text: string } | null>(null);
  const [preview, setPreview] = useState<
    { scale: number; ox: number; oy: number; tx: number; ty: number } | null
  >(null);

  const axisPaths = useRef<Set<string>>(new Set());
  const [rotating, setRotating] = useState(false);
  const drag = useRef<null | {
    pointerId: number; mode: 'zoom' | 'pan' | 'rotate'; sx: number; sy: number; moved: boolean;
    from?: AxisHit[]; ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  // 3D rotation gesture state, kept separate from `drag` so it outlives the
  // pointer release long enough for the final orientation to be applied (the
  // angles load async and renders are throttled). `startAngles` is undefined
  // until the scene's current rotation has been fetched.
  const rotateState = useRef<null | {
    scenePath: string; startAngles?: Angles; startClientX: number; startClientY: number;
  }>(null);
  // Trailing-throttle for rotation: only one rotate render is in flight at a
  // time; the most recent requested orientation is kept and applied when the
  // previous completes, so heavy scenes degrade to a lower frame rate rather
  // than piling up stale RPCs out of order.
  const rotateBusy = useRef(false);
  const pendingRotate = useRef<null | { clientX: number; clientY: number; shift: boolean }>(null);
  const pinch = useRef<null | {
    id1: number; id2: number; startDist: number; startCx: number; startCy: number;
    data1?: AxisHit[]; data2?: AxisHit[]; ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  const pointers = useRef<Map<number, Pt>>(new Map());
  const lastHover = useRef(0);

  // Contain-fit the figure's *display* size into its container (CSS only).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const aspect = width > 0 ? height / width : 0.7143;
    const compute = () => {
      const cw = wrap.clientWidth, ch = wrap.clientHeight;
      let dw: number, dh: number;
      if (cw > 0 && ch > 0) {
        const scale = Math.min(cw / width, ch / height);
        dw = width * scale; dh = height * scale;
      } else if (cw > 0) {
        dw = cw; dh = cw * aspect;
      } else {
        dw = width; dh = height;
      }
      setDisp((p) => (Math.abs(p.w - dw) < 0.5 && Math.abs(p.h - dh) < 0.5 ? p : { w: dw, h: dh }));
    };
    compute();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [width, height]);

  useEffect(() => {
    if (tree && tree.children.length > 0) requestRender(currentPage, renderSize.w, renderSize.h, renderDpi);
  }, [tree, values, currentPage, renderSize.w, renderSize.h, requestRender]);

  // Paint the current scene to the (fixed-size) canvas whenever it changes.
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
        if (!cancelled) {
          // Surface the actual cause: console.error('msg', errObj) renders
          // {} in many log viewers because Error props aren't enumerable.
          const err = e as { message?: string; stack?: string; toString?: () => string };
          const msg = err?.message || err?.toString?.() || String(e);
          console.error('embed scene render failed:', msg);
          if (err?.stack) console.error(err.stack);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [render?.sceneB64]);

  const rpc = () => store.getState().rpc;

  const toCanvasPx = (clientX: number, clientY: number): [number, number] => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return [
      (clientX - r.left) * (renderSize.w / (r.width || 1)),
      (clientY - r.top) * (renderSize.h / (r.height || 1)),
    ];
  };

  const applyAndRender = async (ops: SetOp[]) => {
    await store.getState().setValues(ops);
    requestRender(currentPage, renderSize.w, renderSize.h, renderDpi);
  };

  // Apply the latest pending rotation, if any, when no render is in flight.
  // Re-pumps itself on completion so a request that arrived mid-flight isn't
  // dropped (trailing edge), and waits if the start angles are still loading.
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

  const beginPinch = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ids = [...pointers.current.keys()];
    if (ids.length < 2) return;
    const [id1, id2] = ids;
    const a = pointers.current.get(id1)!, b = pointers.current.get(id2)!;
    const r = cv.getBoundingClientRect();
    const ax = a.clientX - r.left, ay = a.clientY - r.top;
    const bx = b.clientX - r.left, by = b.clientY - r.top;
    pinch.current = {
      id1, id2, startDist: Math.hypot(bx - ax, by - ay) || 1,
      startCx: (ax + bx) / 2, startCy: (ay + by) / 2,
    };
    drag.current = null;
    setBand(null);
    void (async () => {
      const [c1, c2] = [toCanvasPx(a.clientX, a.clientY), toCanvasPx(b.clientX, b.clientY)];
      const [d1, d2] = await Promise.all([
        rpc().render.pixelToData(c1[0], c1[1]), rpc().render.pixelToData(c2[0], c2[1]),
      ]);
      if (!pinch.current) return;
      pinch.current.data1 = d1.axes as AxisHit[];
      pinch.current.data2 = d2.axes as AxisHit[];
      const ranges = new Map<string, { min: number; max: number }>();
      for (const path of new Set([...d1.axes, ...d2.axes].map((x) => x.path))) {
        const vals = await rpc().doc.get([`${path}/min`, `${path}/max`]);
        const mn = Number(vals[`${path}/min`]), mx = Number(vals[`${path}/max`]);
        if (Number.isFinite(mn) && Number.isFinite(mx)) ranges.set(path, { min: mn, max: mx });
      }
      if (pinch.current) pinch.current.ranges = ranges;
    })();
  };

  const updatePinchPreview = () => {
    const p = pinch.current, cv = canvasRef.current;
    if (!p || !cv) return;
    const a = pointers.current.get(p.id1), b = pointers.current.get(p.id2);
    if (!a || !b) return;
    const r = cv.getBoundingClientRect();
    const ax = a.clientX - r.left, ay = a.clientY - r.top;
    const bx = b.clientX - r.left, by = b.clientY - r.top;
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
    const c1 = toCanvasPx(pos1.clientX, pos1.clientY), c2 = toCanvasPx(pos2.clientX, pos2.clientY);
    void (async () => {
      const [e1, e2] = await Promise.all([
        rpc().render.pixelToData(c1[0], c1[1]), rpc().render.pixelToData(c2[0], c2[1]),
      ]);
      const ops = computePinchOps(p.data1!, p.data2!, e1.axes as AxisHit[], e2.axes as AxisHit[], p.ranges!);
      if (ops.length) await applyAndRender(ops);
    })();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    if (pointers.current.size >= 2) { beginPinch(); return; }
    if (scene3dPath) {
      // 3D: this drag rotates the scene. Record the pointer origin now and
      // fetch the scene's current rotation; deltas are taken from both.
      const sp = scene3dPath;
      drag.current = { pointerId: e.pointerId, mode: 'rotate', sx: 0, sy: 0, moved: false };
      rotateState.current = { scenePath: sp, startClientX: e.clientX, startClientY: e.clientY };
      void rpc().doc.get([`${sp}/xRotation`, `${sp}/yRotation`, `${sp}/zRotation`]).then((v) => {
        if (rotateState.current && rotateState.current.scenePath === sp) {
          rotateState.current.startAngles = {
            x: Number(v[`${sp}/xRotation`]) || 0,
            y: Number(v[`${sp}/yRotation`]) || 0,
            z: Number(v[`${sp}/zRotation`]) || 0,
          };
          pumpRotate();  // apply any rotation that was queued while loading
        }
      });
      return;
    }
    const [x, y] = toCanvasPx(e.clientX, e.clientY);
    const pan = e.pointerType === 'mouse' ? (e.shiftKey || e.button === 1) : true;
    drag.current = { pointerId: e.pointerId, mode: pan ? 'pan' : 'zoom', sx: x, sy: y, moved: false };
    if (pan) {
      void rpc().render.pixelToData(x, y).then(async (rr) => {
        if (!drag.current) return;
        drag.current.from = rr.axes as AxisHit[];
        const ranges = new Map<string, { min: number; max: number }>();
        for (const a of rr.axes) {
          const vals = await rpc().doc.get([`${a.path}/min`, `${a.path}/max`]);
          const mn = Number(vals[`${a.path}/min`]), mx = Number(vals[`${a.path}/max`]);
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
      const [x, y] = toCanvasPx(e.clientX, e.clientY);
      if (Math.abs(x - d.sx) > DRAG_THRESHOLD || Math.abs(y - d.sy) > DRAG_THRESHOLD) d.moved = true;
      if (d.mode === 'zoom' && d.moved) setBand({ x0: d.sx, y0: d.sy, x1: x, y1: y });
      return;
    }
    if (scene3dPath) return;  // no data-value hover for 3D scenes
    if (e.pointerType !== 'mouse' || e.buttons !== 0) return;
    const now = performance.now();
    if (now - lastHover.current < 40) return;
    lastHover.current = now;
    const [x, y] = toCanvasPx(e.clientX, e.clientY);
    void rpc().render.pixelToData(x, y).then((rr) => {
      rr.axes.forEach((a) => axisPaths.current.add(a.path));
      const text = formatTooltip(rr.axes as AxisHit[]);
      if (!text) { setTip(null); return; }
      const box = figRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };
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
      // Queue the release position as the final orientation; rotateState
      // outlives the drag so pumpRotate still has the scene path + start angles.
      if (d.moved) queueRotate(e.clientX, e.clientY, e.shiftKey);
      setRotating(false);
      return;
    }
    setBand(null);
    if (!d.moved) return;
    const [x, y] = toCanvasPx(e.clientX, e.clientY);
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

  const onDoubleClick = () => {
    if (!axisPaths.current.size) return;
    void applyAndRender(computeResetOps(axisPaths.current));
  };

  return (
    <div ref={wrapRef} data-testid="embed-plot"
      style={{ position: 'relative', width: '100%', height: '100%', display: 'flex',
               alignItems: 'center', justifyContent: 'center', lineHeight: 0, overflow: 'hidden' }}
      onPointerLeave={() => { setTip(null); }}>
      <div ref={figRef} style={{ position: 'relative', width: disp.w, height: disp.h }}>
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
            width: '100%', height: '100%', display: 'block',
            cursor: scene3dPath ? (rotating ? 'grabbing' : 'grab') : 'crosshair',
            touchAction: 'none',
            transform: preview
              ? `translate(${preview.tx}px, ${preview.ty}px) scale(${preview.scale})` : undefined,
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
            pointerEvents: 'none', background: 'rgba(20,22,26,0.9)', color: '#fff',
            font: '12px system-ui', padding: '2px 6px', borderRadius: 4,
            whiteSpace: 'nowrap', zIndex: 5,
          }}>{tip.text}</div>
        )}
      </div>
    </div>
  );
}
