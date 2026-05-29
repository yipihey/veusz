#!/usr/bin/env node
/**
 * veusz-embed — turn a .vsz into a hostable interactive figure page.
 *
 *   node scripts/veusz-embed.mjs build myplot.vsz -o dist/ [options]
 *
 * Two distribution modes (the main "keep it small" lever):
 *
 *   default (CDN)  Emit a tiny page that loads veusz-embed.js + the veusz wheel
 *                  + the Vello wasm from a shared CDN, plus a copy of the .vsz.
 *                  The author hosts only the .vsz + index.html (~tens of KB).
 *
 *   --bundle       Vendor everything (veusz-embed.js + chunks, the wheel, the
 *                  Vello wasm) next to the .vsz so it runs from any static host
 *                  with no external deps except the Pyodide core (loaded from
 *                  jsDelivr unless --pyodide points at a vendored copy).
 *
 * Poster (static fallback): by default we render a PNG of the figure next to
 * the .vsz and wire it as the <veusz-figure poster="…">. The element shows it
 * immediately, keeps it (instead of a blank box) on browsers without WebGPU,
 * and — when a poster is present — defers the heavy Pyodide runtime until the
 * reader clicks the figure, so a page of figures pays only its posters until
 * one is used. Use --poster <img> to supply your own, --no-poster to skip, or
 * --eager to load the runtime immediately. Auto-generation needs a Python with
 * veusz importable (override with --python <path> or $VEUSZ_PYTHON).
 *
 * Build the artifacts first:
 *   pnpm build:embed                                  # dist-embed/veusz-embed.js
 *   .venv/bin/python ../scripts/build_embed_wheel.py  # dist/veusz-*.whl
 *   pnpm sync-wasm                                    # public/wasm/*
 */

import { readFileSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename, extname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const TAURI = resolve(HERE, '..');
const REPO = resolve(TAURI, '..');
const VERSION = readFileSync(`${REPO}/VERSION`, 'utf-8').trim();
const WHEEL = `veusz-${VERSION}-py3-none-any.whl`;
// Versioned Pages path published by .github/workflows/deploy-embed.yml. Pinning
// the version means a page generated today keeps working when newer runtimes
// ship. Override with --cdn for a different host (e.g. the upstream org).
const DEFAULT_CDN = `https://yipihey.github.io/veusz/embed/v${VERSION}`;

function parseArgs(argv) {
  const a = { _: [], bundle: false, out: 'dist', cdn: DEFAULT_CDN, width: 700, height: 500,
    pyodide: '', poster: '', noPoster: false, python: '', eager: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--bundle') a.bundle = true;
    else if (t === '-o' || t === '--out') a.out = argv[++i];
    else if (t === '--cdn') a.cdn = argv[++i].replace(/\/+$/, '');
    else if (t === '--width') a.width = Number(argv[++i]);
    else if (t === '--height') a.height = Number(argv[++i]);
    else if (t === '--pyodide') a.pyodide = argv[++i].replace(/\/+$/, '');
    else if (t === '--poster') a.poster = argv[++i];
    else if (t === '--no-poster') a.noPoster = true;
    else if (t === '--eager') a.eager = true;
    else if (t === '--python') a.python = argv[++i];
    else a._.push(t);
  }
  return a;
}

function html({ vszName, width, height, scriptSrc, wasmBase, wheelUrl, pyodideIndex, posterName, eager }) {
  const pyAttr = pyodideIndex ? `\n    pyodide-index="${pyodideIndex}"` : '';
  const posterAttr = posterName ? `\n    poster="./${posterName}"` : '';
  const eagerAttr = eager ? '\n    eager="true"' : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${vszName}</title>
  <style>body{margin:2rem auto;max-width:900px;padding:0 1rem;font:15px system-ui}</style>
  <script type="module" src="${scriptSrc}"></script>
</head>
<body>
  <veusz-figure
    src="./${vszName}"
    width="${width}" height="${height}"${posterAttr}${eagerAttr}
    wasm-base="${wasmBase}"
    veusz-wheel="${wheelUrl}"${pyAttr}></veusz-figure>
</body>
</html>
`;
}

// Resolve a Python interpreter that can import veusz: explicit --python, then
// $VEUSZ_PYTHON, then the repo's .venv, then PATH python3.
function resolvePython(explicit) {
  const candidates = [
    explicit, process.env.VEUSZ_PYTHON,
    join(REPO, '.venv', 'bin', 'python'), 'python3',
  ].filter(Boolean);
  for (const p of candidates) {
    if (p === 'python3' || existsSync(p)) return p;
  }
  return 'python3';
}

// Produce a static PNG poster next to the .vsz. Returns the poster filename, or
// '' if generation was skipped or failed (the page still works — it just shows
// a text fallback instead of an image when WebGPU is absent).
function makePoster(args, vsz, stem, out) {
  if (args.noPoster) return '';
  // Author-supplied image: copy it verbatim.
  if (args.poster) {
    if (!existsSync(args.poster)) {
      console.warn(`--poster: no such file ${args.poster}; emitting page without a poster`);
      return '';
    }
    const name = `${stem}.poster${extname(args.poster) || '.png'}`;
    copyFileSync(args.poster, join(out, name));
    return name;
  }
  // Auto-generate via the headless renderer (needs a Python with veusz).
  const name = `${stem}.poster.png`;
  const python = resolvePython(args.python);
  const script = join(REPO, 'scripts', 'render_poster.py');
  try {
    execFileSync(python, [script, vsz, '-o', join(out, name),
      '--width', String(args.width), '--height', String(args.height)],
      { stdio: 'pipe', timeout: 120000 });
    return name;
  } catch (e) {
    const why = (e && e.stderr ? String(e.stderr).trim().split('\n').pop() : e?.message) || 'unknown error';
    console.warn(`poster generation skipped (${python}): ${why}`);
    console.warn('  supply one with --poster <img>, or pass --no-poster to silence this.');
    return '';
  }
}

function copyTree(srcDir, dstDir, filter = () => true) {
  mkdirSync(dstDir, { recursive: true });
  for (const f of readdirSync(srcDir)) {
    if (filter(f)) copyFileSync(join(srcDir, f), join(dstDir, f));
  }
}

function build(args) {
  const vsz = args._[1];
  if (!vsz) { console.error('usage: veusz-embed build <file.vsz> -o <dir> [--bundle]'); process.exit(2); }
  if (!existsSync(vsz)) { console.error(`no such file: ${vsz}`); process.exit(2); }
  const out = resolve(args.out);
  const vszName = basename(vsz);
  const stem = vszName.replace(/\.vsz$/i, '');
  mkdirSync(out, { recursive: true });
  copyFileSync(vsz, join(out, vszName));

  const posterName = makePoster(args, vsz, stem, out);

  if (args.bundle) {
    const embedDir = `${TAURI}/dist-embed`;
    const wasmDir = `${TAURI}/public/wasm`;
    const wheelPath = `${REPO}/dist/${WHEEL}`;
    for (const [p, what] of [[embedDir, 'pnpm build:embed'], [wasmDir, 'pnpm sync-wasm'], [wheelPath, 'build_embed_wheel.py']]) {
      if (!existsSync(p)) { console.error(`missing artifact ${p} — run: ${what}`); process.exit(1); }
    }
    // Ship the JS only (skip .map) to keep the bundle lean.
    copyTree(embedDir, out, (f) => f.endsWith('.js'));
    copyTree(wasmDir, join(out, 'wasm'));
    copyFileSync(wheelPath, join(out, WHEEL));
    writeFileSync(join(out, 'index.html'), html({
      vszName, width: args.width, height: args.height, posterName, eager: args.eager,
      scriptSrc: './veusz-embed.js', wasmBase: './wasm', wheelUrl: `./${WHEEL}`,
      pyodideIndex: args.pyodide || '',
    }));
    console.log(`bundle written to ${out}/ (self-contained; Pyodide core ${args.pyodide ? 'vendored' : 'from jsDelivr'})`);
  } else {
    writeFileSync(join(out, 'index.html'), html({
      vszName, width: args.width, height: args.height, posterName, eager: args.eager,
      scriptSrc: `${args.cdn}/veusz-embed.js`, wasmBase: `${args.cdn}/wasm`,
      wheelUrl: `${args.cdn}/${WHEEL}`, pyodideIndex: args.pyodide || '',
    }));
    console.log(`CDN page written to ${out}/index.html (runtime from ${args.cdn}); host it + ${vszName}`);
  }
}

const args = parseArgs(process.argv.slice(2));
if (args._[0] !== 'build') {
  console.error('usage: veusz-embed build <file.vsz> -o <dir> [--bundle] [--cdn <base>] [--poster <img>|--no-poster]');
  process.exit(2);
}
build(args);
