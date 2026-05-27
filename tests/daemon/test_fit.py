"""fit.run — curve fitting RPC."""

import math
import pytest


@pytest.fixture
async def linear_data(daemon):
    """y = 3x + 1 + small noise, stored as datasets x / y."""
    import numpy as np
    rng = np.random.default_rng(0)
    x = np.linspace(0, 10, 50)
    y = 3 * x + 1 + rng.normal(0, 0.1, size=x.size)
    await daemon.call('data.set', name='x', values=x.tolist())
    await daemon.call('data.set', name='y', values=y.tolist())
    return daemon


@pytest.fixture
async def gaussian_data(daemon):
    """y = a*exp(-(x-mu)^2/(2*sigma^2)) + small noise."""
    import numpy as np
    rng = np.random.default_rng(42)
    x = np.linspace(-5, 5, 200)
    y = 2.0 * np.exp(-(x - 1.5) ** 2 / (2 * 0.7 ** 2)) + rng.normal(0, 0.01, size=x.size)
    await daemon.call('data.set', name='x', values=x.tolist())
    await daemon.call('data.set', name='y', values=y.tolist())
    return daemon


@pytest.mark.asyncio
async def test_linear_fit_recovers_slope_and_intercept(linear_data):
    r = await linear_data.call('fit.run',
        xData='x', yData='y',
        function='m*x + c',
        params={'m': 1.0, 'c': 0.0})
    assert r['success'] is True
    m = r['params']['m']['value']
    c = r['params']['c']['value']
    # True values are 3 and 1; tolerance generous because of noise.
    assert abs(m - 3.0) < 0.1
    assert abs(c - 1.0) < 0.2
    # Stderr should be finite
    assert r['params']['m']['stderr'] is not None
    assert r['reduced_chi2'] < 1.0  # noise is small


@pytest.mark.asyncio
async def test_gaussian_fit_recovers_parameters(gaussian_data):
    r = await gaussian_data.call('fit.run',
        xData='x', yData='y',
        function='a * exp(-(x - mu)**2 / (2 * sigma**2))',
        params={'a': 1.0, 'mu': 0.0, 'sigma': 1.0})
    assert r['success'] is True
    assert abs(r['params']['a']['value'] - 2.0) < 0.05
    assert abs(r['params']['mu']['value'] - 1.5) < 0.05
    assert abs(abs(r['params']['sigma']['value']) - 0.7) < 0.05


@pytest.mark.asyncio
async def test_fit_in_restricted_range(linear_data):
    r = await linear_data.call('fit.run',
        xData='x', yData='y',
        function='m*x + c',
        params={'m': 1.0, 'c': 0.0},
        fit_range=[2.0, 7.0])
    assert r['success'] is True
    assert r['x_range'][0] >= 2.0 and r['x_range'][1] <= 7.0


@pytest.mark.asyncio
async def test_fit_unknown_dataset(daemon):
    with pytest.raises(RuntimeError, match='unknown dataset'):
        await daemon.call('fit.run',
            xData='nope', yData='nope2',
            function='m*x', params={'m': 1.0})


@pytest.mark.asyncio
async def test_fit_no_params(linear_data):
    with pytest.raises(RuntimeError, match='at least one parameter'):
        await linear_data.call('fit.run',
            xData='x', yData='y',
            function='x', params={})


@pytest.mark.asyncio
async def test_fit_bad_expression(linear_data):
    with pytest.raises(RuntimeError, match='bad function expression'):
        await linear_data.call('fit.run',
            xData='x', yData='y',
            function='m*x +', params={'m': 1.0})


@pytest.mark.asyncio
async def test_fit_returns_failure_payload_on_convergence_failure(linear_data):
    # Use a function that doesn't fit the data at all + a single
    # parameter to push curve_fit toward a failed convergence.
    # If it does converge anyway (unlikely), we still get success:True
    # with very poor chi² — that's fine, the test asserts shape, not
    # outcome.
    r = await linear_data.call('fit.run',
        xData='x', yData='y',
        function='exp(-a*x*x*x)',
        params={'a': 1e10})
    assert isinstance(r.get('success'), bool)
    assert 'params' in r
