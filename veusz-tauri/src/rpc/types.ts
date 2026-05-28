// JSON-RPC 2.0 envelope types and the schema shape the daemon emits.
//
// Mirrors `veusz/daemon/schema.py`. The leaf shape is intentionally
// flat — every Setting subclass that exists in Veusz today reduces to
// a `SettingSchema` record. The `typename` field is the registry key.

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown;
}

export interface JsonRpcSuccess<T> {
  jsonrpc: '2.0';
  id: number | string;
  result: T;
}

export interface JsonRpcError {
  jsonrpc: '2.0';
  id: number | string | null;
  error: { code: number; message: string; data?: unknown };
}

export type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcError;

export interface SettingSchema {
  name: string;
  typename: string;
  default: unknown;
  descr: string;
  usertext: string;
  formatting: boolean;
  hidden: boolean;
  /** Whether the setting currently holds a reference (stylesheet
   *  link). Drives the "Unlink setting" menu item. */
  is_reference?: boolean;
  /** Multi-edit only (from doc.common_schema): true when the selected
   *  widgets disagree on this setting's value. */
  mixed_value?: boolean;
  /** Multi-edit only: the shared value when not mixed; null when mixed. */
  value?: unknown;
  // Type-specific metadata. Present only on relevant typenames.
  minval?: number;
  maxval?: number;
  vallist?: string[] | number[];
  descriptions?: string[];
  uilist?: string[];
  step?: number;
  tick?: number;
  scale?: number;
  dimensions?: number;
  datatype?: string;
}

export interface SettingsGroup {
  name: string;
  usertext: string;
  descr: string;
  setnsmode: string;
  settings: SettingSchema[];
  subgroups: SettingsGroup[];
}

export interface WidgetSchema extends SettingsGroup {
  typename?: string;
  mode: 'class' | 'instance' | 'common';
  /** Multi-edit only: the widget typenames in the selection. */
  typenames?: string[];
  /** Multi-edit only: number of widgets in the selection. */
  count?: number;
}

export interface WidgetTreeNode {
  name: string;
  path: string;
  type: string;
  children: WidgetTreeNode[];
}

/**
 * Selectable paint backend / render path for the plot canvas.
 *  - qt / tiny-skia / vello: render server-side in the daemon, returned
 *    as a PNG by `render.png`.
 *  - vello-wasm: render client-side in the browser (WebGPU) from the
 *    Scene IR returned by `render.scene`; degrades to server-side vello
 *    where WebGPU is unavailable.
 */
export type PaintBackend = 'qt' | 'tiny-skia' | 'vello' | 'vello-wasm';

/** Backends that render server-side and return a PNG via render.png. */
export type ServerBackend = 'qt' | 'tiny-skia' | 'vello';

export interface RenderResult {
  png: string; // base64; empty when this frame is a client-side scene
  width: number;
  height: number;
  bounds: Record<string, [number, number, number, number]>;
  /** Echoes the backend that produced this render (daemon-set). */
  backend?: ServerBackend;
  /** Present when the frame is the Scene IR for client-side (WASM/Vello)
   *  rasterisation rather than a server PNG. Set by the store, not the
   *  daemon. */
  sceneB64?: string;
}

/** Result of `render.scene` — the abstract Scene IR for client-side
 *  (browser WASM / Vello) rasterisation. `scene_b64` is base64 JSON. */
export interface SceneResult {
  scene_b64: string;
  width: number;
  height: number;
  bounds: Record<string, [number, number, number, number]>;
}

export interface DataInfo {
  name: string;
  type: string;
  len: number;
  shape?: number[];
  /** Filename this dataset is linked to, or null if in-memory. */
  linked?: string | null;
  /** Tags applied to this dataset. */
  tags?: string[];
}

export interface DocSetOp {
  path: string;
  value: unknown;
}
