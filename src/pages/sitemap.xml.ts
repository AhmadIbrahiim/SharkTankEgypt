import type { APIContext } from 'astro';
import { startups, sharks, founders, categories, catSlug, seasons, dataUpdated, dir } from '../config';
import { episodes, sharkSeasons, sharkPairs, rankings, sectorSeasons, sharkSectors } from '../faq';

// Each URL lists its Arabic/English twin so Google serves the right language.
export function GET({ site }: APIContext) {
  const root = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site).href;
  const paths = ['', 'deals/', 'compare/', 'image-usage/', ...startups.map((x) => `${x.id}/`), 'sharks/', ...sharks.map((p) => `sharks/${p.id}/`), 'founders/', 'faq/', ...founders.map((p) => `founders/${p.id}/`), ...categories.map((c) => `category/${catSlug(c)}/`), ...seasons.map((x) => `season/${x.season}/`),
    ...episodes.map(([n, e]) => `season/${n}/episode/${e}/`), ...sharkSeasons.map((x) => `sharks/${x.p.id}/season/${x.n}/`), ...sharkPairs.map((x) => `sharks/vs/${x.id}/`), ...rankings.map((r) => `top/${r.id}/`),
    ...sectorSeasons.map((x) => `category/${catSlug(x.c)}/season/${x.n}/`), ...sharkSectors.map((x) => `sharks/${x.p.id}/sector/${catSlug(x.c)}/`)];
  const urls = paths.flatMap((p) => ['ar', 'en'].map((lang) => `
  <url>
    <loc>${root}${dir(lang)}${p}</loc>
    <lastmod>${dataUpdated}</lastmod>
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
