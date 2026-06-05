import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/rotas': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        },
        '/auth': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins: [react(), tailwindcss(), mkcert()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
