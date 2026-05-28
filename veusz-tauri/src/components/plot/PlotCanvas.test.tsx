import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlotCanvas } from './PlotCanvas';

// 1x1 transparent PNG, base64. Real bytes — vitest renders it but
// happy-dom doesn't actually decode the image.
const ONE_PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const BOUNDS = {
  '/': [0, 0, 400, 300] as [number, number, number, number],
  '/page1': [10, 10, 390, 290] as [number, number, number, number],
  '/page1/graph1': [50, 50, 350, 250] as [number, number, number, number],
  '/page1/graph1/xy1': [80, 80, 320, 220] as [number, number, number, number],
};

function setBoundingBox(width = 400, height = 300) {
  // happy-dom's getBoundingClientRect returns zeros; the canvas
  // converts client-space coords to PNG-space via the rect, so stub
  // it to the natural size for deterministic coords.
  Element.prototype.getBoundingClientRect = function () {
    return { left: 0, top: 0, right: width, bottom: height, width, height,
             x: 0, y: 0, toJSON() { return this; } } as DOMRect;
  };
}

describe('PlotCanvas', () => {
  beforeEach(() => setBoundingBox());

  it('renders the PNG with the correct intrinsic size', () => {
    render(<PlotCanvas png={ONE_PX} width={400} height={300} bounds={BOUNDS} />);
    const canvas = screen.getByTestId('plot-canvas');
    expect(canvas.dataset.width).toBe('400');
    expect(canvas.dataset.height).toBe('300');
    expect(screen.getByTestId('plot-png')).toHaveAttribute(
      'src',
      `data:image/png;base64,${ONE_PX}`,
    );
  });

  it('draws the selection overlay for the selected path', () => {
    render(
      <PlotCanvas
        png={ONE_PX} width={400} height={300} bounds={BOUNDS}
        selected={['/page1/graph1/xy1']}
      />,
    );
    expect(screen.getByTestId('overlay-selected-/page1/graph1/xy1')).toBeInTheDocument();
  });

  it('hover paints the hover overlay; leave clears it', () => {
    render(<PlotCanvas png={ONE_PX} width={400} height={300} bounds={BOUNDS} />);
    const overlay = screen.getByTestId('plot-overlay');
    // Move into the xy1 bounding box (innermost; should win the hit test)
    fireEvent.pointerMove(overlay, { clientX: 200, clientY: 150 });
    expect(screen.getByTestId('overlay-hover-/page1/graph1/xy1')).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByTestId('plot-canvas'));
    expect(screen.queryByTestId(/^overlay-hover-/)).not.toBeInTheDocument();
  });

  it('click on a widget calls onSelect with the deepest path', () => {
    const onSelect = vi.fn();
    render(
      <PlotCanvas
        png={ONE_PX} width={400} height={300} bounds={BOUNDS}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByTestId('plot-overlay'), { clientX: 200, clientY: 150 });
    expect(onSelect).toHaveBeenCalledWith('/page1/graph1/xy1');
  });

  it('click outside any widget calls onSelect with null', () => {
    const onSelect = vi.fn();
    render(
      <PlotCanvas
        png={ONE_PX} width={400} height={300} bounds={BOUNDS}
        onSelect={onSelect}
      />,
    );
    // (5, 5) is outside even the page bounds
    fireEvent.click(screen.getByTestId('plot-overlay'), { clientX: 5, clientY: 5 });
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('hover does not duplicate the selection overlay when both target the same path', () => {
    render(
      <PlotCanvas
        png={ONE_PX} width={400} height={300} bounds={BOUNDS}
        selected={['/page1/graph1/xy1']}
      />,
    );
    fireEvent.pointerMove(screen.getByTestId('plot-overlay'), { clientX: 200, clientY: 150 });
    expect(screen.queryByTestId('overlay-hover-/page1/graph1/xy1')).not.toBeInTheDocument();
    expect(screen.getByTestId('overlay-selected-/page1/graph1/xy1')).toBeInTheDocument();
  });

  it('zoom-in button increases zoom and updates the readout', () => {
    render(<PlotCanvas png={ONE_PX} width={400} height={300} bounds={BOUNDS} />);
    const canvas = screen.getByTestId('plot-canvas');
    expect(canvas.dataset.zoom).toBe('1.000');
    fireEvent.click(screen.getByTestId('plot-zoom-in'));
    expect(parseFloat(canvas.dataset.zoom!)).toBeCloseTo(1.25, 3);
    expect(screen.getByTestId('plot-zoom-reset')).toHaveTextContent('125%');
  });

  it('zoom-reset returns to 100% and zero pan', () => {
    render(<PlotCanvas png={ONE_PX} width={400} height={300} bounds={BOUNDS} />);
    fireEvent.click(screen.getByTestId('plot-zoom-in'));
    fireEvent.click(screen.getByTestId('plot-zoom-in'));
    fireEvent.click(screen.getByTestId('plot-zoom-reset'));
    expect(screen.getByTestId('plot-canvas').dataset.zoom).toBe('1.000');
  });

  it('zoom is clamped at the lower bound', () => {
    render(<PlotCanvas png={ONE_PX} width={400} height={300} bounds={BOUNDS} />);
    for (let i = 0; i < 50; i++) {
      fireEvent.click(screen.getByTestId('plot-zoom-out'));
    }
    expect(parseFloat(screen.getByTestId('plot-canvas').dataset.zoom!))
      .toBeGreaterThanOrEqual(0.1);
  });

  it('hit-test honors the current pan & zoom', () => {
    // At 2x zoom panned by 0, a click at client (200,150) should land
    // at PNG-pixel (100,75) — inside graph1 but outside xy1's box.
    const onSelect = vi.fn();
    render(
      <PlotCanvas
        png={ONE_PX} width={400} height={300} bounds={BOUNDS}
        onSelect={onSelect}
      />,
    );
    // 1.25 ** 3 ≈ 1.95
    fireEvent.click(screen.getByTestId('plot-zoom-in'));
    fireEvent.click(screen.getByTestId('plot-zoom-in'));
    fireEvent.click(screen.getByTestId('plot-zoom-in'));
    onSelect.mockClear();
    fireEvent.click(screen.getByTestId('plot-overlay'), { clientX: 200, clientY: 150 });
    const callArg = onSelect.mock.calls[0]?.[0];
    // Whichever widget the inverse-transformed coord lands on, it
    // should NOT be xy1 (which would only match at the original
    // unzoomed location).
    expect(callArg).not.toBe('/page1/graph1/xy1');
  });

  it('ignores the document root and outer page in hit-tests', () => {
    const onSelect = vi.fn();
    // Click in a spot covered ONLY by / and /page1 (not graph1, not xy1)
    render(
      <PlotCanvas
        png={ONE_PX} width={400} height={300}
        bounds={{
          '/': [0, 0, 400, 300],
          '/page1': [10, 10, 390, 290],
        }}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByTestId('plot-overlay'), { clientX: 20, clientY: 20 });
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
