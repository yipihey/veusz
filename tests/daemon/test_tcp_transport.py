"""Optional TCP transport with token auth (for hosts where a Unix socket is
awkward — Windows, sandboxes). UDS stays the default; these cover the TCP
listener and the one-shot auth handshake."""

import asyncio

import pytest

from .conftest import _Client


@pytest.fixture
async def tcp_daemon():
    """A daemon listening on an ephemeral TCP port with a token, yielding
    ``(server, port)``."""
    from veusz.daemon import context as _ctx, server as _server

    ctx = _ctx.Context(deterministic=True)
    ctx.startup()
    srv = _server.Server(ctx, tcp=('127.0.0.1', 0), token='sekret')
    task = asyncio.create_task(srv.serve())
    for _ in range(300):
        if srv.tcp_port():
            break
        await asyncio.sleep(0.01)
    port = srv.tcp_port()
    assert port, 'TCP server never bound a port'
    try:
        yield srv, port
    finally:
        srv._shutdown_event.set()
        try:
            await asyncio.wait_for(task, timeout=2.0)
        except asyncio.TimeoutError:
            task.cancel()


@pytest.mark.asyncio
async def test_tcp_auth_then_normal_calls(tcp_daemon):
    _srv, port = tcp_daemon
    reader, writer = await asyncio.open_connection('127.0.0.1', port)
    client = _Client(reader, writer)
    assert (await client.call('auth', token='sekret'))['ok'] is True
    assert (await client.call('ping'))['pong'] is True
    await client.call('doc.new', mode='graph')
    assert (await client.call('version')).get('api') is not None
    await client.close()


@pytest.mark.asyncio
async def test_tcp_rejects_bad_token(tcp_daemon):
    _srv, port = tcp_daemon
    reader, writer = await asyncio.open_connection('127.0.0.1', port)
    client = _Client(reader, writer)
    with pytest.raises(Exception):
        await client.call('auth', token='wrong')
    await client.close()


@pytest.mark.asyncio
async def test_tcp_requires_auth_first(tcp_daemon):
    _srv, port = tcp_daemon
    reader, writer = await asyncio.open_connection('127.0.0.1', port)
    client = _Client(reader, writer)
    with pytest.raises(Exception):  # first message must be auth, else rejected
        await client.call('ping')
    await client.close()
