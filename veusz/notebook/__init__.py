"""Notebook integration for Veusz.

Currently exposes :class:`~veusz.notebook.widget.VeuszWidget`, an anywidget that
renders a live Veusz figure *inside* a Jupyter / JupyterLite notebook kernel —
the figure shares the kernel (and therefore the notebook's data) and edits
re-render in place. See :mod:`veusz.notebook.widget`.
"""

from .widget import VeuszWidget  # noqa: F401

__all__ = ["VeuszWidget"]
