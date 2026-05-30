/**
 * Self-contained, container-query-driven stylesheet for the embeddable figure.
 *
 * The `<veusz-figure>` custom element renders into the light DOM (no Shadow
 * DOM), so this sheet must not leak into the host page: every selector is
 * namespaced under `.vz-fig` and the responsiveness is keyed off a *named*
 * container (`veuszfig`) so it never reacts to — or interferes with — the host
 * page's own container queries. The figure responds to the width of its own
 * slot in the page, not the viewport, which is exactly what an embed dropped
 * into an arbitrary column needs.
 *
 * Why a string + injected <style> rather than an imported .css file: the embed
 * ships as a single ES module (Vite library mode), so keeping the CSS inline
 * guarantees one self-contained artifact with no separate stylesheet to host.
 */

const STYLE_ID = 'veusz-embed-styles';

/** Container width (px) at/below which the edit panel becomes a bottom drawer
 *  overlaying the plot instead of a side column. Exported for tests. */
export const PANEL_DRAWER_MAX = 520;

export const EMBED_CSS = `
.vz-fig {
  container-type: inline-size;
  container-name: veuszfig;
}
.vz-fig .vz-body {
  position: relative;
  display: flex;
  align-items: stretch;
}
.vz-fig .vz-plot {
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px;
}
.vz-fig .vz-panel {
  box-sizing: border-box;
  flex: 0 0 300px;
  width: 300px;
  max-height: 520px;
  padding: 8px;
  overflow: auto;
  border-left: 1px solid #eee;
  background: #fff;
}

/* Narrow container: the side column would overflow the figure, so float the
   edit panel up from the bottom as a drawer over the plot. */
@container veuszfig (max-width: ${PANEL_DRAWER_MAX}px) {
  .vz-fig .vz-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    flex: none;
    max-height: 70%;
    border-left: 0;
    border-top: 1px solid #ddd;
    box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.16);
    z-index: 4;
  }
}
`;

/**
 * Inject the embed stylesheet once per document. Idempotent and safe to call
 * from module load and from component mount (covers both the custom-element
 * entry and direct React mounts in tests). No-ops when there is no DOM.
 */
export function ensureEmbedStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = EMBED_CSS;
  document.head.appendChild(el);
}
