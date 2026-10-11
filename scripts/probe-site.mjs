// Reads the official site (sharktank-egypt.com) in a real browser. Deal-category pages list startup
// names without links, so each name is clicked and whatever it opens (a page, a modal, a data request)
// is recorded, so pitch outcomes can be read from it.
// Usage (in Actions): node scripts/probe-site.mjs <out.json> [cat1,cat2,…]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const ROOT = 'https://sharktank-egypt.com';
const CATS = ['apps', 'automotive', 'health-and-beauty', 'fashion', 'entertainment-and-arts', 'food-and-beverage', 'home-and-furniture',
  'services', 'e-commerce', 'education-', 'medical-', 'sports', 'fintech', 'agriculture', 'technology-', 'recycling-', 'manufacturing-', 'other'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
const out = { startups: [], requests: [] };
let current = null; // the startup being clicked, to tag the requests it triggers
ctx.on('response', async (r) => {
  const t = r.request().resourceType();
  if (!['fetch', 'xhr', 'document'].includes(t) || !r.url().startsWith(ROOT) || r.url().includes('/api/auth/')) return;
  try { out.requests.push({ for: current, url: r.url(), status: r.status(), body: (await r.text()).slice(0, 30000) }); } catch {}
});

const page = await ctx.newPage();
for (const cat of process.argv[3]?.split(',') ?? CATS) {
  const url = `${ROOT}/en/deals/${cat}`;
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) { out.startups.push({ cat, error: String(e.message) }); continue; }
  const before = await page.evaluate(() => document.body.innerText);
  const names = before.split('\n').map((s) => s.trim());
  const list = names.slice(names.lastIndexOf('Special Episodes') + 1, names.findIndex((s) => s.startsWith('©'))).filter(Boolean);
  out.html ??= (await page.content()).slice(0, 60000); // markup sample, to see how cards are built
  for (const name of list) {
    current = name;
    const rec = { cat, name };
    try {
      await page.getByText(name, { exact: true }).first().click({ timeout: 5000 });
      await page.waitForTimeout(2500);
      rec.url = page.url();
      const text = await page.evaluate(() => document.body.innerText);
      rec.text = text === before ? '' : text.slice(0, 6000);
    } catch (e) { rec.error = String(e.message).slice(0, 200); }
    out.startups.push(rec);
    if (page.url() !== url) await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    else await page.keyboard.press('Escape').catch(() => {});
  }
  writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); // after each category: a killed runner keeps what it read
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.startups.length} clicked, ${out.startups.filter((s) => s.text).length} opened something, ${out.requests.length} requests`);
