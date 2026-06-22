import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built app works when opened from any static host
// (GitHub Pages, a phone on the local network, or even file://).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true, // expose on the LAN so phones can reach `yarn dev`
    port: 5173,
  },
});
