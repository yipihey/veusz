"""Tests for the daemon's URL data-source RPC handlers.

Uses the synchronous Bridge directly (not the socket daemon) — it's the same
code path the Pyodide embed uses, and tests stay tight.
"""

from __future__ import annotations

import base64
import json
import os
import sys

import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')

from veusz.dataimport import url_fetch


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets, dataimport  # noqa: F401
    yield app


@pytest.fixture(autouse=True)
def _reset_url_fetch():
    url_fetch.clear_cache()
    url_fetch.reset_fetcher()
    yield
    url_fetch.clear_cache()
    url_fetch.reset_fetcher()


@pytest.fixture
def bridge():
    """Fresh Bridge per test, with the Pyodide cache-only fetcher installed
    — this mirrors the real embed environment."""
    from veusz.daemon.pyodide_bridge import Bridge
    b = Bridge()
    # The handlers expect the Pyodide fetcher (cache-only): URL bytes come
    # from data.url_ingest, never from real network.
    url_fetch.set_fetcher(url_fetch._pyodide_cache_only_fetcher)
    return b


def _ok(resp):
    if 'error' in resp:
        raise AssertionError(f"RPC error: {resp['error']}")
    return resp['result']


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode('ascii')


def _import_url(bridge, url='http://example.com/data.csv',
                csv_body=b'x,y\n1,2\n3,4\n'):
    """Helper: ingest CSV bytes then run ImportFileURL via eval.python."""
    _ok(bridge.dispatch('data.url_ingest', {
        'url': url,
        'bytes_b64': _b64(csv_body),
        'content_type': 'text/csv',
    }))
    # Execute the command directly through the CommandInterface — the
    # eval.python handler would also work but this is cleaner.
    from veusz.document.commandinterface import CommandInterface
    ci = CommandInterface(bridge.ctx.document)
    return ci.ImportFileURL(url, format='csv', linked=True)


# -- list_url_links --------------------------------------------------------

def test_list_url_links_empty_by_default(bridge):
    assert _ok(bridge.dispatch('data.list_url_links', {})) == []


def test_list_url_links_returns_url_state_after_import(bridge):
    _import_url(bridge)
    links = _ok(bridge.dispatch('data.list_url_links', {}))
    assert len(links) == 1
    link = links[0]
    assert link['url'] == 'http://example.com/data.csv'
    assert link['format'] == 'csv'
    assert set(link['names']) >= {'x', 'y'}


# -- url_ingest validation -------------------------------------------------

def test_url_ingest_rejects_empty_url(bridge):
    resp = bridge.dispatch('data.url_ingest', {'url': '', 'bytes_b64': ''})
    assert 'error' in resp


def test_url_ingest_rejects_bad_base64(bridge):
    resp = bridge.dispatch('data.url_ingest', {
        'url': 'http://x/y', 'bytes_b64': '@@@not base64@@@'})
    assert 'error' in resp


# -- reload_url + notification --------------------------------------------

def test_reload_url_replaces_dataset_and_publishes_change(bridge):
    """Re-ingest different bytes + reload_url → datasets update + data.changed."""
    _import_url(bridge, csv_body=b'x,y\n1,2\n3,4\n')
    assert list(bridge.ctx.document.data['x'].data) == [1.0, 3.0]

    # Subscribe to data.changed via the BrowserNotifier (the same hook JS uses).
    seen = []
    bridge.set_notify(lambda msg: seen.append(json.loads(msg)))

    # New bytes: a different ETag so the cache-only fetcher returns them
    # (otherwise a matching ETag would yield not_modified=True).
    _ok(bridge.dispatch('data.url_ingest', {
        'url': 'http://example.com/data.csv',
        'bytes_b64': _b64(b'x,y\n10,20\n30,40\n'),
        'etag': 'v2',
        'content_type': 'text/csv',
    }))
    r = _ok(bridge.dispatch('data.reload_url',
                            {'url': 'http://example.com/data.csv'}))
    assert r['reloaded']  # non-empty
    assert r['not_modified'] is False
    assert list(bridge.ctx.document.data['x'].data) == [10.0, 30.0]

    methods = [m['method'] for m in seen]
    assert 'data.changed' in methods


def test_reload_url_unknown_url_errors(bridge):
    resp = bridge.dispatch('data.reload_url', {'url': 'http://nope/'})
    assert 'error' in resp


# -- url_refresh -----------------------------------------------------------

def test_url_refresh_combined_ingest_and_reload(bridge):
    _import_url(bridge, csv_body=b'x,y\n1,2\n3,4\n')
    r = _ok(bridge.dispatch('data.url_refresh', {
        'url': 'http://example.com/data.csv',
        'bytes_b64': _b64(b'x,y\n7,8\n9,0\n'),
        'etag': 'v3',
        'content_type': 'text/csv',
    }))
    assert r['reloaded']
    assert list(bridge.ctx.document.data['x'].data) == [7.0, 9.0]


def test_url_refresh_not_modified_short_circuits(bridge):
    _import_url(bridge, csv_body=b'x,y\n1,2\n')
    r = _ok(bridge.dispatch('data.url_refresh', {
        'url': 'http://example.com/data.csv',
        'not_modified': True,
    }))
    assert r == {'reloaded': [], 'errors': {}, 'not_modified': True}
    # Datasets must be untouched.
    assert list(bridge.ctx.document.data['x'].data) == [1.0]


def test_url_refresh_missing_bytes_errors(bridge):
    resp = bridge.dispatch('data.url_refresh', {
        'url': 'http://example.com/data.csv'})
    assert 'error' in resp
