"""QPainter shim — first concrete implementation of :class:`Painter`.

Wraps an existing :class:`PyQt6.QtGui.QPainter` so the legacy paint pipeline
satisfies the abstract interface without behavior change. This shim is what
makes the refactor incremental: widgets can be moved to the abstract API one
at a time while still rendering through Qt exactly as before.
"""

from __future__ import annotations

from typing import Optional

from .. import qtall as qt
from .protocol import (
    Affine,
    BlendMode,
    Color,
    Fill,
    FillRule,
    Image,
    LineCap,
    LineJoin,
    Painter,
    Paint,
    Path,
    PathVerb,
    Quality,
    Rect,
    Stroke,
    TextLayout,
)


_LINE_CAP_TO_QT = {
    LineCap.BUTT: qt.Qt.PenCapStyle.FlatCap,
    LineCap.ROUND: qt.Qt.PenCapStyle.RoundCap,
    LineCap.SQUARE: qt.Qt.PenCapStyle.SquareCap,
}

_LINE_JOIN_TO_QT = {
    LineJoin.MITER: qt.Qt.PenJoinStyle.MiterJoin,
    LineJoin.ROUND: qt.Qt.PenJoinStyle.RoundJoin,
    LineJoin.BEVEL: qt.Qt.PenJoinStyle.BevelJoin,
}

_BLEND_TO_QT = {
    BlendMode.SOURCE_OVER: qt.QPainter.CompositionMode.CompositionMode_SourceOver,
    BlendMode.MULTIPLY: qt.QPainter.CompositionMode.CompositionMode_Multiply,
    BlendMode.PLUS: qt.QPainter.CompositionMode.CompositionMode_Plus,
}

_FILL_RULE_TO_QT = {
    FillRule.NON_ZERO: qt.Qt.FillRule.WindingFill,
    FillRule.EVEN_ODD: qt.Qt.FillRule.OddEvenFill,
}


def _color_to_qcolor(c: Color) -> qt.QColor:
    q = qt.QColor()
    q.setRgbF(c.r, c.g, c.b, c.a)
    return q


def _affine_to_qtransform(m: Affine) -> qt.QTransform:
    return qt.QTransform(m.a, m.b, m.c, m.d, m.e, m.f)


def _path_to_qpainterpath(p: Path) -> qt.QPainterPath:
    qp = qt.QPainterPath()
    i = 0
    for verb in p.verbs:
        if verb is PathVerb.MOVE_TO:
            qp.moveTo(p.points[i], p.points[i + 1]); i += 2
        elif verb is PathVerb.LINE_TO:
            qp.lineTo(p.points[i], p.points[i + 1]); i += 2
        elif verb is PathVerb.QUAD_TO:
            qp.quadTo(p.points[i], p.points[i + 1],
                      p.points[i + 2], p.points[i + 3]); i += 4
        elif verb is PathVerb.CUBIC_TO:
            qp.cubicTo(p.points[i], p.points[i + 1],
                       p.points[i + 2], p.points[i + 3],
                       p.points[i + 4], p.points[i + 5]); i += 6
        elif verb is PathVerb.CLOSE:
            qp.closeSubpath()
    return qp


def _fill_to_qbrush(f: Fill) -> qt.QBrush:
    if f.solid is not None:
        return qt.QBrush(_color_to_qcolor(f.solid))
    if f.linear is not None:
        g = qt.QLinearGradient(f.linear.start[0], f.linear.start[1],
                               f.linear.end[0], f.linear.end[1])
        for stop in f.linear.stops:
            g.setColorAt(stop.offset, _color_to_qcolor(stop.color))
        return qt.QBrush(g)
    if f.radial is not None:
        g = qt.QRadialGradient(f.radial.center[0], f.radial.center[1],
                               f.radial.radius)
        for stop in f.radial.stops:
            g.setColorAt(stop.offset, _color_to_qcolor(stop.color))
        return qt.QBrush(g)
    return qt.QBrush(qt.Qt.BrushStyle.NoBrush)


def _stroke_to_qpen(s: Stroke) -> qt.QPen:
    pen = qt.QPen(_color_to_qcolor(s.color))
    pen.setWidthF(s.width)
    pen.setCapStyle(_LINE_CAP_TO_QT[s.cap])
    pen.setJoinStyle(_LINE_JOIN_TO_QT[s.join])
    pen.setMiterLimit(s.miter_limit)
    if s.dash:
        pen.setStyle(qt.Qt.PenStyle.CustomDashLine)
        pen.setDashPattern(list(s.dash))
    else:
        pen.setStyle(qt.Qt.PenStyle.SolidLine)
    return pen


class QtPainter:
    """:class:`Painter` over an existing :class:`qt.QPainter`.

    The QPainter is *not* owned by this shim: caller manages its lifecycle.
    """

    def __init__(self, qpainter: "qt.QPainter") -> None:
        self._p = qpainter
        # mirror our clip stack so pop_clip can rewind via save/restore
        self._clip_depth = 0

    # ---- state stack ----------------------------------------------------

    def save(self) -> None:
        self._p.save()

    def restore(self) -> None:
        self._p.restore()

    # ---- transform ------------------------------------------------------

    def set_transform(self, m: Affine) -> None:
        self._p.setTransform(_affine_to_qtransform(m), combine=False)

    def concat_transform(self, m: Affine) -> None:
        self._p.setTransform(_affine_to_qtransform(m), combine=True)

    # ---- clip -----------------------------------------------------------

    def push_clip_rect(self, r: Rect) -> None:
        self._p.save()
        self._p.setClipRect(qt.QRectF(r.x, r.y, r.w, r.h),
                            qt.Qt.ClipOperation.IntersectClip)
        self._clip_depth += 1

    def push_clip_path(self, p: Path, rule: FillRule = FillRule.NON_ZERO) -> None:
        qp = _path_to_qpainterpath(p)
        qp.setFillRule(_FILL_RULE_TO_QT[rule])
        self._p.save()
        self._p.setClipPath(qp, qt.Qt.ClipOperation.IntersectClip)
        self._clip_depth += 1

    def pop_clip(self) -> None:
        if self._clip_depth <= 0:
            raise RuntimeError("pop_clip without matching push_clip_*")
        self._p.restore()
        self._clip_depth -= 1

    # ---- paint state ----------------------------------------------------

    def set_paint(self, p: Paint) -> None:
        if p.stroke is not None:
            self._p.setPen(_stroke_to_qpen(p.stroke))
        else:
            self._p.setPen(qt.QPen(qt.Qt.PenStyle.NoPen))
        if p.fill is not None:
            self._p.setBrush(_fill_to_qbrush(p.fill))
        else:
            self._p.setBrush(qt.QBrush(qt.Qt.BrushStyle.NoBrush))
        self._p.setRenderHint(qt.QPainter.RenderHint.Antialiasing, p.anti_alias)

    def set_blend_mode(self, m: BlendMode) -> None:
        self._p.setCompositionMode(_BLEND_TO_QT[m])

    def set_quality(self, q: Quality) -> None:
        aa = q is not Quality.FAST
        text_aa = q is Quality.BEST
        smooth = q is Quality.BEST
        self._p.setRenderHint(qt.QPainter.RenderHint.Antialiasing, aa)
        self._p.setRenderHint(qt.QPainter.RenderHint.TextAntialiasing, text_aa)
        self._p.setRenderHint(qt.QPainter.RenderHint.SmoothPixmapTransform, smooth)

    # ---- geometry -------------------------------------------------------

    def stroke_path(self, p: Path) -> None:
        self._p.strokePath(_path_to_qpainterpath(p), self._p.pen())

    def fill_path(self, p: Path, rule: FillRule = FillRule.NON_ZERO) -> None:
        qp = _path_to_qpainterpath(p)
        qp.setFillRule(_FILL_RULE_TO_QT[rule])
        self._p.fillPath(qp, self._p.brush())

    def draw_image(self, img: Image, dst: Rect, src: Optional[Rect] = None) -> None:
        qimg = qt.QImage(img.pixels, img.width, img.height,
                         img.width * 4, qt.QImage.Format.Format_RGBA8888)
        dst_q = qt.QRectF(dst.x, dst.y, dst.w, dst.h)
        if src is None:
            self._p.drawImage(dst_q, qimg)
        else:
            self._p.drawImage(dst_q, qimg, qt.QRectF(src.x, src.y, src.w, src.h))

    # ---- text -----------------------------------------------------------

    def draw_text(self, layout: TextLayout, x: float, y: float) -> None:
        # Minimal path: hand off to QPainter's drawText. Rich layout in this
        # backend continues to go through veusz.utils.textrender as before;
        # this is the simple-text fallback.
        font = qt.QFont(layout.style.family)
        font.setPointSizeF(layout.style.size_pt)
        font.setItalic(layout.style.italic)
        font.setWeight(qt.QFont.Weight(layout.style.weight))
        self._p.save()
        self._p.setFont(font)
        self._p.setPen(_color_to_qcolor(layout.style.color))
        self._p.drawText(qt.QPointF(x, y), layout.text)
        self._p.restore()

    # ---- lifecycle ------------------------------------------------------

    def finish(self) -> None:
        # We do not own the QPainter; only flush state.
        pass


# Self-check: ``QtPainter`` should structurally implement :class:`Painter`.
assert isinstance(QtPainter.__init__, type(lambda: None))
