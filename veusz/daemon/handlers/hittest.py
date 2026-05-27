# Hit-test + bbox handlers.
##############################################################################

from __future__ import annotations

from ..errors import RpcError, INVALID_PARAMS


def register(ctx):
    def point(page: int = 0, x: float = 0, y: float = 0, **_):
        cache = ctx.last_render()
        if cache is None:
            raise RpcError(INVALID_PARAMS,
                'no render cached; call render.png first')
        key, phelper = cache
        if key[0] != page:
            raise RpcError(INVALID_PARAMS,
                f'cached render is page {key[0]}, asked {page}')
        widget = phelper.identifyWidgetAtPoint(float(x), float(y))
        return {'path': widget.path if widget else None}

    def bbox(paths: list, **_):
        cache = ctx.last_render()
        if cache is None:
            raise RpcError(INVALID_PARAMS,
                'no render cached; call render.png first')
        _key, phelper = cache
        from .render import _resolve_path_to_widget
        out = {}
        for p in paths:
            w = _resolve_path_to_widget(ctx.document, p)
            if w is None:
                continue
            try:
                bounds = phelper.widgetBounds(w)
                if bounds is not None:
                    out[p] = [float(v) for v in bounds]
            except KeyError:
                pass
        return out

    return {
        'hittest.point': point,
        'bbox.paths': bbox,
    }
