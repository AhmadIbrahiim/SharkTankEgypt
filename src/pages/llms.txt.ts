// llms.txt (llmstxt.org): a plain-text map of the site for AI assistants and crawlers.
import { startups, sharks, seasons, dataUpdated, seasonLabel } from '../config';
import { ROOT } from '../schema';

export function GET() {
  const deals = startups.filter((x) => x.deal?.made).length;
  const unknown = startups.filter((x) => x.deal?.made == null).length;
  const body = `# Shark Tank Egypt Directory (دليل شارك تانك مصر)

> An open, sourced directory of every startup that pitched on Shark Tank Egypt (شارك تانك مصر): the ask, whether a deal closed, which sharks invested and on what terms. Bilingual (Arabic and English). ${startups.length} startups, ${deals} recorded deals, ${seasons.length} seasons including the specials. Data updated ${dataUpdated}.

Every outcome is recorded only when a public source states it (news articles, the show's official clips and captions); ${unknown} outcomes are still unconfirmed and are labelled as such, never guessed. Sources are listed on each startup page and in the audit log on GitHub.

## Data
- [All deals table](${ROOT}en/deals/): every recorded deal with sharks and terms, plus totals per season and per shark
- [Full text digest](${ROOT}llms-full.txt): one line per startup with ask, outcome, sharks and sources
- [startups.json](${ROOT}data/startups.json): the complete dataset (JSON)
- [deals.csv](${ROOT}data/deals.csv): one row per startup (CSV)
- [Source code and audit log](https://github.com/AhmadIbrahiim/SharkTankEgypt)

## Main pages (English, under /en/; Arabic is the default, at the same paths without /en/)
- [All startups](${ROOT}en/)
- [Sharks](${ROOT}en/sharks/): each shark's deals, sectors and seasons
- [Founders](${ROOT}en/founders/)
- [FAQ](${ROOT}en/faq/)
${seasons.map((s) => `- [${seasonLabel(s.season, 'en')}](${ROOT}en/season/${s.season}/)`).join('\n')}

## Sharks
${sharks.map((p) => `- [${p.name.en} (${p.name.ar})](${ROOT}en/sharks/${p.id}/): ${p.deals.length} deals`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
