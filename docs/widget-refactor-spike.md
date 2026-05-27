# Widget refactor spike — what does abstract-Painter widget code look like?

The plan's Phase 1 calls for refactoring widget code to target the
abstract `Painter` interface instead of calling `QPainter` directly. We
sidestepped that for the comparison harness via the C++ recordpaint
scene trace — captures _all_ QPainter calls (Python + qtloops C++)
without touching widget code. That works for the diff harness; it
doesn't validate the abstract API as a _real_ widget development surface.

This doc shows what a refactored widget _looks like_, with a small
worked example. The full Veusz widget refactor is multi-week and out of
scope for this round.

## What a Veusz widget does today

A typical widget's `draw` method (sketched):

```python
def draw(self, parentposn, phelper, outerbounds=None):
    s = self.settings
    painter = phelper.painter(self, posn, clip=clip)
    with painter:
        if not s.Line.hide:
            painter.setPen(s.get('Line').makeQPen(painter))
        else:
            painter.setPen(qt.QPen(qt.Qt.PenStyle.NoPen))
        if not s.Fill.hide:
            painter.setBrush(s.get('Fill').makeQBrush(painter))
        else:
            painter.setBrush(qt.QBrush())
        # painter is a QPainter; widgets call Qt's API directly
        painter.drawLine(qt.QPointF(x1, y1), qt.QPointF(x2, y2))
```

The widget speaks QPainter (Qt's API). `phelper.painter()` returns a
`RecordPainter` (subclass of `qt.QPainter`) that captures everything.

## What a refactored widget looks like

```python
def draw(self, parentposn, phelper, outerbounds=None):
    s = self.settings
    p = phelper.painter(self, posn, clip=clip)   # returns a Painter
    with p:
        line = (s.Line if not s.Line.hide else None)
        fill = (s.Fill if not s.Fill.hide else None)
        p.set_paint(Paint(
            stroke=line.to_stroke() if line else None,
            fill=fill.to_fill() if fill else None,
            anti_alias=True,
        ))
        p.stroke_path(Path.line(x1, y1, x2, y2))
```

Differences from QPainter:

* **One `set_paint` call** instead of separate `setPen` + `setBrush`. The
  protocol's `Paint` value fuses pen and brush; the QPainter shim splits
  them on output.
* **Explicit `stroke_path`** instead of `drawLine` (which is QPainter's
  combined stroke-current-pen-on-this-shape op). Widgets express intent
  ("stroke this path") rather than the QPainter overload's implicit
  "use current pen if set, current brush if set."
* **`Path.line(...)` constructor** instead of building a `QPainterPath`.
* **The `Setting.to_stroke()` / `Setting.to_fill()` shims** are
  new — they convert Veusz's Setting graph into protocol values. They
  parallel the existing `makeQPen` / `makeQBrush` methods.

## How it runs through the existing backends

```python
# qt backend (no behavior change for users):
painter = veusz.paint.create_painter(width, height, backend="qt", qpainter=q)
# painter is a QtPainter that wraps `q`. Widget paint code goes through
# the same QPainter that already runs today.

# tiny-skia:
painter = veusz.paint.create_painter(width, height, backend="tiny-skia")
# painter is a TinySkiaSceneBackend that records ops into a Scene; on
# finish() it ships the scene to the Rust _paint_ext extension.

# vello:
painter = veusz.paint.create_painter(width, height, backend="vello")
# same recording path, different Rust-side renderer.
```

## Spike example

`tests/comparison/spike_demo_widget.py` defines a `DemoBarChartWidget`
that paints purely through the abstract `Painter` interface and runs
through all three backends. It's not wired into Veusz's widget factory —
it's just a working example of the API in use, with a test that
asserts the output makes sense across backends.

## Why we haven't done the full Veusz widget refactor

Three reasons:

1. **The C++ recordpaint trace works**. The harness already renders the
   corpus through tiny-skia and Vello at acceptable parity; widget
   refactoring would not improve PSNR numbers. It would, however, free
   us from the recordpaint dependency and let backends own performance
   end-to-end.
2. **It's invasive**. Veusz has 42 widget files. Each one needs the
   conversion. Many call into `utils.plotLineArrow`, `qtloops`-backed
   helpers, etc. that themselves want refactoring. Two weeks of focused
   work minimum.
3. **The Setting → Paint conversion isn't a one-liner**. Veusz's
   `Setting.makeQPen(painter)` consults the painter for DPI (`pixperpt`)
   to convert from points to pixels. Our `Stroke.width` is in user-space
   units; the conversion site needs context.

## Recommended path forward

If you want to do the refactor, the right order is:

1. **Write `Setting.to_stroke(helper)` / `to_fill(helper)`** that take a
   PaintHelper (carrying DPI / scaling) and return protocol values.
   Mirror the existing `makeQPen` / `makeQBrush` signatures.
2. **Refactor `utils.plotLineArrow` and the other utils helpers** to
   take a `Painter` instead of `QPainter`. These are the leaf-level
   drawing primitives every widget calls.
3. **Pick one widget per data type** (point, bar, line, image, text) and
   refactor end-to-end as exemplars.
4. **Refactor the remaining widgets** mechanically against those
   exemplars.
5. **Delete the recordpaint trace path** once all widgets are converted.
   Backends become first-class consumers of widget paint output, not
   second-class observers of QPainter calls.

Estimated effort: ~2-3 engineer-weeks for steps 1-4; step 5 is a small
cleanup.
