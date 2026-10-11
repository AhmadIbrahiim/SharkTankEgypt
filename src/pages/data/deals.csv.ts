// One row per startup: pitch, ask and outcome. Opens in any spreadsheet.
import { startups, verification } from '../../config';
import { ROOT } from '../../schema';

const cell = (v: unknown) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
export function GET() {
  const head = ['id', 'name_en', 'name_ar', 'season', 'episode', 'category', 'founders', 'ask_egp', 'ask_pct', 'outcome', 'sharks', 'deal_egp', 'deal_pct', 'verification', 'checked', 'sources', 'url'];
  const rows = startups.map((x) => [x.id, x.name.en, x.name.ar, x.season, x.episode, x.category, x.founders?.join('; '), x.ask?.amountEGP, x.ask?.equityPct,
    x.deal?.made === true ? 'deal' : x.deal?.made === false ? 'no deal' : 'unconfirmed', x.deal?.sharks?.join('; '), x.deal?.amountEGP, x.deal?.equityPct, verification(x), x.checked, x.sources?.join(' '), `${ROOT}en/${x.id}/`]);
  return new Response('﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
