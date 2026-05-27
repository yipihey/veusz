//! PyO3 bridge for Veusz's parallel paint backends.
//!
//! Python builds a `Scene` (the recorded form of Painter ops) via
//! `veusz/paint/scene_recorder.py`, serialises it to JSON, and passes the
//! bytes here. We deserialise, rasterise, and hand back PNG bytes.
//!
//! Small FFI surface on purpose: we don't expose the Painter trait method
//! by method, which keeps the bridge boring and lets the abstract API
//! evolve without churning the Python<->Rust seam. JSON is the wire format
//! for now because it's debuggable; we'll switch to bincode/msgpack only
//! if profiling demands it (out of scope for phase 2).
//!
//! Module name: `veusz_paint_ext`. Veusz's `veusz/paint/factory.py` imports
//! it; absence flips the tiny-skia backend off cleanly.

use pyo3::exceptions::{PyRuntimeError, PyValueError};
use pyo3::prelude::*;
use pyo3::types::PyBytes;

use veusz_paint_core::{Color, Scene, SceneSummary};
use veusz_paint_tiny_skia::TinySkiaPainter;

/// Backend names recognised by [`render_scene_to_png`].
const BACKEND_TINY_SKIA: &str = "tiny-skia";

/// Rasterise a serialised [`Scene`] through the named backend and return
/// PNG bytes.
///
/// Arguments
/// ---------
/// scene_json : bytes
///     UTF-8 JSON produced by `veusz_paint_core::Scene::serialize`. The
///     Python side uses `veusz.paint.scene_recorder.PythonSceneRecorder` to
///     produce it.
/// width, height : int
///     Output pixel size.
/// background : (float, float, float, float)
///     RGBA in 0..1. Painted before scene replay. Pass (1, 1, 1, 1) for a
///     white page.
/// backend : str
///     ``"tiny-skia"``. Other backends (``"vello"``) raise an error until
///     they exist.
#[pyfunction]
#[pyo3(signature = (scene_json, width, height, background, backend = "tiny-skia"))]
fn render_scene_to_png<'py>(
    py: Python<'py>,
    scene_json: &[u8],
    width: u32,
    height: u32,
    background: (f32, f32, f32, f32),
    backend: &str,
) -> PyResult<Bound<'py, PyBytes>> {
    if backend != BACKEND_TINY_SKIA {
        return Err(PyValueError::new_err(format!(
            "backend {:?} not implemented in veusz_paint_ext; only \
             {:?} is available in this build",
            backend, BACKEND_TINY_SKIA,
        )));
    }
    let scene: Scene = serde_json::from_slice(scene_json)
        .map_err(|e| PyValueError::new_err(format!("scene JSON decode failed: {e}")))?;

    // Release the GIL while we rasterise; nothing here touches Python state.
    let png_bytes = py.allow_threads(|| rasterise(scene, width, height, background))
        .map_err(PyRuntimeError::new_err)?;
    Ok(PyBytes::new_bound(py, &png_bytes))
}

fn rasterise(
    scene: Scene,
    width: u32,
    height: u32,
    background: (f32, f32, f32, f32),
) -> Result<Vec<u8>, String> {
    let mut painter = TinySkiaPainter::new(width, height)?;
    painter.clear(Color {
        r: background.0,
        g: background.1,
        b: background.2,
        a: background.3,
    });
    scene.replay(&mut painter);
    let mut out = Vec::with_capacity(4 * (width as usize) * (height as usize));
    painter
        .write_png(&mut out)
        .map_err(|e| format!("PNG encode failed: {e}"))?;
    Ok(out)
}

/// Return a JSON [`SceneSummary`] for a serialised scene, without
/// rasterising. Cheap; used by the comparison harness for the per-vector-path
/// diff (plan §10.3).
#[pyfunction]
fn scene_summary_json(scene_json: &[u8]) -> PyResult<String> {
    let scene: Scene = serde_json::from_slice(scene_json)
        .map_err(|e| PyValueError::new_err(format!("scene JSON decode failed: {e}")))?;
    let s: SceneSummary = scene.summary();
    serde_json::to_string(&s).map_err(|e| PyRuntimeError::new_err(format!("encode failed: {e}")))
}

/// List the backends available in this build of `veusz_paint_ext`.
#[pyfunction]
fn available_backends() -> Vec<&'static str> {
    vec![BACKEND_TINY_SKIA]
}

#[pymodule]
fn _paint_ext(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(render_scene_to_png, m)?)?;
    m.add_function(wrap_pyfunction!(scene_summary_json, m)?)?;
    m.add_function(wrap_pyfunction!(available_backends, m)?)?;
    m.add("__version__", env!("CARGO_PKG_VERSION"))?;
    Ok(())
}
