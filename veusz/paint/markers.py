"""Marker shapes as abstract :class:`veusz.paint.protocol.Path` builders.

A direct port of the QPainter-side marker tables in :mod:`veusz.utils.points`,
but expressed in the backend-neutral Path API so the new tiny-skia / Vello
renderers can draw them without going through Qt.

The same vertex tables drive both paths — there is no second source of truth
for marker geometry.
"""

from __future__ import annotations

import math
from typing import Tuple

from .protocol import Path


# Standard kappa for approximating a quarter-circle with a cubic Bezier:
#   four cubic segments span a unit circle with max-radial-error ~ 0.027%.
_K = 4.0 / 3.0 * (math.sqrt(2.0) - 1.0)


def _add_ellipse(path: Path, cx: float, cy: float, rx: float, ry: float) -> None:
    """Append a closed cubic-Bezier approximation of an ellipse."""
    kx = _K * rx
    ky = _K * ry
    path.move_to(cx + rx, cy)
    path.cubic_to(cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry)
    path.cubic_to(cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy)
    path.cubic_to(cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry)
    path.cubic_to(cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy)
    path.close()


def _add_rect(path: Path, x: float, y: float, w: float, h: float) -> None:
    path.move_to(x, y)
    path.line_to(x + w, y)
    path.line_to(x + w, y + h)
    path.line_to(x, y + h)
    path.close()


def _add_polygon(path: Path, vertices: Tuple[Tuple[float, float], ...],
                 scale: float = 1.0) -> None:
    path.move_to(vertices[0][0] * scale, vertices[0][1] * scale)
    for x, y in vertices[1:]:
        path.line_to(x * scale, y * scale)
    path.close()


# --- shared geometry tables (mirror veusz.utils.points) ----------------------

linesymbols = {
    'asterisk': (
        ((-0.707, -0.707), (0.707,  0.707)),
        ((-0.707,  0.707), (0.707, -0.707)),
        ((-1, 0), (1, 0)), ((0, -1), (0, 1))
    ),
    'lineplus': ( ((-1, 0), (1, 0)), ((0, -1), (0, 1)) ),
    'linecross': (
        ((-0.707, -0.707), (0.707,  0.707)),
        ((-0.707,  0.707), (0.707, -0.707))
    ),
    'plushair': (
        ((-1, 0), (-0.5, 0)), ((1, 0), (0.5, 0)),
        ((0, -1), (0, -0.5)), ((0, 1), (0, 0.5))
    ),
    'crosshair': (
        ((-0.707, -0.707), (-0.354, -0.354)),
        (( 0.707,  0.707), ( 0.354,  0.354)),
        (( 0.707, -0.707), ( 0.354, -0.354)),
        ((-0.707,  0.707), (-0.354,  0.354))
    ),
    'asteriskhair': (
        ((-1, 0), (-0.5, 0)), ((1, 0), (0.5, 0)),
        ((0, -1), (0, -0.5)), ((0, 1), (0, 0.5)),
        ((-0.707, -0.707), (-0.354, -0.354)),
        (( 0.707,  0.707), ( 0.354,  0.354)),
        (( 0.707, -0.707), ( 0.354, -0.354)),
        ((-0.707,  0.707), (-0.354,  0.354))
    ),
    'linehorz': ( ((-1, 0), (1, 0)), ),
    'linevert': ( ((0, -1), (0, 1)), ),
    'linehorzgap': ( ((-1, 0), (-0.5, 0)), ((1, 0), (0.5, 0)) ),
    'linevertgap': ( ((0, -1), (0, -0.5)), ((0, 1), (0, 0.5)) ),
    'arrowleft': ( ((1, -0.8), (0, 0), (1, 0.8)), ((2, 0), (0, 0)) ),
    'arrowleftaway': ( ((-1, -0.8), (-2, 0), (-1, 0.8)), ((-2, 0), (0, 0)) ),
    'arrowright': ( ((-1, -0.8), (0, 0), (-1, 0.8)), ((-2, 0), (0, 0)) ),
    'arrowrightaway': ( ((1, -0.8), (2, 0), (1, 0.8)), ((2, 0), (0, 0)) ),
    'arrowup': ( ((-0.8, 1), (0, 0), (0.8, 1)), ((0, 2), (0, 0)) ),
    'arrowupaway': ( ((-0.8, -1), (0, -2), (0.8, -1)), ((0, 0), (0, -2)) ),
    'arrowdown': ( ((-0.8, -1), (0, 0), (0.8, -1)), ((0, -2), (0, 0)) ),
    'arrowdownaway': ( ((-0.8, 1), (0, 2), (0.8, 1)), ((0, 0), (0, 2)) ),
    'limitlower': (
        ((-0.8, -1), (0, 0), (0.8, -1)), ((0, -2), (0, 0)),
        ((-1, 0), (1, 0))
    ),
    'limitupper': (
        ((-0.8, 1), (0, 0), (0.8, 1)), ((0, 2), (0, 0)),
        ((-1, 0), (1, 0))
    ),
    'limitleft': (
        ((1, -0.8), (0, 0), (1, 0.8)), ((2, 0), (0, 0)),
        ((0, -1), (0, 1))
    ),
    'limitright': (
        ((-1, -0.8), (0, 0), (-1, 0.8)), ((-2, 0), (0, 0)),
        ((0, -1), (0, 1))
    ),
    'limitupperaway': (
        ((-0.8, -1), (0, -2), (0.8, -1)), ((0, 0), (0, -2)),
        ((-1, 0), (1, 0))
    ),
    'limitloweraway': (
        ((-0.8, 1), (0, 2), (0.8, 1)), ((0, 0), (0, 2)),
        ((-1, 0), (1, 0))
    ),
    'limitleftaway': (
        ((-1, -0.8), (-2, 0), (-1, 0.8)), ((-2, 0), (0, 0)),
        ((0, -1), (0, 1))
    ),
    'limitrightaway': (
        ((1, -0.8), (2, 0), (1, 0.8)), ((2, 0), (0, 0)),
        ((0, -1), (0, 1))
    ),
    'arrowlowerleftaway': (
        ((-0.8, 1), (0, 2), (0.8, 1)),
        ((0, 2), (0, 0), (-2, 0)),
        ((-1, -0.8), (-2, 0), (-1, 0.8))
    ),
    'arrowlowerrightaway': (
        ((1, -0.8), (2, 0), (1, 0.8)),
        ((2, 0), (0, 0), (0, 2)),
        ((-0.8, 1), (0, 2), (0.8, 1))
    ),
    'arrowupperleftaway': (
        ((-0.8, -1), (0, -2), (0.8, -1)),
        ((0, -2), (0, 0), (-2, 0)),
        ((-1, -0.8), (-2, 0), (-1, 0.8))
    ),
    'arrowupperrightaway': (
        ((-0.8, -1), (0, -2), (0.8, -1)),
        ((2, 0), (0, 0), (0, -2)),
        ((1, -0.8), (2, 0), (1, 0.8))
    ),
    'lineup': ( ((0, 0), (0, -1)), ),
    'linedown': ( ((0, 0), (0, 1)), ),
    'lineleft': ( ((0, 0), (-1, 0)), ),
    'lineright': ( ((0, 0), (1, 0)), ),
    '_linearrow': ( ((-1.8, -1), (0, 0), (-1.8, 1)), ),
    '_linearrowreverse': ( ((1.8, -1), (0, 0), (1.8, 1)), ),
}

polygons = {
    'diamond': ( (0., 1.414), (1.414, 0.), (0., -1.414), (-1.414, 0.) ),
    'barhorz': ( (-1, -0.5), (1, -0.5), (1, 0.5), (-1, 0.5) ),
    'barvert': ( (-0.5, -1), (0.5, -1), (0.5, 1), (-0.5, 1) ),
    'plus': (
        (0.4, 1), (0.4, 0.4), (1, 0.4), (1, -0.4),
        (0.4, -0.4), (0.4, -1), (-0.4, -1), (-0.4, -0.4),
        (-1, -0.4), (-1, 0.4), (-0.4, 0.4), (-0.4, 1)
    ),
    'octogon': (
        (0.414, 1), (1, 0.414), (1, -0.414), (0.414, -1),
        (-0.414, -1), (-1, -0.414), (-1, 0.414), (-0.414, 1)
    ),
    'triangle': ( (0, -1.2), (1.0392, 0.6), (-1.0392, 0.6) ),
    'triangledown': ( (0, 1.2), (1.0392, -0.6), (-1.0392, -0.6) ),
    'triangleleft': ( (-1.2, 0), (0.6, 1.0392), (0.6, -1.0392) ),
    'triangleright': ( (1.2, 0), (-0.6, 1.0392), (-0.6, -1.0392) ),
    'cross': (
        (-0.594, 1.1028), (0, 0.5088), (0.594, 1.1028),
        (1.1028, 0.594), (0.5088, -0), (1.1028, -0.594),
        (0.594, -1.1028), (-0, -0.5088), (-0.594, -1.1028),
        (-1.1028, -0.594), (-0.5088, 0), (-1.1028, 0.594)
    ),
    'star': (
        (0, -1.2), (-0.27, -0.3708), (-1.1412, -0.3708),
        (-0.4356, 0.1416), (-0.7056, 0.9708), (-0, 0.4584),
        (0.7056, 0.9708), (0.4356, 0.1416), (1.1412, -0.3708),
        (0.27, -0.3708)
    ),
    'pentagon': (
        (0, -1.2), (1.1412, -0.3708), (0.6936, 0.9708),
        (-0.6936, 0.9708), (-1.1412, -0.3708)
    ),
    'tievert': ( (-1, -1), (1, -1), (-1, 1), (1, 1) ),
    'tiehorz': ( (-1, -1), (-1, 1), (1, -1), (1, 1) ),
    'lozengehorz': ( (0, 0.707), (1.414, 0), (0, -0.707), (-1.414, 0) ),
    'lozengevert': ( (0, 1.414), (0.707, 0), (0, -1.414), (-0.707, 0) ),
    'star3': (
        (0., -1.), (0.173, -0.1), (0.866, 0.5), (0, 0.2),
        (-0.866, 0.5), (-0.173, -0.1)
    ),
    'star4': (
        (0.000, 1.000), (-0.354, 0.354), (-1.000, 0.000),
        (-0.354, -0.354), (0.000, -1.000), (0.354, -0.354),
        (1.000, -0.000), (0.354, 0.354),
    ),
    'star6': (
        (0.000, 1.000), (-0.250, 0.433), (-0.866, 0.500),
        (-0.500, 0.000), (-0.866, -0.500), (-0.250, -0.433),
        (-0.000, -1.000), (0.250, -0.433), (0.866, -0.500),
        (0.500, 0.000), (0.866, 0.500), (0.250, 0.433),
    ),
    'star8': (
        (0.000, 1.000), (-0.191, 0.462), (-0.707, 0.707),
        (-0.462, 0.191), (-1.000, 0.000), (-0.462, -0.191),
        (-0.707, -0.707), (-0.191, -0.462), (0.000, -1.000),
        (0.191, -0.462), (0.707, -0.707), (0.462, -0.191),
        (1.000, -0.000), (0.462, 0.191), (0.707, 0.707),
        (0.191, 0.462),
    ),
    'hexagon': (
        (0, 1), (0.866, 0.5), (0.866, -0.5),
        (0, -1), (-0.866, -0.5), (-0.866, 0.5),
    ),
    'starinvert': (
        (0, 1.2), (-0.27, 0.3708), (-1.1412, 0.3708),
        (-0.4356, -0.1416), (-0.7056, -0.9708), (0, -0.4584),
        (0.7056, -0.9708), (0.4356, -0.1416), (1.1412, 0.3708),
        (0.27, 0.3708)
    ),
    'squashbox': (
        (-1, 1), (0, 0.5), (1, 1), (0.5, 0),
        (1, -1), (0, -0.5), (-1, -1), (-0.5, 0)
    ),
    'plusnarrow': (
        (0.2, 1), (0.2, 0.2), (1, 0.2), (1, -0.2),
        (0.2, -0.2), (0.2, -1), (-0.2, -1), (-0.2, -0.2),
        (-1, -0.2), (-1, 0.2), (-0.2, 0.2), (-0.2, 1)
    ),
    'crossnarrow': (
        (-0.566, 0.849), (0, 0.283), (0.566, 0.849),
        (0.849, 0.566), (0.283, 0), (0.849, -0.566),
        (0.566, -0.849), (0, -0.283), (-0.566, -0.849),
        (-0.849, -0.566), (-0.283, 0), (-0.849, 0.566)
    ),
    'limitupperaway2': (
        (-1, 0), (0, 0), (0, -1), (-1, -1), (0, -2),
        (1, -1), (0, -1), (0, 0), (1, 0)
    ),
    'limitloweraway2': (
        (-1, 0), (0, 0), (0, 1), (-1, 1), (0, 2),
        (1, 1), (0, 1), (0, 0), (1, 0)
    ),
    'limitleftaway2': (
        (0, -1), (0, 0) , (-1, 0), (-1, -1), (-2, 0),
        (-1, 1), (-1, 0), (0, 0), (0, 1)
    ),
    'limitrightaway2': (
        (0, -1), (0, 0), (1, 0), (1, -1), (2, 0),
        (1, 1), (1, 0), (0, 0), (0, 1)
    ),
    '_arrow': ( (0, 0), (-1.8, 1), (-1.4, 0), (-1.8, -1) ),
    '_arrowtriangle': ( (0, 0), (-1.8, 1), (-1.8, -1) ),
    '_arrownarrow': ( (0, 0), (-1.8, 0.5), (-1.8, -0.5) ),
    '_arrowreverse': ( (0, 0), (1.8, 1), (1.4, 0), (1.8, -1) ),
}


# --- path-symbol builders (each one builds onto a fresh Path) ----------------

def _square_path(path: Path, size: float, lw: float) -> None:
    _add_rect(path, -size, -size, size * 2, size * 2)

def _circle_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size)

def _circle_plus_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size)
    path.move_to(0.0, -size); path.line_to(0.0, size)
    path.move_to(-size, 0.0); path.line_to(size, 0.0)

def _circle_cross_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size)
    m = math.sqrt(2.0) * size * 0.5
    path.move_to(-m, -m); path.line_to(m, m)
    path.move_to(-m, m); path.line_to(m, -m)

def _circle_pair_horz(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, -size * 0.5, 0.0, size * 0.5, size * 0.5)
    _add_ellipse(path, size * 0.5, 0.0, size * 0.5, size * 0.5)

def _circle_pair_vert(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, -size * 0.5, size * 0.5, size * 0.5)
    _add_ellipse(path, 0.0, size * 0.5, size * 0.5, size * 0.5)

def _ellipse_horz_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size * 0.5)

def _ellipse_vert_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size * 0.5, size)

def _circle_hole_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size)
    _add_ellipse(path, 0.0, 0.0, size * 0.5, size * 0.5)

def _square_plus_path(path: Path, size: float, lw: float) -> None:
    _add_rect(path, -size, -size, size * 2, size * 2)
    path.move_to(0.0, -size); path.line_to(0.0, size)
    path.move_to(-size, 0.0); path.line_to(size, 0.0)

def _square_cross_path(path: Path, size: float, lw: float) -> None:
    _add_rect(path, -size, -size, size * 2, size * 2)
    path.move_to(-size, -size); path.line_to(size, size)
    path.move_to(-size, size); path.line_to(size, -size)

def _square_hole_path(path: Path, size: float, lw: float) -> None:
    _add_rect(path, -size, -size, size * 2, size * 2)
    _add_rect(path, -size * 0.5, -size * 0.5, size, size)

def _diamond_hole_path(path: Path, size: float, lw: float) -> None:
    _add_polygon(path, polygons['diamond'], size)
    _add_polygon(path, polygons['diamond'], size * 0.5)

def _pentagon_hole_path(path: Path, size: float, lw: float) -> None:
    _add_polygon(path, polygons['pentagon'], size)
    _add_polygon(path, polygons['pentagon'], size * 0.5)

def _square_rounded_path(path: Path, size: float, lw: float) -> None:
    # Approximate rounded rect with 50% radius. Veusz uses RelativeSize 50,50
    # so radius = 0.5 * half-extent = size * 0.5.
    r = size * 0.5
    # straight edges
    path.move_to(-size + r, -size)
    path.line_to(size - r, -size)
    path.cubic_to(size - r + _K * r, -size, size, -size + r - _K * r, size, -size + r)
    path.line_to(size, size - r)
    path.cubic_to(size, size - r + _K * r, size - r + _K * r, size, size - r, size)
    path.line_to(-size + r, size)
    path.cubic_to(-size + r - _K * r, size, -size, size - r + _K * r, -size, size - r)
    path.line_to(-size, -size + r)
    path.cubic_to(-size, -size + r - _K * r, -size + r - _K * r, -size, -size + r, -size)
    path.close()

def _dot_path(path: Path, size: float, lw: float) -> None:
    r = max(lw * 0.5, 0.0)
    _add_ellipse(path, 0.0, 0.0, r, r)

def _bullseye_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size)
    _add_ellipse(path, 0.0, 0.0, size * 0.5, size * 0.5)

def _circle_dot_path(path: Path, size: float, lw: float) -> None:
    _add_ellipse(path, 0.0, 0.0, size, size)
    r = max(lw * 0.5, 0.0)
    _add_ellipse(path, 0.0, 0.0, r, r)

pathsymbols = {
    'square': _square_path,
    'circle': _circle_path,
    'circleplus': _circle_plus_path,
    'circlecross': _circle_cross_path,
    'circlepairhorz': _circle_pair_horz,
    'circlepairvert': _circle_pair_vert,
    'ellipsehorz': _ellipse_horz_path,
    'ellipsevert': _ellipse_vert_path,
    'circlehole': _circle_hole_path,
    'squareplus': _square_plus_path,
    'squarecross': _square_cross_path,
    'squarehole': _square_hole_path,
    'diamondhole': _diamond_hole_path,
    'pentagonhole': _pentagon_hole_path,
    'squarerounded': _square_rounded_path,
    'dot': _dot_path,
    'bullseye': _bullseye_path,
    'circledot': _circle_dot_path,
}


# Area-equalization factors (copied from veusz.utils.points.area_scales — the
# same calibration set, derived empirically by counting filled pixels).
area_scales = {
    'diamond': 0.886,
    'square': 0.886,
    'cross': 1.034,
    'plus': 1.108,
    'star': 1.395,
    'barhorz': 1.253,
    'barvert': 1.253,
    'pentagon': 0.96,
    'hexagon': 1.099,
    'octogon': 0.974,
    'tievert': 1.253,
    'tiehorz': 1.253,
    'triangle': 1.296,
    'triangledown': 1.296,
    'triangleleft': 1.296,
    'triangleright': 1.296,
    'circlehole': 1.155,
    'squarehole': 1.023,
    'diamondhole': 1.024,
    'pentagonhole': 1.109,
    'squarerounded': 0.911,
    'squashbox': 1.253,
    'ellipsehorz': 1.414,
    'ellipsevert': 1.414,
    'lozengehorz': 1.254,
    'lozengevert': 1.254,
    'plusnarrow': 1.477,
    'crossnarrow': 1.477,
    'squareplus': 0.886,
    'squarecross': 0.886,
    'star3': 2.46,
    'star4': 1.489,
    'star6': 1.447,
    'star8': 1.433,
    'starinvert': 1.395,
    'circlepairhorz': 1.414,
    'circlepairvert': 1.414,
    'limitupperaway2': 1.772,
    'limitloweraway2': 1.772,
    'limitleftaway2': 1.774,
    'limitrightaway2': 1.771,
}


def marker_path(name: str, size: float, linewidth: float = 1.0
                ) -> Tuple[Path, bool]:
    """Return ``(path, fillable)`` for a marker shape.

    Mirrors :func:`veusz.utils.points.getPointPainterPath`: ``fillable`` is
    False for the pure-line symbols (where the brush is ignored) and True
    for the polygon / closed-path symbols.
    """
    p = Path()
    if name == 'none':
        return p, True
    if name in linesymbols:
        for chain in linesymbols[name]:
            p.move_to(chain[0][0] * size, chain[0][1] * size)
            for x, y in chain[1:]:
                p.line_to(x * size, y * size)
        return p, False
    if name in polygons:
        _add_polygon(p, polygons[name], size)
        return p, True
    if name in pathsymbols:
        pathsymbols[name](p, size, linewidth)
        return p, True
    raise ValueError(f"unknown marker name {name!r}")


def _scale_path(p: Path, factor: float) -> Path:
    """Return a copy of ``p`` with every point scaled by ``factor``."""
    out = Path()
    out.verbs = list(p.verbs)
    out.points = [v * factor for v in p.points]
    return out


def marker_codes() -> Tuple[str, ...]:
    """Return all marker names the abstract renderer recognises."""
    names = ['none']
    names.extend(linesymbols.keys())
    names.extend(polygons.keys())
    names.extend(pathsymbols.keys())
    return tuple(names)
