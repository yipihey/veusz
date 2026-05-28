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
                   qpainter=None,
                   background=(1.0, 1.0, 1.0, 1.0)):
    """Build a :class:`Painter` for the given output size.

    For the ``qt`` backend the caller may pass an existing ``qpainter`` to
    wrap; otherwise a fresh ``QImage`` is created and a :class:`QtPainter`
    that paints onto it is returned.

    For the ``tiny-skia`` and ``vello`` backends a :class:`SceneBackend` is
    returned. It records ops via :class:`PythonSceneRecorder` and flushes
    them to the Rust extension on :meth:`Painter.finish` /
    :meth:`SceneBackend.to_png`. PNG bytes are then available via
    :attr:`SceneBackend.png_bytes`. Both backends share the same Scene IR
    and PDF emitter; only the rasteriser differs (CPU tiny-skia vs GPU
    wgpu Vello).
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
        try:
            from . import _paint_ext  # type: ignore
        except ImportError as exc:
            raise BackendError(
                f"{name} backend requires the veusz.paint._paint_ext "
                "Rust extension. Build with scripts/build_paint_ext.sh "
                "(see docs/parallel-paint-backends-plan.md §7.4)."
            ) from exc
        available = _paint_ext.available_backends()
        if name not in available:
            raise BackendError(
                f"{name} backend is not available in this build/runtime "
                f"(available: {list(available)}). Vello needs a working "
                "wgpu adapter; fall back to tiny-skia where none exists."
            )
        return SceneBackend(int(width), int(height), backend=name,
                            background=tuple(background),
                            _ext=_paint_ext)

    raise BackendError(f"Unhandled backend {name!r}")  # unreachable


class SceneBackend:
    """Recording Painter that rasterises a recorded Scene on finish.

    Implements :class:`Painter` by delegating every op to an internal
    :class:`PythonSceneRecorder`, then on :meth:`finish` ships the recorded
    scene to the ``_paint_ext`` extension and stores the PNG bytes. The
    ``backend`` name selects the rasteriser (``tiny-skia`` CPU or ``vello``
    GPU); both consume the identical Scene IR.
    """

    def __init__(self, width: int, height: int,
                 backend: str = "tiny-skia",
                 background: tuple = (1.0, 1.0, 1.0, 1.0),
                 _ext=None) -> None:
        from .scene_recorder import PythonSceneRecorder
        self._recorder = PythonSceneRecorder()
        self.width = int(width)
        self.height = int(height)
        self.backend = backend
        self.background = tuple(background)
        self._ext = _ext
        self.png_bytes: Optional[bytes] = None

    # Delegate every Painter op to the recorder.
    def save(self): self._recorder.save()
    def restore(self): self._recorder.restore()
    def set_transform(self, m): self._recorder.set_transform(m)
    def concat_transform(self, m): self._recorder.concat_transform(m)
    def push_clip_rect(self, r): self._recorder.push_clip_rect(r)
    def push_clip_path(self, p, rule=None):
        from .protocol import FillRule
        self._recorder.push_clip_path(p, rule if rule is not None else FillRule.NON_ZERO)
    def pop_clip(self): self._recorder.pop_clip()
    def set_paint(self, p): self._recorder.set_paint(p)
    def set_blend_mode(self, m): self._recorder.set_blend_mode(m)
    def set_quality(self, q): self._recorder.set_quality(q)
    def stroke_path(self, p): self._recorder.stroke_path(p)
    def fill_path(self, p, rule=None):
        from .protocol import FillRule
        self._recorder.fill_path(p, rule if rule is not None else FillRule.NON_ZERO)
    def draw_image(self, img, dst, src=None): self._recorder.draw_image(img, dst, src)
    def draw_text(self, layout, x, y): self._recorder.draw_text(layout, x, y)

    def finish(self) -> None:
        """Flush the recorded scene through Rust, populating
        :attr:`png_bytes`. Safe to call multiple times — subsequent calls
        re-render the same scene."""
        if self._ext is None:
            raise BackendError("backend extension was not bound at construction time")
        scene_json = self._recorder.to_json()
        self.png_bytes = self._ext.render_scene_to_png(
            scene_json, self.width, self.height, self.background, self.backend,
        )

    # convenience
    def to_png(self) -> bytes:
        if self.png_bytes is None:
            self.finish()
        return self.png_bytes  # type: ignore

    def to_pdf(self, width_pt: Optional[float] = None,
               height_pt: Optional[float] = None) -> bytes:
        """Render the recorded scene as a single-page PDF.

        ``width_pt`` / ``height_pt`` default to the painter's pixel size
        interpreted as PDF points (1 pt = 1/72 inch). For most documents
        you want to pass the document's intended size in points directly.
        """
        if self._ext is None:
            raise BackendError("backend extension was not bound at construction time")
        return self._ext.render_scene_to_pdf_bytes(
            self._recorder.to_json(),
            float(width_pt or self.width),
            float(height_pt or self.height),
            self.background,
            "tiny-skia",
        )

    @property
    def op_count(self) -> int:
        return self._recorder.op_count

    def scene_json(self) -> bytes:
        return self._recorder.to_json()
