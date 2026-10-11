// The full dataset as JSON, with each startup's page URLs, for researchers and AI tools to cite.
import { startups, dataUpdated } from '../../config';
import { ROOT } from '../../schema';

export function GET() {
  const items = startups.map((x) => ({ ...x, url: { en: `${ROOT}en/${x.id}/`, ar: `${ROOT}ar/${x.id}/` } }));
  return new Response(JSON.stringify({ name: 'Shark Tank Egypt Directory', updated: dataUpdated, license: 'CC BY 4.0', source: ROOT, count: items.length, startups: items }, null, 1),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
