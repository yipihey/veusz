/// <reference types="vite/client" />
// App entry — wires the Tauri RPC client into the AppShell.
//
// At runtime under `tauri dev` / a built bundle, this works as-is.
// Vitest tests import `AppShell` directly and inject their own
// stores; this file is only the production boot path.

import { useEffect } from 'react';
import { AppShell } from './components/app/AppShell';
import { createTauriRpc } from './rpc/client';
import { createDocStore } from './state/doc';

const rpc = createTauriRpc();
const store = createDocStore(rpc);

// Dev-time auto-open: set VITE_VEUSZ_INITIAL_FILE=/path/to.vsz in the
// environment before `cargo tauri dev` and the document loads as soon
// as the daemon is connected. Useful for screenshotting examples and
// for quick "see something real" iterations while the file-picker
// (onPickVsz) is not yet wired.
const INITIAL_FILE = import.meta.env.VITE_VEUSZ_INITIAL_FILE as
  | string
  | undefined;

async function pickCsv(): Promise<string | null> {
  // `@tauri-apps/plugin-dialog` is loaded dynamically at runtime so
  // the dynamic import below isn't bundled into the production page.
  const mod = (await import(/* @vite-ignore */ '@tauri-apps/plugin-dialog')) as {
    open: (opts: unknown) => Promise<string | string[] | null>;
  };
  const picked = await mod.open({
    filters: [{ name: 'CSV', extensions: ['csv', 'tsv', 'txt'] }],
  });
  return typeof picked === 'string' ? picked : null;
}

export function App() {
  useEffect(() => {
    if (!INITIAL_FILE) return;
    void store.getState().openFile(INITIAL_FILE);
  }, []);
  return <AppShell store={store} onPickCsv={pickCsv} />;
}
