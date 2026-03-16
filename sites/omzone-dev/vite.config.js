import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Expose vars with APPWRITE_ prefix (shared with functions) and VITE_ (frontend-only).
  // APPWRITE_API_KEY is safe: it lives only in Appwrite Console global vars, never in .env.
  envPrefix: ['APPWRITE_', 'VITE_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
