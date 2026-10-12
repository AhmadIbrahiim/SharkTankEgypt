import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

// The site's address lives in one place: package.json "homepage" (plus public/CNAME for GitHub Pages).
const home = new URL(JSON.parse(readFileSync('./package.json', 'utf8')).homepage);
const base = home.pathname.replace(/\/$/, '');
export default defineConfig({
  site: home.origin,
  base: base || '/',
  // Removed records keep their old URLs working.
  // A product of Gelato On Wheelz, not a separate pitch (youm7.com/6486350). Astro does not prefix base on targets.
  redirects: Object.fromEntries(['ar', 'en'].map((l) => [`/${l}/brazilian-picole`, `${base}/${l}/gelato-on-the-wheel/`])),
});
