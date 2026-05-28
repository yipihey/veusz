"""doc.rename / doc.move / doc.duplicate RPC contract tests."""

import pytest


@pytest.fixture
async def graph(daemon):
    """Build a fresh doc with a /page1/graph1/xy1 widget; return paths."""
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    return {
        'page': '/page1',
        'graph': '/page1/graph1',
        'xy': '/page1/graph1/xy1',
    }


@pytest.mark.asyncio
async def test_rename_changes_widget_path(daemon, graph):
    r = await daemon.call('doc.rename', path=graph['xy'], name='scatter')
    assert r['path'] == '/page1/graph1/scatter'
    # Tree reflects the new name.
    tree = await daemon.call('doc.tree')
    leaf_names = {c['name']
                  for c in tree['children'][0]['children'][0]['children']}
    assert 'scatter' in leaf_names
    assert 'xy1' not in leaf_names


@pytest.mark.asyncio
async def test_rename_rejects_empty_name(daemon, graph):
    with pytest.raises(RuntimeError, match='name'):
        await daemon.call('doc.rename', path=graph['xy'], name='')


@pytest.mark.asyncio
async def test_rename_rejects_missing_path(daemon, graph):
    with pytest.raises(RuntimeError):
        await daemon.call('doc.rename', path='/page1/graph1/no_such',
                          name='whatever')


@pytest.mark.asyncio
async def test_move_up_and_down(daemon):
    # Build /page1 with three children so we can move the middle one.
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')  # graph1
    await daemon.call('doc.add', parent='/page1', type='graph')  # graph2
    await daemon.call('doc.add', parent='/page1', type='graph')  # graph3

    # Move graph2 up: it becomes the first child.
    r = await daemon.call('doc.move', path='/page1/graph2', direction='up')
    assert r['moved'] is True
    t = await daemon.call('doc.tree')
    children = [c['name'] for c in t['children'][0]['children']]
    assert children[0] == 'graph2'

    # Move graph2 down twice: it goes back to the middle, then last.
    await daemon.call('doc.move', path='/page1/graph2', direction='down')
    await daemon.call('doc.move', path='/page1/graph2', direction='down')
    t = await daemon.call('doc.tree')
    children = [c['name'] for c in t['children'][0]['children']]
    assert children[-1] == 'graph2'


@pytest.mark.asyncio
async def test_move_rejects_bad_direction(daemon, graph):
    with pytest.raises(RuntimeError, match='direction'):
        await daemon.call('doc.move', path=graph['xy'], direction='sideways')


@pytest.mark.asyncio
async def test_duplicate_clones_with_unique_name(daemon, graph):
    r = await daemon.call('doc.duplicate', path=graph['xy'])
    assert r['path'].startswith('/page1/graph1/xy1_copy')

    # Duplicate again — the next clone should get a different unique name.
    r2 = await daemon.call('doc.duplicate', path=graph['xy'])
    assert r2['path'] != r['path']
    assert r2['path'].startswith('/page1/graph1/xy1_copy')


@pytest.mark.asyncio
async def test_duplicate_preserves_settings(daemon, graph):
    # Change a setting on the original; clone should inherit it.
    await daemon.call('doc.set',
                      ops=[{'path': graph['xy'] + '/marker', 'value': 'square'}])
    r = await daemon.call('doc.duplicate', path=graph['xy'])
    cloned_marker = (await daemon.call('doc.get',
                                       paths=[r['path'] + '/marker']))
    assert cloned_marker[r['path'] + '/marker'] == 'square'


@pytest.mark.asyncio
async def test_duplicate_root_is_rejected(daemon):
    with pytest.raises(RuntimeError):
        await daemon.call('doc.duplicate', path='/')
