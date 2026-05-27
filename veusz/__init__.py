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

"""Main veusz module."""


def show(**arrays):
    """Open a Veusz GUI on the given numpy arrays.

    Convenience entry point for in-process embedding — opens a full
    Veusz MainWindow inside the calling Python interpreter, with the
    GUI's Python console sharing the caller's ``__main__`` namespace.
    See :mod:`veusz.embed_inprocess` for details.
    """
    from .embed_inprocess import show as _show
    return _show(**arrays)


def embed_app(globals_dict=None, name='Veusz', hidden=False):
    """Open a Veusz MainWindow inside this Python process.

    Lower-level companion to :func:`show` — does not load any data or
    add default plots. See :mod:`veusz.embed_inprocess` for details.
    """
    from .embed_inprocess import embed_app as _embed_app
    return _embed_app(globals_dict=globals_dict, name=name, hidden=hidden)
