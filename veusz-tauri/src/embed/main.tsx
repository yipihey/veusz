/**
 * `<veusz-figure>` custom element — the public embed API.
 *
 * Usage on any web page:
 *   <script type="module" src=".../veusz-embed.js"></script>
 *   <veusz-figure src="myplot.vsz" width="700" height="500"></veusz-figure>
 *
 * It boots the shared in-browser Veusz runtime (Pyodide), loads the `.vsz`
 * named by `src`, and mounts the interactive figure. The heavy runtime loads
 * once and is reused by every `<veusz-figure>` on the page.
 *
 * Attributes:
 *   src           URL of the .vsz document (required)
 *   width/height  render resolution in px (the canvas scales to fit)
 *   editable      "false" to hide the edit panel
 *   wasm-base     base URL of the Vello WASM renderer (defaults to /wasm)
 *   pyodide-index Pyodide distribution dir (defaults to jsDelivr)
 *   veusz-wheel   URL of the headless veusz wheel (CDN/bundle)
 */

import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { createRpc } from '../rpc/client';
import { createDocStore } from '../state/doc';
import { bootVeuszRuntime } from './runtime';
import { VeuszFigure } from './VeuszFigure';

class VeuszFigureElement extends HTMLElement {
  private root: Root | null = null;
  private mounted = false;

  connectedCallback() {
    if (this.mounted) return;
    this.mounted = true;
    void this.boot();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }

  private status(text: string) {
    this.replaceChildren();
    const d = document.createElement('div');
    d.setAttribute('data-testid', 'veusz-figure-status');
    d.style.cssText = 'font:14px system-ui;color:#555;padding:16px;'
      + 'border:1px solid #e2e4e8;border-radius:10px;';
    d.textContent = text;
    this.appendChild(d);
  }

  private async boot() {
    const src = this.getAttribute('src');
    if (!src) { this.status('veusz-figure: missing "src"'); return; }

    this.status('Loading…');
    try {
      const runtime = await bootVeuszRuntime({
        wasmBase: this.getAttribute('wasm-base') ?? undefined,
        pyodideIndexUrl: this.getAttribute('pyodide-index') ?? undefined,
        veuszWheelUrl: this.getAttribute('veusz-wheel') ?? undefined,
        onProgress: (s) => this.status(s),
      });

      const resp = await fetch(src);
      if (!resp.ok) throw new Error(`fetch ${src}: ${resp.status}`);
      await runtime.loadVsz(await resp.text());

      const store = createDocStore(createRpc(runtime.transport));

      this.replaceChildren();
      const container = document.createElement('div');
      this.appendChild(container);
      this.root = createRoot(container);
      this.root.render(createElement(VeuszFigure, {
        store,
        width: Number(this.getAttribute('width') ?? 600),
        height: Number(this.getAttribute('height') ?? 400),
        editable: this.getAttribute('editable') !== 'false',
        title: this.getAttribute('title') ?? undefined,
      }));
    } catch (e) {
      this.status(`Failed to load figure: ${(e as Error).message}`);
    }
  }
}

if (typeof customElements !== 'undefined'
    && !customElements.get('veusz-figure')) {
  customElements.define('veusz-figure', VeuszFigureElement);
}

export { VeuszFigureElement };
