import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VeuszFigure } from './VeuszFigure';
import { createDocStore } from '../state/doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';

// jsdom has no navigator.gpu, so probeWebgpu() resolves false and the figure
// must show the WebGPU-required message rather than attempting to render
// (the browser path has no server-side fallback).
describe('VeuszFigure', () => {
  it('shows the WebGPU-required message when WebGPU is unavailable', async () => {
    const store = createDocStore(createRpc(mockTransport({
      'doc.tree': () => ({ name: '', path: '/', type: 'document', children: [] }),
      'data.list': () => [],
      'doc.can_undo': () => ({ can_undo: false, can_redo: false }),
      'doc.insert_targets': () => ({ targets: {} }),
      'file.recent_list': () => ({ paths: [] }),
      'plugins.list': () => ({ tools: [], datasets: [] }),
      'prefs.get': (p) => ({ key: (p as { key: string }).key, value: 'change' }),
      'prefs.set': () => ({ ok: true }),
    })));
    render(<VeuszFigure store={store} />);
    await waitFor(() => screen.getByTestId('veusz-needs-webgpu'));
    expect(screen.getByTestId('veusz-needs-webgpu').textContent).toMatch(/WebGPU/);
  });
});
