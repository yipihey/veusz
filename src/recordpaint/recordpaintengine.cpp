//    Copyright (C) 2011 Jeremy S. Sanders
//    Email: Jeremy Sanders <jeremy@jeremysanders.net>
//
//    This file is part of Veusz.
//
//    Veusz is free software: you can redistribute it and/or modify it
//    under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 2 of the License, or
//    (at your option) any later version.
//
//    Veusz is distributed in the hope that it will be useful, but
//    WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
//    General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Veusz. If not, see <https://www.gnu.org/licenses/>.
//
//////////////////////////////////////////////////////////////////////////////

#include <QPainter>
#include <QImage>
#include <QRectF>
#include <QLineF>
#include <QList>
#include <QPaintEngine>

#include <QFile>
#include <QMutex>
#include <QTextStream>
#include <cstdlib>

#include "paintelement.h"
#include "recordpaintengine.h"
#include "recordpaintdevice.h"

// -- Optional dynamic-pass QPainter audit (spike S1, C++ half) -------------
//
// Two file-based channels, both off by default and inert when their env vars
// are unset (one getenv() check per call, no allocation, no I/O):
//
//  VEUSZ_RECORDPAINT_TRACE=path.jsonl   cheap audit-shape data
//      (op names + counts only, what spike-S1 needs)
//  VEUSZ_RECORDPAINT_SCENE=path.json    full-fidelity scene stream in the
//      shape veusz_paint_core::Scene's serde Deserialize expects
//      (one SceneOp per JSON line). The Python side concatenates these
//      into a Scene the Rust extension consumes — same path tiny-skia,
//      Vello, and PDF backends already use. Closes the qtloops bypass
//      (R9 in the plan): the qtloops C++ helpers call QPainter from C++,
//      and those calls funnel through this paint engine just like
//      Python-originated calls.
//
// See docs/qpainter-audit.md §5 and veusz/paint/scene_from_trace.py for
// the consumers.
namespace {
  // -- cheap audit channel ----
  static QMutex g_trace_mutex;
  static QFile* g_trace_file = nullptr;
  static bool g_trace_checked = false;
  static bool g_trace_enabled = false;

  inline bool traceEnabled()
  {
    if (!g_trace_checked) {
      QMutexLocker lock(&g_trace_mutex);
      if (!g_trace_checked) {
        const char* path = std::getenv("VEUSZ_RECORDPAINT_TRACE");
        if (path && *path) {
          g_trace_file = new QFile(QString::fromUtf8(path));
          if (!g_trace_file->open(QIODevice::Append | QIODevice::Text)) {
            delete g_trace_file;
            g_trace_file = nullptr;
          } else {
            g_trace_enabled = true;
          }
        }
        g_trace_checked = true;
      }
    }
    return g_trace_enabled;
  }

  inline void traceLine(const QString& json)
  {
    if (!traceEnabled()) return;
    QMutexLocker lock(&g_trace_mutex);
    if (g_trace_file) {
      g_trace_file->write(json.toUtf8());
      g_trace_file->write("\n");
    }
  }

  // -- full scene channel ----
  static QMutex g_scene_mutex;
  static QFile* g_scene_file = nullptr;
  static bool g_scene_checked = false;
  static bool g_scene_enabled = false;

  inline bool sceneEnabled()
  {
    if (!g_scene_checked) {
      QMutexLocker lock(&g_scene_mutex);
      if (!g_scene_checked) {
        const char* path = std::getenv("VEUSZ_RECORDPAINT_SCENE");
        if (path && *path) {
          g_scene_file = new QFile(QString::fromUtf8(path));
          // Append mode so the harness can truncate the file from Python
          // between consecutive renders within one process; QFile in
          // Append mode always writes at current EOF, so the truncate
          // resets the offset cleanly.
          if (!g_scene_file->open(QIODevice::WriteOnly | QIODevice::Append)) {
            delete g_scene_file;
            g_scene_file = nullptr;
          } else {
            g_scene_enabled = true;
          }
        }
        g_scene_checked = true;
      }
    }
    return g_scene_enabled;
  }

  inline void sceneOp(const QString& json)
  {
    if (!sceneEnabled()) return;
    QMutexLocker lock(&g_scene_mutex);
    if (g_scene_file) {
      g_scene_file->write(json.toUtf8());
      g_scene_file->write("\n");
      // Explicit flush — the Python-side wrapper uses os.path.getsize()
      // offsets to slice the per-render scene, so any buffered writes
      // that aren't on disk yet make a slice appear empty.
      g_scene_file->flush();
    }
  }

  // -- helpers to emit scene-format JSON for common shapes ----
  QString sceneColor(const QColor& c)
  {
    return QString("{\"r\":%1,\"g\":%2,\"b\":%3,\"a\":%4}")
      .arg(c.redF()).arg(c.greenF()).arg(c.blueF()).arg(c.alphaF());
  }

  QString scenePath(const QPainterPath& path)
  {
    QStringList verbs, points;
    int n = path.elementCount();
    int i = 0;
    while (i < n) {
      const auto el = path.elementAt(i);
      switch (el.type) {
      case QPainterPath::MoveToElement:
        verbs << "\"MoveTo\"";
        points << QString::number(el.x) << QString::number(el.y);
        i += 1; break;
      case QPainterPath::LineToElement:
        verbs << "\"LineTo\"";
        points << QString::number(el.x) << QString::number(el.y);
        i += 1; break;
      case QPainterPath::CurveToElement: {
        const auto c1 = path.elementAt(i + 1);
        const auto c2 = path.elementAt(i + 2);
        verbs << "\"CubicTo\"";
        points << QString::number(el.x) << QString::number(el.y)
               << QString::number(c1.x) << QString::number(c1.y)
               << QString::number(c2.x) << QString::number(c2.y);
        i += 3; break;
      }
      default:
        i += 1; break;
      }
    }
    return QString("{\"verbs\":[%1],\"points\":[%2]}")
      .arg(verbs.join(","), points.join(","));
  }

  QString sceneAffine(const QTransform& t)
  {
    return QString("{\"a\":%1,\"b\":%2,\"c\":%3,\"d\":%4,\"e\":%5,\"f\":%6}")
      .arg(t.m11()).arg(t.m12()).arg(t.m21()).arg(t.m22()).arg(t.m31()).arg(t.m32());
  }

  // Convert PenCapStyle / PenJoinStyle to the names veusz-paint-core uses.
  QString penCapName(Qt::PenCapStyle s) {
    switch(s) {
      case Qt::RoundCap: return "\"Round\"";
      case Qt::SquareCap: return "\"Square\"";
      default: return "\"Butt\"";
    }
  }
  QString penJoinName(Qt::PenJoinStyle s) {
    switch(s) {
      case Qt::RoundJoin: return "\"Round\"";
      case Qt::BevelJoin: return "\"Bevel\"";
      default: return "\"Miter\"";
    }
  }

  QString sceneStroke(const QPen& pen)
  {
    QString dash = "null";
    if (pen.style() == Qt::CustomDashLine ||
        (pen.style() != Qt::SolidLine && pen.style() != Qt::NoPen)) {
      QStringList ds;
      for (auto x : pen.dashPattern()) ds << QString::number(x);
      if (!ds.isEmpty()) dash = "[" + ds.join(",") + "]";
    }
    return QString("{\"color\":%1,\"width\":%2,\"dash\":%3,"
                   "\"cap\":%4,\"join\":%5,\"miter_limit\":%6}")
      .arg(sceneColor(pen.color()))
      .arg(pen.widthF())
      .arg(dash)
      .arg(penCapName(pen.capStyle()))
      .arg(penJoinName(pen.joinStyle()))
      .arg(pen.miterLimit());
  }

  // peniko Fill is enum-tagged; for now we map all non-solid brushes onto
  // their first-stop colour (matches the pdf-writer backend's current
  // gradient handling). Gradients in the captured scene will be properly
  // rendered by Vello once we round-trip them — TODO for a follow-up.
  QString sceneFill(const QBrush& brush)
  {
    return QString("{\"Solid\":%1}").arg(sceneColor(brush.color()));
  }

  // Cumulative state we need to materialise SceneOp::SetPaint from
  // Qt's updateState-driven pen + brush stream. updateState fires when
  // either changes; we re-emit a fresh SetPaint on the next draw op.
  struct SceneState {
    QPen pen;
    QBrush brush;
    bool anti_alias = true;
    bool pen_set = false;
    bool brush_set = false;
    bool dirty = true;
  };
  static thread_local SceneState g_scene_state;

  inline void emitSceneSetPaint()
  {
    if (!sceneEnabled() || !g_scene_state.dirty) return;
    QString fill = "null", stroke = "null";
    if (g_scene_state.brush_set && g_scene_state.brush.style() != Qt::NoBrush) {
      fill = sceneFill(g_scene_state.brush);
    }
    if (g_scene_state.pen_set && g_scene_state.pen.style() != Qt::NoPen) {
      stroke = sceneStroke(g_scene_state.pen);
    }
    sceneOp(QString("{\"SetPaint\":{\"fill\":%1,\"stroke\":%2,\"anti_alias\":%3}}")
            .arg(fill, stroke, g_scene_state.anti_alias ? "true" : "false"));
    g_scene_state.dirty = false;
  }
}
// --------------------------------------------------------------------------

namespace {

  //////////////////////////////////////////////////////////////
  // Drawing Elements
  // these are defined for each type of painting 
  // the QPaintEngine does

  // draw an ellipse (QRect and QRectF)
  template <class T>
  class ellipseElement : public PaintElement {
  public:
    ellipseElement(const T &rect) : _ellipse(rect) {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawEllipse(_ellipse);
    }

  private:
    T _ellipse;
  };
  typedef ellipseElement<QRect> EllipseElement;
  typedef ellipseElement<QRectF> EllipseFElement;

  // draw QImage
  class ImageElement : public PaintElement {
  public:
    ImageElement(const QRectF& rect, const QImage& image,
		 const QRectF& sr, Qt::ImageConversionFlags flags)
      : _image(image), _rect(rect), _sr(sr), _flags(flags)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawImage(_rect, _image, _sr, _flags);
    }

  private:
    QImage _image;
    QRectF _rect, _sr;
    Qt::ImageConversionFlags _flags;
  };

  // draw lines
  // this is for painting QLine and QLineF
  template <class T>
  class lineElement : public PaintElement {
  public:
    lineElement(const T *lines, int linecount)
    {
      for(int i = 0; i < linecount; i++)
	_lines << lines[i];
    }

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawLines(_lines);
    }

  private:
    QList<T> _lines;
  };
  // specific Line and LineF variants
  typedef lineElement<QLine> LineElement;
  typedef lineElement<QLineF> LineFElement;

  // draw QPainterPath
  class PathElement : public PaintElement {
  public:
    PathElement(const QPainterPath& path)
      : _path(path) {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawPath(_path);
    }

  private:
    QPainterPath _path;
  };

  // draw Pixmap
  class PixmapElement : public PaintElement {
  public:
    PixmapElement(const QRectF& r, const QPixmap& pm,
		  const QRectF& sr) :
      _r(r), _pm(pm), _sr(sr) {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawPixmap(_r, _pm, _sr);
    }

  private:
    QRectF _r;
    QPixmap _pm;
    QRectF _sr;
  };

  // draw points (QPoint and QPointF)
  template <class T, class V>
  class pointElement : public PaintElement {
  public:
    pointElement(const T* points, int pointcount)
    {
      for(int i=0; i<pointcount; ++i)
	_pts << points[i];
    }

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawPoints(_pts);
    }

  private:
    V _pts;
  };
  typedef pointElement<QPoint, QPolygon> PointElement;
  typedef pointElement<QPointF, QPolygonF> PointFElement;

  // for QPolygon and QPolygonF
  template <class T, class V>
  class polyElement: public PaintElement {
  public:
    polyElement(const T* points, int pointcount,
		QPaintEngine::PolygonDrawMode mode)
      : _mode(mode)
    {
      for(int i=0; i<pointcount; ++i)
	_pts << points[i];
    }

    void paint(QPainter& painter, const QTransform&)
    {
      switch(_mode)
	{
	case QPaintEngine::OddEvenMode:
	  painter.drawPolygon(_pts, Qt::OddEvenFill);
	  break;
	case QPaintEngine::WindingMode:
	  painter.drawPolygon(_pts, Qt::WindingFill);
	  break;
	case QPaintEngine::ConvexMode:
	  painter.drawConvexPolygon(_pts);
	  break;
	case QPaintEngine::PolylineMode:
	  painter.drawPolyline(_pts);
	  break;
	}
    }

  private:
    QPaintEngine::PolygonDrawMode _mode;
    V _pts;
  };
  typedef polyElement<QPoint,QPolygon> PolygonElement;
  typedef polyElement<QPointF,QPolygonF> PolygonFElement;

  // for QRect and QRectF
  template <class T>
  class rectElement : public PaintElement {
  public:
    rectElement(const T* rects, int rectcount)
    {
      for(int i=0; i<rectcount; i++)
	_rects << rects[i];
    }

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawRects(_rects);
    }

  private:
    QList<T> _rects;
  };
  typedef rectElement<QRect> RectElement;
  typedef rectElement<QRectF> RectFElement;

  // draw Text
  class TextElement : public PaintElement {
  public:
    TextElement(const QPointF& pt, const QTextItem& txt)
      : _pt(pt), _text(txt.text())
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawText(_pt, _text);
    }

  private:
    QPointF _pt;
    QString _text;
  };

  class TiledPixmapElement : public PaintElement {
  public:
    TiledPixmapElement(const QRectF& rect, const QPixmap& pixmap,
		       const QPointF& pt)
      : _rect(rect), _pixmap(pixmap), _pt(pt)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.drawTiledPixmap(_rect, _pixmap, _pt);
    }

  private:
    QRectF _rect;
    QPixmap _pixmap;
    QPointF _pt;
  };

  ///////////////////////////////////////////////////////////////////
  // State paint elements

  // these define and change the state of the painter

  class BackgroundBrushElement : public PaintElement {
  public:
    BackgroundBrushElement(const QBrush& brush)
      : _brush(brush)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setBackground(_brush);
    }

  private:
    QBrush _brush;
  };

  class BackgroundModeElement : public PaintElement {
  public:
    BackgroundModeElement(Qt::BGMode mode)
      : _mode(mode)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setBackgroundMode(_mode);
    }

  private:
    Qt::BGMode _mode;
  };

  class BrushElement : public PaintElement {
  public:
    BrushElement(const QBrush& brush)
      : _brush(brush)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setBrush(_brush);
    }

  private:
    QBrush _brush;
  };

  class BrushOriginElement : public PaintElement {
  public:
    BrushOriginElement(const QPointF& origin)
      : _origin(origin)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setBrushOrigin(_origin);
    }

  private:
    QPointF _origin;
  };

  class ClipRegionElement : public PaintElement {
  public:
    ClipRegionElement(Qt::ClipOperation op,
		      const QRegion& region)
      : _op(op), _region(region)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setClipRegion(_region, _op);
    }

  private:
    Qt::ClipOperation _op;
    QRegion _region;
  };

  class ClipPathElement : public PaintElement {
  public:
    ClipPathElement(Qt::ClipOperation op,
		    const QPainterPath& region)
      : _op(op), _region(region)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setClipPath(_region, _op);
    }

  private:
    Qt::ClipOperation _op;
    QPainterPath _region;
  };

  class CompositionElement : public PaintElement {
  public:
    CompositionElement(QPainter::CompositionMode mode)
      : _mode(mode)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setCompositionMode(_mode);
    }

  private:
    QPainter::CompositionMode _mode;
  };

  class FontElement : public PaintElement {
  public:
    FontElement(const QFont& font, int dpi)
      : _dpi(dpi), _font(font)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      QFont tempfont(_font);
      if( tempfont.pointSizeF() > 0. )
	{
	  // scale font sizes in points using dpi ratio
	  int thisdpi = painter.device()->logicalDpiY();
	  double scale = tempfont.pointSizeF() / thisdpi * _dpi;
	  tempfont.setPointSizeF(scale);
	}

      painter.setFont(tempfont);
    }

  private:
    int _dpi;
    QFont _font;
  };

  class TransformElement : public PaintElement {
  public:
    TransformElement(const QTransform& t)
      : _t(t)
    {}

    void paint(QPainter& painter, const QTransform& origtransform)
    {
      painter.setWorldTransform(origtransform);
      painter.setWorldTransform(_t, true);
    }

  private:
    QTransform _t;
  };

  class ClipEnabledElement : public PaintElement {
  public:
    ClipEnabledElement(bool enabled)
      : _enabled(enabled)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setClipping(_enabled);
    }

  private:
    bool _enabled;
  };

  class PenElement : public PaintElement {
  public:
    PenElement(const QPen& pen)
      : _pen(pen)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setPen(_pen);
    }

  private:
    QPen _pen;
  };

  class HintsElement : public PaintElement {
  public:
    HintsElement(QPainter::RenderHints hints)
      : _hints(hints)
    {}

    void paint(QPainter& painter, const QTransform&)
    {
      painter.setRenderHints(_hints);
    }

  private:
    QPainter::RenderHints _hints;
  };


  // end anonymous block
}

///////////////////////////////////////////////////////////////////
// Paint engine follows

RecordPaintEngine::RecordPaintEngine()
  : QPaintEngine(QPaintEngine::AllFeatures),
    _drawitemcount(0),
    _pdev(0)
{
}

bool RecordPaintEngine::begin(QPaintDevice* pdev)
{
  // old style C cast - probably should use dynamic_cast
  _pdev = (RecordPaintDevice*)(pdev);

  // Each widget gets its own RecordPaintDevice / RecordPaintEngine. Wrap
  // the dumped scene for this widget in a Save/Restore frame so transforms
  // + clips can't leak between widgets in the concatenated stream.
  if (sceneEnabled()) {
    sceneOp(QStringLiteral("\"Save\""));
    // Reset per-frame paint state so the first draw op emits a fresh
    // SetPaint with whatever state Qt re-applies during this paint.
    g_scene_state.dirty = true;
  }

  // signal started ok
  return 1;
}

// for each type of drawing command we add a new element
// to the list maintained by the device

void RecordPaintEngine::drawEllipse(const QRectF& rect)
{
  _pdev->addElement( new EllipseFElement(rect) );
  _drawitemcount++;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawEllipse\",\"w\":%1,\"h\":%2}")
              .arg(rect.width()).arg(rect.height()));
  if (sceneEnabled()) {
    emitSceneSetPaint();
    QPainterPath pp; pp.addEllipse(rect);
    QString p = scenePath(pp);
    if (g_scene_state.brush.style() != Qt::NoBrush)
      sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":\"NonZero\"}}").arg(p));
    if (g_scene_state.pen.style() != Qt::NoPen)
      sceneOp(QString("{\"StrokePath\":%1}").arg(p));
  }
}

void RecordPaintEngine::drawEllipse(const QRect& rect)
{
  _pdev->addElement( new EllipseElement(rect) );
  _drawitemcount++;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawEllipse\",\"w\":%1,\"h\":%2}")
              .arg(rect.width()).arg(rect.height()));
  if (sceneEnabled()) {
    emitSceneSetPaint();
    QPainterPath pp; pp.addEllipse(QRectF(rect));
    QString p = scenePath(pp);
    if (g_scene_state.brush.style() != Qt::NoBrush)
      sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":\"NonZero\"}}").arg(p));
    if (g_scene_state.pen.style() != Qt::NoPen)
      sceneOp(QString("{\"StrokePath\":%1}").arg(p));
  }
}

void RecordPaintEngine::drawImage(const QRectF& rectangle,
				  const QImage& image,
				  const QRectF& sr,
				  Qt::ImageConversionFlags flags)
{
  _pdev->addElement( new ImageElement(rectangle, image, sr, flags) );
  _drawitemcount++;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawImage\",\"w\":%1,\"h\":%2}")
              .arg(image.width()).arg(image.height()));
  if (sceneEnabled()) {
    // veusz-paint-core::Image is straight-alpha RGBA8 row-major. Convert
    // whatever QImage format we received to RGBA8888, then base64-encode
    // the raw bytes — the Rust side accepts both base64 strings and the
    // legacy JSON int-array. Base64 is ~4x smaller than int-array on the
    // wire for typical scientific bitmaps (200x200 RGBA: ~213 KB vs ~600
    // KB) and parses faster on the Rust side too.
    QImage rgba = image.convertToFormat(QImage::Format_RGBA8888);
    QByteArray raw(reinterpret_cast<const char*>(rgba.constBits()),
                   int(rgba.sizeInBytes()));
    QByteArray b64 = raw.toBase64();
    sceneOp(QString(
      "{\"DrawImage\":{\"image\":{\"width\":%1,\"height\":%2,\"pixels\":\"%3\"},"
      "\"dst\":{\"x\":%4,\"y\":%5,\"w\":%6,\"h\":%7},"
      "\"src\":%8}}")
      .arg(rgba.width()).arg(rgba.height())
      .arg(QString::fromLatin1(b64))
      .arg(rectangle.x()).arg(rectangle.y())
      .arg(rectangle.width()).arg(rectangle.height())
      .arg(sr.width() > 0 && sr.height() > 0
        ? QString("{\"x\":%1,\"y\":%2,\"w\":%3,\"h\":%4}")
            .arg(sr.x()).arg(sr.y()).arg(sr.width()).arg(sr.height())
        : QString("null"))
    );
  }
}

void RecordPaintEngine::drawLines(const QLineF* lines, int lineCount)
{
  _pdev->addElement( new LineFElement(lines, lineCount) );
  _drawitemcount += lineCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawLines\",\"n\":%1}").arg(lineCount));
  if (sceneEnabled() && g_scene_state.pen.style() != Qt::NoPen) {
    emitSceneSetPaint();
    QPainterPath pp;
    for (int i = 0; i < lineCount; ++i) {
      pp.moveTo(lines[i].p1());
      pp.lineTo(lines[i].p2());
    }
    sceneOp(QString("{\"StrokePath\":%1}").arg(scenePath(pp)));
  }
}

void RecordPaintEngine::drawLines(const QLine* lines, int lineCount)
{
  _pdev->addElement( new LineElement(lines, lineCount) );
  _drawitemcount += lineCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawLines\",\"n\":%1}").arg(lineCount));
  if (sceneEnabled() && g_scene_state.pen.style() != Qt::NoPen) {
    emitSceneSetPaint();
    QPainterPath pp;
    for (int i = 0; i < lineCount; ++i) {
      pp.moveTo(QPointF(lines[i].p1()));
      pp.lineTo(QPointF(lines[i].p2()));
    }
    sceneOp(QString("{\"StrokePath\":%1}").arg(scenePath(pp)));
  }
}

void RecordPaintEngine::drawPath(const QPainterPath& path)
{
  _pdev->addElement( new PathElement(path) );
  _drawitemcount++;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawPath\",\"elements\":%1}")
              .arg(path.elementCount()));
  if (sceneEnabled()) {
    emitSceneSetPaint();
    QString rule = (path.fillRule() == Qt::OddEvenFill)
      ? "\"EvenOdd\"" : "\"NonZero\"";
    QString p = scenePath(path);
    // drawPath fills with current brush and strokes with current pen
    if (g_scene_state.brush_set && g_scene_state.brush.style() != Qt::NoBrush) {
      sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":%2}}").arg(p, rule));
    }
    if (g_scene_state.pen_set && g_scene_state.pen.style() != Qt::NoPen) {
      sceneOp(QString("{\"StrokePath\":%1}").arg(p));
    }
  }
}

void RecordPaintEngine::drawPixmap(const QRectF& r,
				   const QPixmap& pm, const QRectF& sr)
{
  _pdev->addElement( new PixmapElement(r, pm, sr) );
  _drawitemcount++;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawPixmap\",\"w\":%1,\"h\":%2}")
              .arg(pm.width()).arg(pm.height()));
}

void RecordPaintEngine::drawPoints(const QPointF* points, int pointCount)
{
  _pdev->addElement( new PointFElement(points, pointCount) );
  _drawitemcount += pointCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawPoints\",\"n\":%1}").arg(pointCount));
}

void RecordPaintEngine::drawPoints(const QPoint* points, int pointCount)
{
  _pdev->addElement( new PointElement(points, pointCount) );
  _drawitemcount += pointCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawPoints\",\"n\":%1}").arg(pointCount));
}

void RecordPaintEngine::drawPolygon(const QPointF* points, int pointCount,
				    QPaintEngine::PolygonDrawMode mode)
{
  _pdev->addElement( new PolygonFElement(points, pointCount, mode) );
  _drawitemcount += pointCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawPolygon\",\"n\":%1,\"mode\":%2}")
              .arg(pointCount).arg(int(mode)));
  if (sceneEnabled() && pointCount > 0) {
    emitSceneSetPaint();
    QPainterPath pp;
    pp.moveTo(points[0]);
    for (int i = 1; i < pointCount; ++i) pp.lineTo(points[i]);
    if (mode != QPaintEngine::PolylineMode) pp.closeSubpath();
    QString p = scenePath(pp);
    QString rule = (mode == QPaintEngine::OddEvenMode)
      ? "\"EvenOdd\"" : "\"NonZero\"";
    if (mode != QPaintEngine::PolylineMode &&
        g_scene_state.brush.style() != Qt::NoBrush) {
      sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":%2}}").arg(p, rule));
    }
    if (g_scene_state.pen.style() != Qt::NoPen) {
      sceneOp(QString("{\"StrokePath\":%1}").arg(p));
    }
  }
}

void RecordPaintEngine::drawPolygon(const QPoint* points, int pointCount,
				    QPaintEngine::PolygonDrawMode mode)
{
  _pdev->addElement( new PolygonElement(points, pointCount, mode) );
  _drawitemcount += pointCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawPolygon\",\"n\":%1,\"mode\":%2}")
              .arg(pointCount).arg(int(mode)));
  if (sceneEnabled() && pointCount > 0) {
    emitSceneSetPaint();
    QPainterPath pp;
    pp.moveTo(QPointF(points[0]));
    for (int i = 1; i < pointCount; ++i) pp.lineTo(QPointF(points[i]));
    if (mode != QPaintEngine::PolylineMode) pp.closeSubpath();
    QString p = scenePath(pp);
    QString rule = (mode == QPaintEngine::OddEvenMode)
      ? "\"EvenOdd\"" : "\"NonZero\"";
    if (mode != QPaintEngine::PolylineMode &&
        g_scene_state.brush.style() != Qt::NoBrush) {
      sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":%2}}").arg(p, rule));
    }
    if (g_scene_state.pen.style() != Qt::NoPen) {
      sceneOp(QString("{\"StrokePath\":%1}").arg(p));
    }
  }
}

void RecordPaintEngine::drawRects(const QRectF* rects, int rectCount)
{
  _pdev->addElement( new RectFElement( rects, rectCount ) );
  _drawitemcount += rectCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawRects\",\"n\":%1}").arg(rectCount));
  if (sceneEnabled()) {
    emitSceneSetPaint();
    for (int i = 0; i < rectCount; ++i) {
      QPainterPath pp;
      pp.addRect(rects[i]);
      QString p = scenePath(pp);
      if (g_scene_state.brush.style() != Qt::NoBrush) {
        sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":\"NonZero\"}}").arg(p));
      }
      if (g_scene_state.pen.style() != Qt::NoPen) {
        sceneOp(QString("{\"StrokePath\":%1}").arg(p));
      }
    }
  }
}

void RecordPaintEngine::drawRects(const QRect* rects, int rectCount)
{
  _pdev->addElement( new RectElement( rects, rectCount ) );
  _drawitemcount += rectCount;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawRects\",\"n\":%1}").arg(rectCount));
  if (sceneEnabled()) {
    emitSceneSetPaint();
    for (int i = 0; i < rectCount; ++i) {
      QPainterPath pp;
      pp.addRect(QRectF(rects[i]));
      QString p = scenePath(pp);
      if (g_scene_state.brush.style() != Qt::NoBrush) {
        sceneOp(QString("{\"FillPath\":{\"path\":%1,\"rule\":\"NonZero\"}}").arg(p));
      }
      if (g_scene_state.pen.style() != Qt::NoPen) {
        sceneOp(QString("{\"StrokePath\":%1}").arg(p));
      }
    }
  }
}

void RecordPaintEngine::drawTextItem(const QPointF& p,
				     const QTextItem& textItem)
{
  _pdev->addElement( new TextElement(p, textItem) );
  _drawitemcount += textItem.text().length();
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawTextItem\",\"len\":%1}")
              .arg(textItem.text().length()));
  if (sceneEnabled()) {
    // Emit DrawText with the current font's family + size. The colour comes
    // from the current pen — that's how Qt routes text colour.
    const QFont f = textItem.font();
    const QColor col = g_scene_state.pen.color();
    // JSON-escape the text. Minimal: handle ", \, and control chars.
    QString text = textItem.text();
    QString esc;
    esc.reserve(text.size() + 8);
    for (auto c : text) {
      ushort u = c.unicode();
      if (c == '"') esc += "\\\"";
      else if (c == '\\') esc += "\\\\";
      else if (u < 0x20) esc += QString("\\u%1").arg(u, 4, 16, QChar('0'));
      else esc += c;
    }
    sceneOp(QString(
      "{\"DrawText\":{\"layout\":{\"text\":\"%1\","
      "\"style\":{\"family\":\"%2\",\"size_pt\":%3,\"weight\":%4,"
      "\"italic\":%5,\"color\":%6}},\"x\":%7,\"y\":%8}}")
      .arg(esc, f.family().replace('"', '\''))
      .arg(f.pointSizeF() > 0 ? f.pointSizeF() : f.pixelSize())
      .arg(int(f.weight()))
      .arg(f.italic() ? "true" : "false")
      .arg(sceneColor(col))
      .arg(p.x()).arg(p.y())
    );
  }
}

void RecordPaintEngine::drawTiledPixmap(const QRectF& rect,
					      const QPixmap& pixmap,
					      const QPointF& p)
{
  _pdev->addElement( new TiledPixmapElement(rect, pixmap, p) );
  _drawitemcount += 1;
  if (traceEnabled())
    traceLine(QString("{\"op\":\"drawTiledPixmap\",\"w\":%1,\"h\":%2}")
              .arg(pixmap.width()).arg(pixmap.height()));
}

bool RecordPaintEngine::end()
{
  if (sceneEnabled()) {
    sceneOp(QStringLiteral("\"Restore\""));
  }
  // signal finished ok
  return 1;
}

QPaintEngine::Type RecordPaintEngine::type () const
{
  // some sort of random number for the ID of the engine type
  return QPaintEngine::Type(int(QPaintEngine::User)+34);
}

void RecordPaintEngine::updateState(const QPaintEngineState& state)
{
  // we add a new element for each change of state
  // these are replayed later
  const int flags = state.state();
  if( flags & QPaintEngine::DirtyPen ) {
    _pdev->addElement( new PenElement( state.pen() ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setPen\",\"style\":%1,\"width\":%2}")
                .arg(int(state.pen().style())).arg(state.pen().widthF()));
    if (sceneEnabled()) {
      g_scene_state.pen = state.pen();
      g_scene_state.pen_set = true;
      g_scene_state.dirty = true;
    }
  }
  if( flags & QPaintEngine::DirtyBrush ) {
    _pdev->addElement( new BrushElement( state.brush() ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setBrush\",\"style\":%1}")
                .arg(int(state.brush().style())));
    if (sceneEnabled()) {
      g_scene_state.brush = state.brush();
      g_scene_state.brush_set = true;
      g_scene_state.dirty = true;
    }
  }
  if( flags & QPaintEngine::DirtyBrushOrigin ) {
    _pdev->addElement( new BrushOriginElement( state.brushOrigin() ) );
    if (traceEnabled()) traceLine(QStringLiteral("{\"op\":\"setBrushOrigin\"}"));
  }
  if( flags & QPaintEngine::DirtyFont ) {
    _pdev->addElement( new FontElement( state.font(), _pdev->_dpiy ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setFont\",\"family\":\"%1\",\"size\":%2}")
                .arg(state.font().family()).arg(state.font().pointSizeF()));
  }
  if( flags & QPaintEngine::DirtyBackground ) {
    _pdev->addElement( new BackgroundBrushElement( state.backgroundBrush() ) );
    if (traceEnabled()) traceLine(QStringLiteral("{\"op\":\"setBackgroundBrush\"}"));
  }
  if( flags & QPaintEngine::DirtyBackgroundMode ) {
    _pdev->addElement( new BackgroundModeElement( state.backgroundMode() ) );
    if (traceEnabled()) traceLine(QStringLiteral("{\"op\":\"setBackgroundMode\"}"));
  }
  if( flags & QPaintEngine::DirtyTransform ) {
    _pdev->addElement( new TransformElement( state.transform() ) );
    if (traceEnabled()) traceLine(QStringLiteral("{\"op\":\"setTransform\"}"));
    if (sceneEnabled())
      sceneOp(QString("{\"SetTransform\":%1}").arg(sceneAffine(state.transform())));
  }
  if( flags & QPaintEngine::DirtyClipRegion ) {
    _pdev->addElement( new ClipRegionElement( state.clipOperation(),
					      state.clipRegion() ) );
    if (traceEnabled()) traceLine(QStringLiteral("{\"op\":\"setClipRegion\"}"));
    if (sceneEnabled()) {
      const auto rect = state.clipRegion().boundingRect();
      sceneOp(QString("{\"PushClipRect\":{\"x\":%1,\"y\":%2,\"w\":%3,\"h\":%4}}")
              .arg(rect.x()).arg(rect.y()).arg(rect.width()).arg(rect.height()));
    }
  }
  if( flags & QPaintEngine::DirtyClipPath ) {
    _pdev->addElement( new ClipPathElement( state.clipOperation(),
					    state.clipPath() ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setClipPath\",\"elements\":%1}")
                .arg(state.clipPath().elementCount()));
    if (sceneEnabled()) {
      QString rule = (state.clipPath().fillRule() == Qt::OddEvenFill)
        ? "\"EvenOdd\"" : "\"NonZero\"";
      sceneOp(QString("{\"PushClipPath\":{\"path\":%1,\"rule\":%2}}")
              .arg(scenePath(state.clipPath()), rule));
    }
  }
  if( flags & QPaintEngine::DirtyHints ) {
    _pdev->addElement( new HintsElement( state.renderHints() ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setRenderHints\",\"hints\":%1}")
                .arg(int(state.renderHints())));
    if (sceneEnabled()) {
      bool aa = state.renderHints().testFlag(QPainter::Antialiasing);
      if (g_scene_state.anti_alias != aa) {
        g_scene_state.anti_alias = aa;
        g_scene_state.dirty = true;
      }
    }
  }
  if( flags & QPaintEngine::DirtyCompositionMode ) {
    _pdev->addElement( new CompositionElement( state.compositionMode() ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setCompositionMode\",\"mode\":%1}")
                .arg(int(state.compositionMode())));
  }
  if( flags & QPaintEngine::DirtyClipEnabled ) {
    _pdev->addElement( new ClipEnabledElement( state.isClipEnabled() ) );
    if (traceEnabled())
      traceLine(QString("{\"op\":\"setClipEnabled\",\"v\":%1}")
                .arg(int(state.isClipEnabled())));
  }
}
