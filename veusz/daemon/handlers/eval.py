# Python escape-hatch — for power users; not used by the generic inspector.
##############################################################################

from __future__ import annotations

import contextlib
import io


def register(ctx):
    def python(code: str, capture_stdout: bool = True, **_):
        from ...document.commandinterpreter import CommandInterpreter
        cache = getattr(ctx, '_eval_interp', None)
        if cache is None or cache.document is not ctx.document:
            cache = CommandInterpreter(ctx.document)
            ctx._eval_interp = cache
        out = io.StringIO()
        err = io.StringIO()
        result = None
        if capture_stdout:
            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                try:
                    result = eval(compile(code, '<rpc>', 'eval'), cache.globals)
                except SyntaxError:
                    exec(compile(code, '<rpc>', 'exec'), cache.globals)
        else:
            try:
                result = eval(compile(code, '<rpc>', 'eval'), cache.globals)
            except SyntaxError:
                exec(compile(code, '<rpc>', 'exec'), cache.globals)
        return {
            'result': repr(result) if result is not None else None,
            'stdout': out.getvalue(),
            'stderr': err.getvalue(),
        }

    return {
        'eval.python': python,
    }
