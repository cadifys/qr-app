import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase':     ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui':           ['lucide-react', 'qrcode.react', 'react-hot-toast', 'date-fns'],
        },
      },
    },
  },
})
