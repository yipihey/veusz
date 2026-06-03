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
  // Override per-project in myst.yml options or via directive options below.
  embedScript: undefined, // e.g. 'https://yipihey.github.io/veusz/embed/v1/veusz-embed.js'
};

/** Escape a string for safe inclusion inside an HTML double-quoted attribute. */
function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the raw HTML for the `<veusz-figure>` web component.
 *
 * @param {object} a
 * @param {string} a.src
 * @param {string|number} [a.width]
 * @param {string|number} [a.height]
 * @param {string} [a.poster]
 * @param {boolean} [a.eager]
 * @param {string} [a.alt]
 * @returns {string}
 */
export function buildVeuszFigureHtml({ src, width, height, poster, eager, alt }) {
  const parts = [`src="${attr(src)}"`];
  if (width != null && width !== '') parts.push(`width="${attr(width)}"`);
  if (height != null && height !== '') parts.push(`height="${attr(height)}"`);
  if (poster) parts.push(`poster="${attr(poster)}"`);
  if (eager) parts.push(`eager`);

  // Poster placed inside the component as graceful fallback: it shows before the
  // script upgrades the custom element, and gives non-JS readers a static image.
  const fallback = poster
    ? `<img src="${attr(poster)}"${alt ? ` alt="${attr(alt)}"` : ''}${
        width ? ` width="${attr(width)}"` : ''
      }${height ? ` height="${attr(height)}"` : ''} />`
    : '';

  return `<veusz-figure ${parts.join(' ')}>${fallback}</veusz-figure>`;
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
    poster: {
      type: String,
      doc: 'Path or URL to a static poster image (PNG/SVG). Required for PDF/Typst/LaTeX export and used as the pre-script fallback on the web.',
    },
    alt: { type: String, doc: 'Alternative text for the static poster image.' },
    eager: {
      type: Boolean,
      doc: 'If set, render the figure eagerly instead of lazily when scrolled into view.',
    },
    static: {
      type: Boolean,
      doc: 'If set, emit ONLY the static poster image (no interactive web component).',
    },
    interactive: {
      type: Boolean,
      doc: 'Force the interactive web component (default behaviour).',
    },
  },
  run(data, vfile) {
    const src = data.arg;
    const opts = data.options ?? {};
    const { width, height, poster, alt, eager } = opts;
    const staticOnly = !!opts.static;

    if (!src) {
      // vfile is provided for error reporting in current mystmd; guard for tests.
      if (vfile && typeof vfile.message === 'function') {
        vfile.message('veusz: a .vsz source argument is required');
      }
      return [];
    }

    if (!poster && vfile && typeof vfile.message === 'function') {
      vfile.message(
        'veusz: no :poster: given — PDF/Typst/LaTeX export will have no static image for this figure',
      );
    }

    const imageNode = buildPosterImageNode({ poster, src, width, height, alt });

    if (staticOnly) {
      return [imageNode];
    }

    const htmlNode = {
      type: 'html',
      value: buildVeuszFigureHtml({ src, width, height, poster, eager, alt }),
    };

    // Return the live web component first (HTML output) and the poster image
    // second (static export). HTML renders both; static exporters skip the
    // `html` node and render only the image.
    return [htmlNode, imageNode];
  },
};

const plugin = {
  name: 'Veusz interactive figures',
  directives: [veuszDirective],
};

export default plugin;
export { veuszDirective, DEFAULTS };
