import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    https: false, // Explicitly disable HTTPS
    cors: true
  },
  preview: {
    port: 4173,
    https: false // Also disable HTTPS for preview mode
  }
})