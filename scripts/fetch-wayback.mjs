// Reads YouTube pitch-video titles and descriptions without asking YouTube: from Wayback Machine
// snapshots of the watch page, with noembed.com (title only) as a fallback. YouTube blocks CI runners.
// Usage (in Actions): node scripts/fetch-wayback.mjs <targets.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { get } from './harvest.mjs';

const targets = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const pick = (html, re) => { const m = html.match(re)?.[1]; if (!m) return undefined; try { return JSON.parse(`"${m}"`); } catch { return m; } };
const out = [];
for (const t of targets) {
  const r = { ...t };
  try {
    const a = JSON.parse((await get(`https://archive.org/wayback/available?url=youtube.com/watch?v=${t.vid}`)).html);
    const snap = a.archived_snapshots?.closest?.url;
    if (snap) {
      const { html } = await get(snap.replace(/\/(\d{14})\//, '/$1id_/')); // id_: the page as archived, no Wayback toolbar
      r.snapshot = snap;
      r.title = pick(html, /"title":"((?:[^"\\]|\\.)*)","lengthSeconds"/) ?? pick(html, /<meta name="title" content="([^"]*)"/);
      r.description = pick(html, /"shortDescription":"((?:[^"\\]|\\.)*)"/) ?? pick(html, /<meta name="description" content="([^"]*)"/);
    }
  } catch (e) { r.waybackError = String(e.message ?? e); }
  if (!r.title) try { r.title = JSON.parse((await get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${t.vid}`)).html).title; } catch {}
  out.push(r);
  await new Promise((ok) => setTimeout(ok, 800)); // archive.org rate-limits bursts
}
writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
console.log(`${out.filter((r) => r.description).length} descriptions, ${out.filter((r) => r.title).length} titles of ${out.length}`);
