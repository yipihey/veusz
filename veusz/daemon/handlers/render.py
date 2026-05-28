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


def _render_scene_png(document, page: int, w: int, h: int, dpi: int,
                      backend: str):
    """Render a page through a Scene backend (tiny-skia / vello).

    Captures the existing widget paint into the abstract Scene IR (no widget
    changes), then rasterises via the Rust ``_paint_ext`` extension. Returns
    ``(png_bytes, phelper)`` — the PaintHelper is reused for widget bounds /
    hit-testing, exactly like the qt path. Background is transparent to mirror
    the qt path (the page widget draws its own background)."""
    from ...paint.qt_capture import capture_document_scene
    try:
        from ...paint import _paint_ext  # type: ignore
    except ImportError as exc:
        raise RpcError(
            INVALID_PARAMS,
            f'{backend} backend unavailable: veusz.paint._paint_ext not built '
            '(run scripts/build_paint_ext.sh)') from exc
    available = _paint_ext.available_backends()
    if backend not in available:
        raise RpcError(
            INVALID_PARAMS,
            f'{backend} backend not available in this runtime '
            f'(available: {list(available)})')
    scene_json, phelper = capture_document_scene(
        document, page, pagesize_px=(int(w), int(h)), dpi=(dpi, dpi),
        with_helper=True)
    png_bytes = _paint_ext.render_scene_to_png(
        scene_json, int(w), int(h), (0.0, 0.0, 0.0, 0.0), backend)
    return png_bytes, phelper


def register(ctx):
    def png(page: int = 0, w: int = 800, h: int = 600, dpi: int = 96,
            antialias: bool = True, backend: str = 'qt', **_):
        if ctx.document is None or not ctx.document.basewidget.children:
            raise RpcError(INVALID_PARAMS, 'document has no pages')
        if backend == 'qt':
            phelper, _size = _render_helper(ctx.document, page, w, h, dpi)
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
        elif backend in ('tiny-skia', 'vello'):
            png_bytes, phelper = _render_scene_png(
                ctx.document, page, w, h, dpi, backend)
        else:
            raise RpcError(
                INVALID_PARAMS,
                f'unknown backend {backend!r}; expected qt|tiny-skia|vello')
        # Bounds/hit-test geometry is backend-independent: cache keyed without
        # backend so a switch only re-rasterises, never re-lays-out.
        ctx.cache_render((page, w, h, dpi), phelper)
        return {
            'png': base64.b64encode(png_bytes).decode('ascii'),
            'width': int(w),
            'height': int(h),
            'bounds': _bounds_map(phelper),
            'backend': backend,
        }

    def scene(page: int = 0, w: int = 800, h: int = 600, dpi: int = 96, **_):
        """Return the page as the abstract Scene IR (base64 JSON), for the
        client-side WASM/Vello renderer. Same widget capture and bounds as
        ``render.png``; the browser rasterises the scene with no Python in
        the paint path."""
        if ctx.document is None or not ctx.document.basewidget.children:
            raise RpcError(INVALID_PARAMS, 'document has no pages')
        from ...paint.qt_capture import capture_document_scene
        scene_json, phelper = capture_document_scene(
            ctx.document, page, pagesize_px=(int(w), int(h)),
            dpi=(dpi, dpi), with_helper=True)
        ctx.cache_render((page, w, h, dpi), phelper)
        return {
            'scene_b64': base64.b64encode(scene_json).decode('ascii'),
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

    def copy_image(page: int = 0, w: int = 800, h: int = 600,
                   dpi: int = 96, format: str = 'png', **_):
        """Render the page to bytes for the frontend to put on the OS
        clipboard. Mirrors the legacy "Copy as Image" action.

        ``format`` ∈ {"png", "svg"}. Returns ``{format, mime_type,
        payload_b64}`` regardless of format — base64 keeps the wire
        format uniform.
        """
        if format == 'png':
            r = png(page=page, w=w, h=h, dpi=dpi, antialias=True)
            return {
                'format': 'png',
                'mime_type': 'image/png',
                'payload_b64': r['png'],
                'width': r['width'],
                'height': r['height'],
            }
        if format == 'svg':
            r = svg(page=page, w=w, h=h, dpi=dpi)
            svg_bytes = r['svg'].encode('utf-8')
            return {
                'format': 'svg',
                'mime_type': 'image/svg+xml',
                'payload_b64': base64.b64encode(svg_bytes).decode('ascii'),
                'width': r['width'],
                'height': r['height'],
            }
        raise RpcError(INVALID_PARAMS,
                       f'unsupported format {format!r}; expected png|svg')

    return {
        'render.png': png,
        'render.scene': scene,
        'render.svg': svg,
        'render.copy_image': copy_image,
    }
