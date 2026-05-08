import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed to GitHub Pages at https://<user>.github.io/sprint-wars/
// — that requires the build to be served from /sprint-wars/.
// Local dev keeps the simpler '/' base.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sprint-wars/' : '/',
  plugins: [react()],
}));
