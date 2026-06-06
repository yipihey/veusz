/**
 * A no-WebGPU plot surface. Rasterises the Scene IR to inline **SVG** via the
 * pure-Rust `scene_to_svg` WASM backend (the same one used for SVG export and
 * the notebook widget) instead of the Vello/WebGPU canvas. This lets the editor
 * render in *any* browser — and makes it headless-testable.
 *
 * The pointer interactions — drag-zoom, pan, hover tooltip, double-click reset,
 * pinch-zoom, and 3D rotate — come from the shared `usePlotInteractions` hook
 * (the same one EmbedPlot uses), so the SVG and canvas surfaces behave
 * identically. Used by the remote / live (e.g. IJulia) editor.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { sceneToSvg } from '../components/plot/velloWasm';
import { findScene3dPath } from './rotate3d';
import { usePlotInteractions } from './usePlotInteractions';
import { BASE_DPI } from './dpi';

type Store = UseBoundStore<StoreApi<DocState>>;

export function SvgPlot({
  store, width, height,
}: { store: Store; width: number; height: number }) {
  const render = store((s) => s.render);
  const tree = store((s) => s.tree);
  const values = store((s) => s.values);
  const currentPage = store((s) => s.currentPage);
  const requestRender = store((s) => s.requestRender);

  const boxRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  // SVG scales crisply, so render at the figure's logical size.
  const rw = Math.max(1, Math.round(width));
  const rh = Math.max(1, Math.round(height));

  const scene3dPath = useMemo(
    () => (tree ? findScene3dPath(tree.children[currentPage] ?? null) : null),
    [tree, currentPage],
  );

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

  // Make the injected <svg> fill the (aspect-locked) wrapper. We deliberately
  // size it to 100%/100% of the wrapper rather than letting its intrinsic
  // width/height drive layout: the svg is replaced on every scene render
  // (dangerouslySetInnerHTML), and an intrinsically-sized svg has a transient
  // frame at its raw pixel size before this effect runs — a pointer event in
  // that window would map through the wrong rect. The wrapper's aspect-ratio
  // box is stable across replacements, so geometry never flickers.
  useEffect(() => {
    const el = boxRef.current?.querySelector('svg') as SVGSVGElement | null;
    if (!el) return;
    if (!el.getAttribute('viewBox')) {
      el.setAttribute('viewBox', `0 0 ${render?.width ?? rw} ${render?.height ?? rh}`);
    }
    el.removeAttribute('width');
    el.removeAttribute('height');
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.display = 'block';
  }, [svg, render, rw, rh]);

  // Pointer position → render-space pixels (0..render.width/height), relative
  // to the stable wrapper rect (which the svg fills and the overlays align to).
  // Fall back to the container before the wrapper has a layout box (and in
  // jsdom, where getBoundingClientRect reports zero size).
  const svgRect = () => {
    const w = wrapRef.current?.getBoundingClientRect();
    if (w && w.width > 0 && w.height > 0) return w;
    return boxRef.current?.getBoundingClientRect() ?? null;
  };
  const toRender = (clientX: number, clientY: number): [number, number] => {
    const r = svgRect();
    const w = render?.width ?? rw;
    const h = render?.height ?? rh;
    if (!r) return [0, 0];
    return [((clientX - r.left) / r.width) * w, ((clientY - r.top) / r.height) * h];
  };

  const { handlers, band, tip, preview, rotating } = usePlotInteractions({
    store, scene3dPath,
    toRenderPx: toRender,
    getPlotRect: () => svgRect(),
    requestRender: () => requestRender(currentPage, rw, rh, BASE_DPI),
  });

  return (
    <div
      ref={boxRef}
      data-testid="embed-svg"
      style={{
        position: 'relative', width: '100%', touchAction: 'none', userSelect: 'none',
        cursor: scene3dPath ? (rotating ? 'grabbing' : 'grab') : 'crosshair',
      }}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onPointerLeave={handlers.onPointerLeave}
      onDoubleClick={handlers.onDoubleClick}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          // Lock the box to the figure aspect so its rect is stable across svg
          // replacements (the svg fills it). Pointer→data mapping reads this.
          aspectRatio: `${render?.width ?? rw} / ${render?.height ?? rh}`,
          transform: preview
            ? `translate(${preview.tx}px, ${preview.ty}px) scale(${preview.scale})` : undefined,
          transformOrigin: preview ? `${preview.ox}px ${preview.oy}px` : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {band && (
        <div data-testid="embed-zoomband" style={{
          position: 'absolute', pointerEvents: 'none', border: '1px solid #1f6feb',
          background: 'rgba(31,111,235,0.12)', zIndex: 2,
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
  );
}
