/**
 * The interactive plot surface for an embedded figure: renders the current
 * Scene IR to a canvas via the Vello/WebGPU WASM renderer, and adds navigate
 * interactions driven by the model — drag-rectangle zoom, pan, hover tooltip
 * (data values), and double-click reset. All "what does this pixel mean"
 * questions go through `render.pixel_to_data`; zoom/pan/reset are plain
 * `doc.set` edits of axis min/max, so they re-tick correctly.
 */

import { useEffect, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import {
  computeZoomOps, computeResetOps, computePanOps, formatTooltip, type AxisHit,
} from './navigate';

type Store = UseBoundStore<StoreApi<DocState>>;

const DRAG_THRESHOLD = 4; // px before a press counts as a drag

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
  // Rubber-band rectangle (canvas px) while zoom-dragging.
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [tip, setTip] = useState<{ left: number; top: number; text: string } | null>(null);
  // Axes discovered under the cursor — used to reset to Auto.
  const axisPaths = useRef<Set<string>>(new Set());
  // Drag state across handlers (not state: must not trigger re-render).
  const drag = useRef<null | {
    mode: 'zoom' | 'pan'; sx: number; sy: number; moved: boolean;
    from?: AxisHit[]; ranges?: Map<string, { min: number; max: number }>;
  }>(null);
  const lastHover = useRef(0);

  // Drive rendering whenever the document, page, size, or a setting changes.
  useEffect(() => {
    if (tree && tree.children.length > 0) {
      requestRender(currentPage, width, height);
    }
  }, [tree, values, currentPage, width, height, requestRender]);

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
  }, [render?.sceneB64, width, height]);

  const rpc = () => store.getState().rpc;

  // Map a mouse event to canvas (render) pixel coordinates.
  const toCanvasPx = (e: React.MouseEvent): [number, number] => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return [
      (e.clientX - r.left) * (width / r.width),
      (e.clientY - r.top) * (height / r.height),
    ];
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const [x, y] = toCanvasPx(e);
    const pan = e.shiftKey || e.button === 1;
    drag.current = { mode: pan ? 'pan' : 'zoom', sx: x, sy: y, moved: false };
    if (pan) {
      // Capture starting data values + current ranges for the pan math.
      void rpc().render.pixelToData(x, y).then(async (r) => {
        if (!drag.current) return;
        drag.current.from = r.axes as AxisHit[];
        const ranges = new Map<string, { min: number; max: number }>();
        for (const a of r.axes) {
          const vals = await rpc().doc.get([`${a.path}/min`, `${a.path}/max`]);
          const mn = Number(vals[`${a.path}/min`]);
          const mx = Number(vals[`${a.path}/max`]);
          if (Number.isFinite(mn) && Number.isFinite(mx)) ranges.set(a.path, { min: mn, max: mx });
        }
        drag.current.ranges = ranges;
      });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const [x, y] = toCanvasPx(e);
    const d = drag.current;
    if (d) {
      if (Math.abs(x - d.sx) > DRAG_THRESHOLD || Math.abs(y - d.sy) > DRAG_THRESHOLD) d.moved = true;
      if (d.mode === 'zoom' && d.moved) setBand({ x0: d.sx, y0: d.sy, x1: x, y1: y });
      return;
    }
    // Hover tooltip (throttled).
    const now = performance.now();
    if (now - lastHover.current < 40) return;
    lastHover.current = now;
    void rpc().render.pixelToData(x, y).then((r) => {
      r.axes.forEach((a) => axisPaths.current.add(a.path));
      const text = formatTooltip(r.axes as AxisHit[]);
      if (!text) { setTip(null); return; }
      const wrap = wrapRef.current;
      const wr = wrap ? wrap.getBoundingClientRect() : { left: 0, top: 0 };
      setTip({ left: e.clientX - wr.left + 12, top: e.clientY - wr.top + 12, text });
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    const d = drag.current;
    drag.current = null;
    setBand(null);
    if (!d || !d.moved) return;
    const [x, y] = toCanvasPx(e);
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

  const onDoubleClick = () => {
    if (!axisPaths.current.size) return;
    void applyAndRender(computeResetOps(axisPaths.current));
  };

  const applyAndRender = async (ops: { path: string; value: number | string }[]) => {
    await store.getState().setValues(ops);
    requestRender(currentPage, width, height);
  };

  return (
    <div ref={wrapRef} data-testid="embed-plot"
      style={{ position: 'relative', width: '100%', lineHeight: 0 }}
      onMouseLeave={() => { setTip(null); }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        data-testid="embed-canvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
        style={{ width: '100%', height: 'auto', display: 'block',
                 cursor: 'crosshair', touchAction: 'none' }}
      />
      {band && (
        <div data-testid="embed-zoomband" style={{
          position: 'absolute', pointerEvents: 'none', border: '1px solid #1f6feb',
          background: 'rgba(31,111,235,0.12)',
          left: `${Math.min(band.x0, band.x1) / width * 100}%`,
          top: `${Math.min(band.y0, band.y1) / height * 100}%`,
          width: `${Math.abs(band.x1 - band.x0) / width * 100}%`,
          height: `${Math.abs(band.y1 - band.y0) / height * 100}%`,
        }} />
      )}
      {tip && (
        <div data-testid="embed-tooltip" style={{
          position: 'absolute', left: tip.left, top: tip.top, pointerEvents: 'none',
          background: 'rgba(20,22,26,0.9)', color: '#fff', font: '12px system-ui',
          padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', zIndex: 5,
        }}>{tip.text}</div>
      )}
    </div>
  );
}
