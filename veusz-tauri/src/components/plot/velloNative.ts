/**
 * Native, in-process GPU rendering via the Tauri `gpu_render_scene` command
 * (Vello / wgpu → Metal/Vulkan/DX12 in the Rust process). This is the
 * reliable desktop GPU path — unlike WebGPU in the WKWebView, native wgpu is
 * always available on macOS via Metal.
 *
 * Only works inside the Tauri shell; in a plain browser `gpuAvailable()`
 * returns false and callers degrade to a server-side backend.
 */

function inTauri(): boolean {
  return typeof window !== 'undefined'
    && !!(window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
}

type InvokeFn = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
let invokeFn: InvokeFn | null = null;

async function invoke(cmd: string, args?: Record<string, unknown>): Promise<unknown> {
  if (!invokeFn) {
    const mod = await import('@tauri-apps/api/core');
    invokeFn = mod.invoke as unknown as InvokeFn;
  }
  return invokeFn!(cmd, args);
}

/** Whether the Tauri process can build a native GPU Vello renderer. */
export async function gpuAvailable(): Promise<boolean> {
  if (!inTauri()) return false;
  try {
    return (await invoke('gpu_available')) === true;
  } catch {
    return false;
  }
}

/** Rasterise a base64 Scene IR on the local GPU; returns a base64 PNG.
 *  `bg` is RGBA 0..1 (default transparent — the page paints its own bg). */
export async function gpuRenderScene(
  sceneB64: string,
  w: number,
  h: number,
  bg: [number, number, number, number] = [0, 0, 0, 0],
): Promise<string> {
  return (await invoke('gpu_render_scene', { scene: sceneB64, w, h, bg })) as string;
}
