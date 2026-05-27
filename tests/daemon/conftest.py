# Pytest fixtures for daemon contract tests.
#
# Spawns a real daemon over a temp socket and yields an RPC client
# that correctly distinguishes responses (with `id`) from
# notifications (without).
##############################################################################

from __future__ import annotations

import asyncio
import os
import tempfile

import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    """One QApplication for the whole pytest session."""
    import sys
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets  # noqa: F401
    from veusz import dataimport  # noqa: F401
    yield app


class _Client:
    """JSON-RPC client tailored for tests.

    Spawns a single reader task that demultiplexes the wire into
    per-request response futures (keyed by `id`) and a per-method
    notification queue (keyed by `method`).
    """

    def __init__(self, reader, writer):
        from veusz.daemon import framing
        self._framing = framing
        self._reader = reader
        self._writer = writer
        self._next_id = 0
        self._pending: dict[int, asyncio.Future] = {}
        self._notifs: dict[str, asyncio.Queue] = {}
        self._closed = False
        self._reader_task = asyncio.create_task(self._read_loop())

    async def _read_loop(self):
        while True:
            try:
                msg = await self._framing.read_message(self._reader)
            except (self._framing.FramingError, asyncio.IncompleteReadError, OSError):
                break
            if msg is None:
                break
            if 'id' in msg and msg['id'] is not None:
                fut = self._pending.pop(msg['id'], None)
                if fut and not fut.done():
                    fut.set_result(msg)
            elif 'method' in msg:
                q = self._notifs.setdefault(msg['method'], asyncio.Queue())
                await q.put(msg)
        # Wake anything still waiting
        for fut in self._pending.values():
            if not fut.done():
                fut.set_exception(RuntimeError('daemon closed'))
        self._pending.clear()

    async def call(self, method: str, **params):
        if self._closed:
            raise RuntimeError('client closed')
        self._next_id += 1
        nid = self._next_id
        fut: asyncio.Future = asyncio.get_event_loop().create_future()
        self._pending[nid] = fut
        await self._framing.write_message(self._writer, {
            'jsonrpc': '2.0', 'id': nid,
            'method': method, 'params': params,
        })
        msg = await fut
        if 'error' in msg:
            raise RuntimeError(f"{method}: {msg['error']}")
        return msg['result']

    async def next_notification(self, method: str, timeout: float = 2.0):
        """Pop the next ``method`` notification, blocking up to ``timeout`` s."""
        q = self._notifs.setdefault(method, asyncio.Queue())
        return await asyncio.wait_for(q.get(), timeout=timeout)

    async def close(self):
        self._closed = True
        self._reader_task.cancel()
        self._writer.close()
        try:
            await self._writer.wait_closed()
        except Exception:
            pass


@pytest.fixture
async def daemon():
    """Yield a live in-process daemon + connected RPC client.

    Each test gets a fresh document. Cleanup is automatic.
    """
    from veusz.daemon import context as _ctx, server as _server

    sock = tempfile.mktemp(suffix='.sock')
    ctx = _ctx.Context(deterministic=True)
    ctx.startup()
    srv = _server.Server(ctx, sock)
    serve_task = asyncio.create_task(srv.serve())
    for _ in range(100):
        if os.path.exists(sock):
            break
        await asyncio.sleep(0.02)
    else:
        raise RuntimeError('daemon never opened socket')
    reader, writer = await asyncio.open_unix_connection(sock)
    client = _Client(reader, writer)
    try:
        yield client
    finally:
        try:
            await client.call('shutdown')
        except Exception:
            pass
        await client.close()
        try:
            await asyncio.wait_for(serve_task, timeout=2.0)
        except asyncio.TimeoutError:
            serve_task.cancel()
