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

export interface RenderResult {
  png: string; // base64
  width: number;
  height: number;
  bounds: Record<string, [number, number, number, number]>;
}

export interface DataInfo {
  name: string;
  type: string;
  len: number;
  shape?: number[];
}

export interface DocSetOp {
  path: string;
  value: unknown;
}
