/**
 * Document theme chooser — a toolbar dropdown that applies a curated theme
 * preset (colour theme + stylesheet fonts/lines/grid + light/dark) to the
 * whole document in one undoable step. The preset list comes from the daemon
 * (`doc.themes`); applying calls `doc.apply_theme` (store `applyTheme`).
 *
 * Each row previews the theme: a panel painted in the theme's background, an
 * "Aa" in its base font + foreground, and a few palette swatches — so dark vs
 * light, serif vs sans, and the colour sequence read at a glance. This is a
 * one-shot action menu (apply-and-bake leaves no persisted "current theme"),
 * so it highlights nothing as selected.
 */

import { useRef, useState } from 'react';
import type { ThemeInfo } from '../rpc/types';

function ThemeSwatch({ t, height = 20 }: { t: ThemeInfo; height?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: t.bg, border: '1px solid #00000022', borderRadius: 4,
        padding: '0 7px', height, minWidth: 96, overflow: 'hidden', flex: '0 0 auto',
      }}
      title={`${t.colorTheme} · ${t.font}`}
    >
      <span style={{ font: `bold 12px ${t.font}, serif`, color: t.fg, lineHeight: 1 }}>Aa</span>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {t.palette.slice(0, 5).map((c, i) => (
          <span key={i} style={{ width: 7, height: 11, borderRadius: 1, background: c }} />
        ))}
      </span>
    </span>
  );
}

export function ThemePicker({
  themes,
  onApply,
  disabled,
}: {
  themes: ThemeInfo[];
  onApply: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  if (!themes.length) return null;

  const choose = (id: string) => { setOpen(false); onApply(id); };

  return (
    <span ref={rootRef} data-testid="theme-picker" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        data-testid="theme-picker-trigger"
        aria-label="Document theme"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'default' : 'pointer',
          border: '1px solid #d0d7de', borderRadius: 6, padding: '2px 8px', background: '#fff',
          font: '12px sans-serif', color: '#1f2328', opacity: disabled ? 0.6 : 1,
        }}
      >
        <span aria-hidden>🎨</span>
        <span>Theme</span>
        <span style={{ color: '#6e7781', fontSize: 10 }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 39 }}
          />
          <div
            data-testid="theme-picker-panel"
            style={{
              position: 'absolute', zIndex: 40, right: 0, marginTop: 4, width: 280,
              border: '1px solid #d0d7de', borderRadius: 8, background: '#fff',
              boxShadow: '0 8px 24px #00000026', overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '6px 10px', font: '11px sans-serif', color: '#6e7781',
              borderBottom: '1px solid #eaeef2',
            }}>
              Apply a theme to this document
            </div>
            <div style={{ maxHeight: 320, overflow: 'auto' }}>
              {themes.map((t) => (
                <div
                  key={t.id}
                  data-testid={`theme-opt-${t.id}`}
                  onClick={() => choose(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
                    cursor: 'pointer', borderBottom: '1px solid #f3f5f8',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f6f8fa'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <ThemeSwatch t={t} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', font: '12px sans-serif', color: '#1f2328', fontWeight: 600 }}>
                      {t.label}
                    </span>
                    <span style={{
                      display: 'block', font: '11px sans-serif', color: '#6e7781',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {t.description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </span>
  );
}
