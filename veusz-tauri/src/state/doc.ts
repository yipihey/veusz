/**
 * Zustand store mirroring the daemon's document state.
 *
 * One store per app instance. The store owns:
 *  - the widget tree (from doc.tree)
 *  - the dataset list (from data.list)
 *  - the selected widget path and its cached schema + values
 *  - the latest render result
 *  - undo/redo availability
 *
 * Mutations are async: they call through the injected `Rpc` and then
 * refresh the affected slices. The store is transport-agnostic — the
 * App passes in either a tauriTransport-backed Rpc (production), a
 * nodeTransport-backed one (e2e tests), or a mockTransport (unit
 * tests).
 */

import { create } from 'zustand';
import type {
  DataInfo,
  RenderResult,
  WidgetSchema,
  WidgetTreeNode,
} from '../rpc/types';
import type { Rpc } from '../rpc/client';
import {
  createClipboard,
  type Clipboard,
} from '../clipboard';

const WIDGET_MIME = 'text/x-vnd.veusz-widget-3';
const DATA_MIME = 'text/x-vnd.veusz-data-1';

export interface DocState {
  rpc: Rpc;
  clipboard: Clipboard;
  tree: WidgetTreeNode | null;
  datasets: DataInfo[];
  selected: string | null;
  schema: WidgetSchema | null;
  values: Record<string, unknown>;
  render: RenderResult | null;
  canUndo: boolean;
  canRedo: boolean;
  /** Most recent failed call, surfaced to the UI's error banner. */
  error: string | null;
  /** Path that was just cut and is awaiting paste. Cut is
   *  immediate-remove + undo (Qt parity), so this is purely
   *  informational — set then cleared after the next paste. */
  cutPaths: string[];

  // --- lifecycle ---
  refreshTree: () => Promise<void>;
  refreshDatasets: () => Promise<void>;
  refreshUndoState: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;

  // --- selection ---
  select: (path: string | null) => Promise<void>;

  // --- edits ---
  setValue: (path: string, value: unknown) => Promise<void>;
  /** Batch setting writes — used by Inspector multi-edit. Collapses
   *  to a single undo step daemon-side via OperationMultiple. */
  setValues: (ops: Array<{ path: string; value: unknown }>) => Promise<void>;
  addWidget: (parent: string, type: string, name?: string) => Promise<string>;
  removeWidget: (path: string) => Promise<void>;
  renameWidget: (path: string, name: string) => Promise<string | null>;
  moveWidget: (path: string, direction: 'up' | 'down') => Promise<void>;
  duplicateWidget: (path: string) => Promise<string | null>;
  setHidden: (paths: string[], hidden: boolean) => Promise<void>;

  // --- clipboard (widgets) ---
  copyWidgets: (paths: string[]) => Promise<void>;
  cutWidgets: (paths: string[]) => Promise<void>;
  pasteWidgets: (parent: string) => Promise<string[]>;
  canPasteWidgets: (parent: string) => Promise<boolean>;
  copyWidgetAsImage: (page: number, w: number, h: number, dpi?: number)
    => Promise<void>;

  // --- setting-label actions ---
  propagateSetting: (
    path: string,
    scope: 'all_of_type' | 'siblings' | 'type_and_name' | 'widgets',
    widget_paths?: string[],
  ) => Promise<void>;
  resetSettingDefault: (path: string) => Promise<void>;
  setSettingDefault: (path: string) => Promise<void>;
  unlinkSetting: (path: string) => Promise<void>;

  // --- data ---
  importCsv: (filename: string) => Promise<string[]>;
  deleteDatasets: (names: string[]) => Promise<void>;
  renameDataset: (oldName: string, newName: string) => Promise<void>;
  duplicateDataset: (name: string, new_name?: string) => Promise<string | null>;
  unlinkDatasetFile: (names: string[]) => Promise<void>;
  unlinkDatasetRelation: (names: string[]) => Promise<void>;
  tagDatasets: (names: string[], tag: string) => Promise<void>;
  untagDatasets: (names: string[], tag: string) => Promise<void>;
  copyDatasets: (names: string[]) => Promise<void>;
  pasteDatasets: () => Promise<string[]>;
  reloadFile: (filename?: string) => Promise<void>;
  unlinkAllInFile: (filename: string) => Promise<void>;
  deleteAllInFile: (filename: string) => Promise<void>;

  // --- file ---
  filename: string | null;
  openFile: (path: string) => Promise<void>;
  saveFile: () => Promise<string | null>;
  saveFileAs: (path: string) => Promise<void>;
  exportFile: (path: string, pages?: number[]) => Promise<string | null>;
  refreshFileInfo: () => Promise<void>;

  // --- rendering ---
  renderAt: (page: number, w: number, h: number, dpi?: number) => Promise<void>;
  /** Debounced render — multiple calls inside the coalesce window
   *  collapse to one. Used by AppShell to absorb rapid edit storms
   *  (slider drags, undo runs). */
  requestRender: (page: number, w: number, h: number, dpi?: number) => void;

  // --- history ---
  undo: () => Promise<void>;
  redo: () => Promise<void>;

  /** Subscribe to daemon push events (doc.changed, data.changed) and
   *  refresh the affected slices automatically. Returns an
   *  unsubscribe function so the AppShell can clean up on unmount. */
  subscribeToDaemon: () => () => void;
}

/** Walk a schema and return every absolute setting path under `base`. */
export function collectSettingPaths(
  group: WidgetSchema | WidgetSchema['subgroups'][number],
  base: string,
): string[] {
  const acc: string[] = [];
  for (const s of group.settings) acc.push(joinPath(base, s.name));
  for (const sg of group.subgroups) acc.push(...collectSettingPaths(sg, joinPath(base, sg.name)));
  return acc;
}

function joinPath(parent: string, name: string): string {
  return parent === '/' ? '/' + name : parent + '/' + name;
}

/** Debounce window for `requestRender`. Tuned to ~30 Hz which feels
 *  smooth for slider drags and well under the daemon's measured
 *  p95 render time (~11 ms in the perf spike). */
const RENDER_COALESCE_MS = 33;

export function createDocStore(rpc: Rpc, clipboard: Clipboard = createClipboard()) {
  // Live at store-creation scope (not state) so they're not subject
  // to React's render lifecycle.
  let renderTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingRender: { page: number; w: number; h: number; dpi?: number } | null = null;

  return create<DocState>((set, get) => {
    // Does not auto-clear `error` on success — concurrent calls
    // would otherwise wipe each other's failures from a Promise.all.
    // Callers reset it explicitly via `clearError` (or by starting a
    // new top-level action that calls `refreshAll`, which clears).
    const guard = async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (e) {
        set({ error: (e as Error).message });
        return undefined;
      }
    };

    return {
      rpc,
      clipboard,
      tree: null,
      datasets: [],
      selected: null,
      schema: null,
      values: {},
      render: null,
      canUndo: false,
      canRedo: false,
      error: null,
      filename: null,
      cutPaths: [],

      refreshTree: async () => {
        const tree = await guard(() => rpc.doc.tree());
        if (tree) set({ tree });
      },

      refreshDatasets: async () => {
        const datasets = await guard(() => rpc.data.list());
        if (datasets) set({ datasets });
      },

      refreshUndoState: async () => {
        const s = await guard(() => rpc.doc.canUndo());
        if (s) set({ canUndo: s.can_undo, canRedo: s.can_redo });
      },

      refreshAll: async () => {
        set({ error: null });
        await Promise.all([
          get().refreshTree(),
          get().refreshDatasets(),
          get().refreshUndoState(),
          get().refreshFileInfo(),
        ]);
      },

      clearError: () => set({ error: null }),

      refreshFileInfo: async () => {
        const info = await guard(() => rpc.file.info());
        if (info) set({ filename: info.path });
      },

      openFile: async (path) => {
        const r = await guard(() => rpc.file.open(path));
        if (!r) return;
        set({ filename: r.path, selected: null, schema: null, values: {} });
        await Promise.all([get().refreshTree(), get().refreshDatasets(), get().refreshUndoState()]);
      },

      saveFile: async () => {
        // Falls back to save_as semantics if no filename — callers
        // should check `get().filename` first to prompt the user.
        if (!get().filename) {
          set({ error: 'no filename — use Save As' });
          return null;
        }
        const r = await guard(() => rpc.file.save());
        return r?.path ?? null;
      },

      saveFileAs: async (path) => {
        const r = await guard(() => rpc.file.saveAs(path));
        if (r) set({ filename: r.path });
      },

      exportFile: async (path, pages) => {
        const r = await guard(() => rpc.file.export(path, pages));
        return r?.path ?? null;
      },

      select: async (path) => {
        if (path === null) {
          set({ selected: null, schema: null, values: {} });
          return;
        }
        // Look up the widget type from the tree, then fetch schema + values.
        const widgetType = findWidgetType(get().tree, path);
        if (!widgetType) {
          set({ selected: path, schema: null, values: {} });
          return;
        }
        const schema = await guard(() => rpc.doc.schema(widgetType));
        if (!schema) {
          set({ selected: path });
          return;
        }
        const paths = collectSettingPaths(schema, path);
        const values = (await guard(() => rpc.doc.get(paths))) ?? {};
        set({ selected: path, schema, values });
      },

      setValue: async (path, value) => {
        const r = await guard(() => rpc.doc.set([{ path, value }]));
        if (!r) return;
        // Update the local cache so the inspector reflects the change
        // immediately, even before the next selection refresh.
        const next = { ...get().values };
        for (const d of r.diffs) next[d.path] = d.new;
        set({ values: next });
        await get().refreshUndoState();
      },

      addWidget: async (parent, type, name) => {
        const r = await guard(() => rpc.doc.add(parent, type, name));
        await get().refreshTree();
        await get().refreshUndoState();
        return r?.path ?? '';
      },

      removeWidget: async (path) => {
        await guard(() => rpc.doc.remove(path));
        if (get().selected === path) {
          await get().select(null);
        }
        await get().refreshTree();
        await get().refreshUndoState();
      },

      setValues: async (ops) => {
        if (!ops.length) return;
        const r = await guard(() => rpc.doc.set(ops));
        if (!r) return;
        const next = { ...get().values };
        for (const d of r.diffs) next[d.path] = d.new;
        set({ values: next });
        await get().refreshUndoState();
      },

      renameWidget: async (path, name) => {
        const r = await guard(() => rpc.doc.rename(path, name));
        await get().refreshTree();
        await get().refreshUndoState();
        if (r && get().selected === path) {
          await get().select(r.path);
        }
        return r?.path ?? null;
      },

      moveWidget: async (path, direction) => {
        await guard(() => rpc.doc.move(path, direction));
        await get().refreshTree();
        await get().refreshUndoState();
      },

      duplicateWidget: async (path) => {
        const r = await guard(() => rpc.doc.duplicate(path));
        await get().refreshTree();
        await get().refreshUndoState();
        return r?.path ?? null;
      },

      setHidden: async (paths, hidden) => {
        if (!paths.length) return;
        await get().setValues(paths.map((p) => ({
          path: p + '/hide', value: hidden,
        })));
        await get().refreshTree();
      },

      copyWidgets: async (paths) => {
        if (!paths.length) return;
        const r = await guard(() => rpc.doc.serializeWidgets(paths));
        if (!r) return;
        await clipboard.write({
          mime_type: r.mime_type,
          payload_b64: r.payload_b64,
        });
        // A fresh copy clears any pending "cut" marker.
        set({ cutPaths: [] });
      },

      cutWidgets: async (paths) => {
        if (!paths.length) return;
        // Qt parity: cut = copy then remove. The clipboard is set first
        // so an interrupted cut still leaves the bytes recoverable via
        // paste; the remove is wrapped in undo, so Ctrl+Z restores it.
        const r = await guard(() => rpc.doc.serializeWidgets(paths));
        if (!r) return;
        await clipboard.write({
          mime_type: r.mime_type,
          payload_b64: r.payload_b64,
        });
        // Remove deepest-first so parents don't disappear under children.
        const ordered = [...paths].sort((a, b) => b.length - a.length);
        for (const p of ordered) {
          await guard(() => rpc.doc.remove(p));
        }
        if (paths.includes(get().selected ?? '')) {
          await get().select(null);
        }
        set({ cutPaths: paths });
        await get().refreshTree();
        await get().refreshUndoState();
      },

      pasteWidgets: async (parent) => {
        const payload = await clipboard.read([WIDGET_MIME]);
        if (!payload) return [];
        const r = await guard(() => rpc.doc.pasteWidgetsMime(
          parent, payload.mime_type, payload.payload_b64,
        ));
        if (!r) return [];
        set({ cutPaths: [] });
        await get().refreshTree();
        await get().refreshUndoState();
        return r.paths;
      },

      canPasteWidgets: async (parent) => {
        const payload = await clipboard.read([WIDGET_MIME]);
        if (!payload) return false;
        const r = await guard(() => rpc.doc.canPasteMime(
          parent, payload.mime_type, payload.payload_b64,
        ));
        return r?.ok ?? false;
      },

      copyWidgetAsImage: async (page, w, h, dpi = 96) => {
        const r = await guard(() => rpc.render.copyImage(page, w, h, dpi, 'png'));
        if (!r) return;
        await clipboard.write({
          mime_type: r.mime_type,
          payload_b64: r.payload_b64,
        });
      },

      propagateSetting: async (path, scope, widget_paths) => {
        await guard(() => rpc.doc.propagateSetting(path, scope, widget_paths));
        await get().refreshUndoState();
        const sel = get().selected;
        if (sel) await get().select(sel);
      },

      resetSettingDefault: async (path) => {
        await guard(() => rpc.doc.resetSettingDefault(path));
        await get().refreshUndoState();
        const sel = get().selected;
        if (sel) await get().select(sel);
      },

      setSettingDefault: async (path) => {
        await guard(() => rpc.doc.setSettingDefault(path));
        await get().refreshUndoState();
      },

      unlinkSetting: async (path) => {
        await guard(() => rpc.doc.unlinkSetting(path));
        await get().refreshUndoState();
        const sel = get().selected;
        if (sel) await get().select(sel);
      },

      importCsv: async (filename) => {
        const r = await guard(() => rpc.data.import('csv', filename));
        await get().refreshDatasets();
        return r?.imported ?? [];
      },

      deleteDatasets: async (names) => {
        if (!names.length) return;
        await guard(() => rpc.data.delete(names));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      renameDataset: async (oldName, newName) => {
        await guard(() => rpc.data.rename(oldName, newName));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      duplicateDataset: async (name, new_name) => {
        const r = await guard(() => rpc.data.duplicate(name, new_name));
        await get().refreshDatasets();
        await get().refreshUndoState();
        return r?.name ?? null;
      },

      unlinkDatasetFile: async (names) => {
        if (!names.length) return;
        await guard(() => rpc.data.unlinkFile(names));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      unlinkDatasetRelation: async (names) => {
        if (!names.length) return;
        await guard(() => rpc.data.unlinkRelation(names));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      tagDatasets: async (names, tag) => {
        if (!names.length) return;
        await guard(() => rpc.data.tag(names, tag));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      untagDatasets: async (names, tag) => {
        if (!names.length) return;
        await guard(() => rpc.data.untag(names, tag));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      copyDatasets: async (names) => {
        if (!names.length) return;
        const r = await guard(() => rpc.data.serialize(names));
        if (!r) return;
        await clipboard.write({
          mime_type: r.mime_type,
          payload_b64: r.payload_b64,
        });
      },

      pasteDatasets: async () => {
        const payload = await clipboard.read([DATA_MIME]);
        if (!payload) return [];
        const r = await guard(() => rpc.data.pasteMime(
          payload.mime_type, payload.payload_b64,
        ));
        await get().refreshDatasets();
        await get().refreshUndoState();
        return r?.pasted ?? [];
      },

      reloadFile: async (filename) => {
        await guard(() => rpc.data.reloadFile(filename));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      unlinkAllInFile: async (filename) => {
        await guard(() => rpc.data.unlinkAllFile(filename));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      deleteAllInFile: async (filename) => {
        await guard(() => rpc.data.deleteAllFile(filename));
        await get().refreshDatasets();
        await get().refreshUndoState();
      },

      renderAt: async (page, w, h, dpi = 96) => {
        const r = await guard(() => rpc.render.png(page, w, h, dpi, false));
        if (r) set({ render: r });
      },

      requestRender: (page, w, h, dpi = 96) => {
        // Coalesce: keep the LATEST viewport args and reset the timer
        // on every call so a stream of edits collapses to one render
        // after RENDER_COALESCE_MS of quiet.
        pendingRender = { page, w, h, dpi };
        if (renderTimer) clearTimeout(renderTimer);
        renderTimer = setTimeout(() => {
          renderTimer = null;
          const args = pendingRender;
          pendingRender = null;
          if (args) void get().renderAt(args.page, args.w, args.h, args.dpi);
        }, RENDER_COALESCE_MS);
      },

      undo: async () => {
        const r = await guard(() => rpc.doc.undo());
        if (r) set({ canUndo: r.can_undo, canRedo: r.can_redo });
        await get().refreshTree();
        // If the current selection survives, refresh its values
        const sel = get().selected;
        if (sel) await get().select(sel);
      },

      redo: async () => {
        const r = await guard(() => rpc.doc.redo());
        if (r) set({ canUndo: r.can_undo, canRedo: r.can_redo });
        await get().refreshTree();
        const sel = get().selected;
        if (sel) await get().select(sel);
      },

      subscribeToDaemon: () => {
        const offDoc = rpc.subscribe('doc.changed', () => {
          // Tree + undo-state always stale after a daemon-side mutation.
          // Re-fetch selection values too so a background eval.python
          // call shows up in the inspector.
          void get().refreshTree();
          void get().refreshUndoState();
          const sel = get().selected;
          if (sel) void get().select(sel);
        });
        const offData = rpc.subscribe('data.changed', () => {
          void get().refreshDatasets();
        });
        return () => { offDoc(); offData(); };
      },
    };
  });
}

function findWidgetType(tree: WidgetTreeNode | null, path: string): string | null {
  if (!tree) return null;
  if (tree.path === path) return tree.type;
  for (const c of tree.children) {
    const r = findWidgetType(c, path);
    if (r) return r;
  }
  return null;
}
