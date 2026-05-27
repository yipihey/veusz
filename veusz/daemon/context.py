# Daemon-wide context: QApplication, Document, caches.
#
#    This file is part of Veusz.
#    See COPYING for license terms.
##############################################################################

"""The single shared `Context` passed to every handler.

Holds the singleton QApplication, the current Document, the most-recent
PaintHelper (cached so hit-test and bbox queries don't re-render), and
whatever determinism toggles are active. One instance per daemon; not
thread-safe — all daemon work runs on the asyncio thread.
"""

from __future__ import annotations

import logging
import os
import sys

from .. import qtall as qt
from .. import document as vzdoc


log = logging.getLogger('veuszd.context')


class Context:
    def __init__(self, deterministic: bool = False):
        self.deterministic = deterministic
        self.app: qt.QApplication | None = None
        self.document: vzdoc.Document | None = None
        # Cached painthelper from the latest render. Keyed by (page, w, h, dpi).
        self._last_render = None  # tuple (key, painthelper) or None
        # Operation history for snapshot/restore.
        self._snapshots: dict[str, bytes] = {}

    # -- startup -----------------------------------------------------------

    def startup(self) -> None:
        """One-shot initialization: QApplication, widget registration, doc."""
        os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
        app = qt.QApplication.instance()
        if app is None:
            app = qt.QApplication(sys.argv if sys.argv else [''])
        app.setQuitOnLastWindowClosed(False)
        self.app = app
        # Trigger widget + dataimport registration (otherwise the
        # widgetfactory is empty and Document() crashes).
        from .. import widgets  # noqa: F401
        from .. import dataimport  # noqa: F401
        if self.deterministic:
            self._apply_determinism()
        self.document = vzdoc.Document()
        log.info('daemon ready: deterministic=%s', self.deterministic)

    def _apply_determinism(self) -> None:
        """Pin fonts/RNG/DPI for snapshot tests."""
        # The plan calls for: locked DPI=96, seeded RNG, font pinning,
        # animations disabled. Animations don't exist in the render
        # pipeline (verified). DPI and seed are honored by render
        # handlers. Font pinning happens via QFontDatabase substitutions
        # — implemented when the bundled font subset is wired up.
        import random
        random.seed(0)
        try:
            import numpy as np
            np.random.seed(0)
        except Exception:
            pass

    # -- helpers used by handlers -----------------------------------------

    def cache_render(self, key, painthelper) -> None:
        self._last_render = (key, painthelper)

    def last_render(self):
        return self._last_render

    def snapshot(self, name: str, data: bytes) -> None:
        self._snapshots[name] = data

    def get_snapshot(self, name: str) -> bytes | None:
        return self._snapshots.get(name)
