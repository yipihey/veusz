/**
 * Client-side Vello renderer over WebGPU, via the `veusz-paint-wasm`
 * crate (`crates/veusz-paint-wasm/pkg`). This is the "render a document
 * in the browser with no Python in the paint path" frontend.
 *
 * The ~2.9 MB wasm is lazy-loaded only when the user actually selects the
 * browser-WASM render path AND a WebGPU adapter is available, so the
 * default (server-rendered) experience pays nothing for it.
 *
 * Everything here degrades safely: `webgpuAvailable()` returns false on
 * any error (no `navigator.gpu`, no adapter), and `renderSceneToCanvas`
 * rejects if the module can't load — callers fall back to server-side
 * rendering.
 *
 * The wasm-bindgen glue + binary are copied into `public/wasm/` by
 * `scripts/sync-wasm.mjs` (run from the `dev`/`build` npm scripts), so Vite
 * serves them in dev and copies them into `dist/` on build. We dynamic-import
 * the served glue (`@vite-ignore` since it's a runtime static asset, not a
 * module to bundle) and init it with an explicit wasm URL — robust across
 * dev and the production bundle.
 */

interface VelloModule {
  default: (input?: unknown) => Promise<unknown>;
  render_scene_to_canvas: (
    canvas: HTMLCanvasElement,
    scene: Uint8Array,
    r: number,
    g: number,
    b: number,
    a: number,
  ) => Promise<void>;
}

const WASM_BASE = '/wasm';
const WASM_GLUE = `${WASM_BASE}/veusz_paint_wasm.js`;
const WASM_BINARY = `${WASM_BASE}/veusz_paint_wasm_bg.wasm`;

let modulePromise: Promise<VelloModule> | null = null;

function loadModule(): Promise<VelloModule> {
  if (!modulePromise) {
    modulePromise = (async () => {
      const glue = WASM_GLUE;
      const mod = (await import(/* @vite-ignore */ glue)) as VelloModule;
      // Pass the wasm URL explicitly rather than relying on import.meta.url
      // resolution of the glue served from public/.
      await mod.default({ module_or_path: WASM_BINARY });
      return mod;
    })().catch((e) => {
      // Reset so a later attempt can retry (e.g. after a fix/reload).
      modulePromise = null;
      throw e;
    });
  }
  return modulePromise;
}

/** True only when a usable WebGPU adapter is reachable from this context.
 *  Inside Tauri's WKWebView on macOS this is frequently false; callers
 *  must degrade to a server-side backend when it is. */
export async function webgpuAvailable(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as {
      gpu?: { requestAdapter(): Promise<unknown> };
    }).gpu;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter();
    return adapter != null;
  } catch {
    return false;
  }
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Rasterise raw Scene-IR JSON bytes onto `canvas` via Vello/WebGPU. Rejects
 *  if the wasm can't load or the GPU render fails. */
export async function renderSceneBytesToCanvas(
  canvas: HTMLCanvasElement,
  bytes: Uint8Array,
  bg: [number, number, number, number] = [0, 0, 0, 0],
): Promise<void> {
  const mod = await loadModule();
  await mod.render_scene_to_canvas(canvas, bytes, bg[0], bg[1], bg[2], bg[3]);
}

/** Rasterise a base64 Scene IR onto `canvas` via Vello/WebGPU. */
export async function renderSceneToCanvas(
  canvas: HTMLCanvasElement,
  sceneB64: string,
  bg: [number, number, number, number] = [0, 0, 0, 0],
): Promise<void> {
  await renderSceneBytesToCanvas(canvas, base64ToBytes(sceneB64), bg);
}
