# Pytest fixtures for daemon contract tests.
#
# Spawns a real daemon over a temp socket and yields an RPC client.
##############################################################################

from __future__ import annotations

import asyncio
import os
import tempfile

import pytest

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')


@pytest.fixture(scope='session', autouse=True)
def _qapp():
    """One QApplication for the whole pytest session.

    Each daemon Context (created per-test) reuses ``QApplication.instance()``
    — without this fixture, function-scoped contexts each touch the
    QApplication state independently and stale Qt objects from previous
    tests can be GC'd mid-test, manifesting as
    "wrapped C/C++ object of type OnModified has been deleted".
    """
    import sys
    from PyQt6.QtWidgets import QApplication
    app = QApplication.instance() or QApplication(sys.argv if sys.argv else [''])
    # Pre-import widgets so the factory is populated once, not per test.
    from veusz import widgets  # noqa: F401
    from veusz import dataimport  # noqa: F401
    yield app


class _Client:
    """Tiny JSON-RPC client tailored for tests."""

    def __init__(self, reader, writer):
        from veusz.daemon import framing
        self._framing = framing
        self._reader = reader
        self._writer = writer
        self._next_id = 0

    async def call(self, method: str, **params):
        self._next_id += 1
        await self._framing.write_message(self._writer, {
            'jsonrpc': '2.0', 'id': self._next_id,
            'method': method, 'params': params,
        })
        msg = await self._framing.read_message(self._reader)
        if msg is None:
            raise RuntimeError('daemon closed connection')
        if 'error' in msg:
            raise RuntimeError(f"{method}: {msg['error']}")
        return msg['result']

    async def close(self):
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
    # Wait for listener
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
