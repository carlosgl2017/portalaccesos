import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy simple y directo para la API
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // Proxy para las imágenes (necesario en desarrollo)
      '/backgrounds': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/system-images': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})