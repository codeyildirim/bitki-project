import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()], // Admin'de PWA YOK
  build: {
    outDir: 'dist-admin',
    emptyOutDir: true,
    rollupOptions: {
      // Admin uygulamasının HTML giriş dosyası
      input: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://bitki-project.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
