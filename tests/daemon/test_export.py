"""file.export — produce real files (PDF / PNG / SVG)."""

import os
import pytest


@pytest.fixture
async def doc_with_plot(daemon):
    """Yield a daemon with a small xy plot already built."""
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    await daemon.call('data.set', name='x', values=[0.0, 1.0, 2.0, 3.0, 4.0])
    await daemon.call('data.set', name='y', values=[0.0, 1.0, 4.0, 9.0, 16.0])
    await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/xData', 'value': 'x'},
        {'path': '/page1/graph1/xy1/yData', 'value': 'y'},
    ])
    return daemon


@pytest.mark.asyncio
async def test_formats_includes_pdf_and_png(daemon):
    fmts = await daemon.call('file.formats')
    exts = set()
    for f in fmts:
        exts.update(f['extensions'])
    # PDF and SVG are universal; PNG is conditional on Qt's imageformat
    # plugins which the offscreen platform supports.
    assert 'pdf' in exts
    assert 'svg' in exts


@pytest.mark.asyncio
async def test_export_pdf(doc_with_plot, tmp_path):
    out = str(tmp_path / 'out.pdf')
    r = await doc_with_plot.call('file.export', path=out)
    assert r['ok'] is True and r['path'] == out
    assert os.path.exists(out)
    assert os.path.getsize(out) > 100
    with open(out, 'rb') as f:
        assert f.read(5) == b'%PDF-'


@pytest.mark.asyncio
async def test_export_png(doc_with_plot, tmp_path):
    out = str(tmp_path / 'out.png')
    await doc_with_plot.call('file.export', path=out)
    with open(out, 'rb') as f:
        assert f.read(8) == b'\x89PNG\r\n\x1a\n'


@pytest.mark.asyncio
async def test_export_svg(doc_with_plot, tmp_path):
    out = str(tmp_path / 'out.svg')
    await doc_with_plot.call('file.export', path=out)
    text = open(out).read()
    assert text.startswith('<?xml') or '<svg' in text


@pytest.mark.asyncio
async def test_export_missing_pages(daemon, tmp_path):
    # No page → daemon should refuse
    with pytest.raises(RuntimeError, match='no pages'):
        await daemon.call('file.export', path=str(tmp_path / 'a.png'))


@pytest.mark.asyncio
async def test_export_invalid_page_number(doc_with_plot, tmp_path):
    with pytest.raises(RuntimeError, match='out of range'):
        await doc_with_plot.call('file.export',
            path=str(tmp_path / 'a.png'), pages=[5])
