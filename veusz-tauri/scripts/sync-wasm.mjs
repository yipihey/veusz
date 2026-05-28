// Copy the wasm-bindgen output for the client-side Vello renderer into
// public/wasm/ so Vite serves it in dev and copies it into dist/ on build.
// The pkg is a local build artifact (wasm-pack / cargo), so this is
// non-fatal when it's missing — the vello-wasm path simply stays
// unavailable and the UI degrades to a server-side backend.

import { copyFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const pkg = join(root, 'crates', 'veusz-paint-wasm', 'pkg');
const out = join(root, 'public', 'wasm');
const files = ['veusz_paint_wasm.js', 'veusz_paint_wasm_bg.wasm'];

try {
  await access(join(pkg, files[1]));
} catch {
  console.warn(
    `[sync-wasm] ${pkg} not built — skipping. Build it (wasm-pack build / `
    + `cargo) to enable the in-browser Vello (WASM) path; the UI degrades to `
    + `a server-side backend until then.`,
  );
  process.exit(0);
}

await mkdir(out, { recursive: true });
for (const f of files) {
  await copyFile(join(pkg, f), join(out, f));
}
console.log(`[sync-wasm] copied ${files.length} file(s) -> public/wasm/`);
