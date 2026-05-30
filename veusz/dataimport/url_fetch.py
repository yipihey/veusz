#    Copyright (C) 2026 Tom Abel & Veusz contributors.
#
#    This file is part of Veusz.
#
#    Veusz is free software: you can redistribute it and/or modify it
#    under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 2 of the License, or
#    (at your option) any later version.
##############################################################################

"""HTTP fetching for `LinkedFileURL` — a swappable single-seam abstraction.

The default fetcher uses `urllib.request` with conditional GET
(`If-None-Match` / `If-Modified-Since`) and works on desktop Veusz. The
in-browser WASM/Pyodide embed cannot make network calls from Python, so it
installs :func:`_pyodide_cache_only_fetcher` (via :func:`set_fetcher`); the JS
side performs each `fetch()` and feeds bytes into the cache via the daemon
handler ``data.url_ingest``.

The same `_cache` is shared by both fetchers — the default urllib fetcher
remembers the last ETag / Last-Modified per URL so subsequent reloads send the
right conditional headers, and the Pyodide fetcher reads body + headers from
the cache (raising a clear :class:`ImportingError` if the JS side hasn't
ingested yet).
"""

from __future__ import annotations

import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Callable, Dict, Optional


# Hard cap on a single URL response body. Configurable in a later version;
# 64 MB covers typical scientific CSV / FITS files without risking OOM in
# the browser tab.
MAX_BYTES = 64 * 1024 * 1024


@dataclass(frozen=True)
class FetchResult:
    """Result of a (possibly conditional) URL fetch."""
    body: bytes                       # empty when not_modified
    etag: Optional[str]
    last_modified: Optional[str]
    not_modified: bool                # True on HTTP 304
    content_type: Optional[str]       # for format inference


@dataclass
class _CacheEntry:
    body: bytes
    etag: Optional[str]
    last_modified: Optional[str]
    content_type: Optional[str]


Fetcher = Callable[..., FetchResult]    # fetcher(url, *, etag=, last_modified=, extra_headers=)


_cache: Dict[str, _CacheEntry] = {}
_fetcher: Optional[Fetcher] = None


# -- fetcher selection -----------------------------------------------------

def set_fetcher(fn: Optional[Fetcher]) -> None:
    """Install a custom fetcher (or `None` to restore the urllib default)."""
    global _fetcher
    _fetcher = fn


def reset_fetcher() -> None:
    set_fetcher(None)


def get_fetcher() -> Fetcher:
    return _fetcher or _default_urllib_fetcher


# -- public entry point ----------------------------------------------------

def fetch_url(url: str,
              etag: Optional[str] = None,
              last_modified: Optional[str] = None,
              base: Optional[str] = None,
              extra_headers: Optional[Dict[str, str]] = None) -> FetchResult:
    """Fetch a URL via the installed fetcher.

    `base` (optional) is a base URL — including a `file://...` URL — against
    which a relative `url` is resolved with `urllib.parse.urljoin`. Absolute
    URLs are passed through unchanged.
    """
    resolved = urllib.parse.urljoin(base, url) if base else url
    return get_fetcher()(resolved,
                         etag=etag, last_modified=last_modified,
                         extra_headers=extra_headers)


def ingest_bytes(url: str, body: bytes, *,
                 etag: Optional[str] = None,
                 last_modified: Optional[str] = None,
                 content_type: Optional[str] = None) -> None:
    """Stash bytes for the next fetch of `url` (used by the Pyodide bridge)."""
    if len(body) > MAX_BYTES:
        raise ValueError(f'URL body exceeds {MAX_BYTES} bytes')
    _cache[url] = _CacheEntry(body=body, etag=etag,
                              last_modified=last_modified,
                              content_type=content_type)


def clear_cache() -> None:
    """Drop every cached entry. For tests + Bridge re-init."""
    _cache.clear()


def cached_entry(url: str) -> Optional[_CacheEntry]:
    """Inspect a cached entry (read-only) — for diagnostics + tests."""
    return _cache.get(url)


# -- default fetcher (desktop) --------------------------------------------

def _default_urllib_fetcher(url: str, *,
                            etag: Optional[str] = None,
                            last_modified: Optional[str] = None,
                            extra_headers: Optional[Dict[str, str]] = None
                            ) -> FetchResult:
    """Default fetcher: `urllib.request` with conditional GET."""
    cached = _cache.get(url)
    cond_etag = etag or (cached.etag if cached else None)
    cond_lm = last_modified or (cached.last_modified if cached else None)
    headers = dict(extra_headers or {})
    if cond_etag:
        headers['If-None-Match'] = cond_etag
    if cond_lm:
        headers['If-Modified-Since'] = cond_lm
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            cl = resp.headers.get('Content-Length')
            if cl is not None:
                try:
                    if int(cl) > MAX_BYTES:
                        raise ValueError(f'URL body exceeds {MAX_BYTES} bytes')
                except ValueError as exc:
                    if 'exceeds' in str(exc):
                        raise
                    # bad Content-Length header — fall through to read
            body = resp.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                raise ValueError(f'URL body exceeds {MAX_BYTES} bytes')
            new_etag = resp.headers.get('ETag')
            new_lm = resp.headers.get('Last-Modified')
            new_ct = resp.headers.get('Content-Type')
            _cache[url] = _CacheEntry(
                body=body, etag=new_etag, last_modified=new_lm,
                content_type=new_ct)
            return FetchResult(body=body, etag=new_etag,
                               last_modified=new_lm, not_modified=False,
                               content_type=new_ct)
    except urllib.error.HTTPError as e:
        if e.code == 304:
            ent = _cache.get(url)
            return FetchResult(
                body=b'',
                etag=ent.etag if ent else cond_etag,
                last_modified=ent.last_modified if ent else cond_lm,
                not_modified=True,
                content_type=ent.content_type if ent else None)
        # Wrap as ImportingError so the document loader doesn't treat this
        # like a missing local file (which would prompt for a new path).
        from .base import ImportingError
        raise ImportingError(
            f'URL fetch failed ({e.code} {e.reason}): {url}') from e
    except urllib.error.URLError as e:
        from .base import ImportingError
        raise ImportingError(f'URL fetch failed: {url}: {e.reason}') from e


# -- Pyodide cache-only fetcher -------------------------------------------

def _pyodide_cache_only_fetcher(url: str, *,
                                etag: Optional[str] = None,
                                last_modified: Optional[str] = None,
                                extra_headers: Optional[Dict[str, str]] = None
                                ) -> FetchResult:
    """Cache-only fetcher for runtimes (Pyodide) that can't reach the network
    from Python directly. The JS bridge must call :func:`ingest_bytes` before
    any `LinkedFileURL` reload.

    Honors caller-supplied `etag` / `last_modified`: if they match the cached
    entry, we return `not_modified=True` so the reload becomes a no-op (the
    JS side polls cheaply, hands us the cached headers, and we tell Python
    nothing changed — datasets stay put).
    """
    ent = _cache.get(url)
    if ent is None:
        from .base import ImportingError
        raise ImportingError(
            f'No cached bytes for URL: {url}; '
            f'JS must call data.url_ingest first.')
    if etag and ent.etag and etag == ent.etag:
        return FetchResult(body=b'', etag=ent.etag,
                           last_modified=ent.last_modified,
                           not_modified=True, content_type=ent.content_type)
    if (last_modified and ent.last_modified
            and last_modified == ent.last_modified):
        return FetchResult(body=b'', etag=ent.etag,
                           last_modified=ent.last_modified,
                           not_modified=True, content_type=ent.content_type)
    return FetchResult(body=ent.body, etag=ent.etag,
                       last_modified=ent.last_modified,
                       not_modified=False, content_type=ent.content_type)
