"""Dataset creation / filter / histogram + doc.new + custom-definitions RPCs."""

import pytest


@pytest.mark.asyncio
async def test_create_range_and_expression(daemon):
    r = await daemon.call('data.create', name='t', mode='range',
                          nsteps=5, min=0, max=10)
    assert r['created'] == ['t']
    r2 = await daemon.call('data.create', name='t2', mode='expression', expr='t*2')
    assert r2['created'] == ['t2']
    stats = await daemon.call('data.stats', name='t2')
    assert stats['max'] == 20


@pytest.mark.asyncio
async def test_histogram(daemon):
    await daemon.call('data.create', name='t', mode='range', nsteps=100, min=0, max=10)
    r = await daemon.call('data.histogram', expr='t', outbins='hb', outvals='hv', bins=4)
    assert set(r['created']) == {'hb', 'hv'}


@pytest.mark.asyncio
async def test_filter_requires_prefix_or_suffix(daemon):
    await daemon.call('data.create', name='t', mode='range', nsteps=10, min=0, max=9)
    with pytest.raises(RuntimeError, match='prefix or suffix'):
        await daemon.call('data.filter', filter='t>3', datasets=['t'])
    r = await daemon.call('data.filter', filter='t>3', datasets=['t'], prefix='f_')
    assert r['created'] == ['f_t']


@pytest.mark.asyncio
async def test_create_2d_xyfunc(daemon):
    r = await daemon.call('data.create_2d', name='g', mode='xyfunc',
                          expr='x+y', xstep=[0, 2, 1], ystep=[0, 2, 1])
    assert r['created'] == ['g']


@pytest.mark.asyncio
async def test_custom_definitions_roundtrip(daemon):
    await daemon.call('doc.set_customs', ctype='constant', entries=[['k', '42']])
    customs = await daemon.call('doc.get_customs')
    assert ['k', '42'] in customs['definition']


@pytest.mark.asyncio
async def test_doc_new_wipes(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('data.set', name='x', values=[1, 2, 3])
    await daemon.call('doc.new', mode='graph')
    tree = await daemon.call('doc.tree')
    # makeDefaultDoc('graph') seeds a page+graph; the old data is gone.
    assert (await daemon.call('data.list')) == []
    assert tree['type'] == 'document'
