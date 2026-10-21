// Validates src/data/*.json so a bad PR fails CI instead of breaking the site.
import { readFileSync, existsSync } from 'node:fs';
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
  assert.match(s.checked ?? '', /^\d{4}-\d{2}-\d{2}$/, `${where}: checked must be the YYYY-MM-DD date the outcome/sources were last reviewed`);
  // "Where are they now": dated, sourced updates only.
  for (const u of s.updates ?? []) {
    assert.match(u.date ?? '', /^\d{4}(-\d{2}(-\d{2})?)?$/, `${where}: update date must be YYYY, YYYY-MM or YYYY-MM-DD`);
    assert.ok(u.en?.trim() && u.ar?.trim(), `${where}: update needs en and ar text`);
    assert.equal(new URL(u.source).protocol, 'https:', `${where}: update needs an https source`);
  }
  if (s.video) assert.match(s.video, /^[A-Za-z0-9_-]{11}$/, `${where}: video must be a YouTube id`);
  if (s.website) {
    assert.equal(new URL(s.website).protocol, 'https:', `${where}: website must be https`);
    assert.ok(!platformOf(s.website), `${where}: social URL belongs in links, not website`);
  }
  if (s.pitch) for (const l of ['en', 'ar']) assert.ok(s.pitch[l]?.trim(), `${where}: pitch.${l} is empty`);
  if (s.services) {
    assert.ok(s.services.en?.length && s.services.en.length === s.services.ar?.length, `${where}: services need equal en/ar lists`);
    for (const it of [...s.services.en, ...s.services.ar]) assert.ok(it.name?.trim() && it.desc?.trim(), `${where}: service needs name and desc`);
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
// Announced businesses have profiles, but investment terms require a verified broadcast.
const previews = JSON.parse(readFileSync('src/data/episode-previews.json', 'utf8'));
const previewKeys = new Set();
for (const p of previews) {
  const key = `${p.season}/${p.episode}`;
  assert.ok(seasons.has(p.season) && Number.isInteger(p.episode) && p.episode > 0, `preview ${key}: invalid episode`);
  assert.ok(!previewKeys.has(key), `preview ${key}: duplicate episode`);
  previewKeys.add(key);
  assert.match(p.scheduledAt ?? '', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  assert.ok(Number.isFinite(Date.parse(p.scheduledAt)), `preview ${key}: invalid broadcast date`);
  assert.match(p.checked ?? '', /^\d{4}-\d{2}-\d{2}$/);
  for (const url of [p.announcement, p.scheduleSource]) assert.equal(new URL(url).protocol, 'https:');
  assert.ok(p.startups?.length, `preview ${key}: missing lineup`);
  for (const lang of ['en', 'ar']) assert.ok(p.scheduleNote?.[lang]?.trim());
  for (const x of p.startups) {
    assert.match(x.id ?? '', /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(p.startups.filter((s) => s.id === x.id).length, 1, `preview ${key}: duplicate startup ${x.id}`);
    const profile = startups.find((s) => s.id === x.id);
    assert.ok(profile?.appearanceStatus === 'announced' && profile.season === p.season && profile.episode === p.episode, `preview ${key}: missing announced profile ${x.id}`);
    for (const field of ['name', 'description']) for (const lang of ['en', 'ar']) assert.ok(x[field]?.[lang]?.trim());
    for (const url of [x.url, x.source]) assert.equal(new URL(url).protocol, 'https:');
    assert.ok(!('deal' in x) && !('ask' in x), `preview ${key}: unbroadcast pitches cannot have investment terms`);
  }
}
for (const s of startups) {
  assert.ok(s.appearanceStatus == null || s.appearanceStatus === 'announced', `${s.id}: unknown appearance status`);
  if (s.appearanceStatus !== 'announced') continue;
  assert.ok(previews.some((p) => p.season === s.season && p.episode === s.episode && p.startups.some((x) => x.id === s.id)), `${s.id}: missing announcement`);
  assert.ok(s.deal === null && s.ask?.amountEGP === null && s.ask?.equityPct === null && !s.video, `${s.id}: announced profiles cannot have unverified pitch terms or video`);
}
// People: profiles for sharks and founders.
const people = JSON.parse(readFileSync('src/data/people.json', 'utf8'));
const pids = new Set();
for (const p of people) {
  const where = `person "${p.kind}:${p.id}"`;
  assert.ok(['shark', 'founder'].includes(p.kind), `${where}: kind must be shark or founder`);
  assert.match(p.id ?? '', /^[a-z0-9]+(-[a-z0-9]+)*$/, `${where}: id must be kebab-case`);
  assert.ok(!pids.has(`${p.kind}:${p.id}`), `${where}: duplicate`);
  pids.add(`${p.kind}:${p.id}`);
  for (const f of ['name', 'title', 'bio']) if (p[f]) for (const l of ['en', 'ar']) assert.ok(p[f][l]?.trim(), `${where}: ${f}.${l} is empty`);
  assert.ok(p.name, `${where}: name required`);
  for (const [k, u] of Object.entries(p.links ?? {})) {
    assert.equal(new URL(u).protocol, 'https:', `${where}: links.${k} must be https`);
    if (k in platforms) assert.equal(platformOf(u), k, `${where}: links.${k} points to another site`);
  }
  if (p.photo) assert.ok(p.photo.url.startsWith('/people/') ? existsSync(`public${p.photo.url}`) : new URL(p.photo.url).protocol === 'https:', `${where}: photo must be https or an existing /people/ file`);
  for (const source of p.sources ?? []) assert.equal(new URL(source).protocol, 'https:', `${where}: source must be https`);
  for (const company of p.companies ?? []) if (company.url) assert.equal(new URL(company.url).protocol, 'https:', `${where}: company URL must be https`);
}
// Every person shown on the site needs an Arabic name (bilingual search).
const namesAr = JSON.parse(readFileSync('src/data/names.json', 'utf8'));
const arByEn = new Map(people.map((p) => [p.name.en, p.name.ar]));
for (const s of startups) for (const n of s.founders ?? []) {
  const ar = namesAr[n] ?? arByEn.get(n);
  assert.ok(ar && /[\u0600-\u06FF]/.test(ar), `founder "${n}" (${s.id}) needs an Arabic name in src/data/names.json`);
}
console.log(`OK: ${startups.length} startups, ${people.length} people`);
