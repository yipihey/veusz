/**
 * A no-WebGPU plot surface. Rasterises the Scene IR to inline **SVG** via the
 * pure-Rust `scene_to_svg` WASM backend (the same one used for SVG export and
 * the notebook widget) instead of the Vello/WebGPU canvas. This lets the editor
 * render in *any* browser — and makes it headless-testable.
 *
 * Drag a rectangle to zoom; double-click to reset (the zoom/reset logic is the
 * renderer-agnostic `navigate.ts` shared with EmbedPlot). Precise control is
 * via the Inspector. Used by the remote / live (e.g. IJulia) editor, where
 * WebGPU may be unavailable.
 */

import { useEffect, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { sceneToSvg } from '../components/plot/velloWasm';
import { computeZoomOps, computeResetOps, type AxisHit } from './navigate';
import { BASE_DPI } from './dpi';

type Store = UseBoundStore<StoreApi<DocState>>;
const DRAG_THRESHOLD = 4;

export function SvgPlot({
  store, width, height,
}: { store: Store; width: number; height: number }) {
  const render = store((s) => s.render);
  const tree = store((s) => s.tree);
  const values = store((s) => s.values);
  const currentPage = store((s) => s.currentPage);
  const requestRender = store((s) => s.requestRender);

  const boxRef = useRef<HTMLDivElement>(null);
  const rubberRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number } | null>(null);
  const [svg, setSvg] = useState('');

  // SVG scales crisply, so render at the figure's logical size.
  const rw = Math.max(1, Math.round(width));
  const rh = Math.max(1, Math.round(height));

  // Fetch a fresh scene whenever the document / data / page changes.
  useEffect(() => {
    if (tree && tree.children.length > 0) requestRender(currentPage, rw, rh, BASE_DPI);
  }, [tree, values, currentPage, rw, rh, requestRender]);

  // Rasterise the current Scene IR to SVG.
  useEffect(() => {
    const b64 = render?.sceneB64;
    if (!b64) return;
    let alive = true;
    void sceneToSvg(b64, render!.width, render!.height)
      .then((s) => { if (alive) setSvg(s); })
      .catch(() => { /* leave the previous frame */ });
    return () => { alive = false; };
  }, [render]);

  // Make the injected <svg> responsive (fit width, keep aspect).
  useEffect(() => {
    const el = boxRef.current?.querySelector('svg') as SVGSVGElement | null;
    if (!el) return;
    if (!el.getAttribute('viewBox')) {
      el.setAttribute('viewBox', `0 0 ${render?.width ?? rw} ${render?.height ?? rh}`);
    }
    el.removeAttribute('width');
    el.removeAttribute('height');
    el.style.maxWidth = '100%';
    el.style.height = 'auto';
    el.style.display = 'block';
  }, [svg, render, rw, rh]);

  const rpc = () => store.getState().rpc;

  // Pointer position → render-space pixels (0..render.width/height).
  const toRender = (clientX: number, clientY: number): [number, number] => {
    const el = (boxRef.current?.querySelector('svg') ?? boxRef.current) as Element | null;
    const r = el!.getBoundingClientRect();
    const w = render?.width ?? rw;
    const h = render?.height ?? rh;
    return [((clientX - r.left) / r.width) * w, ((clientY - r.top) / r.height) * h];
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !svg) return;
    drag.current = { sx: e.clientX, sy: e.clientY };
    const b = boxRef.current!.getBoundingClientRect();
    const rb = rubberRef.current!;
    rb.style.display = 'block';
    rb.style.left = `${e.clientX - b.left}px`;
    rb.style.top = `${e.clientY - b.top}px`;
    rb.style.width = '0px';
    rb.style.height = '0px';
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const b = boxRef.current!.getBoundingClientRect();
    const rb = rubberRef.current!;
    rb.style.left = `${Math.min(d.sx, e.clientX) - b.left}px`;
    rb.style.top = `${Math.min(d.sy, e.clientY) - b.top}px`;
    rb.style.width = `${Math.abs(e.clientX - d.sx)}px`;
    rb.style.height = `${Math.abs(e.clientY - d.sy)}px`;
  };

  const onPointerUp = async (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    rubberRef.current!.style.display = 'none';
    if (!d || !svg) return;
    if (Math.abs(e.clientX - d.sx) < DRAG_THRESHOLD || Math.abs(e.clientY - d.sy) < DRAG_THRESHOLD) return;
    const [x0, y0] = toRender(d.sx, d.sy);
    const [x1, y1] = toRender(e.clientX, e.clientY);
    const [a, b] = await Promise.all([rpc().render.pixelToData(x0, y0), rpc().render.pixelToData(x1, y1)]);
    const ops = computeZoomOps(a.axes as AxisHit[], b.axes as AxisHit[]);
    if (ops.length) {
      await store.getState().setValues(ops);
      requestRender(currentPage, rw, rh, BASE_DPI);
    }
  };

  const onDoubleClick = async (e: React.MouseEvent) => {
    const [x, y] = toRender(e.clientX, e.clientY);
    const rr = await rpc().render.pixelToData(x, y);
    const ops = computeResetOps((rr.axes as AxisHit[]).map((a) => a.path));
    if (ops.length) {
      await store.getState().setValues(ops);
      requestRender(currentPage, rw, rh, BASE_DPI);
    }
  };

  return (
    <div
      ref={boxRef}
      data-testid="embed-svg"
      style={{ position: 'relative', width: '100%', touchAction: 'none', userSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <div
        ref={rubberRef}
        style={{
          position: 'absolute', display: 'none', pointerEvents: 'none',
          border: '1px solid #1f6feb', background: 'rgba(31,111,235,0.12)', zIndex: 2,
        }}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <div style={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
