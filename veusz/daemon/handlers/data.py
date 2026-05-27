# Dataset RPC handlers.
##############################################################################

from __future__ import annotations

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
        return {'ok': True, 'len': int(len(arr))}

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
        return {
            'imported': sorted(after - before),
            'errors': [],
        }

    return {
        'data.list': list_,
        'data.peek': peek,
        'data.stats': stats,
        'data.set': set_,
        'data.import': import_,
    }
