# Season 5, Episode 5 — announcement review, 4 November 2026

Expanded capture: [research pack](episode-5-2026-11-04/README.md), [bilingual business drafts](episode-5-2026-11-04/startup-drafts.json), [founder drafts](episode-5-2026-11-04/people-drafts.json), [evidence](episode-5-2026-11-04/evidence.json) and [asset manifest](episode-5-2026-11-04/manifest.json). The pack contains 25 screenshots, eight source images, 44 source records and 35 Bouga product links. Its drafts supersede the preliminary copy below.

The [official Facebook post](https://www.facebook.com/SharkTankEgypt/posts/pfbid02XJBTszjSzRsWTprv8vUqfjwCPusG1Df82yj2rRzNCtExbzbHJ7Kzkde35K8nkD9tl) announces Episode 5 of Season 5 for 4 November 2026 at 9 PM on CBC Now and WATCH IT. Its publication timestamp, 1793804405, is 17:00:05 that day in Cairo. The scheduled broadcast is `2026-11-04T21:00:00+02:00`; Egypt's daylight saving time has ended.

All three attached images were downloaded and visually reviewed at 1080 × 1440. Each says “الحلقة الخامسة” and names its business. The caption and images establish an announcement, not a broadcast or investment outcome.

| Business / proposed ID | Official appearance card | Reviewed business sources |
|---|---|---|
| E-stebdal / `e-stebdal` | [Card](https://www.facebook.com/photo.php?fbid=1105971995531244) | [Website](https://www.e-stebdal.com/), [about](https://www.e-stebdal.com/about-us), [FAQs](https://www.e-stebdal.com/faqs), [TIEC](https://tiec.gov.eg/English/Pages/default.aspx) |
| Welltra / `welltra` | [Card](https://www.facebook.com/photo.php?fbid=1105972032197907) | [Website](https://www.welltra.ai/), [about](https://www.welltra.ai/about-us), [Egyptian partnership report](https://sis.gov.eg/en/media-center/news/health-authority-signs-9-deals-to-enhance-training-technology/) |
| Bouga / `bouga` | [Card](https://www.facebook.com/photo.php?fbid=1105972025531241) | [Website](https://www.getbouga.com/), [founder interview](https://www.scenenow.com/Society/Bouga-is-a-Foldable-Tote-Bag-for-the-Creative-Cairo-Hustler) |

## Proposed profile copy

**E-stebdal:** E-stebdal helps Shopify stores manage returns and exchanges. Customers submit requests through a portal; merchants review them, and the software handles the approved refund or exchange. It gives stores reports on return reasons and trends. Current WooCommerce support remains unconfirmed.

**إي استبدال:** إي استبدال تساعد متاجر Shopify على إدارة المرتجعات والاستبدال. يرسل العميل طلبه عبر بوابة مخصصة، ويراجعه المتجر، ثم ينفذ البرنامج رد المبلغ أو الاستبدال بعد الموافقة. وتقدم تقارير عن أسباب إرجاع المنتجات واتجاهات المرتجعات. لم يُؤكد دعم WooCommerce حاليًا.

**Welltra:** Welltra develops software that uses a camera to estimate vital signs from changes in facial skin colour. Its wellness products include a mobile app and the Ru’ya smart mirror. It also offers software tools for businesses to add the technology to their own products.

**ويلترا:** ويلترا تطور برامج تستخدم الكاميرا لتقدير المؤشرات الحيوية من تغيرات لون بشرة الوجه. تشمل منتجاتها لمتابعة الصحة تطبيقًا للهاتف ومرآة «رؤيا» الذكية. وتوفر أدوات برمجية تتيح للشركات إضافة التقنية إلى منتجاتها.

**Bouga:** Bouga is an Egyptian bag brand created by designer Mai Sabri. Its lightweight bags fold into a small pouch and come in prints inspired by Egyptian streets, cities and old banknotes. The company says they are machine washable and carry up to 20 kg. Its materials and product pages disagree on the fibre used.

**بوجا:** بوجا علامة مصرية للحقائب أطلقتها المصممة مي صبري. حقائبها خفيفة وتُطوى داخل جراب صغير، وتحمل رسومات مستوحاة من الشوارع والمدن المصرية والعملات الورقية القديمة. وتذكر الشركة أنها قابلة للغسل في الغسالة وتتحمل حتى 20 كيلوجرامًا. تختلف صفحات الخامات والمنتجات في تحديد نوع الألياف المستخدمة.

**Schedule note:** The show announced Episode 5 for Wednesday, 4 November 2026 at 9 PM Cairo time on CBC Now and WATCH IT. Investment asks and deal outcomes have not been verified.

**ملاحظة الموعد:** أعلن البرنامج عرض الحلقة الخامسة يوم الأربعاء 4 نوفمبر 2026، الساعة التاسعة مساءً بتوقيت القاهرة، على CBC Now وWATCH IT. طلبات الاستثمار ونتائج الصفقات لم تُوثَّق بعد.

Both languages received a Humanizer pass: promotional claims were removed, the bag specifications remain attributed to the company, and the wellness description does not repeat unverified clinical-accuracy or regulatory-approval claims.

## Proposed application

- Add three profiles with `appearanceStatus: "announced"`, null asks and deals, the official announcement and business sources, and a checked date of 4 November 2026.
- Add the episode preview using the existing schema and the schedule above. These profiles will appear in search, Season 5, Episode 5 and the data export through existing code.
- Use the three reviewed official cards as credited local startup images. Do not identify people solely from their faces. Founder roles are now supported for Ahmed Samer at E-stebdal, Anees Abdullateef and Omar Abdullateef at Welltra, and Mai Sabri at Bouga. Their biographies, source links and named photographs are in the expanded pack. The identities of Welltra's two on-air representatives and Khaled Anees's exact company role remain unconfirmed.
- Give each profile at least two sourced service entries using the existing bilingual format.
- Replace the preview component's hardcoded “rescheduled” labels with neutral schedule labels. The present component was written for Episode 3's postponement and would misdescribe this announcement.
- Update the directory count in both READMEs from 227 to 230, leaving investment totals unchanged. Regenerate the data-quality report with the existing audit.
- Run the data checks, unit tests, build, SEO audit and existing browser tests, including the announcement tests in both languages.

The contributor approved applying and pushing the prepared profiles. Records, assets and the schedule preview have been applied through the existing site structure. No ask, offer, deal, broadcast confirmation or closing status was inferred from the announcement.

## Contributor correction, 5 November 2026

The maintainer watched the episode and supplied the following asks and outcomes as a firsthand account:

| Business | Ask | Outcome |
|---|---|---|
| E-stebdal | EGP 7 million for 10% | No deal |
| Welltra | EGP 25 million for 50% | Accepted Ahmed Tarek Khalil's offer of EGP 25 million for 50%, plus a 5% stake in the US holding company spread over four years |
| Bouga | EGP 500,000 for 15% | Confirmed deal with Mohamed Farouk for EGP 500,000 for 15% |

All three records now contain their pitch terms and outcomes, and the episode preview has been removed. Welltra's 5% holding-company stake is described in the bilingual pitch; it is separate from the recorded 50% stake. No equal annual split or other conditions were supplied, so none are inferred. E-stebdal and Bouga use the existing pitch summary generated from their data.

The source for these corrections is the maintainer's firsthand viewing. The episode was not independently rewatched. The edited copy and generated summaries received a Humanizer pass in both languages.
