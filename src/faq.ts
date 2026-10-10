// FAQ built from the data, in both languages, phrased the way people search
// ("How much did Ayman Abbas invest on Shark Tank Egypt?", "كم استثمر أيمن عباس في شارك تانك مصر؟").
// Every answer states only what the data records; unknowns are said plainly, never guessed.
import { startups, seasons, sharks, founders, sharkByKey, categories, category, money, pct, num, valuation, seasonLabel, shark, founderId, stats, type Lang, type Startup } from './config';

export type QA = { q: string; a: string; href?: string };
type Shark = (typeof sharks)[number];
type Founder = (typeof founders)[number];

const ST = { en: 'Shark Tank Egypt', ar: 'شارك تانك مصر' };
const L = (lang: Lang, en: string, ar: string) => (lang === 'ar' ? ar : en);
/** "a, b and c" / "أ، ب و ج" */
export const list = (xs: string[], lang: Lang) =>
  xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(lang === 'ar' ? '، ' : ', ')}${lang === 'ar' ? ' و' : ' and '}${xs.at(-1)}`;
const count = <T,>(xs: T[]) => [...xs.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<T, number>())].sort((a, b) => b[1] - a[1]);
const where = (x: Startup, lang: Lang) =>
  `${seasonLabel(x.season, lang)}${x.episode != null ? L(lang, `, episode ${x.episode}`, `، الحلقة ${num(x.episode, lang)}`) : ''}`;
const year = (n: number) => seasons.find((s) => s.season === n)?.year;
const sharkName = (n: string, lang: Lang) => sharkByKey.get(n)?.name[lang] ?? shark(n, lang);
const founderName = (n: string, lang: Lang) => founders.find((f) => f.id === founderId(n))?.name[lang] ?? n;
/** "EGP 1M for 20%" */
const terms = (amount: number | null | undefined, equity: number | null | undefined, lang: Lang) =>
  [amount != null && money(amount, lang), equity != null && L(lang, `for ${pct(equity, lang)}`, `مقابل ${pct(equity, lang)}`)].filter(Boolean).join(' ');
const biggest = (xs: Startup[]) => [...xs].filter((x) => x.deal?.made && x.deal.amountEGP != null).sort((a, b) => b.deal!.amountEGP! - a.deal!.amountEGP!)[0];
const dealLine = (x: Startup, lang: Lang) =>
  `${x.name[lang]} (${terms(x.deal?.amountEGP, x.deal?.equityPct, lang) || L(lang, 'terms not disclosed', 'الشروط غير معلنة')}${L(lang, ', ', '، ')}${seasonLabel(x.season, lang)})`;
/** Arabic counted noun: ١ صفقة واحدة، ٢ صفقتان، ٣–١٠ صفقات، ١١+ صفقة */
const nAr = (n: number, one: string, two: string, few: string) =>
  n === 1 ? `${one} واحدة` : n === 2 ? two : n <= 10 ? `${num(n, 'ar')} ${few}` : `${num(n, 'ar')} ${one}`;
const dealsAr = (n: number) => nAr(n, 'صفقة', 'صفقتان', 'صفقات');
const PLATFORM: Record<string, string> = { linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', x: 'X', twitter: 'X', whatsapp: 'WhatsApp', appStore: 'App Store', googlePlay: 'Google Play', linktree: 'Linktree' };
const NOTE = { en: 'Figures cover the deals recorded in this directory.', ar: 'الأرقام تشمل الصفقات المسجلة في هذا الدليل.' };

export const sharkFaq = (p: Shark, lang: Lang): QA[] => {
  const n = p.name[lang], deals = p.deals;
  const withAmount = deals.filter((x) => x.deal?.amountEGP != null);
  const total = withAmount.reduce((a, x) => a + x.deal!.amountEGP!, 0);
  const eqs = deals.map((x) => x.deal?.equityPct).filter((v): v is number => v != null);
  const sectors = count(deals.map((x) => x.category).filter(Boolean) as string[]);
  const partners = count(deals.flatMap((x) => (x.deal?.sharks ?? []).filter((k) => k !== p.key)));
  const big = biggest(deals);
  const latest = [...deals].sort((a, b) => b.season - a.season || (b.episode ?? 0) - (a.episode ?? 0))[0];
  const ss = list(p.seasons.map((s) => seasonLabel(s, lang)), lang);
  const qa: (QA | false)[] = [
    { q: L(lang, `Who is ${n}?`, `من ${n}؟`),
      a: `${p.bio?.[lang] ?? (p.title ? `${n}: ${p.title[lang]}.` : '')} ${L(lang, `${n} is one of the sharks (investors) on ${ST.en}, appearing in ${ss}.`, `${n} من المستثمرين (الشاركس) في ${ST.ar}، في ${ss}.`)}`.trim() },
    { q: L(lang, `How many deals has ${n} made on ${ST.en}?`, `كم عدد صفقات ${n} في ${ST.ar}؟`),
      a: deals.length
        ? L(lang, `${n} has ${deals.length} recorded deal${deals.length > 1 ? 's' : ''} on the show: ${list(deals.map((x) => x.name.en), lang)}.`,
            `في رصيد ${n} ${dealsAr(deals.length)} في البرنامج: ${list(deals.map((x) => x.name.ar), lang)}.`)
        : L(lang, `No deals by ${n} are recorded in this directory yet.`, `لا توجد صفقات مسجلة باسم ${n} في هذا الدليل حتى الآن.`) },
    withAmount.length > 0 && { q: L(lang, `How much has ${n} invested on ${ST.en}?`, `كم بلغت استثمارات ${n} في ${ST.ar}؟`),
      a: L(lang, `The ${withAmount.length} deal${withAmount.length > 1 ? 's' : ''} ${n} joined with a disclosed amount add up to ${money(total, lang)}. Joint deals are counted at their full value, shared with the other sharks. ${NOTE.en}`,
        `مجموع قيم الصفقات المعلنة في محفظة ${n} (${dealsAr(withAmount.length)}) هو ${money(total, lang)}. الصفقات المشتركة محسوبة بقيمتها الكاملة رغم تقاسمها مع مستثمرين آخرين. ${NOTE.ar}`) },
    deals.length > 0 && { q: L(lang, `Which companies has ${n} invested in on ${ST.en}?`, `ما الشركات في محفظة ${n} في ${ST.ar}؟`),
      a: list(deals.map((x) => dealLine(x, lang)), lang) + '.' },
    big && { q: L(lang, `What is ${n}'s biggest deal on ${ST.en}?`, `ما أكبر صفقة في محفظة ${n} في ${ST.ar}؟`),
      a: L(lang, `${big.name.en}: ${terms(big.deal!.amountEGP, big.deal!.equityPct, lang)} in ${where(big, lang)}${big.deal!.sharks!.length > 1 ? `, together with ${list(big.deal!.sharks!.filter((k) => k !== p.key).map((k) => sharkName(k, lang)), lang)}` : ''}.`,
        `${big.name.ar}: ${terms(big.deal!.amountEGP, big.deal!.equityPct, lang)} في ${where(big, lang)}${big.deal!.sharks!.length > 1 ? `، بالشراكة مع ${list(big.deal!.sharks!.filter((k) => k !== p.key).map((k) => sharkName(k, lang)), lang)}` : ''}.`) },
    eqs.length > 0 && { q: L(lang, `How much equity does ${n} usually take?`, `ما متوسط حصة ${n} في الصفقات؟`),
      a: L(lang, `On average ${pct(Math.round(eqs.reduce((a, b) => a + b, 0) / eqs.length), lang)} across ${eqs.length} deal${eqs.length > 1 ? 's' : ''} with disclosed equity, ranging from ${pct(Math.min(...eqs), lang)} to ${pct(Math.max(...eqs), lang)}.`,
        `في المتوسط ${pct(Math.round(eqs.reduce((a, b) => a + b, 0) / eqs.length), lang)} عبر ${dealsAr(eqs.length)} معلنة الحصة، بين ${pct(Math.min(...eqs), lang)} و${pct(Math.max(...eqs), lang)}.`) },
    sectors.length > 0 && { q: L(lang, `What sectors does ${n} invest in?`, `ما أبرز القطاعات في استثمارات ${n}؟`),
      a: L(lang, `Mostly ${list(sectors.slice(0, 4).map(([c, k]) => `${category(c, lang)} (${k})`), lang)}.`, `غالباً في ${list(sectors.slice(0, 4).map(([c, k]) => `${category(c, lang)} (${num(k, lang)})`), lang)}.`) },
    partners.length > 0 && { q: L(lang, `Which sharks does ${n} invest with most often?`, `من أكثر شركاء ${n} في الصفقات؟`),
      a: list(partners.slice(0, 4).map(([k, c]) => `${sharkName(k, lang)} (${L(lang, `${c} deal${c > 1 ? 's' : ''}`, dealsAr(c))})`), lang) + '.' },
    { q: L(lang, `Which seasons of ${ST.en} was ${n} in?`, `ما مواسم ${n} في ${ST.ar}؟`), a: `${ss}.` },
    latest && { q: L(lang, `What was ${n}'s most recent deal?`, `ما أحدث صفقات ${n}؟`), a: `${dealLine(latest, lang)}.` },
  ];
  return qa.filter(Boolean) as QA[];
};

export const startupFaq = (x: Startup, lang: Lang): QA[] => {
  const n = x.name[lang], d = x.deal;
  const fs = (x.founders ?? []).map((f) => founderName(f, lang));
  const askV = valuation(x.ask?.amountEGP, x.ask?.equityPct), dealV = valuation(d?.amountEGP, d?.equityPct);
  const ds = list((d?.sharks ?? []).map((k) => sharkName(k, lang)), lang);
  const svc = ((x as any).services?.[lang] ?? []) as { name: string }[];
  const about = (x as any).about as { founded?: number; city?: { en: string; ar: string } } | undefined;
  const platforms = Object.keys(x.links ?? {}).filter((k) => k !== 'other').map((k) => PLATFORM[k] ?? k[0].toUpperCase() + k.slice(1));
  const same = x.category ? startups.filter((y) => y.category === x.category).length - 1 : 0;
  const y = year(x.season);
  const qa: (QA | false)[] = [
    { q: L(lang, `What is ${n}?`, `ما هي ${n}؟`), a: x.description[lang] },
    fs.length > 0 && { q: L(lang, `Who founded ${n}?`, `من مؤسس ${n}؟`),
      a: L(lang, `${n} was founded by ${list(fs, lang)}, who pitched it on ${ST.en}.`, `أسس ${n} ${list(fs, lang)}، وعُرضت في ${ST.ar}.`) },
    { q: L(lang, `When did ${n} appear on ${ST.en}?`, `متى ظهرت ${n} في ${ST.ar}؟`),
      a: L(lang, `In ${where(x, lang)}${y ? ` (${y})` : ''}.`, `في ${where(x, lang)}${y ? ` (${y})` : ''}.`) },
    x.ask?.amountEGP != null && { q: L(lang, `How much did ${n} ask for on ${ST.en}?`, `كم طلبت ${n} في ${ST.ar}؟`),
      a: L(lang, `${terms(x.ask.amountEGP, x.ask.equityPct, lang)}${askV ? `, valuing the company at ${money(askV, lang)}` : ''}.`, `${terms(x.ask.amountEGP, x.ask.equityPct, lang)}${askV ? `، أي بتقييم ${money(askV, lang)}` : ''}.`) },
    { q: L(lang, `Did ${n} get a deal on ${ST.en}?`, `هل حصلت ${n} على صفقة في ${ST.ar}؟`),
      a: d?.made === true ? L(lang, `Yes${ds ? `, with ${ds}` : ''}${terms(d.amountEGP, d.equityPct, lang) ? `: ${terms(d.amountEGP, d.equityPct, lang)}` : ''}.`, `نعم${ds ? `، مع ${ds}` : ''}${terms(d.amountEGP, d.equityPct, lang) ? `: ${terms(d.amountEGP, d.equityPct, lang)}` : ''}.`)
        : d?.made === false ? L(lang, `No. ${n} left the tank without a deal.`, `لا، غادرت ${n} البرنامج دون صفقة.`)
        : L(lang, `The outcome of the pitch isn't recorded in this directory yet.`, `لم تُسجَّل نتيجة العرض في هذا الدليل بعد.`) },
    d?.made === true && !!ds && { q: L(lang, `Which shark invested in ${n}?`, `من المستثمر الذي استثمر في ${n}؟`),
      a: L(lang, `${ds}.`, `${ds}.`), href: d.sharks!.length === 1 ? `sharks/${sharkByKey.get(d.sharks![0])?.id}/` : undefined },
    d?.made === true && dealV != null && { q: L(lang, `What is ${n}'s valuation on ${ST.en}?`, `كم تقييم ${n} في ${ST.ar}؟`),
      a: L(lang, `The final deal valued ${n} at ${money(dealV, lang)}${askV ? `, against ${money(askV, lang)} in the founders' ask` : ''}.`, `قيّمت الصفقة النهائية ${n} بـ${money(dealV, lang)}${askV ? `، مقابل ${money(askV, lang)} في طلب المؤسسين` : ''}.`) },
    svc.length > 0 && { q: L(lang, `What does ${n} offer?`, `ما الخدمات التي تقدمها ${n}؟`), a: list(svc.map((s) => s.name), lang) + '.' },
    !!(about?.city || about?.founded) && { q: L(lang, `Where is ${n} based and when was it founded?`, `أين يقع مقر ${n} ومتى تأسست؟`),
      a: [about?.city && L(lang, `${n} is based in ${about.city.en}, Egypt.`, `مقر ${n} في ${about.city.ar}، مصر.`), about?.founded && L(lang, `Founded in ${about.founded}.`, `تأسست عام ${num(about.founded, lang).replace(/٬|,/g, '')}.`)].filter(Boolean).join(' ') },
    (!!x.website || platforms.length > 0) && { q: L(lang, `What is ${n}'s website and social media?`, `ما موقع ${n} الإلكتروني وحساباتها على مواقع التواصل؟`),
      a: [x.website && L(lang, `Website: ${x.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}.`, `الموقع: ${x.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}.`),
        platforms.length > 0 && L(lang, `On ${list(platforms, lang)}; links are on this page.`, `على ${list(platforms, lang)}، والروابط في هذه الصفحة.`)].filter(Boolean).join(' ') },
    !!x.video && { q: L(lang, `Where can I watch ${n}'s pitch?`, `أين أشاهد عرض ${n}؟`),
      a: L(lang, `The pitch from ${where(x, lang)} is on YouTube: youtube.com/watch?v=${x.video}`, `عرض ${where(x, lang)} متاح على يوتيوب: youtube.com/watch?v=${x.video}`) },
    !!x.category && { q: L(lang, `What sector is ${n} in?`, `في أي قطاع تعمل ${n}؟`),
      a: L(lang, `${category(x.category, lang)}. ${same} other ${category(x.category, lang)} startup${same === 1 ? '' : 's'} pitched on the show.`, `${category(x.category, lang)}. ${same ? `ظهرت ${nAr(same, 'شركة', 'شركتان', 'شركات')} أخرى من القطاع نفسه في البرنامج.` : ''}`), href: `category/${x.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` },
  ];
  return qa.filter(Boolean) as QA[];
};

export const founderFaq = (p: Founder, lang: Lang): QA[] => {
  const n = p.name[lang], xs = p.startups;
  const names = list(xs.map((x) => x.name[lang]), lang);
  const co = [...new Set(xs.flatMap((x) => x.founders ?? []))].filter((k) => founderId(k) !== p.id).map((k) => founderName(k, lang));
  const won = xs.filter((x) => x.deal?.made);
  const qa: (QA | false)[] = [
    { q: L(lang, `Who is ${n}?`, `من ${n}؟`),
      a: p.bio?.[lang] ?? L(lang, `${n} is the founder of ${names}, which pitched on ${ST.en} in ${list(xs.map((x) => where(x, lang)), lang)}.`, `${n} من مؤسسي ${names}، التي عُرضت في ${ST.ar} في ${list(xs.map((x) => where(x, lang)), lang)}.`) },
    { q: L(lang, `What company did ${n} pitch on ${ST.en}?`, `ما شركة ${n} في ${ST.ar}؟`),
      a: xs.map((x) => `${x.name[lang]}: ${x.description[lang].split(/(?<=[.!؟])\s/)[0]}`).join(' ') },
    { q: L(lang, `Did ${n} get a deal on ${ST.en}?`, `هل حصل مشروع ${n} على صفقة في ${ST.ar}؟`),
      a: xs.map((x) => x.deal?.made === true
        ? L(lang, `Yes, ${x.name.en} closed a deal with ${list((x.deal.sharks ?? []).map((k) => sharkName(k, lang)), lang) || 'the sharks'}${terms(x.deal.amountEGP, x.deal.equityPct, lang) ? `: ${terms(x.deal.amountEGP, x.deal.equityPct, lang)}` : ''}.`,
            `نعم، أبرمت ${x.name.ar} صفقة مع ${list((x.deal.sharks ?? []).map((k) => sharkName(k, lang)), lang) || 'المستثمرين'}${terms(x.deal.amountEGP, x.deal.equityPct, lang) ? `: ${terms(x.deal.amountEGP, x.deal.equityPct, lang)}` : ''}.`)
        : x.deal?.made === false ? L(lang, `No, ${x.name.en} left without a deal.`, `لا، غادرت ${x.name.ar} دون صفقة.`)
        : L(lang, `The outcome for ${x.name.en} isn't recorded yet.`, `لم تُسجَّل نتيجة ${x.name.ar} بعد.`)).join(' ') },
    won.length > 0 && { q: L(lang, `Which shark invested in ${n}'s company?`, `من المستثمر الذي استثمر في شركة ${n}؟`),
      a: list([...new Set(won.flatMap((x) => x.deal!.sharks ?? []))].map((k) => sharkName(k, lang)), lang) + '.' },
    xs.some((x) => x.ask?.amountEGP != null) && { q: L(lang, `How much did ${n} ask for on ${ST.en}?`, `كم كان طلب ${n} في ${ST.ar}؟`),
      a: xs.filter((x) => x.ask?.amountEGP != null).map((x) => `${x.name[lang]}: ${terms(x.ask!.amountEGP, x.ask!.equityPct, lang)}.`).join(' ') },
    co.length > 0 && { q: L(lang, `Who are ${n}'s co-founders?`, `من هم شركاء ${n} في التأسيس؟`), a: list(co, lang) + '.' },
  ];
  return qa.filter(Boolean) as QA[];
};

export const seasonFaq = (n: number, lang: Lang): QA[] => {
  const xs = startups.filter((x) => x.season === n), st = stats(xs), info = seasons.find((s) => s.season === n);
  const label = seasonLabel(n, lang), big = biggest(xs);
  const sectors = count(xs.map((x) => x.category).filter(Boolean) as string[]);
  const qa: (QA | false)[] = [
    !!info && { q: L(lang, `When did ${ST.en} ${label} air?`, `متى عُرض ${label} من ${ST.ar}؟`),
      a: L(lang, `${label} aired in ${info.year} on ${info.channel}.`, `عُرض ${label} في ${info.year} على ${info.channel.replace('special episodes', 'حلقات خاصة')}.`) },
    !!info && { q: L(lang, `Who are the sharks in ${ST.en} ${label}?`, `من هم المستثمرون في ${label} من ${ST.ar}؟`), a: list(info.sharks.map((k) => sharkName(k, lang)), lang) + '.' },
    { q: L(lang, `How many startups pitched in ${ST.en} ${label}?`, `كم شركة ناشئة عُرضت في ${label} من ${ST.ar}؟`),
      a: L(lang, `${st.count} startups are listed for ${label}.`, `يضم الدليل ${nAr(st.count, 'شركة', 'شركتين', 'شركات')} من ${label}.`) },
    { q: L(lang, `How many deals were made in ${ST.en} ${label}?`, `كم صفقة أُبرمت في ${label} من ${ST.ar}؟`),
      a: L(lang, `${st.deals} recorded deals${st.invested ? `, worth ${money(st.invested, lang)} in disclosed investment` : ''}. ${NOTE.en}`, `${dealsAr(st.deals)} مسجلة${st.invested ? ` بقيمة استثمارات معلنة ${money(st.invested, lang)}` : ''}. ${NOTE.ar}`) },
    big && { q: L(lang, `What was the biggest deal in ${ST.en} ${label}?`, `ما أكبر صفقة في ${label} من ${ST.ar}؟`),
      a: L(lang, `${big.name.en}, with ${list((big.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}: ${terms(big.deal!.amountEGP, big.deal!.equityPct, lang)}.`, `${big.name.ar} مع ${list((big.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}: ${terms(big.deal!.amountEGP, big.deal!.equityPct, lang)}.`), href: `${big.id}/` },
    st.topSharks.length > 0 && { q: L(lang, `Which shark made the most deals in ${label}?`, `أي مستثمر أبرم أكثر الصفقات في ${label}؟`),
      a: list(st.topSharks.slice(0, 3).map(([k, c]) => `${sharkName(k, lang)} (${num(c, lang)})`), lang) + '.' },
    sectors.length > 0 && { q: L(lang, `What kinds of startups pitched in ${label}?`, `ما نوع الشركات التي عُرضت في ${label}؟`),
      a: L(lang, `Mostly ${list(sectors.slice(0, 4).map(([c, k]) => `${category(c, lang)} (${k})`), lang)}.`, `غالباً ${list(sectors.slice(0, 4).map(([c, k]) => `${category(c, lang)} (${num(k, lang)})`), lang)}.`) },
  ];
  return qa.filter(Boolean) as QA[];
};

export const categoryFaq = (c: string, lang: Lang): QA[] => {
  const xs = startups.filter((x) => x.category === c), st = stats(xs), cat = category(c, lang), big = biggest(xs);
  const qa: (QA | false)[] = [
    { q: L(lang, `Which ${cat} startups appeared on ${ST.en}?`, `ما شركات قطاع ${cat} التي ظهرت في ${ST.ar}؟`),
      a: L(lang, `${xs.length}: ${list(xs.map((x) => x.name.en), lang)}.`, `${nAr(xs.length, 'شركة', 'شركتان', 'شركات')}: ${list(xs.map((x) => x.name.ar), lang)}.`) },
    { q: L(lang, `How many ${cat} startups got a deal on ${ST.en}?`, `كم شركة في قطاع ${cat} حصلت على صفقة في ${ST.ar}؟`),
      a: L(lang, `${st.deals} of ${st.count}${st.invested ? `, with ${money(st.invested, lang)} in disclosed investment` : ''}. ${NOTE.en}`, `${num(st.deals, lang)} من ${num(st.count, lang)}${st.invested ? `، باستثمارات معلنة ${money(st.invested, lang)}` : ''}. ${NOTE.ar}`) },
    st.topSharks.length > 0 && { q: L(lang, `Which sharks invest in ${cat} on ${ST.en}?`, `من المستثمرون في قطاع ${cat} في ${ST.ar}؟`),
      a: list(st.topSharks.map(([k, n]) => `${sharkName(k, lang)} (${num(n, lang)})`), lang) + '.' },
    big && { q: L(lang, `What is the biggest ${cat} deal on ${ST.en}?`, `ما أكبر صفقة في قطاع ${cat} في ${ST.ar}؟`),
      a: `${dealLine(big, lang)}.`, href: `${big.id}/` },
  ];
  return qa.filter(Boolean) as QA[];
};

/** Program-wide questions for the FAQ hub, grouped. */
export const programFaq = (lang: Lang) => {
  const st = stats(startups), all = startups.filter((x) => x.deal?.made);
  const big = biggest(startups);
  const asks = startups.filter((x) => valuation(x.ask?.amountEGP, x.ask?.equityPct)).sort((a, b) => valuation(b.ask!.amountEGP, b.ask!.equityPct)! - valuation(a.ask!.amountEGP, a.ask!.equityPct)!)[0];
  const byMoney = sharks.map((p) => [p, p.deals.reduce((a, x) => a + (x.deal?.amountEGP ?? 0), 0)] as const).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const pairs = count(all.flatMap((x) => { const s = [...(x.deal?.sharks ?? [])].sort(); return s.flatMap((a, i) => s.slice(i + 1).map((b) => `${a}|${b}`)); }));
  const sectorDeals = count(all.map((x) => x.category).filter(Boolean) as string[]);
  const sectorAll = count(startups.map((x) => x.category).filter(Boolean) as string[]);
  const numbered = seasons.filter((s) => s.season > 0), last = numbered.at(-1)!;
  const everySeason = sharks.filter((p) => numbered.every((s) => p.seasons.includes(s.season)));
  const firstIn = (p: Shark) => Math.min(...p.seasons.filter((s) => s > 0));
  const newest = sharks.filter((p) => p.seasons.some((s) => s > 0) && firstIn(p) === Math.max(...sharks.filter((q) => q.seasons.some((s) => s > 0)).map(firstIn)));
  const general: (QA | false)[] = [
    { q: L(lang, `What is ${ST.en}?`, `ما هو ${ST.ar}؟`),
      a: L(lang, `${ST.en} (شارك تانك مصر) is the Egyptian edition of the Shark Tank / Dragons' Den format, aired on CBC and WATCH IT since ${seasons.find((s) => s.season === 1)?.year}. Founders pitch their startups to a panel of investors ("sharks") and ask for money in exchange for equity.`,
        `${ST.ar} (Shark Tank Egypt) هو النسخة المصرية من برنامج Shark Tank، ويُعرض على CBC وWATCH IT منذ ${seasons.find((s) => s.season === 1)?.year}. يعرض فيه رواد الأعمال مشروعاتهم على لجنة من المستثمرين (الشاركس) ويطلبون تمويلاً مقابل حصة من الشركة.`) },
    { q: L(lang, `How many seasons of ${ST.en} are there?`, `كم موسماً من ${ST.ar}؟`),
      a: L(lang, `${numbered.length} seasons so far (${numbered[0].year} to ${last.year}), plus a set of special episodes with Robert Herjavec in July 2025.`, `${num(numbered.length, lang)} مواسم حتى الآن (من ${numbered[0].year} إلى ${last.year})، إلى جانب حلقات خاصة مع روبرت هيرجافيك في يوليو 2025.`) },
    { q: L(lang, `Who are the sharks on ${ST.en}?`, `من هم المستثمرون في ${ST.ar}؟`),
      a: L(lang, `${sharks.length} investors have sat on the panel: ${list(sharks.map((p) => p.name.en), lang)}.`, `جلس ${num(sharks.length, lang)} مستثمراً في اللجنة: ${list(sharks.map((p) => p.name.ar), lang)}.`), href: 'sharks/' },
    { q: L(lang, `Who are the sharks in the latest season of ${ST.en}?`, `من هم المستثمرون في أحدث مواسم ${ST.ar}؟`),
      a: L(lang, `${seasonLabel(last.season, lang)} (${last.year}): ${list(last.sharks.map((k) => sharkName(k, lang)), lang)}.`, `${seasonLabel(last.season, lang)} (${last.year}): ${list(last.sharks.map((k) => sharkName(k, lang)), lang)}.`), href: `season/${last.season}/` },
    everySeason.length > 0 && { q: L(lang, `Which sharks have appeared in every season?`, `من المستثمرون الذين ظهروا في كل المواسم؟`), a: list(everySeason.map((p) => p.name[lang]), lang) + '.' },
    newest.length > 0 && { q: L(lang, `Who are the newest sharks on ${ST.en}?`, `من أحدث المستثمرين في ${ST.ar}؟`),
      a: L(lang, `${list(newest.map((p) => p.name.en), lang)}, who joined in ${seasonLabel(firstIn(newest[0]), lang)}.`, `${list(newest.map((p) => p.name.ar), lang)}، وانضموا في ${seasonLabel(firstIn(newest[0]), lang)}.`) },
    { q: L(lang, `How many startups have pitched on ${ST.en}?`, `كم شركة ناشئة عُرضت في ${ST.ar}؟`),
      a: L(lang, `This directory lists ${st.count} startups across all seasons and specials.`, `يضم هذا الدليل ${nAr(st.count, 'شركة', 'شركتين', 'شركات')} من كل المواسم والحلقات الخاصة.`), href: '' },
    { q: L(lang, `How many deals have been made on ${ST.en}?`, `كم صفقة أُبرمت في ${ST.ar}؟`),
      a: L(lang, `${st.deals} recorded deals, worth ${money(st.invested, lang)} in disclosed investment. ${NOTE.en}`, `${dealsAr(st.deals)} مسجلة بقيمة استثمارات معلنة ${money(st.invested, lang)}. ${NOTE.ar}`) },
    big && { q: L(lang, `What is the biggest deal in ${ST.en} history?`, `ما أكبر صفقة في تاريخ ${ST.ar}؟`),
      a: `${dealLine(big, lang)}${L(lang, `, with ${list((big.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}`, `، مع ${list((big.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}`)}.`, href: `${big.id}/` },
    asks && { q: L(lang, `Which startup asked for the highest valuation on ${ST.en}?`, `أي شركة طلبت أعلى تقييم في ${ST.ar}؟`),
      a: L(lang, `${asks.name.en} asked for ${terms(asks.ask!.amountEGP, asks.ask!.equityPct, lang)}, a ${money(valuation(asks.ask!.amountEGP, asks.ask!.equityPct), lang)} valuation.`, `طلبت ${asks.name.ar} ${terms(asks.ask!.amountEGP, asks.ask!.equityPct, lang)}، أي بتقييم ${money(valuation(asks.ask!.amountEGP, asks.ask!.equityPct), lang)}.`), href: `${asks.id}/` },
    { q: L(lang, `Which shark has made the most deals on ${ST.en}?`, `أي مستثمر أبرم أكثر الصفقات في ${ST.ar}؟`),
      a: list(sharks.filter((p) => p.deals.length).slice(0, 3).map((p) => `${p.name[lang]} (${num(p.deals.length, lang)})`), lang) + '.', href: `sharks/${sharks[0].id}/` },
    byMoney.length > 0 && { q: L(lang, `Which shark has invested the most money on ${ST.en}?`, `أي مستثمر ضخ أكبر قدر من الأموال في ${ST.ar}؟`),
      a: L(lang, `${list(byMoney.slice(0, 3).map(([p, v]) => `${p.name.en} (${money(v, lang)})`), lang)}, counting the full value of deals each took part in.`, `${list(byMoney.slice(0, 3).map(([p, v]) => `${p.name.ar} (${money(v, lang)})`), lang)}، بحساب القيمة الكاملة للصفقات التي شارك فيها كل منهم.`), href: `sharks/${byMoney[0][0].id}/` },
    pairs.length > 0 && { q: L(lang, `Which sharks invest together most often?`, `أي المستثمرين يشتركون في الصفقات معاً أكثر؟`),
      a: list(pairs.slice(0, 3).map(([k, c]) => `${k.split('|').map((n) => sharkName(n, lang)).join(L(lang, ' & ', ' و'))} (${num(c, lang)})`), lang) + '.' },
    { q: L(lang, `What kinds of startups pitch on ${ST.en}?`, `ما أنواع الشركات التي تُعرض في ${ST.ar}؟`),
      a: L(lang, `Most often ${list(sectorAll.slice(0, 5).map(([c, k]) => `${category(c, lang)} (${k})`), lang)}.`, `غالباً ${list(sectorAll.slice(0, 5).map(([c, k]) => `${category(c, lang)} (${num(k, lang)})`), lang)}.`) },
    sectorDeals.length > 0 && { q: L(lang, `Which sector gets the most deals on ${ST.en}?`, `أي قطاع يحصل على أكثر الصفقات في ${ST.ar}؟`),
      a: list(sectorDeals.slice(0, 3).map(([c, k]) => `${category(c, lang)} (${num(k, lang)})`), lang) + '.', href: `category/${sectorDeals[0][0].toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` },
    { q: L(lang, `Where can I watch ${ST.en}?`, `أين أشاهد ${ST.ar}؟`),
      a: L(lang, `On CBC (TV) and the WATCH IT streaming app. Many pitches are also on YouTube, linked from each startup page here.`, `على قناة CBC ومنصة WATCH IT، والكثير من العروض متاح على يوتيوب وروابطها في صفحة كل شركة هنا.`) },
  ];
  return {
    general: general.filter(Boolean) as QA[],
    sharks: sharks.map((p) => ({ p, qa: sharkFaq(p, lang).slice(1, 4) })),
    seasons: [...seasons].sort((a, b) => a.season - b.season).map((s) => ({ n: s.season, qa: seasonFaq(s.season, lang).slice(0, 5) })),
    categories: categories.map((c) => ({ c, qa: categoryFaq(c, lang).slice(1, 4) })),
  };
};
