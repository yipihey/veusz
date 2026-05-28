"""doc.serialize_widgets / paste_widgets_mime / can_paste_mime tests.

The roundtrip must produce bytes wire-identical to what the legacy Qt
GUI writes — that's how cross-app copy/paste works.
"""

import base64

import pytest


WIDGET_MIME = 'text/x-vnd.veusz-widget-3'


@pytest.fixture
async def two_xys(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')  # xy1
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')  # xy2
    return ['/page1/graph1/xy1', '/page1/graph1/xy2']


@pytest.mark.asyncio
async def test_serialize_returns_widget_mime(daemon, two_xys):
    r = await daemon.call('doc.serialize_widgets', paths=[two_xys[0]])
    assert r['mime_type'] == WIDGET_MIME
    assert r['count'] == 1
    text = base64.b64decode(r['payload_b64']).decode('utf-8')
    # Format: first line is the widget count.
    assert text.split('\n', 1)[0] == '1'
    # Body must mention the widget type.
    assert 'xy' in text


@pytest.mark.asyncio
async def test_serialize_multiple(daemon, two_xys):
    r = await daemon.call('doc.serialize_widgets', paths=two_xys)
    text = base64.b64decode(r['payload_b64']).decode('utf-8')
    assert text.split('\n', 1)[0] == '2'
    assert r['count'] == 2


@pytest.mark.asyncio
async def test_serialize_rejects_empty(daemon):
    with pytest.raises(RuntimeError, match='paths'):
        await daemon.call('doc.serialize_widgets', paths=[])


@pytest.mark.asyncio
async def test_roundtrip_paste(daemon, two_xys):
    # Copy xy1, paste under the same graph — should appear with a new name.
    serialized = await daemon.call('doc.serialize_widgets', paths=[two_xys[0]])
    r = await daemon.call('doc.paste_widgets_mime',
                          parent='/page1/graph1',
                          mime_type=serialized['mime_type'],
                          payload_b64=serialized['payload_b64'])
    assert len(r['paths']) == 1
    pasted = r['paths'][0]
    # The new widget exists.
    t = await daemon.call('doc.tree')
    leaf_names = {c['name']
                  for c in t['children'][0]['children'][0]['children']}
    assert pasted.rsplit('/', 1)[1] in leaf_names


@pytest.mark.asyncio
async def test_paste_into_unsuitable_parent_rejected(daemon, two_xys):
    """Pasting an xy under the document root has no suitable parent —
    `isWidgetMimePastable` should reject it."""
    serialized = await daemon.call('doc.serialize_widgets', paths=[two_xys[0]])
    with pytest.raises(RuntimeError, match='not pastable'):
        await daemon.call('doc.paste_widgets_mime',
                          parent='/',
                          mime_type=serialized['mime_type'],
                          payload_b64=serialized['payload_b64'])


@pytest.mark.asyncio
async def test_paste_unknown_mime_type_rejected(daemon, two_xys):
    serialized = await daemon.call('doc.serialize_widgets', paths=[two_xys[0]])
    with pytest.raises(RuntimeError, match='unsupported mime_type'):
        await daemon.call('doc.paste_widgets_mime',
                          parent='/page1/graph1',
                          mime_type='application/x-bogus',
                          payload_b64=serialized['payload_b64'])


@pytest.mark.asyncio
async def test_paste_invalid_base64_rejected(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    with pytest.raises(RuntimeError, match='base64'):
        await daemon.call('doc.paste_widgets_mime',
                          parent='/page1',
                          mime_type=WIDGET_MIME,
                          payload_b64='!not-base64!')


@pytest.mark.asyncio
async def test_can_paste_mime_yes(daemon, two_xys):
    serialized = await daemon.call('doc.serialize_widgets', paths=[two_xys[0]])
    r = await daemon.call('doc.can_paste_mime',
                          parent='/page1/graph1',
                          mime_type=serialized['mime_type'],
                          payload_b64=serialized['payload_b64'])
    assert r['ok'] is True


@pytest.mark.asyncio
async def test_can_paste_mime_no(daemon, two_xys):
    serialized = await daemon.call('doc.serialize_widgets', paths=[two_xys[0]])
    r = await daemon.call('doc.can_paste_mime',
                          parent='/',
                          mime_type=serialized['mime_type'],
                          payload_b64=serialized['payload_b64'])
    assert r['ok'] is False


@pytest.mark.asyncio
async def test_can_paste_mime_bad_input_is_ok_false(daemon):
    # Wrong mime_type or bad base64 — should not raise, just return false.
    r = await daemon.call('doc.can_paste_mime',
                          parent='/',
                          mime_type='application/x-bogus',
                          payload_b64='')
    assert r['ok'] is False
