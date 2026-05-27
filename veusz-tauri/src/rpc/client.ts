// Typed JSON-RPC client for the veuszd daemon.
//
// Transport is injected at construction so the same client works
// under Tauri (`invoke('rpc', ...)`), Node tests (real UDS socket),
// and unit tests (mock handlers).

import type {
  DataInfo,
  DocSetOp,
  RenderResult,
  WidgetSchema,
  WidgetTreeNode,
} from './types';
import type { Transport } from './transport';
import { tauriTransport } from './transport';

export type Rpc = ReturnType<typeof createRpc>;

export function createRpc(transport: Transport) {
  const t = (method: string, params?: Record<string, unknown>) =>
    transport.call(method, params);

  return {
    /** Push-notification subscribe (doc.changed, data.changed, etc.). */
    subscribe: transport.subscribe.bind(transport),

    ping: () => t('ping') as Promise<{ pong: true }>,
    version: () => t('version') as Promise<{ veusz: string; api: number }>,

    doc: {
      tree: () => t('doc.tree') as Promise<WidgetTreeNode>,
      schema: (widget_type: string, mode: 'class' | 'instance' = 'class') =>
        t('doc.schema', { widget_type, mode }) as Promise<WidgetSchema>,
      schemaAt: (path: string) =>
        t('doc.schema_at', { path }) as Promise<WidgetSchema>,
      widgetTypes: () => t('doc.widget_types') as Promise<string[]>,
      add: (parent: string, type: string, name?: string) =>
        t('doc.add', { parent, type, name }) as Promise<{ path: string }>,
      set: (ops: DocSetOp[]) =>
        t('doc.set', { ops }) as Promise<{
          changeset: number;
          diffs: Array<{ path: string; old: unknown; new: unknown }>;
        }>,
      get: (paths: string[]) =>
        t('doc.get', { paths }) as Promise<Record<string, unknown>>,
      remove: (path: string) =>
        t('doc.remove', { path }) as Promise<{ ok: true; changeset: number }>,
      undo: () =>
        t('doc.undo') as Promise<{
          changeset: number;
          can_undo: boolean;
          can_redo: boolean;
        }>,
      redo: () =>
        t('doc.redo') as Promise<{
          changeset: number;
          can_undo: boolean;
          can_redo: boolean;
        }>,
      canUndo: () =>
        t('doc.can_undo') as Promise<{ can_undo: boolean; can_redo: boolean }>,
    },

    data: {
      list: () => t('data.list') as Promise<DataInfo[]>,
      peek: (name: string, start = 0, count = 100) =>
        t('data.peek', { name, start, count }) as Promise<{
          values: number[];
          start: number;
          total: number;
        }>,
      stats: (name: string) =>
        t('data.stats', { name }) as Promise<{
          name: string;
          min: number;
          max: number;
          mean: number;
          std: number;
          len: number;
        }>,
      set: (name: string, values: number[], dtype = 'float64') =>
        t('data.set', { name, values, dtype }) as Promise<{
          ok: true;
          len: number;
        }>,
      import: (kind: string, filename: string, options: Record<string, unknown> = {}) =>
        t('data.import', { kind, filename, options }) as Promise<{
          imported: string[];
          errors: string[];
        }>,
      previewCsv: (params: {
        filename: string;
        delimiter?: string;
        text_delimiter?: string;
        encoding?: string;
        rows_ignore?: number;
        header_ignore?: number;
        max_rows?: number;
      }) =>
        t('data.preview_csv', params as Record<string, unknown>) as Promise<{
          header: string[];
          rows: string[][];
          total_lines_estimated: number;
          truncated: boolean;
        }>,
    },

    render: {
      png: (page = 0, w = 800, h = 600, dpi = 96, antialias = true) =>
        t('render.png', { page, w, h, dpi, antialias }) as Promise<RenderResult>,
      svg: (page = 0, w = 800, h = 600, dpi = 96) =>
        t('render.svg', { page, w, h, dpi }) as Promise<{
          svg: string;
          width: number;
          height: number;
        }>,
    },

    hittest: {
      point: (page: number, x: number, y: number) =>
        t('hittest.point', { page, x, y }) as Promise<{ path: string | null }>,
    },

    bbox: {
      paths: (paths: string[]) =>
        t('bbox.paths', { paths }) as Promise<
          Record<string, [number, number, number, number]>
        >,
    },

    state: {
      snapshot: () => t('state.snapshot') as Promise<{ blob: string }>,
      restore: (blob: string) =>
        t('state.restore', { blob }) as Promise<{
          ok: true;
          changeset: number;
        }>,
    },

    file: {
      open: (path: string) =>
        t('file.open', { path }) as Promise<{
          ok: true;
          path: string;
          changeset: number;
        }>,
      save: () =>
        t('file.save') as Promise<{
          ok: true;
          path: string;
          changeset: number;
        }>,
      saveAs: (path: string) =>
        t('file.save_as', { path }) as Promise<{
          ok: true;
          path: string;
          changeset: number;
        }>,
      info: () =>
        t('file.info') as Promise<{
          path: string | null;
          changeset: number;
          modified: boolean;
        }>,
    },
  };
}

// Convenience for the production app — call once at startup.
export function createTauriRpc(): Rpc {
  return createRpc(tauriTransport());
}
