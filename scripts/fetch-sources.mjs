// Downloads the text of the news articles cited for startups whose pitch outcome is unknown,
// plus the show's deal pages, so outcomes can be read from the articles themselves.
// Runs in GitHub Actions (open internet). Usage: node scripts/fetch-sources.mjs <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { get, youtube } from './harvest.mjs';
import { textOf } from './enrich.mjs';

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const SOCIAL = /youtube|youtu\.be|instagram|facebook|tiktok|linkedin|twitter|x\.com/;
// Unknown outcomes, plus deals recorded without the shark's name.
const open = startups.filter((x) => !x.deal || x.deal.made == null || (x.deal.made && !x.deal.sharks?.length));
// --leads: only the hand-picked leads (fast); default: every source of every open startup too.
const leadsOnly = process.argv.includes('--leads');
const jobs = leadsOnly ? [] : open.flatMap((x) => x.sources.filter((u) => !SOCIAL.test(u)).map((url) => ({ id: x.id, url })));
// leads.json: extra articles found by search, read in full here because snippets cut off
try { jobs.push(...JSON.parse(readFileSync('automation/sources/leads.json', 'utf8'))); } catch {}
if (!leadsOnly) for (const u of ['https://sharktank-egypt.com/en/deals', 'https://sharktank-egypt.com/ar/deals', 'https://sharktank-egypt.com/en']) jobs.push({ id: '_show', url: u });

const out = [];
for (let i = 0; i < jobs.length; i += 6) // a few at a time: polite to the news sites
  out.push(...await Promise.all(jobs.slice(i, i + 6).map(async (j) => {
    // A hard cap per page: a site that never finishes sending must not stall the whole job.
    const cap = new Promise((_, no) => setTimeout(() => no(new Error('timeout 30s')), 30000));
    try { const { html, url } = await Promise.race([get(j.url), cap]); return { ...j, final: url, text: textOf(html, 12000) }; }
    catch (e) { return { ...j, error: String(e.message ?? e) }; }
  })));
// YouTube titles and descriptions of the pitch videos often name the shark and the outcome.
// One at a time with a pause: YouTube answers 429 to bursts. oEmbed (title only) is the fallback.
const ytId = (u) => u.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/)?.[1];
const vids = [...new Map(open.flatMap((x) => [x.video, ...x.sources.map(ytId)].filter(Boolean).map((v) => [v, x.id]))).entries()];
for (const [v, id] of leadsOnly ? [] : vids) {
  const url = `https://www.youtube.com/watch?v=${v}`;
  try { const r = await youtube(v); out.push({ id, url, text: `${r.title ?? ''}\n${r.description ?? ''}`, channel: r.channel }); }
  catch (e) {
    try { const { html } = await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`); const j = JSON.parse(html); out.push({ id, url, text: j.title, channel: j.author_name, oembed: true }); }
    catch (e2) { out.push({ id, url, error: String(e.message ?? e) }); }
  }
  await new Promise((r) => setTimeout(r, 1500));
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(`${out.filter((x) => x.text).length}/${out.length} fetched for ${open.length} startups`);
process.exit(0); // don't wait on sockets left open by timed-out pages
