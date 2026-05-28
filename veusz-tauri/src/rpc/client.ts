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
      rename: (path: string, name: string) =>
        t('doc.rename', { path, name }) as Promise<{
          path: string;
          changeset: number;
        }>,
      move: (path: string, direction: 'up' | 'down') =>
        t('doc.move', { path, direction }) as Promise<{
          path: string;
          moved: boolean;
          changeset: number;
        }>,
      duplicate: (path: string) =>
        t('doc.duplicate', { path }) as Promise<{
          path: string;
          changeset: number;
        }>,
      serializeWidgets: (paths: string[]) =>
        t('doc.serialize_widgets', { paths }) as Promise<{
          mime_type: string;
          payload_b64: string;
          count: number;
        }>,
      pasteWidgetsMime: (
        parent: string,
        mime_type: string,
        payload_b64: string,
      ) =>
        t('doc.paste_widgets_mime', { parent, mime_type, payload_b64 }) as Promise<{
          paths: string[];
          changeset: number;
        }>,
      canPasteMime: (
        parent: string,
        mime_type: string,
        payload_b64: string,
      ) =>
        t('doc.can_paste_mime', { parent, mime_type, payload_b64 }) as Promise<{
          ok: boolean;
        }>,
      propagateSetting: (
        path: string,
        scope:
          | 'all_of_type'
          | 'siblings'
          | 'type_and_name'
          | 'widgets',
        widget_paths?: string[],
      ) =>
        t('doc.propagate_setting', {
          path,
          scope,
          widget_paths,
        }) as Promise<{ changeset: number }>,
      resetSettingDefault: (path: string) =>
        t('doc.reset_setting_default', { path }) as Promise<{
          value: unknown;
          changeset: number;
        }>,
      setSettingDefault: (path: string) =>
        t('doc.set_setting_default', { path }) as Promise<{
          changeset: number;
          stylesheet_path: string;
        }>,
      unlinkSetting: (path: string) =>
        t('doc.unlink_setting', { path }) as Promise<{
          value: unknown;
          changeset: number;
        }>,
      commonSchema: (paths: string[]) =>
        t('doc.common_schema', { paths }) as Promise<WidgetSchema & {
          mode: 'common';
          count: number;
          typenames: string[];
        }>,
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
      delete: (names: string[]) =>
        t('data.delete', { names }) as Promise<{ deleted: string[] }>,
      rename: (old: string, newName: string) =>
        t('data.rename', { old, new: newName }) as Promise<{ name: string }>,
      duplicate: (name: string, new_name?: string) =>
        t('data.duplicate', { name, new_name }) as Promise<{ name: string }>,
      unlinkFile: (names: string[]) =>
        t('data.unlink_file', { names }) as Promise<{ unlinked: string[] }>,
      unlinkRelation: (names: string[]) =>
        t('data.unlink_relation', { names }) as Promise<{ unlinked: string[] }>,
      tag: (names: string[], tag: string) =>
        t('data.tag', { names, tag }) as Promise<{
          tagged: string[]; tag: string;
        }>,
      untag: (names: string[], tag: string) =>
        t('data.untag', { names, tag }) as Promise<{
          untagged: string[]; tag: string;
        }>,
      tagsList: () =>
        t('data.tags_list') as Promise<Record<string, string[]>>,
      reloadFile: (filename?: string) =>
        t('data.reload_file', { filename }) as Promise<{
          reloaded: string[];
          errors: Record<string, number>;
        }>,
      unlinkAllFile: (filename: string) =>
        t('data.unlink_all_file', { filename }) as Promise<{
          unlinked: string[];
        }>,
      deleteAllFile: (filename: string) =>
        t('data.delete_all_file', { filename }) as Promise<{
          deleted: string[];
        }>,
      useAsTargets: (name: string) =>
        t('data.use_as_targets', { name }) as Promise<{
          targets: Array<{ path: string; typename: string; widget: string }>;
        }>,
      serialize: (names: string[]) =>
        t('data.serialize', { names }) as Promise<{
          mime_type: string;
          payload_b64: string;
          count: number;
        }>,
      pasteMime: (mime_type: string, payload_b64: string) =>
        t('data.paste_mime', { mime_type, payload_b64 }) as Promise<{
          pasted: string[];
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
      copyImage: (
        page = 0,
        w = 800,
        h = 600,
        dpi = 96,
        format: 'png' | 'svg' = 'png',
      ) =>
        t('render.copy_image', { page, w, h, dpi, format }) as Promise<{
          format: 'png' | 'svg';
          mime_type: string;
          payload_b64: string;
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

    prefs: {
      get: (key: string) =>
        t('prefs.get', { key }) as Promise<{ key: string; value: unknown }>,
      set: (key: string, value: unknown) =>
        t('prefs.set', { key, value }) as Promise<{
          ok: true; key: string; value: unknown;
        }>,
      delete: (key: string) => t('prefs.delete', { key }) as Promise<{ ok: true }>,
      list: () =>
        t('prefs.list') as Promise<Array<{
          key: string;
          value: unknown;
          default: unknown;
          type: 'integer' | 'number' | 'boolean' | 'string';
          min?: number;
          max?: number;
          choices?: string[];
        }>>,
    },

    fit: {
      run: (params: {
        xData: string;
        yData: string;
        function: string;
        params: Record<string, number>;
        variable?: string;
        fit_range?: [number, number];
      }) =>
        t('fit.run', params as Record<string, unknown>) as Promise<{
          success: boolean;
          message: string;
          params: Record<string, { value: number; stderr: number | null }>;
          chi2: number | null;
          dof: number | null;
          reduced_chi2: number | null;
          x_range?: [number, number];
        }>,
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
      export: (path: string, pages?: number[], options: Record<string, unknown> = {}) =>
        t('file.export', { path, pages, options }) as Promise<{
          ok: true;
          path: string;
          pages: number[];
        }>,
      formats: () =>
        t('file.formats') as Promise<Array<{ extensions: string[]; description: string }>>,
      recentList: () =>
        t('file.recent_list') as Promise<{
          paths: Array<{ path: string; exists: boolean }>;
        }>,
      recentClear: () => t('file.recent_clear') as Promise<{ ok: true }>,
      recentRemove: (path: string) =>
        t('file.recent_remove', { path }) as Promise<{ ok: true }>,
    },
  };
}

// Convenience for the production app — call once at startup.
export function createTauriRpc(): Rpc {
  return createRpc(tauriTransport());
}
