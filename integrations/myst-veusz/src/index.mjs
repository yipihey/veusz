// myst-veusz — a MyST Markdown (mystmd) plugin that adds a `veusz` directive
// for embedding interactive Veusz figures.
//
// Usage in a MyST document:
//
//   :::{veusz} figures/phase.vsz
//   :width: 700
//   :height: 500
//   :poster: figures/phase.png
//   :::
//
// Presentation model (default):
// ------------------------------
// The figure renders as a crisp, inline **poster image** (ideally an SVG — see
// scripts/render_vsz.sh, which produces one with no Qt) that you CLICK to open
// the live, interactive figure **full-page** in the per-figure viewer
// (figure.html). The full-page view owns its own viewport, so fullscreen and
// sizing just work — none of the inline-iframe sandbox/scroll problems — and
// when you're just reading, the page shows a polished static figure, not a
// letterboxed iframe.
//
// Why not an on-page modal? MyST's HTML sanitiser strips <style>, <script>, raw
// <iframe>, and custom elements, and there's no supported way to inject our own
// JS, so a true overlay modal mounting <veusz-figure> on the page isn't possible
// (verified). A full-page viewer is the robust equivalent.
//
// Options:
//   * (default)   clickable inline poster + an "⤢ Open interactive figure" link.
//   * `:embed:`   the old behaviour — an inline <iframe> to the viewer
//                 (interactive in-page; you own the sizing).
//   * `:static:`  ONLY the poster image, no link — for print/export pages.
//
// A directive's `run(data, vfile)` runs ONCE while the AST is built, before the
// export target is known. The poster `image` node renders on EVERY target (HTML,
// PDF, Typst, LaTeX, DOCX), so static exports get the figure for free; only the
// click-through link is web-only (a no-op in print).

const DEFAULTS = {
  // The deployed embed runtime that hosts figure.html (the per-figure viewer)
  // and veusz-embed.js. Override per figure with the `:cdn:` option, or fork
  // this constant for your own deployment.
  cdn: 'https://yipihey.github.io/veusz/embed/v4.5.0',
};

/**
 * Build the viewer URL the iframe points at: the deployed `figure.html` with the
 * figure's `.vsz` (and size/poster) as query params. Embedding via an iframe to
 * a viewer — rather than an inline `<veusz-figure>` element — is deliberate:
 * MyST sanitises inline custom elements out of the HTML, but renders `{iframe}`
 * natively. `src` must be a URL the viewer can fetch (same-origin or CORS).
 *
 * @param {object} a
 * @param {string} a.src   URL of the .vsz document
 * @param {string} a.cdn   embed runtime base (hosts figure.html + veusz-embed.js)
 * @param {string|number} [a.width]
 * @param {string|number} [a.height]
 * @param {string} [a.poster]
 * @param {boolean} [a.eager]
 * @returns {string}
 */
export function buildViewerUrl({ src, cdn, width, height, poster, eager }) {
  const base = String(cdn).replace(/\/+$/, '');
  const q = new URLSearchParams();
  q.set('src', src);
  if (width != null && width !== '') q.set('width', String(width));
  if (height != null && height !== '') q.set('height', String(height));
  // Resolve the poster against the .vsz location, not the viewer's: the poster
  // lives next to the document (e.g. notebook/figures/phase.svg), but the
  // viewer runs from the embed CDN (…/embed/vX/figure.html). A bare relative
  // poster would resolve against the CDN and 404 — and on a no-WebGPU browser
  // the viewer's static-poster fallback would then fail to a "needs WebGPU"
  // message instead of showing the figure. Absolute → it resolves everywhere.
  if (poster) q.set('poster', resolveAgainst(poster, src));
  if (eager) q.set('eager', '1');
  return `${base}/figure.html?${q.toString()}`;
}

/** Resolve `ref` against `base` to an absolute URL when possible; if `base`
 *  isn't itself absolute (so resolution is undefined), return `ref` unchanged. */
function resolveAgainst(ref, base) {
  try {
    return new URL(ref, base).href;
  } catch {
    return ref;
  }
}

/**
 * Build the static `image` AST node used for non-HTML export targets.
 * Renders correctly in LaTeX / Typst / DOCX / HTML.
 */
export function buildPosterImageNode({ poster, src, width, height, alt }) {
  const url = poster || src; // poster is required for a real static fallback
  const node = { type: 'image', url };
  if (alt) node.alt = alt;
  // MyST image nodes accept numeric or "Npx"/"N%" widths; pass through as given.
  if (width != null && width !== '') node.width = String(width);
  if (height != null && height !== '') node.height = String(height);
  return node;
}

const veuszDirective = {
  name: 'veusz',
  doc: 'Embed an interactive Veusz figure (.vsz). Renders the <veusz-figure> web component for HTML output and a static poster image for PDF/Typst/LaTeX export.',
  alias: ['veusz-figure'],
  arg: {
    type: String,
    doc: 'Path or URL to the Veusz document (.vsz) to render.',
    required: true,
  },
  options: {
    width: { type: String, doc: 'Figure width in pixels, e.g. `700`.' },
    height: { type: String, doc: 'Figure height in pixels, e.g. `500`.' },
    cdn: {
      type: String,
      doc: 'Embed runtime base URL hosting figure.html + veusz-embed.js. Defaults to the pinned deploy.',
    },
    poster: {
      type: String,
      doc: 'Path or URL to a static poster image (PNG/SVG). Used as the boot fallback in the viewer and as the static image on PDF/Typst/LaTeX export.',
    },
    alt: { type: String, doc: 'Alternative text for the static poster image.' },
    eager: {
      type: Boolean,
      doc: 'If set, boot the figure eagerly instead of deferring until interaction.',
    },
    static: {
      type: Boolean,
      doc: 'If set, emit ONLY the static poster image (no link) — for print/export pages.',
    },
    embed: {
      type: Boolean,
      doc: 'If set, embed an inline <iframe> to the viewer (interactive in-page) instead of the click-to-open-full-page poster. You own the sizing; fullscreen is subject to iframe limits.',
    },
  },
  run(data, vfile) {
    const src = data.arg;
    const opts = data.options ?? {};
    const { width, height, poster, alt, eager } = opts;
    const cdn = opts.cdn || DEFAULTS.cdn;
    const staticOnly = !!opts.static;
    const embed = !!opts.embed;

    if (!src) {
      if (vfile && typeof vfile.message === 'function') {
        vfile.message('veusz: a .vsz source argument is required');
      }
      return [];
    }

    const viewer = buildViewerUrl({ src, cdn, width, height, poster, eager });

    // Opt-in: the old inline iframe (interactive in-page; caller owns sizing).
    if (embed) {
      const iframe = {
        type: 'iframe',
        src: viewer,
        width: width ? String(width) : '100%',
      };
      if (height) iframe.height = String(height);
      if (alt) iframe.title = alt;
      return [iframe];
    }

    // Static-only (print pages): just the poster image, no link.
    if (staticOnly) {
      if (!poster && vfile && typeof vfile.message === 'function') {
        vfile.message('veusz: :static: with no :poster: — nothing to render');
      }
      return [buildPosterImageNode({ poster, src, width, height, alt })];
    }

    if (!poster && vfile && typeof vfile.message === 'function') {
      vfile.message(
        'veusz: no :poster: given — the inline figure will be just a link, and PDF/Typst/LaTeX export will have no image',
      );
    }

    // Default: a crisp inline poster you click to open the live figure
    // full-page, plus an explicit call-to-action link. Both target the viewer;
    // external/full-URL links open in a new tab (MyST adds target=_blank), so
    // the notebook page — and its kernel — stay put.
    const title = alt || 'Open the interactive Veusz figure';
    const nodes = [];
    if (poster) {
      // Width only — let the poster keep its intrinsic aspect ratio (a square
      // figure forced into width×height would be distorted). The interactive
      // viewer still gets both dimensions for its box.
      const image = buildPosterImageNode({ poster, width, alt });
      nodes.push({
        type: 'paragraph',
        children: [{ type: 'link', url: viewer, title, children: [image] }],
      });
    }
    nodes.push({
      type: 'paragraph',
      children: [
        {
          type: 'link',
          url: viewer,
          title,
          children: [{ type: 'text', value: '⤢ Open interactive figure' }],
        },
      ],
    });
    return nodes;
  },
};

const plugin = {
  name: 'Veusz interactive figures',
  directives: [veuszDirective],
};

export default plugin;
export { veuszDirective, DEFAULTS };
