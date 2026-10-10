// Downloads the text of the news articles cited for startups whose pitch outcome is unknown,
// plus the show's deal pages, so outcomes can be read from the articles themselves.
// Runs in GitHub Actions (open internet). Usage: node scripts/fetch-sources.mjs <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { get } from './harvest.mjs';
import { textOf } from './enrich.mjs';

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const SOCIAL = /youtube|youtu\.be|instagram|facebook|tiktok|linkedin|twitter|x\.com/;
const open = startups.filter((x) => !x.deal || x.deal.made == null);
const jobs = open.flatMap((x) => x.sources.filter((u) => !SOCIAL.test(u)).map((url) => ({ id: x.id, url })));
// leads.json: extra articles found by search, read in full here because snippets cut off
try { jobs.push(...JSON.parse(readFileSync('automation/sources/leads.json', 'utf8'))); } catch {}
for (const u of ['https://sharktank-egypt.com/en/deals', 'https://sharktank-egypt.com/ar/deals', 'https://sharktank-egypt.com/en']) jobs.push({ id: '_show', url: u });

const out = [];
for (let i = 0; i < jobs.length; i += 6) // a few at a time: polite to the news sites
  out.push(...await Promise.all(jobs.slice(i, i + 6).map(async (j) => {
    try { const { html, url } = await get(j.url); return { ...j, final: url, text: textOf(html, 12000) }; }
    catch (e) { return { ...j, error: String(e.message ?? e) }; }
  })));
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.filter((x) => x.text).length}/${out.length} fetched for ${open.length} startups`);
