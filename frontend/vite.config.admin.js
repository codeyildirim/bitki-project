import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    'process.env.VITE_ADMIN': JSON.stringify('true')
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://bitki-project.onrender.com',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist-admin',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'admin.html')
      }
    }
  }
});