"""prefs.{get, set, list, delete} — user preference storage."""

import pytest


@pytest.fixture(autouse=True)
async def _clear_prefs(daemon):
    """Each test starts with all prefs at their defaults."""
    items = await daemon.call('prefs.list')
    for it in items:
        await daemon.call('prefs.delete', key=it['key'])
    yield


@pytest.mark.asyncio
async def test_get_returns_default_when_unset(daemon):
    r = await daemon.call('prefs.get', key='render.default_dpi')
    assert r == {'key': 'render.default_dpi', 'value': 96}


@pytest.mark.asyncio
async def test_set_then_get_round_trips(daemon):
    await daemon.call('prefs.set', key='render.default_dpi', value=300)
    r = await daemon.call('prefs.get', key='render.default_dpi')
    assert r['value'] == 300


@pytest.mark.asyncio
async def test_delete_resets_to_default(daemon):
    await daemon.call('prefs.set', key='render.default_dpi', value=300)
    await daemon.call('prefs.delete', key='render.default_dpi')
    r = await daemon.call('prefs.get', key='render.default_dpi')
    assert r['value'] == 96


@pytest.mark.asyncio
async def test_list_returns_schema_plus_values(daemon):
    await daemon.call('prefs.set', key='ui.theme', value='dark')
    items = await daemon.call('prefs.list')
    names = {it['key']: it for it in items}
    assert names['ui.theme']['value'] == 'dark'
    assert names['ui.theme']['default'] == 'system'
    assert names['ui.theme']['choices'] == ['system', 'light', 'dark']
    assert names['render.default_dpi']['min'] == 36
    assert names['render.default_dpi']['max'] == 600


@pytest.mark.asyncio
async def test_set_wrong_type_rejected(daemon):
    with pytest.raises(RuntimeError, match='expected integer'):
        await daemon.call('prefs.set', key='render.default_width', value='800')


@pytest.mark.asyncio
async def test_set_below_min_rejected(daemon):
    with pytest.raises(RuntimeError, match='below min'):
        await daemon.call('prefs.set', key='ui.font_size', value=1)


@pytest.mark.asyncio
async def test_set_not_in_choices_rejected(daemon):
    with pytest.raises(RuntimeError, match='not in'):
        await daemon.call('prefs.set', key='ui.theme', value='neon')


@pytest.mark.asyncio
async def test_unknown_key_rejected(daemon):
    with pytest.raises(RuntimeError, match='unknown preference'):
        await daemon.call('prefs.get', key='not.a.real.pref')
    with pytest.raises(RuntimeError, match='unknown preference'):
        await daemon.call('prefs.set', key='not.a.real.pref', value=1)


@pytest.mark.asyncio
async def test_boolean_type(daemon):
    await daemon.call('prefs.set', key='plot.live_preview', value=False)
    r = await daemon.call('prefs.get', key='plot.live_preview')
    assert r['value'] is False
    with pytest.raises(RuntimeError, match='expected boolean'):
        await daemon.call('prefs.set', key='plot.live_preview', value=0)
