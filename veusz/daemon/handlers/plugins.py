# Plugin registry handlers: enumerate + run tools/dataset plugins.
##############################################################################

"""Expose Veusz's tools/dataset plugin registries over RPC.

Mirrors the legacy Tools menu (and Data → Operations): the frontend lists
plugins, builds a parameter form from each plugin's ``fields``, and runs the
chosen plugin with the collected values. Tools plugins mutate the document via
``OperationToolsPlugin``; dataset plugins create datasets via the high-level
``CommandInterface.DatasetPlugin``.
"""

from __future__ import annotations

from ..errors import RpcError, INVALID_PARAMS


def _safe(v):
    """Coerce a plugin field default to a JSON-safe value."""
    if v is None or isinstance(v, (str, int, float, bool)):
        return v
    if isinstance(v, (list, tuple)):
        return [_safe(x) for x in v]
    return str(v)


def _fields_of(inst):
    out = []
    for f in getattr(inst, 'fields', None) or []:
        out.append({
            'name': f.name,
            'descr': getattr(f, 'descr', f.name),
            'default': _safe(getattr(f, 'default', None)),
            'kind': type(f).__name__,            # FieldText, FieldCombo, FieldBool, …
            'items': [str(i) for i in getattr(f, 'items', []) or []],
        })
    return out


def register(ctx):
    def list_(**_):
        """Enumerate registered tools + dataset plugins with their fields."""
        from ... import plugins as P
        tools, datasets = [], []
        for kls in P.toolspluginregistry:
            try:
                inst = kls()
            except Exception:
                continue
            tools.append({
                'name': inst.name, 'menu': list(inst.menu),
                'has_parameters': bool(getattr(inst, 'has_parameters', True)),
                'fields': _fields_of(inst),
            })
        for kls in P.datasetpluginregistry:
            try:
                inst = kls()
            except Exception:
                continue
            datasets.append({
                'name': inst.name, 'menu': list(inst.menu),
                'fields': _fields_of(inst),
            })
        return {'tools': tools, 'datasets': datasets}

    def run(kind: str, name: str, fields: dict = None, **_):
        """Run a tools or dataset plugin. Returns any datasets it created."""
        from ... import plugins as P
        from ...document import operations
        from ...document.commandinterface import CommandInterface
        fields = dict(fields or {})
        before = set(ctx.document.data.keys())

        if kind == 'tools':
            plugin = next((k() for k in P.toolspluginregistry if k.name == name), None)
            if plugin is None:
                raise RpcError(INVALID_PARAMS, f'no tools plugin: {name!r}')
            fields.setdefault('currentwidget', '/')
            try:
                ctx.document.applyOperation(operations.OperationToolsPlugin(plugin, fields))
            except Exception as e:
                raise RpcError(INVALID_PARAMS, f'plugin failed: {e}') from e
            ctx.notifier.publish('doc.changed', {
                'changeset': ctx.document.changeset, 'paths': ['/'], 'kind': 'plugin',
            })
        elif kind == 'dataset':
            if name not in {k.name for k in P.datasetpluginregistry}:
                raise RpcError(INVALID_PARAMS, f'no dataset plugin: {name!r}')
            try:
                CommandInterface(ctx.document).DatasetPlugin(name, fields)
            except Exception as e:
                raise RpcError(INVALID_PARAMS, f'plugin failed: {e}') from e
        else:
            raise RpcError(INVALID_PARAMS, f'unknown plugin kind: {kind!r}')

        created = sorted(set(ctx.document.data.keys()) - before)
        if created:
            ctx.notifier.publish('data.changed', {'names': created, 'kind': 'plugin'})
        return {'ok': True, 'created': created}

    return {
        'plugins.list': list_,
        'plugins.run': run,
    }
