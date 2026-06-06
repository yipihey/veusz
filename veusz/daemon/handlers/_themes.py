##############################################################################
# Document theme presets.
#
# A "theme" here is a curated *bundle* of existing Veusz style primitives —
# the auto-colour sequence (root ``/colorTheme``), a set of master
# ``/StyleSheet/...`` defaults (fonts, line widths, gridlines, panel/border
# fills) and, where needed, document custom ``foreground``/``background``
# colours (for dark mode). Veusz has no single "theme" object, so a theme is
# applied as one batched, undoable operation that writes this fixed schema.
#
# Every theme provides a value for *every* path in ``_BASE`` so switching
# themes is idempotent — a setting one theme changes is always restored by the
# next, never left dangling. Font families are resolved to whatever serif/sans
# family the host actually has (mirroring stylesheet._registerFontStyleSheet),
# so a theme never names a font that renders as tofu.
##############################################################################

from __future__ import annotations

# Preference-ordered font families; first available wins, last is the generic
# fallback (always "works" — the renderer substitutes).
_SERIF = [
    'Times New Roman', 'Liberation Serif', 'DejaVu Serif',
    'Bitstream Vera Serif', 'Nimbus Roman', 'Times', 'Georgia', 'serif',
]
_SANS = [
    'Helvetica Neue', 'Helvetica', 'Arial', 'Liberation Sans',
    'DejaVu Sans', 'Nimbus Sans', 'Verdana', 'sans-serif',
]

_family_cache: dict = {}


def _resolve_family(prefs):
    """Best available family from a preference list (cached)."""
    key = tuple(prefs)
    if key in _family_cache:
        return _family_cache[key]
    fam = prefs[-1]
    try:
        from ... import qtall as qt
        avail = set(qt.QFontDatabase.families())
        for f in prefs:
            if f in avail:
                fam = f
                break
    except Exception:
        # No Qt (pure-python wheel) — keep the generic fallback.
        pass
    _family_cache[key] = fam
    return fam


def _serif():
    return _resolve_family(_SERIF)


def _sans():
    return _resolve_family(_SANS)


# The canonical themeable-path schema, with the stock-Veusz values. Every
# preset below is `dict(_BASE(), **overrides)`, so all presets write the same
# keys.
def _base():
    return {
        '/colorTheme': 'default-latest',
        '/StyleSheet/Font/font': _serif(),
        '/StyleSheet/Font/size': '14pt',
        '/StyleSheet/Font/color': 'foreground',
        '/StyleSheet/Line/width': '0.5pt',
        '/StyleSheet/Line/color': 'foreground',
        '/StyleSheet/page/Background/hide': True,
        '/StyleSheet/page/Background/color': 'background',
        '/StyleSheet/graph/Background/hide': False,
        '/StyleSheet/graph/Background/color': 'background',
        '/StyleSheet/graph/Border/hide': False,
        '/StyleSheet/graph/Border/color': 'foreground',
        '/StyleSheet/graph/Border/width': '0.5pt',
        '/StyleSheet/axis/Line/hide': False,
        '/StyleSheet/axis/MajorTicks/hide': False,
        '/StyleSheet/axis/MinorTicks/hide': False,
        '/StyleSheet/axis/GridLines/hide': True,
        '/StyleSheet/axis/GridLines/color': 'grey',
        '/StyleSheet/axis/GridLines/style': 'dotted',
        '/StyleSheet/axis/GridLines/width': '0.5pt',
        '/StyleSheet/axis/MinorGridLines/hide': True,
        '/StyleSheet/axis/MinorGridLines/color': 'lightgrey',
        '/StyleSheet/axis/MinorGridLines/style': 'dotted',
        '/StyleSheet/axis/MinorGridLines/width': '0.5pt',
    }


_LIGHT = {'foreground': '#000000', 'background': '#ffffff'}

# Each entry: (id, label, description, settings-overrides, colour-overrides).
# Colour overrides redefine the document's `foreground`/`background` custom
# colours; everything that defaults to them (text, axis lines, borders…)
# follows. Light themes pin them back to black/white so switching off dark
# mode restores cleanly.
_THEMES = [
    (
        'default', 'Veusz Default',
        'The out-of-the-box Veusz look.',
        {}, dict(_LIGHT),
    ),
    (
        'publication', 'Publication',
        'Serif text, thin lines and no gridlines — journal-ready.',
        {
            '/colorTheme': 'colorbrewer1',
            '/StyleSheet/Font/font': _serif(),
            '/StyleSheet/Font/size': '12pt',
            '/StyleSheet/Line/width': '0.75pt',
            '/StyleSheet/graph/Border/width': '0.75pt',
        },
        dict(_LIGHT),
    ),
    (
        'minimal', 'Minimal Light',
        'Sans-serif with a faint solid grid and no plot border.',
        {
            '/colorTheme': 'colorbrewer2',
            '/StyleSheet/Font/font': _sans(),
            '/StyleSheet/Font/size': '12pt',
            '/StyleSheet/graph/Border/hide': True,
            '/StyleSheet/axis/MinorTicks/hide': True,
            '/StyleSheet/axis/GridLines/hide': False,
            '/StyleSheet/axis/GridLines/color': 'lightgrey',
            '/StyleSheet/axis/GridLines/style': 'solid',
        },
        {'foreground': '#333333', 'background': '#ffffff'},
    ),
    (
        'ggplot2', 'ggplot2',
        "Grey panel with white gridlines, like R's ggplot2.",
        {
            '/colorTheme': 'default1',
            '/StyleSheet/Font/font': _sans(),
            '/StyleSheet/Font/size': '11pt',
            '/StyleSheet/graph/Background/color': '#ebebeb',
            '/StyleSheet/graph/Border/hide': True,
            '/StyleSheet/axis/Line/hide': True,
            '/StyleSheet/axis/MajorTicks/hide': True,
            '/StyleSheet/axis/MinorTicks/hide': True,
            '/StyleSheet/axis/GridLines/hide': False,
            '/StyleSheet/axis/GridLines/color': 'white',
            '/StyleSheet/axis/GridLines/style': 'solid',
            '/StyleSheet/axis/GridLines/width': '1pt',
            '/StyleSheet/axis/MinorGridLines/hide': False,
            '/StyleSheet/axis/MinorGridLines/color': 'white',
            '/StyleSheet/axis/MinorGridLines/style': 'solid',
        },
        {'foreground': '#4d4d4d', 'background': '#ffffff'},
    ),
    (
        'seaborn', 'Seaborn',
        'Muted palette on a light panel with a white grid.',
        {
            '/colorTheme': 'colorbrewer2',
            '/StyleSheet/Font/font': _sans(),
            '/StyleSheet/Font/size': '11pt',
            '/StyleSheet/graph/Background/color': '#eaeaf2',
            '/StyleSheet/graph/Border/hide': True,
            '/StyleSheet/axis/Line/hide': True,
            '/StyleSheet/axis/MajorTicks/hide': True,
            '/StyleSheet/axis/MinorTicks/hide': True,
            '/StyleSheet/axis/GridLines/hide': False,
            '/StyleSheet/axis/GridLines/color': 'white',
            '/StyleSheet/axis/GridLines/style': 'solid',
            '/StyleSheet/axis/GridLines/width': '1pt',
        },
        {'foreground': '#2e2e2e', 'background': '#ffffff'},
    ),
    (
        'dark', 'Dark',
        'Light-on-dark for screens and slides.',
        {
            '/colorTheme': 'default1',
            '/StyleSheet/Font/font': _sans(),
            '/StyleSheet/Font/size': '13pt',
            '/StyleSheet/page/Background/hide': False,
            '/StyleSheet/graph/Background/color': 'background',
            '/StyleSheet/axis/GridLines/hide': False,
            '/StyleSheet/axis/GridLines/color': '#3a3a3a',
            '/StyleSheet/axis/GridLines/style': 'solid',
        },
        {'foreground': '#e6e6e6', 'background': '#1e1e1e'},
    ),
    (
        'grayscale', 'Grayscale / Print',
        'All-black serif with no grid — for black-and-white printing. '
        '(Distinguish series with line/marker styles.)',
        {
            '/colorTheme': 'black',
            '/StyleSheet/Font/font': _serif(),
            '/StyleSheet/Font/size': '12pt',
            '/StyleSheet/Line/width': '0.75pt',
        },
        dict(_LIGHT),
    ),
    (
        'presentation', 'Presentation',
        'Large sans-serif and thick lines for projection.',
        {
            '/colorTheme': 'colorbrewer1',
            '/StyleSheet/Font/font': _sans(),
            '/StyleSheet/Font/size': '20pt',
            '/StyleSheet/Line/width': '2pt',
            '/StyleSheet/graph/Border/width': '1.5pt',
        },
        dict(_LIGHT),
    ),
]


# Named colours that may appear in a theme's colour palette — mapped to hex so
# the frontend can paint swatches without resolving against the document.
_NAME_TO_HEX = {
    'black': '#000000', 'white': '#ffffff', 'grey': '#808080',
    'lightgrey': '#d3d3d3', 'red': '#ff0000', 'green': '#00ff00',
    'blue': '#0000ff', 'foreground': '#000000', 'background': '#ffffff',
}


def _palette_hex(color_theme, limit=10):
    """The auto-colour sequence for a named colorTheme, as hex, for preview."""
    try:
        from ...document import colors as doccolors
        names = doccolors.colorthemes.get(color_theme, [])
    except Exception:
        names = []
    out = []
    for c in names[:limit]:
        c = str(c)
        out.append(_NAME_TO_HEX.get(c.lower(), c if c.startswith('#') else
                                    _NAME_TO_HEX.get(c.lower(), '#888888')))
    return out


def settings_for(theme_id):
    """Full settings dict (path -> value) for a theme, or None if unknown."""
    for tid, _label, _desc, overrides, _colors in _THEMES:
        if tid == theme_id:
            return dict(_base(), **overrides)
    return None


def colors_for(theme_id):
    """foreground/background override dict for a theme, or None if unknown."""
    for tid, _label, _desc, _overrides, colors in _THEMES:
        if tid == theme_id:
            return dict(colors)
    return None


def catalog():
    """The theme list for the dropdown, each with a small preview spec."""
    out = []
    for tid, label, desc, overrides, colors in _THEMES:
        merged = dict(_base(), **overrides)
        out.append({
            'id': tid,
            'label': label,
            'description': desc,
            'palette': _palette_hex(merged['/colorTheme']),
            'colorTheme': merged['/colorTheme'],
            'font': merged['/StyleSheet/Font/font'],
            'fg': colors.get('foreground', '#000000'),
            'bg': colors.get('background', '#ffffff'),
        })
    return out
