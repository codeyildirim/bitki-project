import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()], // Admin'de PWA YOK
    envPrefix: 'VITE_',
    // Ensure .env.admin.production is loaded in production mode
    envDir: '.',
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
          target: env.VITE_API_BASE_URL || 'https://bitki-project.onrender.com',
          changeOrigin: true,
        },
      },
    },
    // Define global constants for runtime
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'https://bitki-project.onrender.com'),
      'import.meta.env.VITE_ADMIN': JSON.stringify(env.VITE_ADMIN || 'true'),
    }
  };
});
