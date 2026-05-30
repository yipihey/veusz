import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { VeuszFigure } from './VeuszFigure';
import { EMBED_CSS, PANEL_DRAWER_MAX } from './embedStyles';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';

// Force the WebGPU probe to succeed so the figure renders its interactive body
// (the layout under test) instead of the no-WebGPU fallback message.
vi.mock('../components/plot/velloWasm', () => ({
  webgpuAvailable: () => Promise.resolve(true),
  renderSceneToCanvas: () => Promise.resolve(),
  svgExportAvailable: () => Promise.resolve(false),
  sceneToSvg: () => Promise.resolve('<svg/>'),
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
  })));
}

describe('VeuszFigure responsive layout', () => {
  beforeEach(() => {
    document.getElementById('veusz-embed-styles')?.remove();
  });

  it('injects a scoped, named-container stylesheet', async () => {
    render(<VeuszFigure store={makeStore()} />);
    await waitFor(() => screen.getByTestId('veusz-figure'));
    const sheet = document.getElementById('veusz-embed-styles');
    expect(sheet).not.toBeNull();
    // Named container + drawer breakpoint, all selectors namespaced under .vz-fig.
    expect(EMBED_CSS).toContain('container-name: veuszfig');
    expect(EMBED_CSS).toContain(`@container veuszfig (max-width: ${PANEL_DRAWER_MAX}px)`);
    expect(EMBED_CSS).not.toMatch(/^\s*\.vz-panel/m); // never an unscoped global
  });

  it('marks the figure as a query container and the panel as a drawer target', async () => {
    render(<VeuszFigure store={makeStore()} />);
    const fig = await screen.findByTestId('veusz-figure');
    expect(fig).toHaveClass('vz-fig');
    expect(fig.querySelector('.vz-body')).not.toBeNull();
    expect(fig.querySelector('.vz-plot')).not.toBeNull();

    // The edit panel is hidden until toggled, then carries the drawer class.
    expect(screen.queryByTestId('veusz-edit-panel')).toBeNull();
    fireEvent.click(screen.getByTestId('veusz-edit-toggle'));
    const panel = await screen.findByTestId('veusz-edit-panel');
    expect(panel).toHaveClass('vz-panel');

    // The in-drawer close affordance dismisses it (needed on small screens
    // where the toggle in the bar may be scrolled away).
    fireEvent.click(screen.getByTestId('veusz-edit-close'));
    await waitFor(() => expect(screen.queryByTestId('veusz-edit-panel')).toBeNull());
  });
});
