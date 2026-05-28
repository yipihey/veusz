/**
 * Action registry types — the single source of truth that the menu bar,
 * toolbars, and (eventually) context menus all draw from. Mirrors the Qt
 * app's `vzactions` dict + menu/toolbar definition tables, so adding a
 * feature means adding one Action and referencing it from a menu/toolbar.
 */

import type { DocState } from '../state/doc';
import type { DocStore } from '../keys/shortcuts';

/** Modal dialogs an action can launch. Some are already built
 *  (stylesheet, fit, csv); others are stubs until their phase lands. */
export type DialogId =
  | 'preferences'
  | 'export'
  | 'stylesheet'
  | 'fit'
  | 'about'
  | 'importCsv'
  | 'dataEdit'
  | 'custom'
  | 'dataCreate'
  | 'dataCreate2d'
  | 'filter'
  | 'histogram'
  | 'console';

/** Host capabilities an action needs beyond the store (native pickers,
 *  dialog launching, fullscreen, notifications). AppShell builds this once
 *  and hands it to the menu/toolbar renderers. */
export interface ActionCtx {
  store: DocStore;
  openDialog: (id: DialogId) => void;
  pick: {
    vsz?: () => Promise<string | null>;
    savePath?: () => Promise<string | null>;
    exportPath?: () => Promise<string | null>;
    csv?: () => Promise<string | null>;
  };
  toggleFullScreen?: () => void;
  notify: (msg: string) => void;
  openUrl?: (url: string) => void;
}

export interface Action {
  id: string;
  /** Static label, or a function of state (e.g. dynamic Undo text). */
  label: string | ((s: DocState) => string);
  /** Display-only shortcut hint (key handling lives in keys/shortcuts.ts). */
  shortcut?: string;
  run: (ctx: ActionCtx) => void | Promise<void>;
  enabled?: (s: DocState) => boolean;
  checked?: (s: DocState) => boolean;
  visible?: (s: DocState) => boolean;
}

/** A node in a menu's item list. */
export type MenuItem =
  | { kind: 'action'; id: string }
  | { kind: 'separator' }
  | { kind: 'submenu'; label: string; items: MenuItem[] }
  /** Dynamic list of recent files (from store.recentFiles). */
  | { kind: 'recent' };

export interface Menu {
  label: string;
  items: MenuItem[];
}

export interface ToolbarGroup {
  id: string;
  actions: string[];
}

export function actionLabel(a: Action, s: DocState): string {
  return typeof a.label === 'function' ? a.label(s) : a.label;
}
