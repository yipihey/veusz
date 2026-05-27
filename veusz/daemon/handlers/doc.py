# Document RPC handlers: tree / schema / add / set / remove / move.
##############################################################################

from __future__ import annotations

from .. import schema as _schema
from ..errors import RpcError, INVALID_PARAMS


def _ci(ctx):
    """Return a CommandInterface bound to the current document.

    We use the existing high-level surface so undo, signals, and the
    GUI console (if ever attached) stay consistent. CommandInterpreter
    isn't needed; the bare interface is enough.
    """
    from ...document.commandinterface import CommandInterface
    # One per-doc; rebuild lazily on first use.
    cache = getattr(ctx, '_ci_cache', None)
    if cache is None or cache.document is not ctx.document:
        cache = CommandInterface(ctx.document)
        ctx._ci_cache = cache
    return cache


def _serialize_tree(widget) -> dict:
    return {
        'name': widget.name,
        'path': widget.path,
        'type': widget.typename,
        'children': [_serialize_tree(c) for c in widget.children],
    }


def register(ctx):
    def tree(**_):
        return _serialize_tree(ctx.document.basewidget)

    def schema(widget_type: str, mode: str = 'class', **_):
        if not isinstance(widget_type, str):
            raise RpcError(INVALID_PARAMS, 'widget_type must be a string')
        try:
            if mode == 'instance':
                return _schema.extract_instance_schema(widget_type)
            return _schema.extract_class_schema(widget_type)
        except KeyError as e:
            raise RpcError(INVALID_PARAMS, f'no such widget type: {widget_type}') from e

    def schema_at(path: str, **_):
        """Schema for whatever lives at ``path`` (widget, settings group, or
        leaf setting). Powers the stylesheet editor."""
        try:
            return _schema.extract_path_schema(ctx.document, path)
        except (KeyError, ValueError) as e:
            raise RpcError(INVALID_PARAMS, str(e)) from e

    def schema_all(mode: str = 'class', **_):
        return _schema.extract_all_schemas(mode)

    def widget_types(**_):
        return _schema.list_widget_types()

    def add(parent: str, type: str, name: str | None = None, **_):
        ci = _ci(ctx)
        path = ci.Add(type, widget=parent, name=name) if name else ci.Add(type, widget=parent)
        full = parent.rstrip('/') + '/' + path if parent != '/' else '/' + path
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [full],
            'kind': 'add',
        })
        return {'path': full}

    def remove(path: str, **_):
        ci = _ci(ctx)
        ci.Remove(path)
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path],
            'kind': 'remove',
        })
        return {'ok': True, 'changeset': ctx.document.changeset}

    def set_(ops: list = None, path: str = None, value=None, **_):
        """Apply one or many setting writes; return per-op diff."""
        ci = _ci(ctx)
        if ops is None:
            if path is None:
                raise RpcError(INVALID_PARAMS, 'doc.set needs ops=[...] or path=/value')
            ops = [{'path': path, 'value': value}]
        diffs = []
        for op in ops:
            p = op['path']
            v = op['value']
            old = ci.Get(p)
            ci.Set(p, v)
            diffs.append({'path': p, 'old': old, 'new': ci.Get(p)})
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [d['path'] for d in diffs],
            'kind': 'set',
        })
        return {'changeset': ctx.document.changeset, 'diffs': diffs}

    def get(paths: list, **_):
        ci = _ci(ctx)
        return {p: ci.Get(p) for p in paths}

    def undo(**_):
        if not ctx.document.canUndo():
            raise RpcError(INVALID_PARAMS, 'nothing to undo')
        ctx.document.undoOperation()
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset, 'paths': [], 'kind': 'undo',
        })
        return {'changeset': ctx.document.changeset,
                'can_undo': ctx.document.canUndo(),
                'can_redo': ctx.document.canRedo()}

    def redo(**_):
        if not ctx.document.canRedo():
            raise RpcError(INVALID_PARAMS, 'nothing to redo')
        ctx.document.redoOperation()
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset, 'paths': [], 'kind': 'redo',
        })
        return {'changeset': ctx.document.changeset,
                'can_undo': ctx.document.canUndo(),
                'can_redo': ctx.document.canRedo()}

    def can_undo(**_):
        return {'can_undo': ctx.document.canUndo(),
                'can_redo': ctx.document.canRedo()}

    return {
        'doc.tree': tree,
        'doc.schema': schema,
        'doc.schema_at': schema_at,
        'doc.schema_all': schema_all,
        'doc.widget_types': widget_types,
        'doc.add': add,
        'doc.remove': remove,
        'doc.set': set_,
        'doc.get': get,
        'doc.undo': undo,
        'doc.redo': redo,
        'doc.can_undo': can_undo,
    }
