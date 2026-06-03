"""Unit tests for the pure-Python resampleNonlinearImage fallback.

This is the function that lets log-spaced (non-uniform) image bins render in the
browser / headless, where the C++ qtloops extension is absent. It maps each
output plotter pixel to the source bin its centre falls in, using the pixel
edges — so the test drives the index maths directly with a tiny known image.
"""

from __future__ import annotations

import numpy as N
import pytest


class _StubImage:
    """Minimal QImage stand-in: carries raw BGRA bytes like qtshim's QImage."""
    def __init__(self, w, h, fmt='ARGB32'):
        self._w, self._h, self._fmt = int(w), int(h), fmt
        self._pixels = None

    def width(self):
        return self._w

    def height(self):
        return self._h

    def format(self):
        return self._fmt


# B, G, R, A
RED = bytes((0, 0, 255, 255))
GREEN = bytes((0, 255, 0, 255))
BLUE = bytes((255, 0, 0, 255))
WHITE = bytes((255, 255, 255, 255))


@pytest.fixture
def resample(monkeypatch):
    from veusz.helpers import qtloops_py
    # output images are built with qt.QImage; swap in the settable stub so the
    # test runs whether or not real PyQt is present.
    monkeypatch.setattr(qtloops_py.qt, 'QImage', _StubImage)
    return qtloops_py.resampleNonlinearImage


def _arr(img):
    return N.frombuffer(img._pixels, dtype=N.uint8).reshape(img.height(),
                                                            img.width(), 4)


def _src_2x2():
    # 2x2, rows top-down: row0 = [RED, GREEN], row1 = [BLUE, WHITE]
    img = _StubImage(2, 2)
    img._pixels = RED + GREEN + BLUE + WHITE
    return img


def test_uniform_edges_map_quadrants(resample):
    src = _src_2x2()
    # x edges ascending [0,5,10]; y edges descending [10,5,0] (normal up axis)
    out = resample(src, 0, 0, 10, 10, [0, 5, 10], [10, 5, 0])
    a = _arr(out)
    assert a.shape == (10, 10, 4)
    # top-left = source (row0,col0) = RED ; top-right = GREEN
    assert tuple(a[2, 2]) == tuple(RED)
    assert tuple(a[2, 7]) == tuple(GREEN)
    # bottom-left = BLUE ; bottom-right = WHITE
    assert tuple(a[7, 2]) == tuple(BLUE)
    assert tuple(a[7, 7]) == tuple(WHITE)


def test_nonuniform_x_edge_shifts_boundary(resample):
    src = _src_2x2()
    # x boundary pushed to 2 (log-like): px<2 → col0, px>=2 → col1
    out = resample(src, 0, 0, 10, 10, [0, 2, 10], [10, 5, 0])
    a = _arr(out)
    # near top row, px=1.5 is col0 (RED), px=3.5 is col1 (GREEN)
    assert tuple(a[2, 1]) == tuple(RED)
    assert tuple(a[2, 3]) == tuple(GREEN)


def test_passthrough_when_no_pixels(resample):
    img = _StubImage(2, 2)  # no _pixels
    assert resample(img, 0, 0, 10, 10, [0, 5, 10], [10, 5, 0]) is img


def test_degenerate_rect_returns_input(resample):
    src = _src_2x2()
    assert resample(src, 5, 5, 5, 12, [0, 5, 10], [10, 5, 0]) is src
