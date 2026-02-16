import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    https: false,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          mindar: ['mind-ar/dist/mindar-image-three.prod.js'],
          gsap: ['gsap'],
        },
      },
    },
  },
  assetsInclude: ['**/*.mind', '**/*.glb'],
});
