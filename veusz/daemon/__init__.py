# Veusz daemon: a headless JSON-RPC server wrapping Veusz's document
# and rendering pipeline. Designed to be driven by the Tauri 2
# frontend (`veusz-tauri/`) over a Unix domain socket.
##############################################################################

"""Veusz headless daemon.

Entrypoint is :func:`veusz.daemon.cli.main`. The shipped console
script is ``veuszd``. See the plan at
``/root/.claude/plans/yes-a-full-veusz-parallel-knuth.md`` for the
broader architecture context.
"""
