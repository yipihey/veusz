"""Painter-protocol equivalents of the leaf-level drawing helpers Veusz
widgets currently invoke as ``utils.plotLineArrow``, ``utils.plotMarker``,
and friends. These take a :class:`veusz.paint.protocol.Painter` rather
than a ``QPainter``.

The point of this module is to validate that the abstract Painter API
(as defined in :mod:`veusz.paint.protocol` and mirrored by
``veusz-paint-core::Painter`` on the Rust side) is rich enough to express
the drawing primitives widgets actually use. The widget refactor plan
(see ``docs/widget-refactor-spike.md``) walks through how a real widget
would be rebuilt around this module.

For now this is an "exemplar" module — real Veusz widgets still call
``utils.plotLineArrow``; the comparison harness already captures their
QPainter calls into a Scene IR via the C++ recordpaint engine. Once a
widget is refactored to call these helpers instead, it can be wired to
any backend (Qt, tiny-skia, Vello) without going through the trace.
"""

from __future__ import annotations

import math

from .protocol import Affine, Painter, Paint, Path, Rect


def plot_line_arrow(painter: Painter, xpos: float, ypos: float,
                    length: float, angle_deg: float,
                    stroke,
                    arrowsize: float = 0.0,
                    arrowleft: str = 'none',
                    arrowright: str = 'none') -> None:
    """Painter-protocol equivalent of ``veusz.utils.points.plotLineArrow``.

    ``painter`` is a :class:`Painter`; ``stroke`` is the
    :class:`veusz.paint.protocol.Stroke` value the caller already
    converted from its Veusz ``Setting.Line`` via ``line.to_stroke(helper)``.

    ``arrowleft`` / ``arrowright`` accept the same labels as the Qt
    version (``'none'`` / ``'arrow'`` / ``'arrowtriangle'`` etc.) —
    unrecognised values fall back to a plain line endpoint.
    """
    painter.save()
    painter.concat_transform(Affine.translate(xpos, ypos))
    theta = math.radians(angle_deg)
    c, s = math.cos(theta), math.sin(theta)
    painter.concat_transform(Affine(c, s, -s, c, 0.0, 0.0))

    # Apply the stroke once for both endpoints + the main line; the
    # arrow markers and the line share pen colour + width.
    painter.set_paint(Paint(stroke=stroke, anti_alias=True))

    # Right-end arrow head (at the line's far end).
    _plot_arrow_marker(painter, length, 0.0, arrowright, arrowsize)

    # Left-end arrow head — mirror the x axis so the same code paints a
    # head pointing the other way.
    painter.save()
    painter.concat_transform(Affine.scale(-1.0, 1.0))
    _plot_arrow_marker(painter, 0.0, 0.0, arrowleft, arrowsize)
    painter.restore()

    # Main line, drawn between the two endpoints.
    line = Path()
    line.move_to(0.0, 0.0)
    line.line_to(length, 0.0)
    painter.stroke_path(line)

    painter.restore()


def _plot_arrow_marker(painter: Painter, x: float, y: float,
                       kind: str, size: float) -> None:
    """Internal: emit one arrow head at (x, y). ``kind`` matches the
    Veusz arrow-head identifiers; ``size`` is the arrow's leg length in
    user-space units."""
    if size <= 0 or kind == 'none':
        return
    # Build the head as a path in the marker-local frame, then stroke it
    # (and optionally fill, depending on the kind).
    head = Path()
    # Common arrow shape: two strokes from (x, y) to two points at
    # 30° off the leading direction.
    half_angle = math.radians(20.0)  # arrow half-angle
    dx = size * math.cos(half_angle)
    dy = size * math.sin(half_angle)
    if kind in ('arrow', 'linearrow'):
        head.move_to(x - dx, y - dy)
        head.line_to(x, y)
        head.line_to(x - dx, y + dy)
        painter.stroke_path(head)
    elif kind in ('arrowtriangle', 'triangle'):
        head.move_to(x - dx, y - dy)
        head.line_to(x, y)
        head.line_to(x - dx, y + dy)
        head.close()
        painter.fill_path(head)
        painter.stroke_path(head)
    elif kind == 'square':
        s = size * 0.5
        rect = Path.rect(Rect(x - s, y - s, size, size))
        painter.fill_path(rect)
        painter.stroke_path(rect)
    # else: unknown kind — silently fall through, matching the QPainter
    # version's behaviour for unrecognised arrow codes.
