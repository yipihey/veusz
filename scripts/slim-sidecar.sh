#!/usr/bin/env bash
# Strip Qt/Python files Veusz doesn't need from a built sidecar.
#
# Veusz's full PyQt6 surface is exactly: QtCore, QtGui, QtWidgets,
# QtPrintSupport, QtSvg, QtSvgWidgets — plus sip and uic. Everything
# else PyQt6 ships (QtQuick, QtQml, Qt3D, QtMultimedia, QtPdf,
# QtDesigner, QtBluetooth, …) is dead weight that adds 200+ MB.
#
# Run AFTER `scripts/bundle-sidecar.sh`. Re-run `scripts/test-bundled-daemon.sh`
# afterwards to confirm nothing broke.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIPLE="${TRIPLE:-x86_64-unknown-linux-gnu}"
BUNDLE="$REPO_ROOT/veusz-tauri/sidecar/$TRIPLE"
[[ -d "$BUNDLE" ]] || { echo "no bundle at $BUNDLE" >&2; exit 2; }

# Discover the PyQt6 dir (path encodes python version + arch)
PYQT_DIR=$(find "$BUNDLE/python/lib" -maxdepth 4 -type d -name PyQt6 | head -1)
[[ -d "$PYQT_DIR" ]] || { echo "no PyQt6 dir in bundle" >&2; exit 2; }

QT6="$PYQT_DIR/Qt6"

before_size=$(du -sb "$BUNDLE" | cut -f1)
echo "→ Before: $(du -sh "$BUNDLE" | cut -f1)"

# ---------------------------------------------------------------------------
# 1. PyQt6: keep only the .so bindings Veusz imports + sip + uic.
KEEP_SUBMODULES=(
    sip QtCore QtGui QtWidgets
    QtPrintSupport QtSvg QtSvgWidgets QtDBus QtOpenGL QtXml
)
echo "→ Stripping PyQt6 Python bindings"
for f in "$PYQT_DIR"/*.so "$PYQT_DIR"/*.pyi; do
    [[ -f "$f" ]] || continue
    # PyQt6 names its bindings either `<Module>.abi3.so` (stable-ABI
    # build, the common case) or `<Module>.cpython-<ver>-<arch>.so`.
    # Both reduce to `<Module>` as the longest prefix before the first
    # dot in the basename.
    base=$(basename "$f")
    module="${base%%.*}"
    keep=0
    for k in "${KEEP_SUBMODULES[@]}"; do
        [[ "$module" == "$k" ]] && keep=1 && break
    done
    [[ $keep -eq 0 ]] && rm -f "$f"
done
# uic/ stays as a directory; everything else under PyQt6 directly should be safe to keep.

# ---------------------------------------------------------------------------
# 2. Qt6/lib: keep only the shared libs needed by the kept modules and their
# transitive Qt6 deps. We list the leaves; ldd-style walks would be more
# precise but the manual whitelist below covers every Qt6 dep of QtCore/Gui/
# Widgets/Svg/SvgWidgets/PrintSupport.
echo "→ Stripping Qt6 dynamic libraries"
KEEP_LIBS=(
    libQt6Core libQt6Gui libQt6Widgets libQt6DBus
    libQt6PrintSupport libQt6Svg libQt6SvgWidgets
    libQt6Network libQt6OpenGL libQt6XcbQpa
    # ICU is a Qt runtime dep for text rendering / locale handling.
    libicudata libicui18n libicuuc libicuio libicutu
)
for f in "$QT6/lib"/*.so* "$QT6/lib"/*.prl; do
    [[ -e "$f" ]] || continue
    base=$(basename "$f")
    # Strip suffixes to match against KEEP_LIBS
    stripped=$(echo "$base" | sed -E 's/\.(so|prl)(\.[0-9.]+)?$//')
    keep=0
    for k in "${KEEP_LIBS[@]}"; do
        [[ "$stripped" == "$k" ]] && keep=1 && break
    done
    [[ $keep -eq 0 ]] && rm -f "$f"
done

# ---------------------------------------------------------------------------
# 3. Qt6/qml — Veusz never uses QML.
[[ -d "$QT6/qml" ]] && rm -rf "$QT6/qml"

# 4. Qt6/plugins — keep only the platform + style + image + iconengines +
#    print + svg plugins. Drop multimedia/sqldrivers/position/…
echo "→ Stripping Qt6 plugins"
KEEP_PLUGINS=(
    platforms imageformats iconengines styles
    printsupport platformthemes generic
    egldeviceintegrations xcbglintegrations
)
if [[ -d "$QT6/plugins" ]]; then
    for d in "$QT6/plugins"/*/; do
        name=$(basename "$d")
        keep=0
        for k in "${KEEP_PLUGINS[@]}"; do
            [[ "$name" == "$k" ]] && keep=1 && break
        done
        [[ $keep -eq 0 ]] && rm -rf "$d"
    done
fi

# 5. Qt6/translations — large i18n bundles we don't ship to users yet.
[[ -d "$QT6/translations" ]] && rm -rf "$QT6/translations"

# 6. Python stdlib dirs that ship only tests / demos / fluff.
echo "→ Stripping Python stdlib test packages"
PYLIB=$(find "$BUNDLE/python/lib" -maxdepth 2 -type d -name "python3.*" | head -1)
for d in test idle_test turtledemo ensurepip; do
    [[ -d "$PYLIB/$d" ]] && rm -rf "$PYLIB/$d"
done
# Drop bytecode caches; they'll regenerate on first run.
find "$BUNDLE/python" -type d -name __pycache__ -prune -exec rm -rf {} \; 2>/dev/null || true

# ---------------------------------------------------------------------------
after_size=$(du -sb "$BUNDLE" | cut -f1)
saved=$((before_size - after_size))
human() { numfmt --to=iec --suffix=B "$1" 2>/dev/null || echo "$1"; }
echo "→ After:  $(du -sh "$BUNDLE" | cut -f1)"
echo "→ Saved:  $(human $saved)"

# Sanity: the launcher still runs
"$BUNDLE/veuszd" --help >/dev/null
echo "→ Launcher still works."
