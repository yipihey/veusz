#!/usr/bin/env bash
# Build the `veusz.paint._paint_ext` PyO3 extension and drop it into the
# package tree so `from veusz.paint import create_painter; create_painter(..., backend="tiny-skia")`
# can find it without an editable install.
#
# Usage:   scripts/build_paint_ext.sh [--debug] [--no-maturin]
# Output:  veusz/paint/_paint_ext.abi3.so
#
# Preferred path: `maturin develop` driven by the crate's pyproject.toml
# (see veusz-tauri/crates/veusz-paint-py/pyproject.toml). That mirrors the
# `pip install -e veusz-tauri/crates/veusz-paint-py/` flow used in CI and
# in published wheels, so a single build configuration covers both
# developer + packaging.
#
# Fallback path: raw `cargo build` + cp. Kept for environments where
# maturin isn't available (older bootstraps, offline builds) and so the
# original developer flow remains unbroken.

set -euo pipefail

cd "$(dirname "$0")/.."

PROFILE=release
TARGET_DIR=veusz-tauri/target/release
USE_MATURIN=auto

for arg in "$@"; do
    case "$arg" in
        --debug)
            PROFILE=dev
            TARGET_DIR=veusz-tauri/target/debug
            ;;
        --no-maturin)
            USE_MATURIN=no
            ;;
        *)
            echo "unknown argument: $arg" >&2
            echo "usage: $0 [--debug] [--no-maturin]" >&2
            exit 2
            ;;
    esac
done

CRATE_DIR=veusz-tauri/crates/veusz-paint-py
PYPROJECT="${CRATE_DIR}/pyproject.toml"

if [[ "${USE_MATURIN}" != "no" ]] && command -v maturin >/dev/null 2>&1 && [[ -f "${PYPROJECT}" ]]; then
    # Preferred path. `maturin develop` reads ${CRATE_DIR}/pyproject.toml,
    # which sets `python-source = ../../..` so the .so lands directly at
    # `veusz/paint/_paint_ext.abi3.so` — the same destination the cargo
    # fallback below writes to.
    MATURIN_ARGS=(develop --manifest-path "${CRATE_DIR}/Cargo.toml")
    if [[ "${PROFILE}" == "release" ]]; then
        MATURIN_ARGS+=(--release)
    fi

    # `maturin develop` insists on a virtualenv. If we're already inside
    # one (VIRTUAL_ENV / CONDA_PREFIX) it'll be picked up; otherwise we
    # point maturin at the system interpreter so this script works in the
    # same contexts as the legacy cargo path.
    if [[ -z "${VIRTUAL_ENV:-}" && -z "${CONDA_PREFIX:-}" ]]; then
        export VIRTUAL_ENV="$(python3 -c 'import sys; print(sys.prefix)')"
    fi

    echo "scripts/build_paint_ext.sh: using maturin (${MATURIN_ARGS[*]})"
    maturin "${MATURIN_ARGS[@]}"
else
    if [[ "${USE_MATURIN}" == "auto" && ! -f "${PYPROJECT}" ]]; then
        echo "scripts/build_paint_ext.sh: ${PYPROJECT} missing; falling back to cargo path"
    elif [[ "${USE_MATURIN}" == "auto" ]]; then
        echo "scripts/build_paint_ext.sh: maturin not on PATH; falling back to cargo path"
    fi

    cargo build -p veusz-paint-py --profile "${PROFILE}" --manifest-path veusz-tauri/Cargo.toml

    # Linux: lib_paint_ext.so   macOS: lib_paint_ext.dylib
    SRC=""
    for ext in so dylib; do
        if [[ -f "${TARGET_DIR}/lib_paint_ext.${ext}" ]]; then
            SRC="${TARGET_DIR}/lib_paint_ext.${ext}"
            break
        fi
    done
    if [[ -z "${SRC}" ]]; then
        echo "could not locate built extension under ${TARGET_DIR}" >&2
        exit 1
    fi

    DEST=veusz/paint/_paint_ext.abi3.so
    cp "${SRC}" "${DEST}"
    echo "installed ${DEST}"
fi

python3 -c "from veusz.paint import _paint_ext; print('module loads; backends:', _paint_ext.available_backends())"
