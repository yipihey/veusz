/**
 * Validate the headless veusz WHEEL under real Pyodide — the production import
 * path (micropip-install the wheel, no source mount). Proves the wheel is
 * self-contained: imports under WASM CPython and renders a scene with the
 * font packaged inside the wheel.
 *
 * Prereq:
 *   .venv/bin/python scripts/build_embed_wheel.py   # builds dist/veusz-*.whl
 *   cd veusz-tauri && npm i --no-save pyodide@0.26.4 && node scripts/pyodide-wheel-smoke.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadPyodide } from 'pyodide';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const DIST = `${REPO}/dist`;
const wheel = readdirSync(DIST).find((f) => f.startsWith('veusz-') && f.endsWith('.whl'));
if (!wheel) {
  console.error('no wheel in dist/ — run scripts/build_embed_wheel.py first');
  process.exit(1);
}
const VSZ = readFileSync(`${REPO}/examples/fit.vsz`, 'utf-8');

const py = await loadPyodide();
await py.loadPackage(['numpy', 'micropip']);
const micropip = py.pyimport('micropip');
await micropip.install('fonttools');

py.FS.mkdir('/whl');
py.FS.mount(py.FS.filesystems.NODEFS, { root: DIST }, '/whl');
await micropip.install(`emfs:/whl/${wheel}`);

// Exercise the EXACT JS-side path runtime.ts + pyodideTransport use: construct
// the bridge by CALLING it (not `new` — that returns a bare JS object lacking
// the Python methods), register the notify callback, and dispatch via JSON.
const mod = py.pyimport('veusz.daemon.pyodide_bridge');
const bridge = mod.Bridge();
if (typeof bridge.set_notify !== 'function' || typeof bridge.dispatch_json !== 'function') {
  console.error('bridge methods missing — Pyodide construction regressed'); process.exit(1);
}
const events = [];
bridge.set_notify((m) => events.push(JSON.parse(m).method));
const call = (method, params = {}) => {
  const r = JSON.parse(bridge.dispatch_json(JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })));
  if (r.error) throw new Error(`${method}: ${r.error.message}`);
  return r.result;
};

py.FS.mkdir('/veusz');
py.FS.writeFile('/veusz/fit.vsz', VSZ);
call('file.open', { path: '/veusz/fit.vsz' });
const scene = call('render.scene', { page: 0, w: 566, h: 566, dpi: 96 });
const p2d = call('render.pixel_to_data', { x: 283, y: 283 });
const fontPath = py.runPython('from veusz import qtshim; qtshim._DEFAULT_TTF');

const info = {
  has_scene: !!scene.scene_b64,
  nbounds: Object.keys(scene.bounds || {}).length,
  events,
  p2d_dirs: [...new Set(p2d.axes.map((a) => a.direction))].sort(),
  font_in_wheel: String(fontPath).includes('site-packages/veusz/embed_data'),
};
console.log('wheel smoke:', info, '(wheel:', wheel + ')');
if (!info.has_scene || info.nbounds < 1 || !info.events.includes('doc.changed')
    || info.p2d_dirs.join() !== 'horizontal,vertical' || !info.font_in_wheel) {
  console.error('WHEEL SMOKE FAILED'); process.exit(1);
}
console.log('OK — wheel imports under Pyodide; JS-side bridge + transport flow renders a scene.');
