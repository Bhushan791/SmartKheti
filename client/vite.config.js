import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001, // your desired port here
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Copy _redirects file to dist
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  // This is crucial for SPA routing
  preview: {
    port: 3001,
    // Test SPA routing locally
    strictPort: true,
  },
  // Ensure base path is correct
  base: '/'
})