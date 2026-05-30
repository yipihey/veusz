import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../plot/velloWasm', () => ({ svgExportAvailable: vi.fn(async () => true) }));
vi.mock('../../embed/exportSvg', () => ({ exportFigureAsSvg: vi.fn(async () => {}) }));

import { ExportDialog } from './ExportDialog';
import { exportFigureAsSvg } from '../../embed/exportSvg';

function fakeStore(currentPage = 0) {
  const state = {
    rpc: { file: { formats: async () => [{ extensions: ['pdf'], description: 'PDF' }] } },
    currentPage,
    tree: { children: [{}, {}] }, // 2 pages
    exportFile: vi.fn(async () => '/tmp/out.pdf'),
  };
  return Object.assign(() => state, { getState: () => state, setState: () => {} }) as never;
}

describe('ExportDialog SVG export', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a client-side SVG button and exports the current page', async () => {
    const store = fakeStore(1);
    render(<ExportDialog store={store} onClose={() => {}} notify={() => {}} />);
    const btn = await screen.findByTestId('export-svg');
    fireEvent.click(btn);
    await waitFor(() => expect(exportFigureAsSvg).toHaveBeenCalled());
    const [, opts] = (exportFigureAsSvg as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(opts).toMatchObject({ page: 1, filename: 'page2.svg' });
  });
});
