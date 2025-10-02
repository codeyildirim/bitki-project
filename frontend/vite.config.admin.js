import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
});