"""doc.schema_at on /StyleSheet — drives the stylesheet editor."""

import pytest


@pytest.mark.asyncio
async def test_schema_at_stylesheet_returns_settings_group(daemon):
    r = await daemon.call('doc.schema_at', path='/StyleSheet')
    assert r['mode'] == 'path'
    # StyleSheet exposes subgroups for Line / Brush / Font / ...
    assert isinstance(r['subgroups'], list)
    assert len(r['subgroups']) > 0
    group_names = {g['name'] for g in r['subgroups']}
    # These are present on every Veusz document by default
    assert {'Line', 'axis-function', 'axis'} & group_names or 'Line' in group_names


@pytest.mark.asyncio
async def test_schema_at_existing_widget(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    r = await daemon.call('doc.schema_at', path='/page1')
    assert r['mode'] == 'path'
    assert r['typename'] == 'page'


@pytest.mark.asyncio
async def test_schema_at_setting_leaf(daemon):
    # Leaf setting under StyleSheet → Line → width (or similar)
    r = await daemon.call('doc.schema_at', path='/StyleSheet/Line/width')
    assert r['mode'] == 'path'
    assert r['setnsmode'] == 'leaf'
    assert len(r['settings']) == 1
    assert r['settings'][0]['name'] == 'width'


@pytest.mark.asyncio
async def test_schema_at_bad_path(daemon):
    with pytest.raises(RuntimeError, match='no node at'):
        await daemon.call('doc.schema_at', path='/does/not/exist')


@pytest.mark.asyncio
async def test_set_on_stylesheet_path(daemon):
    # Edit a stylesheet setting and read it back
    await daemon.call('doc.set', ops=[
        {'path': '/StyleSheet/Line/color', 'value': 'red'},
    ])
    val = await daemon.call('doc.get', paths=['/StyleSheet/Line/color'])
    assert val == {'/StyleSheet/Line/color': 'red'}
