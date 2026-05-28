"""Render RPC: PNG bytes back, bounds map populated."""

import base64
import pytest


@pytest.mark.asyncio
async def test_render_minimal_plot(daemon):
    # Build minimal plot
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    await daemon.call('data.set', name='x', values=list(range(20)))
    await daemon.call('data.set', name='y', values=[i * i for i in range(20)])
    r = await daemon.call('render.png', page=0, w=320, h=240)
    png = base64.b64decode(r['png'])
    assert png[:8] == b'\x89PNG\r\n\x1a\n'
    assert r['width'] == 320 and r['height'] == 240
    # We should have at least bounds for the page, graph, x/y axes, xy widget
    assert len(r['bounds']) >= 3
    # Sanity: the page bounds should cover most of the canvas
    page_bounds = r['bounds'].get('/page1')
    assert page_bounds is not None
    x1, y1, x2, y2 = page_bounds
    assert x2 - x1 > 100 and y2 - y1 > 100


@pytest.mark.asyncio
async def test_render_no_pages_fails(daemon):
    with pytest.raises(RuntimeError, match='no pages'):
        await daemon.call('render.png', page=0, w=100, h=100)


@pytest.mark.asyncio
async def test_hittest_after_render(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    await daemon.call('data.set', name='x', values=list(range(20)))
    await daemon.call('data.set', name='y', values=[i * i for i in range(20)])
    await daemon.call('render.png', page=0, w=400, h=300)
    r = await daemon.call('hittest.point', page=0, x=200, y=150)
    assert 'path' in r


@pytest.mark.asyncio
async def test_copy_image_png(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    r = await daemon.call('render.copy_image', page=0, w=320, h=240,
                          format='png')
    assert r['format'] == 'png'
    assert r['mime_type'] == 'image/png'
    raw = base64.b64decode(r['payload_b64'])
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'


@pytest.mark.xfail(reason='SVGPaintDevice/QPainter.end() segfaults on '
                          'Python 3.14 + Qt 6.11 + io.BytesIO; pre-existing '
                          'issue in render.svg handler, not specific to '
                          'copy_image. Tracked separately.',
                   strict=False, run=False)
@pytest.mark.asyncio
async def test_copy_image_svg(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    r = await daemon.call('render.copy_image', page=0, w=320, h=240,
                          format='svg')
    assert r['format'] == 'svg'
    assert r['mime_type'] == 'image/svg+xml'
    raw = base64.b64decode(r['payload_b64']).decode('utf-8')
    assert raw.lstrip().startswith('<?xml') or raw.lstrip().startswith('<svg')


@pytest.mark.asyncio
async def test_copy_image_unknown_format(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    with pytest.raises(RuntimeError, match='unsupported format'):
        await daemon.call('render.copy_image', format='tiff')
