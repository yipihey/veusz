# Preferences RPC — thin wrapper over Veusz's settingdb.
##############################################################################

"""prefs.{get, set, list, default_get, delete}.

Backed by ``veusz.setting.settingdb``, which Veusz already uses for
window geometry / recent files / locale / etc. and persists across
launches. This handler is namespaced separately from `doc.*` and
`file.recent_*` because preferences are *user-scoped* (UI defaults,
theme, last-used DPI) while those touch documents or files.

Per the plan, the frontend will eventually mirror part of this into
the WebView's localStorage for things that don't need cross-launch
persistence. v1 just round-trips through settingdb.
"""

from __future__ import annotations

from ..errors import RpcError, INVALID_PARAMS


# Preferences exposed to the frontend, with a default if unset and a
# stable JSON-safe type. Other settingdb keys (recent files, geometry
# etc.) remain managed by their own subsystems.
_PREFS_SCHEMA: dict[str, dict] = {
    'render.default_dpi':       {'type': 'number',  'default': 96,    'min': 36, 'max': 600},
    'render.default_width':     {'type': 'integer', 'default': 800,   'min': 100, 'max': 8000},
    'render.default_height':    {'type': 'integer', 'default': 600,   'min': 100, 'max': 8000},
    'render.antialias':         {'type': 'boolean', 'default': True},
    'render.coalesce_ms':       {'type': 'integer', 'default': 33,    'min': 0, 'max': 1000},
    'export.default_format':    {'type': 'string',  'default': 'pdf',
                                 'choices': ['pdf', 'png', 'svg', 'eps']},
    'export.pdf_dpi':           {'type': 'integer', 'default': 72,    'min': 36, 'max': 600},
    'csv.default_encoding':     {'type': 'string',  'default': 'utf-8'},
    'plot.live_preview':        {'type': 'boolean', 'default': True},
    # Plot-canvas right-click toggles. Antialias drives render.png's
    # antialias flag; update_policy mirrors the legacy "Updates" menu
    # (disable / on-change / timed interval in seconds).
    'plot.antialias':           {'type': 'boolean', 'default': True},
    'plot.update_policy':       {'type': 'string',  'default': 'change',
                                 'choices': ['disable', 'change',
                                             '0.1', '0.5', '1', '2', '5', '10']},
    # Active paint backend / render path for the plot canvas. qt /
    # tiny-skia / vello render server-side (PNG over render.png);
    # vello-wasm renders client-side in the browser (render.scene +
    # WebGPU), degrading to server-side vello where WebGPU is absent.
    'plot.backend':             {'type': 'string',  'default': 'qt',
                                 'choices': ['qt', 'tiny-skia', 'vello',
                                             'vello-gpu', 'vello-wasm']},
    'ui.theme':                 {'type': 'string',  'default': 'system',
                                 'choices': ['system', 'light', 'dark']},
    'ui.font_size':             {'type': 'integer', 'default': 13,    'min': 9, 'max': 24},
}


def _validate(key: str, value):
    sch = _PREFS_SCHEMA.get(key)
    if sch is None:
        raise RpcError(INVALID_PARAMS, f'unknown preference: {key}')
    t = sch['type']
    if t == 'boolean':
        if not isinstance(value, bool):
            raise RpcError(INVALID_PARAMS, f'{key}: expected boolean')
    elif t == 'integer':
        if not isinstance(value, int) or isinstance(value, bool):
            raise RpcError(INVALID_PARAMS, f'{key}: expected integer')
        if 'min' in sch and value < sch['min']:
            raise RpcError(INVALID_PARAMS, f'{key}: below min {sch["min"]}')
        if 'max' in sch and value > sch['max']:
            raise RpcError(INVALID_PARAMS, f'{key}: above max {sch["max"]}')
    elif t == 'number':
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            raise RpcError(INVALID_PARAMS, f'{key}: expected number')
        if 'min' in sch and value < sch['min']:
            raise RpcError(INVALID_PARAMS, f'{key}: below min {sch["min"]}')
        if 'max' in sch and value > sch['max']:
            raise RpcError(INVALID_PARAMS, f'{key}: above max {sch["max"]}')
    elif t == 'string':
        if not isinstance(value, str):
            raise RpcError(INVALID_PARAMS, f'{key}: expected string')
        if 'choices' in sch and value not in sch['choices']:
            raise RpcError(INVALID_PARAMS,
                f'{key}: not in {sch["choices"]}')
    else:
        raise RpcError(INVALID_PARAMS, f'{key}: unknown type {t!r}')


def _store_key(key: str) -> str:
    """Settingdb key namespace. Veusz uses bare keys; we prefix to
    avoid colliding with the existing GUI's namespace."""
    return f'tauri.{key}'


def register(ctx):
    def get(key: str, **_):
        if key not in _PREFS_SCHEMA:
            raise RpcError(INVALID_PARAMS, f'unknown preference: {key}')
        from ... import setting as _setting
        sk = _store_key(key)
        if sk in _setting.settingdb:
            return {'key': key, 'value': _setting.settingdb[sk]}
        return {'key': key, 'value': _PREFS_SCHEMA[key]['default']}

    def set_(key: str, value, **_):
        _validate(key, value)
        from ... import setting as _setting
        _setting.settingdb[_store_key(key)] = value
        return {'ok': True, 'key': key, 'value': value}

    def delete(key: str, **_):
        if key not in _PREFS_SCHEMA:
            raise RpcError(INVALID_PARAMS, f'unknown preference: {key}')
        from ... import setting as _setting
        sk = _store_key(key)
        if sk in _setting.settingdb:
            del _setting.settingdb[sk]
        return {'ok': True}

    def list_(**_):
        """Return the full schema + current values."""
        from ... import setting as _setting
        out = []
        for key, sch in _PREFS_SCHEMA.items():
            sk = _store_key(key)
            value = _setting.settingdb[sk] if sk in _setting.settingdb else sch['default']
            out.append({
                'key': key, 'value': value, 'default': sch['default'],
                'type': sch['type'],
                **{k: sch[k] for k in ('min', 'max', 'choices') if k in sch},
            })
        return out

    return {
        'prefs.get': get,
        'prefs.set': set_,
        'prefs.delete': delete,
        'prefs.list': list_,
    }
