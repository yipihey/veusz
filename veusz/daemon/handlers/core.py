# Core lifecycle and introspection methods.
##############################################################################

from __future__ import annotations

from ... import utils


def register(ctx):
    def version(**_):
        return {'veusz': utils.version(), 'api': 1}

    def methods(**_):
        # Populated by the server after registration; the server inserts a
        # ``__methods__`` accessor when handing out the dict, but we keep a
        # placeholder so tests can rely on it existing.
        return {'available': True}

    return {
        'version': version,
        # 'ping' and 'shutdown' are registered by the server itself,
        # since they need access to the shutdown event.
    }
