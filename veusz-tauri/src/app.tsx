// App entry — wires the Tauri RPC client into the AppShell.
//
// At runtime under `tauri dev` / a built bundle, this works as-is.
// Vitest tests import `AppShell` directly and inject their own
// stores; this file is only the production boot path.

import { AppShell } from './components/app/AppShell';
import { createTauriRpc } from './rpc/client';
import { createDocStore } from './state/doc';

const rpc = createTauriRpc();
const store = createDocStore(rpc);

async function pickCsv(): Promise<string | null> {
  // `@tauri-apps/plugin-dialog` is loaded dynamically at runtime
  // so vitest (which doesn't have the package installed) can compile
  // this file. Add the plugin to package.json when wiring the Tauri
  // shell — see `veusz-tauri/README.md`.
  // @ts-expect-error — plugin loaded at Tauri runtime, not installed for vitest.
  const mod = (await import(/* @vite-ignore */ '@tauri-apps/plugin-dialog')) as {
    open: (opts: unknown) => Promise<string | string[] | null>;
  };
  const picked = await mod.open({
    filters: [{ name: 'CSV', extensions: ['csv', 'tsv', 'txt'] }],
  });
  return typeof picked === 'string' ? picked : null;
}

export function App() {
  return <AppShell store={store} onPickCsv={pickCsv} />;
}
