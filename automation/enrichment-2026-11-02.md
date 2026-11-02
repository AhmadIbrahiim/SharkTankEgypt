# Startup enrichment review — 2 November 2026

Added 126 credited local business images, so all 227 startup profiles have a local photograph or website screenshot. The images are business-specific press photographs, official pitch thumbnails or frames from the named startup’s pitch. Generic episode art and unrelated investor shots were excluded. Each photograph’s source is recorded in `photo.creditUrl` in `src/data/startups.json`.

Cards, startup headers, founder-page backgrounds and startup share images now prefer the existing local image. Video thumbnails remain a fallback. Founder portraits from the preceding media update were pushed in commit `642d2a45`.

## Reviewed outcomes and terms

These are agreements shown on air, not confirmation that money later changed hands.

| Startup | Change | Evidence |
|---|---|---|
| Super Abla | EGP 1.5M for 30%, jointly from Ayman Abbas and Ahmed Tarek Khalil | [FollowICT’s episode report](https://followict.news/ga95), [official closing exchange at 15:14](https://www.youtube.com/watch?v=drlTIu6hW8k&t=914s) |
| Lelu | Corrected the previous deal status to no deal. Asked for EGP 1.5M for 10%; declined the joint 50% offer from Ayman Abbas and Dina Ghabbour. | [FollowICT](https://followict.news/ga95), [official clip: founder chose to continue alone](https://www.youtube.com/watch?v=y_YsTRv6vxQ). The show website’s general “Fashion Deals” category is insufficient evidence of acceptance. |
| Country House | Filled EGP 1.5M investment from Ahmed Tarek Khalil for 50%; added the original 20% ask | [FollowICT](https://followict.news/ga95) |
| Fatties | Identified Ayman Abbas as the investor for the existing EGP 3M / 20% agreement. Added the conditional five-point equity reduction over three years and five-year, Egypt-only TBS exclusivity. | [Official closing exchange at 22:07](https://www.youtube.com/watch?v=DQ65rjFpnes&t=1327s) |
| SRV | EGP 15M for 40% from Mohamed Farouk, with equal voting rights | [Riady report](https://riadynews.com/رجل-الأعمال-محمد-فاروق-يستحوذ-على-40-من-srv/), [official agreement at 27:04](https://www.youtube.com/watch?v=fqCVdK5RBiU&t=1624s) |
| Nutrifits | Filled Ahmed Tarek Khalil, EGP 40M, 40%. The subsequent EGP 50M counteroffer was declined. | [Official closing exchange at 20:08](https://www.youtube.com/watch?v=z7aN8DQyKxg&t=1208s), existing contemporary reports on the offers |
| Sphinx | Asked for EGP 10M / 25%; accepted EGP 10M / 35% jointly from Ayman Abbas, Ahmed Tarek Khalil and Bishoy Azmy. Added episode 15 and linked the full pitch. | [Official negotiation at 22:37](https://www.youtube.com/watch?v=KXVMX6wsNw8&t=1357s), [official episode caption](https://www.tiktok.com/@sharktank.egypt/video/7595249636399385863). A 2% royalty was discussed earlier; the final exchange does not establish whether it survived. This uncertainty is stated in both languages. |
| Fino | Accepted EGP 5M from Okhtein founders Aya and Mounaz Abdel Raouf. Final equity remains null. | [Official closing negotiation at 22:20](https://www.youtube.com/watch?v=YcP6pAO9D-g&t=1340s). The initial 17.5% offer was negotiated; it is not recorded as the final percentage. |
| Yalla Hagz | Accepted EGP 1M / 20%; investor identity remains unconfirmed | [Official closing negotiation at 20:30](https://www.youtube.com/watch?v=64CEKfSzhSE&t=1230s) |
| OOAPS | Accepted EGP 10M / 35% after negotiating the 40% offer; investor identity remains unconfirmed | [Official offer and counteroffer at 21:35](https://www.youtube.com/watch?v=_RSqERON5xY&t=1295s). The separate cash-plus-technology-services offer was not recorded as the selected deal. |

## Profile details

- **Pharmabill:** added its 2023 start, pharmacy procurement and online sales functions, from [Youm7’s episode preview](https://www.youm7.com/6502200). The available withdrawal clip does not establish the final outcome.
- **Ostrich Land:** expanded its farming description and attributed the organic-feed claim to the company, using [Youm7](https://www.youm7.com/6775318) and [Dostor](https://www.dostor.org/4863356). Retained the previously sourced deal.
- **Baby Star:** added laundry and bottle-cleaning products from [the official store](https://babystareg.com/), plus the sales figures reported at the pitch in [Youm7](https://www.youm7.com/7195516). The [negotiation excerpt](https://www.youtube.com/watch?v=AJCRNSNBWj0) ends before a final outcome; it remains null.
- **Ami’s Bakery:** added the EGP 2M / 15% ask, production details and reported EGP 5M sales over ten months from the [official introduction](https://www.tiktok.com/@sharktank.egypt/video/7590484043221781778). Added episode 13 from the [official caption](https://www.tiktok.com/@sharktank.egypt/video/7590487372274339079). Outcome remains null.

English and Arabic copy were reviewed separately for natural phrasing and accurate uncertainty. `checked` dates were updated for these 14 reviewed records; photo-only edits did not change verification dates.

## Limits and validation

- Nuit Fragrances’ final decision was not clear enough in the reviewed material to change its outcome. Unverified names, percentages and asks remain blank. No portraits were assigned by face recognition.
- Some older transcript files associate clips with the wrong startup. Titles and introductions were checked before using them. In particular, `kLFlZ3Bhu6Q` was not used for Nuit or Outdated, and the Bohome clip filed under The Mat Homes was excluded.
- All 227 local startup image files were checked for existence and decoded successfully.
- Schema, data audit, search tests, build, SEO audit and all 18 browser checks passed. The data audit reports 0 contradictions, 0 warnings and 257 gaps (previously 270). SEO reports 0 errors; non-blocking metadata warnings remain.
- Reviewed English desktop and Arabic mobile pages, the local-image fallback, and generated English and Arabic share images. The browser regression covers local photos, website screenshots and video fallback in both languages.
