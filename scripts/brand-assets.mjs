// Renders PNG icons and the default social share image from public/favicon.svg.
// Usage: FONT_DIR=<dir with readex-pro woff2 files> CHROMIUM_PATH=… node scripts/brand-assets.mjs
// (Re-run after changing the logo; outputs are committed.)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
// Fonts are inlined as data URIs: a setContent page can't load file:// fonts.
const font = (f) => (process.env.FONT_DIR ? `url(data:font/woff2;base64,${readFileSync(`${process.env.FONT_DIR}/${f}`).toString('base64')}) format('woff2')` : 'local("Readex Pro")');
const css = `@font-face{font-family:RA;font-weight:100 900;src:${font('readex-pro-arabic-wght-normal.woff2')}}
@font-face{font-family:RL;font-weight:100 900;src:${font('readex-pro-latin-wght-normal.woff2')}}*{margin:0;box-sizing:border-box}`;

const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const shot = async (w, h, html, out) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<style>${css}</style>${html}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  writeFileSync(out, await p.screenshot({ omitBackground: true }));
  await p.close();
};
const icon = (s, pad = 0) => `<div style="width:${s}px;height:${s}px;padding:${pad}px;background:${pad ? '#FBF6EE' : 'transparent'}">${svg.replace('<svg', `<svg width="${s - 2 * pad}" height="${s - 2 * pad}"`)}</div>`;

await shot(32, 32, icon(32), 'public/favicon-32.png');
await shot(180, 180, icon(180, 14), 'public/apple-touch-icon.png'); // iOS adds its own rounding; pad on brand cream
await shot(192, 192, icon(192), 'public/icon-192.png');
await shot(512, 512, icon(512), 'public/icon-512.png');

await shot(1200, 630, `<div style="width:1200px;height:630px;font-family:RL,RA,sans-serif;background:
  radial-gradient(700px 380px at 92% -5%, #f8c3a6, transparent 70%), radial-gradient(600px 320px at 0% 110%, #cfe9e3, transparent 70%), #FBF6EE;
  display:flex;flex-direction:column;justify-content:center;padding:0 90px;color:#2B211A">
  <div style="display:flex;align-items:center;gap:28px">
    ${svg.replace('<svg', '<svg width="132" height="132"')}
    <div><div style="font-size:64px;font-weight:700;letter-spacing:-1px;line-height:1.05">Shark Tank Egypt</div>
      <div style="font-size:30px;color:#B5401C;font-weight:500;margin-top:6px">Startup Directory</div></div>
  </div>
  <div dir="rtl" style="font-size:54px;font-weight:700;margin-top:46px;line-height:1.25">دليل شركات شارك تانك مصر</div>
  <div style="font-size:28px;color:#6E5F52;margin-top:22px">Every startup, shark and founder · كل الشركات والمستثمرين والمؤسسين</div>
</div>`, 'public/og.png');

await b.close();
writeFileSync('public/site.webmanifest', JSON.stringify({
  name: 'Shark Tank Egypt Directory · دليل شارك تانك مصر', short_name: 'Shark Tank EG',
  start_url: '/SharkTankEgypt/ar/', scope: '/SharkTankEgypt/', display: 'standalone',
  background_color: '#FBF6EE', theme_color: '#E0562F',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}, null, 2) + '\n');
console.log('brand assets written');
