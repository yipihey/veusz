# Schema extractor for the Veusz daemon.
#
#    This file is part of Veusz.
#
#    Veusz is free software: you can redistribute it and/or modify it
#    under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 2 of the License, or
#    (at your option) any later version.
#
#    Veusz is distributed in the hope that it will be useful, but
#    WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
#    General Public License for more details.
##############################################################################

"""Mechanical extraction of widget Settings schemas.

Drives Veusz's existing introspection — `widgetfactory.thefactory`,
each widget class's ``addSettings`` classmethod, and the
``Settings`` / ``Setting`` metadata fields — to produce stable JSON
that the Tauri frontend's property inspector consumes.

Two extraction modes:

* ``extract_class_schema(widget_type)`` — class-level only. Calls
  ``addSettings`` on a temporary ``Settings`` object. No widget
  instance is created. Fast, deterministic, and safe to call from any
  thread. Misses settings that widgets *remove* in ``__init__``.

* ``extract_instance_schema(widget_type)`` — instantiates a throwaway
  widget parented to ``None`` to capture post-``__init__`` removals
  (Axis3D, Boxplot, …). Slightly slower; needed for full fidelity.

The serialized form is documented inline below — a backwards-
compatible JSON shape is what the frontend registry depends on.
"""

from __future__ import annotations

from typing import Any

from ..document.widgetfactory import thefactory
from ..setting.settings import Settings
from ..setting.reference import ReferenceBase


# -- JSON sanitization -------------------------------------------------------

def _json_safe(value: Any) -> Any:
    """Coerce a setting's `.default` (or similar) into JSON-safe form.

    Veusz defaults are mostly primitives, but a few setting types use
    tuples (FloatList, LineSet, FillSet, FloatDict). Numpy scalars
    occasionally sneak in. Anything we can't represent is rendered as
    its ``repr``, which the frontend treats as opaque and refuses to
    let the user edit through the generic registry.
    """
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, ReferenceBase):
        # The default is a *reference* to another setting (stylesheet
        # links etc.). Serialize as the path string the frontend can
        # follow rather than the object's repr — which contains a
        # changing memory address.
        return {'$ref': value.value}
    if isinstance(value, (list, tuple)):
        return [_json_safe(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    # numpy scalars
    if hasattr(value, 'item'):
        try:
            return _json_safe(value.item())
        except Exception:
            pass
    return repr(value)


# -- Setting serializer ------------------------------------------------------

# Optional fields we copy off Setting instances when present. Keeping
# this as a table makes it cheap to add new metadata as Veusz evolves.
_OPTIONAL_FIELDS = (
    'minval', 'maxval',
    'vallist', 'descriptions', 'uilist',
    'step', 'tick', 'scale',
    'dimensions', 'datatype',
    'familysetnname',
    'relativetoparent',
    'widgettypes',
    'settingsfalse', 'settingstrue',
    'direction',
)


def _serialize_setting(s) -> dict:
    """Reduce a `Setting` instance to a JSON dict."""
    out = {
        'name': s.name,
        'typename': s.typename,
        'default': _json_safe(s.default),
        'descr': s.descr,
        'usertext': s.usertext,
        'formatting': bool(s.formatting),
        'hidden': bool(s.hidden),
        # Whether the setting currently holds a reference (link). True
        # for stylesheet-linked settings; flips back to False after
        # `doc.unlink_setting`. The frontend uses this to enable/disable
        # the "Unlink setting" right-click menu item.
        'is_reference': bool(getattr(s, 'isReference', lambda: False)()),
    }
    for field in _OPTIONAL_FIELDS:
        if hasattr(s, field):
            val = getattr(s, field)
            if val is None:
                continue
            # Skip very large sentinels that come from defaults
            if field in ('minval', 'maxval') and isinstance(val, (int, float)):
                # 1e200 / 1000000 / -1e200 / -1000000 are Veusz's "no bound"
                # sentinels. Pass them through; the frontend can treat them
                # as no-limit.
                pass
            out[field] = _json_safe(val)
    return out


def _serialize_group(group: Settings) -> dict:
    """Recursively reduce a `Settings` group to a JSON dict."""
    settings_out = []
    subgroups_out = []
    for item in group.getList():
        if isinstance(item, Settings):
            subgroups_out.append(_serialize_group(item))
        else:
            settings_out.append(_serialize_setting(item))
    return {
        'name': group.name,
        'usertext': group.usertext,
        'descr': group.descr,
        'setnsmode': group.setnsmode,
        'settings': settings_out,
        'subgroups': subgroups_out,
    }


# -- Public API --------------------------------------------------------------

def list_widget_types() -> list[str]:
    """Names of every widget type registered with `widgetfactory`."""
    return list(thefactory.listWidgets())


def extract_class_schema(widget_type: str) -> dict:
    """Return the declared schema for ``widget_type``.

    Calls the widget class's ``addSettings`` classmethod on a fresh
    ``Settings`` group. Does *not* instantiate a widget. Misses
    settings removed during ``__init__`` (Axis3D, Boxplot).
    """
    klass = thefactory.getWidgetClass(widget_type)
    s = Settings(
        f'Widget_{widget_type}',
        setnsmode='widgetsettings',
    )
    klass.addSettings(s)
    schema = _serialize_group(s)
    schema['typename'] = widget_type
    schema['mode'] = 'class'
    return schema


def extract_instance_schema(widget_type: str) -> dict:
    """Return the full schema, accounting for post-``__init__`` mutations.

    Instantiates a throwaway widget with no parent. The instance's
    ``self.settings`` reflects any ``remove()`` calls the widget made
    in its constructor. This is the form the frontend should prefer
    when accuracy matters more than speed.
    """
    klass = thefactory.getWidgetClass(widget_type)
    instance = klass(None)
    schema = _serialize_group(instance.settings)
    schema['typename'] = widget_type
    schema['mode'] = 'instance'
    return schema


def extract_path_schema(document, path: str) -> dict:
    """Return a schema for whatever lives at ``path`` on ``document``.

    Works for non-widget paths like ``/StyleSheet`` whose contents are
    a Settings group, not a widget class. Reuses the same serializer
    the widget-class extractor uses so the frontend Inspector renders
    these via the same recursion.
    """
    if not isinstance(path, str) or not path.startswith('/'):
        raise ValueError(f'bad path: {path!r}')
    parts = [p for p in path.split('/') if p]
    node: object = document.basewidget
    for part in parts:
        # Try as a child widget first, then as a settings group.
        nxt = None
        if hasattr(node, 'getChild'):
            child = node.getChild(part)
            if child is not None:
                nxt = child
        if nxt is None and hasattr(node, 'settings'):
            try:
                nxt = node.settings.get(part)
            except (AttributeError, KeyError):
                pass
        if nxt is None and isinstance(node, Settings):
            try:
                nxt = node.get(part)
            except (AttributeError, KeyError):
                pass
        if nxt is None:
            raise KeyError(f'no node at {path!r} (failed at {part!r})')
        node = nxt
    # `node` is either a Widget, a Settings group, or a leaf Setting.
    if hasattr(node, 'iswidget') and node.iswidget:
        schema = _serialize_group(node.settings)
        schema['typename'] = node.typename
        schema['mode'] = 'path'
        return schema
    if isinstance(node, Settings):
        schema = _serialize_group(node)
        schema['typename'] = node.name
        schema['mode'] = 'path'
        return schema
    # Leaf setting — wrap as a one-element group so the Inspector can
    # render it uniformly.
    return {
        'typename': getattr(node, 'typename', 'setting'),
        'mode': 'path',
        'name': getattr(node, 'name', ''),
        'usertext': getattr(node, 'usertext', ''),
        'descr': getattr(node, 'descr', ''),
        'setnsmode': 'leaf',
        'settings': [_serialize_setting(node)],
        'subgroups': [],
    }


def extract_all_schemas(mode: str = 'class') -> dict[str, dict]:
    """Return ``{widget_type: schema}`` for every registered widget.

    Used by the golden-file test to detect schema drift across Veusz
    versions. ``mode`` is ``'class'`` (fast, declared-only) or
    ``'instance'`` (full fidelity).
    """
    extract = (
        extract_instance_schema if mode == 'instance' else extract_class_schema
    )
    return {wt: extract(wt) for wt in sorted(list_widget_types())}


# -- Multi-widget common schema (drives Inspector multi-edit) ---------------

def _common_setting_dict(setting_objs):
    """Serialize ``setting_objs`` (one Setting per selected widget,
    all sharing the same name and type) into the schema dict, with a
    ``mixed_value`` flag set when the widgets' current values differ.
    """
    leaf = _serialize_setting(setting_objs[0])
    first_val = setting_objs[0].val
    mixed = any(s.val != first_val for s in setting_objs[1:])
    leaf['mixed_value'] = mixed
    leaf['value'] = _json_safe(first_val) if not mixed else None
    return leaf


def _intersect_settings_groups(groups: list) -> dict:
    """Recurse over a list of `Settings` groups (one per widget in the
    selection) and produce the intersection schema. Mirrors
    `SettingsProxyMulti._objList` at
    ``veusz/windows/treeeditwindow.py:160``.
    """
    from ..setting.settings import Settings as _Settings
    from ..setting.setting import Setting as _Setting

    head = groups[0]
    # Compute the name intersection across all groups.
    common_names = set(head.getNames())
    for g in groups[1:]:
        common_names &= set(g.getNames())

    settings_out: list = []
    subgroups_out: list = []
    # Walk head in its declaration order; ignore names not in every group.
    for name in head.getNames():
        if name not in common_names:
            continue
        head_obj = head.get(name)
        # Same name needs to be the same kind (Setting vs Settings) in
        # every widget. If a name collides with different kinds we skip.
        if isinstance(head_obj, _Settings):
            try:
                sub_groups = [g.get(name) for g in groups]
            except KeyError:
                continue
            if not all(isinstance(g, _Settings) for g in sub_groups):
                continue
            subgroups_out.append({
                'name': head_obj.name,
                'usertext': head_obj.usertext,
                'descr': head_obj.descr,
                'setnsmode': head_obj.setnsmode,
                **{
                    k: v for k, v in
                    _intersect_settings_groups(sub_groups).items()
                    if k in ('settings', 'subgroups')
                },
            })
        elif isinstance(head_obj, _Setting):
            try:
                leaf_settings = [g.get(name) for g in groups]
            except KeyError:
                continue
            if not all(isinstance(s, _Setting) for s in leaf_settings):
                continue
            # All same setting *type*? If not, skip — we can't show one
            # control for two different setting kinds.
            head_type = type(head_obj)
            if not all(isinstance(s, head_type) for s in leaf_settings):
                continue
            settings_out.append(_common_setting_dict(leaf_settings))
    return {
        'name': head.name,
        'usertext': head.usertext,
        'descr': head.descr,
        'setnsmode': head.setnsmode,
        'settings': settings_out,
        'subgroups': subgroups_out,
    }


def extract_common_schema(widgets: list) -> dict:
    """Return the intersection schema of the given widgets, with a
    ``mixed_value`` flag per leaf when current values differ.

    Powers the Tauri Inspector's multi-edit mode: with N widgets
    selected, the Inspector shows only settings that exist on every
    selected widget, and edits write to all of them through a single
    batched ``doc.set`` call (collapsed by `OperationMultiple`).
    """
    if not widgets:
        raise ValueError('widgets must be non-empty')
    out = _intersect_settings_groups([w.settings for w in widgets])
    # Surface a top-level summary the frontend can title the panel with.
    types = sorted({w.typename for w in widgets})
    out['typenames'] = types
    out['mode'] = 'common'
    out['count'] = len(widgets)
    return out
