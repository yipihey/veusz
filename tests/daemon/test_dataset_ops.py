"""data.* RPC tests: delete / rename / duplicate / tags / use-as /
clipboard / file-scoped ops."""

import base64
import pytest


DATA_MIME = 'text/x-vnd.veusz-data-1'


@pytest.fixture
async def three_datasets(daemon):
    """Three in-memory float datasets so we can exercise bulk ops."""
    await daemon.call('data.set', name='a', values=[1.0, 2.0, 3.0])
    await daemon.call('data.set', name='b', values=[4.0, 5.0, 6.0])
    await daemon.call('data.set', name='c', values=[7.0, 8.0, 9.0])
    return ['a', 'b', 'c']


@pytest.mark.asyncio
async def test_list_reports_linked_and_tags(daemon, three_datasets):
    """In-memory datasets report linked=None; tags reflect data.tag."""
    await daemon.call('data.tag', names=['a'], tag='keep')
    listing = {d['name']: d for d in await daemon.call('data.list')}
    assert listing['a']['linked'] is None
    assert listing['a']['tags'] == ['keep']
    assert listing['b']['tags'] == []


@pytest.mark.asyncio
async def test_delete_single(daemon, three_datasets):
    r = await daemon.call('data.delete', names=['b'])
    assert r['deleted'] == ['b']
    lst = await daemon.call('data.list')
    assert {d['name'] for d in lst} == {'a', 'c'}


@pytest.mark.asyncio
async def test_delete_multiple_collapses_to_one_undo(daemon, three_datasets):
    await daemon.call('data.delete', names=['a', 'c'])
    await daemon.call('doc.undo')
    lst = await daemon.call('data.list')
    assert {d['name'] for d in lst} == {'a', 'b', 'c'}


@pytest.mark.asyncio
async def test_delete_missing_dataset_rejected(daemon, three_datasets):
    with pytest.raises(RuntimeError, match='no such dataset'):
        await daemon.call('data.delete', names=['nope'])


@pytest.mark.asyncio
async def test_rename(daemon, three_datasets):
    r = await daemon.call('data.rename', old='a', new='aa')
    assert r['name'] == 'aa'
    names = {d['name'] for d in await daemon.call('data.list')}
    assert 'aa' in names and 'a' not in names


@pytest.mark.asyncio
async def test_rename_collision_rejected(daemon, three_datasets):
    with pytest.raises(RuntimeError, match='already exists'):
        await daemon.call('data.rename', old='a', new='b')


@pytest.mark.asyncio
async def test_duplicate_autoname(daemon, three_datasets):
    r = await daemon.call('data.duplicate', name='a')
    assert r['name'] == 'a_copy'
    # The clone shows up in data.list with the same length.
    lst = {d['name']: d for d in await daemon.call('data.list')}
    assert 'a_copy' in lst
    assert lst['a_copy']['len'] == lst['a']['len']


@pytest.mark.asyncio
async def test_duplicate_explicit_name(daemon, three_datasets):
    r = await daemon.call('data.duplicate', name='a', new_name='alpha')
    assert r['name'] == 'alpha'


@pytest.mark.asyncio
async def test_tag_and_untag(daemon, three_datasets):
    await daemon.call('data.tag', names=['a', 'b'], tag='important')
    tags = await daemon.call('data.tags_list')
    assert tags == {'important': ['a', 'b']}
    await daemon.call('data.untag', names=['a'], tag='important')
    tags = await daemon.call('data.tags_list')
    assert tags == {'important': ['b']}


@pytest.mark.asyncio
async def test_use_as_targets_lists_dataset_settings(daemon, three_datasets):
    """An xy widget exposes ``xData`` / ``yData`` of typename "dataset" —
    those are the binding sites for a numeric dataset."""
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    r = await daemon.call('data.use_as_targets', name='a')
    targets = r['targets']
    # We should find xData and yData on the xy widget.
    paths = {t['path'] for t in targets}
    assert '/page1/graph1/xy1/xData' in paths
    assert '/page1/graph1/xy1/yData' in paths
    # All targets must be dataset-typed.
    DATASET_TYPES = {'dataset', 'dataset-multi',
                     'dataset-extended', 'dataset-or-str'}
    for t in targets:
        assert t['typename'] in DATASET_TYPES


@pytest.mark.asyncio
async def test_use_as_targets_missing_dataset_rejected(daemon):
    with pytest.raises(RuntimeError, match='no such dataset'):
        await daemon.call('data.use_as_targets', name='ghost')


@pytest.mark.asyncio
async def test_serialize_returns_data_mime(daemon, three_datasets):
    r = await daemon.call('data.serialize', names=['a'])
    assert r['mime_type'] == DATA_MIME
    assert r['count'] == 1
    raw = base64.b64decode(r['payload_b64']).decode('utf-8')
    # The dataset save-text mentions the dataset name.
    assert 'a' in raw


@pytest.mark.asyncio
async def test_serialize_paste_roundtrip(daemon, three_datasets):
    r = await daemon.call('data.serialize', names=['a'])
    # Delete the original so paste can recreate without collision.
    await daemon.call('data.delete', names=['a'])
    paste = await daemon.call('data.paste_mime',
                              mime_type=r['mime_type'],
                              payload_b64=r['payload_b64'])
    assert 'a' in paste['pasted']
    lst = {d['name'] for d in await daemon.call('data.list')}
    assert 'a' in lst


@pytest.mark.asyncio
async def test_paste_mime_unknown_type_rejected(daemon):
    with pytest.raises(RuntimeError, match='unsupported mime_type'):
        await daemon.call('data.paste_mime',
                          mime_type='application/x-other',
                          payload_b64='AAAA')


@pytest.mark.asyncio
async def test_reload_file_smoke(daemon):
    """No linked datasets in this doc → reload returns an empty list."""
    r = await daemon.call('data.reload_file')
    assert r['reloaded'] == []
    assert r['errors'] == {}
