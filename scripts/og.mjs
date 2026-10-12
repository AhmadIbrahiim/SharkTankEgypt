// Renders a 1200×630 share image for every built page: reads the page's #og-card JSON (set by Base.astro)
// and writes dist/og/<path>.jpg, the URL Base.astro already put in og:image.
// Usage (after `astro build`): node scripts/og.mjs [--only <path-prefix>]
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';

const DIST = 'dist', FONTS = 'node_modules/@fontsource-variable';
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : '';
const logo = readFileSync('public/favicon.svg', 'utf8');
const siteLabel = JSON.parse(readFileSync('package.json', 'utf8')).homepage.replace(/^https?:\/\//, '').replace(/\/$/, '');
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const initials = (n) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
const face = (src, name, cls = '') => src ? `<img class="face ${cls}" src="${esc(src)}">` : `<div class="face init ${cls}">${esc(initials(name))}</div>`;
const stats = (xs = []) => xs.length ? `<div class="stats">${xs.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>` : '';
const head = (c) => `${c.eyebrow ? `<p class="eyebrow">${esc(c.eyebrow)}</p>` : ''}<h1 class="${c.title.length > 22 ? 'long' : ''}">${esc(c.title)}</h1>${c.alt && c.alt !== c.title ? `<p class="alt">${esc(c.alt)}</p>` : ''}`;
const badge = (b) => b ? `<p class="badge ${b.tone}">${esc(b.text)}</p>` : '';

const body = (c) => {
  switch (c.kind) {
    case 'startup': return `<div class="split"><div class="text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${badge(c.badge)}</div>
      ${c.shot ? `<div class="device"><img src="${esc(c.shot)}">${c.play ? '<span class="play"></span>' : ''}</div>` : ''}<div class="monogram"${c.shot ? ' hidden' : ''}>${logo}</div></div>`;
    case 'person': return `<div class="split person"><div class="ring">${face(c.photo, c.title)}</div>
      <div class="text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${badge(c.badge)}${stats(c.stats)}</div></div>`;
    case 'vs': return `${c.eyebrow ? `<p class="eyebrow center">${esc(c.eyebrow)}</p>` : ''}<div class="vs">${c.vs.map((p, i) => `${i ? '<div class="vsb">VS</div>' : ''}
      <div class="side">${face(p.photo, p.name, 'big')}<h2>${esc(p.name)}</h2>${p.stats.map((s) => `<p>${esc(s)}</p>`).join('')}</div>`).join('')}</div>`;
    case 'list': return `<div class="split"><div class="text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${stats(c.stats)}</div>
      ${c.faces?.length ? `<div class="faces">${c.faces.slice(0, 9).map((f) => face(f, '?')).join('')}</div>`
        : c.thumbs?.length ? `<div class="stack">${c.thumbs.map((u) => `<img src="${esc(u)}">`).join('')}</div>` : `<div class="monogram">${logo}</div>`}</div>`;
    default: return `<div class="split"><div class="text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${stats(c.stats)}</div>${c.photo ? `<div class="ring">${face(c.photo, c.title)}</div>` : `<div class="monogram">${logo}</div>`}</div>`;
  }
};

const page = (c, lang) => `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:R;font-weight:100 900;src:url(/__fonts/readex-pro/files/readex-pro-arabic-wght-normal.woff2) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669}
@font-face{font-family:R;font-weight:100 900;src:url(/__fonts/readex-pro/files/readex-pro-latin-wght-normal.woff2) format('woff2')}
@font-face{font-family:S;font-weight:200 900;src:url(/__fonts/noto-naskh-arabic/files/noto-naskh-arabic-arabic-wght-normal.woff2) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669}
@font-face{font-family:S;font-weight:200 900;src:url(/__fonts/source-serif-4/files/source-serif-4-latin-wght-normal.woff2) format('woff2')}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:R,sans-serif;color:#1A1714;position:relative;background:#F6F3EC}
body::before{content:'';position:absolute;inset:40px 64px auto;height:7px;border-block:2px solid #1A1714}
main{position:absolute;inset:82px 64px 100px}
.brand{position:absolute;inset-inline-start:64px;bottom:32px;display:flex;align-items:center;gap:12px;font-family:S,serif;font-weight:800;font-size:24px}
.brand svg{width:36px;height:36px}.brand small{font-family:R,sans-serif;color:#5D564D;font-weight:500;font-size:17px;letter-spacing:2px;text-transform:uppercase}
[dir=rtl] .brand small{letter-spacing:0;text-transform:none;font-size:19px}
.url{position:absolute;inset-inline-end:64px;bottom:38px;color:#5D564D;font-size:18px}
body::after{content:'';position:absolute;inset:auto 64px 86px;border-top:1px solid #D6CFC1}
.split{display:flex;align-items:center;gap:52px;height:100%}.text{flex:1;min-width:0}
.eyebrow{color:#B3261E;font-size:20px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px}
[dir=rtl] .eyebrow{letter-spacing:0;text-transform:none;font-size:24px}
.eyebrow.center{text-align:center}
h1{font-family:S,serif;font-size:80px;line-height:1.04;font-weight:700;letter-spacing:-1.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
h1.long{font-size:58px;-webkit-line-clamp:3}[dir=rtl] h1{letter-spacing:0;line-height:1.4}
.alt{font-size:28px;color:#5D564D;margin-top:8px;font-weight:400}
.sub{font-size:25px;color:#3d3832;margin-top:16px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.badge{display:inline-block;margin-top:22px;padding:6px 16px;font-size:24px;font-weight:600;border:2px solid currentColor}
.badge.ok{color:#1D6440}.badge.no{color:#5D564D}.badge.ask{color:#B3261E}
.stats{display:flex;margin-top:26px;border-top:2px solid #1A1714}.stats div{padding:10px 30px 0 0;margin-inline-end:30px;border-inline-end:1px solid #D6CFC1}
[dir=rtl] .stats div{padding:10px 0 0 30px}.stats div:last-child{border:0}
.stats b{display:block;font-family:S,serif;font-size:40px;font-weight:700;white-space:nowrap}.stats span{font-size:18px;color:#5D564D;white-space:nowrap}
.device{width:500px;flex:none;position:relative;border:1px solid #1A1714;padding:8px;background:#FBF9F4}
.device img{width:100%;height:300px;object-fit:cover;object-position:top;display:block;background:#ECE7DC}
.play{position:absolute;inset-inline-start:24px;bottom:24px;width:64px;height:64px;background:rgba(0,0,0,.78)}
.play::after{content:'';position:absolute;inset:0;margin:auto;translate:3px 0;width:0;height:0;border-block:13px solid transparent;border-left:20px solid #fff}
.monogram{width:260px;height:260px;flex:none;display:grid;place-items:center}
.monogram svg{width:220px;height:220px}[hidden]{display:none!important}
.ring{position:relative;flex:none;border:1px solid #1A1714;padding:8px;background:#FBF9F4}
.face{width:320px;height:360px;object-fit:cover;object-position:center 25%;display:block;background:#ECE7DC}
.face.init{display:grid;place-items:center;font-family:S,serif;font-size:120px;font-weight:700;color:#1A1714}
.person .text{padding-inline-start:4px}
.vs{display:flex;align-items:center;justify-content:center;gap:40px;height:92%}
.side{text-align:center;width:420px}.side .face{width:230px;height:260px;margin:0 auto;border:1px solid #1A1714;padding:6px;background:#FBF9F4}
.side h2{font-family:S,serif;font-size:42px;margin-top:16px;line-height:1.15}.side p{font-size:24px;color:#3d3832;margin-top:6px}
.vsb{flex:none;font-family:S,serif;font-style:italic;font-size:56px;font-weight:700;color:#B3261E}
.faces{display:grid;grid-template-columns:repeat(3,116px);gap:10px;flex:none}.faces .face{width:116px;height:132px;border:1px solid #D6CFC1}
.faces .face.init{font-size:40px}
.stack{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:440px;flex:none}
.stack img{width:100%;height:150px;object-fit:cover;object-position:top;border:1px solid #1A1714;background:#ECE7DC}
</style></head><body><main>${body(c)}</main>
<div class="brand">${logo}<span>${lang === 'ar' ? 'دليل شارك تانك مصر' : 'Shark Tank Egypt'}</span><small>${lang === 'ar' ? 'كل الشركات والصفقات' : 'Startup Directory'}</small></div>
<div class="url"><bdi dir="ltr">${siteLabel}</bdi></div></body></html>`;

// Serve dist (so /people, /screenshots resolve) plus the fonts and the card being rendered.
let current = '';
const server = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/__card') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(current); }
  const file = u.startsWith('/__fonts/') ? join(FONTS, u.slice(9)) : join(DIST, u);
  if (!file.startsWith(DIST) && !file.startsWith(FONTS) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }); res.end(readFileSync(file));
}).listen(0);
const origin = `http://127.0.0.1:${server.address().port}`;

const pages = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== 'og') walk(p); } else if (f === 'index.html') pages.push(p); } };
walk(DIST);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-proxy-server'] });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let done = 0, defaults = 0;
for (const file of pages) {
  const rel = dirname(file).slice(DIST.length).replace(/^\//, '') || 'index';
  if (only && !rel.startsWith(only)) continue;
  const m = readFileSync(file, 'utf8').match(/<script type="application\/json" id="og-card">(.*?)<\/script>/s);
  if (!m) continue; // redirects and pages outside Base
  const lang = rel.startsWith('ar') ? 'ar' : 'en', card = JSON.parse(m[1]);
  const out = join(DIST, 'og', `${rel}.jpg`);
  mkdirSync(dirname(out), { recursive: true });
  current = page(card, lang);
  await tab.goto(`${origin}/__card`);
  // Images that fail (offline remote thumbnails) are hidden rather than left as broken icons.
  await tab.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.complete ? 0
    : Promise.race([new Promise((r) => { i.onload = r; i.onerror = r; }), new Promise((r) => setTimeout(r, 4000))]))]));
  // Images that failed (offline thumbnails) are hidden; a startup whose picture failed shows the brand logo tile instead.
  const broken = await tab.evaluate(() => { const b = [...document.images].filter((i) => !i.naturalWidth); b.forEach((i) => (i.style.visibility = 'hidden'));
    const d = document.querySelector('.device'); if (d && b.some((i) => d.contains(i))) { d.remove(); document.querySelector('.monogram').hidden = false; } return b.length; });
  if (card.kind === 'startup' && (!card.shot || broken)) defaults++;
  writeFileSync(out, await tab.screenshot({ type: 'jpeg', quality: 72 }));
  done++;
}
await browser.close(); server.close();
if (!done) throw new Error('no share images rendered: run after `astro build`');
console.log(`share images: ${done} (${defaults} startups without a picture show the logo tile)`);
