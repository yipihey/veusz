"""Dynamic-pass QPainter audit (spike S1, Python half).

When ``VEUSZ_PAINT_TRACE`` is set to a writable file path, every Python-side
QPainter call routed through Veusz's paint pipeline is logged as one JSONL
record. The trace is consumed by ``tests/comparison/aggregate_trace.py`` to
produce the measured call-frequency table that replaces the static-pass
table in ``docs/qpainter-audit.md`` §1.

Limitations
-----------
This tracer wraps the Python-visible QPainter surface. It does *not* see
calls made from C++ helpers (``qtloops.plotPathsToPainter`` and friends)
because those bypass the Python layer entirely. To audit those, build with
``VEUSZ_RECORDPAINT_TRACE`` honored by ``src/recordpaint/recordpaintengine.cpp``
(spike S1, C++ half). The Python tracer is what we ship without rebuilding;
the C++ tracer is the ground truth.
"""

from __future__ import annotations

import json
import os
import threading
from typing import Any, Optional


# Methods we intercept. Names must match QPainter's Python API.
_TRACED_METHODS = (
    "setPen",
    "setBrush",
    "setFont",
    "setRenderHint",
    "setCompositionMode",
    "setClipRect",
    "setClipPath",
    "setClipping",
    "setTransform",
    "setWorldTransform",
    "save",
    "restore",
    "translate",
    "rotate",
    "scale",
    "shear",
    "resetTransform",
    "drawLine",
    "drawLines",
    "drawPath",
    "drawPolyline",
    "drawPolygon",
    "drawRect",
    "drawRects",
    "drawEllipse",
    "drawText",
    "drawImage",
    "drawPixmap",
    "drawTiledPixmap",
    "drawPoint",
    "drawPoints",
    "strokePath",
    "fillPath",
    "fillRect",
)


def _shape(arg: Any) -> Any:
    """Cheap, type-only summary of an argument.

    We do not log full coordinate data — that would blow up trace size on
    realistic documents. We log the type and the cheap shape ("points: 412",
    "len: 2") that is enough to drive Paint / Stroke / Path-builder design.
    """
    t = type(arg).__name__
    if isinstance(arg, (int, float, bool, str)):
        return {"t": t, "v": arg}
    if isinstance(arg, (list, tuple)):
        return {"t": t, "len": len(arg)}
    if t == "QPainterPath":
        return {"t": t, "elements": arg.elementCount()}
    if t in ("QPolygonF", "QPolygon"):
        return {"t": t, "points": arg.count()}
    if t == "QPen":
        dash = list(arg.dashPattern())
        return {
            "t": t,
            "style": int(arg.style()),
            "width": float(arg.widthF()),
            "cap": int(arg.capStyle()),
            "join": int(arg.joinStyle()),
            "color": arg.color().name(),
            # dashPattern returns the synthetic pattern for Qt::SolidLine too;
            # consumers can filter on style to know whether it's meaningful.
            "dash": dash if dash else None,
        }
    if t == "QBrush":
        return {"t": t, "style": int(arg.style()), "color": arg.color().name()}
    if t == "QFont":
        return {"t": t, "family": arg.family(), "size": arg.pointSizeF(),
                "weight": int(arg.weight()), "italic": arg.italic()}
    if t == "QColor":
        return {"t": t, "color": arg.name()}
    if t in ("QRect", "QRectF"):
        return {"t": t, "w": float(arg.width()), "h": float(arg.height())}
    if t in ("QPoint", "QPointF"):
        return {"t": t}
    if t == "QImage":
        return {"t": t, "w": arg.width(), "h": arg.height(), "fmt": int(arg.format())}
    if t == "QPixmap":
        return {"t": t, "w": arg.width(), "h": arg.height()}
    return {"t": t}


class _TraceSink:
    """Process-wide JSONL writer. Thread-safe."""

    def __init__(self, path: str) -> None:
        self._fp = open(path, "a", buffering=1, encoding="utf-8")
        self._lock = threading.Lock()

    def write(self, record: dict) -> None:
        with self._lock:
            self._fp.write(json.dumps(record, separators=(",", ":")) + "\n")

    def close(self) -> None:
        with self._lock:
            try:
                self._fp.close()
            except Exception:
                pass


_sink: Optional[_TraceSink] = None
_sink_lock = threading.Lock()


def trace_enabled() -> bool:
    return bool(os.environ.get("VEUSZ_PAINT_TRACE"))


def _get_sink() -> Optional[_TraceSink]:
    """Lazy-init the singleton trace sink."""
    global _sink
    path = os.environ.get("VEUSZ_PAINT_TRACE")
    if not path:
        return None
    with _sink_lock:
        if _sink is None:
            _sink = _TraceSink(path)
    return _sink


def install_on(painter: "qt.QPainter", widget_name: Optional[str] = None) -> "qt.QPainter":
    """Return ``painter`` with traced overrides bound.

    Implementation: install per-instance lambdas as attributes. PyQt looks up
    attributes on the instance before the class so this intercepts cleanly
    *for Python-originated calls*. C++-originated calls (``qtloops``) call
    into the QPainter from the C++ side and are not visible here.
    """
    sink = _get_sink()
    if sink is None:
        return painter

    for method_name in _TRACED_METHODS:
        original = getattr(painter, method_name, None)
        if original is None:
            continue
        sink_ref = sink  # capture in closure
        wname = widget_name

        def make_wrapper(method_name=method_name, original=original):
            def wrapped(*args, **kwargs):
                try:
                    sink_ref.write({
                        "op": method_name,
                        "widget": wname,
                        "args": [_shape(a) for a in args],
                    })
                except Exception:
                    pass
                return original(*args, **kwargs)
            return wrapped

        # bind onto the instance
        try:
            setattr(painter, method_name, make_wrapper())
        except (AttributeError, TypeError):
            # Some sip-wrapped methods cannot be shadowed per-instance;
            # they show up only in the C++ trace.
            pass

    return painter
