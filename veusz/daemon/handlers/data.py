# Dataset RPC handlers.
##############################################################################

from __future__ import annotations

import os

import numpy as np

from ..errors import RpcError, INVALID_PARAMS


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

    return {
        'data.list': list_,
        'data.peek': peek,
        'data.stats': stats,
        'data.set': set_,
        'data.import': import_,
        'data.preview_csv': preview_csv,
    }
