// End-to-end checks of the built site in a real browser. Serves dist/ itself.
// Usage: npm run build && node scripts/e2e.mjs   (CHROMIUM_PATH=… to use a preinstalled browser)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';

const BASE = new URL(JSON.parse(readFileSync('package.json', 'utf8')).homepage).pathname.replace(/\/$/, '');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain', '.xml': 'application/xml' };
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
await test('episode previews show the announced lineup without adding unbroadcast pitches to totals', async () => {
  const previews = JSON.parse(readFileSync('src/data/episode-previews.json', 'utf8'));
  const aired = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
  const exported = JSON.parse(readFileSync('dist/data/startups.json', 'utf8')).startups;
  assert.equal(exported.length, aired.length);
  for (const prefix of ['en/', '']) {
    const p = await page({ viewport: { width: 375, height: 812 } });
    await p.goto(`${U}/${prefix}`);
    assert.equal(await count(p), aired.length);
    for (const preview of previews) {
      const section = p.locator(`#episode-${preview.season}-${preview.episode}-preview`);
      assert.equal(await section.locator('time').getAttribute('datetime'), preview.scheduledAt);
      for (const startup of preview.startups) assert.ok(!exported.some((x) => x.id === startup.id));
      assert.ok(await section.evaluate((el) => el.getBoundingClientRect().right <= innerWidth && el.scrollWidth <= el.clientWidth), 'preview fits a phone');
      await section.locator('a').click();
      assert.ok(new URL(p.url()).pathname.endsWith(`/season/${preview.season}/`));
      const full = p.locator(`#episode-${preview.season}-${preview.episode}-preview`);
      assert.ok(await full.isVisible());
      assert.equal(await full.locator('li').count(), preview.startups.length);
      assert.equal(await full.locator('a').last().getAttribute('href'), preview.scheduleSource);
      await p.goto(`${U}/${prefix}`);
    }
    await p.goto(`${U}/${prefix}season/1/`);
    assert.equal(await p.locator('.episode-preview').count(), previews.filter((x) => x.season === 1).length);
    await p.close();
  }
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
await test('hero loads its local photograph, links to the featured deal, and keeps keyboard search usable', async () => {
  for (const prefix of ['en/', '']) {
    const p = await page({ viewport: { width: 1280, height: 800 } }); await p.goto(`${U}/${prefix}`);
    await p.evaluate(() => document.fonts.ready);
    assert.ok(await p.locator('.hero-photo').evaluate((img) => img.complete && img.naturalWidth > 600 && !!img.alt), 'hero photograph loads without a third-party request and has alt text');
    assert.ok((await p.locator('.hero-tools').boundingBox()).y + (await p.locator('.hero-tools').boundingBox()).height < 800, 'search fits the laptop fold');
    for (const width of [320, 375, 414, 768, 1280]) {
      await p.setViewportSize({ width, height: 800 });
      const clipped = await p.locator('.stage').evaluate((hero) => [...hero.querySelectorAll('h1 span, .sub, .feature-link strong, .feature-link small, .totals dd')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.left < 0 || r.right > innerWidth || e.scrollWidth > e.clientWidth + 1;
      }).map((e) => e.textContent));
      assert.deepEqual(clipped, [], `${prefix || 'ar'} hero at ${width}px`);
    }
    await p.keyboard.press('/');
    assert.ok(await p.locator('#q').evaluate((e) => e === document.activeElement));
    await p.fill('#q', 'bar jar');
    await p.locator('#suggest a').first().waitFor({ state: 'visible' });
    await p.keyboard.press('ArrowDown');
    assert.ok(await p.locator('#suggest').evaluate((e) => e.contains(document.activeElement)));
    await p.keyboard.press('Escape');
    assert.ok(await p.locator('#q').evaluate((e) => e === document.activeElement));
    await p.locator('.feature-link').focus();
    await Promise.all([p.waitForURL(`${U}/${prefix}al-ahram-cookware/`), p.keyboard.press('Enter')]);
    await p.close();
  }
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
await test('responsive: no sideways scroll at 320, 375, 414, 768 and 1440px', async () => {
  for (const w of [320, 375, 414, 768, 1440]) for (const path of ['en/', '', 'en/bar-and-jar/', 'bar-and-jar/', 'deals/', 'sharks/ayman-abbas/']) {
    const p = await page({ viewport: { width: w, height: 800 } }); await p.goto(`${U}/${path}`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(sw <= w, `${path} at ${w}px scrolls sideways (${sw}px)`); await p.close();
  }
});
await test('mobile directory puts results first and keeps navigation labels on one line', async () => {
  for (const prefix of ['en/', '']) for (const width of [320, 375]) {
    const p = await page({ viewport: { width, height: 900 } }); await p.goto(`${U}/${prefix}`);
    await p.evaluate(() => document.fonts.ready);
    const layout = await p.evaluate(() => {
      const grid = document.getElementById('grid');
      const labels = [...document.querySelectorAll('.panel .sechead a, .foot-grid nav > a')];
      return {
        headerHeight: document.querySelector('.site-header').getBoundingClientRect().height,
        gridTop: grid.getBoundingClientRect().top,
        panelTop: document.querySelector('.panel').getBoundingClientRect().top,
        wrapped: labels.filter((e) => {
          const r = document.createRange(); r.selectNodeContents(e);
          return new Set([...r.getClientRects()].map((rect) => Math.round(rect.top))).size > 1;
        }).map((e) => e.textContent),
      };
    });
    assert.ok(layout.gridTop < 1100, `results start too far down at ${width}px: ${layout.gridTop}`);
    assert.ok(layout.headerHeight <= 100, `header gained an extra row at ${width}px`);
    assert.ok(layout.gridTop < layout.panelTop, 'startup results precede investor discovery');
    assert.deepEqual(layout.wrapped, [], `wrapped navigation at ${width}px`);
    await p.close();
  }
});
await test('keyboard focus contrasts with both dark and crimson panels', async () => {
  const luminance = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number).map((c) => {
    c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
  }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
  for (const prefix of ['en/', '']) {
    const p = await page(); await p.goto(`${U}/${prefix}`);
    for (const [target, surface] of [['.panel .sechead a', '.panel'], ['.chairs a', '.panel'], ['.site-footer .gh', '.site-footer']]) {
      await p.locator(target).first().focus();
      const colors = await p.locator(target).first().evaluate((e, surface) => ({
        visible: e.matches(':focus-visible'), outline: getComputedStyle(e).outlineStyle,
        width: parseFloat(getComputedStyle(e).outlineWidth), ring: getComputedStyle(e).outlineColor,
        bg: getComputedStyle(e.closest(surface)).backgroundColor,
      }), surface);
      assert.ok(colors.visible && colors.outline !== 'none' && colors.width >= 2);
      const [dark, light] = [luminance(colors.ring), luminance(colors.bg)].sort((a, b) => a - b);
      assert.ok((light + .05) / (dark + .05) >= 3, `${target} focus contrast must be at least 3:1`);
    }
    await p.close();
  }
});
await test('financial figures use equal-width digits and aligned columns in both languages', async () => {
  for (const prefix of ['en/', '']) {
    const p = await page(); await p.goto(`${U}/${prefix}deals/`); await p.evaluate(() => document.fonts.ready);
    const result = await p.locator('table.all td:nth-child(4)').first().evaluate((e) => {
      const span = document.createElement('span'); e.append(span);
      const widths = (digits) => [...digits].map((digit) => { span.textContent = digit.repeat(5); return span.getBoundingClientRect().width; });
      const values = widths(document.documentElement.lang === 'ar' ? '٠١٢٣٤٥٦٧٨٩' : '0123456789');
      span.remove();
      return { spread: Math.max(...values) - Math.min(...values), alignment: getComputedStyle(e).textAlign };
    });
    assert.ok(result.spread < .1, `digits differ in width by ${result.spread}px`);
    assert.equal(result.alignment, 'end');
    await p.close();
  }
});
await test('startup page shows summary, verification and sources', async () => {
  const p = await page(); await p.goto(`${U}/en/bar-and-jar/`);
  assert.match(await p.textContent('.answer'), /deal with Ahmed El Sewedy/);
  assert.match(await p.textContent('.verify'), /Verified/);
  assert.ok(await p.isVisible('details.sources'));
  // The pitch video loads on click and must keep the thumbnail's size (it once fell back to 300×150).
  const size = (s) => p.$eval(s, (e) => Math.round(e.getBoundingClientRect().width));
  const w = await size('.player button'); await p.click('.player button');
  assert.equal(await size('.player iframe'), w);
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
  assert.deepEqual(heads, ['Bar & Jar', 'Tutoruu']);
  assert.match(await p.textContent('#cmp tbody'), /3\.5M EGP/); // Bar & Jar deal amount
  assert.ok((await p.$$('#cmp td.unk')).length > 0, 'unknown values are marked');
  await p.fill('#add', 'Stunning'); await p.dispatchEvent('#add', 'change');
  assert.match(p.url(), /ids=bar-and-jar%2Ctutoro%2Cstunning|ids=bar-and-jar,tutoro,stunning/);
  await p.click('[data-rm="tutoro"]');
  assert.deepEqual(await p.$$eval('#cmp thead th a', (as) => as.map((a) => a.textContent)), ['Bar & Jar', 'Stunning']);
});
await test('founder profiles distinguish personal and company links in both languages', async () => {
  for (const prefix of ['en/', '']) {
    const p = await page(); await p.goto(`${U}/${prefix}founders/shorouk-alaa/`);
    const personal = p.getByRole('region', { name: prefix ? 'Personal profiles' : 'حسابات شخصية', exact: true });
    assert.equal(await personal.locator('a').getAttribute('href'), 'https://www.linkedin.com/in/shrouk-alaa-eldin/');
    const company = p.getByRole('region', { name: prefix ? 'Company links: Career 180' : 'روابط الشركة: كارير 180', exact: true });
    assert.ok(await company.locator('a[href="https://career-180.com/"]').isVisible());
    assert.ok(await p.locator('a[href="https://career-180.com/en/qualifying/experts/shrouk-alaa-2"]').count());
    const people = await p.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.flatMap((s) => {
      const data = JSON.parse(s.textContent); return data['@graph'] ?? [data];
    }).filter((n) => n['@type'] === 'Person'));
    assert.ok(people.some((n) => n.sameAs?.includes('https://www.linkedin.com/in/shrouk-alaa-eldin/')));
    assert.ok(people.every((n) => !n.sameAs?.includes('https://career-180.com/')));
    await p.locator('.pic img').scrollIntoViewIfNeeded();
    await p.waitForFunction(() => document.querySelector('.pic img')?.naturalWidth > 0);
    await p.close();
  }
});
await browser.close(); server.close();
console.log(`e2e: ${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
