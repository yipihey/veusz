"""Tests for the out-of-process DataService wire codec (veusz.datasets.wire).

The codec marshals a reduction request + its answer across a JSON-only boundary
(a Jupyter comm has no SharedArrayBuffer): small params/metadata as plain JSON,
bulk arrays as base64 little-endian float32. These tests check array round-trips
(incl. NaN/inf and empty), request/response round-trips, that every encoded form
is genuinely json.dumps-able, and dispatch transparency — the wired result must
match a direct DataService call within float32 tolerance.

Pure NumPy/base64/json; no Qt, so no QApplication fixture is needed.
"""

from __future__ import annotations

import json

import numpy as N
import pytest

from veusz.datasets import wire
from veusz.datasets.dataservice import DataService, DataServiceError


# -- array codec -------------------------------------------------------------

def test_encode_array_shape_and_json():
    a = N.arange(6.0).reshape(2, 3)
    enc = wire.encode_array(a)
    assert set(enc) == {'b64', 'shape'}
    assert enc['shape'] == [2, 3]
    assert isinstance(enc['b64'], str)
    json.dumps(enc)  # JSON-safe


def test_array_roundtrip_1d():
    a = N.array([1.5, -2.0, 3.25, 4.0, 5.0])
    out = wire.decode_array(wire.encode_array(a))
    assert out.shape == a.shape
    assert out.dtype == N.float64
    assert N.allclose(out, a)


def test_array_roundtrip_2d_grid():
    g = N.linspace(0, 1, 20).reshape(4, 5)
    out = wire.decode_array(wire.encode_array(g))
    assert out.shape == (4, 5)
    assert N.allclose(out, g)


def test_array_roundtrip_nonfinite():
    a = N.array([N.nan, N.inf, -N.inf, 0.0, 1.0])
    out = wire.decode_array(wire.encode_array(a))
    assert N.isnan(out[0])
    assert out[1] == N.inf
    assert out[2] == -N.inf
    assert N.allclose(out[3:], a[3:])


def test_array_roundtrip_empty():
    out = wire.decode_array(wire.encode_array(N.zeros((0,))))
    assert out.shape == (0,)
    out2 = wire.decode_array(wire.encode_array(N.zeros((0, 0))))
    assert out2.shape == (0, 0)


# -- request codec -----------------------------------------------------------

def test_request_roundtrip():
    enc = wire.encode_request('histogram2d', xref='x', yref='y',
                              binparamsx=(20, -4, 4, False), method='counts')
    json.dumps(enc)  # JSON-safe (tuple rides as list once dumped)
    m, p = wire.decode_request(json.loads(json.dumps(enc)))
    assert m == 'histogram2d'
    assert p['xref'] == 'x' and p['yref'] == 'y'
    assert p['method'] == 'counts'
    # tuple binparams survives as a list, which DataService accepts.
    assert list(p['binparamsx']) == [20, -4, 4, False]


def test_decode_request_empty_params():
    m, p = wire.decode_request({'method': 'describe'})
    assert m == 'describe' and p == {}


# -- response codec ----------------------------------------------------------

def test_response_roundtrip_histogram2d():
    grid = N.array([[1.0, N.nan], [3.0, 4.0]])
    xe = N.array([0.0, 1.0, 2.0])
    ye = N.array([0.0, 1.0, 2.0])
    enc = wire.encode_response('histogram2d', (grid, xe, ye, 7))
    json.dumps(enc)
    g, x, y, ver = wire.decode_response('histogram2d', json.loads(json.dumps(enc)))
    assert ver == 7
    assert N.array_equal(N.nan_to_num(g), N.nan_to_num(grid))
    assert N.isnan(g[0, 1])
    assert N.allclose(x, xe) and N.allclose(y, ye)


def test_response_roundtrip_fetch():
    arr = N.array([1.0, 2.0, 3.0])
    enc = wire.encode_response('fetch', (arr, 3))
    json.dumps(enc)
    a, ver = wire.decode_response('fetch', json.loads(json.dumps(enc)))
    assert ver == 3
    assert N.allclose(a, arr)


def test_response_passthrough_describe_reduce():
    desc = {'ref': 'x', 'size': 5, 'finite': 5, 'min': 0.0, 'max': 4.0,
            'version': 1}
    enc = wire.encode_response('describe', desc)
    json.dumps(enc)
    assert wire.decode_response('describe', json.loads(json.dumps(enc))) == desc

    enc2 = wire.encode_response('reduce', 3.5)
    assert wire.decode_response('reduce', json.loads(json.dumps(enc2))) == 3.5
    enc3 = wire.encode_response('reduce', None)
    assert wire.decode_response('reduce', json.loads(json.dumps(enc3))) is None


# -- dispatch ----------------------------------------------------------------

def _service():
    s = DataService()
    rng = N.random.default_rng(0)
    s.register('x', rng.normal(size=20000))
    s.register('y', rng.normal(size=20000))
    return s


def _wire(s, _method, /, **params):
    """Drive a call all the way through the JSON boundary both directions."""
    req = json.loads(json.dumps(wire.encode_request(_method, **params)))
    resp = json.loads(json.dumps(wire.dispatch(s, req)))  # JSON-safe both ways
    return wire.decode_response(_method, resp)


def test_dispatch_transparent_histogram2d():
    s = _service()
    kw = dict(xref='x', yref='y', binparamsx=(20, -4, 4, False),
              binparamsy=(20, -4, 4, False), method='counts')
    g, xe, ye, ver = _wire(s, 'histogram2d', **kw)
    g0, xe0, ye0, ver0 = s.histogram2d(**kw)
    assert ver == ver0
    assert N.allclose(N.nan_to_num(g), N.nan_to_num(g0))  # f32 tolerance
    assert N.allclose(xe, xe0) and N.allclose(ye, ye0)


def test_dispatch_transparent_fetch():
    s = _service()
    a, ver = _wire(s, 'fetch', ref='x', max_points=500, decimate='stride')
    a0, ver0 = s.fetch(ref='x', max_points=500, decimate='stride')
    assert ver == ver0
    assert a.shape == a0.shape
    assert N.allclose(a, a0)  # f32 tolerance


def test_dispatch_describe_reduce_through_wire():
    s = _service()
    desc = _wire(s, 'describe', ref='x')
    assert desc == s.describe('x')
    val = _wire(s, 'reduce', ref='x', op='mean')
    assert N.isclose(val, s.reduce('x', 'mean'))


def test_dispatch_unknown_method_returns_error():
    s = _service()
    resp = wire.dispatch(s, wire.encode_request('nope', ref='x'))
    assert 'error' in resp
    json.dumps(resp)
    with pytest.raises(DataServiceError):
        wire.decode_response('nope', resp)


def test_dispatch_bad_ref_returns_error():
    s = _service()
    resp = wire.dispatch(s, wire.encode_request('describe', ref='missing'))
    assert 'error' in resp
    with pytest.raises(DataServiceError):
        wire.decode_response('describe', resp)
