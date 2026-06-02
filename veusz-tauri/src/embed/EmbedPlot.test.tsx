import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmbedPlot } from './EmbedPlot';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';
import { setDisplayDprOverride } from './dpi';

// Pin the embed's effective devicePixelRatio for the test (JSDOM reports 1).
// The original tests were written against a hard-coded 2× supersample; pinning
// keeps the canvas-px ↔ client-px ratio deterministic.
beforeEach(() => setDisplayDprOverride(2));
afterEach(() => setDisplayDprOverride(null));

vi.mock('../components/plot/velloWasm', () => ({
  webgpuAvailable: () => Promise.resolve(true),
  renderSceneToCanvas: () => Promise.resolve(),
}));

const X = '/g/x';
const Y = '/g/y';

// A deterministic axis model: pixel value maps linearly to data (value = px/10)
// on both a horizontal and a vertical axis, so the navigate helpers produce
// predictable ops from a drag.
function makeStore() {
  return createDocStore(createRpc(mockTransport({
    'render.pixel_to_data': (p) => {
      const { x, y } = p as { x: number; y: number };
      return { axes: [
        { path: X, direction: 'horizontal', value: x / 10 },
        { path: Y, direction: 'vertical', value: y / 10 },
      ] };
    },
  })));
}

function stubRect(canvas: HTMLElement) {
  canvas.getBoundingClientRect = () => ({
    left: 0, top: 0, right: 300, bottom: 200, width: 300, height: 200, x: 0, y: 0,
    toJSON: () => {},
  });
}

describe('EmbedPlot pointer interactions', () => {
  it('commits a zoom from a drag rectangle (mouse)', async () => {
    const store = makeStore();
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    // width/height match the stubbed rect so render px == css px (factor 1).
    render(<EmbedPlot store={store} width={300} height={200} />);
    const canvas = screen.getByTestId('embed-canvas');
    stubRect(canvas);

    fireEvent.pointerDown(canvas, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 200, clientY: 150 });
    fireEvent.pointerUp(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 150 });

    await waitFor(() => expect(setValues).toHaveBeenCalled());
    const ops = setValues.mock.calls[0][0];
    // Backing is 2× the 300×200 display (devicePixelRatio pinned in beforeEach),
    // so canvas px = 2× client px → the mocked data values (px/10) double vs.
    // a 1:1 mapping.
    expect(ops).toEqual(expect.arrayContaining([
      { path: `${X}/min`, value: 10 }, { path: `${X}/max`, value: 40 },
      { path: `${Y}/min`, value: 10 }, { path: `${Y}/max`, value: 30 },
    ]));
  });

  it('rotates a 3D scene on drag instead of zooming', async () => {
    const sp = '/page1/scene3d1';
    const store = createDocStore(createRpc(mockTransport({
      'doc.get': (p) => {
        const { paths } = p as { paths: string[] };
        const v: Record<string, number> = {
          [`${sp}/xRotation`]: 0, [`${sp}/yRotation`]: 35, [`${sp}/zRotation`]: 0,
        };
        return Object.fromEntries(paths.map((k) => [k, v[k] ?? 0]));
      },
    })));
    // Put a scene3d on the current page so EmbedPlot routes drags to rotation.
    store.setState({ tree: {
      name: 'doc', path: '/', type: 'document', children: [
        { name: 'page1', path: '/page1', type: 'page', children: [
          { name: 'scene3d1', path: sp, type: 'scene3d', children: [] },
        ] },
      ],
    } });
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    render(<EmbedPlot store={store} width={300} height={200} />);
    const canvas = screen.getByTestId('embed-canvas');
    stubRect(canvas);

    fireEvent.pointerDown(canvas, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(canvas, { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 150, clientY: 50 });
    fireEvent.pointerUp(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 150, clientY: 50 });

    await waitFor(() => expect(setValues).toHaveBeenCalled());
    const ops = setValues.mock.calls.at(-1)![0];
    // The drag writes exactly the three scene rotation settings (not axis ranges).
    expect(ops.map((o) => o.path).sort()).toEqual([
      `${sp}/xRotation`, `${sp}/yRotation`, `${sp}/zRotation`,
    ]);
  });

  it('does not zoom on a click without drag', async () => {
    const store = makeStore();
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    render(<EmbedPlot store={store} width={300} height={200} />);
    const canvas = screen.getByTestId('embed-canvas');
    stubRect(canvas);

    fireEvent.pointerDown(canvas, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(canvas, { pointerId: 1, pointerType: 'mouse', clientX: 51, clientY: 51 });

    // Give any stray async a tick; nothing should have been written.
    await Promise.resolve();
    expect(setValues).not.toHaveBeenCalled();
  });
});
