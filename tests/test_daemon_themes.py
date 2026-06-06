"""Tests for the daemon's document-theme RPC handlers (doc.themes /
doc.apply_theme).

Uses the synchronous Bridge directly (the same code path the Pyodide embed
and the WebSocket relay use), so the tests stay tight and need no socket.
"""

from __future__ import annotations

import os
import sys

import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets  # noqa: F401  (registers widget types)
    yield app


@pytest.fixture
def bridge():
    from veusz.daemon.pyodide_bridge import Bridge
    b = Bridge()
    # A minimal document so the stylesheet paths exist and render is exercised.
    from veusz.document.commandinterface import CommandInterface
    ci = CommandInterface(b.ctx.document)
    ci.To(ci.Add('page'))
    ci.To(ci.Add('graph'))
    ci.Add('xy')
    return b


def _ok(resp):
    if 'error' in resp:
        raise AssertionError(f"RPC error: {resp['error']}")
    return resp['result']


def _get(bridge, path):
    return _ok(bridge.dispatch('doc.get', {'paths': [path]}))[path]


def _custom_colors(bridge):
    return dict(bridge.ctx.document.evaluate.def_colors)


# -- doc.themes ------------------------------------------------------------

def test_themes_lists_all_presets(bridge):
    themes = _ok(bridge.dispatch('doc.themes', {}))['themes']
    ids = [t['id'] for t in themes]
    assert ids == ['default', 'publication', 'minimal', 'ggplot2',
                   'seaborn', 'dark', 'grayscale', 'presentation']
    # each carries the preview spec the chooser needs
    for t in themes:
        assert t['label'] and t['description']
        assert isinstance(t['palette'], list)
        assert t['font']
        assert t['fg'].startswith('#') and t['bg'].startswith('#')


# -- doc.apply_theme -------------------------------------------------------

def test_apply_theme_sets_colortheme_and_stylesheet(bridge):
    r = _ok(bridge.dispatch('doc.apply_theme', {'theme': 'ggplot2'}))
    assert r['ok'] and r['theme'] == 'ggplot2'
    assert _get(bridge, '/colorTheme') == 'default1'
    # ggplot2: visible white grid, hidden axis line
    assert _get(bridge, '/StyleSheet/axis/GridLines/hide') is False
    assert _get(bridge, '/StyleSheet/axis/GridLines/color') == 'white'
    assert _get(bridge, '/StyleSheet/axis/Line/hide') is True


def test_apply_dark_overrides_foreground_background(bridge):
    _ok(bridge.dispatch('doc.apply_theme', {'theme': 'dark'}))
    cols = _custom_colors(bridge)
    assert cols.get('foreground') == '#e6e6e6'
    assert cols.get('background') == '#1e1e1e'
    # the document actually resolves them dark/light
    bridge.ctx.document.evaluate.update()
    rc = bridge.ctx.document.evaluate.colors
    assert rc.get('background').name().lower() == '#1e1e1e'
    assert rc.get('foreground').name().lower() == '#e6e6e6'


def test_switching_back_to_light_restores_colors(bridge):
    _ok(bridge.dispatch('doc.apply_theme', {'theme': 'dark'}))
    _ok(bridge.dispatch('doc.apply_theme', {'theme': 'default'}))
    cols = _custom_colors(bridge)
    assert cols.get('foreground') == '#000000'
    assert cols.get('background') == '#ffffff'
    assert _get(bridge, '/colorTheme') == 'default-latest'


def test_apply_theme_is_one_undo_step(bridge):
    doc = bridge.ctx.document
    before = len(doc.historyundo)
    _ok(bridge.dispatch('doc.apply_theme', {'theme': 'presentation'}))
    assert len(doc.historyundo) - before == 1
    # a single undo reverts the whole theme
    _ok(bridge.dispatch('doc.undo', {}))
    assert _get(bridge, '/colorTheme') == 'black'  # back to the doc default


def test_apply_theme_preserves_unrelated_custom_colors(bridge):
    # user defines their own custom colour
    _ok(bridge.dispatch('doc.set_customs', {
        'ctype': 'color', 'entries': [['brandblue', '#0055ff']]}))
    _ok(bridge.dispatch('doc.apply_theme', {'theme': 'dark'}))
    cols = _custom_colors(bridge)
    assert cols.get('brandblue') == '#0055ff'    # preserved
    assert cols.get('background') == '#1e1e1e'    # theme added


def test_apply_unknown_theme_errors(bridge):
    resp = bridge.dispatch('doc.apply_theme', {'theme': 'nope'})
    assert 'error' in resp
