# Render RPC handlers: PNG / SVG / bounding boxes.
##############################################################################

from __future__ import annotations

import base64
import io

from ... import qtall as qt
from ...document import painthelper
from ..errors import RpcError, INVALID_PARAMS


def _resolve_path_to_widget(document, path: str):
    """Walk ``/page1/graph1/xy1`` to the widget object, or None."""
    if path in ('/', ''):
        return document.basewidget
    parts = [p for p in path.split('/') if p]
    w = document.basewidget
    for p in parts:
        next_w = None
        for c in w.children:
            if c.name == p:
                next_w = c
                break
        if next_w is None:
            return None
        w = next_w
    return w


def _bounds_map(phelper) -> dict:
    """Collect ``{path: [x1,y1,x2,y2]}`` for every widget in the render."""
    out = {}
    try:
        for widget, bounds in phelper.widgetBoundsIterator():
            out[widget.path] = [float(v) for v in bounds]
    except Exception:
        # widgetBoundsIterator may not exist in all paths; render with no bounds.
        pass
    return out


def _render_helper(document, page: int, w: float, h: float, dpi: int):
    """Build a PaintHelper, run document.paintTo, return (phelper, page_size)."""
    if page < 0 or page >= len(document.basewidget.children):
        raise RpcError(INVALID_PARAMS, f'page {page} out of range')
    page_size = (float(w), float(h))
    phelper = painthelper.PaintHelper(
        document, page_size, dpi=(dpi, dpi))
    document.paintTo(phelper, page)
    return phelper, page_size


def register(ctx):
    def png(page: int = 0, w: int = 800, h: int = 600, dpi: int = 96,
            antialias: bool = True, **_):
        if ctx.document is None or not ctx.document.basewidget.children:
            raise RpcError(INVALID_PARAMS, 'document has no pages')
        phelper, _size = _render_helper(ctx.document, page, w, h, dpi)
        ctx.cache_render((page, w, h, dpi), phelper)
        image = qt.QImage(
            int(w), int(h), qt.QImage.Format.Format_ARGB32_Premultiplied)
        image.fill(qt.Qt.GlobalColor.transparent)
        painter = qt.QPainter(image)
        if antialias:
            painter.setRenderHint(qt.QPainter.RenderHint.Antialiasing, True)
            painter.setRenderHint(qt.QPainter.RenderHint.TextAntialiasing, True)
        painter.updateMetaData(phelper) if hasattr(painter, 'updateMetaData') else None
        phelper.renderToPainter(painter)
        painter.end()
        buf = qt.QBuffer()
        buf.open(qt.QIODevice.OpenModeFlag.WriteOnly)
        image.save(buf, 'PNG')
        png_bytes = bytes(buf.data())
        return {
            'png': base64.b64encode(png_bytes).decode('ascii'),
            'width': int(w),
            'height': int(h),
            'bounds': _bounds_map(phelper),
        }

    def svg(page: int = 0, w: int = 800, h: int = 600, dpi: int = 96, **_):
        from ...document import svg_export
        if ctx.document is None or not ctx.document.basewidget.children:
            raise RpcError(INVALID_PARAMS, 'document has no pages')
        buf = io.BytesIO()
        # svg_export.SVGPaintDevice takes a file-like + size in points
        device = svg_export.SVGPaintDevice(buf, float(w) / dpi * 72,
                                            float(h) / dpi * 72)
        painter = qt.QPainter(device)
        phelper, _size = _render_helper(ctx.document, page, w, h, dpi)
        if hasattr(painter, 'updateMetaData'):
            painter.updateMetaData(phelper)
        phelper.renderToPainter(painter)
        painter.end()
        ctx.cache_render((page, w, h, dpi), phelper)
        return {
            'svg': buf.getvalue().decode('utf-8'),
            'width': int(w),
            'height': int(h),
        }

    return {
        'render.png': png,
        'render.svg': svg,
    }
