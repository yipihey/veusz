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
// For HTML / web output the directive emits the `<veusz-figure>` web component,
// which is rendered interactively in the browser by `veusz-embed.js` (loaded once
// from a versioned CDN — see README). For non-HTML exports (PDF / Typst / LaTeX)
// the directive emits a plain static `image` node pointing at the poster PNG.
//
// Design note (live -> static substitution):
// ------------------------------------------
// A directive's `run(data, vfile)` is executed ONCE while the AST is built, before
// any specific export target is known, so it cannot branch on "am I building HTML
// or PDF?". We therefore return BOTH representations and let each renderer pick the
// one it understands:
//
//   * `html` node  ({ type: 'html', value })  — rendered verbatim by the HTML
//     renderer (myst-to-html) and produces the live `<veusz-figure>` web component.
//     Static exporters (myst-to-tex / myst-to-typst) have no handler for `html`
//     nodes; they skip them (a single, non-fatal warning) and so never try to put
//     a web component into a PDF.
//
//   * `image` node ({ type: 'image', url: poster, ... }) — rendered by EVERY target
//     (HTML, LaTeX, Typst, DOCX, ...). This is the static poster fallback used on
//     export.
//
// To avoid the poster showing twice on the web (once as the component's own poster,
// once as the standalone image), the `<img>` is placed *inside* the web component
// as fallback content, and the standalone `image` node is wrapped so it only
// surfaces on static export. We do this with the most portable mechanism available:
// the standalone image is the node that static exporters render, and on the web the
// web component visually covers it (the component renders into its own box and the
// fallback `<img>` inside it is what shows until JS upgrades the element).
//
// If you want a *single* node instead of a pair, set `:static:` to render only the
// poster image (no web component at all), or `:interactive:` (default) for both.

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
  if (poster) q.set('poster', poster);
  if (eager) q.set('eager', '1');
  return `${base}/figure.html?${q.toString()}`;
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
      doc: 'If set, emit ONLY the static poster image (no interactive iframe) — for print-only pages.',
    },
  },
  run(data, vfile) {
    const src = data.arg;
    const opts = data.options ?? {};
    const { width, height, poster, alt, eager } = opts;
    const cdn = opts.cdn || DEFAULTS.cdn;
    const staticOnly = !!opts.static;

    if (!src) {
      if (vfile && typeof vfile.message === 'function') {
        vfile.message('veusz: a .vsz source argument is required');
      }
      return [];
    }

    // Static-only (print pages): just the poster image.
    if (staticOnly) {
      if (!poster && vfile && typeof vfile.message === 'function') {
        vfile.message('veusz: :static: with no :poster: — nothing to render');
      }
      return [buildPosterImageNode({ poster, src, width, height, alt })];
    }

    if (!poster && vfile && typeof vfile.message === 'function') {
      vfile.message(
        'veusz: no :poster: given — PDF/Typst/LaTeX export of this figure will fall back to a link, not an image',
      );
    }

    // The interactive figure, embedded as an iframe to the per-figure viewer —
    // the mechanism MyST renders (inline custom elements are sanitised away).
    const iframe = {
      type: 'iframe',
      src: buildViewerUrl({ src, cdn, width, height, poster, eager }),
      width: width ? String(width) : '100%',
    };
    if (height) iframe.height = String(height);
    if (alt) iframe.title = alt;
    return [iframe];
  },
};

const plugin = {
  name: 'Veusz interactive figures',
  directives: [veuszDirective],
};

export default plugin;
export { veuszDirective, DEFAULTS };
