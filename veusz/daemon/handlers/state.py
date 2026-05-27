# State snapshot/restore — used for deterministic test injection.
##############################################################################

from __future__ import annotations

import base64
import io


def register(ctx):
    def snapshot(**_):
        """Serialize the current document into Veusz's save-text form."""
        buf = io.StringIO()
        ctx.document.saveToFile(buf)
        return {'blob': base64.b64encode(buf.getvalue().encode('utf-8')).decode('ascii')}

    def restore(blob: str, **_):
        """Replace the document by replaying a snapshot blob."""
        text = base64.b64decode(blob.encode('ascii')).decode('utf-8')
        ctx.document.wipe()
        from ...document.commandinterpreter import CommandInterpreter
        ci = CommandInterpreter(ctx.document)
        ci.runFile(io.StringIO(text)) if hasattr(ci, 'runFile') else ci.run(text)
        return {'ok': True, 'changeset': ctx.document.changeset}

    return {
        'state.snapshot': snapshot,
        'state.restore': restore,
    }
