import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
  ],
  // En desarrollo el frontend va en el 5173 y la API en el 8000. El proxy
  // hace que el navegador vea todo en el mismo origen, igual que en el
  // servidor, donde Laravel sirve las dos cosas. Así no hay CORS ni una
  // configuración distinta para cada entorno.
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})