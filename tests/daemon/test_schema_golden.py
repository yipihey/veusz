"""Schema-drift sentinel.

The Tauri frontend's property inspector is a function of the schema
the daemon emits. If Veusz adds, removes, or renames a setting on any
registered widget, this test fires and forces the engineer to either
(a) bless the change by regenerating the golden file or (b) revert.

Regenerating::

    python -m tests.daemon.regen_golden

The golden file lives next to this test as ``schema_golden.json``.
"""

from __future__ import annotations

import json
import os
import sys

import pytest

# Run as a stand-alone script: triggers regen, not a test.
GOLDEN = os.path.join(os.path.dirname(__file__), 'fixtures', 'schema_golden.json')


def _extract():
    # Needs QApplication for widget registration to fire.
    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    from PyQt6.QtWidgets import QApplication
    if QApplication.instance() is None:
        QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets  # noqa: F401
    from veusz.daemon.schema import extract_all_schemas
    return extract_all_schemas('class')


@pytest.mark.skipif(not os.path.exists(GOLDEN),
    reason='no golden file yet; run regen_golden.py to create one')
def test_schema_matches_golden():
    """Detect drift in any widget's declared settings schema."""
    actual = _extract()
    with open(GOLDEN) as f:
        expected = json.load(f)
    # Diff at widget-type granularity so failures are actionable
    actual_types = set(actual.keys())
    expected_types = set(expected.keys())
    assert actual_types == expected_types, (
        f'widget types changed; added={actual_types - expected_types}, '
        f'removed={expected_types - actual_types}')
    diffs = []
    for wt in sorted(actual_types):
        if actual[wt] != expected[wt]:
            diffs.append(wt)
    assert not diffs, (
        f'schema drift in widgets: {diffs}\n'
        f'Regenerate the golden file by running\n'
        f'  python tests/daemon/regen_golden.py')


def test_schema_every_widget_extracts_without_error():
    """Even without a golden, prove the extractor doesn't crash."""
    schemas = _extract()
    assert len(schemas) >= 30
    for wt, sch in schemas.items():
        assert sch['typename'] == wt
        assert 'settings' in sch
        assert 'subgroups' in sch
        for s in sch['settings']:
            assert 'name' in s
            assert 'typename' in s
            # default must be JSON-serializable
            json.dumps(s['default'])


def test_schema_known_setting_types_covered():
    """The frontend registry depends on this set of typenames. If any
    widget starts using a typename not in our registry, the inspector
    will fall back to a raw text input — fine, but we want to know."""
    schemas = _extract()
    seen = set()
    def walk(node):
        for s in node['settings']:
            seen.add(s['typename'])
        for g in node['subgroups']:
            walk(g)
    for sch in schemas.values():
        walk(sch)
    # These are the typenames the React registry implements (from the plan).
    REGISTRY = {
        'str', 'str-notes', 'str-multi',
        'bool',
        'int', 'float',
        'float-or-auto', 'float-slider', 'int-or-auto',
        'distance', 'distance-or-auto', 'displacement',
        'choice', 'choice-or-more', 'float-choice',
        'float-dict', 'float-list',
        'widget-path', 'widget-choice', 'axis',
        'dataset', 'dataset-multi', 'dataset-extended', 'dataset-or-str',
        'color', 'colormap',
        'fill-style', 'fill-style-ext', 'fill-multi',
        'line-style', 'line-multi',
        'marker', 'arrow',
        'errorbar-style',
        'align-horz', 'align-vert',
        'align-horz-+manual', 'align-vert-+manual',
        'filename', 'filename-image', 'filename-svg',
        'font-family', 'font-style',
        'axis-bound', 'rotate-interval',
        'backward-compat',
    }
    unknown = seen - REGISTRY
    assert not unknown, (
        f'Veusz uses Setting typenames the React registry does not yet '
        f'cover: {sorted(unknown)}. Add a leaf component for each.')
