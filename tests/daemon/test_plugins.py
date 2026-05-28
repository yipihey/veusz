"""Plugin registry RPCs: plugins.list + plugins.run (tools/dataset)."""

import pytest


@pytest.mark.asyncio
async def test_list_returns_tools_and_datasets(daemon):
    r = await daemon.call('plugins.list')
    assert r['tools'] and r['datasets']
    # Each entry carries name/menu/fields; fields carry name+kind.
    entry = r['datasets'][0]
    assert {'name', 'menu', 'fields'} <= set(entry)
    assert isinstance(entry['menu'], list)
    for f in entry['fields']:
        assert {'name', 'descr', 'default', 'kind', 'items'} <= set(f)

    names = {d['name'] for d in r['datasets']}
    assert 'Add' in names  # built-in arithmetic dataset plugin


@pytest.mark.asyncio
async def test_run_dataset_plugin(daemon):
    await daemon.call('data.set', name='x', values=[1, 2, 3])
    r = await daemon.call('plugins.run', kind='dataset', name='Add',
                          fields={'ds_in': 'x', 'value': 10, 'ds_out': 'x10'})
    assert r['ok'] and 'x10' in r['created']
    stats = await daemon.call('data.stats', name='x10')
    assert stats['max'] == 13


@pytest.mark.asyncio
async def test_run_unknown_kind_errors(daemon):
    with pytest.raises(RuntimeError, match='unknown plugin kind'):
        await daemon.call('plugins.run', kind='bogus', name='Add', fields={})


@pytest.mark.asyncio
async def test_run_unknown_dataset_plugin_errors(daemon):
    with pytest.raises(RuntimeError, match='no dataset plugin'):
        await daemon.call('plugins.run', kind='dataset', name='NoSuchPlugin', fields={})
