# Dataset RPC handlers.
##############################################################################

from __future__ import annotations

import base64
import os

import numpy as np

from ..errors import RpcError, INVALID_PARAMS

# Dataset MIME type — wire-identical to what the legacy Qt GUI puts on
# the system clipboard via `veusz.document.mime.datamime`. The dataset
# clipboard is purely an array of `datasetAsText()` chunks; the paste
# operation reconstructs each dataset.
DATA_MIME = 'text/x-vnd.veusz-data-1'


def register(ctx):
    def list_(**_):
        out = []
        for name, ds in ctx.document.data.items():
            entry = {
                'name': name,
                'type': type(ds).__name__,
                'len': len(ds.data) if hasattr(ds, 'data') and ds.data is not None else 0,
            }
            if hasattr(ds, 'data') and hasattr(ds.data, 'shape'):
                entry['shape'] = list(ds.data.shape)
            # Link provenance powers the dataset menu: "Unlink file"
            # only appears for file-linked datasets, and the panel
            # groups linked datasets under their filename for the
            # Reload / Unlink-all / Delete-all file actions.
            linked = getattr(ds, 'linked', None)
            entry['linked'] = getattr(linked, 'filename', None) if linked else None
            entry['tags'] = sorted(getattr(ds, 'tags', set()) or set())
            out.append(entry)
        return out

    def peek(name: str, start: int = 0, count: int = 100, **_):
        ds = ctx.document.data.get(name)
        if ds is None:
            raise RpcError(INVALID_PARAMS, f'no dataset: {name}')
        data = getattr(ds, 'data', None)
        if data is None:
            return {'values': [], 'errors': None}
        slc = data[start:start + count]
        return {'values': slc.tolist(), 'start': int(start), 'total': int(len(data))}

    def stats(name: str, **_):
        ds = ctx.document.data.get(name)
        if ds is None or not hasattr(ds, 'data') or ds.data is None:
            raise RpcError(INVALID_PARAMS, f'no numeric dataset: {name}')
        d = ds.data
        return {
            'name': name,
            'min': float(np.min(d)),
            'max': float(np.max(d)),
            'mean': float(np.mean(d)),
            'std': float(np.std(d)),
            'len': int(len(d)),
        }

    def set_(name: str, values, dtype: str = 'float64', **_):
        arr = np.asarray(values, dtype=dtype)
        from ...document.commandinterface import CommandInterface
        CommandInterface(ctx.document).SetData(name, arr)
        ctx.notifier.publish('data.changed', {
            'names': [name], 'kind': 'set',
        })
        return {'ok': True, 'len': int(len(arr))}

    def preview_csv(filename: str,
                    delimiter: str = ',',
                    text_delimiter: str = '"',
                    encoding: str = 'utf-8',
                    rows_ignore: int = 0,
                    header_ignore: int = 0,
                    max_rows: int = 20,
                    **_):
        """Preview the first ``max_rows`` lines of a CSV.

        No side effects on the document — used by the import wizard to
        let the user see the effect of delimiter / encoding / header
        choices before committing. Returns the parsed rows plus a
        best-guess at column names (first non-skipped row).
        """
        if not os.path.isfile(filename):
            raise RpcError(INVALID_PARAMS, f'no such file: {filename}')
        import csv as _csv
        try:
            with open(filename, 'r', encoding=encoding, newline='') as f:
                lines = f.read().splitlines()
        except (OSError, UnicodeDecodeError) as e:
            raise RpcError(INVALID_PARAMS, f'read failed: {e}') from e

        # Apply rows-ignore + header-ignore: skip rows_ignore lines, then
        # the next header_ignore lines after the header.
        kept = lines[rows_ignore:] if rows_ignore > 0 else lines
        reader = _csv.reader(
            kept,
            delimiter=delimiter or ',',
            quotechar=text_delimiter or '"',
        )
        rows = []
        for i, row in enumerate(reader):
            if i >= max_rows + header_ignore + 1:
                break
            rows.append(row)
        header = rows[0] if rows else []
        # After the header row, skip `header_ignore` lines before data.
        data_rows = rows[1 + header_ignore:] if rows else []
        return {
            'header': header,
            'rows': data_rows,
            'total_lines_estimated': len(lines),
            'truncated': len(rows) >= max_rows + header_ignore + 1,
        }

    def import_(kind: str, filename: str, options: dict | None = None, **_):
        """Import a data file using one of Veusz's registered importers.

        ``kind`` is the bare format name: ``'csv'``, ``'fits'``, ``'hdf5'``,
        ``'npy'``, ``'npz'``, ``'plaintext'``. Each maps to the
        corresponding ``ImportFile<KIND>`` command on
        :class:`CommandInterface`. ``options`` is forwarded as kwargs;
        see ``veusz/dataimport/defn_*.py`` for the per-importer options.
        """
        from ...document.commandinterface import CommandInterface
        ci = CommandInterface(ctx.document)
        cmd_name = {
            'csv': 'ImportFileCSV',
            'fits': 'ImportFITSFile',
            'hdf5': 'ImportFileHDF5',
            'npy': 'ImportFileNPY',
            'npz': 'ImportFileNPZ',
            'plaintext': 'ImportFile',
        }.get(kind.lower())
        if cmd_name is None or not hasattr(ci, cmd_name):
            raise RpcError(INVALID_PARAMS, f'unknown or unavailable importer: {kind}')
        before = set(ctx.document.data.keys())
        try:
            getattr(ci, cmd_name)(filename, **(options or {}))
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'{kind} import failed: {e}') from e
        after = set(ctx.document.data.keys())
        imported = sorted(after - before)
        ctx.notifier.publish('data.changed', {
            'names': imported, 'kind': 'import',
        })
        return {'imported': imported, 'errors': []}

    # --- Dataset CRUD (delete / rename / duplicate) ---------------------

    def _require(names):
        if not isinstance(names, list) or not names:
            raise RpcError(INVALID_PARAMS, 'names must be a non-empty list')
        for n in names:
            if n not in ctx.document.data:
                raise RpcError(INVALID_PARAMS, f'no such dataset: {n}')
        return names

    def delete(names: list, **_):
        """Delete one or more datasets in a single undo step."""
        from ...document import operations
        names = _require(names)
        if len(names) == 1:
            ctx.document.applyOperation(
                operations.OperationDatasetDelete(names[0]))
        else:
            ctx.document.applyOperation(operations.OperationMultiple(
                [operations.OperationDatasetDelete(n) for n in names],
                descr='delete datasets'))
        ctx.notifier.publish('data.changed', {
            'names': names, 'kind': 'delete',
        })
        return {'deleted': names}

    def rename(old: str, new: str, **_):
        from ...document import operations
        if old not in ctx.document.data:
            raise RpcError(INVALID_PARAMS, f'no such dataset: {old}')
        if not isinstance(new, str) or not new:
            raise RpcError(INVALID_PARAMS, 'new name must be a non-empty string')
        if new in ctx.document.data:
            raise RpcError(INVALID_PARAMS, f'dataset already exists: {new}')
        ctx.document.applyOperation(
            operations.OperationDatasetRename(old, new))
        ctx.notifier.publish('data.changed', {
            'names': [old, new], 'kind': 'rename',
        })
        return {'name': new}

    def duplicate(name: str, new_name: str | None = None, **_):
        from ...document import operations
        if name not in ctx.document.data:
            raise RpcError(INVALID_PARAMS, f'no such dataset: {name}')
        if new_name is None:
            base = f'{name}_copy'
            new_name = base
            i = 2
            while new_name in ctx.document.data:
                new_name = f'{base}{i}'
                i += 1
        elif new_name in ctx.document.data:
            raise RpcError(INVALID_PARAMS,
                           f'dataset already exists: {new_name}')
        ctx.document.applyOperation(
            operations.OperationDatasetDuplicate(name, new_name))
        ctx.notifier.publish('data.changed', {
            'names': [new_name], 'kind': 'duplicate',
        })
        return {'name': new_name}

    # --- Unlink (file or relation) --------------------------------------

    def unlink_file(names: list, **_):
        from ...document import operations
        names = _require(names)
        ops = [operations.OperationDatasetUnlinkFile(n) for n in names]
        if len(ops) == 1:
            ctx.document.applyOperation(ops[0])
        else:
            ctx.document.applyOperation(
                operations.OperationMultiple(ops, descr='unlink files'))
        ctx.notifier.publish('data.changed', {
            'names': names, 'kind': 'unlink_file',
        })
        return {'unlinked': names}

    def unlink_relation(names: list, **_):
        from ...document import operations
        names = _require(names)
        ops = [operations.OperationDatasetUnlinkRelation(n) for n in names]
        if len(ops) == 1:
            ctx.document.applyOperation(ops[0])
        else:
            ctx.document.applyOperation(
                operations.OperationMultiple(ops, descr='unlink relations'))
        ctx.notifier.publish('data.changed', {
            'names': names, 'kind': 'unlink_relation',
        })
        return {'unlinked': names}

    # --- Tags -----------------------------------------------------------

    def tag(names: list, tag: str, **_):
        from ...document import operations
        names = _require(names)
        if not isinstance(tag, str) or not tag:
            raise RpcError(INVALID_PARAMS, 'tag must be a non-empty string')
        ctx.document.applyOperation(
            operations.OperationDataTag(tag, names))
        ctx.notifier.publish('data.changed', {
            'names': names, 'kind': 'tag',
        })
        return {'tagged': names, 'tag': tag}

    def untag(names: list, tag: str, **_):
        from ...document import operations
        names = _require(names)
        if not isinstance(tag, str) or not tag:
            raise RpcError(INVALID_PARAMS, 'tag must be a non-empty string')
        ctx.document.applyOperation(
            operations.OperationDataUntag(tag, names))
        ctx.notifier.publish('data.changed', {
            'names': names, 'kind': 'untag',
        })
        return {'untagged': names, 'tag': tag}

    def tags_list(**_):
        """Return ``{tag: [dataset_names]}`` for every tag in use."""
        out: dict = {}
        for name, ds in ctx.document.data.items():
            for t in getattr(ds, 'tags', ()):
                out.setdefault(t, []).append(name)
        for t in out:
            out[t].sort()
        return out

    # --- File-scoped operations ----------------------------------------

    def reload_file(filename: str | None = None, **_):
        """Reload linked datasets. ``filename`` is currently advisory
        (Veusz reloads all linked datasets in one call) — kept on the
        wire so the menu's "Reload" on a filename header can pass the
        path, and a future per-file reload can be added without an RPC
        signature change."""
        from ...document.commandinterface import CommandInterface
        ci = CommandInterface(ctx.document)
        datasets, errors = ci.ReloadData()
        ctx.notifier.publish('data.changed', {
            'names': list(datasets) if datasets else [],
            'kind': 'reload',
        })
        return {
            'reloaded': sorted(datasets) if datasets else [],
            'errors': {n: int(e) for n, e in (errors or {}).items()},
        }

    def unlink_all_file(filename: str, **_):
        from ...document import operations
        if not isinstance(filename, str) or not filename:
            raise RpcError(INVALID_PARAMS, 'filename must be a non-empty string')
        affected = [
            n for n, ds in ctx.document.data.items()
            if ds.linked is not None and ds.linked.filename == filename
        ]
        ctx.document.applyOperation(
            operations.OperationDatasetUnlinkByFile(filename))
        ctx.notifier.publish('data.changed', {
            'names': affected, 'kind': 'unlink_file',
        })
        return {'unlinked': sorted(affected)}

    def delete_all_file(filename: str, **_):
        from ...document import operations
        if not isinstance(filename, str) or not filename:
            raise RpcError(INVALID_PARAMS, 'filename must be a non-empty string')
        affected = [
            n for n, ds in ctx.document.data.items()
            if ds.linked is not None and ds.linked.filename == filename
        ]
        ctx.document.applyOperation(
            operations.OperationDatasetDeleteByFile(filename))
        ctx.notifier.publish('data.changed', {
            'names': affected, 'kind': 'delete',
        })
        return {'deleted': sorted(affected)}

    # --- Use-as (binding sites for a dataset) ---------------------------

    _DATASET_SETTING_TYPENAMES = (
        'dataset', 'dataset-multi', 'dataset-extended', 'dataset-or-str',
    )

    def use_as_targets(name: str, **_):
        """Walk the widget tree and return setting paths whose typename
        accepts a dataset, e.g. ``/page1/graph1/xy1/xData``. The
        frontend builds a "Use as" submenu from these.
        """
        if name not in ctx.document.data:
            raise RpcError(INVALID_PARAMS, f'no such dataset: {name}')
        targets: list = []
        from ...setting.setting import Setting

        def walk_settings(group, widget):
            for item in group.getList():
                if isinstance(item, Setting):
                    if item.typename in _DATASET_SETTING_TYPENAMES:
                        targets.append({
                            'path': item.path,
                            'typename': item.typename,
                            'widget': widget.path,
                        })
                else:
                    walk_settings(item, widget)

        def walk_widgets(widget):
            walk_settings(widget.settings, widget)
            for child in widget.children:
                walk_widgets(child)

        walk_widgets(ctx.document.basewidget)
        return {'targets': targets}

    # --- Clipboard (dataset MIME marshal/unmarshal) ---------------------

    def serialize(names: list, **_):
        """Return Veusz dataset-MIME bytes for the listed datasets.

        Bytes are wire-identical to ``generateDatasetsMime`` so the
        legacy Qt GUI can paste them and vice versa.
        """
        from ...document import mime as _mime
        names = _require(names)
        mimedata = _mime.generateDatasetsMime(names, ctx.document)
        raw = bytes(mimedata.data(_mime.datamime).data())
        return {
            'mime_type': DATA_MIME,
            'payload_b64': base64.b64encode(raw).decode('ascii'),
            'count': len(names),
        }

    def _decode_data_mime(mime_type: str, payload_b64: str) -> bytes:
        if mime_type != DATA_MIME:
            raise RpcError(INVALID_PARAMS,
                           f'unsupported mime_type {mime_type!r}; '
                           f'expected {DATA_MIME!r}')
        try:
            return base64.b64decode(payload_b64, validate=True)
        except (TypeError, ValueError) as e:
            raise RpcError(INVALID_PARAMS, f'payload_b64 not valid base64: {e}') from e

    def paste_mime(mime_type: str, payload_b64: str, **_):
        """Paste datasets from MIME bytes. Datasets are added to the
        document; names collide via the same auto-rename strategy as
        ``OperationDataPaste``.
        """
        from ...document import mime as _mime
        from ... import qtall as qt
        raw = _decode_data_mime(mime_type, payload_b64)
        # OperationDataPaste expects a QMimeData; build one with the right
        # MIME slot so the operation reads it back out.
        md = qt.QMimeData()
        md.setData(_mime.datamime, qt.QByteArray(raw))
        before = set(ctx.document.data.keys())
        ctx.document.applyOperation(_mime.OperationDataPaste(md))
        after = set(ctx.document.data.keys())
        new_names = sorted(after - before)
        ctx.notifier.publish('data.changed', {
            'names': new_names, 'kind': 'paste',
        })
        return {'pasted': new_names}

    def _created(before):
        after = set(ctx.document.data.keys())
        names = sorted(after - before)
        ctx.notifier.publish('data.changed', {'names': names, 'kind': 'create'})
        return names

    def create(name: str, mode: str = 'expression', expr: str = '',
               nsteps: int = 100, min: float = 0.0, max: float = 1.0,
               symerr: str = None, linked: bool = True, **_):
        """Create a 1-D dataset. mode ∈ {expression, range, parametric}."""
        from ...document.commandinterface import CommandInterface
        ci = CommandInterface(ctx.document)
        before = set(ctx.document.data.keys())
        se = symerr or None
        try:
            if mode == 'range':
                ci.SetDataRange(name, int(nsteps), (float(min), float(max)),
                                symerr=(float(symerr) if symerr else None),
                                linked=linked)
            elif mode == 'parametric':
                ci.SetDataExpression(name, expr, symerr=se, linked=linked,
                                     parametric=(float(min), float(max), int(nsteps)))
            else:  # expression
                ci.SetDataExpression(name, expr, symerr=se, linked=linked)
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'create failed: {e}') from e
        return {'created': _created(before)}

    def create_2d(name: str, mode: str = 'expr', expr: str = '',
                  xexpr: str = '', yexpr: str = '', zexpr: str = '',
                  xstep: list = None, ystep: list = None, linked: bool = True, **_):
        """Create a 2-D dataset. mode ∈ {expr, xyz, xyfunc}."""
        from ...document.commandinterface import CommandInterface
        ci = CommandInterface(ctx.document)
        before = set(ctx.document.data.keys())
        try:
            if mode == 'xyz':
                ci.SetData2DExpressionXYZ(name, xexpr, yexpr, zexpr, linked=linked)
            elif mode == 'xyfunc':
                ci.SetData2DXYFunc(name, tuple(xstep), tuple(ystep), expr, linked=linked)
            else:  # expr
                ci.SetData2DExpression(name, expr, linked=linked)
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'create_2d failed: {e}') from e
        return {'created': _created(before)}

    def filter_(filter: str, datasets: list, prefix: str = '', suffix: str = '',
                invert: bool = False, replaceblanks: bool = False, **_):
        """Filter datasets by a boolean expression (needs prefix or suffix)."""
        if not prefix and not suffix:
            raise RpcError(INVALID_PARAMS, 'filter needs a prefix or suffix')
        from ...document.commandinterface import CommandInterface
        ci = CommandInterface(ctx.document)
        before = set(ctx.document.data.keys())
        try:
            ci.FilterDatasets(filter, list(datasets), prefix=prefix, suffix=suffix,
                              invert=invert, replaceblanks=replaceblanks)
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'filter failed: {e}') from e
        return {'created': _created(before)}

    def histogram(expr: str, outbins: str, outvals: str,
                  bins: int = 10, min=None, max=None, islog: bool = False,
                  manual: list = None, method: str = 'counts',
                  cumulative: str = 'none', errors: bool = False, **_):
        """Create a histogram (bin-positions + values datasets)."""
        from ...document.commandinterface import CommandInterface
        ci = CommandInterface(ctx.document)
        before = set(ctx.document.data.keys())
        binparams = None if manual else (
            int(bins), 'Auto' if min is None else float(min),
            'Auto' if max is None else float(max), bool(islog))
        try:
            ci.CreateHistogram(expr, outbins, outvals, binparams=binparams,
                               binmanual=manual, method=method,
                               cumulative=cumulative, errors=errors)
        except Exception as e:
            raise RpcError(INVALID_PARAMS, f'histogram failed: {e}') from e
        return {'created': _created(before)}

    return {
        'data.list': list_,
        'data.peek': peek,
        'data.stats': stats,
        'data.set': set_,
        'data.create': create,
        'data.create_2d': create_2d,
        'data.filter': filter_,
        'data.histogram': histogram,
        'data.import': import_,
        'data.preview_csv': preview_csv,
        'data.delete': delete,
        'data.rename': rename,
        'data.duplicate': duplicate,
        'data.unlink_file': unlink_file,
        'data.unlink_relation': unlink_relation,
        'data.tag': tag,
        'data.untag': untag,
        'data.tags_list': tags_list,
        'data.reload_file': reload_file,
        'data.unlink_all_file': unlink_all_file,
        'data.delete_all_file': delete_all_file,
        'data.use_as_targets': use_as_targets,
        'data.serialize': serialize,
        'data.paste_mime': paste_mime,
    }
