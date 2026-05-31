import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { VeuszFigure } from './VeuszFigure';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';

vi.mock('../components/plot/velloWasm', () => ({
  webgpuAvailable: () => Promise.resolve(true),
  renderSceneToCanvas: () => Promise.resolve(),
  svgExportAvailable: () => Promise.resolve(true),
  sceneToSvg: () => Promise.resolve('<svg/>'),
  renderSceneToImageBlob: () => Promise.resolve(new Blob(['x'], { type: 'image/png' })),
}));

function makeStore() {
  return createDocStore(createRpc(mockTransport({
    'doc.tree': () => ({ name: '', path: '/', type: 'document', children: [] }),
    'data.list': () => [],
    'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
    'doc.insert_targets': () => ({ targets: {} }),
    'file.recent_list': () => ({ paths: [] }),
    'plugins.list': () => ({ tools: [], datasets: [] }),
    'prefs.get': (p) => ({ key: (p as { key: string }).key, value: 'change' }),
    'prefs.set': () => ({ ok: true }),
    'render.scene': () => ({ scene_b64: 'QQ==', width: 700, height: 500, bounds: {} }),
  })));
}

beforeEach(() => { document.getElementById('veusz-embed-styles')?.remove(); URL.createObjectURL = () => 'blob:x'; URL.revokeObjectURL = () => {}; });

describe('VeuszFigure shell + editor modal', () => {
  it('shows the inline poster and a top-right Download + Edit toolbar', async () => {
    render(<VeuszFigure store={makeStore()} poster="p.png" vszUrl="f.vsz" title="My Plot" />);
    const fig = await screen.findByTestId('veusz-figure');
    expect(fig).toHaveClass('vz-fig');
    expect(screen.getByTestId('veusz-inline-poster')).toHaveAttribute('src', 'p.png');
    expect(screen.getByTestId('veusz-download')).toBeInTheDocument();
    expect(screen.getByTestId('veusz-edit-toggle')).toBeInTheDocument();
    // No modal until Edit is clicked.
    expect(screen.queryByTestId('veusz-modal')).toBeNull();
  });

  it('opens a resizable modal with the live plot + inspector on Edit, and closes', async () => {
    render(<VeuszFigure store={makeStore()} poster="p.png" vszUrl="f.vsz" title="My Plot" />);
    fireEvent.click(await screen.findByTestId('veusz-edit-toggle'));
    const modal = await screen.findByTestId('veusz-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByTestId('embed-plot')).toBeInTheDocument();
    expect(screen.getByTestId('veusz-modal-fullscreen')).toBeInTheDocument();
    // Editing controls.
    expect(screen.getByTestId('veusz-undo')).toBeInTheDocument();
    expect(screen.getByTestId('veusz-redo')).toBeInTheDocument();
    expect(screen.getByTestId('veusz-reset')).toBeInTheDocument();
    // Background scroll is locked while editing so the wheel scrolls the panel.
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByTestId('veusz-modal-close'));
    await waitFor(() => expect(screen.queryByTestId('veusz-modal')).toBeNull());
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('Download menu offers .vsz, SVG, PNG and PDF', async () => {
    render(<VeuszFigure store={makeStore()} poster="p.png" vszUrl="f.vsz" title="My Plot" />);
    fireEvent.click(await screen.findByTestId('veusz-download'));
    const menu = await screen.findByTestId('veusz-download-menu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByTestId('download-veusz')).toHaveAttribute('href', 'f.vsz');
    expect(screen.getByTestId('download-svg')).toBeInTheDocument();
    expect(screen.getByTestId('download-png')).toBeInTheDocument();
    expect(screen.getByTestId('download-pdf')).toBeInTheDocument();
  });

  it('opens the modal immediately when initialEditing is set', async () => {
    render(<VeuszFigure store={makeStore()} poster="p.png" initialEditing title="X" />);
    expect(await screen.findByTestId('veusz-modal')).toBeInTheDocument();
  });
});
