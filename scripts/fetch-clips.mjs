// Indexes every post on sharktankarabi.com, which reposts each official Shark Tank Egypt clip with its
// title and description. Clip titles often say who made the deal. Runs in GitHub Actions.
// Usage: node scripts/fetch-clips.mjs <out.json>
import { writeFileSync } from 'node:fs';
import { get, meta } from './harvest.mjs';

const ROOT = 'https://sharktankarabi.com';
// WordPress sitemaps (core or Yoast): an index of post sitemaps, each listing post URLs.
let maps = [];
for (const [path, re] of [['/wp-sitemap.xml', /posts-post/], ['/sitemap_index.xml', /post-sitemap/]]) {
  try { maps = [...(await get(ROOT + path)).html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => re.test(u)); } catch {}
  if (maps.length) break;
}
const urls = [];
for (const m of maps) urls.push(...[...(await get(m)).html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
console.log(`${urls.length} posts in ${maps.length} sitemaps`);

const out = [];
for (let i = 0; i < urls.length; i += 4)
  out.push(...await Promise.all(urls.slice(i, i + 4).map(async (url) => {
    try {
      const { html } = await get(url);
      const date = html.match(/"datePublished":"([^"]+)"/)?.[1] ?? meta(html, 'article:published_time');
      return { url, title: meta(html, 'og:title'), description: meta(html, 'og:description'), date };
    } catch (e) { return { url, error: String(e.message ?? e) }; }
  })));
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.filter((x) => x.title).length}/${out.length} fetched`);
