import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';
import './main'; // registers the <veusz-figure> custom element

// jsdom has no navigator.gpu, so webgpuAvailable() resolves false. The element
// must then take its no-WebGPU path WITHOUT booting the heavy Pyodide runtime:
// show the poster when one is given, or the WebGPU message otherwise.
describe('<veusz-figure> no-WebGPU fallback', () => {
  it('shows the poster image (with a note) instead of a blank box', async () => {
    const el = document.createElement('veusz-figure');
    el.setAttribute('src', 'fig.vsz');
    el.setAttribute('poster', 'fig.poster.png');
    el.setAttribute('title', 'My figure');
    document.body.appendChild(el);

    await waitFor(() =>
      expect(el.querySelector('[data-testid="veusz-figure-poster"]')).not.toBeNull());
    const img = el.querySelector('img');
    expect(img?.getAttribute('src')).toBe('fig.poster.png');
    expect(img?.getAttribute('alt')).toBe('My figure');
    expect(el.querySelector('[data-testid="veusz-figure-poster-note"]')?.textContent)
      .toMatch(/WebGPU/);
    el.remove();
  });

  it('falls back to the WebGPU-required message when no poster is given', async () => {
    const el = document.createElement('veusz-figure');
    el.setAttribute('src', 'fig.vsz');
    document.body.appendChild(el);

    await waitFor(() =>
      expect(el.querySelector('[data-testid="veusz-figure-status"]')).not.toBeNull());
    expect(el.querySelector('[data-testid="veusz-figure-status"]')?.textContent)
      .toMatch(/WebGPU/);
    expect(el.querySelector('[data-testid="veusz-figure-poster"]')).toBeNull();
    el.remove();
  });
});
