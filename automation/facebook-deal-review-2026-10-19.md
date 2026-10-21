# Official Facebook deal-card review — 19 October 2026

Reviewed the verified [Shark Tank Egypt page](https://www.facebook.com/SharkTankEgypt), its photo cards, related post captions, and the Godly Pride reel in Chrome. The cards identify the startup, investment, equity and investors. Figures below were read from the images, not inferred from pitch requests or search snippets.

Coverage: Season 5 episodes 1–2 and Season 4 episodes 18–19. This is a review of those recap cards, not an audit of the entire Facebook archive. The findings below describe the differences against `src/data/startups.json` at the time of review; no published startup records were changed during that review.

## Seven currently unknown outcomes confirmed as deals

| Startup / existing ID | Season / episode | Investment | Equity | Investors | Official image |
|---|---|---:|---:|---|---|
| Eftah Topic / `aftah-topic` | 5 / 1 | EGP 2,000,000 | 25%, conditionally falling to 20% | Mohamed Farouk, Abdallah Sallam | [Card](https://www.facebook.com/photo.php?fbid=1082971247831319) |
| Connecto / `connecto` | 5 / 1 | EGP 6,000,000 | 20% | Ahmed Tarek Khalil | [Card](https://www.facebook.com/photo.php?fbid=1082971354497975) |
| Olympic Sports / `olympic-sports` | 5 / 1 | EGP 36,000,000 | 30% | Mohamed Farouk | [Card](https://www.facebook.com/photo.php?fbid=1082971224497988) |
| Godly Pride / `godly-pride` | 5 / 2 | EGP 3,000,000 | 25% | Mohamed Farouk, Hala El-Kasem | [Card](https://www.facebook.com/photo.php?fbid=1089498787178565) |
| SolarSector / `solar-sector` | 5 / 2 | EGP 2,000,000 | 51% | Ahmed Tarek Khalil, Mohamed Farouk | [Card](https://www.facebook.com/photo.php?fbid=1089498763845234) |
| Bokaah Home / `boka-home` | 4 / 19 | EGP 4,000,000 | 40% | Mohamed Farouk, Hend Sabry | [Card](https://www.facebook.com/photo.php?fbid=886044304190682) |
| HAVANA / `havana-socks` | 4 / 18 | EGP 5,000,000 | 25% | Ayman Abbas | [Card](https://www.facebook.com/photo.php?fbid=886021617526284) |

Conditions that must accompany the headline figures:

- **Eftah Topic:** the card also specifies a **2% usage fee**. Equity falls to 20% if agreed figures are achieved. It does not give the fee calculation base or target figures.
- **SolarSector:** the card also specifies a **2% usage fee**, cancelled once agreed figures are achieved. It does not give the fee calculation base or target figures. Facebook's image zoom resolved the typography: the text is “و ٢٪”, meaning “and 2%”; the preceding conjunction is not an extra digit or decimal.
- **Godly Pride:** the card spells the second investor “Halla Al Kassm”; the existing person record is `hala-el-kasem` / Hala El-Kasem. The [official reel](https://www.facebook.com/reel/2192595078309669/) also explicitly says Hamada and Hala invested with Maryam. Hala exists in `people.json` but is currently missing from the Season 5 lineup in `seasons.json`.

## Missing terms on three already-recorded deals

| Startup / existing ID | Season / episode | Investment | Equity | Investors | Official image |
|---|---|---:|---:|---|---|
| OG Bees / `og-bees` | 4 / 19 | EGP 5,000,000 | 17.5% | Ayman Abbas | [Card](https://www.facebook.com/photo.php?fbid=886044180857361) |
| Callista / `callista` | 4 / 19 | EGP 1,000,000 | 25% | Ayman Abbas, Ahmed Tarek Khalil | [Card](https://www.facebook.com/photo.php?fbid=886044094190703) |
| Lamarckii / `lamarckii` | 4 / 18 | EGP 5,000,000 | 35% | Ayman Abbas, Ahmed Tarek Khalil | [Card](https://www.facebook.com/photo.php?fbid=886021870859592) |

All three currently have the correct investors but null amounts, equity and episode numbers. Bokaah Home and HAVANA also currently lack episode numbers.

## Existing deal corroborated

**Aqar Exit, Season 5 episode 2:** EGP 10,000,000 for 10%, Ayman Abbas. The [official card](https://www.facebook.com/photo.php?fbid=1089498903845220) matches the existing headline deal. It does not independently corroborate the payment schedule described in the existing pitch text.

## Additional explicit outcome

**Zaher, Season 4 episode 18:** the [official card](https://www.facebook.com/photo.php?fbid=886021717526274) says “NO DEAL.” No startup name/ID match was identified in the local dataset. Further identity research is needed before adding or mapping a record.

## Source context and possible follow-up

- [Season 5 episode 1 recap post](https://www.facebook.com/SharkTankEgypt/posts/pfbid028ZEycSNASWrWvgezfrWXLTMga7UoCDbxaUAEKRLDKp78nQSB96uw7EDUNErbLZ2bl), linked from the individual cards. Card dates shown: 11 October 2026.
- [Season 5 episode 2 deals post](https://www.facebook.com/SharkTankEgypt/posts/pfbid02gWeTBuyMoQMrGpzhbbBPP7tYFzEaVKeQfbcAFL9PJhjoM7VyrsBYPGySyJpeLi3gl), containing Aqar Exit, Godly Pride and SolarSector. Card dates shown: 18 October 2026.
- [Season 4 episode 19 recap cover](https://www.facebook.com/photo.php?fbid=886043927524053); episode 18/19 pitch-introduction images in the gallery also identify the episode grouping.

Applying the seven newly confirmed outcomes would take the current dataset from 121 to 128 deals and from 49 to 42 unknown outcomes. Preserve the special conditions in both languages, add the source links, update checked dates and add Hala to the Season 5 lineup when applying these findings. The existing IDs should stay unchanged.

These sources confirm the show's announced agreements. They do not establish that funding later closed or was disbursed. The rest of the historical archive and subsequent closing status were not reviewed.

## Application — 21 October 2026

Applied the seven confirmed outcomes and the three missing sets of terms to `src/data/startups.json`, with the official source links and a checked date of 19 October 2026. Episode numbers and bilingual pitch summaries now match the review. Eftah Topic's conditional equity reduction and both usage-fee conditions remain explicit in English and Arabic; original ask fields were left unchanged.

Added Hala El-Kasem to the Season 5 lineup and added Aqar Exit's corroborating card without changing its recorded terms or claiming independent verification of its payment schedule. Zaher remains unmapped and was not added. The dataset now has 128 deals, 42 unknown outcomes and EGP 591,230,000 in disclosed on-air investment.
