import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/socket.io' : {
        target: 'http://localhost:3000', //direccion del backend
        changeOrigin: true, //origenes distintos
        ws: true //enciende websocket del proxy
      }
    }
  }
})
