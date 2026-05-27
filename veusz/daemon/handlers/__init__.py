# Handler registry for the Veusz daemon.
#
#    This file is part of Veusz.
#    See COPYING for license terms.
##############################################################################

"""Collect all RPC method handlers and expose them as a flat dict.

Each handler module defines a ``register(ctx) -> dict[str, callable]``
function that returns the methods it owns, keyed by their dotted RPC
name (e.g. ``"doc.schema"``). The dispatcher only knows about this dict.
"""

from __future__ import annotations

from typing import Callable

from . import core, data, doc, render, hittest, state, eval as eval_handler, file as file_handler


_MODULES = (core, data, doc, render, hittest, state, eval_handler, file_handler)


def all_handlers(ctx) -> dict[str, Callable]:
    out: dict[str, Callable] = {}
    for mod in _MODULES:
        for name, fn in mod.register(ctx).items():
            if name in out:
                raise RuntimeError(f'duplicate RPC method: {name}')
            out[name] = fn
    return out
