import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
        target:'https://homely-r26m.onrender.com',
=======
        target: "https://homely-r26m.onrender.com",
>>>>>>> d457bca2008b960ea38ec51b1ea62d61ad0a6270
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
