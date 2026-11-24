import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  // Relative base so the built game works from any sub-path (e.g. GitHub Pages).
  base: './',
  plugins: [preact()],
  server: { port: 5173 },
});
