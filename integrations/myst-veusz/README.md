# myst-veusz

A [MyST Markdown](https://mystmd.org) (`mystmd`) plugin that adds a **`veusz`
directive** for embedding interactive [Veusz](https://veusz.github.io) figures in
your documents.

- **HTML / web output** → emits the `<veusz-figure>` web component, which renders a
  `.vsz` document interactively in the browser (no server needed), powered by
  `veusz-embed.js`.
- **Static export** (PDF / Typst / LaTeX / DOCX) → emits a static `image` node
  pointing at the figure's poster PNG/SVG. This is the live → static substitution.

## Install

This is a self-contained plugin — it does not depend on the Veusz repo build.
Copy the `integrations/myst-veusz/` folder next to your MyST project, or install it
as a local dependency:

```bash
npm install /path/to/myst-veusz
```

The directive itself has **no runtime dependencies**; only `node --test` is used for
the test suite (a Node built-in, no devDeps required).

## Wire it into a MyST project

### 1. Register the plugin in `myst.yml`

```yaml
version: 1
project:
  plugins:
    - node_modules/myst-veusz/src/index.mjs
    # ...or, if you copied the folder in:
    # - integrations/myst-veusz/src/index.mjs
site:
  template: book-theme
```

> The directive's `run` function builds the AST once, before the export target is
> known, so it emits **both** a live web component and a static poster image and
> lets each renderer pick the one it understands (see "How it works" below).

### 2. Load `veusz-embed.js` once on the HTML site

The web component is registered by a single script, loaded from a versioned CDN.
Add it once to your site (so every page that uses `:::{veusz}` gets it). The
simplest portable way is a small raw-HTML block in a page that's always included
(or your theme's head). For example, at the top of `index.md`:

````md
```{raw} html
<script type="module"
  src="https://yipihey.github.io/veusz/embed/v1/veusz-embed.js"></script>
```
````

Replace `v1` with the version you want to pin. (If your MyST theme supports custom
`<head>` includes, add the same `<script type="module" ...>` there instead — that
keeps it out of the page body.)

### 3. Use the directive

```md
:::{veusz} figures/phase.vsz
:width: 700
:height: 500
:poster: figures/phase.png
:::
```

The argument is the path/URL to the `.vsz` document. Options:

| Option         | Type    | Meaning                                                             |
| -------------- | ------- | ------------------------------------------------------------------- |
| `width`        | string  | Figure width in pixels (e.g. `700`).                                |
| `height`       | string  | Figure height in pixels (e.g. `500`).                               |
| `poster`       | string  | Static poster image (PNG/SVG). **Required for clean PDF/Typst/LaTeX export.** |
| `alt`          | string  | Alt text for the static poster image.                               |
| `eager`        | boolean | Render eagerly instead of lazily when scrolled into view.           |
| `static`       | boolean | Emit **only** the poster image (no interactive component at all).   |
| `interactive`  | boolean | Force the interactive component (this is the default).              |

Aliases: you can also write `:::{veusz-figure} ...:::`.

## How it works (live → static substitution)

A MyST directive's `run(data, vfile)` runs **once** while the AST is built, before
any export target is chosen, so it can't ask "am I building HTML or PDF?". Instead
the directive returns two sibling nodes and lets each renderer keep what it
understands:

1. An **`html` node** (`{ type: 'html', value: '<veusz-figure …>…</veusz-figure>' }`)
   — rendered verbatim by the HTML renderer (`myst-to-html`) to produce the live,
   interactive web component. The poster is also embedded inside the component as a
   graceful `<img>` fallback (shown until the script upgrades the element / for
   non-JS readers).
2. An **`image` node** (`{ type: 'image', url: poster, width, height, alt }`)
   — rendered by every target, including LaTeX (`\includegraphics`) and Typst
   (`#image()`). This is the static poster used on export.

The static exporters (`myst-to-tex`, `myst-to-typst`) have **no handler for `html`
nodes**: they skip them with a single, non-fatal warning, so a web component never
ends up inside a PDF. If you want to avoid that warning entirely for a print-only
build, use `:static:` on the directive (emits only the image).

> v0 scope: the static fallback is the **poster PNG/SVG**. Full figure-SVG-on-export
> (rendering the `.vsz` to a vector image at export time) is a planned enhancement.

## Test

```bash
cd integrations/myst-veusz
npm test     # == node --test
```

## Manual verification (full build)

This package's tests cover the directive's `run` output directly. To verify it end
to end inside a real MyST project (not possible from this repo, which has no MyST
project configured):

```bash
# 1. In a MyST project that registers the plugin (see "Wire it in" above):
npm install -g mystmd            # or: npx mystmd

# 2. Interactive web build — confirm <veusz-figure> appears in the HTML:
myst build --html
#   grep the generated HTML for `veusz-figure` and confirm veusz-embed.js loads.

# 3. Static export — confirm the poster image is used and no web component leaks:
myst build --pdf      # or: myst build --typst / --tex
#   open the PDF/typst output and confirm the poster image renders.
```

## License

GPL-2.0-or-later (matching the Veusz project).
