import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load APPWRITE_* and VITE_* vars from .env files only (not from process.env).
  // This prevents the Appwrite Sites build environment from injecting system-level
  // APPWRITE_* vars that may contain hyphens, which esbuild rejects as invalid
  // define identifiers (e.g. "Expected '.' but found '-'" build error).
  const fileEnv = loadEnv(mode, process.cwd(), ['APPWRITE_', 'VITE_'])

  // Build explicit define entries for each var loaded from .env files.
  // envPrefix is kept as ['VITE_'] only so that only VITE_ vars from process.env
  // reach esbuild automatically — APPWRITE_ vars come exclusively from fileEnv above.
  const appwriteDefines = Object.fromEntries(
    Object.entries(fileEnv)
      .filter(([k]) => k.startsWith('APPWRITE_'))
      .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
  )

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    envPrefix: ['VITE_'],
    define: appwriteDefines,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
  }
})
