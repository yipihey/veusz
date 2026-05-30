/**
 * Export dialog — collects page range + DPI/antialias options, then asks the
 * host for a destination path and calls `file.export(path, pages, options)`.
 * Format is determined by the chosen file extension (the supported set is
 * listed from `file.formats`); the options map the real knobs the daemon's
 * AsyncExport accepts (bitmapdpi, antialias, …).
 */

import { useEffect, useState } from 'react';
import type { DocStore } from '../../keys/shortcuts';
import { svgExportAvailable } from '../plot/velloWasm';
import { exportFigureAsSvg } from '../../embed/exportSvg';

export interface ExportDialogProps {
  store: DocStore;
  /** Native "save as" picker returning the destination path (or null). */
  onPickPath?: () => Promise<string | null>;
  onClose: () => void;
  notify: (msg: string) => void;
}

type RangeMode = 'all' | 'current' | 'custom';

export function ExportDialog({ store, onPickPath, onClose, notify }: ExportDialogProps) {
  const s = store();
  const npages = s.tree?.children.length ?? 0;

  const [mode, setMode] = useState<RangeMode>('all');
  const [custom, setCustom] = useState('');
  const [dpi, setDpi] = useState(100);
  const [antialias, setAntialias] = useState(true);
  const [formats, setFormats] = useState<{ extensions: string[]; description: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [canSvg, setCanSvg] = useState(false);

  useEffect(() => {
    let cancelled = false;
    s.rpc.file.formats()
      .then((f) => { if (!cancelled) setFormats(f); })
      .catch(() => {});
    void svgExportAvailable().then((ok) => { if (!cancelled) setCanSvg(ok); });
    return () => { cancelled = true; };
  }, [s.rpc]);

  const resolvePages = (): number[] | undefined => {
    if (mode === 'all') return undefined; // daemon picks all/0 by format
    if (mode === 'current') return [s.currentPage];
    return parseRange(custom, npages);
  };

  const doExport = async () => {
    if (!onPickPath) { notify('No save picker available.'); return; }
    const pages = resolvePages();
    if (mode === 'custom' && (!pages || pages.length === 0)) {
      notify('Enter a valid page range, e.g. 1,3-5.');
      return;
    }
    const path = await onPickPath();
    if (!path) return;
    setBusy(true);
    const out = await s.exportFile(path, pages, {
      bitmapdpi: dpi, pdfdpi: dpi, antialias,
    });
    setBusy(false);
    if (out) { notify(`Exported to ${out}`); onClose(); }
  };

  // Client-side vector SVG: works in the browser with no Qt and no save
  // picker (downloads directly). SVG is single-page, so it uses the current
  // page (or the first page of a custom range).
  const doExportSvg = async () => {
    const page = resolvePages()?.[0] ?? s.currentPage;
    setBusy(true);
    try {
      await exportFigureAsSvg(store, {
        page, width: 800, height: 600, dpi,
        filename: `page${page + 1}.svg`,
      });
      notify('Downloaded SVG'); onClose();
    } catch (e) {
      notify(`SVG export failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="export" style={{ minWidth: 380, fontSize: 13 }}>
      <fieldset style={fs}>
        <legend style={lg}>Pages</legend>
        {(['all', 'current', 'custom'] as RangeMode[]).map((m) => (
          <label key={m} style={{ display: 'block', padding: '2px 0' }}>
            <input
              type="radio" name="pagerange" data-testid={`export-range-${m}`}
              checked={mode === m} onChange={() => setMode(m)}
            />{' '}
            {m === 'all' ? 'All pages' : m === 'current' ? `Current page (${s.currentPage + 1})` : 'Pages'}
            {m === 'custom' && (
              <input
                type="text" data-testid="export-range-custom"
                placeholder="1,3-5" value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onFocus={() => setMode('custom')}
                style={{ marginLeft: 6, width: 90 }}
              />
            )}
          </label>
        ))}
        <div style={{ color: '#888', fontSize: 11 }}>{npages} page(s) in document</div>
      </fieldset>

      <fieldset style={fs}>
        <legend style={lg}>Options</legend>
        <label style={row}>
          <span style={{ flex: 1 }}>DPI (raster / PDF)</span>
          <input
            type="number" data-testid="export-dpi" min={36} max={600}
            value={dpi} onChange={(e) => setDpi(parseInt(e.target.value, 10) || 100)}
            style={{ width: 90 }}
          />
        </label>
        <label style={row}>
          <span style={{ flex: 1 }}>Antialias</span>
          <input
            type="checkbox" data-testid="export-antialias"
            checked={antialias} onChange={(e) => setAntialias(e.target.checked)}
          />
        </label>
      </fieldset>

      <p style={{ color: '#888', fontSize: 11 }}>
        Format is chosen by the file extension. Supported:{' '}
        {formats.flatMap((f) => f.extensions).join(', ') || '…'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {canSvg && (
          <button type="button" data-testid="export-svg" disabled={busy}
            onClick={() => void doExportSvg()}
            title="Vector SVG, rendered in the browser (no server)">
            Download SVG
          </button>
        )}
        <button type="button" data-testid="export-run" disabled={busy} onClick={() => void doExport()}>
          {busy ? 'Exporting…' : 'Export…'}
        </button>
      </div>
    </div>
  );
}

/** Parse a 1-indexed page spec like "1,3-5" into a 0-indexed, in-range,
 *  sorted, de-duplicated list. */
export function parseRange(spec: string, npages: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(',').map((x) => x.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const lo = parseInt(m[1], 10);
    const hi = m[2] ? parseInt(m[2], 10) : lo;
    for (let i = lo; i <= hi; i++) {
      if (i >= 1 && i <= npages) out.add(i - 1);
    }
  }
  return [...out].sort((a, b) => a - b);
}

const fs: React.CSSProperties = {
  border: '1px solid #e2e2e2', borderRadius: 4, margin: '0 0 10px', padding: '4px 10px 8px',
};
const lg: React.CSSProperties = { color: '#555' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '3px 0' };
