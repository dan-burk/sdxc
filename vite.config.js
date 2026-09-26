import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site at /sdxc/; dev stays at the root
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sdxc/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
}))
