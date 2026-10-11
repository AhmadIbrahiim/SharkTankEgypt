// Unit tests for shared logic (node scripts/test.mjs). Data and SEO checks live in check-data / audit-data / audit-seo.
import assert from 'node:assert/strict';
import { norm, matches } from '../src/search.mjs';

// Arabic normalisation: hamza forms, taa marbuta, alef maqsura, diacritics, tatweel, Arabic-Indic digits.
assert.equal(norm('أحمد'), norm('احمد'));
assert.equal(norm('إيمان'), norm('ايمان'));
assert.equal(norm('شارك تانك مصرٌ'), 'شارك تانك مصر');
assert.equal(norm('قهوة'), norm('قهوه'));
assert.equal(norm('مستشفى'), norm('مستشفي'));
assert.equal(norm('ســـمـيـة'), 'سميه');
assert.equal(norm('الموسم ٤'), 'الموسم 4');
assert.equal(norm('Picolé'), 'picole');
const text = norm('Bar & Jar بار أند جار Food طعام Norhan Abaza نورهان أباظة Ahmed El Sewedy أحمد السويدي');
// Partial and multi-word, any order, either language.
assert.ok(matches(text, 'bar jar'));
assert.ok(matches(text, 'jar bar'));
assert.ok(matches(text, 'اباظه'));
assert.ok(matches(text, 'احمد السويدي'));
assert.ok(matches(text, 'sewedy food'));
assert.ok(matches(text, ''));
// One typo in a longer word is tolerated; unrelated words are not.
assert.ok(matches(text, 'norhn'));
assert.ok(matches(text, 'sewedi'));
assert.ok(!matches(text, 'jazz'));
assert.ok(!matches(text, 'bar pizza'));
assert.ok(!matches(text, 'xyzzy'));
console.log('tests: ok');
