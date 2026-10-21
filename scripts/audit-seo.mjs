// Technical SEO + link check over the built site (dist/). Run after `npm run build`.
// Usage: node scripts/audit-seo.mjs [--strict]   (--strict exits 1 on any error)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const home = new URL(JSON.parse(readFileSync('package.json', 'utf8')).homepage);
const BASE = home.pathname.replace(/\/$/, ''); // "/SharkTankEgypt" or ""
const pages = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : f === 'index.html' && pages.push(p); } })('dist');

const errors = [], warns = [];
const titles = new Map(), descs = new Map();
const siteNames = new Set();
const pick = (html, re) => html.match(re)?.[1];
const decode = (s) => s?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const urlOf = (file) => `${home.origin}${BASE}/${file.replace(/^dist\//, '').replace(/index\.html$/, '')}`;
// A site URL or path -> the dist file it should resolve to.
const fileFor = (href) => {
  let p = href.startsWith('http') ? (href.startsWith(home.origin) ? new URL(href).pathname : null) : href;
  if (p == null || !p.startsWith('/')) return undefined; // external or relative: not checked
  p = decodeURI(p.split('#')[0].split('?')[0]);
  if (BASE && !p.startsWith(BASE + '/') && p !== BASE) return null; // outside the site base
  p = p.slice(BASE.length) || '/';
  return join('dist', p.endsWith('/') ? p + 'index.html' : p);
};
let links = 0;
const stubs = new Set();
for (const f of pages) {
  const html = readFileSync(f, 'utf8'), url = urlOf(f);
  const to = pick(html, /<meta http-equiv="refresh" content="\d+;url=([^"]+)"/);
  if (to) { stubs.add(url); const t = fileFor(to); if (t !== undefined && (!t || !existsSync(t))) errors.push(`${url}: redirects to missing page ${to}`); continue; } // redirect stubs
  const title = decode(pick(html, /<title>([^<]*)<\/title>/)), desc = decode(pick(html, /<meta name="description" content="([^"]*)"/));
  const canon = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const alt = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
  if (!title) errors.push(`${url}: no <title>`); else { (titles.get(title) ?? titles.set(title, []).get(title)).push(url); if (title.length > 70) warns.push(`${url}: title ${title.length} chars (>70): "${title}"`); }
  if (!desc) errors.push(`${url}: no meta description`); else { (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(url); if (desc.length < 50 || desc.length > 170) warns.push(`${url}: description ${desc.length} chars`); }
  if (canon !== url) errors.push(`${url}: canonical is ${canon}`);
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) warns.push(`${url}: noindex`);
  for (const l of ['ar', 'en', 'x-default']) if (!alt[l]) errors.push(`${url}: missing hreflang ${l}`);
  for (const [l, u] of Object.entries(alt)) {
    const t = fileFor(u);
    if (!t || !existsSync(t)) { errors.push(`${url}: hreflang ${l} -> missing page ${u}`); continue; }
    const back = readFileSync(t, 'utf8').match(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g) ?? [];
    if (!back.some((b) => b.includes(`href="${url}"`))) errors.push(`${url}: hreflang ${l} page ${u} doesn't link back`);
  }
  for (const k of ['og:title', 'og:description', 'og:image', 'og:url']) if (!html.includes(`property="${k}"`)) errors.push(`${url}: missing ${k}`);
  let hasWebsite = false;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try {
    const graph = JSON.parse(m[1])['@graph'] ?? [];
    if (graph.length) {
      const website = graph.find((n) => n['@type'] === 'WebSite');
      hasWebsite ||= !!website;
      const siteName = decode(pick(html, /<meta property="og:site_name" content="([^"]*)"/));
      if (website?.url !== home.href || website?.['@id'] !== `${home.href}#website`) errors.push(`${url}: WebSite must identify this site's root`);
      if (!website?.name || website.name !== siteName) errors.push(`${url}: WebSite and og:site_name disagree`);
      if (!website?.alternateName?.includes(home.hostname)) errors.push(`${url}: WebSite is missing its own hostname as a fallback name`);
      siteNames.add(website?.name);
    }
    const profile = graph.find((n) => n['@type'] === 'ProfilePage');
    const person = graph.find((n) => n['@type'] === 'Person' && n['@id'] === profile?.mainEntity?.['@id']);
    if (person?.image) {
      if (profile.primaryImageOfPage?.url !== person.image.url) errors.push(`${url}: profile primary image is not the person's portrait`);
      if (decode(pick(html, /<meta property="og:image" content="([^"]*)"/)) !== person.image.url) errors.push(`${url}: profile og:image is not the person's portrait`);
      const file = fileFor(person.image.url);
      if (file !== undefined && (!file || !existsSync(file))) errors.push(`${url}: profile portrait file is missing`);
      const portrait = [...html.matchAll(/<img\s[^>]*>/g)].find(([tag]) => {
        const src = decode(pick(tag, /src="([^"]+)"/));
        return src && new URL(src, url).href === person.image.url;
      });
      if (!portrait || !portrait[0].includes('loading="eager"')) errors.push(`${url}: profile portrait is missing or not eagerly loaded`);
    }
  } catch (e) { errors.push(`${url}: invalid JSON-LD (${e.message})`); }
    // Google wants dates in structured data as full ISO 8601 datetimes with a timezone.
    for (const [, d] of m[1].matchAll(/"date(?:Modified|Published)":"([^"]*)"/g)) if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?([+-]\d\d:\d\d|Z)$/.test(d)) errors.push(`${url}: dateModified/datePublished "${d}" is not a full datetime`); }
  if (!hasWebsite) errors.push(`${url}: missing WebSite structured data`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) warns.push(`${url}: ${(html.match(/<h1[\s>]/g) ?? []).length} <h1> elements`);
  // Internal links must resolve to a built file.
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const t = fileFor(m[1]); if (t === undefined) continue; links++;
    if (t === null || !existsSync(t)) errors.push(`${url}: broken link ${m[1]}`);
  }
}
if (siteNames.size !== 1) errors.push('WebSite name must be consistent across both languages');
for (const [t, us] of titles) if (us.length > 1) errors.push(`duplicate title "${t}": ${us.slice(0, 3).join(', ')}${us.length > 3 ? ` +${us.length - 3}` : ''}`);
for (const [d, us] of descs) if (us.length > 1) warns.push(`duplicate description on ${us.length} pages: "${d.slice(0, 80)}…" (${us.slice(0, 2).join(', ')})`);
// Sitemap: every URL exists; every indexable page is listed.
const sm = [...readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const u of sm) if (!existsSync(fileFor(u))) errors.push(`sitemap lists missing page ${u}`);
// Language alternates in the sitemap must be real pages, not redirect stubs.
for (const [, u] of readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<xhtml:link [^>]*href="([^"]+)"/g))
  if (!existsSync(fileFor(u)) || stubs.has(u)) errors.push(`sitemap hreflang points to a redirect or missing page ${u}`);
const smSet = new Set(sm);
const unlisted = pages.map(urlOf).filter((u) => !smSet.has(u) && !stubs.has(u));
for (const u of unlisted) warns.push(`page not in sitemap: ${u}`);
const robots = readFileSync('dist/robots.txt', 'utf8');
if (/Disallow:\s*\/\s*$/m.test(robots)) errors.push('robots.txt disallows everything');

const dedupe = (xs) => { const m = new Map(); for (const x of xs) { const k = x.replace(/^\S+: /, ''); m.set(k, (m.get(k) ?? 0) + 1); } return [...m].map(([k, n]) => (n > 1 ? `${k}  ×${n}` : k)); };
console.log(`seo: ${pages.length} pages, ${sm.length} sitemap URLs, ${links} internal links checked; ${errors.length} errors, ${warns.length} warnings`);
for (const e of dedupe(errors).slice(0, 40)) console.log('  ERROR', e);
const kinds = {}; for (const w of warns) { const k = w.replace(/^\S+: /, '').replace(/\d+ chars.*/, 'N chars').replace(/"[^"]*"/g, '"…"').slice(0, 60); kinds[k] = (kinds[k] ?? 0) + 1; }
console.log('  warnings by kind:', kinds);
if (process.argv.includes('--verbose')) for (const w of dedupe(warns)) console.log('  warn ', w);
if (process.argv.includes('--strict') && errors.length) process.exit(1);
