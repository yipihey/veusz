/**
 * The interactive plot surface for an embedded figure: renders the current
 * Scene IR to a canvas via the Vello/WebGPU WASM renderer. The pointer
 * interactions — drag-rectangle zoom, pan, hover tooltip, double-click reset,
 * two-finger pinch-zoom, and 3D rotate — come from the shared
 * `usePlotInteractions` hook (also used by the SVG renderer).
 *
 * The figure is laid out **contain-fit**: it scales to fit its container in
 * both dimensions (preserving the page aspect), centred, and renders at
 * device-pixel resolution (size × devicePixelRatio) so it stays crisp on
 * HiDPI screens. Input is unified on Pointer Events (mouse, touch, stylus).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { findScene3dPath } from './rotate3d';
import { usePlotInteractions } from './usePlotInteractions';
import { displayDpr, BASE_DPI } from './dpi';

type Store = UseBoundStore<StoreApi<DocState>>;

// Cap for the backing store's longest side. WebGPU MAX_TEXTURE_DIMENSION_2D is
// 8192 on every shipping browser, so 4096 is well within budget while keeping
// 3× retina renders of typical embed sizes from hitting the cap.
const MAX_RENDER_DIM = 4096;

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

  // Fixed backing-store resolution. The supersample tracks devicePixelRatio so
  // the WebGPU rasterisation lands at the user's actual physical pixels; dpi
  // scales with it so the figure's visual size in CSS px stays constant
  // (`render.scene` interprets `w/dpi` as page-size in inches).
  const dpr = useMemo(() => displayDpr(), []);
  const renderSize = useMemo(() => {
    let w = Math.max(1, Math.round(width * dpr));
    let h = Math.max(1, Math.round(height * dpr));
    const m = Math.max(w, h);
    if (m > MAX_RENDER_DIM) { const f = MAX_RENDER_DIM / m; w = Math.round(w * f); h = Math.round(h * f); }
    return { w, h };
  }, [width, height, dpr]);
  const renderDpi = Math.round(BASE_DPI * (renderSize.w / Math.max(width, 1)));

  // Path of the scene3d on the current page, if any — a drag then rotates the
  // scene (camera) instead of a 2D zoom/pan.
  const scene3dPath = useMemo(
    () => (tree ? findScene3dPath(tree.children[currentPage] ?? null) : null),
    [tree, currentPage],
  );

  // CSS display size of the fitted figure box (contain), updated on resize.
  const [disp, setDisp] = useState({ w: width, h: height });

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
          const err = e as { message?: string; stack?: string; toString?: () => string };
          const msg = err?.message || err?.toString?.() || String(e);
          console.error('embed scene render failed:', msg);
          if (err?.stack) console.error(err.stack);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [render?.sceneB64]);

  // Map a viewport coordinate to canvas backing-store px (accounts for the
  // contain-fit display scale and the dpr supersample).
  const toCanvasPx = (clientX: number, clientY: number): [number, number] => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return [
      (clientX - r.left) * (renderSize.w / (r.width || 1)),
      (clientY - r.top) * (renderSize.h / (r.height || 1)),
    ];
  };

  const { handlers, band, tip, preview, rotating } = usePlotInteractions({
    store, scene3dPath,
    toRenderPx: toCanvasPx,
    getPlotRect: () => canvasRef.current?.getBoundingClientRect() ?? null,
    requestRender: () => requestRender(currentPage, renderSize.w, renderSize.h, renderDpi),
  });

  return (
    <div ref={wrapRef} data-testid="embed-plot"
      style={{ position: 'relative', width: '100%', height: '100%', display: 'flex',
               alignItems: 'center', justifyContent: 'center', lineHeight: 0, overflow: 'hidden' }}
      onPointerLeave={handlers.onPointerLeave}>
      <div ref={figRef} style={{ position: 'relative', width: disp.w, height: disp.h }}>
        <canvas
          ref={canvasRef}
          width={renderSize.w}
          height={renderSize.h}
          data-testid="embed-canvas"
          onPointerDown={handlers.onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={handlers.onPointerUp}
          onPointerCancel={handlers.onPointerCancel}
          onDoubleClick={handlers.onDoubleClick}
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
            left: band.left, top: band.top, width: band.width, height: band.height,
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
