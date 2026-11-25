import type { APIContext } from 'astro';
import { startups, sharks, founders, founderIndexable, categories, catSlug, seasons, dir } from '../config';
import { episodes, rankings } from '../faq';

// Each URL lists its Arabic/English twin so Google serves the right language.
export function GET({ site }: APIContext) {
  const root = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site).href;
  const paths = ['', 'deals/', 'compare/', 'image-usage/', ...startups.map((x) => `${x.id}/`), 'sharks/', ...sharks.map((p) => `sharks/${p.id}/`), 'founders/', 'faq/', ...founders.filter(founderIndexable).map((p) => `founders/${p.id}/`), ...categories.map((c) => `category/${catSlug(c)}/`), ...seasons.map((x) => `season/${x.season}/`),
    ...episodes.map(([n, e]) => `season/${n}/episode/${e}/`), ...rankings.map((r) => `top/${r.id}/`)];
  // Shark × season, shark × sector, sector × season, shark-vs-shark and most founder pages are noindex, so they stay out.
  // lastmod is optional; omit it until reliable per-page dates are available.
  const urls = paths.flatMap((p) => ['ar', 'en'].map((lang) => `
  <url>
    <loc>${root}${dir(lang)}${p}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${root}${p}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${root}en/${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${root}${p}"/>
  </url>`));
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}
</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
