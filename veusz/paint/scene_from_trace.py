"""Convert the C++ ``RecordPaintEngine`` scene-dump JSONL into a Scene JSON.

The C++ recordpaint engine, when ``VEUSZ_RECORDPAINT_SCENE=path`` is set,
writes one ``SceneOp`` per line in the JSON format ``veusz-paint-core``'s
serde Deserialize expects. This module:

  1. On first import, ensures ``VEUSZ_RECORDPAINT_SCENE`` points at a
     stable per-process tempfile (the env var is captured by the C++
     extension at first paint and cached, so we can't swap paths
     per-render — only truncate the file).
  2. :func:`capture_document_scene_via_trace` truncates that tempfile,
     drives Veusz's normal C++ recordpaint pipeline (one widget = one
     RecordPaintDevice = one RecordPaintEngine, each emitting scene ops
     during widget paint), reads back the JSONL, wraps the ops in a
     ``Scene`` JSON object.

This captures all QPainter calls including those originating from C++
helpers (``qtloops.plotPathsToPainter`` and friends) — the Python-side
:mod:`veusz.paint.qt_capture` cannot see those. Closes plan R9.
"""

from __future__ import annotations

import json
import os
import tempfile
from typing import Optional

ENV_VAR = "VEUSZ_RECORDPAINT_SCENE"


def _bootstrap_trace_path() -> str:
    """Ensure ENV_VAR is set to a stable tempfile path. Called once on
    module import — the C++ side caches the env var on first paint, so
    later changes are ignored.

    Honours an existing value if the user set it explicitly.
    """
    existing = os.environ.get(ENV_VAR)
    if existing:
        return existing
    fd, path = tempfile.mkstemp(prefix="veusz-scene-", suffix=".jsonl")
    os.close(fd)
    os.environ[ENV_VAR] = path
    return path


_TRACE_PATH = _bootstrap_trace_path()


def capture_document_scene_via_trace(document, page: int = 0,
                                      *, dpi=(96.0, 96.0),
                                      pagesize_px: Optional[tuple] = None) -> bytes:
    """Render ``page`` of ``document`` through Veusz's normal C++ recordpaint
    pipeline with the scene-JSONL channel enabled, then read the JSONL back
    and wrap it in a ``Scene`` JSON object.

    Captures C++-originated QPainter calls from ``qtloops`` too — the
    fast-path geometry the Python intercept misses.
    """
    import gc
    from ..document.painthelper import PaintHelper

    # The C++ recordpaint engine emits a "Restore" SceneOp on QPainter::end()
    # — but Python's GC may have left QPainters from a previous render still
    # alive. Force collection so their pending Restores fire BEFORE we
    # capture the offset, otherwise they leak into this render's slice and
    # imbalance the Save/Restore state stack downstream.
    gc.collect()

    # Read-from-offset semantics: capture current file size, do the paint,
    # then read everything written after that point. Avoids races with the
    # C++ side's buffered writes during truncation.
    try:
        offset_before = os.path.getsize(_TRACE_PATH)
    except OSError:
        offset_before = 0

    # Resolve page-pixel size if not supplied.
    if pagesize_px is None:
        pages = [c for c in document.basewidget.children
                 if c.typename == "page"]
        if not pages:
            raise ValueError("document has no pages")
        pw = pages[page]
        tmp = PaintHelper(document, (800, 600), dpi=dpi)
        try:
            w = int(pw.settings.get("width").convert(tmp))
            h = int(pw.settings.get("height").convert(tmp))
        except Exception:
            w, h = 800, 600
        pagesize_px = (max(w, 1), max(h, 1))

    # Drive the paint via Veusz's existing PaintHelper pipeline. Each widget
    # paints into its own RecordPaintDevice; our instrumented engine emits
    # scene ops to the JSONL file as a side effect of every QPainter call.
    helper = PaintHelper(document, pagesize_px, dpi=dpi)
    document.paintTo(helper, page)
    # Drop the helper + all per-widget RecordPainters so QPainter::end()
    # fires and our scene-frame Restores are written BEFORE we read.
    del helper
    gc.collect()

    # Read everything appended since offset_before.
    ops = []
    with open(_TRACE_PATH, "rb") as fp:
        fp.seek(offset_before)
        for line in fp:
            line = line.strip()
            if not line:
                continue
            try:
                ops.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    # Balance Save/Restore across the slice. The C++ side emits "Restore"
    # on QPainter::end(), which Python's GC may fire at arbitrary points
    # across render boundaries — so a slice can have orphan "Restore"s
    # whose matching "Save" was below offset_before, or orphan "Save"s
    # whose Restore lands above the next slice's offset. We rewrite the
    # op stream so the depth never goes negative and ends at zero: drop
    # any Restore that would underflow; append Restores to close trailing
    # opens.
    balanced = []
    depth = 0
    for o in ops:
        if o == "Restore":
            if depth == 0:
                continue  # orphaned — belongs to a previous slice
            depth -= 1
        elif o == "Save":
            depth += 1
        balanced.append(o)
    while depth > 0:
        balanced.append("Restore")
        depth -= 1
    ops = balanced

    scene = {"ops": ops}
    return json.dumps(scene, separators=(",", ":")).encode("utf-8")
