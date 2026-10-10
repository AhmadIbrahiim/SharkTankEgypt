// Validates src/data/*.json so a bad PR fails CI instead of breaking the site.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { platforms, platformOf } from '../src/platforms.mjs';

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
  if (s.website) {
    assert.equal(new URL(s.website).protocol, 'https:', `${where}: website must be https`);
    assert.ok(!platformOf(s.website), `${where}: social URL belongs in links, not website`);
  }
  if (s.about) {
    const { founded, city, highlights, ...rest } = s.about;
    assert.deepEqual(Object.keys(rest), [], `${where}: unknown about fields`);
    if (founded != null) assert.ok(Number.isInteger(founded) && founded >= 1900 && founded <= new Date().getFullYear(), `${where}: bad founded year`);
    if (city) assert.ok(city.en?.trim() && city.ar?.trim(), `${where}: city needs en and ar`);
    if (highlights) assert.ok(highlights.en?.length && highlights.en.length === highlights.ar?.length, `${where}: highlights need equal en/ar lists`);
  }
  for (const [key, url] of Object.entries(s.links ?? {})) {
    if (key === 'other') {
      for (const o of url) assert.ok(o.name?.trim() && new URL(o.url).protocol === 'https:', `${where}: bad links.other entry`);
      continue;
    }
    assert.ok(key in platforms, `${where}: unknown links key "${key}"`);
    assert.equal(new URL(url).protocol, 'https:', `${where}: links.${key} must be https`);
    assert.equal(platformOf(url), key, `${where}: links.${key} points to another site (${url})`);
  }
}
console.log(`OK: ${startups.length} startups`);
