// Screenshots each startup's website into public/screenshots/<id>.jpg.
// Usage: node scripts/screenshots.mjs [--missing]   (--missing skips ones already captured)
import { chromium } from 'playwright';
import { existsSync, readFileSync, rmSync } from 'node:fs';

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const onlyMissing = process.argv.includes('--missing');
const BROKEN = /domain (is )?for sale|buy this domain|security check|access denied|forbidden|403 error|404 not found|page not found|account (has been )?suspended|parked|under construction/i;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
// A regular desktop UA: some hosts block "HeadlessChrome".
const context = { viewport: { width: 1280, height: 800 }, locale: 'ar-EG',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' };
let ok = 0, failed = [];
// Cookie banners, newsletter pop-ups and chat bubbles: accept/close them, then drop any fixed layer
// that isn't the site's top bar, so the picture shows the page itself.
async function clearOverlays(page) {
  await page.evaluate(() => {
    const ok = /^(accept( all)?|allow( all)?|agree|i agree|got it|ok(ay)?|close|no,? thanks|موافق|قبول|أوافق|إغلاق|×|✕)$/i;
    for (const b of document.querySelectorAll('button, a[role=button], [aria-label*=close i]'))
      if (ok.test((b.textContent || b.getAttribute('aria-label') || '').trim())) b.click?.();
  }).catch(() => {});
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const vh = innerHeight, vw = innerWidth;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      const topBar = r.top <= 1 && r.height < vh * 0.2;
      if (!topBar && r.width * r.height > 0) el.style.setProperty('display', 'none', 'important');
    }
    document.documentElement.style.overflow = document.body.style.overflow = 'auto';
  }).catch(() => {});
}

for (const s of startups) {
  const out = `public/screenshots/${s.id}.jpg`;
  if (!s.website || (onlyMissing && existsSync(out))) continue; // website is own-domain only (social pages live in links)
  // Fresh page per site so one failed navigation can't interrupt the next.
  const page = await browser.newPage(context);
  try {
    // 'load' waits on every tracker and often times out; DOM ready + a pause is enough for the hero.
    const res = await page.goto(s.website, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000); // let hero images / animations settle
    // Don't keep error pages, parked domains, bot walls, blank pages or raw source as a startup's picture.
    const text = await page.evaluate(() => document.body?.innerText ?? '');
    const why = !res || res.status() >= 400 ? `HTTP ${res?.status()}` : !/html/.test(res.headers()['content-type'] ?? 'html') ? 'not an HTML page'
      : BROKEN.test(text.slice(0, 2000)) ? 'error or parked page' : text.trim().length < 40 ? 'blank page' : '';
    if (why) { rmSync(out, { force: true }); throw new Error(why); }
    await clearOverlays(page);
    await page.screenshot({ path: out, type: 'jpeg', quality: 70 });
    ok++;
    console.log('✓', s.id);
  } catch (e) {
    failed.push(s.id);
    console.log('✗', s.id, e.message.split('\n')[0]);
  } finally {
    await page.close();
  }
}
await browser.close();
console.log(`${ok} captured, ${failed.length} failed`);
