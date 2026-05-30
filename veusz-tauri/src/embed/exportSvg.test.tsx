import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the wasm-backed converter so the test doesn't touch WebGPU/wasm.
vi.mock('../components/plot/velloWasm', () => ({
  sceneToSvg: vi.fn(async () => '<svg data-testid="x"></svg>'),
  svgExportAvailable: vi.fn(async () => true),
}));

import { exportFigureAsSvg, downloadText, buildJpegPdf } from './exportSvg';
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

  it('buildJpegPdf assembles a valid single-page PDF embedding the image', () => {
    const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
    const pdf = buildJpegPdf(fakeJpeg, 200, 150, 600, 450);
    const ascii = new TextDecoder('latin1').decode(pdf);
    expect(ascii.startsWith('%PDF-1.4')).toBe(true);
    expect(ascii).toContain('/Subtype /Image');
    expect(ascii).toContain('/Filter /DCTDecode');
    expect(ascii).toContain('/MediaBox [0 0 600 450]');
    expect(ascii).toContain('/Im0 Do');
    expect(ascii.includes('xref') && ascii.trimEnd().endsWith('%%EOF')).toBe(true);
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
