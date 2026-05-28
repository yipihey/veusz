"""Pure translators from QPainter-style args to abstract Painter values.

This module knows how to turn a ``QPen``, ``QBrush``, ``QPainterPath``,
``QTransform``, ``QImage`` (etc.) into the matching values in
:mod:`veusz.paint.protocol`. Everything is duck-typed: the functions accept
"anything with the right methods", which makes them unit-testable without
PyQt6 installed (the test suite passes pure Python mocks).

The :class:`SceneCapturingPainter` in :mod:`veusz.paint.qt_capture` uses
these to translate every QPainter call into a Scene op.
"""

from __future__ import annotations

from typing import Optional

from .protocol import (
    Affine,
    BlendMode,
    Color,
    Fill,
    FillRule,
    GradientStop,
    Image,
    LinearGradient,
    LineCap,
    LineJoin,
    Paint,
    Path,
    PathVerb,
    Quality,
    RadialGradient,
    Rect,
    Stroke,
    TextLayout,
    TextStyle,
)


# Qt::PenStyle enum values (stable across Qt 5/6).
QT_PEN_NO_PEN = 0
QT_PEN_SOLID = 1
QT_PEN_CUSTOM_DASH = 6

# Qt::PenCapStyle (high byte of the pen flag space).
_QT_CAP_TO_LINECAP = {
    0x00: LineCap.BUTT,    # FlatCap
    0x10: LineCap.SQUARE,  # SquareCap
    0x20: LineCap.ROUND,   # RoundCap
}
_QT_JOIN_TO_LINEJOIN = {
    0x00: LineJoin.MITER,  # MiterJoin
    0x40: LineJoin.BEVEL,  # BevelJoin
    0x80: LineJoin.ROUND,  # RoundJoin
    0x100: LineJoin.MITER, # SvgMiterJoin — same as MiterJoin for our purposes
}

# Qt::BrushStyle.
QT_BRUSH_NO_BRUSH = 0
QT_BRUSH_SOLID = 1
QT_BRUSH_LINEAR_GRADIENT = 15
QT_BRUSH_RADIAL_GRADIENT = 16
QT_BRUSH_CONICAL_GRADIENT = 17

# Qt::CompositionMode.
QT_COMP_SOURCE_OVER = 0
QT_COMP_MULTIPLY = 13
QT_COMP_PLUS = 21
_COMP_MAP = {
    QT_COMP_SOURCE_OVER: BlendMode.SOURCE_OVER,
    QT_COMP_MULTIPLY: BlendMode.MULTIPLY,
    QT_COMP_PLUS: BlendMode.PLUS,
}

# QPainterPath element types.
PATH_MOVE = 0
PATH_LINE = 1
PATH_CURVE = 2
PATH_CURVE_DATA = 3

# QImage::Format we recognise.
QIMG_FMT_ARGB32 = 5
QIMG_FMT_ARGB32_PREMULTIPLIED = 6
QIMG_FMT_RGBA8888 = 17


# ---------------------------------------------------------------------------
# Primitive translators
# ---------------------------------------------------------------------------

def qcolor_to_color(c) -> Color:
    """``QColor`` -> :class:`Color`. Reads via ``redF/greenF/blueF/alphaF``."""
    return Color(float(c.redF()), float(c.greenF()),
                 float(c.blueF()), float(c.alphaF()))


def qtransform_to_affine(t) -> Affine:
    """``QTransform`` -> :class:`Affine`.

    Qt stores: ``[m11 m12 m13; m21 m22 m23; m31 m32 m33]``. We use the
    non-projective subset (``m13 == m23 == 0``, ``m33 == 1``). Mapping:
    a=m11, b=m12, c=m21, d=m22, e=m31, f=m32.
    """
    return Affine(
        float(t.m11()), float(t.m12()),
        float(t.m21()), float(t.m22()),
        float(t.m31()), float(t.m32()),
    )


def _enum_int(v) -> int:
    """Coerce a PyQt6 enum member or a raw int to int. PyQt6 returns enum
    members with `.value`; PyQt5 / mocks return raw ints; we accept both."""
    return int(v.value) if hasattr(v, "value") else int(v)


def qpen_to_stroke(pen) -> Optional[Stroke]:
    """``QPen`` -> :class:`Stroke`, or ``None`` if the pen is NoPen."""
    style = _enum_int(pen.style())
    if style == QT_PEN_NO_PEN:
        return None
    dash = None
    if style == QT_PEN_CUSTOM_DASH:
        dash = tuple(float(x) for x in pen.dashPattern())
    elif style != QT_PEN_SOLID:
        # Qt's named dash styles (DashLine, DotLine, etc.). Use the
        # synthetic dashPattern() Qt produces; if it's non-trivial, capture.
        dash_list = list(pen.dashPattern())
        if dash_list:
            dash = tuple(float(x) for x in dash_list)
    return Stroke(
        color=qcolor_to_color(pen.color()),
        width=float(pen.widthF()),
        dash=dash,
        cap=_QT_CAP_TO_LINECAP.get(_enum_int(pen.capStyle()), LineCap.BUTT),
        join=_QT_JOIN_TO_LINEJOIN.get(_enum_int(pen.joinStyle()), LineJoin.MITER),
        miter_limit=float(pen.miterLimit()),
    )


def qbrush_to_fill(brush) -> Optional[Fill]:
    """``QBrush`` -> :class:`Fill`, or ``None`` for NoBrush."""
    style = _enum_int(brush.style())
    if style == QT_BRUSH_NO_BRUSH:
        return None
    if style == QT_BRUSH_LINEAR_GRADIENT:
        g = brush.gradient()
        stops = tuple(
            GradientStop(offset=float(off), color=qcolor_to_color(c))
            for off, c in g.stops()
        )
        return Fill(linear=LinearGradient(
            start=(float(g.start().x()), float(g.start().y())),
            end=(float(g.finalStop().x()), float(g.finalStop().y())),
            stops=stops,
        ))
    if style == QT_BRUSH_RADIAL_GRADIENT:
        g = brush.gradient()
        stops = tuple(
            GradientStop(offset=float(off), color=qcolor_to_color(c))
            for off, c in g.stops()
        )
        return Fill(radial=RadialGradient(
            center=(float(g.center().x()), float(g.center().y())),
            radius=float(g.radius()),
            stops=stops,
        ))
    # Conical gradients and pattern brushes are not core (see audit, Edge
    # tier). Approximate with the brush's solid color so output is still
    # plausible until a real conversion lands.
    return Fill(solid=qcolor_to_color(brush.color()))


def qpath_to_path(qpath) -> Path:
    """``QPainterPath`` -> :class:`Path`.

    Walks the element stream. Qt represents cubic Béziers as one ``CurveTo``
    element followed by two ``CurveToData`` elements (the two control points
    + endpoint). We assemble those into one CubicTo verb.
    """
    p = Path()
    n = qpath.elementCount()
    i = 0
    while i < n:
        el = qpath.elementAt(i)
        t = _enum_int(el.type)
        if t == PATH_MOVE:
            p.move_to(float(el.x), float(el.y)); i += 1
        elif t == PATH_LINE:
            p.line_to(float(el.x), float(el.y)); i += 1
        elif t == PATH_CURVE:
            # Two CurveToData elements follow.
            c1 = qpath.elementAt(i + 1)
            c2 = qpath.elementAt(i + 2)
            # The CurveTo element is the *first control point*; the endpoint
            # is the second CurveToData. Wait — Qt's convention is:
            # element[i]   = CurveTo with first control point
            # element[i+1] = CurveToData with second control point
            # element[i+2] = CurveToData with endpoint
            # So:
            p.cubic_to(
                float(el.x), float(el.y),     # first control
                float(c1.x), float(c1.y),     # second control
                float(c2.x), float(c2.y),     # endpoint
            )
            i += 3
        else:
            # PATH_CURVE_DATA in isolation shouldn't happen at top level.
            i += 1
    # Qt doesn't explicitly mark sub-path closure inside the element stream
    # at the API surface we use — closed sub-paths are represented by a
    # final LineTo back to the starting point. So no explicit Close verb.
    return p


def qimage_to_image(qimg) -> Image:
    """``QImage`` (RGBA-ish) -> :class:`Image` (straight-alpha RGBA8).

    Caller is responsible for ensuring the format is one of ARGB32,
    ARGB32_Premultiplied, or RGBA8888. The function normalises to straight
    alpha RGBA8.
    """
    fmt = _enum_int(qimg.format())
    w = qimg.width()
    h = qimg.height()
    if fmt not in (QIMG_FMT_ARGB32, QIMG_FMT_ARGB32_PREMULTIPLIED, QIMG_FMT_RGBA8888):
        # convertToFormat (or qimg.convertedTo) — but at the duck-typed level
        # we can't call that without Qt enums imported. Defer to caller via
        # explicit conversion if needed; bail with an empty Image.
        return Image(width=w, height=h, pixels=b"\x00" * (4 * w * h))

    if fmt == QIMG_FMT_RGBA8888:
        bits = bytes(qimg.constBits().asarray(4 * w * h))
        return Image(width=w, height=h, pixels=bits)

    # ARGB32 / ARGB32_Premultiplied are stored as 0xAARRGGBB in native
    # endianness, i.e. bytes [B, G, R, A] on little-endian. Swap to RGBA8.
    src = bytes(qimg.constBits().asarray(4 * w * h))
    out = bytearray(len(src))
    if fmt == QIMG_FMT_ARGB32_PREMULTIPLIED:
        # Un-premultiply on the way out.
        for i in range(0, len(src), 4):
            b, g, r, a = src[i], src[i + 1], src[i + 2], src[i + 3]
            if a == 0:
                out[i] = out[i + 1] = out[i + 2] = 0
            else:
                out[i]     = min(255, (r * 255 + a // 2) // a)
                out[i + 1] = min(255, (g * 255 + a // 2) // a)
                out[i + 2] = min(255, (b * 255 + a // 2) // a)
            out[i + 3] = a
    else:  # ARGB32 — already straight alpha; just BGRA -> RGBA.
        for i in range(0, len(src), 4):
            out[i]     = src[i + 2]
            out[i + 1] = src[i + 1]
            out[i + 2] = src[i]
            out[i + 3] = src[i + 3]
    return Image(width=w, height=h, pixels=bytes(out))


def composition_mode_to_blend(mode_int) -> BlendMode:
    """Qt's CompositionMode enum int -> :class:`BlendMode`.

    Falls back to ``SOURCE_OVER`` for modes outside the audited set.
    """
    return _COMP_MAP.get(_enum_int(mode_int), BlendMode.SOURCE_OVER)


def render_hints_to_quality(hints_int: int, *,
                            antialiasing_bit: int = 0x01,
                            text_aa_bit: int = 0x02,
                            smooth_pixmap_bit: int = 0x04) -> Quality:
    """Qt's RenderHints flag set -> coarse :class:`Quality` enum."""
    if (hints_int & smooth_pixmap_bit) and (hints_int & text_aa_bit):
        return Quality.BEST
    if hints_int & antialiasing_bit:
        return Quality.BALANCED
    return Quality.FAST


# ---------------------------------------------------------------------------
# Convenience: pen+brush -> Paint
# ---------------------------------------------------------------------------

def pen_brush_to_paint(pen, brush, *, anti_alias: bool = True) -> Paint:
    """Compose a :class:`Paint` from a (pen, brush) pair as Qt holds them.

    Each side may be ``None`` (NoPen / NoBrush). The :class:`Paint`'s
    ``stroke`` / ``fill`` are set accordingly.
    """
    return Paint(
        stroke=qpen_to_stroke(pen) if pen is not None else None,
        fill=qbrush_to_fill(brush) if brush is not None else None,
        anti_alias=anti_alias,
    )


# ---------------------------------------------------------------------------
# Lightweight rect helpers
# ---------------------------------------------------------------------------

def qrectf_to_rect(qrect) -> Rect:
    return Rect(float(qrect.x()), float(qrect.y()),
                float(qrect.width()), float(qrect.height()))


# Expose the fill rule constants for callers translating QPath::fillRule.
QT_FILL_RULE_ODD_EVEN = 0
QT_FILL_RULE_WINDING = 1


def qfill_rule_to_fill_rule(rule_int) -> FillRule:
    return FillRule.EVEN_ODD if _enum_int(rule_int) == QT_FILL_RULE_ODD_EVEN else FillRule.NON_ZERO


# ---------------------------------------------------------------------------
# Text
# ---------------------------------------------------------------------------

def qfont_to_text_style(font, color: Color, dpi: float = 96.0) -> TextStyle:
    """``QFont`` + draw colour -> :class:`TextStyle`.

    ``size_pt`` is expressed in *device pixels* (what the Scene text engine
    treats as the glyph size): ``pixelSize()`` when set, otherwise
    ``pointSizeF`` scaled by the device dpi (px = pt * dpi / 72)."""
    px = float(font.pixelSize())
    if px <= 0:
        pt = float(font.pointSizeF())
        if pt <= 0:
            pt = 10.0
        px = pt * float(dpi) / 72.0
    # Qt6 QFont.weight() is on the CSS 1..1000 scale (Normal=400, Bold=700).
    try:
        weight = _enum_int(font.weight())
    except Exception:
        weight = 700 if font.bold() else 400
    return TextStyle(
        family=str(font.family()) or "sans-serif",
        size_pt=px,
        weight=int(weight),
        italic=bool(font.italic()),
        color=color,
    )


def text_layout(text: str, font, color: Color, dpi: float = 96.0) -> TextLayout:
    """Build a :class:`TextLayout` from a string + ``QFont`` + colour."""
    return TextLayout(text=str(text),
                      style=qfont_to_text_style(font, color, dpi))


# ---------------------------------------------------------------------------
# Ellipse
# ---------------------------------------------------------------------------

_ELLIPSE_KAPPA = 0.5522847498307936  # 4/3 * (sqrt(2) - 1)


def ellipse_path(cx: float, cy: float, rx: float, ry: float) -> Path:
    """A closed ellipse centred at ``(cx, cy)`` with radii ``(rx, ry)`` as
    four cubic Bézier segments — the standard kappa approximation."""
    kx, ky = _ELLIPSE_KAPPA * rx, _ELLIPSE_KAPPA * ry
    p = Path()
    p.move_to(cx + rx, cy)
    p.cubic_to(cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry)
    p.cubic_to(cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy)
    p.cubic_to(cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry)
    p.cubic_to(cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy)
    p.close()
    return p


# Self-export of the FillRule for callers that don't want to import twice.
__all__ = [
    "qcolor_to_color", "qtransform_to_affine",
    "qpen_to_stroke", "qbrush_to_fill",
    "qpath_to_path", "qimage_to_image",
    "qrectf_to_rect", "pen_brush_to_paint",
    "composition_mode_to_blend", "render_hints_to_quality",
    "qfill_rule_to_fill_rule",
    "qfont_to_text_style", "text_layout", "ellipse_path",
    "FillRule",  # convenience re-export
]
