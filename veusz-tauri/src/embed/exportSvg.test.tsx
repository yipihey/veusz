import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the wasm-backed converter so the test doesn't touch WebGPU/wasm.
vi.mock('../components/plot/velloWasm', () => ({
  sceneToSvg: vi.fn(async () => '<svg data-testid="x"></svg>'),
  svgExportAvailable: vi.fn(async () => true),
}));

import { exportFigureAsSvg, downloadText } from './exportSvg';
import { sceneToSvg } from '../components/plot/velloWasm';

describe('exportFigureAsSvg', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => 'blob:x';
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
  });

  it('fetches the scene, converts it, and downloads an .svg', async () => {
    const scene = vi.fn(async () => ({ scene_b64: 'QUJD', width: 640, height: 480, bounds: {} }));
    const store = { getState: () => ({ rpc: { render: { scene } } }) } as never;
    const clicks: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this.download);
    });

    await exportFigureAsSvg(store, { page: 2, width: 640, height: 480, filename: 'My Plot.svg' });

    expect(scene).toHaveBeenCalledWith(2, 640, 480, 96);
    expect(sceneToSvg).toHaveBeenCalledWith('QUJD', 640, 480);
    expect(clicks).toEqual(['My Plot.svg']);
  });

  it('downloadText sets the download name and an object URL', () => {
    const created: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      created.push(`${this.download}|${this.href}`);
    });
    downloadText('<svg/>', 'a.svg', 'image/svg+xml');
    expect(created).toEqual(['a.svg|blob:x']);
  });
});
