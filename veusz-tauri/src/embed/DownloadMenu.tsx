/**
 * A small dropdown "Download ▾" menu for the figure toolbar. Generic over its
 * items so the figure can offer the .vsz plus client-side SVG/PNG/PDF exports.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface DownloadItem {
  label: string;
  onSelect?: () => void;
  /** Optional href for a plain download link (e.g. the .vsz) — no JS needed. */
  href?: string;
  download?: string;
  hint?: string;
}

export function DownloadMenu({ items, disabled, busy }: {
  items: DownloadItem[]; disabled?: boolean; busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" data-testid="veusz-download" disabled={disabled}
        aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((o) => !o)} style={trigger} title="Download this figure">
        {busy ? '…' : '⤓ Download ▾'}
      </button>
      {open && (
        <div role="menu" data-testid="veusz-download-menu" style={menu}>
          {items.map((it) => {
            const inner: ReactNode = (
              <>
                {it.label}
                {it.hint && <span style={{ color: '#8b94a3', marginLeft: 8, fontSize: 11 }}>{it.hint}</span>}
              </>
            );
            const key = it.label;
            const tid = `download-${it.label.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
            return it.href ? (
              <a key={key} role="menuitem" data-testid={tid} href={it.href} download={it.download}
                onClick={() => setOpen(false)} style={item}>{inner}</a>
            ) : (
              <button key={key} type="button" role="menuitem" data-testid={tid}
                onClick={() => { setOpen(false); it.onSelect?.(); }} style={item}>{inner}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const trigger: React.CSSProperties = {
  border: '1px solid #d0d3d9', borderRadius: 6, padding: '3px 10px',
  cursor: 'pointer', fontSize: 12, background: '#fff', color: '#222',
};
const menu: React.CSSProperties = {
  position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 6,
  background: '#fff', border: '1px solid #e2e4e8', borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.16)', padding: 4, minWidth: 150,
  display: 'flex', flexDirection: 'column',
};
const item: React.CSSProperties = {
  display: 'flex', alignItems: 'baseline', textAlign: 'left',
  border: 0, background: 'transparent', cursor: 'pointer',
  font: '13px system-ui', color: '#222', padding: '6px 10px', borderRadius: 6,
  textDecoration: 'none', width: '100%',
};
