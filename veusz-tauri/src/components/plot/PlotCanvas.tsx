import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ZoomCommands } from './PlotContextMenu';

/**
 * Plot canvas. Displays the latest PNG returned by `render.png` and
 * overlays a SVG layer for hover-highlight + selection rectangles.
 *
 * Pan & zoom: mouse-wheel zooms around the cursor, drag pans. The
 * underlying PNG is held at its native resolution and rescaled via
 * CSS transform; for crisp output above 100% the caller should
 * re-request `render.png` at the higher size (the `onViewportChange`
 * callback fires after a settled change so the host can do that).
 *
 * Coordinates the daemon sends in `bounds` are document-coordinate
 * (x1, y1, x2, y2) pairs in the same pixel space as the rendered
 * PNG. The component renders both the PNG and the overlay at the
 * same intrinsic size; CSS scaling is the only scaling.
 */
export interface PlotCanvasProps {
  /** base64 PNG, no data: prefix. Empty when rendering a client-side scene. */
  png: string;
  /** base64 Scene IR. When set, the plot is rasterised client-side via
   *  WASM/Vello onto a <canvas> instead of showing the server PNG. */
  sceneB64?: string;
  width: number;
  height: number;
  /** path → [x1, y1, x2, y2] in PNG-pixel coordinates. */
  bounds: Record<string, [number, number, number, number]>;
  /** Selected widget paths — every one gets a selection ring. */
  selected?: string[];
  onSelect?: (path: string | null) => void;
  /** Fires (debounced) after pan/zoom settles. */
  onViewportChange?: (view: { zoom: number; tx: number; ty: number }) => void;
  /** Optional wrapper that injects a right-click context menu around
   *  the canvas. Receives the canvas element plus the zoom command
   *  set (so the menu's Zoom items drive this canvas's local view).
   *  When omitted, the canvas renders bare (keeps the component
   *  store-agnostic for unit tests). */
  renderWithContextMenu?: (canvas: ReactNode, zoom: ZoomCommands) => ReactNode;
}

interface View {
  zoom: number;
  tx: number;
  ty: number;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 16;

export function PlotCanvas({
  png,
  sceneB64,
  width,
  height,
  bounds,
  selected,
  onSelect,
  onViewportChange,
  renderWithContextMenu,
}: PlotCanvasProps) {
  const [view, setView] = useState<View>({ zoom: 1, tx: 0, ty: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const src = `data:image/png;base64,${png}`;
  const useGpu = !!sceneB64;

  // Client-side render: rasterise the Scene IR onto the canvas via
  // WASM/Vello. Best-effort — failures are logged; the store gates this
  // path behind a successful WebGPU probe and otherwise sends a PNG.
  useEffect(() => {
    if (!sceneB64) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    void (async () => {
      try {
        const { renderSceneToCanvas } = await import('./velloWasm');
        if (!cancelled) await renderSceneToCanvas(canvas, sceneB64);
      } catch (e) {
        if (!cancelled) console.error('vello-wasm render failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [sceneB64, width, height]);

  // Convert client-space coords into PNG-pixel space, taking the
  // current view transform into account.
  const toLocal = (clientX: number, clientY: number): [number, number] => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return [0, 0];
    const cx = clientX - r.left;
    const cy = clientY - r.top;
    // Inverse of: pngX → (pngX * zoom) + tx
    return [(cx - view.tx) / view.zoom, (cy - view.ty) / view.zoom];
  };

  // Smallest enclosing rect at a coordinate.
  const hit = (px: number, py: number): string | null => {
    let best: string | null = null;
    let bestArea = Infinity;
    for (const [path, [x1, y1, x2, y2]] of Object.entries(bounds)) {
      if (px < x1 || py < y1 || px > x2 || py > y2) continue;
      if (path === '/' || path.split('/').length <= 2) continue;
      const area = (x2 - x1) * (y2 - y1);
      if (area < bestArea) {
        best = path;
        bestArea = area;
      }
    }
    return best;
  };

  // Settle-debounce so the viewport callback doesn't fire on every
  // wheel tick. 200ms is short enough to feel reactive, long enough
  // to coalesce a normal zoom gesture.
  useEffect(() => {
    if (!onViewportChange) return;
    const t = setTimeout(() => onViewportChange(view), 200);
    return () => clearTimeout(t);
  }, [view, onViewportChange]);

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    // Anchor zoom on cursor: keep the document-coord under the cursor stable.
    setView((v) => {
      const factor = Math.exp(-e.deltaY * 0.0015);
      const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const k = zoom / v.zoom;
      return {
        zoom,
        tx: cx - (cx - v.tx) * k,
        ty: cy - (cy - v.ty) * k,
      };
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 1 && !(e.button === 0 && e.shiftKey)) return; // middle-click or shift+left to pan
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      // Not dragging — update hover overlay
      setHovered(hit(...toLocal(e.clientX, e.clientY)));
      return;
    }
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setView((v) => ({ ...v, tx: dragRef.current!.tx + dx, ty: dragRef.current!.ty + dy }));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  const reset = () =>
    setView({ zoom: 1, tx: 0, ty: 0 });

  // Zoom commands for the context menu. Width/height/page fits use the
  // wrapper's measured size against the PNG's intrinsic size, centering
  // the result. Mirrors plotwindow.py's slotViewZoom* family.
  const zoomBy = (factor: number) =>
    setView((v) => ({ ...v, zoom: clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM) }));
  const fit = (mode: 'width' | 'height' | 'page') => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const zw = r.width / width;
    const zh = r.height / height;
    const zoom = clamp(
      mode === 'width' ? zw : mode === 'height' ? zh : Math.min(zw, zh),
      MIN_ZOOM, MAX_ZOOM,
    );
    setView({
      zoom,
      tx: (r.width - width * zoom) / 2,
      ty: (r.height - height * zoom) / 2,
    });
  };
  const zoomCommands: ZoomCommands = {
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(0.8),
    zoom11: reset,
    zoomWidth: () => fit('width'),
    zoomHeight: () => fit('height'),
    zoomPage: () => fit('page'),
  };

  const canvas = (
    <div
      ref={wrapRef}
      data-testid="plot-canvas"
      data-width={width}
      data-height={height}
      data-zoom={view.zoom.toFixed(3)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        minHeight: 240,
        touchAction: 'none',
      }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseLeave={() => setHovered(null)}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height,
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {useGpu ? (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            data-testid="plot-gpu-canvas"
            style={{ display: 'block', userSelect: 'none' }}
          />
        ) : (
          <img
            src={src}
            width={width}
            height={height}
            alt="plot"
            draggable={false}
            data-testid="plot-png"
            style={{ display: 'block', userSelect: 'none', imageRendering: 'auto' }}
          />
        )}
        <svg
          data-testid="plot-overlay"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
          onClick={(e) => onSelect?.(hit(...toLocal(e.clientX, e.clientY)))}
        >
          {(selected ?? []).map((sel) =>
            bounds[sel] ? (
              <Rect
                key={sel}
                path={sel}
                box={bounds[sel]}
                stroke="#1f6feb"
                strokeWidth={2 / view.zoom}
                data-testid={`overlay-selected-${sel}`}
              />
            ) : null,
          )}
          {hovered && !(selected ?? []).includes(hovered) && bounds[hovered] && (
            <Rect
              path={hovered}
              box={bounds[hovered]}
              stroke="#888"
              strokeWidth={1 / view.zoom}
              strokeDasharray={`${4 / view.zoom} ${2 / view.zoom}`}
              data-testid={`overlay-hover-${hovered}`}
            />
          )}
        </svg>
      </div>

      <div
        data-testid="plot-controls"
        style={{
          position: 'absolute',
          right: 8,
          top: 8,
          display: 'flex',
          gap: 4,
          background: 'rgba(255,255,255,0.85)',
          padding: 4,
          borderRadius: 4,
          fontSize: 12,
        }}
      >
        <button
          type="button"
          data-testid="plot-zoom-out"
          onClick={() => setView((v) => ({ ...v, zoom: clamp(v.zoom / 1.25, MIN_ZOOM, MAX_ZOOM) }))}
        >
          −
        </button>
        <button
          type="button"
          data-testid="plot-zoom-reset"
          onClick={reset}
          title="Reset view"
        >
          {Math.round(view.zoom * 100)}%
        </button>
        <button
          type="button"
          data-testid="plot-zoom-in"
          onClick={() => setView((v) => ({ ...v, zoom: clamp(v.zoom * 1.25, MIN_ZOOM, MAX_ZOOM) }))}
        >
          +
        </button>
      </div>
    </div>
  );

  return renderWithContextMenu
    ? <>{renderWithContextMenu(canvas, zoomCommands)}</>
    : canvas;
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function Rect({
  box,
  ...rest
}: {
  path: string;
  box: [number, number, number, number];
} & React.SVGProps<SVGRectElement>) {
  const [x1, y1, x2, y2] = box;
  return (
    <rect
      x={x1}
      y={y1}
      width={Math.max(0, x2 - x1)}
      height={Math.max(0, y2 - y1)}
      fill="none"
      {...rest}
    />
  );
}
