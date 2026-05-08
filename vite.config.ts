import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path is configurable via VITE_BASE_PATH env var.
//   • Vercel / Netlify / local preview: default '/' — assets served at the
//     domain root, no env needed.
//   • GitHub Pages: set VITE_BASE_PATH=/sprint-wars/ in the workflow because
//     the site is served at https://<user>.github.io/sprint-wars/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.VITE_BASE_PATH ?? '/' : '/',
  plugins: [react()],
}));
