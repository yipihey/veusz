"""The abstract Painter interface — Python mirror of the Rust trait.

Operations follow the audit in ``docs/qpainter-audit.md``. The interface is
deliberately small: ~12 core operations plus a unified :class:`Paint` state
value that fuses what QPainter splits between ``setPen`` and ``setBrush``.
Backends translate each operation to their native primitives.

This module has no Qt dependency. The Qt-backed implementation lives in
:mod:`veusz.paint.qt_backend`.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Protocol, Sequence, runtime_checkable


# ---------------------------------------------------------------------------
# Value types
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Color:
    """Linear-sRGB color with straight alpha. Channels are 0..1."""
    r: float
    g: float
    b: float
    a: float = 1.0

    @classmethod
    def rgba8(cls, r: int, g: int, b: int, a: int = 255) -> "Color":
        return cls(r / 255.0, g / 255.0, b / 255.0, a / 255.0)


@dataclass(frozen=True)
class Affine:
    """2x3 affine matrix in column-major order: [a c e; b d f; 0 0 1]."""
    a: float = 1.0
    b: float = 0.0
    c: float = 0.0
    d: float = 1.0
    e: float = 0.0
    f: float = 0.0

    @classmethod
    def identity(cls) -> "Affine":
        return cls()

    @classmethod
    def translate(cls, tx: float, ty: float) -> "Affine":
        return cls(1.0, 0.0, 0.0, 1.0, tx, ty)

    @classmethod
    def scale(cls, sx: float, sy: float) -> "Affine":
        return cls(sx, 0.0, 0.0, sy, 0.0, 0.0)


@dataclass(frozen=True)
class Rect:
    x: float
    y: float
    w: float
    h: float


class FillRule(Enum):
    NON_ZERO = "non_zero"
    EVEN_ODD = "even_odd"


class LineCap(Enum):
    BUTT = "butt"
    ROUND = "round"
    SQUARE = "square"


class LineJoin(Enum):
    MITER = "miter"
    ROUND = "round"
    BEVEL = "bevel"


class BlendMode(Enum):
    """The blend modes Veusz actually uses (see audit, §3.x). Extend only
    after a dynamic-pass audit demonstrates a real need."""
    SOURCE_OVER = "source_over"
    MULTIPLY = "multiply"
    PLUS = "plus"


class Quality(Enum):
    """Coarse rendering hint, replaces QPainter's setRenderHint bitset."""
    FAST = "fast"            # no AA
    BALANCED = "balanced"    # geometry AA
    BEST = "best"            # geometry AA + text AA + smooth pixmap


# ---------------------------------------------------------------------------
# Fill / Stroke / Paint
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class GradientStop:
    offset: float  # 0..1
    color: Color


@dataclass(frozen=True)
class LinearGradient:
    start: tuple  # (x, y)
    end: tuple
    stops: tuple  # tuple[GradientStop, ...]


@dataclass(frozen=True)
class RadialGradient:
    center: tuple
    radius: float
    stops: tuple


@dataclass(frozen=True)
class Fill:
    """A fill is one of: solid color, linear gradient, radial gradient."""
    solid: Optional[Color] = None
    linear: Optional[LinearGradient] = None
    radial: Optional[RadialGradient] = None

    def __post_init__(self):
        if sum(x is not None for x in (self.solid, self.linear, self.radial)) != 1:
            raise ValueError("Fill must specify exactly one variant")


@dataclass(frozen=True)
class Stroke:
    color: Color
    width: float = 1.0
    dash: Optional[tuple] = None  # tuple[float, ...] in user units; None = solid
    cap: LineCap = LineCap.BUTT
    join: LineJoin = LineJoin.MITER
    miter_limit: float = 4.0


@dataclass(frozen=True)
class Paint:
    """Fused fill + stroke. Either or both may be None.

    For a pure-fill operation pass only ``fill``; for a pure-stroke operation
    pass only ``stroke``. ``draw_path`` honors whichever sides are set.
    """
    fill: Optional[Fill] = None
    stroke: Optional[Stroke] = None
    anti_alias: bool = True


# ---------------------------------------------------------------------------
# Path
# ---------------------------------------------------------------------------

class PathVerb(Enum):
    MOVE_TO = "move_to"
    LINE_TO = "line_to"
    QUAD_TO = "quad_to"
    CUBIC_TO = "cubic_to"
    CLOSE = "close"


@dataclass
class Path:
    """An immutable-after-build path described as a verb + coord stream.

    Use the builder methods to construct, then pass to Painter operations.
    """
    verbs: list = field(default_factory=list)
    points: list = field(default_factory=list)  # flat [x0, y0, x1, y1, ...]

    def move_to(self, x: float, y: float) -> "Path":
        self.verbs.append(PathVerb.MOVE_TO)
        self.points.extend((x, y))
        return self

    def line_to(self, x: float, y: float) -> "Path":
        self.verbs.append(PathVerb.LINE_TO)
        self.points.extend((x, y))
        return self

    def quad_to(self, cx: float, cy: float, x: float, y: float) -> "Path":
        self.verbs.append(PathVerb.QUAD_TO)
        self.points.extend((cx, cy, x, y))
        return self

    def cubic_to(self, c1x: float, c1y: float, c2x: float, c2y: float,
                 x: float, y: float) -> "Path":
        self.verbs.append(PathVerb.CUBIC_TO)
        self.points.extend((c1x, c1y, c2x, c2y, x, y))
        return self

    def close(self) -> "Path":
        self.verbs.append(PathVerb.CLOSE)
        return self

    # convenience constructors
    @classmethod
    def line(cls, x1: float, y1: float, x2: float, y2: float) -> "Path":
        return cls().move_to(x1, y1).line_to(x2, y2)

    @classmethod
    def rect(cls, r: Rect) -> "Path":
        p = cls().move_to(r.x, r.y)
        p.line_to(r.x + r.w, r.y)
        p.line_to(r.x + r.w, r.y + r.h)
        p.line_to(r.x, r.y + r.h)
        return p.close()

    @classmethod
    def polyline(cls, points: Sequence[float], closed: bool = False) -> "Path":
        """``points`` is a flat [x0, y0, x1, y1, ...] sequence."""
        if len(points) < 4 or len(points) % 2:
            raise ValueError("polyline needs an even count >= 4")
        p = cls().move_to(points[0], points[1])
        for i in range(2, len(points), 2):
            p.line_to(points[i], points[i + 1])
        if closed:
            p.close()
        return p


# ---------------------------------------------------------------------------
# Text — placeholder until the Parley+Swash path lands
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class TextStyle:
    family: str = "sans-serif"
    size_pt: float = 10.0
    weight: int = 400        # CSS scale; 400 normal, 700 bold
    italic: bool = False
    color: Color = field(default_factory=lambda: Color(0.0, 0.0, 0.0, 1.0))


@dataclass(frozen=True)
class TextLayout:
    """Opaque to widget code. Backends own the laid-out form internally.

    For the Qt backend this carries a raw string and we delegate layout to
    QTextLayout via the existing :mod:`veusz.utils.textrender` path. The
    tiny-skia and Vello backends will replace this with a Parley result.
    """
    text: str
    style: TextStyle


# ---------------------------------------------------------------------------
# Image — minimal, premultiplied RGBA8 only
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Image:
    """RGBA8, row-major, straight (un-premultiplied) alpha."""
    width: int
    height: int
    pixels: bytes  # len == width * height * 4


# ---------------------------------------------------------------------------
# Painter protocol
# ---------------------------------------------------------------------------

@runtime_checkable
class Painter(Protocol):
    """The single interface every backend implements.

    The shape mirrors ``trait Painter`` in ``veusz-paint-core``. Keep this
    file and the Rust crate in lockstep when either changes.
    """

    # ---- state stack ----------------------------------------------------
    def save(self) -> None: ...
    def restore(self) -> None: ...

    # ---- transform ------------------------------------------------------
    def set_transform(self, m: Affine) -> None: ...
    def concat_transform(self, m: Affine) -> None: ...

    # ---- clip -----------------------------------------------------------
    def push_clip_rect(self, r: Rect) -> None: ...
    def push_clip_path(self, p: Path, rule: FillRule = FillRule.NON_ZERO) -> None: ...
    def pop_clip(self) -> None: ...

    # ---- paint state ----------------------------------------------------
    def set_paint(self, p: Paint) -> None: ...
    def set_blend_mode(self, m: BlendMode) -> None: ...
    def set_quality(self, q: Quality) -> None: ...

    # ---- geometry -------------------------------------------------------
    def stroke_path(self, p: Path) -> None: ...
    def fill_path(self, p: Path, rule: FillRule = FillRule.NON_ZERO) -> None: ...
    def draw_image(self, img: Image, dst: Rect, src: Optional[Rect] = None) -> None: ...

    # ---- text -----------------------------------------------------------
    def draw_text(self, layout: TextLayout, x: float, y: float) -> None: ...

    # ---- lifecycle ------------------------------------------------------
    def finish(self) -> None: ...
