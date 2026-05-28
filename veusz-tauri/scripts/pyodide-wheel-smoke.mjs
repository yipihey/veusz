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

py.FS.mkdir('/veusz');
py.FS.writeFile('/veusz/fit.vsz', VSZ);

const out = await py.runPythonAsync(`
import json, os
import veusz.daemon.pyodide_bridge as B
from veusz import qtall as qt, qtshim
br = B.Bridge()
assert 'result' in br.dispatch('file.open', {'path': '/veusz/fit.vsz'})
resp = json.loads(br.dispatch_json(json.dumps(
    {'id': 1, 'method': 'render.scene',
     'params': {'page': 0, 'w': 566, 'h': 566, 'dpi': 96}})))
res = resp['result']
json.dumps({
  'backend': 'shim' if 'qtshim' in str(qt.QColor) else 'pyqt',
  'font_in_wheel': 'site-packages/veusz/embed_data' in qtshim._DEFAULT_TTF and os.path.exists(qtshim._DEFAULT_TTF),
  'has_scene': bool(res.get('scene_b64')),
  'nbounds': len(res.get('bounds') or {}),
})
`);
const info = JSON.parse(out);
console.log('wheel smoke:', info, '(wheel:', wheel + ')');
if (info.backend !== 'shim' || !info.font_in_wheel || !info.has_scene || info.nbounds < 1) {
  console.error('WHEEL SMOKE FAILED'); process.exit(1);
}
console.log('OK — headless wheel imports under Pyodide and renders with the packaged font.');
