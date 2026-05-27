"""Regenerate the golden schema file.

Run::

    python tests/daemon/regen_golden.py

Commit the result alongside the change that prompted regeneration.
"""

from __future__ import annotations

import json
import os
import sys

os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')


def main() -> int:
    from PyQt6.QtWidgets import QApplication
    if QApplication.instance() is None:
        QApplication(sys.argv if sys.argv else [''])
    from veusz import widgets  # noqa: F401
    from veusz.daemon.schema import extract_all_schemas

    schemas = extract_all_schemas('class')
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, 'fixtures', 'schema_golden.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(schemas, f, indent=2, sort_keys=True)
    n_settings = sum(
        len(s['settings']) + sum(len(g['settings']) for g in s['subgroups'])
        for s in schemas.values()
    )
    print(f'wrote {len(schemas)} widget schemas ({n_settings} setting leaves) to {path}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
