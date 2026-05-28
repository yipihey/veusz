/**
 * Real-Pyodide smoke test for the in-browser Veusz runtime.
 *
 * Boots Pyodide (CPython→WASM) in Node, loads numpy + fonttools, mounts the
 * repo as the veusz source (no wheel needed — "source mode"), then drives the
 * Pyodide bridge: open a .vsz and capture render.scene. Proves the W1/W2
 * backend runs under a *real* WASM runtime, not just the desktop test blocker.
 *
 * Run:
 *   cd veusz-tauri && npm i --no-save pyodide@0.26.4 && node scripts/pyodide-smoke.mjs
 *
 * Requires network (Pyodide packages load from the jsDelivr CDN on first run,
 * then cache). Not part of the default vitest/pytest suites.
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadPyodide } from 'pyodide';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');           // veusz-tauri/scripts -> repo root
const VSZ = process.argv[2] ?? `${REPO}/examples/fit.vsz`;

const py = await loadPyodide();
await py.loadPackage(['numpy', 'micropip']);
const micropip = py.pyimport('micropip');
await micropip.install('fonttools');

py.FS.mkdir('/repo');
py.FS.mount(py.FS.filesystems.NODEFS, { root: REPO }, '/repo');
await py.runPythonAsync(`import sys; sys.path.insert(0, '/repo')`);

const out = await py.runPythonAsync(`
import json
import veusz.daemon.pyodide_bridge as B
from veusz import qtall as qt
events = []
br = B.Bridge()
br.set_notify(lambda m: events.append(json.loads(m)['method']))
r = br.dispatch('file.open', {'path': ${JSON.stringify('/repo' + VSZ.replace(REPO, ''))}})
assert 'result' in r, r
resp = json.loads(br.dispatch_json(json.dumps(
    {'id': 1, 'method': 'render.scene',
     'params': {'page': 0, 'w': 566, 'h': 566, 'dpi': 96}})))
assert 'result' in resp, resp
res = resp['result']
json.dumps({
  'qt_backend': 'shim' if 'qtshim' in str(qt.QColor) else 'pyqt',
  'has_scene': bool(res.get('scene_b64')),
  'scene_len': len(res.get('scene_b64') or ''),
  'width': res.get('width'),
  'nbounds': len(res.get('bounds') or {}),
  'events': events,
})
`);

const info = JSON.parse(out);
console.log('pyodide smoke result:', info);
if (info.qt_backend !== 'shim' || !info.has_scene || info.width !== 566
    || info.nbounds < 1 || !info.events.includes('doc.changed')) {
  console.error('SMOKE FAILED');
  process.exit(1);
}
console.log('SMOKE OK — Veusz runs in real Pyodide and captured a scene.');
