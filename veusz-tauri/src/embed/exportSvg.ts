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
import { sceneToSvg, renderSceneToImageBlob } from '../components/plot/velloWasm';

type Store = UseBoundStore<StoreApi<DocState>>;

/** Supersample factor for raster (PNG/PDF) export so figures are crisp. */
const RASTER_SCALE = 2;

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

/** Render `page` to a raster PNG and download it (supersampled for crispness). */
export async function exportFigureAsPng(store: Store, opts: SvgExportOpts): Promise<void> {
  const { rpc } = store.getState();
  const w = opts.width * RASTER_SCALE, h = opts.height * RASTER_SCALE;
  const r = await rpc.render.scene(opts.page, w, h, (opts.dpi ?? 96) * RASTER_SCALE);
  const blob = await renderSceneToImageBlob(r.scene_b64, r.width, r.height, 'image/png');
  downloadBlob(blob, opts.filename ?? 'figure.png');
}

/** Render `page` and download a single-page PDF embedding it (raster, JPEG).
 *  Vector PDF would need a wasm font story; this gives a portable PDF today. */
export async function exportFigureAsPdf(store: Store, opts: SvgExportOpts): Promise<void> {
  const { rpc } = store.getState();
  const w = opts.width * RASTER_SCALE, h = opts.height * RASTER_SCALE;
  const r = await rpc.render.scene(opts.page, w, h, (opts.dpi ?? 96) * RASTER_SCALE);
  const jpeg = await renderSceneToImageBlob(r.scene_b64, r.width, r.height, 'image/jpeg');
  const bytes = new Uint8Array(await jpeg.arrayBuffer());
  // Page in points at 72dpi from the logical (unscaled) size.
  const pdf = buildJpegPdf(bytes, r.width, r.height, opts.width, opts.height);
  downloadBlob(new Blob([pdf as BlobPart], { type: 'application/pdf' }), opts.filename ?? 'figure.pdf');
}

/** Trigger a browser download of `text`. Exported for testing. */
export function downloadText(text: string, filename: string, mime: string): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

/** Trigger a browser download of a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Build a minimal single-page PDF (1.4) embedding `jpeg` (DCTDecode) full-page.
 *  `pxW`/`pxH` are the image pixels; `ptW`/`ptH` the page size in points. */
export function buildJpegPdf(
  jpeg: Uint8Array, pxW: number, pxH: number, ptW: number, ptH: number,
): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (s: string | Uint8Array) => {
    const b = typeof s === 'string' ? enc.encode(s) : s;
    parts.push(b); pos += b.length;
  };
  const obj = (n: number, body: string) => { offsets[n] = pos; push(`${n} 0 obj\n${body}\nendobj\n`); };

  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] `
       + `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  // Image XObject: raw JPEG stream.
  offsets[4] = pos;
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} `
     + `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  push(jpeg); push('\nendstream\nendobj\n');
  const content = `q\n${ptW} 0 0 ${ptH} 0 0 cm\n/Im0 Do\nQ\n`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}endstream`);

  const xrefPos = pos;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  push(xref);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  const out = new Uint8Array(pos);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
