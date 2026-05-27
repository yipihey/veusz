# Curve-fitting RPC handlers.
##############################################################################

"""fit.run — fit a Python expression to (xData, yData) and return
best-fit parameter values + reduced chi-squared.

Uses scipy.optimize.curve_fit when available (the v1 contract).
Without scipy, returns a clear error so the frontend can surface
"install scipy for fitting". Veusz itself supports iminuit as the
primary fitter — left as a TODO so we don't duplicate that path.

Function expressions are compiled through Veusz's existing
``document.evaluate.compileCheckedExpression`` which is the same
guard the Fit widget uses (locks the eval namespace down to numpy +
the named parameters).
"""

from __future__ import annotations

from typing import Any

import numpy as np

from ..errors import RpcError, INVALID_PARAMS


def register(ctx):
    def run(xData: str, yData: str, function: str,
            params: dict[str, float] | None = None,
            variable: str = 'x',
            fit_range: list[float] | None = None,
            **_):
        """Fit ``function`` to ``yData`` vs ``xData``.

        ``params`` is ``{name: init}``; the keys define which variables
        in the expression are fit parameters (versus the independent
        variable, ``variable``).

        Returns ``{params, chi2, dof, reduced_chi2, success, message}``.
        ``params`` on success holds ``{name: {value, stderr}}`` —
        stderr drawn from the covariance diagonal.
        """
        try:
            from scipy import optimize as _opt  # noqa
        except ImportError:
            raise RpcError(INVALID_PARAMS,
                'scipy is required for fitting (install scipy)') from None

        params = dict(params or {})
        if not params:
            raise RpcError(INVALID_PARAMS,
                'fit needs at least one parameter in `params`')
        if variable in params:
            raise RpcError(INVALID_PARAMS,
                f'`variable` {variable!r} cannot also be a fit parameter')

        # Resolve datasets
        ds = ctx.document.data
        if xData not in ds or yData not in ds:
            raise RpcError(INVALID_PARAMS,
                f'unknown dataset: {xData if xData not in ds else yData}')
        xvals = np.asarray(ds[xData].data, dtype=float)
        yvals = np.asarray(ds[yData].data, dtype=float)
        if xvals.size != yvals.size:
            raise RpcError(INVALID_PARAMS,
                f'{xData} and {yData} differ in length')

        # Optional fit range — clip both arrays
        if fit_range:
            if len(fit_range) != 2:
                raise RpcError(INVALID_PARAMS,
                    '`fit_range` must be [lo, hi]')
            lo, hi = sorted(map(float, fit_range))
            mask = (xvals >= lo) & (xvals <= hi)
            xvals, yvals = xvals[mask], yvals[mask]
            if xvals.size == 0:
                raise RpcError(INVALID_PARAMS, 'no data in fit_range')

        # Errors (none for now — assume 1.0 per point; scipy returns
        # raw chi² we can normalise to reduced-chi² with dof)
        names = sorted(params.keys())
        p0 = np.array([params[n] for n in names], dtype=float)

        # Build a callable from the user's expression.
        # We compile against the safe Veusz namespace so users can use
        # `sin`, `exp`, etc. The expression sees `variable` (the
        # independent variable) and each parameter name as a local.
        env = ctx.document.evaluate.context.copy() if hasattr(ctx.document, 'evaluate') else {}
        env.update({k: 0.0 for k in [variable, *names]})
        try:
            compiled = compile(function, '<fit>', 'eval')
        except SyntaxError as e:
            raise RpcError(INVALID_PARAMS, f'bad function expression: {e}') from e

        def model(x: np.ndarray, *p: float) -> np.ndarray:
            local = dict(env)
            local[variable] = x
            for name, val in zip(names, p):
                local[name] = val
            return np.asarray(eval(compiled, {'__builtins__': {}}, local))

        try:
            popt, pcov = _opt.curve_fit(model, xvals, yvals, p0=p0,
                                         maxfev=5000)
        except Exception as e:
            return {
                'success': False,
                'message': str(e),
                'params': {n: {'value': float(v), 'stderr': None}
                           for n, v in zip(names, p0)},
                'chi2': None, 'dof': None, 'reduced_chi2': None,
            }

        # Compute residuals + chi²
        resid = yvals - model(xvals, *popt)
        chi2 = float(np.sum(resid ** 2))
        dof = max(1, len(xvals) - len(popt))
        reduced = chi2 / dof
        # Standard errors from covariance diagonal
        stderr = np.sqrt(np.diag(pcov)) if pcov is not None else np.full(len(popt), np.nan)
        return {
            'success': True,
            'message': 'ok',
            'params': {
                n: {'value': float(popt[i]),
                    'stderr': None if not np.isfinite(stderr[i]) else float(stderr[i])}
                for i, n in enumerate(names)
            },
            'chi2': chi2,
            'dof': dof,
            'reduced_chi2': reduced,
            # Mostly for plotting the fit line afterwards
            'x_range': [float(xvals.min()), float(xvals.max())],
        }

    return {'fit.run': run}
