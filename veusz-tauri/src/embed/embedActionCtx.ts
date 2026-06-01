/**
 * Build an `ActionCtx` for the embed so the existing `ACTIONS` registry from
 * `src/actions/actions.ts` runs unchanged inside `<veusz-figure>`. The desktop
 * AppShell builds a different ctx with native file pickers + fullscreen via
 * Tauri; the embed has neither. We:
 *
 *  - leave `pick.*` undefined so file-picker-gated actions (file.open/save/
 *    saveas, data.import via the CSV preview flow) silently no-op when the
 *    toolbar invokes them (the toolbar omits those ids anyway);
 *  - route `openDialog(id)` to a handful of dialog ids we DO want in the
 *    embed (the data-create / data-edit / custom-definitions flows that
 *    don't need a native picker); everything else falls through to `notify`;
 *  - leave `openPlugin` as a notify (plugin browsing isn't in the v1
 *    toolbar — easy to add later).
 *
 * The toolbar passes one of these to every `ACTIONS[id].run(ctx)` it fires.
 */

import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../state/doc';
import type { ActionCtx, DialogId } from '../actions/types';

type Store = UseBoundStore<StoreApi<DocState>>;

export interface EmbedHostHooks {
  /** Transient user-facing message (errors / "coming soon" / etc.). */
  notify: (msg: string) => void;
  /** Mount the embed's small dialog portal for one of the supported ids. */
  openDialog?: (id: DialogId) => void;
  /** Optional full-screen toggle (the editor modal already has its own). */
  toggleFullScreen?: () => void;
}

export function makeEmbedActionCtx(store: Store, hooks: EmbedHostHooks): ActionCtx {
  return {
    store,
    notify: hooks.notify,
    openDialog: (id) => {
      if (hooks.openDialog) hooks.openDialog(id);
      else hooks.notify(`"${id}" dialog unavailable in this embed.`);
    },
    // No native pickers in the embed. The toolbar deliberately omits the
    // actions that need them (file.open/save/saveas, data.import), but if
    // anything else reaches here it'll fail closed rather than crash.
    pick: {},
    toggleFullScreen: hooks.toggleFullScreen,
    openUrl: (url: string) => {
      if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
    },
    openPlugin: () => {
      hooks.notify('Plugins are not wired in the embed yet.');
    },
  };
}
