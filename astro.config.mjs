import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

// The site's address lives in one place: package.json "homepage" (now the GitHub Pages project site;
// a custom domain later is a one-line change there plus public/CNAME).
const home = new URL(JSON.parse(readFileSync('./package.json', 'utf8')).homepage);
export default defineConfig({
  site: home.origin,
  base: home.pathname.replace(/\/$/, '') || '/',
});
