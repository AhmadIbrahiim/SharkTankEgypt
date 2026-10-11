# SEO audit

Run with `npm run build && npm run audit-seo`; CI runs it with `--strict`, which fails on any error. `--verbose` lists every warning.

## Latest result (2026-10-11)

| Check | Result |
|---|---|
| Pages crawled in `dist/` | 1,423 |
| URLs in the sitemap | 1,422. The one page left out is the root language redirect. |
| Internal links checked | 77,022, with 0 broken |
| Title present and unique, canonical present and self-referencing | 0 errors |
| Reciprocal `hreflang` between ar and en, plus `x-default` | 0 errors |
| Open Graph title, description, image and URL | 0 errors |
| JSON-LD blocks parse | 0 errors |
| robots.txt allows crawling and points to the sitemap | OK |
| Warnings | 309: 301 titles over 70 characters, 8 descriptions outside 70–160 characters |

## Fixed in this audit

- **Meta descriptions:** cut at a word boundary to 158 characters at most. Before, many were 300+ characters and search engines truncated them mid-word.
- **Titles:** shortened by using the short site name. The 301 that are still long are startup and founder pages whose own names are long. Cutting them further would remove the name, so they stay.
- **Founder pages:** those without a bio now get a factual description, "X is a founder of Y" plus a one-line summary, instead of an empty one.
- **`dateModified`:** added to page JSON-LD, and `lastmod` added to the sitemap, both taken from git history.
- **robots.txt:** now generated from the site address. It names the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others) and allows them.
- **For LLMs:**
  - `llms.txt` and `llms-full.txt`
  - CSV and JSON data downloads with verification and source columns
  - an all-deals page with Dataset JSON-LD
  - an "In short" answer-first summary on each startup page
- **IndexNow:** the key file is published and the sitemap is submitted after each deploy.
- **Site address:** one setting (`package.json` "homepage") drives canonicals, the sitemap, robots, share images and IndexNow. Switching to a custom domain changes no paths.

## Not done here (needs the owner)

- Verify the site in Google Search Console and Bing Webmaster Tools, and submit the sitemap there.
- Custom domain: for example, point `sharktank.ahmed-ibrahim.com` as a CNAME to `ahmadibrahiim.github.io`, then set `homepage` and add `public/CNAME`. Paths stay the same, and GitHub Pages redirects the old address.
- Wikidata and Wikipedia entries for the show, which LLMs and knowledge panels draw on.
