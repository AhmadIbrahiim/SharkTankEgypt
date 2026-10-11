// Search matching shared by the build (index text) and the browser (query), so both normalise the same way.

/** Lower-case, strip Arabic diacritics/tatweel and Latin accents, unify common Arabic letter variants, Arabic-Indic digits to 0-9. */
export const norm = (s) => (s ?? '').toLowerCase().normalize('NFKD')
  .replace(/[̀-ًͯ-ٰٟـ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** True when a and b differ by at most one insertion, deletion or substitution. */
const near = (a, b) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};

/** Every query word must appear in the (normalised) text, as a substring or, for words of 5+ letters, within one typo of a word. */
export const matches = (text, query) => {
  const words = norm(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  let tokens;
  return words.every((w) => text.includes(w) || (w.length >= 5 && (tokens ??= text.split(' ')).some((t) => near(t, w) || (t.length > w.length && near(t.slice(0, w.length + 1), w)))));
};
