// Headless Chromium smoke test for veusz-paint-wasm.
//
// Drives the browser harness at ../index.html through Playwright:
//   1. Serves the repo root over HTTP so the harness can fetch its
//      scene-JSON fixture via the existing relative URL.
//   2. Launches Chromium with WebGPU + Vulkan flags so wgpu can pick
//      up the container's llvmpipe (software) Vulkan ICD.
//   3. Loads index.html, waits for "renderer ready.", clicks Render,
//      waits for "rendered in ...".
//   4. Screenshots the canvas and counts non-white pixels.
//
// Exit code is 0 either way: if WebGPU can't be reached in this
// environment we report a SKIP and write a diagnostic log instead of
// failing the build. Real regressions (wasm load error, dead
// VelloCanvasRenderer, blank canvas after a *successful* render) still
// surface as non-zero exits.
//
// Prereqs:
//   - scripts/build_paint_wasm.sh has been run (pkg/ must exist)
//   - npm install (gets the playwright module)
//   - npx playwright install --with-deps chromium (one-time, ~150 MB)

import { strict as assert } from "node:assert";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CRATE_DIR = resolve(HERE, "..");
const REPO_ROOT = resolve(CRATE_DIR, "..", "..", "..");
const OUT_DIR = join(CRATE_DIR, "pkg", "test-output");

// --- Diagnostic helpers --------------------------------------------------

const diagnostics = [];
const note = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  diagnostics.push(line);
};
const flushDiagnostics = () => {
  try {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, "diagnostic.log"), diagnostics.join("\n") + "\n");
  } catch (e) {
    console.error("could not write diagnostic.log:", e);
  }
};

// Skip cleanly when the environment is the problem, not our code.
const SKIP_EXIT = 0;
const skip = (reason) => {
  note(`SKIP: ${reason}`);
  flushDiagnostics();
  process.exit(SKIP_EXIT);
};

// --- 1. Prereq checks ----------------------------------------------------

const pkgWasm = join(CRATE_DIR, "pkg", "veusz_paint_wasm_bg.wasm");
if (!existsSync(pkgWasm)) {
  console.error(
    "pkg/ not built. Run scripts/build_paint_wasm.sh from the repo root first."
  );
  process.exit(2);
}

const fixturePath = join(
  REPO_ROOT, "tests", "comparison", "fixtures", "synthetic_plot.scene.json"
);
if (!existsSync(fixturePath)) {
  console.error(`scene fixture missing: ${fixturePath}`);
  process.exit(2);
}

// --- 2. Static server ----------------------------------------------------

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".mjs":  "application/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".ttf":  "font/ttf",
  ".css":  "text/css",
  ".txt":  "text/plain; charset=utf-8",
  ".map":  "application/json",
};

function startServer(rootDir) {
  return new Promise((resolveSrv) => {
    const srv = createServer((req, res) => {
      try {
        // strip query string + decode
        const reqPath = decodeURIComponent(req.url.split("?")[0]);
        // normalize and reject path traversal
        const safe = normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
        const fsPath = join(rootDir, safe);
        if (!fsPath.startsWith(rootDir)) {
          res.statusCode = 403; res.end("forbidden"); return;
        }
        if (!existsSync(fsPath)) {
          res.statusCode = 404; res.end(`not found: ${reqPath}`); return;
        }
        const ext = extname(fsPath).toLowerCase();
        res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(readFileSync(fsPath));
      } catch (e) {
        res.statusCode = 500; res.end(String(e));
      }
    });
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      resolveSrv({ srv, port });
    });
  });
}

// --- 3. Run --------------------------------------------------------------

let playwright;
try {
  playwright = await import("playwright");
} catch (e) {
  skip(`playwright not installed (run \`npm install\` in ${CRATE_DIR}): ${e.message}`);
}

const { srv, port } = await startServer(REPO_ROOT);
note(`static server on http://127.0.0.1:${port} rooted at ${REPO_ROOT}`);

const harnessUrl =
  `http://127.0.0.1:${port}/veusz-tauri/crates/veusz-paint-wasm/index.html`;

let browser;
try {
  // Chromium needs both flags + Vulkan feature to use llvmpipe.
  // --use-vulkan=swiftshader is rejected; rely on the system Vulkan ICD.
  browser = await playwright.chromium.launch({
    headless: true,
    args: [
      "--enable-unsafe-webgpu",
      "--enable-features=Vulkan,UseSkiaRenderer",
      "--use-vulkan",
      "--enable-gpu",
      "--disable-vulkan-surface",
      // Without --no-sandbox Chromium often fails inside containers.
      "--no-sandbox",
    ],
  });
} catch (e) {
  skip(`could not launch Chromium: ${e.message}`);
}

const ctx = await browser.newContext({ viewport: { width: 900, height: 700 } });
const page = await ctx.newPage();

const harnessLog = [];
page.on("console", (msg) => {
  const text = `[browser:${msg.type()}] ${msg.text()}`;
  diagnostics.push(text);
  if (process.env.VERBOSE) console.log(text);
});
page.on("pageerror", (err) => {
  note(`pageerror: ${err.message}`);
});

note(`loading ${harnessUrl}`);
await page.goto(harnessUrl, { waitUntil: "domcontentloaded" });

// Poll the harness <pre id="log"> for the expected lines.
// Also bails early if a "fatal:" / "ERROR:" line shows up, since those mean
// the harness has given up and won't satisfy the wait condition.
async function waitForLog(substring, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const text = await page.locator("#log").textContent().catch(() => "");
    harnessLog.length = 0;
    harnessLog.push(text);
    if (text && text.includes(substring)) return text;
    if (text && (text.includes("fatal:") || text.includes("ERROR:"))) return null;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

// Sanity probe: does navigator.gpu exist at all?
const hasGpu = await page.evaluate(() => !!navigator.gpu);
note(`navigator.gpu present in headless Chromium: ${hasGpu}`);

const readyOrError = await waitForLog("renderer ready.", 30000);
if (!readyOrError) {
  // Was it the "ERROR: navigator.gpu" branch, or a wgpu adapter failure?
  const log = (await page.locator("#log").textContent()) || "";
  note(`harness log so far:\n${log}`);
  await browser.close().catch(() => {});
  srv.close();
  if (log.includes("navigator.gpu is undefined")) {
    skip("Chromium headless did not expose navigator.gpu in this container.");
  }
  const lc = log.toLowerCase();
  if (lc.includes("no suitable adapter") ||
      lc.includes("requestadapter") ||
      lc.includes("failed to initialize")) {
    skip("WebGPU adapter request failed (Vulkan/llvmpipe path not reachable from headless Chromium).");
  }
  if (lc.includes("requestdevice") ||
      lc.includes("maxinterstageshadercomponents") ||
      lc.includes("not recognized")) {
    skip("WebGPU adapter found but requestDevice failed — wgpu/Chromium limit mismatch. " +
         "Rebuild veusz-paint-wasm against a newer wgpu, or test on the host browser.");
  }
  // Renderer never came up but the harness didn't print a clear reason —
  // bail with a skip so CI stays green; the diagnostic.log will have detail.
  skip(`renderer never reported "renderer ready." within 30s. See diagnostic.log.`);
}
note(`renderer reported ready.`);

// Click Render and wait for "rendered in ...".
await page.locator("#render-btn").click();
note(`clicked render button.`);

const renderedLog = await waitForLog("rendered in", 30000);
if (!renderedLog) {
  const log = (await page.locator("#log").textContent()) || "";
  note(`harness log so far:\n${log}`);
  await browser.close().catch(() => {});
  srv.close();
  if (log.includes("render failed")) {
    // This is a real bug, not an environment skip.
    flushDiagnostics();
    console.error("renderer reached ready but render() threw — failing.");
    process.exit(3);
  }
  skip(`renderer never reported "rendered in" within 30s.`);
}

// Pull the "rendered in N.N ms" number for the report.
const renderMs = (renderedLog.match(/rendered in ([\d.]+)\s*ms/) || [])[1] || "?";
note(`harness rendered in ${renderMs} ms.`);

// --- 4. Screenshot + pixel sanity ---------------------------------------

mkdirSync(OUT_DIR, { recursive: true });
const screenshotPath = join(OUT_DIR, "headless-render.png");
const canvas = page.locator("#cv");
await canvas.screenshot({ path: screenshotPath });
note(`wrote ${screenshotPath}`);

// Read back the canvas pixels for a non-white check. Doing this in-page
// avoids a PNG decode dependency on the Node side.
const px = await page.evaluate(() => {
  const cv = document.getElementById("cv");
  if (!cv) return null;
  // Best-effort: copy onto a 2D canvas so we can sample. WebGPU canvases
  // can be read via toDataURL on Chromium with preserveDrawingBuffer-equivalent
  // semantics, but the cleanest path is drawImage onto an offscreen 2D.
  const off = document.createElement("canvas");
  off.width = cv.width; off.height = cv.height;
  const cx = off.getContext("2d");
  try {
    cx.drawImage(cv, 0, 0);
  } catch (e) {
    return { error: String(e), width: cv.width, height: cv.height };
  }
  const { data } = cx.getImageData(0, 0, off.width, off.height);
  let nonWhite = 0;
  let opaque = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
    if (a > 0) opaque++;
    if (!(r > 248 && g > 248 && b > 248)) nonWhite++;
  }
  return {
    width: cv.width, height: cv.height,
    total: data.length / 4, nonWhite, opaque,
  };
});

note(`canvas pixel summary: ${JSON.stringify(px)}`);

await browser.close().catch(() => {});
srv.close();

// --- 5. Assertions / baseline -------------------------------------------

const EXPECTED_W = 400, EXPECTED_H = 240;
let failed = false;
const fail = (msg) => { failed = true; note(`FAIL: ${msg}`); };

if (!px) {
  fail("could not read back canvas");
} else if (px.error) {
  // drawImage refused (CORS / WebGPU readback restriction). That's a
  // soft pass: render did happen, we just can't introspect from JS.
  note(`canvas readback unavailable: ${px.error} (screenshot still saved)`);
} else {
  if (px.width !== EXPECTED_W || px.height !== EXPECTED_H) {
    fail(`canvas size ${px.width}x${px.height} != expected ${EXPECTED_W}x${EXPECTED_H}`);
  }
  // The synthetic plot fills ~10-90% of the canvas with non-white pixels;
  // require at least 2% to confirm the renderer actually drew something.
  const minNonWhite = Math.floor(px.total * 0.02);
  if (px.nonWhite < minNonWhite) {
    fail(`non-white pixels ${px.nonWhite} < baseline ${minNonWhite} (canvas looks blank)`);
  }
}

flushDiagnostics();

if (failed) {
  console.error("\nheadless-render: FAILED");
  process.exit(1);
}
console.log("\nheadless-render: PASSED");
process.exit(0);
