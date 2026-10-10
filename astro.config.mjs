import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://ahmadibrahiim.github.io/SharkTankEgypt/
export default defineConfig({
  site: 'https://ahmadibrahiim.github.io',
  base: '/SharkTankEgypt',
  redirects: { '/': '/SharkTankEgypt/ar/' },
});
