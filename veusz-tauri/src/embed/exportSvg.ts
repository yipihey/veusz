/**
 * Client-side vector SVG export for the embed.
 *
 * Pulls the current page's Scene IR from the runtime (`render.scene`), converts
 * it to a standalone SVG with the pure-Rust `veusz-paint-svg` backend (no Qt,
 * no server — see `components/plot/velloWasm.ts`), and triggers a download.
 * This is the browser counterpart of the desktop daemon's Qt `render.svg`.
 */

import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { sceneToSvg } from '../components/plot/velloWasm';

type Store = UseBoundStore<StoreApi<DocState>>;

export interface SvgExportOpts {
  page: number;
  /** Coordinate space for the SVG (sets its viewBox); markers/text scale with it. */
  width: number;
  height: number;
  dpi?: number;
  filename?: string;
}

/** Render `page` to SVG and download it. Throws if the runtime lacks the SVG
 *  binding (older published builds) — callers should gate on
 *  `svgExportAvailable()` and surface the error. */
export async function exportFigureAsSvg(store: Store, opts: SvgExportOpts): Promise<void> {
  const { rpc } = store.getState();
  const r = await rpc.render.scene(opts.page, opts.width, opts.height, opts.dpi ?? 96);
  const svg = await sceneToSvg(r.scene_b64, r.width, r.height);
  downloadText(svg, opts.filename ?? 'figure.svg', 'image/svg+xml');
}

/** Trigger a browser download of `text`. Exported for testing. */
export function downloadText(text: string, filename: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
