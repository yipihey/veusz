/* tslint:disable */
/* eslint-disable */

/**
 * Persistent renderer over a single `<canvas>`. Reuse across frames so we
 * don't tear down the wgpu device and re-compile Vello's pipelines.
 */
export class VelloCanvasRenderer {
    free(): void;
    [Symbol.dispose](): void;
    constructor(canvas: HTMLCanvasElement);
    render(scene_json: Uint8Array, background_r: number, background_g: number, background_b: number, background_a: number): Promise<void>;
    resize(width: number, height: number): void;
}

export function _start(): void;

/**
 * One-shot render of a scene JSON blob onto a canvas via WebGPU.
 *
 * Builds a fresh wgpu Device + Vello Renderer per call. For interactive
 * embedding (zoom, pan, re-render on document change), use
 * [`VelloCanvasRenderer`] which caches the device + pipelines.
 */
export function render_scene_to_canvas(canvas: HTMLCanvasElement, scene_json: Uint8Array, background_r: number, background_g: number, background_b: number, background_a: number): Promise<void>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_vellocanvasrenderer_free: (a: number, b: number) => void;
    readonly render_scene_to_canvas: (a: any, b: number, c: number, d: number, e: number, f: number, g: number) => any;
    readonly vellocanvasrenderer_new: (a: any) => any;
    readonly vellocanvasrenderer_render: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => any;
    readonly vellocanvasrenderer_resize: (a: number, b: number, c: number) => [number, number];
    readonly _start: () => void;
    readonly wasm_bindgen__convert__closures_____invoke__ha64e7c4179556d73: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h0eeaea35701d9e8f: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h13990ec1889432e1: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h13990ec1889432e1_2: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
