"""doc.undo / doc.redo / doc.can_undo."""

import pytest


@pytest.mark.asyncio
async def test_empty_doc_cannot_undo(daemon):
    r = await daemon.call('doc.can_undo')
    assert r == {'can_undo': False, 'can_redo': False}


@pytest.mark.asyncio
async def test_add_then_undo_removes_widget(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    tree = await daemon.call('doc.tree')
    assert len(tree['children']) == 1

    r = await daemon.call('doc.undo')
    assert r['can_undo'] is False
    assert r['can_redo'] is True

    tree = await daemon.call('doc.tree')
    assert tree['children'] == []


@pytest.mark.asyncio
async def test_redo_restores(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.undo')
    r = await daemon.call('doc.redo')
    assert r['can_undo'] is True
    assert r['can_redo'] is False
    tree = await daemon.call('doc.tree')
    assert len(tree['children']) == 1
    assert tree['children'][0]['name'] == 'page1'


@pytest.mark.asyncio
async def test_set_then_undo_restores_old_value(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    # marker default is 'circle'; change to 'square', then undo
    r = await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/marker', 'value': 'square'},
    ])
    assert r['diffs'][0]['new'] == 'square'

    await daemon.call('doc.undo')
    val = await daemon.call('doc.get', paths=['/page1/graph1/xy1/marker'])
    assert val == {'/page1/graph1/xy1/marker': 'circle'}


@pytest.mark.asyncio
async def test_undo_with_nothing_fails(daemon):
    with pytest.raises(RuntimeError, match='nothing to undo'):
        await daemon.call('doc.undo')
