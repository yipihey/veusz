"""Document RPC: tree, schema, add, set, remove."""

import pytest


@pytest.mark.asyncio
async def test_empty_tree(daemon):
    t = await daemon.call('doc.tree')
    assert t['path'] == '/'
    assert t['type'] == 'document'
    assert t['children'] == []


@pytest.mark.asyncio
async def test_add_widgets_and_walk_tree(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    t = await daemon.call('doc.tree')
    assert len(t['children']) == 1
    page = t['children'][0]
    assert page['type'] == 'page'
    graph = page['children'][0]
    assert graph['type'] == 'graph'
    # graph auto-creates axes 'x' and 'y'; the xy widget is in there too
    types = {c['type'] for c in graph['children']}
    assert 'xy' in types


@pytest.mark.asyncio
async def test_schema_xy(daemon):
    sch = await daemon.call('doc.schema', widget_type='xy')
    assert sch['typename'] == 'xy'
    assert sch['mode'] == 'class'
    names = {s['name'] for s in sch['settings']}
    assert 'marker' in names
    assert 'xData' in names
    subgroup_names = {g['name'] for g in sch['subgroups']}
    assert 'PlotLine' in subgroup_names


@pytest.mark.asyncio
async def test_schema_bad_widget(daemon):
    with pytest.raises(RuntimeError, match='no such widget'):
        await daemon.call('doc.schema', widget_type='not-a-widget-type')


@pytest.mark.asyncio
async def test_doc_set_batch_returns_diffs(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    r = await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/marker', 'value': 'square'},
    ])
    assert r['changeset'] > 0
    assert len(r['diffs']) == 1
    diff = r['diffs'][0]
    assert diff['old'] == 'circle'
    assert diff['new'] == 'square'


@pytest.mark.asyncio
async def test_widget_types_includes_known(daemon):
    types = set(await daemon.call('doc.widget_types'))
    for expected in ('page', 'graph', 'xy', 'axis', 'image'):
        assert expected in types
