# Performance report

All numbers come from Lighthouse 12, mobile preset with simulated throttling, run against a local `astro preview` of the production build.

The best-practices score of 96 on pages with videos comes from console errors when YouTube thumbnails are blocked in the offline test sandbox. On the live site those requests load.

## Before

| Page | Performance | Accessibility |
|---|---|---|
| `/en/` | 83 | 97 |
| `/ar/` | 82 | 100 |
| Startup page | 91 | 96 |
| Shark page | 91 | 96 |
| `/en/deals/` | 93 | 95 |

The Arabic home page spent about 2.7s on layout for all 218 cards. The Google Fonts stylesheet blocked rendering.

## After

| Page | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/en/` | 98 | 100 | 96 | 100 | 2.3s | 0 | 0ms |
| `/ar/` | 97 | 100 | 96 | 100 | 2.4s | 0 | 0ms |
| `/en/bar-and-jar/` | 100 | 100 | 96 | 100 | 1.6s | 0.001 | 0ms |
| `/ar/bar-and-jar/` | 100 | 100 | 96 | 100 | 1.4s | 0.002 | 0ms |
| `/en/sharks/ayman-abbas/` | 100 | 100 | 100 | 100 | 1.1s | 0 | 0ms |
| `/en/deals/` | 100 | 100* | 100 | 100 | 1.2s | 0 | 0ms |
| `/ar/faq/` | 100 | 100 | 100 | 100 | 1.4s | 0.003 | 10ms |
| `/en/compare/` | 100 | 100 | 100 | 100 | 1.2s | 0 | 0ms |

\* The deals page first scored 96 because its KPI list used invalid `<dl>` markup. After the fix, accessibility re-measured 100 in English and Arabic.

## What changed

1. **Self-hosted font.** `@fontsource-variable/readex-pro` replaces the Google Fonts request and its render-blocking stylesheet.
2. **Lighter home page.** All 217 cards stay in the HTML, so search and crawlers still see every one, but only the first 24 are visible. The rest render `hidden` until search, filters or "show more" need them. HTML went from 768KB to 600KB in Arabic and 528KB in English.
3. **Cheaper filtering.** Cards are re-ordered in the DOM only when the sort changes, not on every keystroke.
4. **Font preload.** Each page preloads the one font file its language needs (Arabic or Latin). This removed the 0.055 layout shift the font swap caused on `/en/`.
5. **Contrast.** The primary button went from #e0562f to #c94a24, and the teal from --nile to #0c6b64. Both now pass AA.

## Known remaining

- The home page is still about 0.5MB of HTML, because every card is in the markup for search and SEO. Moving the cards to a JSON file loaded on demand would shrink it, but crawlers would then see fewer links.
