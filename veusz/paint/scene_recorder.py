"""Python-side Scene recorder.

A :class:`Painter` implementation that, instead of drawing, accumulates
operations into a serializable scene. The JSON shape is the one that
``veusz-paint-core::Scene`` deserialises on the Rust side (serde's default
external enum tagging — unit variants are bare strings, struct variants are
``{Tag: {...fields...}}``, newtype variants are ``{Tag: value}``).

This is what drives the tiny-skia backend (and, later, Vello) from Python:
widget code paints into a SceneRecorder, ``finish()`` serialises to JSON,
the Rust extension ``veusz.paint._paint_ext`` rasterises and returns PNG.
"""

from __future__ import annotations

import json
from typing import Any, Optional

from .protocol import (
    Affine,
    BlendMode,
    Color,
    Fill,
    FillRule,
    Image,
    LineCap,
    LineJoin,
    Paint,
    Path,
    PathVerb,
    Quality,
    Rect,
    Stroke,
    TextLayout,
    TextStyle,
)


# ---------------------------------------------------------------------------
# Value -> JSON-ready dict converters (matching serde's external tagging)
# ---------------------------------------------------------------------------

_FILL_RULE = {FillRule.NON_ZERO: "NonZero", FillRule.EVEN_ODD: "EvenOdd"}
_LINE_CAP = {LineCap.BUTT: "Butt", LineCap.ROUND: "Round", LineCap.SQUARE: "Square"}
_LINE_JOIN = {LineJoin.MITER: "Miter", LineJoin.ROUND: "Round", LineJoin.BEVEL: "Bevel"}
_BLEND = {BlendMode.SOURCE_OVER: "SourceOver", BlendMode.MULTIPLY: "Multiply",
          BlendMode.PLUS: "Plus"}
_QUALITY = {Quality.FAST: "Fast", Quality.BALANCED: "Balanced", Quality.BEST: "Best"}
_PATH_VERB = {
    PathVerb.MOVE_TO: "MoveTo",
    PathVerb.LINE_TO: "LineTo",
    PathVerb.QUAD_TO: "QuadTo",
    PathVerb.CUBIC_TO: "CubicTo",
    PathVerb.CLOSE: "Close",
}


def _color(c: Color) -> dict:
    return {"r": float(c.r), "g": float(c.g), "b": float(c.b), "a": float(c.a)}


def _affine(m: Affine) -> dict:
    return {"a": float(m.a), "b": float(m.b), "c": float(m.c),
            "d": float(m.d), "e": float(m.e), "f": float(m.f)}


def _rect(r: Rect) -> dict:
    return {"x": float(r.x), "y": float(r.y), "w": float(r.w), "h": float(r.h)}


def _path(p: Path) -> dict:
    return {
        "verbs": [_PATH_VERB[v] for v in p.verbs],
        "points": [float(x) for x in p.points],
    }


def _fill(f: Fill) -> dict:
    if f.solid is not None:
        return {"Solid": _color(f.solid)}
    if f.linear is not None:
        return {"Linear": {
            "start": [float(f.linear.start[0]), float(f.linear.start[1])],
            "end":   [float(f.linear.end[0]),   float(f.linear.end[1])],
            "stops": [{"offset": float(s.offset), "color": _color(s.color)}
                      for s in f.linear.stops],
        }}
    if f.radial is not None:
        return {"Radial": {
            "center": [float(f.radial.center[0]), float(f.radial.center[1])],
            "radius": float(f.radial.radius),
            "stops": [{"offset": float(s.offset), "color": _color(s.color)}
                      for s in f.radial.stops],
        }}
    raise ValueError("empty Fill")  # protocol.Fill.__post_init__ already guards


def _stroke(s: Stroke) -> dict:
    return {
        "color": _color(s.color),
        "width": float(s.width),
        "dash": list(s.dash) if s.dash else None,
        "cap": _LINE_CAP[s.cap],
        "join": _LINE_JOIN[s.join],
        "miter_limit": float(s.miter_limit),
    }


def _paint(p: Paint) -> dict:
    return {
        "fill": _fill(p.fill) if p.fill is not None else None,
        "stroke": _stroke(p.stroke) if p.stroke is not None else None,
        "anti_alias": bool(p.anti_alias),
    }


def _text_layout(t: TextLayout) -> dict:
    return {
        "text": t.text,
        "style": {
            "family": t.style.family,
            "size_pt": float(t.style.size_pt),
            "weight": int(t.style.weight),
            "italic": bool(t.style.italic),
            "color": _color(t.style.color),
        },
    }


def _image(img: Image) -> dict:
    # Base64-encode the RGBA8 byte stream — Rust accepts both a base64
    # string and the legacy [u8, u8, ...] int-array form. Base64 cuts
    # bytes per image ~4x and parse time even more.
    import base64
    pixels_bytes = bytes(img.pixels) if not isinstance(img.pixels, (bytes, bytearray)) else img.pixels
    return {
        "width": int(img.width),
        "height": int(img.height),
        "pixels": base64.b64encode(pixels_bytes).decode("ascii"),
    }


# ---------------------------------------------------------------------------
# Recorder
# ---------------------------------------------------------------------------

class PythonSceneRecorder:
    """:class:`Painter` that builds a Scene as a list of JSON-ready ops.

    Call :meth:`to_json` to flatten to bytes for the PyO3 bridge, or
    :meth:`to_dict` for in-process inspection / tests.
    """

    def __init__(self) -> None:
        self._ops: list = []
        self._clip_depth = 0

    # ---- state stack ----------------------------------------------------

    def save(self) -> None:
        self._ops.append("Save")

    def restore(self) -> None:
        self._ops.append("Restore")

    # ---- transform ------------------------------------------------------

    def set_transform(self, m: Affine) -> None:
        self._ops.append({"SetTransform": _affine(m)})

    def concat_transform(self, m: Affine) -> None:
        self._ops.append({"ConcatTransform": _affine(m)})

    # ---- clip -----------------------------------------------------------

    def push_clip_rect(self, r: Rect) -> None:
        self._ops.append({"PushClipRect": _rect(r)})
        self._clip_depth += 1

    def push_clip_path(self, p: Path, rule: FillRule = FillRule.NON_ZERO) -> None:
        self._ops.append({"PushClipPath": {"path": _path(p), "rule": _FILL_RULE[rule]}})
        self._clip_depth += 1

    def pop_clip(self) -> None:
        if self._clip_depth <= 0:
            raise RuntimeError("pop_clip without matching push_clip_*")
        self._ops.append("PopClip")
        self._clip_depth -= 1

    # ---- paint state ----------------------------------------------------

    def set_paint(self, p: Paint) -> None:
        self._ops.append({"SetPaint": _paint(p)})

    def set_blend_mode(self, m: BlendMode) -> None:
        self._ops.append({"SetBlendMode": _BLEND[m]})

    def set_quality(self, q: Quality) -> None:
        self._ops.append({"SetQuality": _QUALITY[q]})

    # ---- geometry -------------------------------------------------------

    def stroke_path(self, p: Path) -> None:
        self._ops.append({"StrokePath": _path(p)})

    def fill_path(self, p: Path, rule: FillRule = FillRule.NON_ZERO) -> None:
        self._ops.append({"FillPath": {"path": _path(p), "rule": _FILL_RULE[rule]}})

    def draw_image(self, img: Image, dst: Rect, src: Optional[Rect] = None) -> None:
        self._ops.append({"DrawImage": {
            "image": _image(img),
            "dst": _rect(dst),
            "src": _rect(src) if src is not None else None,
        }})

    # ---- text -----------------------------------------------------------

    def draw_text(self, layout: TextLayout, x: float, y: float) -> None:
        self._ops.append({"DrawText": {
            "layout": _text_layout(layout),
            "x": float(x), "y": float(y),
        }})

    # ---- lifecycle ------------------------------------------------------

    def finish(self) -> None:
        # The recorder owns its buffer; nothing to flush.
        pass

    # ---- output ---------------------------------------------------------

    def to_dict(self) -> dict:
        return {"ops": list(self._ops)}

    def to_json(self) -> bytes:
        return json.dumps(self.to_dict(), separators=(",", ":")).encode("utf-8")

    @property
    def op_count(self) -> int:
        return len(self._ops)
