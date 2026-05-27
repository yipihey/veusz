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

export interface DocState {
  rpc: Rpc;
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
  addWidget: (parent: string, type: string, name?: string) => Promise<string>;
  removeWidget: (path: string) => Promise<void>;

  // --- data ---
  importCsv: (filename: string) => Promise<string[]>;

  // --- file ---
  filename: string | null;
  openFile: (path: string) => Promise<void>;
  saveFile: () => Promise<string | null>;
  saveFileAs: (path: string) => Promise<void>;
  refreshFileInfo: () => Promise<void>;

  // --- rendering ---
  renderAt: (page: number, w: number, h: number, dpi?: number) => Promise<void>;

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

export function createDocStore(rpc: Rpc) {
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

      importCsv: async (filename) => {
        const r = await guard(() => rpc.data.import('csv', filename));
        await get().refreshDatasets();
        return r?.imported ?? [];
      },

      renderAt: async (page, w, h, dpi = 96) => {
        const r = await guard(() => rpc.render.png(page, w, h, dpi, false));
        if (r) set({ render: r });
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
