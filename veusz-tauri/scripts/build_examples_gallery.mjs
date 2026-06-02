#!/usr/bin/env node
/**
 * Build an editable web gallery of the Veusz examples — the in-browser answer
 * to https://veusz.github.io/examples/ . Every example is shown as a crisp,
 * statically-rendered poster (so the page is instant and works without
 * WebGPU), and clicking one boots the in-browser runtime and turns it into a
 * fully editable live figure (tree + inspector + pan/zoom), with its sidecar
 * data files fetched automatically.
 *
 *   node scripts/build_examples_gallery.mjs [-o dist-gallery] [--cdn <base>]
 *        [--limit N] [--no-poster] [--width 700] [--height 500] [--python <p>]
 *
 * The layout (titles/descriptions/order) is data-driven from
 * `examples/gallery.json`; any example not listed there is auto-appended with a
 * humanised title. The 3D examples are included: the pure-Python threed engine
 * flattens a scene3d into the same 2D Scene IR the Vello/WebGPU path draws, and
 * the embed adds drag-to-rotate. Only MathML is excluded (no live renderer).
 * Runtime is loaded from the versioned Pages CDN by default — matching
 * .github/workflows/deploy-embed.yml.
 */

import {
  readFileSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, existsSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const TAURI = resolve(HERE, '..');
const REPO = resolve(TAURI, '..');
const EXAMPLES = join(REPO, 'examples');
const VERSION = readFileSync(join(REPO, 'VERSION'), 'utf-8').trim();
const WHEEL = `veusz-${VERSION}-py3-none-any.whl`;
const DEFAULT_CDN = `https://yipihey.github.io/veusz/embed/v${VERSION}`;

// Only MathML is excluded — there's no in-browser MathML renderer. The 3D
// examples render (and rotate) through the same Scene IR pipeline as 2D, so
// they're included.
const EXCLUDE = (f) => /^mathml\b/i.test(f);

function parseArgs(argv) {
  const a = {
    out: join(TAURI, 'dist-gallery'), cdn: DEFAULT_CDN, width: 700, height: 500,
    scale: 2, noPoster: false, python: '', limit: 0,
  };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '-o' || t === '--out') a.out = resolve(argv[++i]);
    else if (t === '--cdn') a.cdn = argv[++i].replace(/\/+$/, '');
    else if (t === '--width') a.width = Number(argv[++i]);
    else if (t === '--height') a.height = Number(argv[++i]);
    else if (t === '--scale') a.scale = Number(argv[++i]);
    else if (t === '--no-poster') a.noPoster = true;
    else if (t === '--python') a.python = argv[++i];
    else if (t === '--limit') a.limit = Number(argv[++i]);
  }
  return a;
}

function resolvePython(explicit) {
  const candidates = [
    explicit, process.env.VEUSZ_PYTHON,
    join(REPO, '.venv', 'bin', 'python'), 'python3',
  ].filter(Boolean);
  for (const p of candidates) if (p === 'python3' || existsSync(p)) return p;
  return 'python3';
}

function humanize(stem) {
  const s = stem.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Ordered list of {file, stem, title, description} for the 2D examples. */
function manifest() {
  const metaPath = join(EXAMPLES, 'gallery.json');
  const cfg = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf-8')) : {};
  const meta = cfg.meta ?? {};
  const order = cfg.order ?? [];
  const all = readdirSync(EXAMPLES)
    .filter((f) => f.endsWith('.vsz') && !EXCLUDE(f));
  const seen = new Set();
  const ordered = [];
  for (const f of [...order, ...all.sort()]) {
    if (!f.endsWith('.vsz') || EXCLUDE(f) || seen.has(f) || !all.includes(f)) continue;
    seen.add(f);
    const stem = f.replace(/\.vsz$/i, '');
    const m = meta[f] ?? {};
    ordered.push({ file: f, stem, title: m.title ?? humanize(stem), description: m.description ?? '' });
  }
  return ordered;
}

function renderPoster(py, vsz, outPng, a) {
  execFileSync(py, [
    join(REPO, 'scripts', 'render_poster.py'), vsz, '-o', outPng,
    '--width', String(a.width), '--height', String(a.height), '--scale', String(a.scale),
  ], { stdio: 'pipe', timeout: 120000 });
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function card(ex, a, hasPoster) {
  const posterAttr = hasPoster ? `\n      poster="./${ex.stem}.poster.png"` : '';
  // The poster <img> inside the element is a graceful fallback: it shows the
  // figure instantly (and remains if the runtime never loads / no WebGPU /
  // JS off). The custom element replaces its own children once it upgrades.
  const fallback = hasPoster
    ? `<img class="poster" src="./${ex.stem}.poster.png" alt="${escapeHtml(ex.title)}" loading="lazy" />`
    : '';
  return `    <figure class="card" id="${ex.stem}">
    <figcaption class="card-head">
      <h2>${escapeHtml(ex.title)}</h2>
      <a class="src" href="./${ex.file}" download title="Download the .vsz document">.vsz</a>
    </figcaption>
    <veusz-figure
      src="./${ex.file}"
      title="${escapeHtml(ex.title)}"
      width="${a.width}" height="${a.height}"${posterAttr}
      wasm-base="${a.cdn}/wasm"
      veusz-wheel="${a.cdn}/${WHEEL}">${fallback}</veusz-figure>${ex.description
    ? `\n    <p class="desc">${escapeHtml(ex.description)}</p>` : ''}
  </figure>`;
}

function pageHtml(cards, a) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Veusz examples — editable in your browser</title>
  <script type="module" src="${a.cdn}/veusz-embed.js"></script>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; font: 16px/1.5 system-ui, sans-serif; color: #1a1d21;
      background: #f6f7f9;
    }
    header { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem 1rem; }
    header h1 { margin: 0 0 .4rem; font-size: clamp(1.6rem, 4vw, 2.4rem); }
    header p { margin: .25rem 0; color: #51585f; max-width: 60ch; }
    .hint { font-size: .9rem; color: #6b7280; }
    main {
      max-width: 1200px; margin: 0 auto; padding: 1rem 1.25rem 4rem;
      display: grid; gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
    }
    .card {
      margin: 0; background: #fff; border: 1px solid #e2e4e8; border-radius: 12px;
      padding: .75rem; box-shadow: 0 1px 3px rgba(0,0,0,.04);
      display: flex; flex-direction: column; gap: .5rem;
    }
    .card-head { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; }
    .card-head h2 { margin: 0; font-size: 1.05rem; }
    .card-head .src {
      font: 600 .75rem/1 ui-monospace, monospace; color: #1f6feb; text-decoration: none;
      border: 1px solid #cfe0ff; border-radius: 6px; padding: .25rem .4rem; white-space: nowrap;
    }
    .card-head .src:hover { background: #eef4ff; }
    .desc { margin: 0; font-size: .85rem; color: #6b7280; }
    veusz-figure { display: block; }
    .card .poster {
      display: block; width: 100%; height: auto; border-radius: 8px;
      background: #fff;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #e6e8eb; background: #0f1115; }
      .card { background: #161a20; border-color: #2a2f37; }
      header p { color: #aab2bd; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Veusz examples — editable in your browser</h1>
    <p>Every figure below is a live Veusz document. Click one to load the
       in-browser runtime, then pan, zoom, and edit it with the full tree and
       property inspector — no install, no server.</p>
    <p class="hint">Previews render instantly; the interactive runtime
       (WebGPU) loads on demand when you click a figure.</p>
  </header>
  <main>
${cards.join('\n')}
  </main>
</body>
</html>
`;
}

function build() {
  const a = parseArgs(process.argv.slice(2));
  let items = manifest();
  if (a.limit > 0) items = items.slice(0, a.limit);
  mkdirSync(a.out, { recursive: true });

  // Copy every example .vsz + its sidecar data (everything that isn't a .vsz
  // or a script). Data is fetched relative to each .vsz at runtime.
  for (const f of readdirSync(EXAMPLES)) {
    if (f === 'gallery.json' || f.endsWith('.py')) continue;
    if (f.endsWith('.vsz') && EXCLUDE(f)) continue;
    copyFileSync(join(EXAMPLES, f), join(a.out, f));
  }

  const py = resolvePython(a.python);
  const cards = [];
  let posters = 0, failures = 0;
  for (const ex of items) {
    let hasPoster = false;
    if (!a.noPoster) {
      try {
        renderPoster(py, join(EXAMPLES, ex.file), join(a.out, `${ex.stem}.poster.png`), a);
        hasPoster = true; posters++;
      } catch (e) {
        failures++;
        const why = (e && e.stderr ? String(e.stderr).trim().split('\n').pop() : e?.message) || 'error';
        console.warn(`  poster failed for ${ex.file}: ${why}`);
      }
    }
    cards.push(card(ex, a, hasPoster));
  }

  writeFileSync(join(a.out, 'index.html'), pageHtml(cards, a));
  console.log(`gallery: ${items.length} examples, ${posters} posters`
    + (failures ? `, ${failures} poster failures` : '')
    + `\n  → ${a.out}/index.html  (runtime from ${a.cdn})`);
}

build();
