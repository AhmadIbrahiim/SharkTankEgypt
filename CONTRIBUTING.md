# Contributing · المساهمة

Thanks for helping keep the directory accurate! · شكراً لمساعدتك في تحديث الدليل!

## No code: use the form

Open **[Add or fix a startup](https://github.com/AhmadIbrahiim/SharkTankEgypt/issues/new?template=new-startup.yml)** and fill in what you know. Every startup page also has an **"Add info"** button that pre-fills the form for that startup.

## Editing the data

All content lives in `src/data/`:

| File | What it holds |
|---|---|
| `startups.json` | One entry per pitch: names (EN/AR), description, season and episode, founders, website and socials, ask, deal, services, pitch summary, sources |
| `people.json` | Shark and founder profiles: bio, photo (with credit), links, sources |
| `seasons.json` | Each season's year, channel and line-up of sharks |
| `names.json` | Arabic spellings of founder names |
| `episode-previews.json` | Officially announced episode lineups and broadcast schedules, shown before their pitches are verified |

A startup entry looks like this:

```json
{
  "id": "kebab-case-slug",
  "season": 1, "episode": 3,
  "name": { "en": "…", "ar": "…" },
  "description": { "en": "…", "ar": "…" },
  "category": "Food", "founders": ["…"],
  "website": "https://…",
  "links": { "instagram": "https://…" },
  "ask":  { "amountEGP": 2000000, "equityPct": 10 },
  "deal": { "made": true, "sharks": ["…"], "amountEGP": 2000000, "equityPct": 20 },
  "sources": ["https://…"],
  "checked": "2026-10-11",
  "updates": [{ "date": "2026-09", "en": "Raised a seed round led by …", "ar": "…", "source": "https://…" }]
}
```

Rules:

- **Cite a source** for every fact (an article, the pitch video or the company's own page).
- Use `null` for anything you don't know. Never guess deal terms.
- `deal.made`: `true` only when a source states a deal was agreed on air, `false` only when a source states there was none, `null` otherwise. The pitch text must not claim an outcome the `deal` field doesn't record (`npm run audit-data` checks this).
- `checked`: the date you last reviewed the record's outcome and sources. Bump it whenever you change them.
- `updates` ("Where are they now?") is optional: dated milestones after the show (funding, expansion, closure), each with its own source. Leave it out rather than add an unsourced claim.
- Sharks in `deal.sharks` must be on that season's lineup in `seasons.json`.
- **Never change an existing `id`**: comments and links are keyed to it.
- Announced businesses have full `startups.json` profiles with `appearanceStatus: "announced"`, null asks/deals and an entry in `episode-previews.json`. They count as directory profiles; their investment terms stay blank. Keep official business, announcement and schedule sources. After verifying the broadcast, remove the appearance status and episode preview when recording the aired pitches. A scheduled date passing does not itself verify a broadcast or outcome.
- Founder information stays public and professional. No personal details.
- Photos must clearly show the right person and carry a credit.

Before opening a pull request run:

```sh
npm run check-data   # schema and required fields
npm run audit-data   # contradictions, impossible figures, duplicates; writes DATA_QUALITY_REPORT.md
npm test             # search normalisation
npm run build && npm run audit-seo && npm run e2e   # links, metadata, and the site in a real browser
```

CI runs all of them on every push to `main`; a failure stops the deploy.

Verification shown on each startup page is derived, not typed: **verified** = sourced outcome (and, for a deal, its sharks and terms); **partially verified** = sourced but something is missing or the outcome is unknown; **unverified** = no source.
