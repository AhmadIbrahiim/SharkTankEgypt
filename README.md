# 🦈 Shark Tank Egypt Directory · دليل شارك تانك مصر

A bilingual (Arabic / English) directory of every startup that pitched on Shark Tank Egypt, across all seasons and episodes, with descriptions, websites, screenshots, deal details, ratings and comments. It runs entirely on GitHub.

**Live:** https://ahmadibrahiim.github.io/SharkTankEgypt/

| Piece | How it runs on GitHub |
|---|---|
| Site | [Astro](https://astro.build) static build → GitHub Pages (`.github/workflows/deploy.yml`) |
| Data | `src/data/startups.json` + `src/data/seasons.json`, validated by `npm run check-data` in CI |
| Screenshots | Playwright in GitHub Actions (`.github/workflows/screenshots.yml`): weekly, on data changes, or manually |
| Rating & comments | [Giscus](https://giscus.app), with one GitHub Discussion per startup. Reactions 👍 ❤️ 🚀 serve as the rating |

## One-time setup

1. **Settings → Pages → Source:** choose **GitHub Actions**.
2. **Settings → General → Features:** enable **Discussions**, then create a discussion category named `Startups` (type: *Announcement*, so only giscus/maintainers create threads).
3. Install the [giscus app](https://github.com/apps/giscus) on this repo.
4. Go to https://giscus.app, enter `AhmadIbrahiim/SharkTankEgypt` and the `Startups` category, then copy `data-repo-id` and `data-category-id` into `giscus` in `src/config.ts`. Comments stay hidden until both are set.
5. **Actions → Refresh screenshots → Run workflow** to capture the first batch.

## SEO (Google, Arabic + English)

Built in: separate `/ar/` and `/en/` URLs per startup with `hreflang` + canonical tags, page titles that contain both the Arabic and English names, Open Graph tags (the screenshot is the share image), schema.org JSON-LD (`Organization` per startup, `ItemList` on the directory), and `sitemap.xml` with language alternates.

To get indexed:
1. Open [Google Search Console](https://search.google.com/search-console) and add a **URL-prefix** property for `https://ahmadibrahiim.github.io/SharkTankEgypt/`.
2. Choose **HTML tag** verification and paste the `content` value into `googleVerification` in `src/config.ts`, then push and verify.
3. Under **Sitemaps**, submit `sitemap.xml`.
4. Optional but recommended: a custom domain (e.g. `sharktankegypt.directory`). It ranks better than a `github.io` subpath, and `robots.txt` only counts at a domain root. If you add one, set `site` and `base` in `astro.config.mjs` and the URL in `public/robots.txt`.

## Contributing data

Edit `src/data/startups.json` (there's a link in the site footer) and open a PR. Each entry looks like this:

```json
{
  "id": "kebab-case-slug",
  "season": 1, "episode": 3,
  "name": { "en": "…", "ar": "…" },
  "description": { "en": "…", "ar": "…" },
  "category": "Food", "founders": ["…"],
  "website": "https://…",
  "ask":  { "amountEGP": 2000000, "equityPct": 10 },
  "deal": { "made": true, "sharks": ["…"], "amountEGP": 2000000, "equityPct": 20 },
  "sources": ["https://…"]
}
```

Use `null` for anything unknown. Never change an existing `id`, because its comments are keyed to it.

## Local development

```sh
npm install
npm run dev          # http://localhost:4321/SharkTankEgypt/
npm run check-data
npx playwright install chromium && npm run screenshots -- --missing
```
