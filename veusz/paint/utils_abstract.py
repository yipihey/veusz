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
from typing import Iterable, Optional, Sequence

from .protocol import (
    Affine,
    Color,
    Fill,
    FillRule,
    LineCap,
    Painter,
    Paint,
    Path,
    Rect,
    Stroke,
)
from . import markers as _markers


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


# ===========================================================================
# Bulk-geometry helpers — abstract-Painter equivalents of the qtloops C++
# functions Veusz widgets currently call.
#
# These are deliberately scalar-Python implementations: the goal here is to
# validate the abstract interface against the real widget code paths, not
# to match qtloops' performance. The PyO3 zero-copy numpy path (§7.3 of the
# plan) is the eventual perf story.
# ===========================================================================


def _clip_intersect_rect(clip: Optional[Rect], r: Rect) -> Optional[Rect]:
    """Return the intersection rect, or None if disjoint."""
    if clip is None:
        return r
    x1 = max(clip.x, r.x)
    y1 = max(clip.y, r.y)
    x2 = min(clip.x + clip.w, r.x + r.w)
    y2 = min(clip.y + clip.h, r.y + r.h)
    if x2 <= x1 or y2 <= y1:
        return None
    return Rect(x1, y1, x2 - x1, y2 - y1)


def plot_clipped_polyline(painter: Painter, clip: Optional[Rect],
                          pts: Sequence) -> None:
    """Abstract equivalent of ``qtloops.plotClippedPolyline``.

    ``pts`` is an iterable of (x, y) pairs. Pushes a clip rect (if given),
    builds a single polyline Path, strokes it, then pops the clip. The
    Cohen-Sutherland-style segment clipping qtloops does is replaced by a
    plain rectangular clip — for the new backends that draw onto a buffer
    that is already the clip target this is equivalent.
    """
    seq = list(pts)
    if len(seq) < 2:
        return
    pushed = False
    if clip is not None:
        painter.push_clip_rect(clip)
        pushed = True
    p = Path()
    p.move_to(seq[0][0], seq[0][1])
    for x, y in seq[1:]:
        p.line_to(x, y)
    painter.stroke_path(p)
    if pushed:
        painter.pop_clip()


def plot_lines(painter: Painter,
               x1s: Iterable[float], y1s: Iterable[float],
               x2s: Iterable[float], y2s: Iterable[float],
               clip: Optional[Rect] = None) -> None:
    """Abstract equivalent of ``qtloops.plotLinesToPainter``: draws N
    independent line segments. Each segment becomes a sub-path of a single
    Path (one stroke_path call, so they share paint state)."""
    p = Path()
    any_seg = False
    for x1, y1, x2, y2 in zip(x1s, y1s, x2s, y2s):
        p.move_to(float(x1), float(y1))
        p.line_to(float(x2), float(y2))
        any_seg = True
    if not any_seg:
        return
    pushed = False
    if clip is not None:
        painter.push_clip_rect(clip)
        pushed = True
    painter.stroke_path(p)
    if pushed:
        painter.pop_clip()


def plot_boxes(painter: Painter,
               x1s: Iterable[float], y1s: Iterable[float],
               x2s: Iterable[float], y2s: Iterable[float],
               clip: Optional[Rect] = None,
               fill: bool = False,
               stroke: bool = True) -> None:
    """Abstract equivalent of ``qtloops.plotBoxesToPainter``."""
    p = Path()
    any_box = False
    for x1, y1, x2, y2 in zip(x1s, y1s, x2s, y2s):
        x1, x2 = float(x1), float(x2)
        y1, y2 = float(y1), float(y2)
        # canonicalise rect
        rx = min(x1, x2); ry = min(y1, y2)
        rw = abs(x2 - x1); rh = abs(y2 - y1)
        p.move_to(rx, ry)
        p.line_to(rx + rw, ry)
        p.line_to(rx + rw, ry + rh)
        p.line_to(rx, ry + rh)
        p.close()
        any_box = True
    if not any_box:
        return
    pushed = False
    if clip is not None:
        painter.push_clip_rect(clip)
        pushed = True
    if fill:
        painter.fill_path(p)
    if stroke:
        painter.stroke_path(p)
    if pushed:
        painter.pop_clip()


def polygon_path(xs_ys_groups: Sequence[Sequence[float]],
                 clip: Optional[Rect] = None) -> Path:
    """Build a closed polygon Path from interleaved coordinate streams.

    ``xs_ys_groups`` is a sequence of N (where N is even) sequences:
    ``[x_a, y_a, x_b, y_b, ...]`` — for each datapoint we emit a vertex
    at ``(x_a[i], y_a[i])``, then ``(x_b[i], y_b[i])``, etc. This mirrors
    ``qtloops.addNumpyPolygonToPath`` (which takes a clip + an even-length
    list of arrays).

    ``clip`` is currently advisory: the caller should set a clip via
    ``push_clip_rect`` before drawing, since per-vertex clipping would
    diverge from the Sutherland-Hodgman implementation in qtloops.
    """
    if not xs_ys_groups or len(xs_ys_groups) % 2:
        raise ValueError("polygon_path requires an even number of arrays")
    n = min(len(a) for a in xs_ys_groups)
    out = Path()
    # Determine if first array's first point exists.
    if n == 0:
        return out
    pairs = len(xs_ys_groups) // 2  # number of (x, y) pairs per datapoint
    first = True
    for i in range(n):
        for j in range(pairs):
            x = float(xs_ys_groups[2 * j][i])
            y = float(xs_ys_groups[2 * j + 1][i])
            if first:
                out.move_to(x, y)
                first = False
            else:
                out.line_to(x, y)
    out.close()
    return out


def polyline_path(xs: Iterable[float], ys: Iterable[float]) -> Path:
    """Build an open polyline Path from two coordinate sequences."""
    p = Path()
    first = True
    for x, y in zip(xs, ys):
        if first:
            p.move_to(float(x), float(y))
            first = False
        else:
            p.line_to(float(x), float(y))
    return p


def plot_markers(painter: Painter,
                 xs: Sequence[float], ys: Sequence[float],
                 kind: str, size: float,
                 fill: Optional[Fill] = None,
                 stroke: Optional[Stroke] = None,
                 clip: Optional[Rect] = None,
                 equal_area: bool = False) -> None:
    """Abstract equivalent of :func:`veusz.utils.points.plotMarkers`.

    Each marker is the same shape, drawn at every ``(x, y)``. We do the
    transform per marker (translate -> draw -> untranslate via save/restore)
    rather than baking N copies into a single big Path — recording backends
    can dedupe geometry across markers if they want to.
    """
    if kind == 'none' or size <= 0:
        return
    # Build the marker template once.
    stroke_w = stroke.width if stroke is not None else 1.0
    base_path, fillable = _markers.marker_path(kind, size, stroke_w)
    if equal_area and kind in _markers.area_scales:
        base_path = _markers._scale_path(base_path, _markers.area_scales[kind])

    actual_fill = fill if fillable else None
    paint = Paint(fill=actual_fill, stroke=stroke, anti_alias=True)

    pushed = False
    if clip is not None:
        painter.push_clip_rect(clip)
        pushed = True

    painter.save()
    painter.set_paint(paint)
    for x, y in zip(xs, ys):
        painter.save()
        painter.concat_transform(Affine.translate(float(x), float(y)))
        if actual_fill is not None:
            painter.fill_path(base_path)
        if stroke is not None:
            painter.stroke_path(base_path)
        painter.restore()
    painter.restore()

    if pushed:
        painter.pop_clip()


def plot_marker(painter: Painter,
                x: float, y: float,
                kind: str, size: float,
                fill: Optional[Fill] = None,
                stroke: Optional[Stroke] = None) -> None:
    """Single-point convenience over :func:`plot_markers`."""
    plot_markers(painter, (x,), (y,), kind, size, fill=fill, stroke=stroke)


def fill_pts_to_edge(painter: Painter,
                     pts: Sequence,
                     posn: Sequence[float],
                     fill: Fill,
                     fill_to: str,
                     clip: Optional[Rect] = None) -> None:
    """Abstract equivalent of ``veusz.widgets.point.fillPtsToEdge``.

    ``pts`` is an iterable of (x, y) pairs (the plot-line vertices).
    ``posn`` is ``(left, top, right, bottom)`` — the plotting bounds.
    ``fill_to`` selects which edge of ``posn`` to close to: ``'top'``,
    ``'bottom'``, ``'left'``, ``'right'``.
    """
    seq = list(pts)
    if len(seq) < 2:
        return
    if fill_to == 'top':
        x1, x2 = seq[0][0], seq[-1][0]
        y1 = y2 = posn[1]
    elif fill_to == 'bottom':
        x1, x2 = seq[0][0], seq[-1][0]
        y1 = y2 = posn[3]
    elif fill_to == 'left':
        y1, y2 = seq[0][1], seq[-1][1]
        x1 = x2 = posn[0]
    elif fill_to == 'right':
        y1, y2 = seq[0][1], seq[-1][1]
        x1 = x2 = posn[2]
    else:
        raise ValueError(f"invalid fill_to {fill_to!r}")

    p = Path()
    p.move_to(x1, y1)
    for x, y in seq:
        p.line_to(x, y)
    p.line_to(x2, y2)
    p.close()
    pushed = False
    if clip is not None:
        painter.push_clip_rect(clip)
        pushed = True
    painter.set_paint(Paint(fill=fill, anti_alias=True))
    painter.fill_path(p)
    if pushed:
        painter.pop_clip()
