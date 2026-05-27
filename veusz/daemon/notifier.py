# Push-notification channel from the daemon to the connected client.
##############################################################################

"""asyncio-friendly notification fan-out.

Handlers call ``ctx.notifier.publish('doc.changed', {...})`` after a
successful mutation; the server's per-client writer flushes the
JSON-RPC notification to the wire as a framed message with no ``id``.

V1 supports one writer at a time (matches the v1 server's single-
client policy). Multi-client comes in v2 along with proper
subscriptions.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from . import framing


log = logging.getLogger('veuszd.notifier')


class Notifier:
    def __init__(self):
        self._writer: asyncio.StreamWriter | None = None
        # Queue notifications produced before a client connects so the
        # frontend doesn't miss the first doc.changed.
        self._pending: list[dict] = []

    def attach(self, writer: asyncio.StreamWriter) -> None:
        self._writer = writer
        # Drain anything queued during startup
        pending = self._pending
        self._pending = []
        for msg in pending:
            self._dispatch(msg)

    def detach(self) -> None:
        self._writer = None

    def publish(self, method: str, params: dict[str, Any] | None = None) -> None:
        msg = {'jsonrpc': '2.0', 'method': method, 'params': params or {}}
        if self._writer is None:
            # No client yet — queue up to 32 messages, drop oldest beyond
            self._pending.append(msg)
            if len(self._pending) > 32:
                self._pending.pop(0)
            return
        self._dispatch(msg)

    def _dispatch(self, msg: dict) -> None:
        try:
            self._writer.write(framing.encode_message(msg))
        except Exception as e:
            log.warning('notifier write failed: %s', e)
