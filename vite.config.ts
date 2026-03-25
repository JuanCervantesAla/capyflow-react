import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('xlsx')) {
            return 'xlsx'
          }

          if (id.includes('@tabler/icons-react')) {
            return 'tabler'
          }

          if (id.includes('@xyflow')) {
            return 'flow'
          }

          if (id.includes('@mantine')) {
            return 'mantine'
          }

          if (id.includes('react-router')) {
            return 'router'
          }

          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }

          if (id.includes('recharts')) {
            return 'recharts'
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
