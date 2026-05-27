# `veuszd` command-line entrypoint.
##############################################################################

"""Run the Veusz daemon.

Usage::

    veuszd --socket /run/user/1000/veuszd.sock
    veuszd --socket /tmp/veuszd.sock --deterministic --log-json

Exits 0 on clean shutdown; nonzero on fatal error during startup.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys

from . import server


def _parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(prog='veuszd',
        description='Headless Veusz daemon (JSON-RPC over UDS).')
    p.add_argument('--socket', required=True,
        help='Unix domain socket path to listen on')
    p.add_argument('--deterministic', action='store_true',
        help='pin fonts/RNG/DPI for snapshot tests')
    p.add_argument('--log-json', action='store_true',
        help='emit logs as JSON lines on stderr')
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(sys.argv[1:] if argv is None else argv)
    # Force headless Qt before any veusz import touches QApplication.
    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    return asyncio.run(server.run(
        socket_path=args.socket,
        deterministic=args.deterministic,
        log_json=args.log_json,
    ))


if __name__ == '__main__':
    sys.exit(main())
