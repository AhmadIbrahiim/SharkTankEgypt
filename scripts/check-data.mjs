// Validates src/data/*.json so a bad PR fails CI instead of breaking the site.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const startups = JSON.parse(readFileSync('src/data/startups.json', 'utf8'));
const seasons = new Set(JSON.parse(readFileSync('src/data/seasons.json', 'utf8')).map((s) => s.season));
const ids = new Set();
for (const s of startups) {
  const where = `startup "${s.id}"`;
  assert.match(s.id ?? '', /^[a-z0-9]+(-[a-z0-9]+)*$/, `${where}: id must be kebab-case`);
  assert.ok(!ids.has(s.id), `${where}: duplicate id`);
  ids.add(s.id);
  assert.ok(seasons.has(s.season), `${where}: season ${s.season} missing from seasons.json`);
  assert.ok(s.episode === null || Number.isInteger(s.episode), `${where}: episode must be integer or null`);
  for (const f of ['name', 'description']) for (const l of ['en', 'ar']) assert.ok(s[f]?.[l]?.trim(), `${where}: ${f}.${l} is empty`);
  if (s.video) assert.match(s.video, /^[A-Za-z0-9_-]{11}$/, `${where}: video must be a YouTube id`);
  if (s.website) assert.ok(new URL(s.website).protocol.startsWith('http'), `${where}: bad website`);
}
console.log(`OK: ${startups.length} startups`);
