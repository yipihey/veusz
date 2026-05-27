"""Abstract Painter interface for Veusz.

This package defines the runtime-switchable paint backend. The existing Qt /
QPainter path is the default and is wrapped by :class:`QtPainter` here, which
satisfies the same protocol as the (future) tiny-skia and Vello backends.

See ``docs/parallel-paint-backends-plan.md`` for the design.

Public entry points
-------------------
:func:`create_painter`
    Build a painter for the active backend, selected by env var
    ``VEUSZ_PAINT_BACKEND`` (``qt`` | ``tiny-skia`` | ``vello``) or by the
    explicit ``backend`` argument. Returns an object implementing
    :class:`Painter`.

:func:`wrap_qpainter`
    Wrap an existing :class:`PyQt6.QtGui.QPainter` (the path used by the
    legacy code today) so it can be passed where a generic Painter is
    expected.

:func:`active_backend`
    Name of the backend that ``create_painter`` will pick right now.

This package contains no PyO3 / Rust bindings yet; only the Qt shim and the
selection plumbing. The tiny-skia and Vello implementations land later in
their own crates under ``veusz-tauri/crates/veusz-paint-*``.
"""

from .protocol import (
    Painter,
    Path,
    Paint,
    Fill,
    Stroke,
    Color,
    BlendMode,
    FillRule,
    Quality,
    Affine,
    Rect,
)
from .factory import create_painter, wrap_qpainter, active_backend, BackendError

__all__ = [
    "Painter",
    "Path",
    "Paint",
    "Fill",
    "Stroke",
    "Color",
    "BlendMode",
    "FillRule",
    "Quality",
    "Affine",
    "Rect",
    "create_painter",
    "wrap_qpainter",
    "active_backend",
    "BackendError",
]
