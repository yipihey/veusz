"""A pure-Python stand-in for the slice of Qt that Veusz's *headless* model +
Vello scene-capture path actually use — no PyQt6, no C++.

Why this exists
---------------
In the browser (Pyodide) there is no Qt. But Veusz never needs Qt's *painter*
to produce output for the web: the Vello/WASM renderer rasterises an abstract
:class:`~veusz.paint.protocol.Scene`, and that Scene is built by
``veusz.paint.qt_capture`` intercepting QPainter calls. So all Qt has to
provide for the capture path is:

* value/geometry types as data carriers (QColor/QPen/QBrush/QFont/QPointF/
  QRectF/QTransform/QPainterPath/…), read by ``veusz.paint.qt_translate``;
* a ``QPainter`` *state machine* (pen/brush/font/transform/clip + save/restore)
  that ``SceneCapturingPainter`` subclasses — its draw methods are no-ops here
  because recording happens in the Python overrides;
* ``QFontMetricsF`` for text layout, backed by fonttools reading the *same*
  TTF the Vello renderer draws with (so layout and glyphs agree exactly);
* a real ``pyqtSignal`` (connect/emit) for the document's change signals.

Everything GUI (QtWidgets controls, dialogs, printing, SVG) is intentionally
absent; a forgiving ``__getattr__`` returns inert stubs for the long tail so
imports don't explode, while the load-bearing types above are real.

This module is wired in by making ``veusz.qtall`` import from it when PyQt6 is
unavailable (see qtall). For the desktop app PyQt6 is still used unchanged.
"""

from __future__ import annotations

import math
import os


# ---------------------------------------------------------------------------
# Enums — int subclass carrying a .value (PyQt6-style) and a name.
# ---------------------------------------------------------------------------

class _E(int):
    def __new__(cls, val, name=""):
        o = int.__new__(cls, val)
        o._name = name
        return o

    @property
    def value(self):
        return int(self)

    def __or__(self, other):
        return _E(int(self) | int(other), "")

    __ror__ = __or__

    def __getattr__(self, name):
        # Tolerate unknown nested enum access, e.g. Qt.CursorShape.WaitCursor
        # where CursorShape isn't a defined namespace.
        return _E(0, name)

    def __repr__(self):
        return f"_E({int(self)},{self._name!r})"


class _EnumNamespace:
    """A scoped enum (e.g. Qt.PenStyle) that also tolerates unknown members."""

    def __init__(self, **members):
        self.__dict__.update(members)

    def __getattr__(self, name):
        # Unknown enum member -> inert 0 (keeps imports/lookups alive).
        return _E(0, name)


class _QtMeta(type):
    # Allow both scoped (Qt.PenStyle.SolidLine) and flat (Qt.SolidLine), and
    # tolerate unknown enum names without crashing model import.
    def __getattr__(cls, name):
        for ns in cls._namespaces:
            if name in ns.__dict__:
                return ns.__dict__[name]
        return _E(0, name)


class Qt(metaclass=_QtMeta):
    PenStyle = _EnumNamespace(
        NoPen=_E(0, "NoPen"), SolidLine=_E(1, "SolidLine"),
        DashLine=_E(2, "DashLine"), DotLine=_E(3, "DotLine"),
        DashDotLine=_E(4, "DashDotLine"), DashDotDotLine=_E(5, "DashDotDotLine"),
        CustomDashLine=_E(6, "CustomDashLine"),
    )
    PenCapStyle = _EnumNamespace(
        FlatCap=_E(0x00, "FlatCap"), SquareCap=_E(0x10, "SquareCap"),
        RoundCap=_E(0x20, "RoundCap"),
    )
    PenJoinStyle = _EnumNamespace(
        MiterJoin=_E(0x00, "MiterJoin"), BevelJoin=_E(0x40, "BevelJoin"),
        RoundJoin=_E(0x80, "RoundJoin"), SvgMiterJoin=_E(0x100, "SvgMiterJoin"),
    )
    BrushStyle = _EnumNamespace(
        NoBrush=_E(0, "NoBrush"), SolidPattern=_E(1, "SolidPattern"),
        Dense1Pattern=_E(2), Dense2Pattern=_E(3), Dense3Pattern=_E(4),
        Dense4Pattern=_E(5), Dense5Pattern=_E(6), Dense6Pattern=_E(7),
        Dense7Pattern=_E(8), HorPattern=_E(9), VerPattern=_E(10),
        CrossPattern=_E(11), BDiagPattern=_E(12), FDiagPattern=_E(13),
        DiagCrossPattern=_E(14), LinearGradientPattern=_E(15, "LinearGradientPattern"),
        RadialGradientPattern=_E(16, "RadialGradientPattern"),
        ConicalGradientPattern=_E(17, "ConicalGradientPattern"),
    )
    FillRule = _EnumNamespace(OddEvenFill=_E(0, "OddEvenFill"),
                             WindingFill=_E(1, "WindingFill"))
    AlignmentFlag = _EnumNamespace(
        AlignLeft=_E(1), AlignRight=_E(2), AlignHCenter=_E(4),
        AlignJustify=_E(8), AlignTop=_E(0x20), AlignBottom=_E(0x40),
        AlignVCenter=_E(0x80), AlignCenter=_E(0x84),
    )
    GlobalColor = _EnumNamespace(
        black=_E(2), white=_E(3), transparent=_E(19),
    )
    PenStyle._name = "PenStyle"


Qt._namespaces = (Qt.PenStyle, Qt.PenCapStyle, Qt.PenJoinStyle, Qt.BrushStyle,
                  Qt.FillRule, Qt.AlignmentFlag, Qt.GlobalColor)


# ---------------------------------------------------------------------------
# Signals (the one piece of real behaviour the model needs)
# ---------------------------------------------------------------------------

class _BoundSignal:
    def __init__(self):
        self._slots = []

    def connect(self, fn):
        self._slots.append(fn)

    def disconnect(self, fn=None):
        if fn is None:
            self._slots.clear()
        else:
            try:
                self._slots.remove(fn)
            except ValueError:
                pass

    def emit(self, *args):
        for fn in list(self._slots):
            fn(*args)


class pyqtSignal:
    def __init__(self, *types, name=None):
        self.types = types
        self._name = name or "signal"

    def __set_name__(self, owner, name):
        self._name = name

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        store = obj.__dict__.setdefault("_shim_signals", {})
        if self._name not in store:
            store[self._name] = _BoundSignal()
        return store[self._name]


def pyqtSlot(*a, **k):
    # PyQt usage is always @pyqtSlot(types…); the args are type specs, so this
    # always returns a decorator that leaves the method unchanged.
    def deco(fn):
        return fn
    return deco


def pyqtProperty(*a, **k):
    def deco(fn):
        return property(fn)
    return deco


class QObject:
    def __init__(self, parent=None, *a, **k):
        self._qparent = parent

    def parent(self):
        return self._qparent

    def setParent(self, p):
        self._qparent = p

    def blockSignals(self, b):
        return False

    def deleteLater(self):
        pass

    def objectName(self):
        return getattr(self, "_objname", "")

    def setObjectName(self, n):
        self._objname = n


# ---------------------------------------------------------------------------
# Geometry value types
# ---------------------------------------------------------------------------

class QPointF:
    def __init__(self, x=0.0, y=0.0):
        if hasattr(x, "x"):  # copy ctor
            self._x, self._y = float(x.x()), float(x.y())
        else:
            self._x, self._y = float(x), float(y)

    def x(self): return self._x
    def y(self): return self._y
    def setX(self, v): self._x = float(v)
    def setY(self, v): self._y = float(v)
    def __add__(self, o): return QPointF(self._x + o.x(), self._y + o.y())
    def __sub__(self, o): return QPointF(self._x - o.x(), self._y - o.y())
    def __mul__(self, s): return QPointF(self._x * s, self._y * s)


class QPoint(QPointF):
    def x(self): return int(self._x)
    def y(self): return int(self._y)


class QSizeF:
    def __init__(self, w=0.0, h=0.0):
        if hasattr(w, "width"):
            self._w, self._h = float(w.width()), float(w.height())
        else:
            self._w, self._h = float(w), float(h)

    def width(self): return self._w
    def height(self): return self._h
    def setWidth(self, v): self._w = float(v)
    def setHeight(self, v): self._h = float(v)
    # Qt's QSizeF supports componentwise +/- (used e.g. to pad contour-label
    # boxes by the font descent): add/subtract widths and heights.
    def __iadd__(self, o):
        self._w += o.width(); self._h += o.height(); return self
    def __isub__(self, o):
        self._w -= o.width(); self._h -= o.height(); return self
    def __add__(self, o): return QSizeF(self._w + o.width(), self._h + o.height())
    def __sub__(self, o): return QSizeF(self._w - o.width(), self._h - o.height())


class QSize(QSizeF):
    def width(self): return int(self._w)
    def height(self): return int(self._h)


class QRectF:
    def __init__(self, *a):
        if len(a) == 4:
            self._x, self._y, self._w, self._h = (float(v) for v in a)
        elif len(a) == 2 and hasattr(a[1], "width"):  # (QPointF, QSizeF)
            p, s = a
            self._x, self._y = float(p.x()), float(p.y())
            self._w, self._h = float(s.width()), float(s.height())
        elif len(a) == 2 and hasattr(a[0], "x"):  # (topLeft, bottomRight)
            p1, p2 = a
            self._x, self._y = float(p1.x()), float(p1.y())
            self._w, self._h = float(p2.x()) - self._x, float(p2.y()) - self._y
        elif len(a) == 1 and hasattr(a[0], "x"):  # copy
            r = a[0]
            self._x, self._y = float(r.x()), float(r.y())
            self._w, self._h = float(r.width()), float(r.height())
        else:
            self._x = self._y = self._w = self._h = 0.0

    def x(self): return self._x
    def y(self): return self._y
    def left(self): return self._x
    def top(self): return self._y
    def right(self): return self._x + self._w
    def bottom(self): return self._y + self._h
    def width(self): return self._w
    def height(self): return self._h
    def setLeft(self, v): self._w = self.right() - v; self._x = float(v)
    def setTop(self, v): self._h = self.bottom() - v; self._y = float(v)
    def setWidth(self, v): self._w = float(v)
    def setHeight(self, v): self._h = float(v)
    def setRect(self, x, y, w, h):
        self._x, self._y, self._w, self._h = float(x), float(y), float(w), float(h)
    def center(self): return QPointF(self._x + self._w / 2, self._y + self._h / 2)
    def topLeft(self): return QPointF(self._x, self._y)
    def bottomRight(self): return QPointF(self.right(), self.bottom())
    def translated(self, dx, dy): return QRectF(self._x + dx, self._y + dy, self._w, self._h)
    def adjusted(self, dl, dt, dr, db):
        return QRectF(self._x + dl, self._y + dt, self._w - dl + dr, self._h - dt + db)
    def normalized(self):
        x, y, w, h = self._x, self._y, self._w, self._h
        if w < 0: x, w = x + w, -w
        if h < 0: y, h = y + h, -h
        return QRectF(x, y, w, h)

    def intersected(self, o):
        x1 = max(self.left(), o.left()); y1 = max(self.top(), o.top())
        x2 = min(self.right(), o.right()); y2 = min(self.bottom(), o.bottom())
        if x2 < x1 or y2 < y1:
            return QRectF()
        return QRectF(x1, y1, x2 - x1, y2 - y1)

    __and__ = intersected

    def united(self, o):
        x1 = min(self.left(), o.left()); y1 = min(self.top(), o.top())
        x2 = max(self.right(), o.right()); y2 = max(self.bottom(), o.bottom())
        return QRectF(x1, y1, x2 - x1, y2 - y1)

    __or__ = united

    def intersects(self, o):
        return not (o.left() > self.right() or o.right() < self.left()
                    or o.top() > self.bottom() or o.bottom() < self.top())

    def contains(self, *a):
        if len(a) == 1 and hasattr(a[0], 'x') and not hasattr(a[0], 'width'):
            p = a[0]; px, py = p.x(), p.y()
        elif len(a) == 2:
            px, py = a
        elif len(a) == 1 and hasattr(a[0], 'width'):
            r = a[0]
            return (r.left() >= self.left() and r.right() <= self.right()
                    and r.top() >= self.top() and r.bottom() <= self.bottom())
        else:
            return False
        return (self.left() <= px <= self.right()
                and self.top() <= py <= self.bottom())

    def isEmpty(self):
        return self._w <= 0 or self._h <= 0

    def isvalid(self):
        return self._w > 0 and self._h > 0

    def getCoords(self):
        return (self.left(), self.top(), self.right(), self.bottom())

    def setCoords(self, x1, y1, x2, y2):
        self._x, self._y = float(x1), float(y1)
        self._w, self._h = float(x2) - float(x1), float(y2) - float(y1)

    def adjust(self, dl, dt, dr, db):
        self._x += dl; self._y += dt
        self._w += dr - dl; self._h += db - dt


class QRect(QRectF):
    def x(self): return int(self._x)
    def y(self): return int(self._y)
    def width(self): return int(self._w)
    def height(self): return int(self._h)


class QLineF:
    def __init__(self, *a):
        if len(a) == 4:
            self._x1, self._y1, self._x2, self._y2 = (float(v) for v in a)
        elif len(a) == 2:
            p1, p2 = a
            self._x1, self._y1 = float(p1.x()), float(p1.y())
            self._x2, self._y2 = float(p2.x()), float(p2.y())
        else:
            self._x1 = self._y1 = self._x2 = self._y2 = 0.0

    def x1(self): return self._x1
    def y1(self): return self._y1
    def x2(self): return self._x2
    def y2(self): return self._y2


class QPolygonF:
    def __init__(self, pts=None):
        self._pts = []
        if pts:
            for p in pts:
                self._pts.append(QPointF(p.x(), p.y()) if hasattr(p, "x") else QPointF(*p))

    def append(self, p): self._pts.append(p)
    def count(self): return len(self._pts)
    def at(self, i): return self._pts[i]
    def clear(self): self._pts = []
    def isEmpty(self): return not self._pts
    def boundingRect(self):
        if not self._pts:
            return QRectF()
        xs = [p.x() for p in self._pts]; ys = [p.y() for p in self._pts]
        return QRectF(min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys))
    def translate(self, dx, dy):
        for p in self._pts:
            p.setX(p.x() + dx); p.setY(p.y() + dy)
    def __len__(self): return len(self._pts)
    def __getitem__(self, i): return self._pts[i]
    def __iter__(self): return iter(self._pts)
    def __iadd__(self, other):
        # Mirror QPolygonF: `+=` concatenates another polygon's points, or
        # appends a single point. Needed by plotters that build filled regions
        # by joining polygons (else the browser qtshim raises a TypeError).
        if isinstance(other, QPolygonF):
            self._pts.extend(other._pts)
        else:
            self._pts.append(other)
        return self
    def __add__(self, other):
        result = QPolygonF(self._pts)
        result += other
        return result


QPolygon = QPolygonF


# ---------------------------------------------------------------------------
# Colour
# ---------------------------------------------------------------------------

_NAMED = {
    "black": (0, 0, 0), "white": (255, 255, 255), "red": (255, 0, 0),
    "green": (0, 128, 0), "blue": (0, 0, 255), "cyan": (0, 255, 255),
    "magenta": (255, 0, 255), "yellow": (255, 255, 0), "gray": (160, 160, 164),
    "grey": (160, 160, 164), "darkgray": (128, 128, 128), "lightgray": (211, 211, 211),
    "transparent": (0, 0, 0, 0), "darkred": (128, 0, 0), "darkgreen": (0, 100, 0),
    "darkblue": (0, 0, 128), "orange": (255, 165, 0), "purple": (128, 0, 128),
}


class QColor:
    def __init__(self, *a):
        self._r = self._g = self._b = 0
        self._a = 255
        self._valid = True
        if not a:
            self._valid = False
        elif len(a) == 1 and isinstance(a[0], str):
            self._from_string(a[0])
        elif len(a) == 1 and isinstance(a[0], QColor):
            c = a[0]
            self._r, self._g, self._b, self._a = c._r, c._g, c._b, c._a
        elif len(a) == 1 and isinstance(a[0], _E):
            nm = a[0]._name.lower()
            self._from_string(nm if nm else "black")
        elif len(a) >= 3:
            self._r, self._g, self._b = int(a[0]), int(a[1]), int(a[2])
            if len(a) >= 4:
                self._a = int(a[3])

    def _from_string(self, s):
        s = s.strip()
        if s.startswith("#"):
            h = s[1:]
            if len(h) == 6:
                self._r, self._g, self._b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
            elif len(h) == 8:  # #AARRGGBB
                self._a, self._r, self._g, self._b = (int(h[i:i + 2], 16) for i in (0, 2, 4, 6))
            elif len(h) == 3:
                self._r, self._g, self._b = (int(h[i] * 2, 16) for i in (0, 1, 2))
            return
        rgb = _NAMED.get(s.lower())
        if rgb is None:
            self._valid = False
            return
        self._r, self._g, self._b = rgb[0], rgb[1], rgb[2]
        if len(rgb) == 4:
            self._a = rgb[3]

    def isValid(self): return self._valid
    def red(self): return self._r
    def green(self): return self._g
    def blue(self): return self._b
    def alpha(self): return self._a
    def redF(self): return self._r / 255.0
    def greenF(self): return self._g / 255.0
    def blueF(self): return self._b / 255.0
    def alphaF(self): return self._a / 255.0
    def setRed(self, v): self._r = int(v)
    def setGreen(self, v): self._g = int(v)
    def setBlue(self, v): self._b = int(v)
    def setAlpha(self, v): self._a = int(v)
    def setAlphaF(self, v): self._a = max(0, min(255, round(float(v) * 255)))
    def setRgbF(self, r, g, b, a=1.0):
        self._r, self._g, self._b = (max(0, min(255, round(x * 255))) for x in (r, g, b))
        self._a = max(0, min(255, round(a * 255)))
        self._valid = True
    def setNamedColor(self, s): self._from_string(s);
    def getRgb(self): return (self._r, self._g, self._b, self._a)
    def rgb(self): return (0xff << 24) | (self._r << 16) | (self._g << 8) | self._b
    def rgba(self): return (self._a << 24) | (self._r << 16) | (self._g << 8) | self._b
    def name(self):
        return "#%02x%02x%02x" % (self._r, self._g, self._b)
    def lighter(self, factor=150):
        f = factor / 100.0
        return QColor(min(255, int(self._r * f)), min(255, int(self._g * f)),
                      min(255, int(self._b * f)), self._a)
    def darker(self, factor=200):
        f = 100.0 / factor
        return QColor(int(self._r * f), int(self._g * f), int(self._b * f), self._a)


# ---------------------------------------------------------------------------
# Pen / Brush / Font
# ---------------------------------------------------------------------------

class QPen:
    def __init__(self, *a):
        self._color = QColor("black")
        self._width = 1.0
        self._style = Qt.PenStyle.SolidLine
        self._cap = Qt.PenCapStyle.SquareCap
        self._join = Qt.PenJoinStyle.BevelJoin
        self._miter = 4.0
        self._dash = []
        if len(a) == 1:
            if isinstance(a[0], QColor):
                self._color = QColor(a[0])
            elif isinstance(a[0], QPen):
                p = a[0]
                self._color, self._width, self._style = QColor(p._color), p._width, p._style
                self._cap, self._join, self._miter, self._dash = p._cap, p._join, p._miter, list(p._dash)
            elif isinstance(a[0], (_E, int)):
                self._style = a[0]
        elif len(a) >= 3:
            self._color = QColor(a[0]) if isinstance(a[0], QColor) else QColor(a[0])
            self._width = float(a[1])
            self._style = a[2]

    def color(self): return self._color
    def setColor(self, c): self._color = c
    def widthF(self): return self._width
    def width(self): return int(self._width)
    def setWidthF(self, w): self._width = float(w)
    def setWidth(self, w): self._width = float(w)
    def style(self): return self._style
    def setStyle(self, s): self._style = s
    def capStyle(self): return self._cap
    def setCapStyle(self, c): self._cap = c
    def joinStyle(self): return self._join
    def setJoinStyle(self, j): self._join = j
    def miterLimit(self): return self._miter
    def setMiterLimit(self, m): self._miter = float(m)
    def dashPattern(self): return list(self._dash)
    def setDashPattern(self, d): self._dash = list(d); self._style = Qt.PenStyle.CustomDashLine


class QBrush:
    def __init__(self, *a):
        self._color = QColor("black")
        self._style = Qt.BrushStyle.NoBrush
        if len(a) == 1:
            if isinstance(a[0], QColor):
                self._color = QColor(a[0]); self._style = Qt.BrushStyle.SolidPattern
            elif isinstance(a[0], QBrush):
                self._color, self._style = QColor(a[0]._color), a[0]._style
            elif isinstance(a[0], (_E, int)):
                self._style = a[0]
        elif len(a) >= 2:
            self._color = QColor(a[0]) if isinstance(a[0], QColor) else QColor(a[0])
            self._style = a[1]

    def color(self): return self._color
    def setColor(self, c): self._color = c
    def style(self): return self._style
    def setStyle(self, s): self._style = s
    def gradient(self): return None


class QFont:
    class StyleHint(_EnumNamespace):
        pass
    StyleHint = _EnumNamespace(Times=_E(0), Helvetica=_E(0), SansSerif=_E(0),
                              Serif=_E(1), TypeWriter=_E(2))
    Weight = _EnumNamespace(Normal=_E(400), Bold=_E(700), Light=_E(300))

    def __init__(self, family="sans-serif", pointSize=-1, weight=-1, italic=False):
        self._family = str(family)
        self._pointsize = float(pointSize)
        self._pixelsize = -1.0
        self._weight = int(weight) if weight and weight > 0 else 400
        self._italic = bool(italic)
        self._stylename = ""

    def family(self): return self._family
    def setFamily(self, f): self._family = str(f)
    def pointSizeF(self): return self._pointsize
    def pointSize(self): return int(self._pointsize)
    def setPointSizeF(self, s): self._pointsize = float(s); self._pixelsize = -1.0
    def setPointSize(self, s): self._pointsize = float(s); self._pixelsize = -1.0
    def pixelSize(self): return self._pixelsize
    def setPixelSize(self, s): self._pixelsize = float(s); self._pointsize = -1.0
    def weight(self): return _E(self._weight)
    def setWeight(self, w): self._weight = int(w)
    def bold(self): return self._weight >= 700
    def setBold(self, b): self._weight = 700 if b else 400
    def italic(self): return self._italic
    def setItalic(self, i): self._italic = bool(i)
    def setStyleName(self, n): self._stylename = str(n)
    def styleName(self): return self._stylename
    def setStyleHint(self, *a, **k): pass


# ---------------------------------------------------------------------------
# Font metrics — fonttools-backed (validated to <=0.28% vs Qt)
# ---------------------------------------------------------------------------

# Default to the same TTF the Vello/WASM renderer draws with, so layout
# metrics and rendered glyphs agree. The font ships inside the package
# (veusz/embed_data) so it is available in a wheel/Pyodide; the dev-tree copy
# under veusz-tauri is a fallback. Overridable via VEUSZ_SHIM_FONT.
def _find_default_ttf():
    env = os.environ.get("VEUSZ_SHIM_FONT")
    if env and os.path.exists(env):
        return env
    here = os.path.dirname(__file__)
    candidates = (
        os.path.join(here, "embed_data", "LiberationSans-Regular.ttf"),
        os.path.join(here, "..", "veusz-tauri", "crates",
                     "veusz-paint-wasm", "assets", "LiberationSans-Regular.ttf"),
    )
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]


_DEFAULT_TTF = _find_default_ttf()

_FONT_CACHE = {}


def _load_font(path):
    if path not in _FONT_CACHE:
        from fontTools.ttLib import TTFont
        tt = TTFont(path, lazy=True)
        _FONT_CACHE[path] = {
            "upm": tt["head"].unitsPerEm,
            "cmap": tt.getBestCmap(),
            "hmtx": tt["hmtx"],
            "ascent": tt["hhea"].ascent,
            "descent": tt["hhea"].descent,
            "linegap": getattr(tt["hhea"], "lineGap", 0),
        }
    return _FONT_CACHE[path]


def _font_px(font):
    px = font.pixelSize()
    if px and px > 0:
        return float(px)
    pt = font.pointSizeF()
    if pt <= 0:
        pt = 10.0
    return pt * 96.0 / 72.0


class QFontMetricsF:
    def __init__(self, font, device=None):
        self._font = font
        self._px = _font_px(font)
        self._f = _load_font(_DEFAULT_TTF)
        self._scale = self._px / self._f["upm"]

    def _advance(self, text):
        cmap, hmtx = self._f["cmap"], self._f["hmtx"]
        total = 0
        for ch in str(text):
            gname = cmap.get(ord(ch))
            if gname is None:
                gname = ".notdef"
            try:
                aw = hmtx[gname][0]
            except KeyError:
                aw = hmtx[".notdef"][0]
            total += aw
        return total * self._scale

    def horizontalAdvance(self, text, *a): return self._advance(text)
    def width(self, text, *a): return self._advance(text)
    def ascent(self): return self._f["ascent"] * self._scale
    def descent(self): return -self._f["descent"] * self._scale
    def height(self): return (self._f["ascent"] - self._f["descent"]) * self._scale
    def leading(self): return self._f["linegap"] * self._scale
    def lineSpacing(self): return self.height() + self.leading()
    def boundingRect(self, text):
        return QRectF(0.0, -self.ascent(), self._advance(text), self.height())
    def tightBoundingRect(self, text):
        return self.boundingRect(text)
    def boundingRectChar(self, ch):
        return QRectF(0.0, -self.ascent(), self._advance(ch), self.height())
    def inFont(self, ch): return True
    def inFontUcs4(self, ch): return True


QFontMetrics = QFontMetricsF


# ---------------------------------------------------------------------------
# Transform
# ---------------------------------------------------------------------------

class QTransform:
    def __init__(self, m11=1.0, m12=0.0, m13=0.0, m21=0.0, m22=1.0, m23=0.0,
                 m31=0.0, m32=0.0, m33=1.0):
        if isinstance(m11, QTransform):
            t = m11
            (self._11, self._12, self._13, self._21, self._22, self._23,
             self._31, self._32, self._33) = (
                t._11, t._12, t._13, t._21, t._22, t._23, t._31, t._32, t._33)
            return
        (self._11, self._12, self._13, self._21, self._22, self._23,
         self._31, self._32, self._33) = map(float, (m11, m12, m13, m21, m22, m23, m31, m32, m33))

    def m11(self): return self._11
    def m12(self): return self._12
    def m13(self): return self._13
    def m21(self): return self._21
    def m22(self): return self._22
    def m23(self): return self._23
    def m31(self): return self._31
    def m32(self): return self._32
    def m33(self): return self._33
    def dx(self): return self._31
    def dy(self): return self._32

    def _mul(self, o):
        # self * o  (apply o then self, Qt's row-vector convention: result = self∘o)
        a, b = self, o
        return QTransform(
            a._11 * b._11 + a._12 * b._21,  a._11 * b._12 + a._12 * b._22, 0.0,
            a._21 * b._11 + a._22 * b._21,  a._21 * b._12 + a._22 * b._22, 0.0,
            a._31 * b._11 + a._32 * b._21 + b._31,
            a._31 * b._12 + a._32 * b._22 + b._32, 1.0)

    def __mul__(self, o): return self._mul(o)

    def translate(self, dx, dy):
        t = self._mul(QTransform(1, 0, 0, 0, 1, 0, float(dx), float(dy), 1))
        self.__dict__.update(t.__dict__)
        return self

    def scale(self, sx, sy):
        t = self._mul(QTransform(float(sx), 0, 0, 0, float(sy), 0, 0, 0, 1))
        self.__dict__.update(t.__dict__)
        return self

    def rotate(self, ang):
        th = math.radians(float(ang))
        c, s = math.cos(th), math.sin(th)
        t = self._mul(QTransform(c, s, 0, -s, c, 0, 0, 0, 1))
        self.__dict__.update(t.__dict__)
        return self

    def map(self, x, y=None):
        if y is None:  # QPointF
            p = x
            x, y = p.x(), p.y()
            mx = self._11 * x + self._21 * y + self._31
            my = self._12 * x + self._22 * y + self._32
            return QPointF(mx, my)
        mx = self._11 * x + self._21 * y + self._31
        my = self._12 * x + self._22 * y + self._32
        return mx, my

    def inverted(self):
        det = self._11 * self._22 - self._12 * self._21
        if det == 0:
            return QTransform(), False
        idet = 1.0 / det
        return QTransform(
            self._22 * idet, -self._12 * idet, 0,
            -self._21 * idet, self._11 * idet, 0,
            (self._21 * self._32 - self._22 * self._31) * idet,
            (self._12 * self._31 - self._11 * self._32) * idet, 1), True


# ---------------------------------------------------------------------------
# Painter path
# ---------------------------------------------------------------------------

class _PathEl:
    def __init__(self, t, x, y):
        self.type = t
        self.x = x
        self.y = y


_KAPPA = 0.5522847498307936


class QPainterPath:
    ElementType = _EnumNamespace(MoveToElement=_E(0), LineToElement=_E(1),
                                CurveToElement=_E(2), CurveToDataElement=_E(3))

    def __init__(self, start=None):
        self._els = []
        self._fillrule = Qt.FillRule.OddEvenFill
        self._cx = self._cy = 0.0
        if start is not None and hasattr(start, "x"):
            self.moveTo(start.x(), start.y())

    def moveTo(self, x, y=None):
        if y is None:
            x, y = x.x(), x.y()
        self._els.append(_PathEl(0, float(x), float(y)))
        self._cx, self._cy = float(x), float(y)

    def lineTo(self, x, y=None):
        if y is None:
            x, y = x.x(), x.y()
        self._els.append(_PathEl(1, float(x), float(y)))
        self._cx, self._cy = float(x), float(y)

    def cubicTo(self, *a):
        if len(a) == 3:  # QPointF args
            c1, c2, e = a
            pts = [(c1.x(), c1.y()), (c2.x(), c2.y()), (e.x(), e.y())]
        else:
            pts = [(a[0], a[1]), (a[2], a[3]), (a[4], a[5])]
        self._els.append(_PathEl(2, float(pts[0][0]), float(pts[0][1])))
        self._els.append(_PathEl(3, float(pts[1][0]), float(pts[1][1])))
        self._els.append(_PathEl(3, float(pts[2][0]), float(pts[2][1])))
        self._cx, self._cy = float(pts[2][0]), float(pts[2][1])

    def addRect(self, *a):
        if len(a) == 1:
            r = a[0]
            x, y, w, h = r.x(), r.y(), r.width(), r.height()
        else:
            x, y, w, h = a
        self.moveTo(x, y); self.lineTo(x + w, y); self.lineTo(x + w, y + h)
        self.lineTo(x, y + h); self.lineTo(x, y)

    def addEllipse(self, *a):
        if len(a) == 1:
            r = a[0]
            cx, cy = r.x() + r.width() / 2, r.y() + r.height() / 2
            rx, ry = r.width() / 2, r.height() / 2
        elif len(a) == 4:
            x, y, w, h = a
            cx, cy, rx, ry = x + w / 2, y + h / 2, w / 2, h / 2
        else:
            c, rx, ry = a
            cx, cy = c.x(), c.y()
        kx, ky = _KAPPA * rx, _KAPPA * ry
        self.moveTo(cx + rx, cy)
        self.cubicTo(cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry)
        self.cubicTo(cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy)
        self.cubicTo(cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry)
        self.cubicTo(cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy)

    def arcTo(self, *a):
        """Approximate Qt's arcTo with a line-segment polyline. Args:
        (QRectF, startAngle, sweepLength) or (x, y, w, h, startAngle, sweep).
        Angles in degrees, CCW from 3 o'clock (Qt convention)."""
        if len(a) == 3:
            r, start, sweep = a
            x, y, w, h = r.x(), r.y(), r.width(), r.height()
        else:
            x, y, w, h, start, sweep = a
        cx, cy = x + w / 2.0, y + h / 2.0
        rx, ry = w / 2.0, h / 2.0
        nseg = max(2, int(abs(sweep) / 6.0) + 1)

        def pt(deg):
            t = math.radians(deg)
            return (cx + rx * math.cos(t), cy - ry * math.sin(t))

        sx, sy = pt(start)
        if self._els:
            self.lineTo(sx, sy)
        else:
            self.moveTo(sx, sy)
        for i in range(1, nseg + 1):
            px, py = pt(start + sweep * i / nseg)
            self.lineTo(px, py)

    def addPolygon(self, poly):
        first = True
        for p in poly:
            if first:
                self.moveTo(p.x(), p.y()); first = False
            else:
                self.lineTo(p.x(), p.y())

    def addPath(self, other):
        self._els.extend(other._els)

    def closeSubpath(self):
        # find last moveto
        for el in reversed(self._els):
            if el.type == 0:
                self.lineTo(el.x, el.y)
                break

    def moveToPoint(self, p): self.moveTo(p.x(), p.y())
    def currentPosition(self): return QPointF(self._cx, self._cy)
    def elementCount(self): return len(self._els)
    def elementAt(self, i): return self._els[i]
    def fillRule(self): return self._fillrule
    def setFillRule(self, r): self._fillrule = r


# ---------------------------------------------------------------------------
# Paint devices (data holders; never rasterised here)
# ---------------------------------------------------------------------------

class _ImageBits:
    """Minimal stand-in for the object QImage.constBits() returns; supports
    the ``.asarray(n)`` read used by qt_translate.qimage_to_image."""
    def __init__(self, buf, n):
        self._buf = buf
        self._n = n

    def asarray(self, n=None):
        n = self._n if n is None else n
        b = bytes(self._buf)
        return (b[:n] if len(b) >= n else b + b"\x00" * (n - len(b)))


class QImage:
    Format = _EnumNamespace(
        Format_ARGB32=_E(5), Format_ARGB32_Premultiplied=_E(6),
        Format_RGBA8888=_E(17), Format_RGB32=_E(4), Format_Indexed8=_E(3),
        Format_Mono=_E(1),
    )

    def __init__(self, *a):
        self._w = self._h = 0
        self._fmt = QImage.Format.Format_ARGB32_Premultiplied
        # Raw pixel bytes in the format's memory layout (ARGB32 little-endian
        # == [B, G, R, A] per pixel). Set by qtloops_py.numpyToQImage so image
        # ops carry real pixels into the captured Scene. None == no pixels.
        self._pixels = None
        if len(a) >= 2 and isinstance(a[0], int):
            self._w, self._h = int(a[0]), int(a[1])
            if len(a) >= 3:
                self._fmt = a[2]

    def width(self): return self._w
    def height(self): return self._h
    def format(self): return self._fmt
    def fill(self, *a): pass
    def isNull(self): return self._w == 0 or self._h == 0
    def devicePixelRatio(self): return 1.0
    def setDevicePixelRatio(self, r): pass
    def constBits(self):
        n = 4 * self._w * self._h
        buf = self._pixels if self._pixels is not None else b"\x00" * n
        return _ImageBits(buf, n)
    bits = constBits
    def convertToFormat(self, fmt):
        img = QImage(self._w, self._h, fmt)
        img._pixels = self._pixels  # pixels already straight-alpha ARGB32-ish
        return img
    def copy(self, *a):
        """Full copy (no args / QRect) or sub-rectangle copy(x, y, w, h),
        carrying the ARGB32 pixel bytes so cropped images still draw."""
        if len(a) == 0:
            img = QImage(self._w, self._h, self._fmt); img._pixels = self._pixels
            return img
        if len(a) == 1 and hasattr(a[0], 'x'):
            r = a[0]; x, y, w, h = int(r.x()), int(r.y()), int(r.width()), int(r.height())
        elif len(a) >= 4:
            x, y, w, h = int(a[0]), int(a[1]), int(a[2]), int(a[3])
        else:
            img = QImage(self._w, self._h, self._fmt); img._pixels = self._pixels
            return img
        w, h = max(0, w), max(0, h)
        img = QImage(w, h, self._fmt)
        if self._pixels is not None and w and h:
            src = self._pixels; sw, sh = self._w, self._h
            out = bytearray(w * h * 4)
            x0 = max(0, x); x1 = min(sw, x + w); cw = x1 - x0
            if cw > 0:
                doff = (x0 - x) * 4
                for row in range(h):
                    sy = y + row
                    if 0 <= sy < sh:
                        si = (sy * sw + x0) * 4
                        di = row * w * 4 + doff
                        out[di:di + cw * 4] = src[si:si + cw * 4]
            img._pixels = bytes(out)
        return img
    def scaled(self, w, h, *a):
        """Nearest-neighbour resample to w×h (used by the resample draw modes)."""
        w, h = max(0, int(w)), max(0, int(h))
        img = QImage(w, h, self._fmt)
        if self._pixels is not None and w and h and self._w and self._h:
            src = self._pixels; sw, sh = self._w, self._h
            out = bytearray(w * h * 4)
            for row in range(h):
                sy = min(sh - 1, row * sh // h)
                base = sy * sw
                for col in range(w):
                    sx = min(sw - 1, col * sw // w)
                    si = (base + sx) * 4; di = (row * w + col) * 4
                    out[di:di + 4] = src[si:si + 4]
            img._pixels = bytes(out)
        return img
    def mirrored(self, *a, **k):
        img = QImage(self._w, self._h, self._fmt); img._pixels = self._pixels
        return img
    def depth(self): return 32
    def logicalDpiX(self): return 96
    def logicalDpiY(self): return 96
    def physicalDpiX(self): return 96
    def physicalDpiY(self): return 96


class QPixmap:
    def __init__(self, *a):
        self._w = int(a[0]) if a and isinstance(a[0], int) else 0
        self._h = int(a[1]) if len(a) > 1 and isinstance(a[1], int) else 0

    def width(self): return self._w
    def height(self): return self._h
    def isNull(self): return self._w == 0


class QPicture:
    def __init__(self, *a): pass
    def setBoundingRect(self, r): pass


# ---------------------------------------------------------------------------
# Painter — state machine; draw methods are no-ops (recording happens in the
# SceneCapturingPainter Python overrides). Provides pen/brush/font/transform/
# clip + save/restore that widget code reads back.
# ---------------------------------------------------------------------------

class QPainter:
    RenderHint = _EnumNamespace(
        Antialiasing=_E(0x01), TextAntialiasing=_E(0x02),
        SmoothPixmapTransform=_E(0x04),
    )
    CompositionMode = _EnumNamespace(
        CompositionMode_SourceOver=_E(0), CompositionMode_Multiply=_E(13),
        CompositionMode_Plus=_E(21),
    )

    def __init__(self, device=None):
        self._dev = device
        self._pen = QPen()
        self._brush = QBrush()
        self._font = QFont()
        self._transform = QTransform()
        self._hints = 0
        self._opacity = 1.0
        self._comp = QPainter.CompositionMode.CompositionMode_SourceOver
        self._stack = []
        self._active = device is not None

    # lifecycle
    def begin(self, dev): self._dev = dev; self._active = True; return True
    def end(self): self._active = False; return True
    def isActive(self): return self._active
    def device(self): return self._dev

    # state
    def setPen(self, p):
        if isinstance(p, QPen): self._pen = p
        elif isinstance(p, QColor): self._pen = QPen(p)
        else: self._pen = QPen(p)
    def pen(self): return self._pen
    def setBrush(self, b):
        if isinstance(b, QBrush): self._brush = b
        elif isinstance(b, QColor): self._brush = QBrush(b)
        else: self._brush = QBrush(b)
    def brush(self): return self._brush
    def setFont(self, f): self._font = f
    def font(self): return self._font
    def fontMetrics(self): return QFontMetricsF(self._font)
    def setOpacity(self, o): self._opacity = float(o)
    def opacity(self): return self._opacity
    def setCompositionMode(self, m): self._comp = m
    def compositionMode(self): return self._comp

    def setRenderHint(self, hint, on=True):
        bit = int(hint.value) if hasattr(hint, "value") else int(hint)
        if on: self._hints |= bit
        else: self._hints &= ~bit
    def renderHints(self): return _E(self._hints)
    def testRenderHint(self, hint):
        bit = int(hint.value) if hasattr(hint, "value") else int(hint)
        return bool(self._hints & bit)

    # transform
    def transform(self): return QTransform(self._transform)
    def worldTransform(self): return QTransform(self._transform)
    def deviceTransform(self): return QTransform(self._transform)
    def setTransform(self, t, combine=False):
        self._transform = (self._transform * t) if combine else QTransform(t)
    def setWorldTransform(self, t, combine=False): self.setTransform(t, combine)
    def resetTransform(self): self._transform = QTransform()
    def translate(self, *a):
        if len(a) == 1: dx, dy = a[0].x(), a[0].y()
        else: dx, dy = a
        self._transform.translate(float(dx), float(dy))
    def rotate(self, ang): self._transform.rotate(float(ang))
    def scale(self, sx, sy): self._transform.scale(float(sx), float(sy))

    # clip (state only)
    def setClipRect(self, *a): self._cliprect = a[0] if a else None
    def setClipPath(self, *a): self._clippath = a[0] if a else None
    def setClipping(self, on): pass
    def hasClipping(self): return False

    # save/restore
    def save(self):
        self._stack.append((QPen(self._pen), QBrush(self._brush), QFont.__new__(QFont) and self._font,
                            QTransform(self._transform), self._hints, self._opacity, self._comp))
        # keep font reference simple
        self._stack[-1] = (QPen(self._pen), QBrush(self._brush), self._font,
                           QTransform(self._transform), self._hints, self._opacity, self._comp)
    def restore(self):
        if self._stack:
            (self._pen, self._brush, self._font, self._transform,
             self._hints, self._opacity, self._comp) = self._stack.pop()

    # draw ops — no-ops (Scene recording happens in the capture subclass)
    def drawLine(self, *a): pass
    def drawLines(self, *a): pass
    def drawRect(self, *a): pass
    def drawRects(self, *a): pass
    def drawEllipse(self, *a): pass
    def drawText(self, *a): pass
    def drawPath(self, *a): pass
    def drawPoint(self, *a): pass
    def drawPoints(self, *a): pass
    def drawPolyline(self, *a): pass
    def drawPolygon(self, *a): pass
    def drawImage(self, *a): pass
    def drawPixmap(self, *a): pass
    def fillRect(self, *a): pass
    def fillPath(self, *a): pass
    def strokePath(self, *a): pass
    def eraseRect(self, *a): pass
    def boundingRect(self, rect, flags, text):
        fm = self.fontMetrics()
        return QRectF(0.0, 0.0, fm.horizontalAdvance(text), fm.height())


class QPainterPathStroker:
    def __init__(self, *a): pass
    def setWidth(self, w): pass
    def createStroke(self, p): return QPainterPath()


# ---------------------------------------------------------------------------
# App / locale / settings stubs
# ---------------------------------------------------------------------------

class QCoreApplication:
    _inst = None

    def __init__(self, *a): QCoreApplication._inst = self

    @staticmethod
    def instance(): return QCoreApplication._inst

    @staticmethod
    def translate(ctx, text, *a, **k): return text

    @staticmethod
    def setOrganizationName(*a): pass

    @staticmethod
    def setApplicationName(*a): pass

    def __getattr__(self, name):
        # Forgiving no-op for the long tail of QApplication setters/getters
        # the headless path doesn't need (setQuitOnLastWindowClosed, etc.).
        if name.startswith('__') and name.endswith('__'):
            raise AttributeError(name)
        def _noop(*a, **k):
            return None
        return _noop


class QApplication(QCoreApplication):
    @staticmethod
    def font(*a): return QFont()

    @staticmethod
    def palette(*a): return None


class QLocale:
    NumberOption = _EnumNamespace(
        OmitGroupSeparator=_E(1), RejectGroupSeparator=_E(2),
        DefaultNumberOptions=_E(0),
    )
    FormatType = _EnumNamespace(LongFormat=_E(0), ShortFormat=_E(1))

    def __init__(self, *a): pass

    def toString(self, val, *a):
        return str(val)

    @staticmethod
    def system(): return QLocale()

    @staticmethod
    def setDefault(loc): pass

    def setNumberOptions(self, *a): pass
    def numberOptions(self): return _E(0)
    def decimalPoint(self): return "."
    def name(self): return "C"

    def toDouble(self, s):
        """Mirror PyQt6: returns ``(value, ok)``. readcsv unpacks the tuple
        when guessing column types, so returning None (the __getattr__
        fallback) breaks any CSV import in the embed."""
        try:
            return float(s), True
        except (TypeError, ValueError):
            return 0.0, False

    def toInt(self, s):
        try:
            return int(s), True
        except (TypeError, ValueError):
            return 0, False

    def __getattr__(self, name):
        def _m(*a, **k):
            return None
        return _m


class QSettings:
    _store = {}

    def __init__(self, *a): pass

    def value(self, key, default=None, type=None):
        return QSettings._store.get(key, default)

    def setValue(self, key, val):
        QSettings._store[key] = val

    def contains(self, key): return key in QSettings._store
    def remove(self, key): QSettings._store.pop(key, None)
    def sync(self): pass
    def beginGroup(self, *a): pass
    def endGroup(self): pass
    def childGroups(self): return []
    def childKeys(self): return []


class QFontDatabase:
    SystemFont = _EnumNamespace(
        GeneralFont=_E(0), FixedFont=_E(1), TitleFont=_E(2), SmallestReadableFont=_E(3),
    )

    @staticmethod
    def families(*a):
        return ["Liberation Sans", "sans-serif", "serif", "monospace"]

    @staticmethod
    def addApplicationFont(*a):
        return -1

    @staticmethod
    def applicationFontFamilies(*a):
        return []

    @staticmethod
    def systemFont(*a):
        return QFont()

    @staticmethod
    def isFixedPitch(*a):
        return False


class QByteArray(bytes):
    pass


def loadUi(*a, **k):
    raise RuntimeError("loadUi is GUI-only and unavailable in the Qt shim")


class sip:
    @staticmethod
    def isdeleted(o): return False


# ---------------------------------------------------------------------------
# Forgiving fallback for the GUI long-tail (QtWidgets controls, dialogs, …).
# These are imported at module-load time by veusz GUI code but never used on
# the headless capture path. Return a subclassable, call-tolerant stub so
# imports survive; if anything actually *uses* one at runtime we'll see it.
# ---------------------------------------------------------------------------

class _StubBase:
    def __init__(self, *a, **k):
        pass

    def __getattr__(self, name):
        def _m(*a, **k):
            return None
        return _m


_STUB_CACHE = {}


def __getattr__(name):
    # PEP 562 module-level fallback — only fires for names not defined above.
    if name.startswith("__") and name.endswith("__"):
        raise AttributeError(name)  # let import/inspect machinery behave
    if name and name[0].isupper():
        stub = _STUB_CACHE.get(name)
        if stub is None:
            stub = type(name, (_StubBase,), {})
            _STUB_CACHE[name] = stub
        return stub
    # lower-case unknowns (functions/constants) -> inert callable
    def _fn(*a, **k):
        return None
    return _fn
