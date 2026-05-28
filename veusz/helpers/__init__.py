#    Copyright (C) 2008 Jeremy S. Sanders
#    Email: Jeremy Sanders <jeremy@jeremysanders.net>
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

"""Helper compiled routines.

On the desktop these are C++ extensions (``qtloops``, ``threed`` …). When a
given extension is unavailable — notably under Pyodide, where there is no
compiler/Qt — we register a fallback so ``from ..helpers import <ext>`` keeps
working: ``qtloops`` falls back to the pure-Python :mod:`veusz.helpers.qtloops_py`
(which records geometry into the Scene), and the contour/3D/MathML extensions
get inert stubs (those widget types are unsupported headless). The desktop is
unaffected: when the real ``.so`` exists we leave the normal import alone.
"""

import importlib.util as _ilu
import sys as _sys
import types as _types


def _ext_missing(name):
    full = f'{__name__}.{name}'
    # Explicit None in sys.modules (e.g. a test/Pyodide blocker) == missing.
    if full in _sys.modules and _sys.modules[full] is None:
        return True
    try:
        return _ilu.find_spec(full) is None
    except (ImportError, ValueError):
        return True


def _make_inert(modname):
    """A harmless importable stub for an absent C extension."""
    m = _types.ModuleType(f'{__name__}.{modname}')
    m.__file__ = f'<inert:{modname}>'

    class _Inert:
        def __init__(self, *a, **k):
            pass

        def __getattr__(self, n):
            return lambda *a, **k: None

    def _getattr(name):
        if name.startswith('__') and name.endswith('__'):
            raise AttributeError(name)
        if name[:1].isupper():
            return type(name, (_Inert,), {})
        return lambda *a, **k: None

    m.__getattr__ = _getattr
    return m


# qtloops: pure-Python recorder fallback when the C++ extension is absent.
if _ext_missing('qtloops'):
    from . import qtloops_py as _qtloops_py
    _sys.modules[f'{__name__}.qtloops'] = _qtloops_py

# Contour / 3D / MathML / record extensions: inert stubs when absent (those
# widget types are out of scope headless, but the modules must be importable
# so ``import veusz.widgets`` succeeds).
for _ext in ('_nc_cntr', 'threed', 'qtmml', 'recordpaint'):
    if _ext_missing(_ext):
        _sys.modules[f'{__name__}.{_ext}'] = _make_inert(_ext)

