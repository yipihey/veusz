"""Tests for the URL data-source primitive and the LinkedFileURL integration."""

from __future__ import annotations

import io
import os
import sys
import urllib.error
import urllib.request

import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')

from veusz.dataimport import url_fetch
from veusz.dataimport.base import ImportingError


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    """One QApplication for the whole pytest session; registers widgets +
    import commands (including ImportFileURL)."""
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets, dataimport  # noqa: F401  — side-effect imports
    yield app


@pytest.fixture(autouse=True)
def _reset_url_fetch():
    """Each test starts with an empty cache + default fetcher."""
    url_fetch.clear_cache()
    url_fetch.reset_fetcher()
    yield
    url_fetch.clear_cache()
    url_fetch.reset_fetcher()


class _FakeResp:
    """Stand-in for the context manager returned by urllib.request.urlopen."""

    def __init__(self, body: bytes = b'', headers=None):
        self._body = body
        self.headers = headers or {}

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    def read(self, n=None):
        if n is None or n >= len(self._body):
            return self._body
        return self._body[:n]


# -- default urllib fetcher -----------------------------------------------

def test_default_urllib_fetch_captures_etag_and_lm(monkeypatch):
    """A 200 response with ETag/Last-Modified gets cached + echoed back."""
    def fake_urlopen(req, timeout=None):
        return _FakeResp(b'hello,world\n1,2\n', {
            'ETag': '"abc123"',
            'Last-Modified': 'Wed, 21 Oct 2026 07:28:00 GMT',
            'Content-Type': 'text/csv',
        })
    monkeypatch.setattr(urllib.request, 'urlopen', fake_urlopen)

    fr = url_fetch.fetch_url('http://x/y.csv')
    assert fr.body == b'hello,world\n1,2\n'
    assert fr.etag == '"abc123"'
    assert fr.last_modified == 'Wed, 21 Oct 2026 07:28:00 GMT'
    assert fr.content_type == 'text/csv'
    assert fr.not_modified is False
    # cache was populated for the next conditional call.
    assert url_fetch.cached_entry('http://x/y.csv').etag == '"abc123"'


def test_default_urllib_fetch_echoes_conditional_headers(monkeypatch):
    """Second call should send If-None-Match using the cached ETag."""
    seen_headers = []

    def fake_urlopen(req, timeout=None):
        seen_headers.append(dict(req.headers))
        return _FakeResp(b'a,b\n1,2\n', {'ETag': '"e1"'})

    monkeypatch.setattr(urllib.request, 'urlopen', fake_urlopen)
    url_fetch.fetch_url('http://x/y.csv')
    url_fetch.fetch_url('http://x/y.csv')

    # urllib normalizes header keys to capitalized form ("If-none-match").
    second = seen_headers[1]
    assert any(k.lower() == 'if-none-match' and v == '"e1"'
               for k, v in second.items()), second


def test_default_urllib_fetch_304_returns_not_modified(monkeypatch):
    """A 304 yields not_modified=True with cached headers preserved."""
    url_fetch.ingest_bytes('http://x/y.csv', b'cached', etag='"e1"',
                            content_type='text/csv')

    def fake_urlopen(req, timeout=None):
        raise urllib.error.HTTPError(
            req.full_url, 304, 'Not Modified', {}, None)
    monkeypatch.setattr(urllib.request, 'urlopen', fake_urlopen)

    fr = url_fetch.fetch_url('http://x/y.csv')
    assert fr.not_modified is True
    assert fr.body == b''
    assert fr.etag == '"e1"'
    assert fr.content_type == 'text/csv'


def test_default_urllib_fetch_rejects_oversize_via_content_length(monkeypatch):
    def fake_urlopen(req, timeout=None):
        return _FakeResp(b'', {'Content-Length': str(url_fetch.MAX_BYTES + 1)})
    monkeypatch.setattr(urllib.request, 'urlopen', fake_urlopen)
    with pytest.raises(ValueError, match='exceeds'):
        url_fetch.fetch_url('http://x/big')


def test_fetch_url_resolves_relative_against_base(monkeypatch):
    """fetch_url(url, base=...) hands the urljoin'd absolute URL to the fetcher."""
    seen = []

    def fake_urlopen(req, timeout=None):
        seen.append(req.full_url)
        return _FakeResp(b'')

    monkeypatch.setattr(urllib.request, 'urlopen', fake_urlopen)
    url_fetch.fetch_url('data.csv', base='https://lab.example.com/run42/')
    assert seen == ['https://lab.example.com/run42/data.csv']


# -- ingest_bytes ----------------------------------------------------------

def test_ingest_bytes_caps_size():
    with pytest.raises(ValueError, match='exceeds'):
        url_fetch.ingest_bytes('http://x/big',
                                b'\x00' * (url_fetch.MAX_BYTES + 1))


# -- pyodide cache-only fetcher -------------------------------------------

def test_pyodide_fetcher_missing_raises_importing_error():
    url_fetch.set_fetcher(url_fetch._pyodide_cache_only_fetcher)
    with pytest.raises(ImportingError, match='No cached bytes'):
        url_fetch.fetch_url('http://x/nothing')


def test_pyodide_fetcher_returns_cached_body():
    url_fetch.set_fetcher(url_fetch._pyodide_cache_only_fetcher)
    url_fetch.ingest_bytes('http://x/y', b'hello', etag='e1',
                            content_type='text/csv')
    fr = url_fetch.fetch_url('http://x/y')
    assert fr.body == b'hello'
    assert fr.etag == 'e1'
    assert fr.content_type == 'text/csv'
    assert fr.not_modified is False


def test_pyodide_fetcher_honors_matching_etag():
    """When the caller's ETag matches, report not_modified — keeps datasets put."""
    url_fetch.set_fetcher(url_fetch._pyodide_cache_only_fetcher)
    url_fetch.ingest_bytes('http://x/y', b'hello', etag='e1')
    fr = url_fetch.fetch_url('http://x/y', etag='e1')
    assert fr.not_modified is True
    assert fr.body == b''


def test_pyodide_fetcher_honors_matching_last_modified():
    url_fetch.set_fetcher(url_fetch._pyodide_cache_only_fetcher)
    url_fetch.ingest_bytes('http://x/y', b'hi',
                            last_modified='Wed, 21 Oct 2026 07:28:00 GMT')
    fr = url_fetch.fetch_url('http://x/y',
                              last_modified='Wed, 21 Oct 2026 07:28:00 GMT')
    assert fr.not_modified is True


# -- get_fetcher / set_fetcher --------------------------------------------

def test_set_fetcher_overrides_default():
    custom_calls = []

    def custom(url, **kw):
        custom_calls.append((url, kw))
        return url_fetch.FetchResult(b'x', None, None, False, None)

    url_fetch.set_fetcher(custom)
    url_fetch.fetch_url('http://x/y')
    assert custom_calls and custom_calls[0][0] == 'http://x/y'


def test_reset_fetcher_restores_default():
    url_fetch.set_fetcher(lambda *a, **kw: None)  # type: ignore[arg-type]
    url_fetch.reset_fetcher()
    assert url_fetch.get_fetcher() is url_fetch._default_urllib_fetcher


# -- LinkedFileURL / ImportFileURL integration ----------------------------

@pytest.fixture
def comm():
    """Fresh document + CommandInterface for each test."""
    from veusz import document as _doc
    from veusz.document.commandinterface import CommandInterface
    return CommandInterface(_doc.Document())


def _stub_csv_fetcher(body: bytes, *, etag=None, content_type='text/csv'):
    """Build a fetcher returning the given CSV bytes once, then 304s."""
    state = {'served': False}
    def fetcher(url, *, etag=None, last_modified=None, extra_headers=None):
        if state['served']:
            return url_fetch.FetchResult(
                body=b'', etag=etag, last_modified=last_modified,
                not_modified=True, content_type=content_type)
        state['served'] = True
        return url_fetch.FetchResult(
            body=body, etag=etag, last_modified=last_modified,
            not_modified=False, content_type=content_type)
    return fetcher


def test_import_via_url_creates_datasets_linked_to_url(comm):
    """ImportFileURL with a stub fetcher → datasets present, linked to LinkedFileURL."""
    from veusz.dataimport.defn_url import LinkedFileURL
    url_fetch.set_fetcher(_stub_csv_fetcher(b'x,y\n1,2\n3,4\n'))
    names = comm.ImportFileURL('http://example.com/data.csv',
                                format='csv', linked=True)
    assert set(names) >= {'x', 'y'}
    ds = comm.document.data['x']
    assert isinstance(ds.linked, LinkedFileURL)
    assert ds.linked.params.url == 'http://example.com/data.csv'
    assert ds.linked.filename == 'http://example.com/data.csv'


def test_reload_on_304_preserves_datasets(comm):
    """A 304 reload must not wipe the datasets we already have."""
    fetcher = _stub_csv_fetcher(b'x,y\n1,2\n3,4\n')
    url_fetch.set_fetcher(fetcher)
    comm.ImportFileURL('http://example.com/data.csv',
                        format='csv', linked=True)
    x_before = list(comm.document.data['x'].data)

    # Reload — the stub fetcher returns 304 on the second call.
    comm.document.reloadLinkedDatasets()

    assert 'x' in comm.document.data, 'datasets must survive a 304 reload'
    assert list(comm.document.data['x'].data) == x_before


def test_format_inference_from_url_extension(comm):
    """Empty format + .csv URL → 'csv' format chosen via _infer_format."""
    url_fetch.set_fetcher(_stub_csv_fetcher(b'a,b\n1,2\n', content_type=None))
    comm.ImportFileURL('http://example.com/data.csv', format='', linked=True)
    assert 'a' in comm.document.data and 'b' in comm.document.data


def test_format_inference_from_content_type(comm):
    """No extension + Content-Type 'text/csv' → 'csv' format chosen."""
    url_fetch.set_fetcher(_stub_csv_fetcher(b'a,b\n1,2\n',
                                              content_type='text/csv; charset=utf-8'))
    comm.ImportFileURL('http://example.com/data', format='', linked=True)
    assert 'a' in comm.document.data


def test_invalid_format_rejected():
    """ImportParamsURL refuses an unknown format string."""
    from veusz.dataimport.defn_url import ImportParamsURL
    with pytest.raises(ValueError, match='invalid format'):
        ImportParamsURL(url='http://x/y', format='matlab')


def test_saveToFile_emits_ImportFileURL_command(comm):
    """LinkedFileURL.saveToFile produces a re-executable ImportFileURL(...) line."""
    url_fetch.set_fetcher(_stub_csv_fetcher(b'a,b\n1,2\n'))
    comm.ImportFileURL('http://example.com/data.csv',
                        format='csv', poll_seconds=5,
                        dsprefix='run_', linked=True)
    linked = comm.document.data['run_a'].linked
    buf = io.StringIO()
    linked.saveToFile(buf, relpath=None)
    line = buf.getvalue().strip()
    # Must start with the command name + URL as the first positional arg.
    assert line.startswith("ImportFileURL('http://example.com/data.csv'")
    assert "format='csv'" in line
    assert 'poll_seconds=5' in line
    assert "dsprefix='run_'" in line
    assert 'linked=True' in line


def test_getLinkedFiles_finds_url_link(comm):
    """document.getLinkedFiles({url}) must find the LinkedFileURL by URL."""
    from veusz.dataimport.defn_url import LinkedFileURL
    url_fetch.set_fetcher(_stub_csv_fetcher(b'a,b\n1,2\n'))
    comm.ImportFileURL('http://example.com/data.csv',
                        format='csv', linked=True)
    links = comm.document.getLinkedFiles({'http://example.com/data.csv'})
    assert any(isinstance(lf, LinkedFileURL) for lf in links)
