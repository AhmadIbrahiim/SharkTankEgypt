// End-to-end checks of the built site in a real browser. Serves dist/ itself.
// Usage: npm run build && node scripts/e2e.mjs   (CHROMIUM_PATH=… to use a preinstalled browser)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';

const BASE = new URL(JSON.parse(readFileSync('package.json', 'utf8')).homepage).pathname.replace(/\/$/, '');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(BASE)) { res.writeHead(404).end(); return; }
  p = join('dist', p.slice(BASE.length));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' }).end(readFileSync(p));
}).listen(0);
const U = `http://localhost:${server.address().port}${BASE}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
// Block the outside world (YouTube thumbnails etc.) so tests are fast and deterministic.
const page = async (opts = {}) => { const p = await browser.newPage(opts); await p.route(/^https?:\/\/(?!localhost)/, (r) => r.abort()); return p; };
let passed = 0;
const test = async (name, fn) => { try { await fn(); passed++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n   ', e.message); process.exitCode = 1; } };
const count = (p) => p.evaluate(() => +document.getElementById('count').textContent.replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x660).replace(/\D/g, ''));
const visibleNames = (p) => p.$$eval('#grid > li:not([hidden]) h3', (hs) => hs.map((h) => h.textContent.trim()));

await test('home lists startups, 24 per page, show more adds more', async () => {
  const p = await page(); await p.goto(`${U}/en/`);
  assert.ok((await count(p)) > 200);
  assert.equal((await visibleNames(p)).length, 24);
  await p.click('#more'); assert.ok((await visibleNames(p)).length > 24);
});
await test('search: English, Arabic with spelling variants, typo, multi-word', async () => {
  const p = await page(); await p.goto(`${U}/`);
  for (const q of ['bar jar', 'بار اند جار', 'بار أند جار', 'jar bar', 'Bar & Jar', 'nourhan abaza', 'نورهان اباظه']) {
    await p.fill('#q', q);
    assert.ok((await visibleNames(p)).some((n) => /بار أند جار/.test(n)), `query "${q}" should find Bar & Jar`);
  }
  await p.fill('#q', 'qqqzzz'); assert.equal(await count(p), 0);
  assert.equal(await p.isVisible('#empty'), true, 'empty state shows');
});
await test('filters combine and live in the URL; back button restores them', async () => {
  const p = await page(); await p.goto(`${U}/en/`);
  await p.click('.chips[data-key="s"] .chip[data-v="2"]');
  await p.click('.chips[data-key="d"] .chip[data-v="1"]');
  await p.selectOption('#sh', 'Ayman Abbas');
  const n = await count(p);
  assert.ok(n > 0 && n < 31, `S2 + deal + Ayman Abbas should be a small set (got ${n})`);
  const url = new URL(p.url());
  assert.equal(url.searchParams.get('s'), '2'); assert.equal(url.searchParams.get('d'), '1'); assert.equal(url.searchParams.get('sh'), 'Ayman Abbas');
  await p.click('#grid > li:not([hidden]) a.card'); await p.waitForLoadState();
  await p.goBack(); await p.waitForLoadState();
  assert.equal(await count(p), n, 'same results after Back');
  assert.equal(await p.inputValue('#sh'), 'Ayman Abbas');
  const shared = await page(); await shared.goto(url.href); assert.equal(await count(shared), n, 'shared URL reproduces the view');
});
await test('sort by biggest deal puts the largest deal first', async () => {
  const p = await page(); await p.goto(`${U}/en/?sort=deal`);
  const amounts = await p.$$eval('#grid > li:not([hidden])', (ls) => ls.map((l) => +l.dataset.amount));
  assert.deepEqual(amounts, [...amounts].sort((a, b) => b - a));
});
await test('language switch keeps the page and flips direction', async () => {
  const p = await page(); await p.goto(`${U}/en/bar-and-jar/`);
  assert.equal(await p.getAttribute('html', 'dir'), 'ltr');
  await p.click('header a.lang'); await p.waitForLoadState();
  assert.equal(p.url(), `${U}/bar-and-jar/`); assert.equal(await p.getAttribute('html', 'dir'), 'rtl');
});
await test('main nav works by keyboard and marks the current page', async () => {
  const p = await page(); await p.goto(`${U}/en/deals/`);
  assert.equal(await p.textContent('.nav [aria-current="page"]'), 'Deals');
  await p.keyboard.press('Tab'); // skip link first
  assert.equal(await p.evaluate(() => document.activeElement.className), 'skip');
  await p.focus('.nav a[href$="/sharks/"]');
  await Promise.all([p.waitForURL(/\/en\/sharks\/$/), p.keyboard.press('Enter')]);
});
await test('phones: no sideways scroll on key pages (390px and 360px, both languages)', async () => {
  for (const w of [390, 360]) for (const path of ['en/', '', 'en/bar-and-jar/', 'bar-and-jar/', 'deals/', 'sharks/ayman-abbas/']) {
    const p = await page({ viewport: { width: w, height: 800 } }); await p.goto(`${U}/${path}`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(sw <= w, `${path} at ${w}px scrolls sideways (${sw}px)`); await p.close();
  }
});
await test('startup page shows summary, verification and sources', async () => {
  const p = await page(); await p.goto(`${U}/en/bar-and-jar/`);
  assert.match(await p.textContent('.answer'), /deal with Ahmed El Sewedy/);
  assert.match(await p.textContent('.verify'), /Verified/);
  assert.ok(await p.isVisible('details.sources'));
});
await test('valuation calculator: 1M for 20% is 5M post-money, 4M pre-money; rejects bad input', async () => {
  const p = await page(); await p.goto(`${U}/en/deals/`);
  await p.fill('#ca', '1000000'); await p.fill('#ce', '20');
  assert.match(await p.textContent('#co'), /Post-money: EGP 5,000,000 · Pre-money: EGP 4,000,000/);
  await p.fill('#ce', '0'); assert.match(await p.textContent('#co'), /between 0 and 100/);
  await p.fill('#ce', '150'); assert.match(await p.textContent('#co'), /between 0 and 100/);
});
await test('compare: shared URL shows both startups, add by name, remove, unknowns marked', async () => {
  const p = await page(); await p.goto(`${U}/en/compare/?ids=bar-and-jar,tutoro`);
  const heads = await p.$$eval('#cmp thead th a', (as) => as.map((a) => a.textContent));
  assert.deepEqual(heads, ['Bar & Jar', 'Tutoro']);
  assert.match(await p.textContent('#cmp tbody'), /3\.5M EGP/); // Bar & Jar deal amount
  assert.ok((await p.$$('#cmp td.unk')).length > 0, 'unknown values are marked');
  await p.fill('#add', 'Stunning'); await p.dispatchEvent('#add', 'change');
  assert.match(p.url(), /ids=bar-and-jar%2Ctutoro%2Cstunning|ids=bar-and-jar,tutoro,stunning/);
  await p.click('[data-rm="tutoro"]');
  assert.deepEqual(await p.$$eval('#cmp thead th a', (as) => as.map((a) => a.textContent)), ['Bar & Jar', 'Stunning']);
});
await browser.close(); server.close();
console.log(`e2e: ${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
