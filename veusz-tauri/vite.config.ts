import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tauri expects a fixed port; failing build if it's taken keeps the
// dev workflow predictable.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    // Allow the dev server to serve the wasm glue + binary for the
    // client-side Vello path (crates/veusz-paint-wasm/pkg), which sits
    // inside the Vite root but outside src/.
    fs: { allow: ['.', './crates'] },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  // Treat the wasm binary as an asset so wasm-bindgen's init fetch resolves.
  assetsInclude: ['**/*.wasm'],
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      // Multi-page: the main app + the standalone WASM/Vello figure harness.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        figure: fileURLToPath(new URL('./figure.html', import.meta.url)),
      },
    },
  },
});
