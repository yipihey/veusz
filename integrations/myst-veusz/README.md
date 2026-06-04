# myst-veusz

A [MyST Markdown](https://mystmd.org) (`mystmd`) plugin that adds a **`veusz`
directive** for embedding interactive [Veusz](https://veusz.github.io) figures in
your documents.

By default the figure shows inline as a crisp **poster image** (ideally an SVG —
vector axes/labels, the data as an image) that the reader **clicks to open the
live, interactive figure full-page** in the deployed per-figure viewer
(`figure.html`). That full-page view owns its own viewport, so **fullscreen and
sizing just work** — none of the inline-`<iframe>` sandbox/scroll problems — and
when nobody's interacting the page shows a polished static figure.

- **HTML / web output** → a clickable inline poster + an "⤢ Open interactive
  figure" link, both pointing at the viewer (`figure.html?src=…`). External
  links open in a new tab, so the host page (and any notebook kernel) stay put.
- **Static export** (PDF / Typst / LaTeX / DOCX) → the same `image` node renders
  natively; the click-through link is simply inert in print.

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

> No on-page script is required. Because interaction happens in the standalone
> `figure.html` viewer (which loads `veusz-embed.js` itself), the host page only
> ever sees an `image` and a `link` — both of which MyST renders safely. (MyST
> sanitises inline `<script>`/`<style>`/custom elements, so loading our runtime
> on the page directly isn't possible anyway.)

### 2. Generate a poster (recommended)

The inline figure is the `:poster:` image. Render one straight from the `.vsz`
with **no Qt and no browser** using the repo's headless pipeline:

```bash
# .vsz -> SVG (vector) ; also works for .png / .pdf by changing the extension
scripts/render_vsz.sh figures/phase.vsz figures/phase.svg
```

(That runs `capture_scene.py` — pure-Python + numpy, via the `qtshim` — to build
the Scene IR, then the `veusz-render` Rust CLI to emit SVG/PNG/PDF.) Commit the
result next to your `.vsz`.

### 3. Use the directive

```md
:::{veusz} https://your.site/figures/phase.vsz
:poster: figures/phase.svg
:width: 640
:height: 640
:alt: Phase diagram — click to open the interactive figure
:::
```

The argument is the URL the **viewer** fetches the `.vsz` from (same-origin or
CORS-enabled). Options:

| Option    | Type    | Meaning                                                              |
| --------- | ------- | ------------------------------------------------------------------- |
| `poster`  | string  | Inline figure image (SVG/PNG). Also the static image on PDF/Typst/LaTeX export. |
| `width`   | string  | Inline poster width in px (height auto-scales to keep aspect). Also the viewer box width. |
| `height`  | string  | Interactive viewer box height in px.                                |
| `alt`     | string  | Alt text / link title for the poster.                               |
| `eager`   | boolean | Boot the interactive figure eagerly instead of on interaction.      |
| `static`  | boolean | Emit **only** the poster image, no link — for print/export pages.   |
| `embed`   | boolean | Embed an inline `<iframe>` to the viewer instead (interactive in-page; you own the sizing, fullscreen is subject to iframe limits). |

Aliases: you can also write `:::{veusz-figure} ...:::`.

## How it works

A MyST directive's `run(data, vfile)` runs **once** while the AST is built, before
any export target is chosen. The default output is two plain, universally-rendered
nodes:

1. A **clickable poster** — a `link` to `figure.html?src=…` wrapping the poster
   `image`. The image renders on every target (HTML, LaTeX `\includegraphics`,
   Typst `#image()`, DOCX); the link is web-only and inert in print.
2. A **call-to-action** — an "⤢ Open interactive figure" `link` to the same
   viewer.

Why not an on-page modal? MyST's HTML sanitiser strips `<style>`, `<script>`,
raw `<iframe>`, and custom elements, and there's no supported hook to inject our
own JS — so a true overlay modal that mounts `<veusz-figure>` on the page isn't
possible. Opening the live figure **full-page** is the robust equivalent, and it
fixes the very problems an inline iframe causes (broken fullscreen, fiddly
sizing, scrollbars). If you specifically want the figure inline and interactive,
`:embed:` falls back to an `<iframe>` to the viewer.

## Test

```bash
cd integrations/myst-veusz
npm test     # == node --test
```

## Manual verification (full build)

The example under `example/` is a complete MyST project that registers the
plugin:

```bash
cd integrations/myst-veusz/example
npx mystmd build --html
# Confirm the built index.html has the poster <img>, an <a … figure.html …>
# wrapping it, and the "Open interactive figure" link.
```

## License

GPL-2.0-or-later (matching the Veusz project).
