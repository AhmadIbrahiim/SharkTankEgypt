// Data-quality audit: finds contradictions, duplicates, outliers and gaps in src/data, and writes DATA_QUALITY_REPORT.md.
// Read-only on the data. Usage: node scripts/audit-data.mjs [--strict]  (--strict exits 1 on any contradiction)
import { readFileSync, writeFileSync } from 'node:fs';

const S = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const seasons = JSON.parse(readFileSync('src/data/seasons.json', 'utf8'));
const lineup = new Map(seasons.map((s) => [s.season, new Set(s.sharks)]));
const issues = []; // { level: 'contradiction' | 'warning' | 'gap', id, msg }
const add = (level, id, msg) => issues.push({ level, id, msg });

// Text that claims an outcome. Checked against the deal field so prose and data can't disagree.
const NO_DEAL = /\b(no deal|without (a|any) (deal|agreement)|left empty[- ]handed|walked away without|didn'?t (get|land|secure) a deal|no investment)\b|(دون|بدون|من غير) (صفقة|ديل|استثمار|اتفاق)|لم (يحصل|تحصل|يحصلوا|يتمكن|تتمكن)[^.،]{0,30}صفقة/i;
const DEAL = /\b(closed|secured|landed|won|accepted|struck|sealed|got|walked away with) (a |an |the )?(deal|investment|offer)\b|\bdeal with (?!no)|(?<!لم ت?)(?<!لم ي)(حصل|حصلت|حصلوا|أغلق|أغلقت|قبلت|قبلوا|خرج|خرجت|خرجوا)[^.،]{0,25}(صفقة|استثمار من الشاركس|عرض)/i;
const REPORTED = /\breported (deal|investment)\b|صفقة متداولة/i;
const texts = (x) => [x.description?.en, x.description?.ar, x.pitch?.en, x.pitch?.ar, ...(x.about?.highlights?.en ?? []), ...(x.about?.highlights?.ar ?? [])].filter(Boolean);

const norm = (t) => (t ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9؀-ۿ]/g, '');
const dupe = (key, label) => {
  const m = new Map();
  for (const x of S) { const k = key(x); if (k) (m.get(k) ?? m.set(k, []).get(k)).push(x.id); }
  for (const [k, ids] of m) if (ids.length > 1) add('warning', ids.join(', '), `same ${label} (${k})`);
};

for (const x of S) {
  const d = x.deal, made = d?.made;
  const all = texts(x).join(' \n ');
  // 1. Prose vs data
  if (made === true && NO_DEAL.test(all)) add('contradiction', x.id, `deal recorded, but text says no deal: "${all.match(NO_DEAL)[0]}"`);
  if (made === false && DEAL.test(all) && !NO_DEAL.test(all)) add('contradiction', x.id, `no deal recorded, but text suggests a deal: "${all.match(DEAL)[0]}"`);
  if (made == null && NO_DEAL.test(all)) add('contradiction', x.id, `outcome unknown, but text says no deal: "${all.match(NO_DEAL)[0]}"`);
  if (made == null && DEAL.test(all)) add('warning', x.id, `outcome unknown, but text may describe a deal: "${all.match(DEAL)[0]}"`);
  if (REPORTED.test(all)) add('warning', x.id, `text calls the deal "reported": "${all.match(REPORTED)[0]}"`);
  // 2. Deal fields
  if (made === false && (d.sharks?.length || d.amountEGP != null || d.equityPct != null)) add('contradiction', x.id, 'no deal, but sharks/amount/equity are set');
  if (made === true) {
    for (const k of d.sharks ?? []) if (!lineup.get(x.season)?.has(k)) add('contradiction', x.id, `shark "${k}" is not on the Season ${x.season} lineup`);
    if (!d.sharks?.length) add('gap', x.id, 'deal without named sharks');
    if (d.amountEGP == null && d.equityPct == null) add('gap', x.id, 'deal without terms');
  }
  // 3. Numbers
  for (const [label, amt, eq] of [['ask', x.ask?.amountEGP, x.ask?.equityPct], ['deal', d?.amountEGP, d?.equityPct]]) {
    if (amt != null && !(amt > 0)) add('contradiction', x.id, `${label} amount must be > 0 (${amt})`);
    if (eq != null && !(eq > 0 && eq <= 100)) add('contradiction', x.id, `${label} equity must be in (0, 100] (${eq})`);
    if (amt != null && eq != null && amt / (eq / 100) > 5e9) add('warning', x.id, `${label} implies a valuation over EGP 5B (${Math.round(amt / (eq / 100) / 1e6)}M); check the figures`);
    if (amt != null && amt < 10000) add('warning', x.id, `${label} amount looks too small (${amt}); check units`);
  }
  // 4. Names and placement
  if (/[؀-ۿ]/.test(x.name.en)) add('warning', x.id, 'English name contains Arabic script');
  if (!/[؀-ۿ]/.test(x.name.ar)) add('warning', x.id, 'Arabic name has no Arabic script');
  if (!lineup.has(x.season)) add('contradiction', x.id, `season ${x.season} not in seasons.json`);
  // 5. Gaps
  if (made == null) add('gap', x.id, 'outcome unknown');
  if (x.episode == null) add('gap', x.id, 'episode unknown');
  if (!x.founders?.length) add('gap', x.id, 'founders unknown');
  if (x.ask?.amountEGP == null) add('gap', x.id, 'ask amount unknown');
  if (!x.sources?.length) add('warning', x.id, 'no sources');
}
// A sourceless record that shares an episode and sector with a sourced one is likely a duplicate or a phantom.
for (const x of S.filter((y) => !y.sources?.length && y.episode != null))
  for (const o of S.filter((y) => y !== x && y.season === x.season && y.episode === x.episode && y.category === x.category && y.sources?.length))
    add('warning', x.id, `no source, and shares Season ${x.season} Episode ${x.episode} and sector "${x.category}" with \`${o.id}\`: possible duplicate or phantom record`);
dupe((x) => norm(x.name.en), 'English name');
dupe((x) => norm(x.name.ar), 'Arabic name');
dupe((x) => x.video, 'pitch video');
dupe((x) => x.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), 'website');

// Aggregates, computed the same way the site does (src/config.ts stats): disclosed = deals with an amount.
const deals = S.filter((x) => x.deal?.made);
const withAmt = deals.filter((x) => x.deal.amountEGP != null);
const sum = withAmt.reduce((a, x) => a + x.deal.amountEGP, 0);
const verif = (x) => !x.sources?.length ? 'unverified'
  : x.deal?.made === false || (x.deal?.made && x.deal.sharks?.length && (x.deal.amountEGP != null || x.deal.equityPct != null)) ? 'verified' : 'partially_verified'; // keep in sync with src/config.ts
const vcount = S.reduce((m, x) => ({ ...m, [verif(x)]: (m[verif(x)] ?? 0) + 1 }), {});
const count = (lvl) => issues.filter((i) => i.level === lvl).length;
const byLevel = (lvl) => issues.filter((i) => i.level === lvl);
const gapsByType = Object.entries(byLevel('gap').reduce((m, i) => ({ ...m, [i.msg]: (m[i.msg] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

const md = `# Data quality report

Generated by \`node scripts/audit-data.mjs\` from \`src/data/\` on ${new Date().toISOString().slice(0, 10)}. Re-run it after any data change; CI runs it with \`--strict\`, which fails on contradictions.

## Summary

| Measure | Value |
|---|---|
| Startups | ${S.length} |
| Outcome: deal / no deal / unknown | ${deals.length} / ${S.filter((x) => x.deal?.made === false).length} / ${S.filter((x) => x.deal?.made == null).length} |
| Deals with named sharks | ${deals.filter((x) => x.deal.sharks?.length).length} of ${deals.length} |
| Deals with a disclosed amount | ${withAmt.length} of ${deals.length} |
| Disclosed on-air investment (sum of deal amounts) | EGP ${(sum / 1e6).toFixed(1)}M |
| Verification: verified / partially verified / unverified | ${vcount.verified ?? 0} / ${vcount.partially_verified ?? 0} / ${vcount.unverified ?? 0} |
| Records with at least one source | ${S.filter((x) => x.sources?.length).length} of ${S.length} |
| **Contradictions** (must be 0) | **${count('contradiction')}** |
| Warnings (review) | ${count('warning')} |
| Gaps (missing data, never filled by guessing) | ${count('gap')} |

## How the headline numbers are calculated

- **Deals**: records with \`deal.made === true\`. A deal is recorded only when a public source states it (see \`automation/deal-audit-2026-10.md\`). These are **on-air agreements**: whether the investment later closed legally is not tracked, because almost no source reports it.
- **Disclosed investment**: the sum of \`deal.amountEGP\` over deals that have an amount (${withAmt.length} of ${deals.length}). Deals without disclosed terms add nothing; the figure is a floor, not a total.
- **Valuation**: \`amount / (equity / 100)\` (post-money), shown only when both are known.
- **Unknown** outcomes are excluded from every rate and sum; they are never counted as "no deal".

## Contradictions

${byLevel('contradiction').map((i) => `- \`${i.id}\`: ${i.msg}`).join('\n') || 'None.'}

## Warnings

${byLevel('warning').map((i) => `- \`${i.id}\`: ${i.msg}`).join('\n') || 'None.'}

## Gaps by type

| Gap | Records |
|---|---|
${gapsByType.map(([m, n]) => `| ${m} | ${n} |`).join('\n')}

Records with an unknown outcome: ${byLevel('gap').filter((i) => i.msg === 'outcome unknown').map((i) => `\`${i.id}\``).join(', ')}.
`;
writeFileSync('DATA_QUALITY_REPORT.md', md);
console.log(`audit: ${count('contradiction')} contradictions, ${count('warning')} warnings, ${count('gap')} gaps`);
if (process.argv.includes('--strict') && count('contradiction')) process.exit(1);
