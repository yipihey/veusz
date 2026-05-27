"""file.open / file.save / file.save_as / file.info."""

import os
import pytest


def _setup_a_plot(daemon):
    return daemon.call('doc.add', parent='/', type='page') \
        .then if False else None


@pytest.mark.asyncio
async def test_info_on_empty_document(daemon):
    info = await daemon.call('file.info')
    assert info['path'] is None
    assert isinstance(info['changeset'], int)
    # Modified flag tracks the document's changeset; a fresh in-process
    # daemon has done some bookkeeping already so we just assert types.
    assert isinstance(info['modified'], bool)


@pytest.mark.asyncio
async def test_save_without_path_errors(daemon):
    with pytest.raises(RuntimeError, match='no filename'):
        await daemon.call('file.save')


@pytest.mark.asyncio
async def test_save_as_writes_a_vsz_then_open_round_trips(daemon, tmp_path):
    # Build a small document
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/marker', 'value': 'square'},
    ])
    out = str(tmp_path / 'test.vsz')
    r = await daemon.call('file.save_as', path=out)
    assert r['ok'] is True and r['path'] == out
    assert os.path.exists(out)
    # file.info now reports the path
    info = await daemon.call('file.info')
    assert info['path'] == out

    # Modify, then re-open the saved file — should restore the saved marker
    await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/marker', 'value': 'diamond'},
    ])
    r2 = await daemon.call('file.open', path=out)
    assert r2['ok'] is True
    val = await daemon.call('doc.get', paths=['/page1/graph1/xy1/marker'])
    assert val['/page1/graph1/xy1/marker'] == 'square'


@pytest.mark.asyncio
async def test_open_then_save_uses_current_path(daemon, tmp_path):
    # First save_as to establish a path
    await daemon.call('doc.add', parent='/', type='page')
    out = str(tmp_path / 'roundtrip.vsz')
    await daemon.call('file.save_as', path=out)
    # Now a plain `save` should write to the same path
    r = await daemon.call('file.save')
    assert r['path'] == out
    assert os.path.exists(out)


@pytest.mark.asyncio
async def test_open_missing_file(daemon):
    with pytest.raises(RuntimeError, match='no such file'):
        await daemon.call('file.open', path='/no/such/file/anywhere.vsz')


@pytest.mark.asyncio
async def test_open_bad_vsz(daemon, tmp_path):
    p = tmp_path / 'corrupt.vsz'
    p.write_text('this is definitely not a veusz file\n')
    with pytest.raises(RuntimeError, match='load failed'):
        await daemon.call('file.open', path=str(p))
