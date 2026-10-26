import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = process.env.API_URL ?? 'http://localhost:8787';

export default defineConfig({
  // GitHub Pages serves the app from /<repo>/; locally and on the server it is /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': api, '/images': api }
  }
});
