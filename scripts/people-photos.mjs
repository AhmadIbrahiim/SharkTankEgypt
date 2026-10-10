// Collects candidate portrait images for sharks: the og:image of each page cited for them.
// Runs in Actions; downloads go to a review branch so a human/agent picks the right face before
// anything is published. Usage: node scripts/people-photos.mjs <outDir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { get, meta } from './harvest.mjs';

const out = process.argv[2] ?? 'photos';
mkdirSync(out, { recursive: true });
const people = JSON.parse(readFileSync('src/data/people.json', 'utf8')).filter((p) => p.kind === 'shark' && !p.photo);
const index = {};
for (const p of people) {
  const pages = [...new Set([...Object.values(p.links ?? {}), ...(p.sources ?? [])])];
  index[p.id] = [];
  for (const page of pages) {
    try {
      const { html, url } = await get(page);
      const img = meta(html, 'og:image') ?? meta(html, 'twitter:image');
      if (!img) continue;
      const src = new URL(img, url).href;
      const res = await fetch(src, { signal: AbortSignal.timeout(20000) });
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || !type.startsWith('image/')) continue;
      const file = `${p.id}-${index[p.id].length + 1}.${type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'}`;
      writeFileSync(`${out}/${file}`, Buffer.from(await res.arrayBuffer()));
      index[p.id].push({ file, src, page });
      console.log('✓', p.id, file, page);
    } catch (e) { console.log('✗', p.id, page, e.message); }
  }
}
writeFileSync(`${out}/index.json`, JSON.stringify(index, null, 1));
