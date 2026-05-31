"""Headless (Qt-free) scene capture must match real-Qt capture.

Simulates the Pyodide environment by blocking PyQt6 and the compiled helper
extensions in a subprocess, so the production fallbacks engage:
``qtall`` -> ``qtshim`` and ``helpers`` -> ``qtloops_py``. We then capture a
document's Scene IR both ways and assert the op histograms match — the proof
that the in-browser engine produces the same drawing as the desktop.
"""

import json
import os
import subprocess
import sys
from collections import Counter

import pytest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXAMPLES = os.path.join(REPO, 'examples')

# Block PyQt6 and every compiled veusz.helpers.* extension, then capture.
_CHILD = r'''
import sys, json
# Pyodide simulation: a meta-path finder that makes PyQt6 and the compiled
# helper extensions appear absent (raising in find_spec lets the production
# fallbacks engage: qtall->qtshim, helpers->qtloops_py/inert). We raise rather
# than null sys.modules so package __init__ still runs and can register the
# fallback (nulling would short-circuit the import machinery).
_BLOCK = {
    'veusz.helpers.qtloops', 'veusz.helpers._nc_cntr', 'veusz.helpers.threed',
    'veusz.helpers.qtmml', 'veusz.helpers.recordpaint',
}
class _Blocker:
    def find_spec(self, name, path=None, target=None):
        if name == 'PyQt6' or name.startswith('PyQt6.') or name in _BLOCK:
            raise ModuleNotFoundError(f'blocked for headless test: {name}', name=name)
        return None
sys.meta_path.insert(0, _Blocker())

import veusz.widgets, veusz.dataimport     # registers types via the shim
from veusz import qtall as qt
assert not str(qt.QColor).startswith("<class 'PyQt6"), "PyQt6 leaked into shim run"
from veusz.helpers import qtloops
assert getattr(qtloops, "_VEUSZ_PURE_RECORDER", False), "pure qtloops not active"

from veusz import document
from veusz.paint.qt_capture import capture_document_scene

doc = document.Document()
doc.load(sys.argv[1])
scene = capture_document_scene(doc, page=0, pagesize_px=(566, 566), dpi=(96.0, 96.0))
data = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
ops = json.loads(data)["ops"]
hist = {}
for op in ops:
    k = op if isinstance(op, str) else next(iter(op))
    hist[k] = hist.get(k, 0) + 1
print("VEUSZ_HIST " + json.dumps({"n": len(ops), "hist": hist}))
'''


def _shim_histogram(vsz_path):
    env = dict(os.environ, QT_QPA_PLATFORM='offscreen')
    out = subprocess.run(
        [sys.executable, '-c', _CHILD, vsz_path],
        capture_output=True, text=True, env=env, cwd=REPO)
    line = next((ln for ln in out.stdout.splitlines()
                 if ln.startswith('VEUSZ_HIST ')), None)
    assert line is not None, (
        f'shim capture failed:\nSTDOUT:\n{out.stdout[-2000:]}\n'
        f'STDERR:\n{out.stderr[-3000:]}')
    return json.loads(line[len('VEUSZ_HIST '):])


def _qt_histogram(vsz_path):
    # Runs in-process with real PyQt6 (qtall uses PyQt6 here).
    from veusz import document
    from veusz.paint.qt_capture import capture_document_scene
    doc = document.Document()
    doc.load(vsz_path)
    scene = capture_document_scene(
        doc, page=0, pagesize_px=(566, 566), dpi=(96.0, 96.0))
    data = bytes(scene) if isinstance(scene, (bytes, bytearray)) else scene.encode()
    ops = json.loads(data)['ops']
    c = Counter(op if isinstance(op, str) else next(iter(op)) for op in ops)
    return {'n': len(ops), 'hist': dict(c)}


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication([''])
    import veusz.widgets  # noqa: F401
    import veusz.dataimport  # noqa: F401
    yield app


# Drives the Pyodide bridge end-to-end under the same blocker.
_BRIDGE_CHILD = r'''
import sys, json
_BLOCK = {
    'veusz.helpers.qtloops', 'veusz.helpers._nc_cntr', 'veusz.helpers.threed',
    'veusz.helpers.qtmml', 'veusz.helpers.recordpaint',
}
class _Blocker:
    def find_spec(self, name, path=None, target=None):
        if name == 'PyQt6' or name.startswith('PyQt6.') or name in _BLOCK:
            raise ModuleNotFoundError(name, name=name)
        return None
sys.meta_path.insert(0, _Blocker())

import veusz.daemon.pyodide_bridge as B
events = []
br = B.Bridge()
br.set_notify(lambda m: events.append(json.loads(m)['method']))

r = br.load_vsz(open(sys.argv[1], encoding='utf-8').read())
assert 'result' in r, r

resp = json.loads(br.dispatch_json(json.dumps(
    {'id': 1, 'method': 'render.scene',
     'params': {'page': 0, 'w': 566, 'h': 566, 'dpi': 96}})))
assert 'result' in resp, resp
res = resp['result']

tree = json.loads(br.dispatch_json(json.dumps({'id': 2, 'method': 'doc.tree'})))
assert 'result' in tree, tree

# pixel->data at the graph centre should map onto a horizontal + vertical axis.
p2d = json.loads(br.dispatch_json(json.dumps(
    {'id': 3, 'method': 'render.pixel_to_data',
     'params': {'x': 283, 'y': 283}})))
assert 'result' in p2d, p2d
dirs = sorted(a['direction'] for a in p2d['result']['axes'])

print('BRIDGE ' + json.dumps({
    'has_scene': bool(res.get('scene_b64')),
    'w': res.get('width'), 'nbounds': len(res.get('bounds') or {}),
    'events': events, 'roottype': tree['result'].get('type'),
    'p2d_dirs': dirs,
}))
'''


def test_pyodide_bridge_headless():
    env = dict(os.environ, QT_QPA_PLATFORM='offscreen')
    out = subprocess.run(
        [sys.executable, '-c', _BRIDGE_CHILD, os.path.join(EXAMPLES, 'fit.vsz')],
        capture_output=True, text=True, env=env, cwd=REPO)
    line = next((ln for ln in out.stdout.splitlines()
                 if ln.startswith('BRIDGE ')), None)
    assert line is not None, (
        f'bridge run failed:\nSTDOUT:\n{out.stdout[-2000:]}\n'
        f'STDERR:\n{out.stderr[-3000:]}')
    info = json.loads(line[len('BRIDGE '):])
    assert info['has_scene'] is True
    assert info['w'] == 566 and info['nbounds'] > 0
    assert 'doc.changed' in info['events']
    assert info['roottype'] == 'document'
    # navigate backend: the centre point maps onto both an x and a y axis.
    assert set(info['p2d_dirs']) == {'horizontal', 'vertical'}


@pytest.mark.parametrize('name', [
    'fit.vsz', 'barplots.vsz', 'coloredpoints.vsz', 'profile.vsz',
])
def test_headless_capture_matches_qt(name):
    vsz = os.path.join(EXAMPLES, name)
    qt_h = _qt_histogram(vsz)
    shim_h = _shim_histogram(vsz)
    assert shim_h['hist'] == qt_h['hist'], (
        f'op histogram mismatch for {name}:\n'
        f'  qt  : {qt_h}\n  shim: {shim_h}')


# ---- 3D ----------------------------------------------------------------
#
# Op-histogram parity vs real Qt is NOT a useful metric for 3D: the C++
# `threed` extension calls QPainter methods directly from C++, bypassing the
# Python-level overrides our `SceneCapturingPainter` installs. So real Qt
# captures almost nothing for a 3D widget (only a handful of axis-label text
# ops via the Python text renderer). Our pure-Python ``threed_py`` is the
# first time 3D actually reaches the Scene IR — the test here just asserts
# the engine runs end-to-end and emits a non-trivial scene for every shipped
# 3D example, plus a meaningful number of fills for the scatter examples.

@pytest.mark.parametrize('name,min_ops,min_fills', [
    ('3d_points.vsz',   500, 100),   # full scatter
    ('3d_errors.vsz',   500, 100),   # scatter + error bars
    # function/surface/volume render axes + frame only in v1 (Mesh / DataMesh /
    # MultiCuboid emit no fragments yet — primitives are stubbed).
    ('3d_function.vsz', 100, 0),
    ('3d_surface.vsz',  100, 0),
    ('3d_volume.vsz',   100, 0),
])
def test_3d_example_captures_under_shim(name, min_ops, min_fills):
    h = _shim_histogram(os.path.join(EXAMPLES, name))
    total = h['n']
    fills = h['hist'].get('FillPath', 0)
    assert total >= min_ops, f'{name}: only {total} ops captured (want >= {min_ops})'
    assert fills >= min_fills, f'{name}: only {fills} fills (want >= {min_fills})'
