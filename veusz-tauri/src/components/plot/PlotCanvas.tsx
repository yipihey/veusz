import { useState } from 'react';

/**
 * Plot canvas. Displays the latest PNG returned by `render.png` and
 * overlays a SVG layer for hover-highlight + selection rectangles.
 *
 * Coordinates the daemon sends in `bounds` are document-coordinate
 * (x1, y1, x2, y2) pairs in the same pixel space as the rendered PNG.
 * The component renders both the PNG and the overlay at the same
 * intrinsic size; CSS scaling is up to the caller.
 */
export interface PlotCanvasProps {
  /** base64 PNG, no data: prefix. */
  png: string;
  width: number;
  height: number;
  /** path → [x1, y1, x2, y2] in PNG-pixel coordinates. */
  bounds: Record<string, [number, number, number, number]>;
  selected?: string;
  onSelect?: (path: string | null) => void;
}

export function PlotCanvas({
  png,
  width,
  height,
  bounds,
  selected,
  onSelect,
}: PlotCanvasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const src = `data:image/png;base64,${png}`;

  // Smallest enclosing rect at a coordinate — used for click/hover
  // hit-tests done locally rather than round-tripping to the daemon
  // (which we still expose via `hittest.point` for the authoritative
  // answer).
  const hit = (x: number, y: number): string | null => {
    let best: string | null = null;
    let bestArea = Infinity;
    for (const [path, [x1, y1, x2, y2]] of Object.entries(bounds)) {
      if (x < x1 || y < y1 || x > x2 || y > y2) continue;
      // Ignore the document root and outermost page so we don't
      // hijack clicks meant for inner widgets.
      if (path === '/' || path.split('/').length <= 2) continue;
      const area = (x2 - x1) * (y2 - y1);
      if (area < bestArea) {
        best = path;
        bestArea = area;
      }
    }
    return best;
  };

  const toLocal = (e: React.MouseEvent<SVGElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = width / r.width;
    const sy = height / r.height;
    return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy];
  };

  return (
    <div
      data-testid="plot-canvas"
      data-width={width}
      data-height={height}
      style={{ position: 'relative', width, height }}
    >
      <img
        src={src}
        width={width}
        height={height}
        alt="plot"
        draggable={false}
        data-testid="plot-png"
        style={{ display: 'block', userSelect: 'none' }}
      />
      <svg
        data-testid="plot-overlay"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
        onMouseMove={(e) => setHovered(hit(...toLocal(e)))}
        onMouseLeave={() => setHovered(null)}
        onClick={(e) => onSelect?.(hit(...toLocal(e)))}
      >
        {selected && bounds[selected] && (
          <Rect
            path={selected}
            box={bounds[selected]}
            stroke="#1f6feb"
            strokeWidth={2}
            data-testid={`overlay-selected-${selected}`}
          />
        )}
        {hovered && hovered !== selected && bounds[hovered] && (
          <Rect
            path={hovered}
            box={bounds[hovered]}
            stroke="#888"
            strokeWidth={1}
            strokeDasharray="4 2"
            data-testid={`overlay-hover-${hovered}`}
          />
        )}
      </svg>
    </div>
  );
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
