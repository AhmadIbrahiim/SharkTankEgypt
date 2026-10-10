<div align="center">

<a href="https://ahmadibrahiim.github.io/SharkTankEgypt/"><img src=".github/social-preview.jpg" alt="Shark Tank Egypt Directory: every startup that pitched on Shark Tank Egypt" width="760"></a>

# Shark Tank Egypt Directory · دليل شارك تانك مصر

**Every startup, shark, founder and deal from Shark Tank Egypt, in Arabic and English.**<br>
**كل الشركات والمستثمرين والمؤسسين والصفقات في شارك تانك مصر، بالعربية والإنجليزية.**

[![Deploy](https://github.com/AhmadIbrahiim/SharkTankEgypt/actions/workflows/deploy.yml/badge.svg)](https://github.com/AhmadIbrahiim/SharkTankEgypt/actions/workflows/deploy.yml)
[![Website](https://img.shields.io/badge/site-ahmadibrahiim.github.io%2FSharkTankEgypt-E0562F)](https://ahmadibrahiim.github.io/SharkTankEgypt/)
[![Built with Astro](https://img.shields.io/badge/built%20with-Astro-FF5D01?logo=astro&logoColor=white)](https://astro.build)

**[العربية](https://ahmadibrahiim.github.io/SharkTankEgypt/ar/)** · **[English](https://ahmadibrahiim.github.io/SharkTankEgypt/en/)** · **[Add or fix a startup](https://github.com/AhmadIbrahiim/SharkTankEgypt/issues/new?template=new-startup.yml)**

</div>

---

An unofficial, community-run directory of every startup that pitched on *Shark Tank Egypt* (شارك تانك مصر): 216 startups, 74 recorded deals, 15 sharks and 5 seasons plus the specials. Every page is available in Arabic and English, and the whole thing runs on GitHub: data in JSON, a static site on Pages and automation in Actions.

## What's inside

- **Startup pages**: what they do, their services, a pitch summary, the ask and the final deal, founders, website and socials, a screenshot or the pitch video, and comments.
- **Shark profiles**: portfolio, money invested, average equity, favourite sectors, co-investors, and deals by season and by sector.
- **Founder profiles**: their companies, co-founders and how the pitch went.
- **Episodes, seasons and sectors**: who pitched, who invested, and the biggest asks and deals.
- **Shark vs shark** comparisons and **rankings**: biggest deals, highest valuations, joint deals, startups that got no deal, and more.
- **10,000+ questions answered** (FAQ) in both languages, including Egyptian-dialect phrasing.
- A generated **share image** for every page, and full **schema.org** structured data.

## How it works

| Piece | Where |
|---|---|
| Data | `src/data/*.json`: startups, people (sharks and founders), seasons, Arabic names. Validated by `npm run check-data` on every deploy. |
| Site | [Astro](https://astro.build) static build (about 1,360 pages), published to the `gh-pages` branch by `.github/workflows/deploy.yml`. |
| Share images | `scripts/og.mjs` renders a 1200×630 card per page with Playwright after each build. |
| Screenshots | `.github/workflows/screenshots.yml` captures each startup's website weekly and whenever the data changes. |
| Research helpers | The `harvest`, `photos` and `enrich` workflows collect raw material into `automation/`. Nothing there reaches the site until a person reviews it. |
| Ratings and comments | [giscus](https://giscus.app): one GitHub Discussion per startup. |
| SEO | `/ar/` and `/en/` URLs with `hreflang`, a sitemap, one linked JSON-LD graph per page (WebSite, Organization, Person/ProfilePage, TVSeries/TVSeason/TVEpisode, BreadcrumbList, FAQPage). |

## Contributing

Corrections and new information are very welcome, especially deal outcomes, founder names and links. See [CONTRIBUTING.md](CONTRIBUTING.md). The quickest way is the **[Add or fix a startup](https://github.com/AhmadIbrahiim/SharkTankEgypt/issues/new?template=new-startup.yml)** form, which needs no code.

## Local development

```sh
npm install
npm run dev          # http://localhost:4321/SharkTankEgypt/
npm run check-data   # validate src/data
npm run build && node scripts/og.mjs   # full build with share images
```

## License

Code: [MIT](LICENSE). Data in `src/data/`: [CC BY 4.0](src/data/LICENSE.md). Please credit the directory if you reuse it. Photos and screenshots belong to their owners.

## Disclaimer

This is an independent fan and community project. It is not affiliated with Shark Tank, Sony Pictures Television, CBC or WATCH IT. Facts come from public sources, which are listed on each startup page. Founders who would like their information changed or removed can [open an issue](https://github.com/AhmadIbrahiim/SharkTankEgypt/issues/new).
