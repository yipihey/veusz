# Document RPC handlers: tree / schema / add / set / remove / move.
##############################################################################

from __future__ import annotations

import base64

from .. import schema as _schema
from ..errors import RpcError, INVALID_PARAMS

# MIME types used by Veusz's widget/dataset clipboard. Mirrors
# `veusz.document.mime.widgetmime` so the bytes we emit/accept are
# wire-identical to what the legacy Qt GUI puts on the system clipboard.
WIDGET_MIME = 'text/x-vnd.veusz-widget-3'


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

    def insert_targets(path: str = '/', **_):
        """For the (selected) widget at ``path``, return ``{typename:
        parent_path}`` giving, for every widget type, the nearest ancestor
        (self first, then walking up to the root) that will accept it as a
        child. Mirrors the Qt GUI's enablement: add under the selection when
        it fits, else as a sibling. Types with no valid target are omitted —
        the frontend greys out their Insert action."""
        from ...document.widgetfactory import thefactory
        try:
            sel = (_resolve_widget(path)
                   if path and path != '/' else ctx.document.basewidget)
        except RpcError:
            sel = ctx.document.basewidget
        chain = []
        w = sel
        while w is not None:
            chain.append(w)
            w = w.parent
        out = {}
        for tname, cls in thefactory.regwidgets.items():
            for anc in chain:
                try:
                    if cls.willAllowParent(anc):
                        out[tname] = anc.path
                        break
                except Exception:
                    continue
        return {'targets': out}

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
        """Apply one or many setting writes; return per-op diff.

        Multiple ops in a single call are collapsed into one
        ``OperationMultiple`` so a single ``doc.undo`` reverts the whole
        batch. The Inspector relies on this for multi-edit semantics:
        with N widgets selected, the frontend builds N ops and the
        user gets one undo step.
        """
        from ...document import operations
        ci = _ci(ctx)
        if ops is None:
            if path is None:
                raise RpcError(INVALID_PARAMS, 'doc.set needs ops=[...] or path=/value')
            ops = [{'path': path, 'value': value}]
        if not ops:
            raise RpcError(INVALID_PARAMS, 'doc.set ops list is empty')

        # Resolve every setting and capture the before-values up front,
        # so we don't half-apply if one of them fails.
        resolved = []
        for op in ops:
            p = op['path']
            v = op['value']
            try:
                setn = ctx.document.resolveSettingPath(None, p)
            except ValueError as e:
                raise RpcError(INVALID_PARAMS, str(e)) from e
            if setn.iswidget:
                raise RpcError(INVALID_PARAMS,
                               f'{p!r} is a widget, not a setting')
            resolved.append((p, v, setn, setn.val))

        if len(resolved) == 1:
            p, v, setn, old = resolved[0]
            ctx.document.applyOperation(operations.OperationSettingSet(setn, v))
            diffs = [{'path': p, 'old': old, 'new': setn.val}]
        else:
            inner = [operations.OperationSettingSet(setn, v)
                     for _p, v, setn, _old in resolved]
            ctx.document.applyOperation(
                operations.OperationMultiple(inner, descr='set settings'))
            diffs = [{'path': p, 'old': old, 'new': setn.val}
                     for p, _v, setn, old in resolved]

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

    # --- Widget rename / move / duplicate -------------------------------

    def _resolve_widget(path: str):
        if not isinstance(path, str) or not path:
            raise RpcError(INVALID_PARAMS, 'path must be a non-empty string')
        try:
            return ctx.document.resolveWidgetPath(None, path)
        except ValueError as e:
            raise RpcError(INVALID_PARAMS, str(e)) from e

    def rename(path: str, name: str, **_):
        from ...document import operations
        if not isinstance(name, str) or not name:
            raise RpcError(INVALID_PARAMS, 'name must be a non-empty string')
        widget = _resolve_widget(path)
        op = operations.OperationWidgetRename(widget, name)
        ctx.document.applyOperation(op)
        # widget.path is now the new path
        new_path = widget.path
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path, new_path],
            'kind': 'rename',
        })
        return {'path': new_path, 'changeset': ctx.document.changeset}

    def move(path: str, direction: str, **_):
        from ...document import operations
        if direction not in ('up', 'down'):
            raise RpcError(INVALID_PARAMS, 'direction must be "up" or "down"')
        widget = _resolve_widget(path)
        d = -1 if direction == 'up' else 1
        op = operations.OperationWidgetMoveUpDown(widget, d)
        ctx.document.applyOperation(op)
        new_path = widget.path
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path, new_path],
            'kind': 'move',
        })
        return {'path': new_path, 'moved': bool(op.suceeded),
                'changeset': ctx.document.changeset}

    def duplicate(path: str, **_):
        """Clone a widget in place under the same parent, auto-naming."""
        from ...document import mime as _mime
        widget = _resolve_widget(path)
        parent = widget.parent
        if parent is None:
            raise RpcError(INVALID_PARAMS, 'cannot duplicate the root widget')
        # Pick a unique name like "graph1_copy" / "graph1_copy2".
        base = f'{widget.name}_copy'
        existing = set(parent.childnames)
        new_name = base
        i = 2
        while new_name in existing:
            new_name = f'{base}{i}'
            i += 1
        op = _mime.OperationWidgetClone(widget, parent, new_name)
        new_widget = ctx.document.applyOperation(op)
        new_path = new_widget.path
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [new_path],
            'kind': 'add',
        })
        return {'path': new_path, 'changeset': ctx.document.changeset}

    # --- Clipboard marshal/unmarshal (no clipboard state stored here) ----

    def serialize_widgets(paths: list, **_):
        """Return Veusz widget-MIME bytes for the listed widgets.

        Bytes are wire-identical to what the legacy Qt GUI writes to the
        OS clipboard, so cross-app paste round-trips.
        """
        from ...document import mime as _mime
        if not isinstance(paths, list) or not paths:
            raise RpcError(INVALID_PARAMS, 'paths must be a non-empty list')
        widgets = [_resolve_widget(p) for p in paths]
        mimedata = _mime.generateWidgetsMime(widgets)
        text_bytes = bytes(mimedata.data(_mime.widgetmime).data())
        return {
            'mime_type': WIDGET_MIME,
            'payload_b64': base64.b64encode(text_bytes).decode('ascii'),
            'count': len(widgets),
        }

    def _decode_widget_mime(mime_type: str, payload_b64: str) -> str:
        if mime_type != WIDGET_MIME:
            raise RpcError(INVALID_PARAMS,
                           f'unsupported mime_type {mime_type!r}; '
                           f'expected {WIDGET_MIME!r}')
        try:
            raw = base64.b64decode(payload_b64, validate=True)
        except (TypeError, ValueError) as e:
            raise RpcError(INVALID_PARAMS, f'payload_b64 not valid base64: {e}') from e
        try:
            return raw.decode('utf-8')
        except UnicodeDecodeError as e:
            raise RpcError(INVALID_PARAMS, 'payload is not utf-8') from e

    def paste_widgets_mime(parent: str, mime_type: str, payload_b64: str, **_):
        from ...document import mime as _mime
        decoded = _decode_widget_mime(mime_type, payload_b64)
        parent_widget = _resolve_widget(parent)
        if not _mime.isWidgetMimePastable(parent_widget, decoded):
            raise RpcError(INVALID_PARAMS,
                           f'mime payload not pastable under {parent!r}')
        op = _mime.OperationWidgetPaste(parent_widget, decoded)
        new_widgets = ctx.document.applyOperation(op)
        new_paths = [w.path for w in new_widgets]
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': new_paths,
            'kind': 'add',
        })
        return {'paths': new_paths, 'changeset': ctx.document.changeset}

    def can_paste_mime(parent: str, mime_type: str, payload_b64: str, **_):
        from ...document import mime as _mime
        try:
            decoded = _decode_widget_mime(mime_type, payload_b64)
            parent_widget = _resolve_widget(parent)
        except RpcError:
            return {'ok': False}
        return {'ok': bool(_mime.isWidgetMimePastable(parent_widget, decoded))}

    # --- Setting propagate / reset-default / set-as-style / unlink ------

    def _resolve_setting(path: str):
        try:
            obj = ctx.document.resolveSettingPath(None, path)
        except ValueError as e:
            raise RpcError(INVALID_PARAMS, str(e)) from e
        if obj.iswidget:
            raise RpcError(INVALID_PARAMS,
                           f'{path!r} is a widget, not a setting')
        return obj

    def propagate_setting(path: str, scope: str = 'all_of_type',
                          widget_paths: list = None, **_):
        """Propagate a setting value to other widgets.

        ``scope`` ∈ {"all_of_type", "siblings", "type_and_name",
                     "widgets"}. For "widgets", `widget_paths` is the
        list of target widget paths.
        """
        from ...document import operations
        setn = _resolve_setting(path)
        # Walk up to the owning widget.
        s = setn
        while not s.iswidget:
            s = s.parent
        owner_widget = s

        if scope == 'all_of_type':
            op = operations.OperationSettingPropagate(setn)
        elif scope == 'siblings':
            parent = owner_widget.parent
            if parent is None:
                raise RpcError(INVALID_PARAMS,
                               'cannot propagate to siblings of root')
            op = operations.OperationSettingPropagate(
                setn, root=parent, maxlevels=1)
        elif scope == 'type_and_name':
            op = operations.OperationSettingPropagate(
                setn, widgetname=owner_widget.name)
        elif scope == 'widgets':
            if not isinstance(widget_paths, list) or not widget_paths:
                raise RpcError(INVALID_PARAMS,
                               'scope=widgets requires widget_paths=[...]')
            # Build an OperationMultiple of one SettingSet per target,
            # using each target's same-named setting subtree.
            # Compute the setting path relative to its widget. Mirrors
            # `OperationSettingPropagate.__init__`: walk up to the
            # widget, then drop the first element (the widget's
            # settings-group name).
            rel = []
            s = setn
            while not s.iswidget:
                rel.insert(0, s.name)
                s = s.parent
            rel = rel[1:]
            value = setn.val
            ops = []
            for wpath in widget_paths:
                w = _resolve_widget(wpath)
                target = w.settings
                try:
                    for n in rel:
                        target = target.get(n)
                except Exception as e:
                    raise RpcError(INVALID_PARAMS,
                                   f'target {wpath!r} has no setting {rel!r}: {e}') from e
                ops.append(operations.OperationSettingSet(target, value))
            op = operations.OperationMultiple(ops, descr='propagate setting')
        else:
            raise RpcError(INVALID_PARAMS,
                           f'unknown scope {scope!r}')
        ctx.document.applyOperation(op)
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path],
            'kind': 'propagate',
        })
        return {'changeset': ctx.document.changeset}

    def reset_setting_default(path: str, **_):
        from ...document import operations
        setn = _resolve_setting(path)
        op = operations.OperationSettingSet(setn, setn.default)
        ctx.document.applyOperation(op)
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path],
            'kind': 'set',
        })
        return {'value': setn.val, 'changeset': ctx.document.changeset}

    def set_setting_default(path: str, **_):
        """Use the current setting value as the default in the stylesheet."""
        from ...document import operations
        setn = _resolve_setting(path)
        # Stylesheet link is a setting path under /StyleSheet/<typename>/...
        try:
            sslink = setn.getStylesheetLink()
        except Exception as e:
            raise RpcError(INVALID_PARAMS,
                           f'setting has no stylesheet link: {e}') from e
        try:
            ss_setn = ctx.document.resolveSettingPath(None, sslink)
        except ValueError as e:
            raise RpcError(INVALID_PARAMS, str(e)) from e
        ops = [
            operations.OperationSettingSet(ss_setn, setn.get()),
            operations.OperationSettingSet(setn, setn.default),
        ]
        op = operations.OperationMultiple(ops, descr='set default style')
        ctx.document.applyOperation(op)
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path, sslink],
            'kind': 'set',
        })
        return {'changeset': ctx.document.changeset, 'stylesheet_path': sslink}

    def unlink_setting(path: str, **_):
        """Break a reference link by writing the resolved value back."""
        from ...document import operations
        setn = _resolve_setting(path)
        if not setn.isReference():
            raise RpcError(INVALID_PARAMS, 'setting is not a reference')
        op = operations.OperationSettingSet(setn, setn.get())
        ctx.document.applyOperation(op)
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset,
            'paths': [path],
            'kind': 'set',
        })
        return {'value': setn.val, 'changeset': ctx.document.changeset}

    # --- Common-schema (multi-edit Inspector) ---------------------------

    def common_schema(paths: list, **_):
        """Return the intersection of setting schemas across widgets at
        ``paths``, with a ``mixed_value`` flag per leaf when current
        values differ across the selection. Mirrors
        ``SettingsProxyMulti._objList`` in the legacy GUI.
        """
        if not isinstance(paths, list) or not paths:
            raise RpcError(INVALID_PARAMS,
                           'paths must be a non-empty list')
        widgets = [_resolve_widget(p) for p in paths]
        return _schema.extract_common_schema(widgets)

    def new(mode: str = 'graph', **_):
        """Reset to a fresh document. mode ∈ {graph, polar, ternary, graph3d}."""
        ctx.document.wipe()
        if mode in ('graph', 'polar', 'ternary', 'graph3d'):
            ctx.document.makeDefaultDoc(mode)
        # Drop the cached CommandInterface; its currentwidget is now stale.
        if getattr(ctx, '_ci_cache', None) is not None:
            ctx._ci_cache = None
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset, 'paths': ['/'], 'kind': 'new',
        })
        ctx.notifier.publish('data.changed', {'names': [], 'kind': 'wipe'})
        return {'ok': True, 'changeset': ctx.document.changeset}

    def get_customs(**_):
        """Return the document's custom definitions grouped by type."""
        ev = ctx.document.evaluate

        def jsonable(v):
            try:
                return [list(t) for t in v]
            except TypeError:
                return v
        return {
            'definition': [[str(n), val] for n, val in ev.def_definitions],
            'import': [[str(n), val] for n, val in ev.def_imports],
            'color': [[str(n), val] for n, val in ev.def_colors],
            'colormap': [[str(n), jsonable(val)] for n, val in ev.def_colormaps],
        }

    def set_customs(ctype: str, entries: list, **_):
        """Replace the custom definitions of one type with `entries`
        (a list of [name, value] pairs)."""
        from ...document import operations
        if ctype not in operations.OperationSetCustom.type_to_attr:
            raise RpcError(INVALID_PARAMS, f'unknown custom type: {ctype!r}')
        vals = [[str(e[0]), e[1]] for e in (entries or [])]
        ctx.document.applyOperation(operations.OperationSetCustom(ctype, vals))
        ctx.notifier.publish('doc.changed', {
            'changeset': ctx.document.changeset, 'paths': ['/'], 'kind': 'customs',
        })
        return {'ok': True, 'changeset': ctx.document.changeset}

    return {
        'doc.tree': tree,
        'doc.new': new,
        'doc.get_customs': get_customs,
        'doc.set_customs': set_customs,
        'doc.schema': schema,
        'doc.schema_at': schema_at,
        'doc.schema_all': schema_all,
        'doc.widget_types': widget_types,
        'doc.add': add,
        'doc.insert_targets': insert_targets,
        'doc.remove': remove,
        'doc.set': set_,
        'doc.get': get,
        'doc.undo': undo,
        'doc.redo': redo,
        'doc.can_undo': can_undo,
        'doc.rename': rename,
        'doc.move': move,
        'doc.duplicate': duplicate,
        'doc.serialize_widgets': serialize_widgets,
        'doc.paste_widgets_mime': paste_widgets_mime,
        'doc.can_paste_mime': can_paste_mime,
        'doc.propagate_setting': propagate_setting,
        'doc.reset_setting_default': reset_setting_default,
        'doc.set_setting_default': set_setting_default,
        'doc.unlink_setting': unlink_setting,
        'doc.common_schema': common_schema,
    }
