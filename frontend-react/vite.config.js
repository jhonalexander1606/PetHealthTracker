import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracion de Vite para PetHealth Tracker
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Permite abrir la app desde un tunel de Cloudflare (https://xxxx.trycloudflare.com)
    allowedHosts: ['.trycloudflare.com'],
    // Proxy: el navegador solo habla con Vite (puerto 5173) y Vite reenvia
    // las llamadas de la API al backend Spring Boot (puerto 8094).
    proxy: {
      '/api': 'http://localhost:8094',
      '/swagger-ui': 'http://localhost:8094',
      '/v3/api-docs': 'http://localhost:8094'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
