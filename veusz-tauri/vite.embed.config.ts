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
