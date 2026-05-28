/**
 * Global keyboard shortcuts for the Tauri shell.
 *
 * Mirrors the Qt Veusz keymap (treeeditwindow.py + plotwindow.py):
 *
 *   Ctrl+X / Ctrl+C / Ctrl+V       — cut / copy / paste widgets
 *   Ctrl+Alt+C                     — copy as image
 *   Del / Backspace                — delete selected widget
 *   Ctrl+Z / Ctrl+Y (or Shift+Z)   — undo / redo
 *   Ctrl+] / Ctrl+[                — show / hide selected widget
 *   Ctrl+Shift+PageUp / PageDown   — move selected widget up / down
 *   F2                             — start inline rename
 *
 * All shortcuts are INERT when an editable element has focus (input,
 * textarea, contentEditable) so the native browser behaviour for
 * Ctrl+C-in-a-text-field continues to work. The hook listens on
 * `window` and dispatches to the store, NOT directly to RPC — so a
 * Cut at the keyboard and a right-click Cut in the menu funnel
 * through the same action.
 *
 * Phase 1 ships the hook + action map; the components that emit
 * "the user wants to rename" or "the user wants to invoke a context
 * action" land in their respective later phases.
 */

import { useEffect } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { DocState } from '../state/doc';

export type DocStore = UseBoundStore<StoreApi<DocState>>;

/** A keyboard event we care about, normalized into shortcut form. */
export interface Shortcut {
  /** Lowercase key (e.g. 'c', 'pageup'). For letters this is `.key`
   *  lowercased; for special keys it's the spec name (Delete, etc.). */
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  /** Treat ⌘ on macOS as ctrl — matches every Qt-keymapped shortcut
   *  the legacy app uses. */
  meta: boolean;
}

export function eventToShortcut(e: KeyboardEvent): Shortcut {
  return {
    key: e.key.length === 1 ? e.key.toLowerCase() : e.key,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    alt: e.altKey,
    meta: e.metaKey,
  };
}

/** Cmd (macOS) and Ctrl are equivalent for our shortcut surface. */
function cmdOrCtrl(s: Shortcut): boolean {
  return s.ctrl || s.meta;
}

/** True iff the keyboard event landed on an editable widget. The
 *  hook silently no-ops in that case so the user's text input gets
 *  native Ctrl+C behaviour. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/** Action name → handler. Pure data so tests can assert routing
 *  without mounting the React tree. */
export type ShortcutAction =
  | 'cut' | 'copy' | 'paste' | 'copyAsImage'
  | 'delete' | 'undo' | 'redo'
  | 'show' | 'hide'
  | 'moveUp' | 'moveDown'
  | 'rename';

export function classify(s: Shortcut): ShortcutAction | null {
  const cmd = cmdOrCtrl(s);
  if (cmd && !s.shift && !s.alt && s.key === 'x') return 'cut';
  if (cmd && !s.shift && !s.alt && s.key === 'c') return 'copy';
  if (cmd && !s.shift && !s.alt && s.key === 'v') return 'paste';
  if (cmd && !s.shift && s.alt && s.key === 'c') return 'copyAsImage';
  if (!cmd && !s.shift && !s.alt && (s.key === 'Delete' || s.key === 'Backspace'))
    return 'delete';
  if (cmd && !s.shift && !s.alt && s.key === 'z') return 'undo';
  if (cmd && !s.alt && (s.key === 'y' || (s.shift && s.key === 'z'))) return 'redo';
  if (cmd && !s.shift && !s.alt && s.key === ']') return 'show';
  if (cmd && !s.shift && !s.alt && s.key === '[') return 'hide';
  if (cmd && s.shift && !s.alt && s.key === 'PageUp') return 'moveUp';
  if (cmd && s.shift && !s.alt && s.key === 'PageDown') return 'moveDown';
  if (!cmd && !s.shift && !s.alt && s.key === 'F2') return 'rename';
  return null;
}

/** Dispatcher: routes a classified action against the store. Pure
 *  function (no React) so the unit tests can call it directly. */
export async function dispatch(action: ShortcutAction, store: DocStore) {
  const s = store.getState();
  const sel = s.selected;
  switch (action) {
    case 'undo':
      return s.undo();
    case 'redo':
      return s.redo();
    case 'cut':
      return sel ? s.cutWidgets([sel]) : undefined;
    case 'copy':
      return sel ? s.copyWidgets([sel]) : undefined;
    case 'paste':
      // Paste into the selected widget if it can accept; otherwise
      // into its parent. Phase-2 tree wiring will refine the parent
      // pick when the user right-clicks an explicit row.
      if (!sel) return undefined;
      return s.pasteWidgets(sel).then(() => undefined);
    case 'copyAsImage':
      // Copies current page. AppShell will surface a page/size hint
      // when this is wired into a real menu; for now use the last
      // render's dimensions if available.
      if (!s.render) return undefined;
      return s.copyWidgetAsImage(0, s.render.width, s.render.height);
    case 'delete':
      return sel ? s.removeWidget(sel) : undefined;
    case 'hide':
      return sel ? s.setHidden([sel], true) : undefined;
    case 'show':
      return sel ? s.setHidden([sel], false) : undefined;
    case 'moveUp':
      return sel ? s.moveWidget(sel, 'up') : undefined;
    case 'moveDown':
      return sel ? s.moveWidget(sel, 'down') : undefined;
    case 'rename':
      // No actual rename here — the hook only emits an intent. The
      // Tree (Phase 2) listens for the same event and flips a row
      // into inline-edit mode. For now there's nothing to do.
      return undefined;
  }
}

/** React hook to install/remove the global listener.
 *
 *  Use once at the AppShell root. The hook handles cleanup on
 *  unmount and avoids re-binding on every render via a stable
 *  dependency list. */
export function useKeyboardShortcuts(store: DocStore) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      const action = classify(eventToShortcut(e));
      if (!action) return;
      e.preventDefault();
      void dispatch(action, store);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store]);
}
