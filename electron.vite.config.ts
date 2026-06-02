import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts'),
        },
        external: ['electron', 'better-sqlite3'],
        output: {
          format: 'es',
        },
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts'),
        },
        external: ['electron'],
        output: {
          format: 'cjs',
        },
      },
    },
  },
  renderer: {
    root: '.',
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
        },
      },
    },
  },
});
