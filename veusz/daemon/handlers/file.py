# File RPC handlers: file.open / file.save / file.save_as / file.info.
##############################################################################

"""Native .vsz round-trip.

Wraps Veusz's `Document.load` and `Document.save`. The daemon's
`state.snapshot` / `state.restore` go through Veusz's command-text
representation in memory and are appropriate for tests; this module
is what the user's File → Open / File → Save buttons hit.
"""

from __future__ import annotations

import os

from ..errors import RpcError, INVALID_PARAMS


def register(ctx):
    def open_(path: str, **_):
        if not isinstance(path, str) or not path:
            raise RpcError(INVALID_PARAMS, '`path` must be a non-empty string')
        if not os.path.isfile(path):
            raise RpcError(INVALID_PARAMS, f'no such file: {path}')
        # Veusz's loader infers mode from extension if mode='vsz' default
        # doesn't match — we keep it simple and trust the caller.
        ext = os.path.splitext(path)[1].lower()
        mode = 'hdf5' if ext in ('.h5', '.hdf5', '.vszh5') else 'vsz'
        try:
            ctx.document.wipe()
            ctx.document.load(path, mode=mode)
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'load failed: {e}') from e
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset, 'paths': [], 'kind': 'load',
        })
        ctx.notifier.publish('data.changed', {
            'names': sorted(ctx.document.data.keys()), 'kind': 'load',
        })
        return {
            'ok': True,
            'path': path,
            'changeset': ctx.document.changeset,
        }

    def save(**_):
        """Save to the current file path. Errors if the doc has no path yet."""
        path = getattr(ctx.document, 'filename', '') or ''
        if not path:
            raise RpcError(INVALID_PARAMS,
                'document has no filename; use file.save_as')
        return _save_to(ctx, path)

    def save_as(path: str, **_):
        if not isinstance(path, str) or not path:
            raise RpcError(INVALID_PARAMS, '`path` must be a non-empty string')
        return _save_to(ctx, path)

    def info(**_):
        """Current filename + modified state."""
        return {
            'path': getattr(ctx.document, 'filename', '') or None,
            'changeset': ctx.document.changeset,
            'modified': bool(getattr(ctx.document, 'changeset', 0)),
        }

    def export_(path: str, pages: list | None = None, options: dict | None = None, **_):
        """Export to a real file format (PDF, PNG, SVG, EPS, ...).

        ``pages`` is a list of zero-indexed page numbers; defaults to
        every page for multi-page formats (PDF/PS) and page 0 for
        single-page formats. ``options`` is forwarded to the Export
        constructor — see ``veusz/document/export.py``.
        """
        if not isinstance(path, str) or not path:
            raise RpcError(INVALID_PARAMS, '`path` must be a non-empty string')
        if ctx.document is None or not ctx.document.basewidget.children:
            raise RpcError(INVALID_PARAMS, 'document has no pages')
        npages = len(ctx.document.basewidget.children)
        if pages is None:
            ext = os.path.splitext(path)[1].lower()
            pages = list(range(npages)) if ext in ('.pdf', '.ps') else [0]
        # Validate
        for p in pages:
            if not isinstance(p, int) or p < 0 or p >= npages:
                raise RpcError(INVALID_PARAMS,
                    f'page {p} out of range [0, {npages})')
        try:
            return _export_to(ctx, path, pages, options or {})
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'export failed: {e}') from e

    def formats(**_):
        """List supported export formats (extension + description)."""
        from ...document import export as _export
        return [
            {'extensions': list(exts), 'description': descr}
            for exts, descr in _export.AsyncExport.getFormats()
        ]

    return {
        'file.open': open_,
        'file.save': save,
        'file.save_as': save_as,
        'file.info': info,
        'file.export': export_,
        'file.formats': formats,
    }


def _export_to(ctx, path: str, pages: list[int], options: dict) -> dict:
    from ...document import export as _export
    e = _export.AsyncExport(
        ctx.document,
        color=bool(options.get('color', True)),
        bitmapdpi=int(options.get('bitmapdpi', 100)),
        antialias=bool(options.get('antialias', True)),
        quality=int(options.get('quality', 85)),
        backcolor=options.get('backcolor', '#ffffff00'),
        pdfdpi=int(options.get('pdfdpi', 72)),
        svgdpi=int(options.get('svgdpi', 96)),
        svgtextastext=bool(options.get('svgtextastext', False)),
    )
    e.add(path, pages)
    e.finish()
    return {'ok': True, 'path': path, 'pages': pages}


def _save_to(ctx, path: str) -> dict:
    ext = os.path.splitext(path)[1].lower()
    mode = 'hdf5' if ext in ('.h5', '.hdf5', '.vszh5') else 'vsz'
    try:
        ctx.document.save(path, mode=mode)
    except Exception as e:
        raise RpcError(INVALID_PARAMS, f'save failed: {e}') from e
    return {'ok': True, 'path': path, 'changeset': ctx.document.changeset}
