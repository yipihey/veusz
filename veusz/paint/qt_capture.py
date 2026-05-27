"""``QPainter`` subclass that captures every Python-level paint call into a Scene.

When Veusz's widget code calls a QPainter method, the call dispatches through
PyQt to our Python override here; we translate the args via
:mod:`veusz.paint.qt_translate` and push a :class:`SceneOp` onto an internal
:class:`PythonSceneRecorder`. The parent ``QPainter`` is also invoked so the
existing Qt-drawn output is preserved — that's the reference the harness diffs
against.

This is what lets the comparison harness render the existing widget corpus
through tiny-skia, PDF, and (later) Vello, **without refactoring any widget
code**. C++-originated calls from `qtloops` batches still bypass this
intercept; the audit's static + dynamic measurements bound how much of the
surface that gap covers.

Module-level Qt import is deferred so this file is importable on systems
without PyQt6 (the rest of the paint package stays usable for trace
aggregation, diff math, etc.).
"""

from __future__ import annotations

from typing import Optional

from .protocol import (
    Affine,
    Color,
    Fill,
    FillRule,
    LineCap,
    LineJoin,
    Paint,
    Path,
    Rect,
    Stroke,
)
from .scene_recorder import PythonSceneRecorder
from . import qt_translate as qtt


def _import_qt():
    """Lazy Qt import. Raises a clear error if Qt is missing."""
    from .. import qtall as qt
    return qt


# ---------------------------------------------------------------------------
# Capturing painter
# ---------------------------------------------------------------------------

def make_scene_capturing_painter(target_device, qt_module=None):
    """Build a :class:`SceneCapturingPainter` over ``target_device``.

    Constructed lazily so the qt import only happens at call time. Returns
    an instance whose ``.recorder`` is the :class:`PythonSceneRecorder`.

    The ``qt_module`` arg is a test seam: passing a fake module with a
    :class:`QPainter`-shaped base class and a :class:`QImage.Format` enum
    lets the recording-glue tests run without PyQt6 installed.
    """
    qt = qt_module if qt_module is not None else _import_qt()

    class SceneCapturingPainter(qt.QPainter):
        """``QPainter`` whose Python overrides record an abstract Scene."""

        def __init__(self, dev):
            super().__init__(dev)
            self.recorder = PythonSceneRecorder()
            # Current pen / brush kept here so we can emit a SetPaint just
            # before each draw call — QPainter's pen() / brush() are
            # always available but reading them every draw is slow.
            self._cur_pen = None
            self._cur_brush = None
            self._cur_aa = True
            # The current transform, tracked manually so concat ops give us
            # an exact :class:`Affine` without re-reading QPainter state.
            self._cur_transform = Affine.identity()

        # ---- intercept the active paint state --------------------------

        def setPen(self, *args):
            # QPainter overloads setPen(QPen), setPen(QColor), setPen(Qt.PenStyle)
            ret = super().setPen(*args)
            self._cur_pen = self.pen()
            return ret

        def setBrush(self, *args):
            ret = super().setBrush(*args)
            self._cur_brush = self.brush()
            return ret

        def setRenderHint(self, hint, on=True):
            ret = super().setRenderHint(hint, on)
            # Antialiasing is the one we care about for Paint.anti_alias.
            if int(hint) == int(qt.QPainter.RenderHint.Antialiasing):
                self._cur_aa = bool(on)
            return ret

        # ---- state stack ----------------------------------------------

        def save(self):
            self.recorder.save()
            return super().save()

        def restore(self):
            self.recorder.restore()
            # The transform tracked by the recorder is implicitly reset by
            # the Save/Restore in replay. Our local mirror needs the same.
            self._cur_transform = qtt.qtransform_to_affine(self.transform())
            return super().restore()

        # ---- transforms ------------------------------------------------

        def translate(self, *args):
            if len(args) == 1:
                dx, dy = args[0].x(), args[0].y()
            else:
                dx, dy = args
            self.recorder.concat_transform(Affine.translate(float(dx), float(dy)))
            return super().translate(*args)

        def rotate(self, angle_deg):
            import math
            theta = math.radians(float(angle_deg))
            c, s = math.cos(theta), math.sin(theta)
            self.recorder.concat_transform(Affine(c, s, -s, c, 0.0, 0.0))
            return super().rotate(angle_deg)

        def scale(self, sx, sy=None):
            if sy is None:
                sy = sx
            self.recorder.concat_transform(Affine.scale(float(sx), float(sy)))
            return super().scale(sx, sy)

        def setTransform(self, t, combine=False):
            a = qtt.qtransform_to_affine(t)
            if combine:
                self.recorder.concat_transform(a)
            else:
                self.recorder.set_transform(a)
            return super().setTransform(t, combine)

        def resetTransform(self):
            self.recorder.set_transform(Affine.identity())
            return super().resetTransform()

        # ---- clipping --------------------------------------------------

        def setClipRect(self, *args):
            # Variants: setClipRect(QRect|QRectF[, Qt.ClipOperation]).
            r = args[0]
            self.recorder.push_clip_rect(Rect(
                float(r.x()), float(r.y()),
                float(r.width()), float(r.height())))
            return super().setClipRect(*args)

        def setClipPath(self, *args):
            qpath = args[0]
            p = qtt.qpath_to_path(qpath)
            rule = qtt.qfill_rule_to_fill_rule(int(qpath.fillRule()))
            self.recorder.push_clip_path(p, rule)
            return super().setClipPath(*args)

        # ---- helper used by every draw call ---------------------------

        def _emit_paint(self, fill_only: bool = False, stroke_only: bool = False):
            stroke = None if fill_only else qtt.qpen_to_stroke(self.pen())
            fill = None if stroke_only else qtt.qbrush_to_fill(self.brush())
            self.recorder.set_paint(Paint(
                fill=fill, stroke=stroke, anti_alias=self._cur_aa,
            ))

        # ---- draw ops --------------------------------------------------

        def drawLine(self, *args):
            # QPainter::drawLine has many overloads. Use the QLineF path.
            if len(args) == 1:
                line = args[0]
                x1, y1 = line.x1(), line.y1()
                x2, y2 = line.x2(), line.y2()
            elif len(args) == 4:
                x1, y1, x2, y2 = args
            elif len(args) == 2:
                p1, p2 = args
                x1, y1 = p1.x(), p1.y()
                x2, y2 = p2.x(), p2.y()
            else:
                return super().drawLine(*args)
            self._emit_paint(stroke_only=True)
            self.recorder.stroke_path(Path.line(float(x1), float(y1),
                                                float(x2), float(y2)))
            return super().drawLine(*args)

        def drawRect(self, *args):
            # QPainter::drawRect(QRect|QRectF) or (x, y, w, h).
            if len(args) == 1:
                r = args[0]
                rect = Rect(float(r.x()), float(r.y()),
                            float(r.width()), float(r.height()))
            else:
                x, y, w, h = args
                rect = Rect(float(x), float(y), float(w), float(h))
            self._emit_paint()
            p = Path.rect(rect)
            # Fill if a brush is set; stroke if a pen is set.
            if qtt.qbrush_to_fill(self.brush()) is not None:
                self.recorder.fill_path(p)
            if qtt.qpen_to_stroke(self.pen()) is not None:
                self.recorder.stroke_path(p)
            return super().drawRect(*args)

        def drawEllipse(self, *args):
            # Approximate by building a 4-cubic-curve circle. For now we
            # delegate to Qt to draw, and capture as an unfilled rectangle
            # bounding-box marker; full conversion via Path.ellipse() lands
            # when widgets actually use this path.
            # TODO: real ellipse path via Path cubic_to.
            self._emit_paint()
            return super().drawEllipse(*args)

        def drawPath(self, qpath):
            self._emit_paint()
            p = qtt.qpath_to_path(qpath)
            rule = qtt.qfill_rule_to_fill_rule(int(qpath.fillRule()))
            if qtt.qbrush_to_fill(self.brush()) is not None:
                self.recorder.fill_path(p, rule)
            if qtt.qpen_to_stroke(self.pen()) is not None:
                self.recorder.stroke_path(p)
            return super().drawPath(qpath)

        def strokePath(self, qpath, pen):
            stroke = qtt.qpen_to_stroke(pen)
            self.recorder.set_paint(Paint(stroke=stroke,
                                          anti_alias=self._cur_aa))
            self.recorder.stroke_path(qtt.qpath_to_path(qpath))
            return super().strokePath(qpath, pen)

        def fillPath(self, qpath, brush):
            fill = qtt.qbrush_to_fill(brush)
            self.recorder.set_paint(Paint(fill=fill,
                                          anti_alias=self._cur_aa))
            rule = qtt.qfill_rule_to_fill_rule(int(qpath.fillRule()))
            self.recorder.fill_path(qtt.qpath_to_path(qpath), rule)
            return super().fillPath(qpath, brush)

        def fillRect(self, *args):
            # QPainter::fillRect(QRect|QRectF, QBrush|QColor|Qt.GlobalColor).
            if len(args) == 2:
                r, brush = args
                rect = Rect(float(r.x()), float(r.y()),
                            float(r.width()), float(r.height()))
            elif len(args) == 5:
                x, y, w, h, brush = args
                rect = Rect(float(x), float(y), float(w), float(h))
            else:
                return super().fillRect(*args)

            # brush may be QBrush or QColor; coerce.
            if hasattr(brush, "style"):
                fill = qtt.qbrush_to_fill(brush)
            else:
                fill = Fill(solid=qtt.qcolor_to_color(brush))
            self.recorder.set_paint(Paint(fill=fill, anti_alias=self._cur_aa))
            self.recorder.fill_path(Path.rect(rect))
            return super().fillRect(*args)

        def drawPolyline(self, *args):
            poly = args[0]
            pts = self._polygon_points(poly)
            self._emit_paint(stroke_only=True)
            if len(pts) >= 4:
                self.recorder.stroke_path(Path.polyline(pts, closed=False))
            return super().drawPolyline(*args)

        def drawPolygon(self, *args):
            poly = args[0]
            pts = self._polygon_points(poly)
            self._emit_paint()
            if len(pts) >= 4:
                closed = Path.polyline(pts, closed=True)
                if qtt.qbrush_to_fill(self.brush()) is not None:
                    self.recorder.fill_path(closed)
                if qtt.qpen_to_stroke(self.pen()) is not None:
                    self.recorder.stroke_path(closed)
            return super().drawPolygon(*args)

        @staticmethod
        def _polygon_points(poly):
            """Flatten a QPolygon / QPolygonF / list-of-QPointF into [x, y, ...]."""
            try:
                n = poly.count()
            except AttributeError:
                # Plain sequence of points.
                pts = []
                for p in poly:
                    pts.extend((float(p.x()), float(p.y())))
                return pts
            pts = []
            for i in range(n):
                p = poly.at(i)
                pts.extend((float(p.x()), float(p.y())))
            return pts

        def drawImage(self, *args):
            # drawImage(target_rect, QImage[, source_rect[, flags]])
            # drawImage(QPoint, QImage[, source_rect[, flags]])
            if len(args) >= 2 and hasattr(args[1], "format"):
                target = args[0]
                qimg = args[1]
                src = args[2] if len(args) >= 3 else None
                if hasattr(target, "x") and hasattr(target, "width"):
                    dst = Rect(float(target.x()), float(target.y()),
                               float(target.width()), float(target.height()))
                else:
                    # QPoint: blit at native size.
                    dst = Rect(float(target.x()), float(target.y()),
                               float(qimg.width()), float(qimg.height()))
                img = qtt.qimage_to_image(qimg)
                src_rect = None
                if src is not None and hasattr(src, "width"):
                    src_rect = Rect(float(src.x()), float(src.y()),
                                    float(src.width()), float(src.height()))
                self.recorder.draw_image(img, dst, src_rect)
            return super().drawImage(*args)

    return SceneCapturingPainter(target_device)


# ---------------------------------------------------------------------------
# Convenience: drive a Veusz document through this painter
# ---------------------------------------------------------------------------

def capture_document_scene(document, page: int, *, pagesize_px=None,
                            dpi=(96.0, 96.0)) -> bytes:
    """Render ``page`` of ``document`` through a SceneCapturingPainter and
    return the scene as JSON bytes (the format consumed by
    ``veusz.paint._paint_ext``).

    Uses Veusz's existing :class:`PaintHelper` infrastructure. The painter
    target is a dummy 1×1 QImage — we only need a valid QPaintDevice so
    QPainter accepts ``begin()``; we never read pixels off it.
    """
    qt = _import_qt()
    from ..document.painthelper import PaintHelper

    if pagesize_px is None:
        # Pull page size from the document's root page widget.
        pages = [c for c in document.basewidget.children if c.typename == "page"]
        if not pages:
            raise ValueError("document has no pages")
        page_w = pages[page]
        pagesize_px = (int(page_w.settings.width.convert(None) or 800),
                       int(page_w.settings.height.convert(None) or 600))

    # Dummy target — its only role is to satisfy QPainter::begin().
    dummy = qt.QImage(1, 1, qt.QImage.Format.Format_ARGB32_Premultiplied)
    capturing = make_scene_capturing_painter(dummy)
    capturing.setRenderHint(qt.QPainter.RenderHint.Antialiasing, True)

    helper = PaintHelper(document, pagesize_px, dpi=dpi, directpaint=capturing)
    document.paintTo(helper, page)
    capturing.end()

    return capturing.recorder.to_json()
