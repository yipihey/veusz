"""file.recent_{list, clear, remove} — recent-files tracking.

Recent files live in Veusz's settingdb (the same store the existing
GUI uses) so dev installs of Veusz and the daemon share the list.
"""

import os
import pytest


@pytest.fixture(autouse=True)
async def _clear_recents(daemon):
    """Each test starts with an empty recent-files list."""
    await daemon.call('file.recent_clear')
    yield


@pytest.mark.asyncio
async def test_initial_state_empty(daemon):
    r = await daemon.call('file.recent_list')
    assert r['paths'] == []


@pytest.mark.asyncio
async def test_save_pushes_into_recent_list(daemon, tmp_path):
    await daemon.call('doc.add', parent='/', type='page')
    out = str(tmp_path / 'a.vsz')
    await daemon.call('file.save_as', path=out)
    r = await daemon.call('file.recent_list')
    assert len(r['paths']) == 1
    assert r['paths'][0]['path'] == out
    assert r['paths'][0]['exists'] is True


@pytest.mark.asyncio
async def test_open_pushes_into_recent_list(daemon, tmp_path):
    # Build & save first so we have a valid .vsz to re-open
    await daemon.call('doc.add', parent='/', type='page')
    out = str(tmp_path / 'b.vsz')
    await daemon.call('file.save_as', path=out)
    await daemon.call('file.recent_clear')  # reset
    await daemon.call('file.open', path=out)
    r = await daemon.call('file.recent_list')
    assert [p['path'] for p in r['paths']] == [out]


@pytest.mark.asyncio
async def test_most_recent_first_with_dedup(daemon, tmp_path):
    await daemon.call('doc.add', parent='/', type='page')
    a = str(tmp_path / 'a.vsz'); b = str(tmp_path / 'b.vsz')
    await daemon.call('file.save_as', path=a)
    await daemon.call('file.save_as', path=b)
    await daemon.call('file.save_as', path=a)  # re-saving a should bump it
    r = await daemon.call('file.recent_list')
    paths = [p['path'] for p in r['paths']]
    assert paths == [a, b]  # a re-saved → moves to front + dedup


@pytest.mark.asyncio
async def test_list_caps_at_ten(daemon, tmp_path):
    await daemon.call('doc.add', parent='/', type='page')
    for i in range(15):
        await daemon.call('file.save_as', path=str(tmp_path / f'f{i}.vsz'))
    r = await daemon.call('file.recent_list')
    assert len(r['paths']) == 10


@pytest.mark.asyncio
async def test_remove_drops_a_single_entry(daemon, tmp_path):
    await daemon.call('doc.add', parent='/', type='page')
    a = str(tmp_path / 'a.vsz'); b = str(tmp_path / 'b.vsz')
    await daemon.call('file.save_as', path=a)
    await daemon.call('file.save_as', path=b)
    await daemon.call('file.recent_remove', path=a)
    r = await daemon.call('file.recent_list')
    assert [p['path'] for p in r['paths']] == [b]


@pytest.mark.asyncio
async def test_exists_flag_reports_deleted_files(daemon, tmp_path):
    await daemon.call('doc.add', parent='/', type='page')
    a = str(tmp_path / 'gone.vsz')
    await daemon.call('file.save_as', path=a)
    os.unlink(a)
    r = await daemon.call('file.recent_list')
    assert r['paths'][0]['exists'] is False
