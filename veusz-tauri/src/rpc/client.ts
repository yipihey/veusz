// Browser-side JSON-RPC client. Calls the Rust shell via Tauri
// `invoke('rpc', { method, params })`; the Rust side owns the actual
// socket connection to veuszd.
//
// Scaffold only. The real implementation lands once
// `src-tauri/src/bridge.rs` is wired.

import type {
  DataInfo,
  DocSetOp,
  RenderResult,
  WidgetSchema,
  WidgetTreeNode,
} from './types';

// At runtime this resolves to `@tauri-apps/api/core`. The import is
// kept lazy so vitest unit tests can mock it cleanly.
type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

async function getInvoke(): Promise<Invoke> {
  const mod = await import('@tauri-apps/api/core');
  return mod.invoke as Invoke;
}

async function call<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const invoke = await getInvoke();
  return (await invoke('rpc', { method, params })) as T;
}

export const rpc = {
  ping: () => call<{ pong: true }>('ping'),
  version: () => call<{ veusz: string; api: number }>('version'),

  doc: {
    tree: () => call<WidgetTreeNode>('doc.tree'),
    schema: (widget_type: string, mode: 'class' | 'instance' = 'class') =>
      call<WidgetSchema>('doc.schema', { widget_type, mode }),
    widgetTypes: () => call<string[]>('doc.widget_types'),
    add: (parent: string, type: string, name?: string) =>
      call<{ path: string }>('doc.add', { parent, type, name }),
    set: (ops: DocSetOp[]) =>
      call<{ changeset: number; diffs: Array<{ path: string; old: unknown; new: unknown }> }>(
        'doc.set',
        { ops },
      ),
    get: (paths: string[]) => call<Record<string, unknown>>('doc.get', { paths }),
    remove: (path: string) => call<{ ok: true; changeset: number }>('doc.remove', { path }),
  },

  data: {
    list: () => call<DataInfo[]>('data.list'),
    peek: (name: string, start = 0, count = 100) =>
      call<{ values: number[]; start: number; total: number }>('data.peek', {
        name, start, count,
      }),
    stats: (name: string) =>
      call<{ name: string; min: number; max: number; mean: number; std: number; len: number }>(
        'data.stats',
        { name },
      ),
    set: (name: string, values: number[], dtype = 'float64') =>
      call<{ ok: true; len: number }>('data.set', { name, values, dtype }),
  },

  render: {
    png: (page = 0, w = 800, h = 600, dpi = 96, antialias = true) =>
      call<RenderResult>('render.png', { page, w, h, dpi, antialias }),
    svg: (page = 0, w = 800, h = 600, dpi = 96) =>
      call<{ svg: string; width: number; height: number }>('render.svg', {
        page, w, h, dpi,
      }),
  },

  hittest: {
    point: (page: number, x: number, y: number) =>
      call<{ path: string | null }>('hittest.point', { page, x, y }),
  },

  bbox: {
    paths: (paths: string[]) =>
      call<Record<string, [number, number, number, number]>>('bbox.paths', { paths }),
  },

  state: {
    snapshot: () => call<{ blob: string }>('state.snapshot'),
    restore: (blob: string) =>
      call<{ ok: true; changeset: number }>('state.restore', { blob }),
  },
};
