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
  /** Pure-Rust Scene-IR -> SVG (no GPU). Present in builds that include the
   *  veusz-paint-svg binding; guarded at the call site for older runtimes. */
  scene_to_svg?: (scene: Uint8Array, width: number, height: number) => string;
}

/** Base URL for the runtime assets. Defaults to the locally-synced copy
 *  (good for the offline Tauri desktop app). Embeds on the web override it
 *  to the CORS-enabled, versioned GitHub Pages host published by
 *  .github/workflows/deploy-embed.yml, e.g.:
 *    globalThis.__VEUSZ_WASM_BASE__ =
 *      'https://yipihey.github.io/veusz/embed/v4.2.1/wasm'
 *  (Pages serves .wasm as application/wasm with access-control-allow-origin: *). */
function wasmBase(): string {
  const g = globalThis as unknown as { __VEUSZ_WASM_BASE__?: string };
  return (g.__VEUSZ_WASM_BASE__ ?? '/wasm').replace(/\/+$/, '');
}

let modulePromise: Promise<VelloModule> | null = null;

function loadModule(): Promise<VelloModule> {
  if (!modulePromise) {
    modulePromise = (async () => {
      const base = wasmBase();
      const mod = (await import(/* @vite-ignore */ `${base}/veusz_paint_wasm.js`)) as VelloModule;
      // Pass the wasm URL explicitly rather than relying on import.meta.url
      // resolution of the glue.
      await mod.default({ module_or_path: `${base}/veusz_paint_wasm_bg.wasm` });
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

/** Render a base64 Scene IR to an image Blob (PNG/JPEG) at `w`×`h` device
 *  pixels via WebGPU. Uses a temporary off-screen canvas attached hidden to
 *  the document (WebGPU needs a real canvas to present into). Default white
 *  background so exported figures aren't transparent. */
export async function renderSceneToImageBlob(
  sceneB64: string,
  w: number,
  h: number,
  type: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.92,
  bg: [number, number, number, number] = [1, 1, 1, 1],
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  canvas.style.cssText = 'position:absolute;left:-99999px;top:0;pointer-events:none';
  document.body.appendChild(canvas);
  try {
    await renderSceneBytesToCanvas(canvas, base64ToBytes(sceneB64), bg);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
    if (!blob) throw new Error('canvas.toBlob returned null');
    return blob;
  } finally {
    canvas.remove();
  }
}

/** True if the loaded runtime can emit vector SVG (the `veusz-paint-svg`
 *  binding shipped). False on older published runtimes. */
export async function svgExportAvailable(): Promise<boolean> {
  try {
    return typeof (await loadModule()).scene_to_svg === 'function';
  } catch {
    return false;
  }
}

/** Convert a base64 Scene IR to a standalone SVG string, entirely client-side
 *  (pure Rust, no Qt/GPU). Rejects if the runtime lacks the SVG binding. */
export async function sceneToSvg(
  sceneB64: string,
  width: number,
  height: number,
): Promise<string> {
  const mod = await loadModule();
  if (typeof mod.scene_to_svg !== 'function') {
    throw new Error('this runtime does not include the SVG exporter');
  }
  return mod.scene_to_svg(base64ToBytes(sceneB64), width, height);
}
