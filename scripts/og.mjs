// Renders a 1200×630 share image for every built page: reads the page's #og-card JSON (set by Base.astro)
// and writes dist/og/<path>.jpg, the URL Base.astro already put in og:image.
// Usage (after `astro build`): node scripts/og.mjs [--only <path-prefix>]
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';

const DIST = 'dist', FONTS = 'node_modules/@fontsource-variable/readex-pro/files';
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : '';
const logo = readFileSync('public/favicon.svg', 'utf8');
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
      ${c.shot ? `<div class="device"><div class="dots"><i></i><i></i><i></i></div><img src="${esc(c.shot)}">${c.play ? '<span class="play">▶</span>' : ''}</div>` : ''}<div class="monogram"${c.shot ? ' hidden' : ''}>${logo}</div></div>`;
    case 'person': return `<div class="split person"><div class="ring">${face(c.photo, c.title)}<span class="fin">${logo}</span></div>
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
@font-face{font-family:R;font-weight:100 900;src:url(/__fonts/readex-pro-arabic-wght-normal.woff2) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+0660-0669}
@font-face{font-family:R;font-weight:100 900;src:url(/__fonts/readex-pro-latin-wght-normal.woff2) format('woff2')}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:R,sans-serif;color:#2B211A;position:relative;
  background:radial-gradient(620px 360px at 100% 0%,#f8c3a6 0%,transparent 70%),radial-gradient(560px 320px at 0% 100%,#cfe9e3 0%,transparent 70%),#FBF6EE}
body::before{content:'';position:absolute;inset:0;background:repeating-radial-gradient(circle at 92% 108%,transparent 0 38px,rgba(224,86,47,.07) 38px 40px);pointer-events:none}
main{position:absolute;inset:56px 64px 92px}
.brand{position:absolute;inset-inline-start:64px;bottom:30px;display:flex;align-items:center;gap:12px;font-weight:600;font-size:22px}
.brand svg{width:40px;height:40px}.brand small{color:#B5401C;font-weight:500;font-size:18px}
.url{position:absolute;inset-inline-end:64px;bottom:36px;color:#8a7766;font-size:18px}
.split{display:flex;align-items:center;gap:48px;height:100%}.text{flex:1;min-width:0}
.eyebrow{display:inline-block;padding:6px 16px;border-radius:999px;background:#2B211A;color:#FBF6EE;font-size:20px;font-weight:500;margin-bottom:18px}
.eyebrow.center{display:table;margin:0 auto 10px}
h1{font-size:76px;line-height:1.05;font-weight:700;letter-spacing:-1.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
h1.long{font-size:54px;-webkit-line-clamp:3}[dir=rtl] h1{letter-spacing:0;line-height:1.25}
.alt{font-size:30px;color:#B5401C;margin-top:8px;font-weight:500}
.sub{font-size:25px;color:#5d4d40;margin-top:16px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.badge{display:inline-block;margin-top:22px;padding:10px 22px;border-radius:16px;font-size:26px;font-weight:600}
.badge.ok{background:#1f7a52;color:#fff}.badge.no{background:#e9dfd3;color:#5d4d40}.badge.ask{background:#E0562F;color:#fff}
.stats{display:flex;gap:14px;margin-top:26px}.stats div{background:#fff;border-radius:18px;padding:14px 22px;box-shadow:0 6px 20px rgba(60,35,15,.1);min-width:150px}
.stats b{display:block;font-size:36px;font-weight:700;white-space:nowrap}.stats span{font-size:18px;color:#8a7766;white-space:nowrap}
.device{width:500px;flex:none;background:#fff;border-radius:22px;padding:38px 12px 12px;box-shadow:0 30px 60px rgba(60,35,15,.25);transform:rotate(-3deg);position:relative}
[dir=rtl] .device{transform:rotate(3deg)}
.device img{width:100%;height:300px;object-fit:cover;object-position:top;border-radius:12px;display:block;background:#efe6da}
.dots{position:absolute;top:14px;inset-inline-start:18px;display:flex;gap:7px}.dots i{width:12px;height:12px;border-radius:50%;background:#e9dfd3}.dots i:first-child{background:#E0562F}
.play{position:absolute;left:50%;top:55%;transform:translate(-50%,-50%);width:84px;height:84px;border-radius:50%;background:#E0562F;color:#fff;font-size:34px;display:grid;place-items:center;padding-left:6px;box-shadow:0 10px 30px rgba(224,86,47,.5)}
.monogram{width:300px;height:300px;flex:none;border-radius:60px;background:linear-gradient(135deg,#E0562F,#f29a5c);color:#fff;font-size:120px;font-weight:700;display:grid;place-items:center;transform:rotate(-4deg);box-shadow:0 30px 60px rgba(224,86,47,.35)}
.monogram svg{width:200px;height:200px}[hidden]{display:none!important}
.ring{position:relative;flex:none;padding:10px;border-radius:50%;background:conic-gradient(from 200deg,#E0562F,#f6b38c,#2a8f86,#E0562F)}
.face{width:330px;height:330px;border-radius:50%;object-fit:cover;object-position:center 30%;display:block;border:8px solid #FBF6EE;background:#efe6da}
.face.init{display:grid;place-items:center;font-size:110px;font-weight:700;color:#fff;background:linear-gradient(135deg,#2a8f86,#E0562F)}
.fin{position:absolute;bottom:6px;inset-inline-end:6px;width:92px;height:92px;border-radius:26px;overflow:hidden;box-shadow:0 10px 24px rgba(60,35,15,.3)}.fin svg{width:100%;height:100%}
.person .text{padding-inline-start:8px}
.vs{display:flex;align-items:center;justify-content:center;gap:40px;height:92%}
.side{text-align:center;width:420px}.side .face{width:240px;height:240px;margin:0 auto;border-width:6px;box-shadow:0 0 0 6px #E0562F}
.side h2{font-size:40px;margin-top:16px;line-height:1.15}.side p{font-size:24px;color:#5d4d40;margin-top:6px}
.vsb{width:120px;height:120px;flex:none;border-radius:50%;background:#2B211A;color:#FBF6EE;font-size:44px;font-weight:800;display:grid;place-items:center;transform:rotate(-8deg);box-shadow:0 14px 30px rgba(43,33,26,.35)}
.faces{display:grid;grid-template-columns:repeat(3,120px);gap:14px;flex:none}.faces .face{width:120px;height:120px;border-width:4px;box-shadow:0 8px 18px rgba(60,35,15,.18)}
.faces .face.init{font-size:40px}
.stack{position:relative;width:440px;height:400px;flex:none}
.stack img{position:absolute;width:330px;height:210px;object-fit:cover;object-position:top;border-radius:16px;border:8px solid #fff;box-shadow:0 18px 40px rgba(60,35,15,.25);background:#efe6da}
.stack img:nth-child(1){top:0;inset-inline-start:0;transform:rotate(-6deg)}.stack img:nth-child(2){top:40px;inset-inline-end:0;transform:rotate(5deg)}
.stack img:nth-child(3){bottom:20px;inset-inline-start:20px;transform:rotate(3deg)}.stack img:nth-child(4){bottom:0;inset-inline-end:20px;transform:rotate(-4deg)}
</style></head><body><main>${body(c)}</main>
<div class="brand">${logo}<span>${lang === 'ar' ? 'دليل شارك تانك مصر' : 'Shark Tank Egypt'} <small>${lang === 'ar' ? '· كل الشركات والصفقات' : '· Startup Directory'}</small></span></div>
<div class="url"><bdi dir="ltr">ahmadibrahiim.github.io/SharkTankEgypt</bdi></div></body></html>`;

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
