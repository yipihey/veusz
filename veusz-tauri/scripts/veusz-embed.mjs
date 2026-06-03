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

import { readFileSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
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
    pyodide: '', poster: '', noPoster: false, python: '', eager: false, selfContained: false };
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
    else if (t === '--self-contained' || t === '--single') a.selfContained = true;
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

// ---------------------------------------------------------------------------
// --self-contained: one HTML file with the scene + Vello wasm + JS glue baked
// in (base64). Opens from file://, no server, no Pyodide. View-only: it's the
// captured scene, so no live editing or model-driven zoom — but trivially
// shareable. About 4 MB for a typical figure (3 MB wasm dominates).
// ---------------------------------------------------------------------------

function selfContainedHtml({ title, w, h, sceneB64, wasmB64, glueB64 }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
:root{color-scheme:light dark}
body{margin:2rem auto;max-width:900px;padding:0 1rem;
     font:14px/1.5 system-ui,-apple-system,sans-serif;color:#1c1e21}
figure{margin:0;padding:1rem;border:1px solid #e2e4e8;border-radius:10px;
       background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.stage{position:relative;width:100%;aspect-ratio:${w}/${h}}
.stage canvas{position:absolute;inset:0;width:100%;height:100%;border-radius:6px}
figcaption{font-size:12px;color:#666;margin-top:.6rem;display:flex;
           justify-content:space-between;gap:1rem;flex-wrap:wrap}
.badge{display:inline-flex;align-items:center;gap:.4rem;padding:.15rem .5rem;
       border-radius:999px;font-weight:600}
.gpu{background:#e6f4ea;color:#137333}
.err{background:#fce8e6;color:#c5221f}
.dot{width:.5rem;height:.5rem;border-radius:50%;background:currentColor}
</style>
</head>
<body>
<figure>
  <div class="stage"><canvas id="cv" width="${w}" height="${h}"></canvas></div>
  <figcaption>
    <span id="status" class="badge">starting…</span>
    <span>${title}</span>
  </figcaption>
</figure>
<script id="veusz-scene" type="text/plain">${sceneB64}</script>
<script id="veusz-wasm"  type="text/plain">${wasmB64}</script>
<script id="veusz-glue"  type="text/plain">${glueB64}</script>
<script type="module">
const st = document.getElementById('status');
const setSt = (cls, txt) => {
  st.className = 'badge ' + cls;
  st.innerHTML = '<span class="dot"></span>' + txt;
};
const b64 = id => {
  const s = atob(document.getElementById(id).textContent);
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
};
async function go() {
  if (!('gpu' in navigator)) { setSt('err', 'WebGPU required (Chrome / Safari 26+)'); return; }
  setSt('gpu', 'loading…');
  const wasmBytes = b64('veusz-wasm');
  const glueText  = new TextDecoder().decode(b64('veusz-glue'));
  const blobURL   = URL.createObjectURL(new Blob([glueText], { type: 'application/javascript' }));
  const mod = await import(blobURL);
  await mod.default({ module_or_path: wasmBytes });
  const renderer  = await new mod.VelloCanvasRenderer(document.getElementById('cv'));
  const scene     = b64('veusz-scene');
  const t0 = performance.now();
  await renderer.render(scene, 1, 1, 1, 1);
  setSt('gpu', 'Rendered in-browser via WASM/WebGPU · ' +
        (performance.now() - t0).toFixed(0) + ' ms');
}
go().catch(e => { setSt('err', 'render failed: ' + e); console.error(e); });
</script>
</body>
</html>
`;
}

function buildSelfContained(args) {
  const vsz = args._[1];
  const stem = basename(vsz, extname(vsz));
  const wantsFile = args.out.toLowerCase().endsWith('.html');
  const outFile = wantsFile ? resolve(args.out) : resolve(join(args.out, `${stem}.html`));
  mkdirSync(dirname(outFile), { recursive: true });

  // 1) capture scene at given size via the local veusz.
  const python = resolvePython(args.python);
  const captureScript = join(REPO, 'scripts', 'capture_scene.py');
  if (!existsSync(captureScript)) {
    console.error(`missing ${captureScript}`); process.exit(1);
  }
  let scene;
  try {
    scene = execFileSync(python, [
      captureScript, vsz, '--width', String(args.width),
      '--height', String(args.height), '-o', '-',
    ], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    const why = (e && e.stderr ? String(e.stderr).trim().split('\n').slice(-3).join('\n')
                                : e && e.message) || 'unknown error';
    console.error(`scene capture failed (${python}):\n${why}`);
    process.exit(1);
  }
  if (!scene || scene.length === 0) {
    console.error('scene capture produced no output'); process.exit(1);
  }

  // 2) read Vello wasm + JS glue from the crate's pkg/ (or public/wasm/ fallback).
  const pkg = `${TAURI}/crates/veusz-paint-wasm/pkg`;
  const wasmPath = existsSync(`${pkg}/veusz_paint_wasm_bg.wasm`)
    ? `${pkg}/veusz_paint_wasm_bg.wasm`
    : `${TAURI}/public/wasm/veusz_paint_wasm_bg.wasm`;
  const gluePath = existsSync(`${pkg}/veusz_paint_wasm.js`)
    ? `${pkg}/veusz_paint_wasm.js`
    : `${TAURI}/public/wasm/veusz_paint_wasm.js`;
  for (const p of [wasmPath, gluePath]) {
    if (!existsSync(p)) {
      console.error(`missing Vello wasm artifact ${p} — run scripts/build_paint_wasm.sh`);
      process.exit(1);
    }
  }

  // 3) base64-encode every payload so embedding in <script type=text/plain>
  //    can't collide with any HTML lexer state — even inside the wasm/glue.
  const sceneB64 = Buffer.from(scene).toString('base64');
  const wasmB64  = readFileSync(wasmPath).toString('base64');
  const glueB64  = readFileSync(gluePath).toString('base64');

  const html = selfContainedHtml({
    title: stem, w: args.width, h: args.height,
    sceneB64, wasmB64, glueB64,
  });
  writeFileSync(outFile, html);
  const kb = (statSync(outFile).size / 1024).toFixed(0);
  console.log(`self-contained HTML written to ${outFile} (${kb} KB; opens from file://)`);
}

function copyTree(srcDir, dstDir, filter = () => true) {
  mkdirSync(dstDir, { recursive: true });
  for (const f of readdirSync(srcDir)) {
    const src = join(srcDir, f);
    if (statSync(src).isDirectory()) {
      // Recurse so nested build output is preserved — notably
      // dist-embed/assets/, which holds the Pyodide worker chunk that
      // veusz-embed.js loads via a relative `assets/…` URL. A flat copy
      // dropped it and the vendored (--bundle) embed 404'd on the worker.
      copyTree(src, join(dstDir, f), filter);
    } else if (filter(f)) {
      copyFileSync(src, join(dstDir, f));
    }
  }
}

function build(args) {
  const vsz = args._[1];
  if (!vsz) { console.error('usage: veusz-embed build <file.vsz> -o <dir> [--bundle|--self-contained]'); process.exit(2); }
  if (!existsSync(vsz)) { console.error(`no such file: ${vsz}`); process.exit(2); }

  // --self-contained: bake the scene + Vello wasm into ONE HTML. Skip the
  // poster (the figure renders unconditionally) and don't copy the .vsz —
  // there's nothing else to ship.
  if (args.selfContained) {
    buildSelfContained(args);
    return;
  }

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
  console.error('usage: veusz-embed build <file.vsz> -o <dir|file.html> ' +
    '[--self-contained|--bundle] [--cdn <base>] [--poster <img>|--no-poster]');
  process.exit(2);
}
build(args);
