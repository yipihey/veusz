#!/usr/bin/env python3
"""Build a headless (pure-Python) Veusz wheel for the browser/Pyodide embed.

The desktop wheel compiles C++ extensions (qtloops, threed, _paint_ext, …) and
needs PyQt6/sip. The browser doesn't: Qt is provided by ``veusz.qtshim`` and the
C extensions by pure-Python fallbacks (``veusz.helpers.qtloops_py`` + inert
stubs), while rasterising happens in the Vello/WASM renderer. So this builds a
wheel that is **just the Python sources + the bundled font**, with no
``ext_modules`` — small, and importable under Pyodide.

Run:  .venv/bin/python scripts/build_embed_wheel.py
Output: dist/veusz-<version>-py3-none-any.whl
"""

import os
import shutil
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = open(os.path.join(REPO, 'VERSION')).read().strip()
DIST = os.path.join(REPO, 'dist')

# Pruned from the wheel: compiled extensions (replaced by pure-Python
# fallbacks in-browser), caches, and Qt Designer UI files (GUI only).
PRUNE_SUFFIXES = ('.so', '.pyd', '.pyc', '.ui', '.cpp', '.h', '.sip')
PRUNE_DIRS = {'__pycache__'}

SETUP_PY = '''
from setuptools import setup, find_packages
setup(
    name="veusz",
    version="{version}",
    description="Veusz (headless/browser build: pure-Python, no C extensions)",
    packages=find_packages(include=["veusz", "veusz.*"]),
    package_data={{"veusz": ["embed_data/*.ttf"]}},
    include_package_data=True,
    python_requires=">=3.10",
    # numpy is provided by Pyodide; fonttools via micropip. No hard deps so the
    # wheel installs cleanly in the browser.
    install_requires=[],
)
'''


def main():
    build = tempfile.mkdtemp(prefix='veusz-embed-wheel-')
    try:
        src = os.path.join(REPO, 'veusz')
        dst = os.path.join(build, 'veusz')

        def ignore(dirpath, names):
            drop = set()
            for n in names:
                if n in PRUNE_DIRS or n.endswith(PRUNE_SUFFIXES):
                    drop.add(n)
            return drop

        shutil.copytree(src, dst, ignore=ignore)

        with open(os.path.join(build, 'setup.py'), 'w') as f:
            f.write(SETUP_PY.format(version=VERSION))
        # Avoid setuptools auto-discovery picking up the copied tree oddly.
        open(os.path.join(build, 'README.md'), 'w').write('Veusz headless wheel')

        os.makedirs(DIST, exist_ok=True)
        subprocess.run(
            [sys.executable, '-m', 'pip', 'wheel', '.', '--no-deps', '-w', DIST],
            cwd=build, check=True)

        wheels = [w for w in os.listdir(DIST)
                  if w.startswith('veusz-') and w.endswith('.whl')]
        wheels.sort(key=lambda w: os.path.getmtime(os.path.join(DIST, w)))
        latest = wheels[-1]
        size = os.path.getsize(os.path.join(DIST, latest))
        print(f'\nbuilt {latest}  ({size/1024:.0f} KB)  -> {DIST}')

        # Also copy where the Vite dev server serves it, so embed.html can load
        # it at /wheels/<wheel> without a CDN. (gitignored build artifact.)
        served = os.path.join(REPO, 'veusz-tauri', 'public', 'wheels')
        os.makedirs(served, exist_ok=True)
        shutil.copy2(os.path.join(DIST, latest), os.path.join(served, latest))
        print(f'copied -> veusz-tauri/public/wheels/{latest}')
    finally:
        shutil.rmtree(build, ignore_errors=True)


if __name__ == '__main__':
    main()
