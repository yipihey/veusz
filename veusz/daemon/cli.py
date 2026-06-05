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
        description='Headless Veusz daemon (JSON-RPC over a Unix socket or TCP).')
    p.add_argument('--socket',
        help='Unix domain socket path to listen on (default transport)')
    p.add_argument('--tcp', metavar='HOST:PORT',
        help='also listen on TCP (e.g. 127.0.0.1:0 for an ephemeral port). '
             'For Windows / sandboxed hosts where a Unix socket is awkward.')
    p.add_argument('--token',
        help='shared secret a TCP client must send first via an "auth" request')
    p.add_argument('--deterministic', action='store_true',
        help='pin fonts/RNG/DPI for snapshot tests')
    p.add_argument('--log-json', action='store_true',
        help='emit logs as JSON lines on stderr')
    args = p.parse_args(argv)
    if not args.socket and not args.tcp:
        p.error('one of --socket or --tcp is required')
    return args


def _parse_tcp(spec: str) -> tuple[str, int]:
    host, sep, port = spec.rpartition(':')
    if not sep:
        raise SystemExit(f'--tcp must be HOST:PORT (got {spec!r})')
    return (host or '127.0.0.1', int(port))


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(sys.argv[1:] if argv is None else argv)
    # Force headless Qt before any veusz import touches QApplication.
    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    return asyncio.run(server.run(
        socket_path=args.socket,
        deterministic=args.deterministic,
        log_json=args.log_json,
        tcp=_parse_tcp(args.tcp) if args.tcp else None,
        token=args.token,
    ))


if __name__ == '__main__':
    sys.exit(main())
