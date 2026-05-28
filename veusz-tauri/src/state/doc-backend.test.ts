/**
 * Store-level tests for the paint-backend / render-path selection,
 * including the client-side vello-wasm path and its graceful degradation
 * to server-side vello when WebGPU is unavailable.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webgpuAvailable } from '../components/plot/velloWasm';
import { gpuAvailable, gpuRenderScene } from '../components/plot/velloNative';
import { createDocStore } from './doc';
import { createRpc } from '../rpc/client';
import { mockTransport } from '../rpc/transport';

vi.mock('../components/plot/velloWasm', () => ({
  webgpuAvailable: vi.fn(),
  renderSceneToCanvas: vi.fn().mockResolvedValue(undefined),
  base64ToBytes: () => new Uint8Array(),
}));

vi.mock('../components/plot/velloNative', () => ({
  gpuAvailable: vi.fn(),
  gpuRenderScene: vi.fn(),
}));

const mockWebgpu = vi.mocked(webgpuAvailable);
const mockGpuAvail = vi.mocked(gpuAvailable);
const mockGpuRender = vi.mocked(gpuRenderScene);

function rig() {
  const pngBackends: string[] = [];
  let sceneCalls = 0;
  const handlers: Record<string, (p: Record<string, unknown>) => unknown> = {
    'render.png': (p) => {
      const backend = (p as { backend?: string }).backend ?? 'qt';
      pngBackends.push(backend);
      return { png: 'AAAA', width: 100, height: 100, bounds: {}, backend };
    },
    'render.scene': () => {
      sceneCalls += 1;
      return { scene_b64: 'U0NFTkU=', width: 100, height: 100, bounds: {} };
    },
    'prefs.set': (p) => ({ ok: true, ...(p as Record<string, unknown>) }),
  };
  const store = createDocStore(createRpc(mockTransport(handlers)));
  return { store, pngBackends, get sceneCalls() { return sceneCalls; } };
}

describe('paint backend selection', () => {
  beforeEach(() => {
    mockWebgpu.mockReset();
    mockGpuAvail.mockReset();
    mockGpuRender.mockReset();
  });

  it('vello-wasm degrades to server-side vello when WebGPU is unavailable', async () => {
    mockWebgpu.mockResolvedValue(false);
    const { store, pngBackends } = rig();
    await store.getState().setBackend('vello-wasm');
    expect(store.getState().webgpuAvailable).toBe(false);

    await store.getState().renderAt(0, 100, 100);
    // Server PNG path, mapped to the vello backend.
    expect(pngBackends).toEqual(['vello']);
    expect(store.getState().render?.sceneB64).toBeUndefined();
  });

  it('vello-wasm uses the client scene path when WebGPU is available', async () => {
    mockWebgpu.mockResolvedValue(true);
    const r = rig();
    await r.store.getState().setBackend('vello-wasm');
    expect(r.store.getState().webgpuAvailable).toBe(true);

    await r.store.getState().renderAt(0, 100, 100);
    // No PNG render; the Scene IR is fetched and stashed for the canvas.
    expect(r.pngBackends).toEqual([]);
    expect(r.sceneCalls).toBe(1);
    expect(r.store.getState().render?.sceneB64).toBe('U0NFTkU=');
    expect(r.store.getState().render?.png).toBe('');
  });

  it('vello-gpu degrades to server-side vello when no native GPU', async () => {
    mockGpuAvail.mockResolvedValue(false);
    const r = rig();
    await r.store.getState().setBackend('vello-gpu');
    expect(r.store.getState().gpuNativeAvailable).toBe(false);

    await r.store.getState().renderAt(0, 100, 100);
    expect(r.pngBackends).toEqual(['vello']);
    expect(mockGpuRender).not.toHaveBeenCalled();
  });

  it('vello-gpu renders natively via the Tauri command when a GPU is available', async () => {
    mockGpuAvail.mockResolvedValue(true);
    mockGpuRender.mockResolvedValue('UE5HQllURVM=');
    const r = rig();
    await r.store.getState().setBackend('vello-gpu');
    expect(r.store.getState().gpuNativeAvailable).toBe(true);

    await r.store.getState().renderAt(0, 100, 100);
    // No server PNG render; the scene was fetched and rasterised natively.
    expect(r.pngBackends).toEqual([]);
    expect(r.sceneCalls).toBe(1);
    expect(mockGpuRender).toHaveBeenCalledTimes(1);
    expect(r.store.getState().render?.png).toBe('UE5HQllURVM=');
  });

  it('server backends render via render.png with the chosen backend', async () => {
    const { store, pngBackends } = rig();
    await store.getState().setBackend('tiny-skia');
    await store.getState().renderAt(0, 100, 100);
    expect(pngBackends).toEqual(['tiny-skia']);
    // No WebGPU probe for server-side backends.
    expect(mockWebgpu).not.toHaveBeenCalled();
  });
});
