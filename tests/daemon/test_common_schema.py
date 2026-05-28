"""doc.common_schema RPC tests — drives Inspector multi-edit.

Verifies the intersection algorithm (`SettingsProxyMulti` parity) plus
the ``mixed_value`` flag for leaves whose current values differ across
the selected widgets, and the collapse-to-one-undo behavior of a
batched `doc.set(ops=[...])` over the multi-selection.
"""

import pytest


@pytest.fixture
async def two_axes(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    # Each graph autocreates 'x' and 'y' axes — reuse those.
    return ['/page1/graph1/x', '/page1/graph1/y']


def _walk(node):
    """Yield (name, leaf_dict) for every leaf in a schema tree."""
    for s in node.get('settings', []):
        yield (s['name'], s)
    for g in node.get('subgroups', []):
        # Prefix child names with group/ for disambiguation.
        for n, leaf in _walk(g):
            yield (g['name'] + '/' + n, leaf)


@pytest.mark.asyncio
async def test_common_schema_returns_intersection(daemon, two_axes):
    sch = await daemon.call('doc.common_schema', paths=two_axes)
    assert sch['mode'] == 'common'
    assert sch['count'] == 2
    assert sch['typenames'] == ['axis']
    leaves = dict(_walk(sch))
    # Axis-specific settings should be present.
    assert 'label' in leaves
    assert 'min' in leaves


@pytest.mark.asyncio
async def test_common_schema_mixed_value_flag(daemon, two_axes):
    # Both axes start at default 'label' (empty); set one of them only.
    await daemon.call('doc.set', ops=[
        {'path': two_axes[0] + '/label', 'value': 'X axis'},
    ])
    sch = await daemon.call('doc.common_schema', paths=two_axes)
    leaves = dict(_walk(sch))
    assert leaves['label']['mixed_value'] is True
    # `value` is suppressed for mixed leaves so the inspector shows
    # a placeholder instead of one of the two values.
    assert leaves['label']['value'] is None


@pytest.mark.asyncio
async def test_common_schema_equal_value_not_mixed(daemon, two_axes):
    # Set the same value on both — mixed_value should be False.
    await daemon.call('doc.set', ops=[
        {'path': two_axes[0] + '/label', 'value': 'Both'},
        {'path': two_axes[1] + '/label', 'value': 'Both'},
    ])
    sch = await daemon.call('doc.common_schema', paths=two_axes)
    leaves = dict(_walk(sch))
    assert leaves['label']['mixed_value'] is False
    assert leaves['label']['value'] == 'Both'


@pytest.mark.asyncio
async def test_batched_doc_set_collapses_to_one_undo(daemon, two_axes):
    """A doc.set(ops=[...]) over multiple paths must collapse to one
    undo step — this is the core invariant for Inspector multi-edit."""
    # Capture pre-state.
    pre = await daemon.call('doc.get',
                            paths=[two_axes[0] + '/label',
                                   two_axes[1] + '/label'])
    # Batched write.
    await daemon.call('doc.set', ops=[
        {'path': two_axes[0] + '/label', 'value': 'Both'},
        {'path': two_axes[1] + '/label', 'value': 'Both'},
    ])
    # One undo must revert BOTH widgets.
    await daemon.call('doc.undo')
    post = await daemon.call('doc.get',
                             paths=[two_axes[0] + '/label',
                                    two_axes[1] + '/label'])
    assert post == pre


@pytest.mark.asyncio
async def test_common_schema_across_different_types_is_minimal(daemon):
    """Two widgets of different types share only their common base
    settings (e.g. `hide`)."""
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')
    sch = await daemon.call('doc.common_schema',
                            paths=['/page1/graph1/x', '/page1/graph1/xy1'])
    leaves = dict(_walk(sch))
    # `hide` is on every widget.
    assert 'hide' in leaves
    # Type-specific settings should NOT appear (axis-only or xy-only).
    assert 'marker' not in leaves   # xy-only
    assert 'min' not in leaves      # axis-only


@pytest.mark.asyncio
async def test_common_schema_rejects_empty(daemon):
    with pytest.raises(RuntimeError, match='non-empty'):
        await daemon.call('doc.common_schema', paths=[])
