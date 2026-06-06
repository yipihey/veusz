function u() {
  return typeof window < "u" && !!window.__TAURI_INTERNALS__;
}
let t = null;
async function r(n, e) {
  return t || (t = (await import("./core-B2rNBH2e.js")).invoke), t(n, e);
}
async function o() {
  if (!u()) return !1;
  try {
    return await r("gpu_available") === !0;
  } catch {
    return !1;
  }
}
async function c(n, e, i, a = [0, 0, 0, 0]) {
  return await r("gpu_render_scene", { scene: n, w: e, h: i, bg: a });
}
export {
  o as gpuAvailable,
  c as gpuRenderScene
};
//# sourceMappingURL=velloNative-Cn1MRGX6.js.map
