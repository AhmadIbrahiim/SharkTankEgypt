import { defineConfig } from 'astro/config';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The site's address lives in one place: package.json "homepage" (plus public/CNAME for GitHub Pages).
const home = new URL(JSON.parse(readFileSync('./package.json', 'utf8')).homepage);
const base = home.pathname.replace(/\/$/, '');

// Arabic moved from /ar/ to the site root: every Arabic page leaves a redirect at its old /ar/ address.
// No noindex: with the canonical and an instant refresh, Google treats it as a redirect and passes the old URL's signals on.
const arRedirects = {
  name: 'ar-redirects',
  hooks: {
    'astro:build:done': ({ dir, pages }) => {
      const out = fileURLToPath(dir);
      for (const { pathname } of pages) {
        const file = `${out}${pathname}index.html`;
        if (pathname.startsWith('en/') || pathname.startsWith('ar/') || !existsSync(file) || !readFileSync(file, 'utf8').includes('<html lang="ar"')) continue;
        const to = new URL(`${base}/${pathname}`, home.origin).href;
        mkdirSync(`${out}ar/${pathname}`, { recursive: true });
        writeFileSync(`${out}ar/${pathname}index.html`, `<!doctype html><title>Redirecting to: ${to}</title><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${to}"><a href="${to}">${to}</a>`);
      }
    },
  },
};

export default defineConfig({
  site: home.origin,
  base: base || '/',
  integrations: [arRedirects],
  // Removed records keep their old URLs working.
  // A product of Gelato On Wheelz, not a separate pitch (youm7.com/6486350). Astro does not prefix base on targets.
  redirects: {
    '/brazilian-picole': `${base}/gelato-on-the-wheel/`,
    '/ar/brazilian-picole': `${base}/gelato-on-the-wheel/`,
    '/en/brazilian-picole': `${base}/en/gelato-on-the-wheel/`,
  },
});
