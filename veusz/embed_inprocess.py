# In-process embedding of the Veusz GUI.
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

"""In-process embedding of the Veusz GUI.

Unlike :mod:`veusz.embed`, which spawns a separate process and shuttles
pickled commands over a socket, this module opens a full Veusz
``MainWindow`` directly inside the calling Python interpreter. The
in-window Python console shares the host session's ``__main__``
namespace, so data already loaded in the caller can be referenced by
name from the GUI console. Numpy arrays of ``dtype=float64`` are
stored by reference; other dtypes are copied to float64.

Typical use::

    import numpy as np
    import veusz

    xs = np.linspace(0, 10, 200)
    ys = np.sin(xs)
    v = veusz.show(x=xs, y=ys)

In IPython/Jupyter, the Qt event loop is integrated automatically via
``%gui qt`` so the REPL stays interactive. In a plain Python script,
call :meth:`InProcessEmbedded.WaitForClose` to block while the GUI is
open, or call :meth:`InProcessEmbedded.process_events` in your own
loop.
"""

import sys
import types

from . import qtall as qt
from . import document
from . import embed as _embed_subprocess


# Module-level latch so we only fiddle with QApplication settings once,
# even if the user opens several windows.
_app_configured = False


def _ensure_app():
    """Return the active QApplication, creating one if the host hasn't.

    Also imports the heavyweight ``widgets`` and ``dataimport`` packages
    on first call — these have registration side effects (widget types,
    importers) that the normal app startup triggers via
    ``veusz_main.ImportThread``. Configures
    ``setQuitOnLastWindowClosed(False)`` exactly once so closing the
    Veusz window never tears down the caller's interpreter.
    """
    global _app_configured
    app = qt.QApplication.instance()
    if app is None:
        app = qt.QApplication(sys.argv if sys.argv else [''])
    if not _app_configured:
        # Trigger widget / dataimport registration. Imports are
        # cached, so the cost is paid once per process.
        from . import widgets  # noqa: F401
        from . import dataimport  # noqa: F401
        app.setQuitOnLastWindowClosed(False)
        _app_configured = True
    return app


def _try_enable_ipython_qt():
    """Hook the Qt event loop into an IPython shell if one is running."""
    try:
        import IPython
    except ImportError:
        return False
    shell = IPython.get_ipython()
    if shell is None:
        return False
    try:
        shell.enable_gui('qt')
    except Exception:
        return False
    return True


def _caller_main_globals():
    return sys.modules['__main__'].__dict__


class InProcessEmbedded:
    """A Veusz MainWindow running inside the calling Python process.

    Exposes the same scripting surface as :class:`veusz.embed.Embedded`
    (``Add``, ``SetData``, ``To``, ``Set``, ``Get``, ...), but every
    call executes synchronously in-process against the live document
    — no pickling, no socket.
    """

    def __init__(self, name='Veusz', globals_dict=None,
                 hidden=False, share_namespace=True):
        # Defer importing windows.* (and thus the bulk of the Qt
        # widget tree) until something actually asks for a window —
        # this keeps ``import veusz`` cheap for headless callers.
        from .windows.mainwindow import MainWindow

        self.app = _ensure_app()

        if globals_dict is None and share_namespace:
            globals_dict = _caller_main_globals()
        self._globals = globals_dict

        self.window = MainWindow.CreateWindow(
            doc=document.Document(),
            globals_dict=globals_dict,
            embed=True,
        )
        self.window.setWindowTitle(name)
        if hidden:
            self.window.hide()

        # The CommandInterface used by the in-GUI console — we route
        # scripted calls through the same object so undo history and
        # signal emission match what the user would see typing in the
        # console.
        self._ci = self.window.console.interpreter.interface

        # Mirror veusz.embed.Embedded: expose every Veusz command as a
        # method on this instance. Using functools.partial keeps the
        # __doc__ from the original bound method.
        cmds = self.window.console.interpreter.cmds
        for cmdname, cmd in cmds.items():
            func = _make_method(cmd)
            method = types.MethodType(func, self)
            setattr(self, cmdname, method)

        # Tree-style root, matching veusz.embed.Embedded.Root.
        self.Root = _embed_subprocess.WidgetNode(self._ci, 'widget', '/')

        _try_enable_ipython_qt()

    def Close(self):
        """Close the embedded window. The host interpreter is unaffected."""
        if self.window is not None:
            self.window.close()
            self.window = None

    def IsClosed(self):
        """True once the window has been closed."""
        return self.window is None or not self.window.isVisible()

    def WaitForClose(self):
        """Block, pumping Qt events, until the window is closed.

        Useful in plain Python scripts. Under IPython the event loop is
        already integrated via ``%gui qt`` — you can keep typing while
        the GUI runs and don't need this.
        """
        while not self.IsClosed():
            self.app.processEvents()

    def process_events(self):
        """Pump pending Qt events once (non-blocking)."""
        self.app.processEvents()


def _make_method(cmd):
    """Build a method that forwards to a CommandInterface command."""
    def _call(self, *args, **kwargs):
        return cmd(*args, **kwargs)
    _call.__doc__ = getattr(cmd, '__doc__', None)
    _call.__name__ = getattr(cmd, '__name__', 'cmd')
    return _call


def embed_app(globals_dict=None, name='Veusz', hidden=False):
    """Open a Veusz MainWindow inside this Python process.

    ``globals_dict`` defaults to the caller's ``__main__.__dict__`` so
    the in-window Python console shares the host namespace. Returns an
    :class:`InProcessEmbedded` for scripted control.
    """
    return InProcessEmbedded(
        name=name, globals_dict=globals_dict, hidden=hidden)


def show(**arrays):
    """Open Veusz on the given numpy arrays and add a default xy plot.

    Each keyword becomes a Veusz dataset of that name. If both ``x``
    and ``y`` are supplied, a page + graph + xy widget are added so
    something is visible immediately. Returns the
    :class:`InProcessEmbedded` instance for further scripting.

    Note: float64 numpy arrays are stored by reference into the
    document; other dtypes are copied to float64.
    """
    v = InProcessEmbedded()
    for dsname, arr in arrays.items():
        v.SetData(dsname, arr)

    if arrays:
        page = v.Root.Add('page')
        graph = page.Add('graph')
        if 'x' in arrays and 'y' in arrays:
            graph.Add('xy', xData='x', yData='y')

    return v
