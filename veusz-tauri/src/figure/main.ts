/**
 * Standalone "figure embed" harness: render a pre-exported Veusz Scene IR in
 * the browser via Vello/WebGPU with NO Python daemon. This both validates the
 * WASM render path in a real browser and prototypes the static figure-embed
 * shape that web deployment needs.
 *
 *   pnpm dev      # then open http://localhost:5173/figure.html in Chrome
 *
 * Scene source: `?scene=<url>` (default `/samples/sample.scene.json`, written
 * by scripts; produce scenes via capture_document_scene / the render.scene RPC).
 */

import { webgpuAvailable, renderSceneBytesToCanvas } from '../components/plot/velloWasm';

const statusEl = document.getElementById('status') as HTMLElement;
const canvas = document.getElementById('figure') as HTMLCanvasElement;

function fail(msg: string): void {
  statusEl.textContent = msg;
  statusEl.className = 'error';
}

async function main(): Promise<void> {
  if (!(await webgpuAvailable())) {
    fail('WebGPU unavailable here. Open in Chrome or Safari 26+ '
       + '(Tauri WKWebView does not support WebGPU).');
    return;
  }

  const url = new URLSearchParams(location.search).get('scene')
    ?? '/samples/sample.scene.json';
  let bytes: Uint8Array;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    bytes = new Uint8Array(await resp.arrayBuffer());
  } catch (e) {
    fail(`Could not load scene ${url}: ${(e as Error).message}. `
       + 'Export one via render.scene / capture_document_scene.');
    return;
  }

  try {
    await renderSceneBytesToCanvas(canvas, bytes, [1, 1, 1, 1]);
    statusEl.textContent =
      `Rendered ${url} (${bytes.length} bytes) via Vello/WebGPU — no Python.`;
  } catch (e) {
    fail(`Render failed: ${(e as Error).message}`);
  }
}

void main();
