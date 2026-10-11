// llms-full.txt: the whole directory as plain text, one entry per startup, so an assistant can answer and cite from one fetch.
import { startups, dataUpdated } from '../config';
import { summary } from '../faq';
import { ROOT } from '../schema';

export function GET() {
  const entries = startups.map((x) => [
    `## ${x.name.en} (${x.name.ar})`,
    `URL: ${ROOT}en/${x.id}/ | Arabic: ${ROOT}ar/${x.id}/`,
    x.category && `Sector: ${x.category}`,
    x.founders?.length && `Founders: ${x.founders.join(', ')}`,
    `Outcome: ${x.deal?.made === true ? 'deal' : x.deal?.made === false ? 'no deal' : 'unconfirmed'}`,
    summary(x, 'en'),
    summary(x, 'ar'),
    x.description.en,
    x.sources?.length && `Sources: ${x.sources.join(' ')}`,
  ].filter(Boolean).join('\n'));
  const body = `# Shark Tank Egypt Directory: full data (updated ${dataUpdated})\n\nOne entry per startup that pitched on Shark Tank Egypt (شارك تانك مصر). Outcomes are recorded only when a public source states them; "unconfirmed" means no source has been found yet.\n\n${entries.join('\n\n')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
