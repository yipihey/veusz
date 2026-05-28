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

"""A convenience module to import used Qt symbols from.

Normally this re-exports PyQt6. When PyQt6 is unavailable — notably under
Pyodide (CPython compiled to WebAssembly), where there is no Qt — we fall back
to :mod:`veusz.qtshim`, a pure-Python stand-in covering the value/geometry
types, a QPainter state machine, and fonttools-backed font metrics that the
headless document model and the Vello scene-capture path need. The desktop app
is unaffected (PyQt6 imports succeed and win)."""

try:
    from PyQt6.QtCore import *
    from PyQt6.QtWidgets import *
    from PyQt6.QtGui import *
    from PyQt6.QtSvg import *
    from PyQt6.QtPrintSupport import *
    from PyQt6.QtSvgWidgets import *
    from PyQt6.uic import loadUi

    try:
        from PyQt6 import sip
    except ImportError:
        import sip
except ImportError:
    # No PyQt6 (e.g. Pyodide / headless capture). Replace this module with the
    # pure-Python shim so that `from .. import qtall as qt` yields the shim and
    # unknown GUI symbols resolve through the shim's PEP 562 __getattr__.
    import sys
    from . import qtshim as _qtshim
    sys.modules[__name__] = _qtshim
