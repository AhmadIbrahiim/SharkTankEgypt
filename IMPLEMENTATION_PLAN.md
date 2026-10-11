# Implementation plan

Status of the October 2026 audit. Everything marked done is on branch `claude/shark-tank-egypt-directory-rzeynt`, with one commit per area. **It is not yet deployed**: merging into `main` runs `deploy.yml`, which publishes the site.

## P0: data quality and verification. Done.

- [x] `scripts/audit-data.mjs`: checks prose against the deal field, sharks against the season lineup, figure sanity, duplicates and phantom records, and gaps. Writes `DATA_QUALITY_REPORT.md`. Runs in CI with `--strict`.
- [x] 33 contradictions fixed. The outcome sentence is now generated from the `deal` field.
- [x] Derived verification status, plus a `checked` date on all 218 records, shown on pages and included in the data exports.
- [x] 17 more outcomes settled from sources that state them, from 71 unknown down to 54, quoted in `automation/deal-audit-2026-10.md`.
- [ ] **Owner:** keep or delete `brazilian-picole`, a suspected phantom duplicate of `gelato-on-the-wheel`.
- [ ] Remaining 54 unknown outcomes. They need a source that states the outcome; no new automated source is left to try.

## P0: technical SEO. Done.

- [x] `scripts/audit-seo.mjs` in CI: links, canonicals, hreflang, OG, JSON-LD, sitemap and robots.
- [x] Descriptions trimmed, titles shortened, founder descriptions, `dateModified` and `lastmod`.
- [x] llms.txt, data downloads, the all-deals page, AI crawlers allowed, IndexNow.
- [ ] **Owner:** Search Console and Bing verification; custom domain DNS.

## P1: UI and UX. Done.

- [x] Nav, spacing, card status badges, related startups, shark filter, new sort options, Arabic-aware search, contrast.

## P1: performance, architecture and tests. Done.

- [x] Self-hosted font and a lighter home page. Mobile Lighthouse is 97–100.
- [x] One site-address setting; shared search module.
- [x] Unit tests, 10 Playwright end-to-end tests, all gating the deploy.
- [ ] Optional: preload the font to remove CLS 0.055 on `/en/`.

## P2: features. Done where data allows.

- [x] Deals analytics, methodology, valuation calculator.
- [x] `/compare/` side by side.
- [x] "Where are they now?" timeline. It shows only when a record has sourced `updates`, and **none have data yet**.
- [ ] Fill `updates` from sourced news (funding rounds, closures). This is research work: each entry needs a link.
- [ ] Investment timeline by date. Only the season is known; air dates per episode would be needed.

## P2: monitoring

- [x] Data and SEO reports regenerated on every CI run; IndexNow on deploy.
- [x] GoatCounter hook with a zero-result-search event. It's off until a code is set.
- [x] Monthly LLM visibility check questions in `automation/llm-visibility.md`.
- [ ] **Owner:** create a GoatCounter site and set `goatcounter` in `src/config.ts`.

## Release

1. Review the branch commits.
2. Owner authorizes the merge into `main`. CI then runs every check and deploys.
3. After the deploy: check `/en/deals/`, `/en/compare/` and one startup page live, and submit the sitemap in Search Console.
