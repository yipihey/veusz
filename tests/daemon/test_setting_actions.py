"""doc.propagate_setting / reset_setting_default / set_setting_default /
unlink_setting RPC tests."""

import pytest


@pytest.fixture
async def two_xys(daemon):
    await daemon.call('doc.add', parent='/', type='page')
    await daemon.call('doc.add', parent='/page1', type='graph')
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')  # xy1
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')  # xy2
    # Set distinct marker values so we can tell them apart.
    await daemon.call('doc.set', ops=[
        {'path': '/page1/graph1/xy1/marker', 'value': 'square'},
    ])
    return ['/page1/graph1/xy1', '/page1/graph1/xy2']


@pytest.mark.asyncio
async def test_propagate_all_of_type(daemon, two_xys):
    """Set xy1's marker to 'square', propagate to all xy widgets."""
    await daemon.call('doc.propagate_setting',
                      path='/page1/graph1/xy1/marker',
                      scope='all_of_type')
    got = await daemon.call('doc.get',
                            paths=[two_xys[0] + '/marker',
                                   two_xys[1] + '/marker'])
    assert got[two_xys[0] + '/marker'] == 'square'
    assert got[two_xys[1] + '/marker'] == 'square'


@pytest.mark.asyncio
async def test_propagate_widgets_scope(daemon, two_xys):
    """Explicit widget list — must apply to the listed paths only."""
    # Add a third xy under a different graph that should NOT be touched.
    await daemon.call('doc.add', parent='/page1', type='graph')  # graph2
    await daemon.call('doc.add', parent='/page1/graph2', type='xy')

    await daemon.call('doc.propagate_setting',
                      path='/page1/graph1/xy1/marker',
                      scope='widgets',
                      widget_paths=[two_xys[1]])
    got = await daemon.call('doc.get', paths=[
        two_xys[1] + '/marker',
        '/page1/graph2/xy1/marker',
    ])
    assert got[two_xys[1] + '/marker'] == 'square'
    # The xy under graph2 wasn't in the target list — keeps default.
    assert got['/page1/graph2/xy1/marker'] != 'square'


@pytest.mark.asyncio
async def test_propagate_widgets_collapses_to_one_undo_step(daemon, two_xys):
    """A multi-target propagate must collapse to a single undo step."""
    # Add a third xy so the propagation hits >1 target.
    await daemon.call('doc.add', parent='/page1/graph1', type='xy')  # xy3
    pre = await daemon.call('doc.get',
                            paths=['/page1/graph1/xy2/marker',
                                   '/page1/graph1/xy3/marker'])
    await daemon.call('doc.propagate_setting',
                      path='/page1/graph1/xy1/marker',
                      scope='widgets',
                      widget_paths=['/page1/graph1/xy2',
                                    '/page1/graph1/xy3'])
    # One undo reverts BOTH widgets.
    await daemon.call('doc.undo')
    got = await daemon.call('doc.get',
                            paths=['/page1/graph1/xy2/marker',
                                   '/page1/graph1/xy3/marker'])
    assert got == pre


@pytest.mark.asyncio
async def test_propagate_rejects_unknown_scope(daemon, two_xys):
    with pytest.raises(RuntimeError, match='unknown scope'):
        await daemon.call('doc.propagate_setting',
                          path='/page1/graph1/xy1/marker',
                          scope='galaxy')


@pytest.mark.asyncio
async def test_reset_setting_default(daemon, two_xys):
    # xy1's marker was set to 'square'; reset returns it to default.
    r = await daemon.call('doc.reset_setting_default',
                          path='/page1/graph1/xy1/marker')
    # Default for `marker` on xy is 'circle'.
    assert r['value'] == 'circle'


@pytest.mark.asyncio
async def test_set_setting_default_writes_to_stylesheet(daemon, two_xys):
    """Setting xy1's marker as the default style writes to the
    /StyleSheet/xy/.../marker setting."""
    r = await daemon.call('doc.set_setting_default',
                          path='/page1/graph1/xy1/marker')
    assert r['stylesheet_path'].startswith('/StyleSheet/')
    # The stylesheet now reflects 'square'.
    got = await daemon.call('doc.get', paths=[r['stylesheet_path']])
    assert got[r['stylesheet_path']] == 'square'


@pytest.mark.asyncio
async def test_unlink_setting_only_when_reference(daemon, two_xys):
    """Calling unlink on a non-reference setting must raise."""
    with pytest.raises(RuntimeError, match='not a reference'):
        await daemon.call('doc.unlink_setting',
                          path='/page1/graph1/xy1/marker')
