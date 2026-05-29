import { vi, describe, it, expect, beforeEach } from 'vitest';
import { waitFor, fireEvent } from '@testing-library/react';

// Force the WebGPU-present path, and stub the heavy runtime so we can observe
// *when* it is requested. The stub resolves cleanly; the element then fails at
// the (unmocked) fetch and handles it internally — so nothing dangles into
// teardown. We only assert whether/when bootVeuszRuntime was called. vi.hoisted
// lets the spy exist before the hoisted vi.mock factories run.
const { bootSpy } = vi.hoisted(() => ({
  bootSpy: vi.fn(async () => undefined),
}));
vi.mock('../components/plot/velloWasm', () => ({
  webgpuAvailable: () => Promise.resolve(true),
}));
vi.mock('./runtime', () => ({ bootVeuszRuntime: bootSpy }));

import './main'; // registers the <veusz-figure> custom element

// Keep the element's document fetch deterministic and offline (it runs after
// the stubbed boot; a 404 is handled internally and ends the flow cleanly).
vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));

describe('<veusz-figure> progressive boot', () => {
  beforeEach(() => bootSpy.mockClear());

  it('defers Pyodide until the figure is activated', async () => {
    const el = document.createElement('veusz-figure');
    el.setAttribute('src', 'fig.vsz');
    el.setAttribute('poster', 'fig.poster.png');
    document.body.appendChild(el);

    // The poster appears with an activate control; the runtime is NOT booted.
    const btn = await waitFor(() => {
      const b = el.querySelector('[data-testid="veusz-figure-activate"]');
      if (!b) throw new Error('no activate control yet');
      return b as HTMLButtonElement;
    });
    expect(bootSpy).not.toHaveBeenCalled();

    // Only on the reader's click do we boot.
    fireEvent.click(btn);
    await waitFor(() => expect(bootSpy).toHaveBeenCalledTimes(1));
    el.remove();
  });

  it('boots immediately, without any interaction, when eager="true"', async () => {
    const el = document.createElement('veusz-figure');
    el.setAttribute('src', 'fig.vsz');
    el.setAttribute('poster', 'fig.poster.png');
    el.setAttribute('eager', 'true');
    document.body.appendChild(el);

    await waitFor(() => expect(bootSpy).toHaveBeenCalledTimes(1));
    el.remove();
  });
});
