/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to https://<user>.github.io/Team-Friday/ — every asset URL needs that
// prefix. Overridable so a fork under a different repo name still builds.
const base = process.env.VITE_BASE ?? '/Team-Friday/'

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
