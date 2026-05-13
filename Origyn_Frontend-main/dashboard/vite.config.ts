import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['import', 'browser', 'default'],
  },
  optimizeDeps: {
    include: ['mapbox-gl'],
    exclude: ['react-map-gl'],
  },
})
