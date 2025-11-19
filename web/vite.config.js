import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  },
  base: '/',
  // Assets will be copied to public/assets by the prepare script
  publicDir: 'public'
});
