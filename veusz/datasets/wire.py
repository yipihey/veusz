#    Copyright (C) 2026 Veusz contributors
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
#
#    You should have received a copy of the GNU General Public License
#    along with Veusz. If not, see <https://www.gnu.org/licenses/>.
#
##############################################################################

"""Wire codec for out-of-process :class:`DataService` calls.

In-process a plotting client calls :class:`~veusz.datasets.dataservice.DataService`
methods directly. When the data lives in another runtime — a notebook kernel's
Pyodide, a worker, a server — the same *question* must cross a JSON-only
boundary (a Jupyter comm has no SharedArrayBuffer). This module is the codec
both ends share: it marshals a method name plus small params one way and the
reduced answer back.

Small things (refs, bin params, metadata dicts, single statistics) travel as
plain JSON. Bulk arrays and grids do NOT — a JSON number array would balloon
the few-hundred-KB answer and lose NaN/inf to ``null``. Instead an array is
packed as **base64 of little-endian float32**, matching the renderer's existing
``coord_blob`` convention (see ``veusz-tauri/.../scene.rs``): f32 is ample for
display, halves the bytes, and survives NaN/inf bit-exactly. The in-memory type
stays float64 on both ends, so the service and its clients are unchanged.

Pure NumPy/base64/json — no Qt — so it is fully testable headless. This is an
internal transport detail; import it directly rather than through the package.
"""

import base64

import numpy as N

from .dataservice import DataServiceError

# -- array codec -------------------------------------------------------------

def encode_array(arr):
    """Pack ``arr`` as base64 of little-endian float32 plus its shape.

    Returns ``{'b64': str, 'shape': [...]}``, both JSON-safe. NaN/inf survive
    the float32 round-trip bit-for-bit. The shape is kept so multi-dim grids
    rebuild exactly; ``tobytes`` is C-contiguous, matching ``decode_array``.
    """
    a = N.ascontiguousarray(arr, dtype='<f4')
    return {
        'b64': base64.standard_b64encode(a.tobytes()).decode('ascii'),
        'shape': list(a.shape),
    }


def decode_array(obj):
    """Inverse of :func:`encode_array`: base64 -> float32 buffer -> reshape ->
    float64 ndarray (plotting works in float64; this keeps clients dtype-stable).
    """
    buf = base64.standard_b64decode(obj['b64'])
    a = N.frombuffer(buf, dtype='<f4').reshape(obj['shape'])
    return N.asarray(a, dtype=N.float64)


# -- request codec -----------------------------------------------------------

def encode_request(_method, /, **params):
    """A JSON-safe call envelope: ``{'method': str, 'params': {...}}``.

    ``_method`` is positional-only so a service param literally named ``method``
    (histogram2d's binning method) can still ride in ``**params`` without
    colliding. Params are small and already JSON-safe — refs, numbers, None,
    and bin params. binparams arrive as tuples; JSON has no tuple, so they ride
    as lists, which :class:`DataService` accepts unchanged.
    """
    return {'method': _method, 'params': params}


def decode_request(obj):
    """Inverse of :func:`encode_request`: ``(method, params_dict)``. The dict is
    ready to splat straight into the matching service method as ``**params``."""
    return obj['method'], dict(obj.get('params') or {})


# -- response codec ----------------------------------------------------------

def encode_response(method, result):
    """Encode a service result for ``method`` into a JSON-safe dict.

    Only ``histogram2d`` and ``fetch`` carry bulk arrays and get binary-packed;
    ``describe``/``reduce`` are already JSON-safe and pass through wrapped so the
    far end always decodes uniformly.
    """
    if method == 'histogram2d':
        grid, xedges, yedges, version = result
        return {
            'grid': encode_array(grid),
            'xedges': encode_array(xedges),
            'yedges': encode_array(yedges),
            'version': int(version),
        }
    if method == 'fetch':
        array, version = result
        return {'array': encode_array(array), 'version': int(version)}
    # describe -> dict, reduce -> number|None: already JSON-safe.
    return {'result': result}


def decode_response(method, obj):
    """Inverse of :func:`encode_response`, reconstructing the native return.

    Raises :class:`DataServiceError` if ``obj`` carries an ``'error'`` from a
    failed :func:`dispatch` on the far end.
    """
    if 'error' in obj:
        raise DataServiceError(obj['error'])
    if method == 'histogram2d':
        return (decode_array(obj['grid']),
                decode_array(obj['xedges']),
                decode_array(obj['yedges']),
                int(obj['version']))
    if method == 'fetch':
        return decode_array(obj['array']), int(obj['version'])
    return obj['result']


# -- kernel-side dispatch ----------------------------------------------------

def dispatch(service, request):
    """Run a decoded request against ``service`` and encode its answer.

    The handler that lives *where the data lives*: decode the envelope, call the
    named method, encode the result. Any failure (unknown method, bad ref) comes
    back as ``{'error': str}`` rather than propagating, so the transport stays a
    plain request/response of JSON; :func:`decode_response` re-raises it.
    """
    try:
        method, params = decode_request(request)
        handler = getattr(service, method, None)
        if not callable(handler):
            raise DataServiceError("unknown method: %r" % (method,))
        return encode_response(method, handler(**params))
    except Exception as e:
        return {'error': str(e)}
