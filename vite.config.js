import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        order: resolve(import.meta.dirname, 'order.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        notFound: resolve(import.meta.dirname, '404.html')
      }
    }
  }
});
