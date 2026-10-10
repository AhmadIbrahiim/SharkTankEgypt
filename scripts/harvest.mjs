// Opens each startup's own pages (pitch video, website, Instagram) and saves what they say,
// so the data can be enriched from primary sources. Runs in GitHub Actions (open internet).
// Usage: node scripts/harvest.mjs [out.json]   ·   node scripts/harvest.mjs --test
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { platforms, platformOf } from '../src/platforms.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const decode = (s) => s?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

/** <meta> content by name/property, either attribute order. */
export const meta = (html, key) => decode(
  html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']*)`, 'i'))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${key}["']`, 'i'))?.[1]);

/** Social profile links found on a page, one per platform, trimmed to the profile root. */
export const socialLinks = (html, base) => {
  const out = {};
  for (const [, href] of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    let u;
    try { u = new URL(decode(href), base); } catch { continue; }
    const k = u.protocol === 'https:' || u.protocol === 'http:' ? platformOf(u.href) : undefined;
    if (!k || out[k]) continue;
    const segs = u.pathname.split('/').filter(Boolean);
    // Skip share/intent/post links; keep profile-looking paths.
    if (!segs.length || /^(sharer|share|intent|p|reel|watch|hashtag|dialog|plugins)/i.test(segs[0])) continue;
    const keep = ['linkedin', 'appStore', 'googlePlay', 'youtube'].includes(k) ? u.pathname + (k === 'googlePlay' ? u.search : '') : `/${segs[0]}/`;
    out[k] = `https://${u.hostname.replace(/^(m|web|ar-ar|en-gb)\./, 'www.')}${keep}`;
  }
  return out;
};

// Link-preview crawler UA: YouTube/Instagram/Facebook serve their og: tags to it instead of a bot or login wall.
export const PREVIEW = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
export async function get(url, ua = UA) {
  const res = await fetch(url, { headers: { 'user-agent': ua, 'accept-language': 'ar,en;q=0.8', cookie: 'CONSENT=YES+1; SOCS=CAI' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), url: res.url };
}

const pageTitle = (html) => decode(html.match(/<title[^>]*>([^<]*)/i)?.[1]);

export async function youtube(id) {
  const { html } = await get(`https://www.youtube.com/watch?v=${id}&hl=ar`);
  const json = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:var|<\/script>)/s)?.[1];
  let v = {}, p = {};
  try { p = json ? JSON.parse(json) : {}; v = p.videoDetails ?? {}; } catch {}
  const r = { title: v.title, description: v.shortDescription, channel: v.author,
    views: v.viewCount ? +v.viewCount : undefined, published: p.microformat?.playerMicroformatRenderer?.publishDate };
  if (!r.description) {
    const pv = (await get(`https://www.youtube.com/watch?v=${id}`, PREVIEW)).html;
    r.title ??= meta(pv, 'og:title'); r.description = meta(pv, 'og:description'); r.debug = pageTitle(html);
  }
  if (!r.title) {
    const o = await (await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`, { signal: AbortSignal.timeout(15000) })).json();
    r.title = o.title; r.channel ??= o.author_name;
  }
  return r;
}

export async function site(url) {
  const { html, url: final } = await get(url);
  return { finalUrl: final, title: decode(html.match(/<title[^>]*>([^<]*)/i)?.[1]), description: meta(html, 'description') ?? meta(html, 'og:description'),
    image: meta(html, 'og:image'), links: socialLinks(html, final) };
}

// Instagram og:description reads like "1,234 Followers, 56 Following, 78 Posts - See Instagram photos and videos from Name (@handle)".
export async function social(url) {
  const { html } = await get(url, PREVIEW);
  const r = { title: meta(html, 'og:title'), description: meta(html, 'og:description'), image: meta(html, 'og:image') };
  if (!r.title && !r.description) r.debug = pageTitle(html);
  return r;
}

// Only run when executed directly (enrich.mjs imports the helpers above).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
if (process.argv.includes('--test')) {
  const html = `<meta content="About us" name="description"><meta property="og:image" content="https://a.com/i.png">
    <a href="https://www.instagram.com/brand/?hl=en">ig</a><a href="https://facebook.com/sharer/sharer.php?u=x">share</a>
    <a href="https://m.facebook.com/brandpage">fb</a><a href="https://www.linkedin.com/company/brand/">li</a><a href="/about">x</a>`;
  assert.equal(meta(html, 'description'), 'About us');
  assert.equal(meta(html, 'og:image'), 'https://a.com/i.png');
  assert.deepEqual(socialLinks(html, 'https://brand.com/'), {
    instagram: 'https://www.instagram.com/brand/', facebook: 'https://www.facebook.com/brandpage/', linkedin: 'https://www.linkedin.com/company/brand/' });
  assert.ok(Object.keys(platforms).length > 5);
  console.log('harvest self-test ok');
  process.exit(0);
}

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const out = {};
let ok = 0, failed = 0;
const tryGet = async (label, fn) => { try { const r = await fn(); ok++; return r; } catch (e) { failed++; return { error: `${label}: ${e.message}` }; } };
// Small concurrency pool: polite to hosts, fast enough for ~200 startups.
const queue = [...startups];
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let s; (s = queue.shift());) {
    const r = {};
    if (s.video) r.youtube = await tryGet('youtube', () => youtube(s.video));
    if (s.website) r.site = await tryGet('site', () => site(s.website));
    if (s.links?.instagram) r.instagram = await tryGet('instagram', () => social(s.links.instagram));
    if (s.links?.facebook) r.facebook = await tryGet('facebook', () => social(s.links.facebook));
    if (Object.keys(r).length) out[s.id] = r;
    console.log(s.id, Object.entries(r).map(([k, v]) => (v.error ? `✗${k}` : `✓${k}`)).join(' '));
  }
}));
// People with a Wikipedia page: lead photo (freely licensed, Wikimedia Commons) and summary.
const people = JSON.parse(readFileSync('src/data/people.json', 'utf8'));
out.__people = {};
for (const p of people) {
  for (const key of ['wikipedia', 'wikipediaAr']) {
    const page = p.links?.[key];
    if (!page) continue;
    const u = new URL(page);
    const r = await tryGet('wikipedia', async () => {
      const res = await fetch(`${u.origin}/api/rest_v1/page/summary/${u.pathname.split('/wiki/')[1]}`, { headers: { 'user-agent': 'SharkTankEgyptDirectory/1.0 (github.com/AhmadIbrahiim/SharkTankEgypt)' }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      return { page, thumb: j.thumbnail?.source, original: j.originalimage?.source, extract: j.extract };
    });
    (out.__people[p.id] ??= {})[key] = r;
  }
}
writeFileSync(process.argv[2] ?? 'harvest.json', JSON.stringify(out, null, 1));
console.log(`done: ${ok} fetched, ${failed} failed`);
}
