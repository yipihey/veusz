import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SvgPlot } from './SvgPlot';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';

// SvgPlot renders at logical size (no dpr supersample), so with a 300×200 stub
// rect and width/height 300×200 the mapping is 1:1 → data value = px/10.
vi.mock('../components/plot/velloWasm', () => ({
  webgpuAvailable: () => Promise.resolve(false),
  sceneToSvg: () => Promise.resolve('<svg></svg>'),
}));

const X = '/g/x';
const Y = '/g/y';

function makeStore(extra: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  return createDocStore(createRpc(mockTransport({
    'render.pixel_to_data': (p) => {
      const { x, y } = p as { x: number; y: number };
      return { axes: [
        { path: X, direction: 'horizontal', value: x / 10 },
        { path: Y, direction: 'vertical', value: y / 10 },
      ] };
    },
    ...extra,
  })));
}

// SvgPlot maps via the injected <svg> rect, falling back to the container when
// there is no <svg> (jsdom). Stub the container so the mapping is deterministic.
function stubRect(el: HTMLElement) {
  el.getBoundingClientRect = () => ({
    left: 0, top: 0, right: 300, bottom: 200, width: 300, height: 200, x: 0, y: 0,
    toJSON: () => {},
  });
}

const flush = () => new Promise((r) => setTimeout(r, 10));

describe('SvgPlot pointer interactions', () => {
  it('commits a zoom from a drag rectangle', async () => {
    const store = makeStore();
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    render(<SvgPlot store={store} width={300} height={200} />);
    const box = screen.getByTestId('embed-svg');
    stubRect(box);

    fireEvent.pointerDown(box, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(box, { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 200, clientY: 150 });
    fireEvent.pointerUp(box, { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 150 });

    await waitFor(() => expect(setValues).toHaveBeenCalled());
    expect(setValues.mock.calls[0][0]).toEqual(expect.arrayContaining([
      { path: `${X}/min`, value: 5 }, { path: `${X}/max`, value: 20 },
      { path: `${Y}/min`, value: 5 }, { path: `${Y}/max`, value: 15 },
    ]));
  });

  it('pans on a shift-drag (shifts axis ranges, preserving span)', async () => {
    const store = makeStore({
      'doc.get': (p) => {
        const { paths } = p as { paths: string[] };
        return Object.fromEntries(paths.map((k) => [k, k.endsWith('/max') ? 30 : 0]));
      },
    });
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    render(<SvgPlot store={store} width={300} height={200} />);
    const box = screen.getByTestId('embed-svg');
    stubRect(box);

    // shift-drag = pan; let the async from/ranges pre-fetch settle before release
    fireEvent.pointerDown(box, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, shiftKey: true, clientX: 100, clientY: 100 });
    await flush();
    fireEvent.pointerMove(box, { pointerId: 1, pointerType: 'mouse', buttons: 1, shiftKey: true, clientX: 150, clientY: 150 });
    fireEvent.pointerUp(box, { pointerId: 1, pointerType: 'mouse', shiftKey: true, clientX: 150, clientY: 150 });

    await waitFor(() => expect(setValues).toHaveBeenCalled());
    // from=(10,10) to=(15,15) delta=-5; ranges [0,30] → [-5,25]
    expect(setValues.mock.calls.at(-1)![0]).toEqual(expect.arrayContaining([
      { path: `${X}/min`, value: -5 }, { path: `${X}/max`, value: 25 },
      { path: `${Y}/min`, value: -5 }, { path: `${Y}/max`, value: 25 },
    ]));
  });

  it('shows a hover tooltip and resets on double-click', async () => {
    const store = makeStore();
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    render(<SvgPlot store={store} width={300} height={200} />);
    const box = screen.getByTestId('embed-svg');
    stubRect(box);

    // hover (mouse, no buttons) → tooltip with data values, and records the axes
    fireEvent.pointerMove(box, { pointerId: 1, pointerType: 'mouse', buttons: 0, clientX: 100, clientY: 100 });
    await waitFor(() => expect(screen.getByTestId('embed-tooltip')).toBeTruthy());
    expect(screen.getByTestId('embed-tooltip').textContent).toMatch(/10/);

    // double-click resets the hovered axes to Auto
    fireEvent.doubleClick(box);
    await waitFor(() => expect(setValues).toHaveBeenCalled());
    expect(setValues.mock.calls.at(-1)![0]).toEqual(expect.arrayContaining([
      { path: `${X}/min`, value: 'Auto' }, { path: `${X}/max`, value: 'Auto' },
      { path: `${Y}/min`, value: 'Auto' }, { path: `${Y}/max`, value: 'Auto' },
    ]));
  });

  it('rotates a 3D scene on drag instead of zooming', async () => {
    const sp = '/page1/scene3d1';
    const store = makeStore({
      'doc.get': (p) => {
        const { paths } = p as { paths: string[] };
        const v: Record<string, number> = {
          [`${sp}/xRotation`]: 0, [`${sp}/yRotation`]: 35, [`${sp}/zRotation`]: 0,
        };
        return Object.fromEntries(paths.map((k) => [k, v[k] ?? 0]));
      },
    });
    store.setState({ tree: {
      name: 'doc', path: '/', type: 'document', children: [
        { name: 'page1', path: '/page1', type: 'page', children: [
          { name: 'scene3d1', path: sp, type: 'scene3d', children: [] },
        ] },
      ],
    } });
    const setValues = vi.spyOn(store.getState(), 'setValues').mockResolvedValue(undefined);
    vi.spyOn(store.getState(), 'requestRender').mockImplementation(() => {});

    render(<SvgPlot store={store} width={300} height={200} />);
    const box = screen.getByTestId('embed-svg');
    stubRect(box);

    fireEvent.pointerDown(box, { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 50, clientY: 50 });
    await flush();
    fireEvent.pointerMove(box, { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 150, clientY: 50 });
    fireEvent.pointerUp(box, { pointerId: 1, pointerType: 'mouse', clientX: 150, clientY: 50 });

    await waitFor(() => expect(setValues).toHaveBeenCalled());
    expect(setValues.mock.calls.at(-1)![0].map((o) => o.path).sort()).toEqual([
      `${sp}/xRotation`, `${sp}/yRotation`, `${sp}/zRotation`,
    ]);
  });
});
