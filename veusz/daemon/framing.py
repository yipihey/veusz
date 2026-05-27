# LSP-style Content-Length framing for the Veusz daemon.
#
#    This file is part of Veusz.
#    See COPYING for license terms.
##############################################################################

"""Length-prefixed JSON framing over a stream.

Each message is::

    Content-Length: <N>\\r\\n
    \\r\\n
    <N bytes of UTF-8 JSON>

Matches the LSP / DAP convention. Robust to embedded newlines, easy to
parse in both Python and Rust.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any


class FramingError(Exception):
    """Malformed frame on the wire."""


async def read_message(reader: asyncio.StreamReader) -> dict[str, Any] | None:
    """Read one framed JSON message; return None at clean EOF."""
    content_length: int | None = None
    while True:
        line = await reader.readline()
        if not line:
            # Clean EOF only if we haven't started a frame.
            if content_length is None:
                return None
            raise FramingError("EOF inside header")
        line = line.rstrip(b'\r\n')
        if line == b'':
            break  # end of headers
        if b':' not in line:
            raise FramingError(f"bad header line: {line!r}")
        name, _, value = line.partition(b':')
        if name.strip().lower() == b'content-length':
            try:
                content_length = int(value.strip())
            except ValueError as e:
                raise FramingError(f"bad Content-Length: {value!r}") from e
    if content_length is None:
        raise FramingError("missing Content-Length")
    if content_length < 0 or content_length > 64 * 1024 * 1024:
        raise FramingError(f"Content-Length out of range: {content_length}")
    body = await reader.readexactly(content_length)
    try:
        return json.loads(body)
    except json.JSONDecodeError as e:
        raise FramingError(f"bad JSON: {e}") from e


def encode_message(obj: dict[str, Any]) -> bytes:
    """Serialize a JSON-RPC envelope as a framed bytestring."""
    body = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    header = f"Content-Length: {len(body)}\r\n\r\n".encode('ascii')
    return header + body


async def write_message(writer: asyncio.StreamWriter, obj: dict[str, Any]) -> None:
    """Write one framed JSON message and flush."""
    writer.write(encode_message(obj))
    await writer.drain()
