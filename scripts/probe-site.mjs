// Reads the official site (sharktank-egypt.com) in a real browser: every deal-category page, every
// startup page linked from them, and any JSON the pages load, so pitch outcomes can be read from it.
// Usage (in Actions): node scripts/probe-site.mjs <out.json>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const ROOT = 'https://sharktank-egypt.com';
const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
const out = { pages: [], json: [] };
ctx.on('response', async (r) => {
  if (!/json/.test(r.headers()['content-type'] ?? '') || !r.url().includes('sharktank')) return;
  try { out.json.push({ url: r.url(), body: (await r.text()).slice(0, 200000) }); } catch {}
});

async function read(url) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    const r = await page.evaluate(() => ({ text: document.body.innerText, links: [...document.querySelectorAll('a[href]')].map((a) => a.href) }));
    out.pages.push({ url, final: page.url(), text: r.text.slice(0, 20000) });
    return r.links;
  } catch (e) { out.pages.push({ url, error: String(e.message ?? e) }); return []; }
  finally { await page.close(); }
}

const seen = new Set();
const queue = [`${ROOT}/en/deals`, `${ROOT}/ar/deals`, `${ROOT}/en/seasons`, `${ROOT}/en`];
// Breadth-first over the site, en+ar, capped so a link loop can't run forever.
while (queue.length && seen.size < 700) {
  const url = queue.shift().split('#')[0];
  if (seen.has(url)) continue;
  seen.add(url);
  for (const l of await read(url)) {
    const u = l.split('#')[0];
    if (u.startsWith(ROOT) && !seen.has(u) && !/\.(jpg|png|pdf|webp)$|login|register|apply|contact/i.test(u)) queue.push(u);
  }
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.pages.length} pages, ${out.json.length} json responses`);
