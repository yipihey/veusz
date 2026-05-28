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
 * Build the artifacts first:
 *   pnpm build:embed                                  # dist-embed/veusz-embed.js
 *   .venv/bin/python ../scripts/build_embed_wheel.py  # dist/veusz-*.whl
 *   pnpm sync-wasm                                    # public/wasm/*
 */

import { readFileSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const TAURI = resolve(HERE, '..');
const REPO = resolve(TAURI, '..');
const VERSION = readFileSync(`${REPO}/VERSION`, 'utf-8').trim();
const WHEEL = `veusz-${VERSION}-py3-none-any.whl`;
const DEFAULT_CDN = 'https://veusz.github.io/veusz-embed';

function parseArgs(argv) {
  const a = { _: [], bundle: false, out: 'dist', cdn: DEFAULT_CDN, width: 700, height: 500, pyodide: '' };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--bundle') a.bundle = true;
    else if (t === '-o' || t === '--out') a.out = argv[++i];
    else if (t === '--cdn') a.cdn = argv[++i].replace(/\/+$/, '');
    else if (t === '--width') a.width = Number(argv[++i]);
    else if (t === '--height') a.height = Number(argv[++i]);
    else if (t === '--pyodide') a.pyodide = argv[++i].replace(/\/+$/, '');
    else a._.push(t);
  }
  return a;
}

function html({ vszName, width, height, scriptSrc, wasmBase, wheelUrl, pyodideIndex }) {
  const pyAttr = pyodideIndex ? `\n    pyodide-index="${pyodideIndex}"` : '';
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
    width="${width}" height="${height}"
    wasm-base="${wasmBase}"
    veusz-wheel="${wheelUrl}"${pyAttr}></veusz-figure>
</body>
</html>
`;
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
  mkdirSync(out, { recursive: true });
  copyFileSync(vsz, join(out, vszName));

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
      vszName, width: args.width, height: args.height,
      scriptSrc: './veusz-embed.js', wasmBase: './wasm', wheelUrl: `./${WHEEL}`,
      pyodideIndex: args.pyodide || '',
    }));
    console.log(`bundle written to ${out}/ (self-contained; Pyodide core ${args.pyodide ? 'vendored' : 'from jsDelivr'})`);
  } else {
    writeFileSync(join(out, 'index.html'), html({
      vszName, width: args.width, height: args.height,
      scriptSrc: `${args.cdn}/veusz-embed.js`, wasmBase: `${args.cdn}/wasm`,
      wheelUrl: `${args.cdn}/${WHEEL}`, pyodideIndex: args.pyodide || '',
    }));
    console.log(`CDN page written to ${out}/index.html (runtime from ${args.cdn}); host it + ${vszName}`);
  }
}

const args = parseArgs(process.argv.slice(2));
if (args._[0] !== 'build') {
  console.error('usage: veusz-embed build <file.vsz> -o <dir> [--bundle] [--cdn <base>]');
  process.exit(2);
}
build(args);
