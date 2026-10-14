import { defineConfig } from 'vite';
// No React-refresh preamble: preserve strict script-src 'self' in local HTML.
export default defineConfig({
  root: 'app/client',
  build: { outDir: '../../dist', emptyOutDir: true },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:3001', '/auth': 'http://127.0.0.1:3001' },
  },
});
