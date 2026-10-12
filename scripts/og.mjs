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

const score = (c) => `<div class="score ${c.badge?.tone ?? ''}">${(c.stats ?? []).map(([v, l]) => `<div><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
const body = (c) => {
  switch (c.kind) {
    // Pitch still full-bleed under a flat overlay, like the startup page hero.
    case 'startup': return `${c.shot ? `<img class="bg" src="${esc(c.shot)}"><div class="veil"></div>` : ''}<div class="center">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}</div>${score(c)}`;
    case 'person': if (!c.photo) return body({ ...c, kind: 'page' });
      return `<div class="photo">${face(c.photo, c.title)}</div>
      <div class="text side-text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${stats(c.stats)}</div>`;
    case 'vs': return `${c.eyebrow ? `<p class="eyebrow center">${esc(c.eyebrow)}</p>` : ''}<div class="vs">${c.vs.map((p, i) => `${i ? '<div class="vsb">VS</div>' : ''}
      <div class="side">${face(p.photo, p.name, 'big')}<h2>${esc(p.name)}</h2>${p.stats.map((s) => `<p>${esc(s)}</p>`).join('')}</div>`).join('')}</div>`;
    case 'list': return `<div class="split"><div class="text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${stats(c.stats)}</div>
      ${c.faces?.length ? `<div class="faces">${c.faces.slice(0, 9).map((f) => face(f, '?')).join('')}</div>`
        : c.thumbs?.length ? `<div class="stack">${c.thumbs.map((u) => `<img src="${esc(u)}">`).join('')}</div>` : `<div class="monogram">${logo}</div>`}</div>`;
    default: return c.photo ? `<div class="photo">${face(c.photo, c.title)}</div><div class="text side-text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${stats(c.stats)}</div>`
      : `<div class="split"><div class="text">${head(c)}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}${stats(c.stats)}</div><div class="monogram">${logo}</div></div>`;
  }
};

const page = (c, lang) => `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:R;font-weight:100 900;src:url(/__fonts/readex-pro/files/readex-pro-arabic-wght-normal.woff2) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669}
@font-face{font-family:R;font-weight:100 900;src:url(/__fonts/readex-pro/files/readex-pro-latin-wght-normal.woff2) format('woff2')}
@font-face{font-family:S;font-weight:200 900;src:url(/__fonts/noto-naskh-arabic/files/noto-naskh-arabic-arabic-wght-normal.woff2) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669}
@font-face{font-family:S;font-weight:200 900;src:url(/__fonts/source-serif-4/files/source-serif-4-latin-wght-normal.woff2) format('woff2')}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:R,sans-serif;color:#FBF8F2;position:relative;background:#2A1A14;border-bottom:10px solid #8E1B1B}
main{position:absolute;inset:0}
.top{position:absolute;z-index:2;inset:34px 64px auto;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:12px;font-family:S,serif;font-weight:800;font-size:24px}
.brand svg{width:38px;height:38px}.brand svg rect{fill:#FBF8F2}.brand svg path{fill:#2A1A14}
.url{color:#CDBFAE;font-size:18px}
.eyebrow{color:#C8962E;font-size:22px;font-weight:600;margin-bottom:12px}[dir=rtl] .eyebrow{font-size:25px}
h1{font-family:S,serif;font-size:84px;line-height:1.04;font-weight:700;letter-spacing:-1.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
h1.long{font-size:56px;-webkit-line-clamp:3}[dir=rtl] h1{letter-spacing:0;line-height:1.35}
.alt{font-size:28px;color:#CDBFAE;margin-top:6px}
.sub{font-size:25px;color:#E9DFD0;margin-top:14px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0;background:rgb(42 26 20 / .74)}
.center{position:absolute;z-index:1;inset:96px 90px 168px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.center .sub{max-width:900px}
.score{position:absolute;z-index:1;inset:auto 64px 34px;display:flex;background:#FBF8F2;color:#2A1A14;border-top:6px solid #C8962E}
.score.ok{border-color:#2F6B3A}.score.no{border-color:#6B5B4F}
.score div{flex:1;min-width:0;padding:14px 26px;border-inline-start:1px solid #E3D7C3}.score div:first-child{border:0}
.score span{display:block;font-size:17px;color:#6B5B4F}
.score b{display:block;font-family:S,serif;font-size:30px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.score.ok div:nth-child(2) b{color:#2F6B3A}.score.no div:nth-child(2) b{color:#6B5B4F}.score:not(.ok):not(.no) div:nth-child(2) b{color:#6E4F0F}
.score:empty{display:none}.score div:nth-child(3){flex:1.25}.score div:nth-child(3) b{font-size:24px;white-space:normal;line-height:1.25;-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical}
.photo{position:absolute;inset-block:0;inset-inline-end:0;width:470px}
.photo .face{width:100%;height:100%;object-fit:cover;object-position:center 22%}
.photo::after{content:'';position:absolute;inset:0;background:linear-gradient(to left,transparent 70%,#2A1A14)}[dir=rtl] .photo::after{background:linear-gradient(to right,transparent 70%,#2A1A14)}
.side-text{position:absolute;inset:110px 540px 60px 64px;display:flex;flex-direction:column;justify-content:center}[dir=rtl] .side-text{inset:110px 64px 60px 540px}
.split{position:absolute;inset:110px 64px 60px;display:flex;align-items:center;gap:52px}.text{flex:1;min-width:0}
.stats{display:flex;margin-top:28px;border-top:2px solid #C8962E}.stats div{padding:12px 28px 0 0;margin-inline-end:28px;border-inline-end:1px solid #4A372D}
[dir=rtl] .stats div{padding:12px 0 0 28px}.stats div:last-child{border:0}
.stats b{display:block;font-family:S,serif;font-size:42px;font-weight:700;white-space:nowrap;color:#E2B04A}.stats span{font-size:18px;color:#CDBFAE;white-space:nowrap}
.monogram{width:260px;height:260px;flex:none;display:grid;place-items:center}.monogram svg{width:230px;height:230px}
[hidden]{display:none!important}
.face{display:block;background:#4A372D}
.face.init{display:grid;place-items:center;font-family:S,serif;font-size:120px;font-weight:700;color:#FBF8F2}
.vs{position:absolute;inset:150px 64px 50px;display:flex;align-items:center;justify-content:center;gap:40px}
.eyebrow.center{position:absolute;inset:104px 64px auto;text-align:center;display:block}
.side{text-align:center;width:420px}.side .face{width:220px;height:250px;margin:0 auto;object-fit:cover;object-position:center 22%;border-bottom:6px solid #C8962E}
.side h2{font-family:S,serif;font-size:40px;margin-top:14px;line-height:1.15}.side p{font-size:23px;color:#E9DFD0;margin-top:4px}
.vsb{flex:none;font-family:S,serif;font-style:italic;font-size:60px;font-weight:700;color:#C8962E}
.faces{display:grid;grid-template-columns:repeat(3,120px);gap:8px;flex:none}.faces .face{width:120px;height:136px;object-fit:cover;object-position:center 22%}
.faces .face.init{font-size:40px}
.stack{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:450px;flex:none}
.stack img{width:100%;height:160px;object-fit:cover;object-position:top;background:#4A372D}
</style></head><body><main>${body(c)}</main>
<div class="top"><div class="brand">${logo}<span>${lang === 'ar' ? 'دليل شارك تانك مصر' : 'Shark Tank Egypt'}</span></div>
<div class="url"><bdi dir="ltr">${siteLabel}</bdi></div></div></body></html>`;

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
  // No maxres frame on YouTube (error or its 120px placeholder): use hqdefault.
  await tab.evaluate(() => Promise.all([...document.images].filter((i) => /maxresdefault/.test(i.src) && i.naturalWidth <= 120)
    .map((i) => new Promise((r) => { i.onload = i.onerror = r; i.src = i.src.replace('maxresdefault', 'hqdefault'); setTimeout(r, 4000); }))));
  // Images that failed (offline thumbnails) are hidden; a startup without a picture keeps the flat dark background.
  const broken = await tab.evaluate(() => { const b = [...document.images].filter((i) => !i.naturalWidth); b.forEach((i) => (i.style.visibility = 'hidden')); return b.length; });
  if (card.kind === 'startup' && (!card.shot || broken)) defaults++;
  writeFileSync(out, await tab.screenshot({ type: 'jpeg', quality: 72 }));
  done++;
}
await browser.close(); server.close();
if (!done) throw new Error('no share images rendered: run after `astro build`');
console.log(`share images: ${done} (${defaults} startups without a picture)`);
