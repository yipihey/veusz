"""Backend selection.

Runtime switch controlled by ``VEUSZ_PAINT_BACKEND`` (env var) and, in a
later phase, the ``Document/paintBackend`` document option. Default is
``qt`` — existing users see no change.
"""

from __future__ import annotations

import os
from typing import Optional


class BackendError(RuntimeError):
    """Raised when a requested backend is unavailable."""


_BACKEND_NAMES = ("qt", "tiny-skia", "vello")
_DEFAULT_BACKEND = "qt"


def active_backend(override: Optional[str] = None) -> str:
    """Return the backend name to use.

    Precedence: explicit override > ``VEUSZ_PAINT_BACKEND`` env var > default.
    """
    name = (override
            or os.environ.get("VEUSZ_PAINT_BACKEND")
            or _DEFAULT_BACKEND).strip().lower()
    if name not in _BACKEND_NAMES:
        raise BackendError(
            f"Unknown paint backend {name!r}; expected one of {_BACKEND_NAMES}"
        )
    return name


def wrap_qpainter(qpainter):
    """Wrap an existing :class:`PyQt6.QtGui.QPainter` in the abstract Painter."""
    from .qt_backend import QtPainter
    return QtPainter(qpainter)


def create_painter(width: int, height: int, dpi: float = 96.0,
                   backend: Optional[str] = None,
                   qpainter=None):
    """Build a :class:`Painter` for the given output size.

    For the ``qt`` backend the caller may pass an existing ``qpainter`` to
    wrap; otherwise a fresh ``QImage`` is created and a :class:`QtPainter`
    that paints onto it is returned. (Caller can pull the QImage off the
    shim via :attr:`QtPainter._p.device()`.)

    The ``tiny-skia`` and ``vello`` backends are not implemented yet; this
    function raises :class:`BackendError` for them until the Rust crates
    land. Selecting them is intentionally non-fatal at import time so
    callers can introspect ``active_backend()`` first.
    """
    name = active_backend(backend)

    if name == "qt":
        from .qt_backend import QtPainter
        from .. import qtall as qt
        if qpainter is not None:
            return QtPainter(qpainter)
        image = qt.QImage(int(width), int(height),
                          qt.QImage.Format.Format_ARGB32_Premultiplied)
        image.fill(0)
        p = qt.QPainter(image)
        shim = QtPainter(p)
        shim._owned_qpainter = p  # keep alive
        shim._owned_image = image
        return shim

    if name in ("tiny-skia", "vello"):
        raise BackendError(
            f"backend {name!r} is not yet implemented; see "
            "docs/parallel-paint-backends-plan.md, phases 2 & 3"
        )

    raise BackendError(f"Unhandled backend {name!r}")  # unreachable
