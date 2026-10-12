# Transcript review: what the pitch videos say about outcomes

**Method:** I read the Whisper transcripts (`automation/sources/youtube-transcripts-0..7.json`, 67 texts) and the YouTube Arabic auto-captions (`automation/captions/*.ar.vtt`, 11 videos, matched to startups through `caption-targets.json`). Both are Whisper or YouTube auto-captions, so **every row needs a human check against the video before any data changes.** Some `.ar.vtt` captions are machine-translated into Modern Standard Arabic (era-care, nuit-fragrances, dark-solution). Quotes are copied exactly from the text, including its garbling.

**Coverage:** 47 startups, 78 transcript or caption files.

| Category | Count |
|---|---|
| DEAL (acceptance heard in the text) | 14 (4 of them low-confidence: yalla-hagz, sphinx-safety, dark-solution, bar-and-jar) |
| NO DEAL | 3 |
| Contradicts current data (the outcome itself is UNCLEAR) | 2 |
| UNCLEAR | 28 |

**Rules I applied:** an offer only counts as a deal when the founder or shark accepts it in the text. "Current data" refers to `src/data/startups.json`. "New info" means the field is null in the data and the transcript fills it. "Confirms" means the transcript matches the data.

## DEAL and NO DEAL

| startup id | name | season/ep | transcript says | terms (amount, %, sharks) | evidence (quote) | current data | note |
|---|---|---|---|---|---|---|---|
| weddngo | Weddngo | S2E12 | DEAL | 12M EGP for 40%, made up of 4M cash over 2 years and 8M of services credit (hosting/IT/software). Shark: Ayman ("ستزايمون"). Rival offers: 12M/40% (Ahmed), 15M/50% (Hamada) | "انا موافع على اوفر ستزايمون مبروح مرسي شكرا" | ask 12M/20%; deal ✓ Ayman Abbas, amount/% null | Confirms the deal and the shark. The transcript also confirms the ask (12M/20%). Which package was Ayman's comes from the founder's recap of the offers. Source: gQ8zqzxkX2Y; the other 3 vids are clips. |
| bayt-el-saad | Bayt El Saad | S4E3 | DEAL | 6M EGP for 40%, all five sharks jointly | "الافرفة اللي انها ستة مليون مقابل اربعين في المية ومعكي خمسة شخص انا اعمل شخصا ديل ديل مبروك" | ask 6M/25%; deal null | Confirms the ask. The deal is new info. Both videos (Hud3oFFJW38, 5r2c_UTeS-E) end the same way. |
| fatties | Fatties | S2E11 | DEAL | 3M EGP for 20% (drops when targets are hit) + 5% royalty for 3 years + 5-year TBS exclusivity in Egypt; shark is the TBS-linked one (not named in the text) | "Are you okay with that I'm okay with that Good luck براحل Thank you" | ask 3M/10%; deal null | Confirms the ask. The deal is new info. The 3M/20% was the founders' counter to a shark's 3M/20%, 5-year TBS-exclusivity offer; that shark accepts. Need to identify the shark from the video. |
| era-care | Era Care | S2E15 | DEAL | 10M EGP for 35%, Ayman Abbas (backed by his pharma company) | "سنقبل عرض أيمن، لكنه سيكون بنسبة 35%" … "فأنا معك في نسبة الـ 35%" | ask null; deal ✓ Ayman Abbas, 35%, amount null | Confirms the shark and the 35%. New info: amount 10M, ask 9M/20% ("أطلب 9 ملايين مقابل 20 %"). Source: the caption (MSA translation). |
| haxel | Haxel | S4E6 | DEAL | 4M EGP for 30% (likely), "the sisters" (Aya & Mounaz Abdel Raouf) | "احنا احنا اخض للأفر بتاعة اخضين" (≈ we take the sisters' offer) | ask 4M/20%; deal ✓ Aya + Mounaz Abdel Raouf, terms null | Confirms the sharks. The 30% figure comes from the sisters' "4 مليون 30%" offer; check it on the video. |
| stunning | Stunning | S4 | DEAL | 12.5M EGP for 20% (founder's counter, accepted) | "فعندي كونتر أوفر لو ممكن 12.5 مليون مقابل 20 في المنزل أعتقد أنه يعمل ديل لدينا ديل" | ask null; deal ✓ Ahmed Tarek Khalil, 12.5M, 20% | Confirms the amount and %. The caption J15iNXAeALg (a post-show interview) credits Ahmed Tarek with the investment. New info: ask 5M/10%. |
| didos-snacks | DIDO's Snacks | S4 | DEAL | 7.5M EGP total = 3M equity + 4.5M interest-free loan; the equity % is garbled. The sharks appear to be Mohamed + Ahmed jointly | "أنا معاك 3 مليون 4.5 مليون من غير فلوس من غير فوائد حتى رجعهم ل وحيبقه جارية ومسامين 8 مبروك" | ask null; deal ✓ Ahmed Tarek Khalil, terms null | Confirms the deal. A second shark may be missing: "أنا مع محمد … إحنا دخلين في الأفر سوى". New info: ask 7.5M/10%. |
| pencilight | Pencilight | S4E16 | DEAL | 4M EGP for 20% (founder's counter, royalty capped until the investment is recovered). Joint shark offer; the text names Hamada and Ahmed | "20% مقابل 4 مليو اغري ديل مابرو" | ask null; deal null | The deal is new info. New info: ask 2M/10% ("عشرة في المياه من الشركة مقابل اتنين مليون"). Source: 8NwyGw7R1ao. |
| zee-shoes | ZEE | S2E10 | DEAL | 5M EGP equity for ~25% ("خمسة عشين بلس point one") + a 10M credit line or convertible (no interest in year 1); shark(s) not clear | "والخمسة مليون دول بخمسة عشين في المائة" … "برارو مبروك مبروك" | ask 15M/15%; deal null | Confirms the ask. The deal is new info. **Wrong video:** SBLTRSbGuN8 is a different company (Zonta, founder Ahmed El-Hefny). Source: FqykquNeTq4. |
| nutrifits | Nutrifits | S4E12 | DEAL | Terms not clear. Offers on the table: 40M/40%, and the ask (15M/10%) plus factory space. The founders take one with extras | "احنا اخذ آفر لوفر بتاعك بس عن دينة شوية حاجات زيادة" … "يلا مبروك مبروك" | ask 15M/10%; deal ✓, terms null | Confirms the ask and the deal. Read the terms from the video. |
| yalla-hagz | Yalla Hagz | S4E7 | DEAL (low confidence) | Probably 1M EGP for 20%, shark unclear (Bishoy?); Mohamed Farouk is out | "فعاشين كده احنا هنقب للاوفر بتحضراتك" | ask 1M/10%; deal null | Confirms the ask. The founders accept "your offer"; the last offer stated is 20%. The audio is garbled. |
| sphinx-safety | Sphinx | S4 | DEAL (low confidence) | 10M EGP for 35% (maybe + 2% royalty), three sharks: Ayman, Ahmed, Bishoy | "احنا اختار ايه اشارفنا حركو التلاتة من قبل خمسة وتلاتين خمسة وتلاتين في المين براه بروه شكرا" | ask null; deal null | New info: ask 10M at a ~40M valuation. Source: KXVMX6wsNw8; the other 2 vids are clips. |
| dark-solution | Dark Solution | S2E12 | DEAL (low confidence) | Terms unknown | "نحن موافقين على الهاتف … ألف مبنوك" | ask null; deal null | yD4QKV5LIBc is a 184-character clip. The caption EfQBzQ67FVE gives the ask as 7.5M/15% but has no decision. |
| bar-and-jar | Bar & Jar | S2E6 | DEAL (low confidence) | Terms garbled ("one offer with 3.55%") | "بس ان شاء الله شكرا لك مبروك" | ask 1.7M/15%; deal ✓ El Sewedy + Mansour + Ahmed Tarek, 3.5M/51% | A 395-character clip of the closing. It doesn't contradict the data, but the terms can't be confirmed. |
| carvizita | CarVizita | S4E3 | NO DEAL | None | "فانا نسي اوي انو انا اعمل افر انا اسفا I'm out" | ask 3M/10%; deal null | Confirms the ask. No outcome in the data yet (new info). Several sharks say they're out, no offer appears, and the pitch ends with thanks. I couldn't read every shark's exit. |
| fool-tank | Fool Tank | S2E3 | NO DEAL | Final offers: 5M/51%, or 3M/51% + 2M credit line; founders countered 3M/50% | "ما قدرتش تقنع أربع من الخمسة شاركس بمشروحة وانسحبوا" … "تمام حاولنا معكي" | ask 5M/25%; deal ✗ | Confirms both the ask and the no-deal. |
| tayar | Tayar | S4E4 | NO DEAL | Declined: 7.5M equity for 25% + 7.5M debt (convertible) | "انت ارفت صراحة يبقى صعبة اوه حقا خلاص شو كران" | ask 15M/8%; deal null | Confirms the ask. No outcome in the data yet (new info). The founder appears to decline because the equity is too large; medium confidence. |

## Contradictions with current data (outcome UNCLEAR)

| startup id | name | season/ep | transcript says | terms (amount, %, sharks) | evidence (quote) | current data | note |
|---|---|---|---|---|---|---|---|
| bikado | Bikado | S1E6 | UNCLEAR | Original ask ~5.6M for 8%; 2.1M already raised; now asking 3.5M for **5%** | "ومتبقي 3.5 مليون جنيه في مقابل 5%" | ask 3.5M/**8%**; deal ✗ | **The equity % contradicts the data.** The no-deal can't be confirmed: the caption ends during questions ("مش واضح"). |
| nuit-fragrances | Nuit Fragrances | S3E6 | UNCLEAR | Offers: 5M/40% (Ahmed), 5M/50%, final "30" after the founders countered with 20% | "احنا نديكوا العرض ده مقابل 30 ده اخر حاجة" … "it's a good decision" | ask 5M/10%; deal null | Confirms the ask. Looks like the founders declined (thanks + advice), but nobody says so. **Episode conflict:** kLFlZ3Bhu6Q (also mapped to outdated, S3E4) contains Outdated, part of Nuit, and a kids' brand "Hawee" (100K/20%, "مبروك") in one video, so either the S3E4/S3E6 numbering or the mapping is wrong. |

## UNCLEAR

| startup id | name | season/ep | transcript says | terms (amount, %, sharks) | evidence (quote) | current data | note |
|---|---|---|---|---|---|---|---|
| outdated | Outdated | S3E4 | UNCLEAR | Offers: 1M/20%, and the exact ask (500K/5%) | "أنا خديلة كالنت طلبه بارده 5% مقابل 500.000 جنين" | ask 500K/5%; deal ✓, terms null | Confirms the ask. No acceptance is heard; the text cuts to the next pitch. |
| pavo | PAVO | S3E9 | UNCLEAR | None | "احنا القص بتاعنا النهارده 3 مليون مقابل 10% من الشركه" | ask 3M/10%; deal ✓ Dina Ghabbour | Confirms the ask. Both videos stop during questions. |
| game-guru | Game Guru | S4E4 | UNCLEAR | None | "أنا اليوم بطلوب بنيون جنين مقابل عشرة في الميون الشركة" | ask 1M/null%; deal ✓ Mohamed Farouk | New info: equity 10%. No decision in the text. |
| lil-kitchen | Lil Kitchen | S4E17 | UNCLEAR | None | "إحنا وقت طلق الأسكب تانى 7.5 مليون مقابل 15 في المية" | ask null; deal ✓ Ayman Abbas + Hend Sabry | New info: ask 7.5M/15%. Both videos are clips. |
| horra | Horra | S2E20 | UNCLEAR | Founder counters 1M for 35% to Ayman + Farouk; a shark says "okay"; then 1.5M/50% is discussed | "انا okay على العرد دا و اللي عايزا يخشي فيه محمد" | ask 500K/10%; deal ✓, terms null | Confirms the ask. Could be a deal at 1M/35%, but the closing is unreadable. |
| interact | Interact | S2E11 | UNCLEAR | None | "ده مش جهاز احنا مكلم على تكنولج" | ask null; deal ✗ | A 625-character clip; it can't confirm the no-deal. |
| srv | SRV | S3E15 | UNCLEAR | Offers: 15M/45%; 5M equity + 5M working capital for 30%; 5M services + 5M equity. Founder's counter: 40% with 50% voting | "انا موافع على 40 بس ب50% فوتينج" | ask 10M/20%; deal null | Confirms the ask. The founder's conditional counter gets no reply in the text. |
| ooaps | OOAPS | S3E11 | UNCLEAR | Offers: 10M/40%; half cash, half hosting for 25%; founder announces a counter | "انا ليه كونتر افر. ها سازن حضراتكم فيه" | ask 7M/20%; deal null | Confirms the ask. The text ends before the counter is resolved. |
| fino | Fino | S4E7 | UNCLEAR | Offers 5M/20% (Ayman, Hamada); founders counter 5M for 15-16% | "احنا عندنا افر 5 مليون مقابل 15 فهو 16" | ask 5M/12.5%; deal null | Confirms the ask. No reply to the counter. |
| super-abla | Super Abla | S2E4 | UNCLEAR | Offer 1.5M/30% (Ayman + Ahmed); one shark out (competing business) | "ثلاثين فلمية حاريك وحارد مليون ونص" | ask null; deal null | New info: ask 1.5M/15%. The founder's reply is garbled. |
| kak-squad | KAK Squad | S4 | UNCLEAR | One shark out (conflict of interest) | "30 مليون مقابل عشرة في المان" | ask null; deal null | New info: ask 30M/10%. Both videos stop mid-pitch. |
| abgad | Abgad | S2E12 | UNCLEAR | None | "أطلوب من نوكو 35 مليون جني مقابل 15 في المية" | ask null; deal null | New info: ask 35M/15%. |
| jouzoor | Jouzoor | S4 | UNCLEAR | None | "جايين نطلب اسك بمقدار مليون400000 مقابل 10% من اسهم الشركه" | ask null; deal null | New info: ask 1.4M/10%. All 3 videos stop during questions. |
| havana-socks | HAVANA | S4 | UNCLEAR | None | "أسكب تعنى 5 مليون جنيه لعاشرة في المية" | ask null; deal null | New info: ask 5M/10%. |
| right-temp | Right Temp | S3E13 | UNCLEAR | None | "حست عشة في المائمة شركتنا مقابل 4 مليون جنيه" | ask 4M/10%; deal null | Confirms the ask. |
| tronsta | Tronsta | S4E2 | UNCLEAR | None | "فرسة سيسمار ب3 مليون جنين مقابل 10% من حسة الشرك" | ask 3M/10%; deal null | Confirms the ask. |
| peacock-designs | Peacock Designs | S1E9 | UNCLEAR | None | "احنا طلبين لست اسمها عاشة بليون جنيه" | ask 10M/10%; deal null | Ends during questions. |
| waymoure | Waymoure | S4E1 | UNCLEAR | None | "البروفت بارجن بتانا حالياً 48" | ask 8M/15%; deal null | All 3 videos stop during questions. |
| damj | Damj | S3E7 | UNCLEAR | None | "ممكن ترنراون ليك لان انت بتاع الحاجة مهمة جدا" | ask 6M/20%; deal null | Only advice, no offers. The start of the file looks like a different pitch (learning difficulties). |
| the-mat-homes | The Mat Homes | S4E10 | UNCLEAR | None | "اعزان يجيب مكان بحوالي 25000 دولار" | ask 2.5M/10%; deal null | QhbD14WX--c also contains a different pitch ("بوه home", 1M for 5%). |
| mystery-bag | Mystery Bag | S4E3 | UNCLEAR | None | "كوميشن كامل مية عشر في المية" | ask 1M/10%; deal null | Both videos stop during questions. |
| mavericks | Mavericks | S4E6 | UNCLEAR | None | "حدك شو يحتاج فلوسيا حدك محتاج حد فينا محتاج مكان و تسويق" | ask 1M/10%; deal null | A clip. |
| ketolicious | Ketolicious | S4E7 | UNCLEAR | None | "لو جت الويف هنعمل ريبراندين" | ask null; deal null | The caption stops during questions; no ask is stated. |
| the-lean-jerky | The Lean Jerky | S2E8 | UNCLEAR | None | "أول سنة كنا مركزين كمتيتلي على أن ننبيع من خلال الوبيسائد" | ask null; deal null | Three short clips (250 to 480 characters). |
| choroida | Choroida | S1E6 | UNCLEAR | None | "في هذه المرحلة ما يجب أن نقوله خذ قرار" | ask 8M/5%; deal null | A 775-character clip. |
| cognify | Cognify | S3E17 | UNCLEAR | None | "أنا يعني ممكن أساعدك فيها وسبونسر حتى برا للموضوع" | ask null; deal null | A 563-character clip. |
| shelter | Shelter | S2E5 | UNCLEAR | None | "عوريك شالنج از ان احنا عايزين لحوط الايتمز دي" | ask null; deal null | A 501-character clip. |
| engine | Engine | S2E6 | UNCLEAR | None | "في مصر لا يوجد اجهزة خلط" | ask null; deal null | An 861-character clip. |
