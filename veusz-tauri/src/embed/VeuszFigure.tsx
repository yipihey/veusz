/**
 * The embeddable figure shell. Inline it shows a static preview (the poster,
 * refreshed from the live document after edits) with a discrete top-right
 * toolbar: a Download menu (.vsz / SVG / PNG / PDF) and an Edit button. Edit
 * opens a roomy, resizable, full-screen-capable modal (EditorModal) with the
 * live plot + the desktop Tree + Inspector — so editing is comfortable even
 * when the figure sits in a small gallery card.
 *
 * Requires WebGPU (Chrome / Safari 26+); shows a clear message otherwise.
 */

import { useEffect, useRef, useState } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import { EmbedPlot } from './EmbedPlot';
import { EditorModal } from './EditorModal';
import { DownloadMenu, type DownloadItem } from './DownloadMenu';
import { EmbedToolbar } from './EmbedToolbar';
import { makeEmbedActionCtx } from './embedActionCtx';
import { ensureEmbedStyles } from './embedStyles';
import { svgExportAvailable, renderSceneToImageBlob } from '../components/plot/velloWasm';
import { exportFigureAsSvg, exportFigureAsPng, exportFigureAsPdf } from './exportSvg';
import { displayDpr, BASE_DPI } from './dpi';

ensureEmbedStyles();

type Store = UseBoundStore<StoreApi<DocState>>;

export interface VeuszFigureProps {
  store: Store;
  width?: number;
  height?: number;
  editable?: boolean;
  title?: string;
  /** Static preview shown inline before/after editing. */
  poster?: string;
  /** URL of the source .vsz, offered in the Download menu. */
  vszUrl?: string;
  /** Open the editor modal immediately on mount (e.g. user clicked Edit). */
  initialEditing?: boolean;
}

export function VeuszFigure({
  store, width = 700, height = 500, editable = true, title, poster, vszUrl, initialEditing,
}: VeuszFigureProps) {
  const error = store((s) => s.error);
  const webgpu = store((s) => s.webgpuAvailable);
  const currentPage = store((s) => s.currentPage);
  const [editing, setEditing] = useState(!!initialEditing);
  const [canSvg, setCanSvg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(poster);
  const objUrl = useRef<string | null>(null);

  useEffect(() => {
    ensureEmbedStyles();
    const s = store.getState();
    void s.setBackend('vello-wasm');
    void s.probeWebgpu();
    void s.loadPlotPrefs();
    void s.refreshAll();
    return s.subscribeToDaemon();
  }, [store]);

  useEffect(() => {
    let alive = true;
    void svgExportAvailable().then((ok) => { if (alive) setCanSvg(ok); });
    return () => { alive = false; };
  }, []);

  useEffect(() => () => { if (objUrl.current) URL.revokeObjectURL(objUrl.current); }, []);

  const fname = (ext: string) => `${(title ?? 'figure').replace(/\s+/g, '_')}.${ext}`;

  const run = async (fn: () => Promise<void>, what: string) => {
    setBusy(true);
    try { await fn(); }
    catch (e) { store.setState({ error: `${what} failed: ${(e as Error).message}` }); }
    finally { setBusy(false); }
  };

  // After editing, refresh the inline preview from the (possibly edited) doc so
  // it isn't stale. Best-effort; failure just leaves the previous preview.
  // Render at the display's pixel density so the static <img> doesn't look
  // soft on retina screens — the browser scales the image down to the
  // figure's CSS width without losing detail.
  const refreshPreview = async () => {
    try {
      const dpr = displayDpr();
      const rw = Math.round(width * dpr);
      const rh = Math.round(height * dpr);
      const r = await store.getState().rpc.render.scene(currentPage, rw, rh, Math.round(BASE_DPI * dpr));
      const blob = await renderSceneToImageBlob(r.scene_b64, r.width, r.height, 'image/png');
      const url = URL.createObjectURL(blob);
      if (objUrl.current) URL.revokeObjectURL(objUrl.current);
      objUrl.current = url;
      setPreviewUrl(url);
    } catch { /* keep previous preview */ }
  };

  const closeModal = () => { setEditing(false); if (previewUrl !== undefined) void refreshPreview(); };

  const downloadItems = (): DownloadItem[] => {
    const items: DownloadItem[] = [];
    if (vszUrl) items.push({ label: 'Veusz', href: vszUrl, download: fname('vsz'), hint: '.vsz' });
    if (canSvg) items.push({ label: 'SVG', hint: 'vector', onSelect: () => void run(() => exportFigureAsSvg(store, { page: currentPage, width, height, filename: fname('svg') }), 'SVG export') });
    items.push({ label: 'PNG', hint: 'image', onSelect: () => void run(() => exportFigureAsPng(store, { page: currentPage, width, height, filename: fname('png') }), 'PNG export') });
    items.push({ label: 'PDF', hint: 'page', onSelect: () => void run(() => exportFigureAsPdf(store, { page: currentPage, width, height, filename: fname('pdf') }), 'PDF export') });
    return items;
  };

  if (webgpu === false) {
    return (
      <div data-testid="veusz-figure" className="vz-fig" style={card}>
        <div data-testid="veusz-needs-webgpu" style={{ padding: 16, color: '#b06000' }}>
          This interactive figure needs WebGPU. Open in Chrome or Safari 26+.
        </div>
      </div>
    );
  }

  return (
    <div data-testid="veusz-figure" className="vz-fig" style={card}>
      <div className="vz-toolbar" style={toolbar}>
        {editable && (
          <EmbedToolbar
            store={store}
            density="inline"
            ctx={makeEmbedActionCtx(store, {
              notify: (m) => store.setState({ error: m }),
            })}
          />
        )}
        <DownloadMenu items={downloadItems()} busy={busy} />
        {editable && (
          <button type="button" data-testid="veusz-edit-toggle"
            onClick={() => setEditing(true)} style={editBtn} title="Edit this figure">
            ✎ Edit
          </button>
        )}
      </div>

      <div className="vz-inline">
        {previewUrl !== undefined ? (
          <img src={previewUrl} alt={title ?? 'Veusz figure'} className="vz-preview"
            data-testid="veusz-inline-poster" />
        ) : (
          <div style={{ height: Math.round((height / width) * 100) + '%', minHeight: 200 }}>
            <EmbedPlot store={store} width={width} height={height} />
          </div>
        )}
        {error && !editing && (
          <div data-testid="veusz-error" style={errBar}>{error}</div>
        )}
      </div>

      {editing && (
        <EditorModal
          store={store} title={title} width={width} height={height}
          toolbar={<DownloadMenu items={downloadItems()} busy={busy} />}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  position: 'relative', border: '1px solid #e2e4e8', borderRadius: 10,
  overflow: 'hidden', background: '#fff', font: '14px system-ui, sans-serif',
};
const toolbar: React.CSSProperties = {
  position: 'absolute', top: 8, right: 8, zIndex: 3,
  display: 'flex', gap: 6, alignItems: 'flex-start',
};
const editBtn: React.CSSProperties = {
  border: '1px solid #d0d3d9', borderRadius: 6, padding: '3px 10px',
  cursor: 'pointer', fontSize: 12, background: '#fff', color: '#222',
};
const errBar: React.CSSProperties = {
  position: 'absolute', left: 8, bottom: 8, color: 'crimson', fontSize: 12,
  background: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: 4,
};
