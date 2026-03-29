import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const base = '/stock-tracker/';

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
  plugins: [react()],
});
