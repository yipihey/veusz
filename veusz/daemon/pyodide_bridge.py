"""In-browser entry point: run the Veusz daemon's JSON-RPC handlers under
Pyodide, with no asyncio socket server.

The desktop daemon (:mod:`veusz.daemon.server`) wraps these same handlers in an
asyncio UDS server. In the browser there is no socket — JavaScript calls
:meth:`Bridge.dispatch_json` directly, and push notifications
(``doc.changed`` / ``data.changed``) are delivered to a JS callback instead of
being written to a stream. Everything else (the handler set, the document
model, scene capture) is shared unchanged; Qt is provided by
:mod:`veusz.qtshim` via the :mod:`veusz.qtall` fallback.

Typical use from JS (via Pyodide)::

    import veusz.daemon.pyodide_bridge as B
    bridge = B.Bridge()
    bridge.set_notify(js_push_callback)          # receives {method, params}
    bridge.load_vsz(vsz_text)                     # load a document
    resp = bridge.dispatch_json('{"method":"render.scene","params":{...}}')
"""

from __future__ import annotations

import json
import os
import tempfile
import traceback

from .context import Context
from .notifier import Notifier
from .handlers import all_handlers
from .errors import (
    RpcError, PARSE_ERROR, METHOD_NOT_FOUND, INVALID_PARAMS, INTERNAL_ERROR,
)


class BrowserNotifier(Notifier):
    """Notifier that forwards push messages to a JavaScript callback rather
    than an asyncio stream. The callback is invoked with the notification as a
    **JSON string** ``{"jsonrpc":"2.0","method":...,"params":...}`` — strings
    cross the Pyodide FFI boundary cleanly (no PyProxy lifetime concerns)."""

    def __init__(self, callback=None):
        super().__init__()
        self._cb = callback

    def set_callback(self, callback):
        self._cb = callback
        # flush anything queued before JS attached
        pending, self._pending = self._pending, []
        for msg in pending:
            self._dispatch(msg)

    def publish(self, method, params=None):
        msg = {'jsonrpc': '2.0', 'method': method, 'params': params or {}}
        if self._cb is None:
            self._pending.append(msg)
            if len(self._pending) > 64:
                self._pending.pop(0)
            return
        self._dispatch(msg)

    def _dispatch(self, msg):
        if self._cb is not None:
            self._cb(json.dumps(msg))


class Bridge:
    """Owns a headless Veusz document + the handler set, and dispatches
    JSON-RPC requests synchronously."""

    def __init__(self, deterministic: bool = False):
        self.ctx = Context(deterministic=deterministic)
        self.ctx.startup()                         # QApplication + widgets + doc
        # In the browser, Python can't make sync network calls — JS fetches URL
        # data and feeds bytes in via `data.url_ingest`. In CPython (desktop,
        # render_poster, etc.) keep the urllib default so `ImportFileURL` works.
        import sys
        if sys.platform == 'emscripten':
            from ..dataimport import url_fetch
            url_fetch.set_fetcher(url_fetch._pyodide_cache_only_fetcher)
        self.notifier = BrowserNotifier()
        self.ctx.notifier = self.notifier
        self.methods = all_handlers(self.ctx)
        self.methods.setdefault('ping', lambda **_: {'pong': True})

    # -- notifications ----------------------------------------------------
    def set_notify(self, callback):
        """Register the JS callback for push notifications."""
        self.notifier.set_callback(callback)

    # -- dispatch ---------------------------------------------------------
    def dispatch(self, method, params=None):
        """Call a handler. Returns ``{'result': ...}`` or ``{'error': ...}``."""
        fn = self.methods.get(method)
        if fn is None:
            return {'error': {'code': METHOD_NOT_FOUND,
                              'message': f'no such method: {method}'}}
        try:
            if isinstance(params, list):
                result = fn(*params)
            elif isinstance(params, dict):
                result = fn(**params)
            elif params is None:
                result = fn()
            else:
                return {'error': {'code': INVALID_PARAMS,
                                  'message': 'params must be array or object'}}
        except RpcError as e:
            return {'error': {'code': e.code, 'message': e.message,
                              'data': e.data}}
        except TypeError as e:
            return {'error': {'code': INVALID_PARAMS, 'message': str(e)}}
        except Exception as e:  # noqa: BLE001 - surface to the client
            return {'error': {'code': INTERNAL_ERROR, 'message': str(e),
                              'data': {'traceback': traceback.format_exc()}}}
        return {'result': result}

    def dispatch_json(self, request_json: str) -> str:
        """JSON-in/JSON-out dispatch — the primary JS entry point."""
        try:
            req = json.loads(request_json)
        except Exception as e:  # noqa: BLE001
            return json.dumps({'jsonrpc': '2.0', 'id': None,
                               'error': {'code': PARSE_ERROR,
                                         'message': f'parse error: {e}'}})
        out = self.dispatch(req.get('method'), req.get('params'))
        out['jsonrpc'] = '2.0'
        out['id'] = req.get('id')
        return json.dumps(out)

    # -- convenience ------------------------------------------------------
    def load_vsz(self, text: str, filename: str = 'figure.vsz'):
        """Load a ``.vsz`` document from its text. Writes to the (in-memory)
        filesystem and reuses the ``file.open`` handler so recent-files and
        change notifications fire identically to the desktop."""
        path = os.path.join(tempfile.gettempdir(), filename)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        return self.dispatch('file.open', {'path': path})
