import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@content': path.resolve(__dirname, '../shared/content/index.js') },
  },
  server: { port: 5173, fs: { allow: ['..'] } },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: { manualChunks: (id) => (id.includes('node_modules/react') || id.includes('react-router') ? 'react' : undefined) },
    },
  },
  ssr: { noExternal: ['react-helmet-async'] },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    globals: true,
    css: false,
  },
});
