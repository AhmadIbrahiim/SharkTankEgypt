// Renders PNG icons and the default social share image from public/favicon.svg.
// Usage: CHROMIUM_PATH=… node scripts/brand-assets.mjs
// (Re-run after changing the logo; outputs are committed.)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
// Fonts are inlined as data URIs (a setContent page can't load file:// fonts), straight from node_modules.
const font = (pkg, f) => `url(data:font/woff2;base64,${readFileSync(`node_modules/@fontsource-variable/${pkg}/files/${f}`).toString('base64')}) format('woff2')`;
const css = `@font-face{font-family:RA;font-weight:100 900;src:${font('readex-pro', 'readex-pro-arabic-wght-normal.woff2')}}
@font-face{font-family:RL;font-weight:100 900;src:${font('readex-pro', 'readex-pro-latin-wght-normal.woff2')}}
@font-face{font-family:SL;font-weight:200 900;src:${font('source-serif-4', 'source-serif-4-latin-wght-normal.woff2')}}
@font-face{font-family:SA;font-weight:400 700;src:${font('noto-naskh-arabic', 'noto-naskh-arabic-arabic-wght-normal.woff2')}}*{margin:0;box-sizing:border-box}`;

const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const shot = async (w, h, html, out) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<style>${css}</style>${html}`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  writeFileSync(out, await p.screenshot({ omitBackground: true }));
  await p.close();
};
const icon = (s, pad = 0) => `<div style="width:${s}px;height:${s}px;padding:${pad}px;background:${pad ? '#F4EFE6' : 'transparent'}">${svg.replace('<svg', `<svg width="${s - 2 * pad}" height="${s - 2 * pad}"`)}</div>`;

await shot(32, 32, icon(32), 'public/favicon-32.png');
await shot(180, 180, icon(180, 14), 'public/apple-touch-icon.png'); // iOS adds its own rounding; pad on paper
await shot(192, 192, icon(192), 'public/icon-192.png');
await shot(512, 512, icon(512), 'public/icon-512.png');

await shot(1200, 630, `<div style="width:1200px;height:630px;background:#F4EFE6;color:#2A1A14;padding:56px 80px;display:flex;flex-direction:column;font-family:RL,RA,sans-serif">
  <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:6px double #2A1A14">
    <div style="display:flex;align-items:center;gap:18px">${svg.replace('<svg', '<svg width="64" height="64"')}
      <div style="font-family:SL;font-size:40px;font-weight:800;letter-spacing:-.5px">Shark Tank Egypt</div></div>
    <div style="font-size:20px;letter-spacing:4px;text-transform:uppercase;color:#6B5B4F">Startup Directory</div>
  </div>
  <div style="font-family:SL;font-size:76px;font-weight:700;line-height:1.05;letter-spacing:-1.5px;margin-top:64px">Every pitch. Every deal.</div>
  <div dir="rtl" style="font-family:SA;font-size:60px;font-weight:700;line-height:1.5;margin-top:18px">كل فكرة دخلت التانك، وكل صفقة.</div>
  <div style="margin-top:auto;padding-top:18px;border-top:1px solid #E3D7C3;font-size:24px;color:#6B5B4F;display:flex;justify-content:space-between">
    <span>Startups, sharks, founders and deals, with sources</span><span style="color:#8E1B1B;font-weight:600">AR · EN</span></div>
</div>`, 'public/og.png');

await b.close();
writeFileSync('public/site.webmanifest', JSON.stringify({
  name: 'Shark Tank Egypt Directory · دليل شارك تانك مصر', short_name: 'Shark Tank EG',
  start_url: './ar/', scope: './', display: 'standalone',
  background_color: '#F4EFE6', theme_color: '#8E1B1B',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}, null, 2) + '\n');
console.log('brand assets written');
