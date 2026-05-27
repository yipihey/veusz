"""Push notifications: doc.changed / data.changed."""

import pytest


@pytest.mark.asyncio
async def test_doc_set_emits_doc_changed(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    notif = await daemon.next_notification('doc.changed')
    assert notif['jsonrpc'] == '2.0'
    assert 'id' not in notif
    assert notif['params']['kind'] == 'add'
    assert notif['params']['paths'] == ['/page1']
    assert isinstance(notif['params']['changeset'], int)


@pytest.mark.asyncio
async def test_data_set_emits_data_changed(daemon):
    await daemon.call('data.set', name='x', values=[1.0, 2.0, 3.0])
    notif = await daemon.next_notification('data.changed')
    assert notif['params'] == {'names': ['x'], 'kind': 'set'}


@pytest.mark.asyncio
async def test_undo_emits_doc_changed(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.next_notification('doc.changed')  # consume the add
    await daemon.call('doc.undo')
    notif = await daemon.next_notification('doc.changed')
    assert notif['params']['kind'] == 'undo'


@pytest.mark.asyncio
async def test_csv_import_emits_data_changed(daemon, tmp_path):
    p = tmp_path / 'square.csv'
    p.write_text('x,y\n0,0\n1,1\n2,4\n')
    await daemon.call('data.import', kind='csv', filename=str(p))
    notif = await daemon.next_notification('data.changed')
    assert notif['params']['kind'] == 'import'
    assert sorted(notif['params']['names']) == ['x', 'y']


@pytest.mark.asyncio
async def test_doc_set_includes_modified_paths(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.next_notification('doc.changed')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.next_notification('doc.changed')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    await daemon.next_notification('doc.changed')

    await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/marker', 'value': 'square'},
    ])
    notif = await daemon.next_notification('doc.changed')
    assert notif['params']['kind'] == 'set'
    assert notif['params']['paths'] == ['/page1/graph1/xy1/marker']
