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

    return {
        'data.list': list_,
        'data.peek': peek,
        'data.stats': stats,
        'data.set': set_,
    }
