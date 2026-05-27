# JSON-RPC server for the Veusz daemon.
#
#    This file is part of Veusz.
#    See COPYING for license terms.
##############################################################################

"""asyncio JSON-RPC 2.0 server over a Unix domain socket / named pipe.

Single in-process daemon; one client at a time is the v1 contract.
Heavy work (rendering, schema extraction, evaluation) runs on the
asyncio thread — the frontend coalesces requests, and Qt's paint
pipeline is already cheap enough that this isn't worth threading in
v1. The handler return types are sync; if a handler ever needs to be
async (long imports, network IO), declare it ``async def`` and the
dispatcher awaits it.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
import os
import sys
import traceback
from typing import Any, Callable

from . import framing
from .context import Context
from .errors import (
    RpcError,
    PARSE_ERROR, INVALID_REQUEST, METHOD_NOT_FOUND,
    INVALID_PARAMS, INTERNAL_ERROR,
)
from .handlers import all_handlers


log = logging.getLogger('veuszd.server')


# Re-export so handlers can `from ..server import RpcError` if they prefer.
__all__ = (
    'Server', 'RpcError', 'run',
    'PARSE_ERROR', 'INVALID_REQUEST', 'METHOD_NOT_FOUND',
    'INVALID_PARAMS', 'INTERNAL_ERROR',
)


def _error(req_id: Any, code: int, message: str, data: Any = None) -> dict:
    obj = {'jsonrpc': '2.0', 'id': req_id, 'error': {
        'code': code, 'message': message,
    }}
    if data is not None:
        obj['error']['data'] = data
    return obj


def _result(req_id: Any, result: Any) -> dict:
    return {'jsonrpc': '2.0', 'id': req_id, 'result': result}


class Server:
    def __init__(self, ctx: Context, socket_path: str):
        self.ctx = ctx
        self.socket_path = socket_path
        self.methods: dict[str, Callable] = {}
        self._server: asyncio.base_events.Server | None = None
        self._shutdown_event = asyncio.Event()
        for name, fn in all_handlers(ctx).items():
            self.methods[name] = fn
        # Self-handlers — implemented here because they need the server
        self.methods['shutdown'] = self._shutdown_method
        self.methods['ping'] = lambda **_: {'pong': True}

    def _shutdown_method(self, **_):
        self._shutdown_event.set()
        return {'ok': True}

    async def _handle_request(self, msg: dict, writer: asyncio.StreamWriter) -> None:
        req_id = msg.get('id')
        method = msg.get('method')
        params = msg.get('params') or {}
        if not isinstance(method, str):
            await framing.write_message(writer, _error(
                req_id, INVALID_REQUEST, 'missing or non-string "method"'))
            return
        fn = self.methods.get(method)
        if fn is None:
            await framing.write_message(writer, _error(
                req_id, METHOD_NOT_FOUND, f'no such method: {method}'))
            return
        try:
            if isinstance(params, list):
                result = fn(*params)
            elif isinstance(params, dict):
                result = fn(**params)
            else:
                await framing.write_message(writer, _error(
                    req_id, INVALID_PARAMS, '"params" must be array or object'))
                return
            if inspect.isawaitable(result):
                result = await result
        except RpcError as e:
            await framing.write_message(writer, _error(
                req_id, e.code, e.message, e.data))
            return
        except TypeError as e:
            # arg mismatch on the handler — treat as invalid params
            await framing.write_message(writer, _error(
                req_id, INVALID_PARAMS, str(e)))
            return
        except Exception as e:
            log.exception('handler %s raised', method)
            await framing.write_message(writer, _error(
                req_id, INTERNAL_ERROR, str(e),
                data={'traceback': traceback.format_exc()}))
            return
        if req_id is not None:
            await framing.write_message(writer, _result(req_id, result))

    async def _client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        peer = writer.get_extra_info('peername')
        log.info('client connected: %s', peer)
        self.ctx.notifier.attach(writer)
        try:
            while True:
                try:
                    msg = await framing.read_message(reader)
                except framing.FramingError as e:
                    log.warning('framing error: %s', e)
                    break
                except asyncio.IncompleteReadError:
                    break
                if msg is None:
                    break
                if msg.get('jsonrpc') != '2.0':
                    await framing.write_message(writer, _error(
                        msg.get('id'), INVALID_REQUEST,
                        'jsonrpc must be "2.0"'))
                    continue
                # Spawn a task so a slow handler doesn't block reading,
                # but in v1 we await for back-pressure simplicity.
                await self._handle_request(msg, writer)
        finally:
            self.ctx.notifier.detach()
            log.info('client disconnected: %s', peer)
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass

    async def serve(self) -> None:
        # Remove any stale socket file.
        if os.path.exists(self.socket_path):
            os.unlink(self.socket_path)
        self._server = await asyncio.start_unix_server(
            self._client, path=self.socket_path)
        os.chmod(self.socket_path, 0o600)
        log.info('listening on %s', self.socket_path)
        try:
            await self._shutdown_event.wait()
        finally:
            self._server.close()
            await self._server.wait_closed()
            if os.path.exists(self.socket_path):
                try:
                    os.unlink(self.socket_path)
                except OSError:
                    pass
            log.info('shutdown complete')


async def run(socket_path: str, deterministic: bool, log_json: bool) -> int:
    ctx = Context(deterministic=deterministic)
    ctx.startup()
    if log_json:
        _configure_json_logging()
    else:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(name)s %(levelname)s %(message)s')
    server = Server(ctx, socket_path)
    await server.serve()
    return 0


def _configure_json_logging() -> None:
    import json as _json
    import time

    class JsonFormatter(logging.Formatter):
        def format(self, record):
            return _json.dumps({
                'ts': time.time(),
                'level': record.levelname,
                'name': record.name,
                'msg': record.getMessage(),
            })

    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(logging.INFO)
