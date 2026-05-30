#    Copyright (C) 2026 Tom Abel & Veusz contributors.
#
#    This file is part of Veusz.
#
#    Veusz is free software: you can redistribute it and/or modify it
#    under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 2 of the License, or
#    (at your option) any later version.
##############################################################################

"""Daemon RPC handlers for URL-linked data sources.

Companion to :mod:`veusz.dataimport.defn_url`. The Pyodide bridge cannot
make synchronous network calls from Python, so the JS side performs each
`fetch()`, hands the bytes to :func:`url_ingest` (or the combined
:func:`url_refresh`), and asks Python to re-run the import.

The same handlers are useful on the desktop daemon too — e.g. a
"refresh now" button can call `data.reload_url(url)` to force a refetch.
"""

from __future__ import annotations

import base64
from typing import Optional

from ...dataimport import url_fetch
from ..errors import RpcError, INVALID_PARAMS


def register(ctx):
    # Import lazily so the handler module stays cheap to import on the
    # desktop daemon path that never loads URLs.
    from ...dataimport.defn_url import LinkedFileURL

    def list_url_links(**_):
        """Every URL link currently on the document, with the dataset names
        each one owns and the cached conditional-GET state. The JS side uses
        this to drive its fetch loop."""
        out = []
        if ctx.document is None:
            return out
        for lf in ctx.document.getLinkedFiles():
            if not isinstance(lf, LinkedFileURL):
                continue
            url = lf.params.url
            names = sorted(
                name for name, ds in ctx.document.data.items()
                if ds.linked is lf
            )
            cached = url_fetch.cached_entry(url)
            out.append({
                'url': url,
                'format': lf.params.format,
                'poll_seconds': int(lf.params.poll_seconds or 0),
                'names': names,
                'etag': cached.etag if cached else None,
                'last_modified': cached.last_modified if cached else None,
            })
        return out

    def url_ingest(url: str, bytes_b64: str,
                   etag: Optional[str] = None,
                   last_modified: Optional[str] = None,
                   content_type: Optional[str] = None, **_):
        """Stash bytes for the next `data.reload_url(url)` call."""
        if not isinstance(url, str) or not url:
            raise RpcError(INVALID_PARAMS, 'url must be a non-empty string')
        try:
            body = base64.b64decode(bytes_b64, validate=True)
        except (TypeError, ValueError) as e:
            raise RpcError(INVALID_PARAMS, f'bytes_b64 invalid: {e}') from e
        try:
            url_fetch.ingest_bytes(
                url, body, etag=etag, last_modified=last_modified,
                content_type=content_type)
        except ValueError as e:
            raise RpcError(INVALID_PARAMS, str(e)) from e
        return {'ok': True, 'len': len(body)}

    def reload_url(url: str, **_):
        """Reload the LinkedFileURL matching `url`. Publishes `data.changed`
        on success (no-op on 304 — datasets stay put, no notification)."""
        if not isinstance(url, str) or not url:
            raise RpcError(INVALID_PARAMS, 'url must be a non-empty string')
        targets = [
            lf for lf in ctx.document.getLinkedFiles({url})
            if isinstance(lf, LinkedFileURL)
        ]
        if not targets:
            raise RpcError(INVALID_PARAMS, f'no URL link in document: {url}')
        read, errors = ctx.document.reloadLinkedDatasets({url})
        if read:
            ctx.notifier.publish('data.changed', {
                'names': list(read),
                'kind': 'reload_url',
            })
        return {
            'reloaded': sorted(read),
            'errors': {n: int(e) for n, e in (errors or {}).items()},
            'not_modified': not read and not errors,
        }

    def url_refresh(url: str,
                    bytes_b64: Optional[str] = None,
                    etag: Optional[str] = None,
                    last_modified: Optional[str] = None,
                    content_type: Optional[str] = None,
                    not_modified: bool = False, **_):
        """Combined ingest + reload — one round-trip per poll tick.

        Set `not_modified=True` to acknowledge a 304 from the JS-side
        conditional GET (no bytes needed; no reload performed).
        """
        if not_modified:
            return {'reloaded': [], 'errors': {}, 'not_modified': True}
        if bytes_b64 is None:
            raise RpcError(
                INVALID_PARAMS,
                'bytes_b64 required unless not_modified=true')
        url_ingest(url=url, bytes_b64=bytes_b64,
                   etag=etag, last_modified=last_modified,
                   content_type=content_type)
        return reload_url(url=url)

    return {
        'data.list_url_links': list_url_links,
        'data.url_ingest':     url_ingest,
        'data.reload_url':     reload_url,
        'data.url_refresh':    url_refresh,
    }
