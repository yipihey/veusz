"""data.import — proves the Phase-1 exit criterion: CSV → plot."""

import base64
import os
import tempfile

import pytest


CSV_BODY = """\
x,y
0,0
1,1
2,4
3,9
4,16
5,25
6,36
7,49
8,64
9,81
"""


@pytest.fixture
def csv_path(tmp_path):
    p = tmp_path / 'square.csv'
    p.write_text(CSV_BODY)
    return str(p)


@pytest.mark.asyncio
async def test_csv_import_creates_datasets(daemon, csv_path):
    r = await daemon.call('data.import', kind='csv', filename=csv_path)
    assert sorted(r['imported']) == ['x', 'y']
    listing = await daemon.call('data.list')
    names = {d['name'] for d in listing}
    assert {'x', 'y'} <= names


@pytest.mark.asyncio
async def test_csv_to_rendered_plot_endtoend(daemon, csv_path):
    """The Phase-1 exit criterion: open a CSV, see the plot."""
    await daemon.call('data.import', kind='csv', filename=csv_path)
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/xData', 'value': 'x'},
        {'path': '/page1/graph1/xy1/yData', 'value': 'y'},
    ])
    r = await daemon.call('render.png', page=0, w=400, h=300)
    png = base64.b64decode(r['png'])
    assert png[:8] == b'\x89PNG\r\n\x1a\n'
    # The xy widget should appear in the bounds map — proves it actually drew.
    assert '/page1/graph1/xy1' in r['bounds']


@pytest.mark.asyncio
async def test_plaintext_import_with_descriptor(daemon, tmp_path):
    """The 'plaintext' kind maps to ImportFile and honours a descriptor."""
    p = tmp_path / 'cols.dat'
    p.write_text('1 10\n2 20\n3 30\n')
    r = await daemon.call('data.import', kind='plaintext',
                          filename=str(p), options={'descriptor': 'a b'})
    assert sorted(r['imported']) == ['a', 'b']
    stats = await daemon.call('data.stats', name='b')
    assert stats['max'] == 30


@pytest.mark.asyncio
async def test_import_bad_kind_errors(daemon):
    with pytest.raises(RuntimeError, match='unknown or unavailable importer'):
        await daemon.call('data.import', kind='not-a-format', filename='/dev/null')


@pytest.mark.asyncio
async def test_import_missing_file_errors(daemon):
    with pytest.raises(RuntimeError, match='import failed'):
        await daemon.call('data.import', kind='csv',
            filename='/no/such/file/anywhere.csv')
