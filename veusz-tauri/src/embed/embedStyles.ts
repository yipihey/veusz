/**
 * Minimal, self-contained stylesheet for the embeddable figure. The
 * `<veusz-figure>` custom element renders into the light DOM (no Shadow DOM),
 * so every selector is namespaced under `.vz-fig` to avoid leaking into the
 * host page. Editing happens in a viewport modal (see EditorModal), so this is
 * just the inline card + preview; no container queries needed.
 */

const STYLE_ID = 'veusz-embed-styles';

export const EMBED_CSS = `
.vz-fig { position: relative; }
.vz-fig .vz-inline { display: block; }
.vz-fig .vz-preview { display: block; width: 100%; height: auto; background: #fff; }
`;

/** Inject the embed stylesheet once per document. Idempotent; no-op without a DOM. */
export function ensureEmbedStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = EMBED_CSS;
  document.head.appendChild(el);
}
