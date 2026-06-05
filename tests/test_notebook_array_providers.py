#    Copyright (C) 2026 Veusz contributors.
#
#    This file is part of Veusz.
#
#    Veusz is free software: you can redistribute it and/or modify it
#    under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 2 of the License, or
#    (at your option) any later version.
#
#    Veusz is distributed in the hope that it will be useful, but
#    WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
#    General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with Veusz. If not, see <https://www.gnu.org/licenses/>.
##############################################################################

"""The notebook widget's pluggable array-provider seam.

Lets a non-IPython host (e.g. a Julia/PythonCall adapter) surface its own
variables in the widget's dataset pickers. These tests don't need a browser:
they exercise the kernel side directly.
"""

import json

import numpy as np
import pytest

pytest.importorskip("anywidget")

from veusz.notebook import (
    VeuszWidget,
    register_array_provider,
    unregister_array_provider,
)


def _names(widget):
    return {d["name"]: d for d in json.loads(widget.datasets_json)["datasets"]}


def test_per_widget_provider_surfaces_and_filters_arrays():
    """A per-widget provider's numeric arrays appear; scalars/text are skipped."""
    provider = lambda: {
        "jx": np.linspace(0, 1, 10),
        "jy": np.cos(np.linspace(0, 1, 10)),
        "jmat": np.ones((4, 4)),
        "jscalar": 3.14,
        "jtext": "nope",
    }
    w = VeuszWidget(width=200, height=150, array_provider=provider)
    w._call("doc.new", {"mode": "graph"})
    w._refresh_datasets()

    names = _names(w)
    assert names["jx"]["source"] == "kernel"
    assert names["jx"]["shape"] == [10]
    assert names["jmat"]["shape"] == [4, 4]
    assert "jscalar" not in names and "jtext" not in names


def test_referencing_a_provider_array_ingests_it():
    """Binding a plotter to a provider array name copies it into the document."""
    provider = lambda: {"jx": np.arange(5.0), "jy": np.arange(5.0) ** 2}
    w = VeuszWidget(width=200, height=150, array_provider=provider)
    w._call("doc.new", {"mode": "graph"})

    w.add_widget("/page1/graph1", "xy")
    xy = [p for p, t in w._tree_paths() if t == "xy"][-1]
    assert [d["name"] for d in w._call("data.list", {})] == []  # nothing yet

    w._set_dataset_gui(f"{xy}/xData", "jx")
    w._set_dataset_gui(f"{xy}/yData", "jy")

    doc_datasets = [d["name"] for d in w._call("data.list", {})]
    assert "jx" in doc_datasets and "jy" in doc_datasets
    assert w._call("doc.get", {"paths": [f"{xy}/xData"]})[f"{xy}/xData"] == "jx"


def test_module_level_provider_registration_roundtrip():
    """A registered provider is visible to new widgets; unregister removes it."""
    provider = lambda: [("globalA", np.arange(7.0))]
    register_array_provider(provider)
    try:
        w = VeuszWidget(width=200, height=150)
        w._call("doc.new", {"mode": "graph"})
        w._refresh_datasets()
        assert "globalA" in _names(w)
    finally:
        unregister_array_provider(provider)

    w.uref = VeuszWidget(width=200, height=150)
    w.uref._call("doc.new", {"mode": "graph"})
    w.uref._refresh_datasets()
    assert "globalA" not in _names(w.uref)


def test_broken_provider_does_not_break_discovery():
    """One provider raising must not stop others from contributing."""
    good = lambda: {"ok": np.arange(3.0)}

    def broken():
        raise RuntimeError("boom")

    register_array_provider(broken)
    try:
        w = VeuszWidget(width=200, height=150, array_provider=good)
        w._call("doc.new", {"mode": "graph"})
        w._refresh_datasets()
        assert "ok" in _names(w)
    finally:
        unregister_array_provider(broken)
