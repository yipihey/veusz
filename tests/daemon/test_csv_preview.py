"""data.preview_csv — drives the CSV import wizard."""

import pytest


CSV_BODY = """\
# A comment line to skip
# Another header-ignore line
x,y,label
0,0,origin
1,1,unit
2,4,square
3,9,cube
"""


@pytest.fixture
def csv_path(tmp_path):
    p = tmp_path / 'sample.csv'
    p.write_text(CSV_BODY)
    return str(p)


@pytest.mark.asyncio
async def test_preview_default_settings(daemon, csv_path):
    r = await daemon.call('data.preview_csv', filename=csv_path,
                          rows_ignore=2)  # skip the # comment lines
    assert r['header'] == ['x', 'y', 'label']
    assert r['rows'][0] == ['0', '0', 'origin']
    assert len(r['rows']) == 4
    assert r['total_lines_estimated'] >= 7
    assert r['truncated'] is False


@pytest.mark.asyncio
async def test_preview_with_tab_delimiter(daemon, tmp_path):
    p = tmp_path / 'tab.tsv'
    p.write_text('a\tb\n1\t2\n3\t4\n')
    r = await daemon.call('data.preview_csv', filename=str(p), delimiter='\t')
    assert r['header'] == ['a', 'b']
    assert r['rows'] == [['1', '2'], ['3', '4']]


@pytest.mark.asyncio
async def test_preview_caps_at_max_rows(daemon, tmp_path):
    lines = ['x'] + [str(i) for i in range(100)]
    p = tmp_path / 'big.csv'
    p.write_text('\n'.join(lines))
    r = await daemon.call('data.preview_csv', filename=str(p), max_rows=5)
    assert r['truncated'] is True
    assert len(r['rows']) == 5


@pytest.mark.asyncio
async def test_preview_missing_file(daemon):
    with pytest.raises(RuntimeError, match='no such file'):
        await daemon.call('data.preview_csv', filename='/nope.csv')


@pytest.mark.asyncio
async def test_preview_bad_encoding(daemon, tmp_path):
    p = tmp_path / 'binary.csv'
    # bytes that aren't valid utf-8
    p.write_bytes(b'\xff\xfe\x00bad data\n')
    with pytest.raises(RuntimeError, match='read failed'):
        await daemon.call('data.preview_csv', filename=str(p), encoding='utf-8')
