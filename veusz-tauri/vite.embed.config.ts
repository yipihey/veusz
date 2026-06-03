import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Library build for the standalone embed: a single self-contained ES module
// (`veusz-embed.js`) that registers the <veusz-figure> custom element. React
// and the app code are bundled in so an author needs only one <script> tag.
// The heavy runtime (Pyodide, numpy, the veusz wheel, the Vello wasm) is
// loaded at runtime from a CDN/bundle, not included here.
export default defineConfig({
  plugins: [react()],
  // Emit asset URLs (notably the Pyodide Web Worker chunk, referenced via
  // `new URL('./pyodideWorker.ts', import.meta.url)`) RELATIVE to veusz-embed.js
  // rather than as absolute `/assets/…`. Authors self-host the embed under a
  // versioned sub-path (e.g. `…/embed/v4.4.0/`), so an origin-root `/assets/…`
  // would 404; `./` resolves the worker against the script's own location.
  base: './',
  // Library mode (unlike an app build) does NOT replace process.env.NODE_ENV,
  // so React/zustand's `process.env.NODE_ENV === "production"` checks reference
  // the Node global `process`, which is undefined in a plain browser <script>
  // and throws before customElements.define runs (blank embed). Inline it.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/embed/main.tsx', import.meta.url)),
      formats: ['es'],
      fileName: () => 'veusz-embed.js',
    },
  },
});
