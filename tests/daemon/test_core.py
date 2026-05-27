"""Core RPC: ping, version, error handling."""

import pytest


@pytest.mark.asyncio
async def test_ping(daemon):
    assert await daemon.call('ping') == {'pong': True}


@pytest.mark.asyncio
async def test_version(daemon):
    r = await daemon.call('version')
    assert 'veusz' in r
    assert r['api'] >= 1


@pytest.mark.asyncio
async def test_unknown_method(daemon):
    with pytest.raises(RuntimeError, match='no such method'):
        await daemon.call('not.a.real.method')
