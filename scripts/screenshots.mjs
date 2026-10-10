// Screenshots each startup's website into public/screenshots/<id>.jpg.
// Usage: node scripts/screenshots.mjs [--missing]   (--missing skips ones already captured)
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const onlyMissing = process.argv.includes('--missing');
// Social pages show login walls instead of the product, so the card placeholder is better.
const social = /(^|\.)(facebook|fb|instagram|tiktok|linkedin|twitter|x)\.com$/;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'ar-EG' });
let ok = 0, failed = [];
for (const s of startups) {
  const out = `public/screenshots/${s.id}.jpg`;
  if (!s.website || social.test(new URL(s.website).hostname) || (onlyMissing && existsSync(out))) continue;
  try {
    await page.goto(s.website, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000); // let hero images / animations settle
    await page.screenshot({ path: out, type: 'jpeg', quality: 70 });
    ok++;
    console.log('✓', s.id);
  } catch (e) {
    failed.push(s.id);
    console.log('✗', s.id, e.message.split('\n')[0]);
  }
}
await browser.close();
console.log(`${ok} captured, ${failed.length} failed`);
