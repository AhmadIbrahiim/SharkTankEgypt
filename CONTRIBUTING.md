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
  "sources": ["https://…"]
}
```

Rules:

- **Cite a source** for every fact (an article, the pitch video or the company's own page).
- Use `null` for anything you don't know. Never guess deal terms.
- **Never change an existing `id`**: comments and links are keyed to it.
- Founder information stays public and professional. No personal details.
- Photos must clearly show the right person and carry a credit.

Run `npm run check-data` before opening a pull request. CI runs it too.
