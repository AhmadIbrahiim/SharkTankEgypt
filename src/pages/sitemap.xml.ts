import type { APIContext } from 'astro';
import { startups, sharks, founders } from '../config';

// Each URL lists its Arabic/English twin so Google serves the right language.
export function GET({ site }: APIContext) {
  const root = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site).href;
  const paths = ['', ...startups.map((x) => `${x.id}/`), 'sharks/', ...sharks.map((p) => `sharks/${p.id}/`), 'founders/', ...founders.map((p) => `founders/${p.id}/`)];
  const urls = paths.flatMap((p) => ['ar', 'en'].map((lang) => `
  <url>
    <loc>${root}${lang}/${p}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${root}ar/${p}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${root}en/${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${root}ar/${p}"/>
  </url>`));
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}
</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
