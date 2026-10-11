// Reads the official site (sharktank-egypt.com) in a real browser. Deal-category pages list startup
// cards that link to each startup's official pitch video; this records each card's name and link.
// Usage (in Actions): node scripts/probe-site.mjs <out.json> [cat1,cat2,…]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const ROOT = 'https://sharktank-egypt.com';
const CATS = ['apps', 'automotive', 'health-and-beauty', 'fashion', 'entertainment-and-arts', 'food-and-beverage', 'home-and-furniture',
  'services', 'e-commerce', 'education-', 'medical-', 'sports', 'fintech', 'agriculture', 'technology-', 'recycling-', 'manufacturing-', 'other'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
const out = { startups: [] };
const page = await ctx.newPage();
for (const cat of process.argv[3]?.split(',') ?? CATS) {
  const url = `${ROOT}/en/deals/${cat}`;
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) { out.startups.push({ cat, error: String(e.message) }); continue; }
  // Each card is a link to the startup's official pitch video; its image alt holds the name.
  out.startups.push(...(await page.$$eval('a[href*="youtu"]', (as) => as.map((a) => ({ href: a.href, name: a.querySelector('img')?.alt ?? a.innerText })))).map((x) => ({ cat, ...x })));
  writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); // after each category: a killed runner keeps what it read
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.startups.length} cards`);
