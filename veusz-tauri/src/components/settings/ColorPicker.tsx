import type { LeafProps } from './types';

/**
 * `color` — accepts hex (#rrggbb), named ("red", "blue"), or "auto"
 * (resolved by Veusz against the parent widget's auto-color cycle).
 */
export function ColorPicker({ schema, value, onChange }: LeafProps) {
  const v = typeof value === 'string' ? value : 'auto';
  const isAuto = v === 'auto';
  const refVal = (value as { $ref?: string } | null | undefined)?.$ref;

  return (
    <span data-testid={`setting-${schema.name}`}>
      <label>
        <input
          type="checkbox"
          checked={isAuto}
          data-testid={`setting-${schema.name}-auto`}
          aria-label="auto"
          onChange={(e) => onChange(e.target.checked ? 'auto' : '#000000')}
        />
        Auto
      </label>
      {!isAuto && (
        <input
          type="color"
          value={normalizeHex(v)}
          data-testid={`setting-${schema.name}-color`}
          aria-label={schema.usertext || schema.name}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {refVal && (
        <span data-testid={`setting-${schema.name}-ref`}>
          ref: <code>{refVal}</code>
        </span>
      )}
    </span>
  );
}

const colorCache = new Map<string, string>();

// Common CSS basic / X11 colours, looked up before the DOM resolver. Covers
// the colours people actually type in `.vsz` files and means jsdom tests pass
// without a real CSS engine. Anything outside this set still falls through to
// getComputedStyle in real browsers.
const NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', lime: '#00ff00',
  blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', aqua: '#00ffff',
  magenta: '#ff00ff', fuchsia: '#ff00ff',
  silver: '#c0c0c0', gray: '#808080', grey: '#808080',
  maroon: '#800000', olive: '#808000', green: '#008000', teal: '#008080',
  navy: '#000080', purple: '#800080',
  orange: '#ffa500', pink: '#ffc0cb', brown: '#a52a2a',
};

function normalizeHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  const named = NAMED_COLORS[v.toLowerCase()];
  if (named) return named;
  // Browser <input type=color> demands #rrggbb. Resolve any remaining CSS-
  // named colours via the DOM so the swatch matches the actual marker colour
  // instead of falling back to black. Veusz pseudo-colours like `foreground`
  // / `background` don't resolve and stay black — they're document-relative;
  // the canonical value still lives server-side.
  if (typeof document === 'undefined') return '#000000';
  const cached = colorCache.get(v);
  if (cached) return cached;
  const probe = document.createElement('div');
  probe.style.color = v;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const m = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return '#000000';
  const hex = '#' + [m[1], m[2], m[3]]
    .map((n) => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
  colorCache.set(v, hex);
  return hex;
}
