// Drafts richer startup profiles with GitHub Models (free for public repos), grounded ONLY in text
// fetched from each startup's own website, pitch video and Facebook page. Output goes to a review
// branch, never straight to the site.
// Usage (in Actions): GITHUB_TOKEN=… node scripts/enrich.mjs out.json   ·   node scripts/enrich.mjs --test
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { get, youtube, social } from './harvest.mjs';

const MODEL = process.env.MODEL ?? 'openai/gpt-4.1-mini';
const LIMIT = +(process.env.LIMIT ?? 140); // free tier allows ~150 requests/day for this model class

import { textOf } from './harvest.mjs';
export { textOf };

if (process.argv.includes('--test')) {
  const t = textOf('<html><style>x{}</style><h1>Brand</h1><script>evil()</script><p>We sell&nbsp;honey.</p></html>');
  assert.equal(t, 'Brand\n We sell honey.');
  console.log('enrich self-test ok');
  process.exit(0);
}

const SYSTEM = `You write profiles for a bilingual (English/Arabic) directory of Egyptian startups that pitched on Shark Tank Egypt.
Use ONLY facts stated in the SOURCES and CURRENT RECORD given to you. Never use outside knowledge, never guess numbers, names or dates.
If the sources don't support a field, omit it. Write clear, warm English and natural Modern Standard Arabic (not word-for-word translation).
Reply with a single JSON object:
{
  "description": {"en": "3–5 sentences: what it is, problem/audience, how it works, traction", "ar": "…"},
  "services": {"en": [{"name": "≤40 chars", "desc": "one sentence ≤140 chars"}], "ar": [same items in Arabic]},
  "pitch": {"en": "2–4 sentences on the Shark Tank pitch (ask, reactions, outcome) — only if sources/record describe it", "ar": "…"},
  "highlights": {"en": ["3–5 bullets ≤90 chars"], "ar": [same count]},
  "founded": 2019, "city": {"en": "Cairo", "ar": "القاهرة"},
  "foundersAr": {"<English founder name from the record>": "<Arabic spelling as Egyptians write it>"}
}`;

// GitHub Models endpoints: current one first, the original Azure-hosted one as fallback.
const ENDPOINTS = [
  { url: 'https://models.github.ai/inference/chat/completions', model: MODEL },
  { url: 'https://models.inference.ai.azure.com/chat/completions', model: MODEL.replace(/^openai\//, '') },
];
let working = null; // remembered after the first endpoint that answers properly

async function call(ep, user) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(ep.url, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ model: ep.model, temperature: 0.2, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }),
    });
    if (res.status === 429) { await new Promise((r) => setTimeout(r, (+(res.headers.get('retry-after') ?? 60)) * 1000)); continue; }
    const raw = await res.text();
    if (!res.ok) throw new Error(`${ep.url} HTTP ${res.status}: ${raw.slice(0, 200)}`);
    let content;
    try { content = JSON.parse(raw).choices[0].message.content; } catch { throw new Error(`${ep.url} unexpected reply (${res.headers.get('content-type')}): ${raw.slice(0, 120)}`); }
    // Some models wrap JSON in a code fence.
    try { return JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { throw new Error(`model content not JSON: ${content.slice(0, 200)}`); }
  }
  throw new Error('rate limited');
}

async function ask(user) {
  if (working) return call(working, user);
  const errors = [];
  for (const ep of ENDPOINTS) {
    try { const r = await call(ep, user); working = ep; console.log('  using', ep.url, ep.model); return r; } catch (e) { errors.push(e.message); }
  }
  throw new Error(errors.join(' | '));
}

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
// Thinnest profiles first, so a rate-limited run spends its quota where it matters most.
const score = (x) => (x.services ? 4 : 0) + (x.about?.highlights ? 2 : 0) + (x.description.en.length > 300 ? 1 : 0);
const queue = [...startups].sort((a, b) => score(a) - score(b)).slice(0, LIMIT);
const out = {};
for (const s of queue) {
  const sources = [];
  const safe = async (label, fn) => { try { const t = await fn(); if (t) sources.push(`[${label}]\n${t}`); } catch (e) { console.log('  ', s.id, label, 'failed:', e.message); } };
  if (s.website) await safe('website', async () => textOf((await get(s.website)).html));
  if (s.video) await safe('pitch video', async () => { const v = await youtube(s.video); return [v.title, v.description].filter(Boolean).join('\n'); });
  if (s.links?.facebook) await safe('facebook', async () => { const f = await social(s.links.facebook); return [f.title, f.description].filter(Boolean).join('\n'); });
  if (!sources.length) { console.log('·', s.id, 'no sources'); continue; }
  const record = { name: s.name, category: s.category, season: s.season, founders: s.founders, description: s.description.en, ask: s.ask, deal: s.deal };
  try {
    out[s.id] = { ...(await ask(`CURRENT RECORD:\n${JSON.stringify(record)}\n\nSOURCES:\n${sources.join('\n\n')}`)), sourcesUsed: sources.map((x) => x.split('\n')[0]) };
    console.log('✓', s.id);
  } catch (e) { console.log('✗', s.id, e.message); }
  await new Promise((r) => setTimeout(r, 4500)); // stay under ~15 requests/minute
}
writeFileSync(process.argv[2] ?? 'enrich.json', JSON.stringify(out, null, 1));
console.log(`done: ${Object.keys(out).length} drafted`);
