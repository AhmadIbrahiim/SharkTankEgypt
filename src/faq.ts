// FAQ built from the data, in both languages, phrased the way people search
// ("How much did Ayman Abbas invest on Shark Tank Egypt?", "كم استثمر أيمن عباس في شارك تانك مصر؟").
// Every answer states only what the data records; unknowns are said plainly, never guessed.
import { scheduledAppearance, startups, seasons, sharks, founders, sharkByKey, categories, category, money, pct, num, valuation, seasonLabel, shark, founderId, stats, type Lang, type Startup } from './config';

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
const dealsAr = (n: number) => nAr(n, 'صفقة', 'صفقتين', 'صفقات'); // oblique dual: most uses follow a preposition (عبر، في)
const PLATFORM: Record<string, string> = { linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', x: 'X', twitter: 'X', whatsapp: 'WhatsApp', appStore: 'App Store', googlePlay: 'Google Play', linktree: 'Linktree' };
const median = (xs: number[]) => { if (!xs.length) return null; const a = [...xs].sort((p, q) => p - q), m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const dealValuation = (x: Startup) => valuation(x.deal?.amountEGP, x.deal?.equityPct);
const byDealValuation = (xs: Startup[]) => xs.filter((x) => x.deal?.made && dealValuation(x)).sort((a, b) => dealValuation(b)! - dealValuation(a)!);
const lastSeason = Math.max(...seasons.map((s) => s.season));
/** One factual sentence per startup, from the data only: the line LLMs and readers can lift as the answer. */
export const summary = (x: Startup, lang: Lang) => {
  const scheduled = scheduledAppearance(x);
  if (scheduled) return L(lang, `${x.name.en} is announced for ${where(x, lang)}.`, `أُعلنت مشاركة ${x.name.ar} في ${where(x, lang)}.`) + ' ' + scheduled.scheduleNote[lang];
  const names = list((x.deal?.sharks ?? []).map((n) => sharkName(n, lang)), lang);
  const askV = valuation(x.ask?.amountEGP, x.ask?.equityPct);
  return lang === 'ar'
    ? [`عرض فريق ${x.name.ar} مشروعه في ${where(x, lang)}.`,
       x.ask?.amountEGP != null && `طلب المؤسسون ${money(x.ask.amountEGP, lang)}${x.ask.equityPct != null ? ` مقابل ${pct(x.ask.equityPct, lang)}` : ''}${askV ? `، أي بتقييم ${money(askV, lang)}` : ''}.`,
       x.deal?.made === true && `انتهى العرض بصفقة${names ? ` مع ${names}` : ''}${x.deal.amountEGP != null ? ` بقيمة ${money(x.deal.amountEGP, lang)}` : ''}${x.deal.equityPct != null ? ` مقابل ${pct(x.deal.equityPct, lang)}` : ''}.`,
       x.deal?.made === false && 'غادر الفريق دون صفقة.',
       x.deal?.made == null && 'لا يوجد مصدر علني يؤكد نتيجة العرض حتى الآن.'].filter(Boolean).join(' ')
    : [`${x.name.en} pitched in ${where(x, lang)}.`,
       x.ask?.amountEGP != null && `The founders asked for ${money(x.ask.amountEGP, lang)}${x.ask.equityPct != null ? ` for ${pct(x.ask.equityPct, lang)}` : ''}${askV ? `, valuing the company at ${money(askV, lang)}` : ''}.`,
       x.deal?.made === true && `They walked away with a deal${names ? ` with ${names}` : ''}${x.deal.amountEGP != null ? `: ${money(x.deal.amountEGP, lang)}` : ''}${x.deal.equityPct != null ? ` for ${pct(x.deal.equityPct, lang)}` : ''}.`,
       x.deal?.made === false && 'They left without a deal.',
       x.deal?.made == null && 'No public source confirms the outcome yet.'].filter(Boolean).join(' ');
};
/** [season, episode] pairs that have startups, in airing order. */
export const episodes = [...new Set(startups.filter((x) => x.episode != null).map((x) => `${x.season}-${x.episode}`))]
  .map((k) => k.split('-').map(Number) as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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
  const first = [...deals].sort((a, b) => a.season - b.season || (a.episode ?? 99) - (b.episode ?? 99))[0];
  const small = [...withAmount].sort((a, b) => a.deal!.amountEGP! - b.deal!.amountEGP!)[0];
  const perSeason = count(deals.map((x) => x.season)).sort((a, b) => b[0] - a[0]);
  const solo = deals.filter((x) => (x.deal?.sharks ?? []).length === 1).length;
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
    first && first !== latest && { q: L(lang, `What was ${n}'s first deal on ${ST.en}?`, `ما أول صفقة في محفظة ${n} في ${ST.ar}؟`), a: `${dealLine(first, lang)}.`, href: `${first.id}/` },
    small && small !== big && { q: L(lang, `What is ${n}'s smallest deal?`, `ما أصغر صفقة في محفظة ${n}؟`), a: `${dealLine(small, lang)}.`, href: `${small.id}/` },
    perSeason.length > 1 && { q: L(lang, `How many deals did ${n} make each season?`, `ما عدد صفقات ${n} في كل موسم؟`),
      a: list(perSeason.map(([k, c]) => `${seasonLabel(k, lang)}: ${L(lang, String(c), num(c, lang))}`), lang) + '.', href: `sharks/${p.id}/season/${perSeason[0][0]}/` },
    deals.length > 1 && { q: L(lang, `Does ${n} invest alone or with other sharks?`, `هل صفقات ${n} منفردة أم بالشراكة مع مستثمرين آخرين؟`),
      a: L(lang, `${solo} of ${n}'s ${deals.length} deals were solo and ${deals.length - solo} were shared with other sharks.`, `من بين ${dealsAr(deals.length)} في محفظة ${n}، ${num(solo, lang)} منفردة و${num(deals.length - solo, lang)} مشتركة مع مستثمرين آخرين.`) },
    { q: L(lang, `Is ${n} in the latest season of ${ST.en}?`, `هل ${n} ضمن مستثمري أحدث مواسم ${ST.ar}؟`),
      a: p.seasons.includes(lastSeason) ? L(lang, `Yes, ${n} is on the panel of ${seasonLabel(lastSeason, lang)}.`, `نعم، ${n} ضمن لجنة ${seasonLabel(lastSeason, lang)}.`)
        : L(lang, `No. ${n} last appeared in ${seasonLabel(Math.max(...p.seasons), lang)}.`, `لا، كان آخر ظهور ${n} في ${seasonLabel(Math.max(...p.seasons), lang)}.`), href: `season/${lastSeason}/` },
    // Egyptian-dialect phrasing: how people actually type it in Arabic search.
    lang === 'ar' && deals.length > 0 && { q: `صفقات ${n} في شارك تانك إيه؟`, a: `${list(deals.map((x) => x.name.ar), lang)}.` },
    lang === 'ar' && withAmount.length > 0 && { q: `استثمارات ${n} في شارك تانك مصر بكام؟`, a: `حوالي ${money(total, lang)} في ${dealsAr(withAmount.length)} معلنة القيمة. ${NOTE.ar}` },
  ];
  return qa.filter(Boolean) as QA[];
};

export const startupFaq = (x: Startup, lang: Lang): QA[] => {
  const n = x.name[lang], d = x.deal, scheduled = scheduledAppearance(x);
  const fs = (x.founders ?? []).map((f) => founderName(f, lang));
  const askV = valuation(x.ask?.amountEGP, x.ask?.equityPct), dealV = valuation(d?.amountEGP, d?.equityPct);
  const ds = list((d?.sharks ?? []).map((k) => sharkName(k, lang)), lang);
  const svc = ((x as any).services?.[lang] ?? []) as { name: string }[];
  const about = (x as any).about as { founded?: number; city?: { en: string; ar: string } } | undefined;
  const platforms = Object.keys(x.links ?? {}).filter((k) => k !== 'other').map((k) => PLATFORM[k] ?? k[0].toUpperCase() + k.slice(1));
  const same = x.category ? startups.filter((y) => y.category === x.category).length - 1 : 0;
  const y = year(x.season);
  const mates = x.episode != null ? startups.filter((o) => o !== x && o.season === x.season && o.episode === x.episode) : [];
  const seasonInfo = seasons.find((s) => s.season === x.season);
  const qa: (QA | false)[] = [
    { q: L(lang, `What is ${n}?`, `ما هي ${n}؟`), a: x.description[lang] },
    fs.length > 0 && { q: L(lang, `Who founded ${n}?`, `من مؤسس ${n}؟`),
      a: L(lang, `${n} was founded by ${list(fs, lang)}.`, `أسس ${n} ${list(fs, lang)}.`) },
    { q: L(lang, scheduled ? `When is ${n} scheduled on ${ST.en}?` : `When did ${n} appear on ${ST.en}?`, scheduled ? `متى موعد مشاركة ${n} في ${ST.ar}؟` : `متى ظهرت ${n} في ${ST.ar}؟`),
      a: scheduled ? summary(x, lang) : L(lang, `In ${where(x, lang)}${y ? ` (${y})` : ''}.`, `في ${where(x, lang)}${y ? ` (${y})` : ''}.`) },
    x.ask?.amountEGP != null && { q: L(lang, `How much did ${n} ask for on ${ST.en}?`, `كم طلبت ${n} في ${ST.ar}؟`),
      a: L(lang, `${terms(x.ask.amountEGP, x.ask.equityPct, lang)}${askV ? `, valuing the company at ${money(askV, lang)}` : ''}.`, `${terms(x.ask.amountEGP, x.ask.equityPct, lang)}${askV ? `، أي بتقييم ${money(askV, lang)}` : ''}.`) },
    { q: L(lang, `Did ${n} get a deal on ${ST.en}?`, `هل حصلت ${n} على صفقة في ${ST.ar}؟`),
      a: scheduled ? scheduled.scheduleNote[lang] : d?.made === true ? L(lang, `Yes${ds ? `, with ${ds}` : ''}${terms(d.amountEGP, d.equityPct, lang) ? `: ${terms(d.amountEGP, d.equityPct, lang)}` : ''}.`, `نعم${ds ? `، مع ${ds}` : ''}${terms(d.amountEGP, d.equityPct, lang) ? `: ${terms(d.amountEGP, d.equityPct, lang)}` : ''}.`)
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
    d?.made === true && d.equityPct != null && { q: L(lang, `How much equity did ${n} give up on ${ST.en}?`, `كم نسبة الحصة التي تنازلت عنها ${n} في ${ST.ar}؟`),
      a: L(lang, `${pct(d.equityPct, lang)}${x.ask?.equityPct != null ? `, against the ${pct(x.ask.equityPct, lang)} offered in the pitch` : ''}.`, `${pct(d.equityPct, lang)}${x.ask?.equityPct != null ? `، مقابل ${pct(x.ask.equityPct, lang)} عُرضت في البداية` : ''}.`) },
    d?.made === true && d.amountEGP != null && x.ask?.amountEGP != null && { q: L(lang, `Did ${n} get what it asked for on ${ST.en}?`, `هل حصلت ${n} على المبلغ الذي طلبته؟`),
      a: d.amountEGP === x.ask.amountEGP && d.equityPct === x.ask.equityPct ? L(lang, `Yes, the deal closed on the original terms: ${terms(d.amountEGP, d.equityPct, lang)}.`, `نعم، أُغلقت الصفقة بالشروط الأصلية: ${terms(d.amountEGP, d.equityPct, lang)}.`)
        : L(lang, `It asked for ${terms(x.ask.amountEGP, x.ask.equityPct, lang)} and closed at ${terms(d.amountEGP, d.equityPct, lang)}${askV && dealV ? `, so the valuation went from ${money(askV, lang)} to ${money(dealV, lang)}` : ''}.`,
            `طلبت ${terms(x.ask.amountEGP, x.ask.equityPct, lang)} وأُغلقت الصفقة على ${terms(d.amountEGP, d.equityPct, lang)}${askV && dealV ? `، فتغيّر التقييم من ${money(askV, lang)} إلى ${money(dealV, lang)}` : ''}.`) },
    !scheduled && x.episode != null && { q: L(lang, `Which episode of ${ST.en} was ${n} in?`, `في أي حلقة من ${ST.ar} ظهرت ${n}؟`),
      a: L(lang, `${where(x, lang)}.${mates.length ? ` Also in that episode: ${list(mates.map((y) => y.name.en), lang)}.` : ''}`, `${where(x, lang)}.${mates.length ? ` وفي الحلقة نفسها: ${list(mates.map((y) => y.name.ar), lang)}.` : ''}`), href: `season/${x.season}/episode/${x.episode}/` },
    !scheduled && !!seasonInfo && { q: L(lang, `Which sharks did ${n} pitch to?`, `أمام أي مستثمرين عرضت ${n} مشروعها؟`),
      a: L(lang, `The ${seasonLabel(x.season, lang)} panel: ${list(seasonInfo.sharks.map((k) => sharkName(k, lang)), lang)}.`, `لجنة ${seasonLabel(x.season, lang)}: ${list(seasonInfo.sharks.map((k) => sharkName(k, lang)), lang)}.`) },
    !scheduled && lang === 'ar' && { q: `${n} خدت كام من شارك تانك؟`,
      a: d?.made === true ? (terms(d.amountEGP, d.equityPct, lang) ? `${terms(d.amountEGP, d.equityPct, lang)}${ds ? ` من ${ds}` : ''}.` : `أبرمت صفقة${ds ? ` مع ${ds}` : ''} لكن الشروط غير معلنة.`) : d?.made === false ? 'لم تحصل على صفقة.' : 'لم تُسجَّل النتيجة بعد.' },
    !!x.category && { q: L(lang, `What sector is ${n} in?`, `في أي قطاع تعمل ${n}؟`),
      a: L(lang, `${category(x.category, lang)}. ${same} other ${category(x.category, lang)} startup${same === 1 ? '' : 's'} in this directory.`, `${category(x.category, lang)}. ${same ? `يضم الدليل ${nAr(same, 'شركة', 'شركتين', 'شركات')} أخرى من القطاع نفسه.` : ''}`), href: `category/${x.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` },
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
    { q: L(lang, `When was ${n} on ${ST.en}?`, `متى ظهر مشروع ${n} في ${ST.ar}؟`),
      a: xs.map((x) => `${x.name[lang]}: ${where(x, lang)}${year(x.season) ? ` (${year(x.season)})` : ''}.`).join(' '), href: xs[0].episode != null ? `season/${xs[0].season}/episode/${xs[0].episode}/` : `season/${xs[0].season}/` },
    lang === 'ar' && { q: `مشروع ${n} خد كام من شارك تانك؟`,
      a: xs.map((x) => x.deal?.made ? `${x.name.ar}: ${terms(x.deal.amountEGP, x.deal.equityPct, lang) || 'صفقة بشروط غير معلنة'}.` : x.deal?.made === false ? `${x.name.ar}: بدون صفقة.` : `${x.name.ar}: النتيجة غير مسجلة.`).join(' ') },
  ];
  return qa.filter(Boolean) as QA[];
};

export const seasonFaq = (n: number, lang: Lang): QA[] => {
  const xs = startups.filter((x) => x.season === n), st = stats(xs), info = seasons.find((s) => s.season === n);
  const label = seasonLabel(n, lang), big = biggest(xs);
  const sectors = count(xs.map((x) => x.category).filter(Boolean) as string[]);
  const eps = episodes.filter(([k]) => k === n).map(([, e]) => e);
  const noDeal = xs.filter((x) => x.deal?.made === false);
  const topV = byDealValuation(xs)[0];
  const qa: (QA | false)[] = [
    !!info && { q: L(lang, `When did ${ST.en} ${label} air?`, `متى عُرض ${label} من ${ST.ar}؟`),
      a: L(lang, `${label} aired in ${info.year} on ${info.channel}.`, `عُرض ${label} في ${info.year} على ${info.channel.replace('special episodes', 'حلقات خاصة')}.`) },
    !!info && { q: L(lang, `Who are the sharks in ${ST.en} ${label}?`, `من هم المستثمرون في ${label} من ${ST.ar}؟`), a: list(info.sharks.map((k) => sharkName(k, lang)), lang) + '.' },
    { q: L(lang, `How many startups are listed for ${ST.en} ${label}?`, `كم شركة ناشئة في دليل ${label} من ${ST.ar}؟`),
      a: L(lang, `${st.count} startups are listed for ${label}.`, `يضم الدليل ${nAr(st.count, 'شركة', 'شركتين', 'شركات')} من ${label}.`) },
    { q: L(lang, `How many deals were made in ${ST.en} ${label}?`, `كم صفقة أُبرمت في ${label} من ${ST.ar}؟`),
      a: L(lang, `${st.deals} recorded deals${st.invested ? `, worth ${money(st.invested, lang)} in disclosed investment` : ''}. ${NOTE.en}`, `${dealsAr(st.deals)} مسجلة${st.invested ? ` بقيمة استثمارات معلنة ${money(st.invested, lang)}` : ''}. ${NOTE.ar}`) },
    big && { q: L(lang, `What was the biggest deal in ${ST.en} ${label}?`, `ما أكبر صفقة في ${label} من ${ST.ar}؟`),
      a: L(lang, `${big.name.en}, with ${list((big.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}: ${terms(big.deal!.amountEGP, big.deal!.equityPct, lang)}.`, `${big.name.ar} مع ${list((big.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}: ${terms(big.deal!.amountEGP, big.deal!.equityPct, lang)}.`), href: `${big.id}/` },
    st.topSharks.length > 0 && { q: L(lang, `Which shark made the most deals in ${label}?`, `أي مستثمر أبرم أكثر الصفقات في ${label}؟`),
      a: list(st.topSharks.slice(0, 3).map(([k, c]) => `${sharkName(k, lang)} (${num(c, lang)})`), lang) + '.' },
    eps.length > 0 && { q: L(lang, `How many episodes are in ${ST.en} ${label}?`, `كم حلقة في ${label} من ${ST.ar}؟`),
      a: L(lang, `This directory covers ${eps.length} episodes of ${label} (episodes ${eps.join(', ')}).`, `يغطي الدليل ${num(eps.length, lang)} حلقة من ${label} (الحلقات ${eps.map((e) => num(e, lang)).join('، ')}).`), href: `season/${n}/episode/${eps[0]}/` },
    noDeal.length > 0 && { q: L(lang, `Which startups got no deal in ${label}?`, `ما الشركات التي لم تحصل على صفقة في ${label}؟`), a: list(noDeal.map((x) => x.name[lang]), lang) + '.' },
    topV && { q: L(lang, `Which startup got the highest valuation in ${label}?`, `أي شركة حصلت على أعلى تقييم في ${label}؟`),
      a: L(lang, `${topV.name.en}, valued at ${money(valuation(topV.deal!.amountEGP, topV.deal!.equityPct), lang)} in the final deal.`, `${topV.name.ar}، بتقييم ${money(valuation(topV.deal!.amountEGP, topV.deal!.equityPct), lang)} في الصفقة النهائية.`), href: `${topV.id}/` },
    sectors.length > 0 && { q: L(lang, `What kinds of startups are listed for ${label}?`, `ما قطاعات الشركات المسجلة في ${label}؟`),
      a: L(lang, `Mostly ${list(sectors.slice(0, 4).map(([c, k]) => `${category(c, lang)} (${k})`), lang)}.`, `غالباً ${list(sectors.slice(0, 4).map(([c, k]) => `${category(c, lang)} (${num(k, lang)})`), lang)}.`) },
  ];
  return qa.filter(Boolean) as QA[];
};

export const categoryFaq = (c: string, lang: Lang): QA[] => {
  const xs = startups.filter((x) => x.category === c), st = stats(xs), cat = category(c, lang), big = biggest(xs);
  const won = xs.filter((x) => x.deal?.made), lost = xs.filter((x) => x.deal?.made === false);
  const bySeason = count(xs.map((x) => x.season));
  const asks = xs.map((x) => x.ask?.amountEGP).filter((v): v is number => v != null), med = median(asks);
  const qa: (QA | false)[] = [
    { q: L(lang, `Which ${cat} startups are listed for ${ST.en}?`, `ما شركات قطاع ${cat} في دليل ${ST.ar}؟`),
      a: L(lang, `${xs.length}: ${list(xs.map((x) => x.name.en), lang)}.`, `${nAr(xs.length, 'شركة', 'شركتان', 'شركات')}: ${list(xs.map((x) => x.name.ar), lang)}.`) },
    { q: L(lang, `How many ${cat} startups got a deal on ${ST.en}?`, `كم شركة في قطاع ${cat} حصلت على صفقة في ${ST.ar}؟`),
      a: L(lang, `${st.deals} of ${st.count}${st.invested ? `, with ${money(st.invested, lang)} in disclosed investment` : ''}. ${NOTE.en}`, `${num(st.deals, lang)} من ${num(st.count, lang)}${st.invested ? `، باستثمارات معلنة ${money(st.invested, lang)}` : ''}. ${NOTE.ar}`) },
    st.topSharks.length > 0 && { q: L(lang, `Which sharks invest in ${cat} on ${ST.en}?`, `من المستثمرون في قطاع ${cat} في ${ST.ar}؟`),
      a: list(st.topSharks.map(([k, n]) => `${sharkName(k, lang)} (${num(n, lang)})`), lang) + '.' },
    big && { q: L(lang, `What is the biggest ${cat} deal on ${ST.en}?`, `ما أكبر صفقة في قطاع ${cat} في ${ST.ar}؟`),
      a: `${dealLine(big, lang)}.`, href: `${big.id}/` },
    won.length > 0 && { q: L(lang, `Which ${cat} startups got a deal on ${ST.en}?`, `ما شركات قطاع ${cat} التي حصلت على صفقة في ${ST.ar}؟`), a: list(won.map((x) => dealLine(x, lang)), lang) + '.' },
    lost.length > 0 && { q: L(lang, `Which ${cat} startups left without a deal?`, `ما شركات قطاع ${cat} التي خرجت بدون صفقة؟`), a: list(lost.map((x) => x.name[lang]), lang) + '.' },
    bySeason.length > 1 && { q: L(lang, `Which season had the most ${cat} startups?`, `أي موسم شهد أكبر عدد من شركات قطاع ${cat}؟`),
      a: list(bySeason.slice(0, 3).map(([k, c]) => `${seasonLabel(k, lang)} (${num(c, lang)})`), lang) + '.', href: `season/${bySeason[0][0]}/` },
    med != null && { q: L(lang, `How much do ${cat} startups ask for on ${ST.en}?`, `كم تطلب شركات قطاع ${cat} في ${ST.ar} عادةً؟`),
      a: L(lang, `The median ask is ${money(med, lang)} across ${asks.length} pitches with a disclosed ask.`, `متوسط الطلب (الوسيط) ${money(med, lang)} عبر ${num(asks.length, lang)} عرضاً معلن الطلب.`) },
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
    { q: L(lang, `How many startups are listed for ${ST.en}?`, `كم شركة ناشئة في دليل ${ST.ar}؟`),
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

// ---------- Long-tail landing pages: one page per search intent ----------

/** Shark × season pages, only where the shark closed a deal that season. */
export const sharkSeasons = sharks.flatMap((p) => [...new Set(p.deals.map((x) => x.season))].sort().map((n) => ({ p, n, items: p.deals.filter((x) => x.season === n) })));
/** Shark-vs-shark pages for every pair that sat on the same panel. */
export const sharkPairs = sharks.flatMap((a, i) => sharks.slice(i + 1).filter((b) => a.seasons.some((n) => n > 0 && b.seasons.includes(n)))
  .map((b) => { const [x, y] = [a, b].sort((p, q) => p.id.localeCompare(q.id)); return { a: x, b: y, id: `${x.id}-vs-${y.id}` }; }));
export const episodeItems = (n: number, e: number) => startups.filter((x) => x.season === n && x.episode === e);
const totalOf = (xs: Startup[]) => xs.reduce((a, x) => a + (x.deal?.amountEGP ?? 0), 0);
const avgEq = (xs: Startup[]) => { const e = xs.map((x) => x.deal?.equityPct).filter((v): v is number => v != null); return e.length ? Math.round(e.reduce((a, b) => a + b, 0) / e.length) : null; };

export const episodeFaq = (n: number, e: number, lang: Lang): QA[] => {
  const xs = episodeItems(n, e), st = stats(xs), info = seasons.find((s) => s.season === n);
  const scheduled = xs.length ? scheduledAppearance(xs[0]) : undefined;
  if (scheduled) return [
    { q: L(lang, 'Which startups are announced for this episode?', 'ما الشركات المُعلنة لهذه الحلقة؟'), a: list(xs.map((x) => x.name[lang]), lang) + '.' },
    { q: L(lang, 'When is the episode scheduled?', 'متى موعد عرض الحلقة؟'), a: scheduled.scheduleNote[lang] },
    { q: L(lang, 'Are the investment terms confirmed?', 'هل تأكدت شروط الاستثمار؟'), a: L(lang, 'Asks and deal outcomes have not yet been verified.', 'لم تُوثَّق طلبات الاستثمار أو نتائج الصفقات بعد.') },
  ];
  const label = `${seasonLabel(n, lang)}${L(lang, `, episode ${e}`, `، الحلقة ${num(e, lang)}`)}`;
  const won = xs.filter((x) => x.deal?.made), asks = xs.filter((x) => x.ask?.amountEGP != null).sort((a, b) => b.ask!.amountEGP! - a.ask!.amountEGP!);
  const qa: (QA | false)[] = [
    { q: L(lang, `Which startups appeared in ${ST.en} ${label}?`, `ما الشركات التي ظهرت في ${ST.ar} ${label}؟`), a: list(xs.map((x) => `${x.name[lang]}${x.category ? ` (${category(x.category, lang)})` : ''}`), lang) + '.' },
    { q: L(lang, `What deals were made in ${ST.en} ${label}?`, `ما الصفقات التي أُبرمت في ${ST.ar} ${label}؟`),
      a: won.length ? list(won.map((x) => `${x.name[lang]}${L(lang, ' with ', ' مع ')}${list((x.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}${terms(x.deal!.amountEGP, x.deal!.equityPct, lang) ? ` (${terms(x.deal!.amountEGP, x.deal!.equityPct, lang)})` : ''}`), lang) + '.'
        : L(lang, `No deals are recorded for this episode.`, `لا توجد صفقات مسجلة في هذه الحلقة.`) },
    st.invested > 0 && { q: L(lang, `How much did the sharks invest in ${label}?`, `كم استثمر المستثمرون في ${label}؟`), a: L(lang, `${money(st.invested, lang)} in disclosed deals.`, `${money(st.invested, lang)} في صفقات معلنة القيمة.`) },
    !!info && { q: L(lang, `Who were the sharks in ${ST.en} ${label}?`, `من هم المستثمرون في ${ST.ar} ${label}؟`),
      a: L(lang, `The ${seasonLabel(n, lang)} panel: ${list(info.sharks.map((k) => sharkName(k, lang)), lang)}.`, `لجنة ${seasonLabel(n, lang)}: ${list(info.sharks.map((k) => sharkName(k, lang)), lang)}.`) },
    asks.length > 0 && { q: L(lang, `What was the biggest ask in ${label}?`, `ما أكبر طلب تمويل في ${label}؟`), a: `${asks[0].name[lang]}: ${terms(asks[0].ask!.amountEGP, asks[0].ask!.equityPct, lang)}.`, href: `${asks[0].id}/` },
    { q: L(lang, `Where can I watch ${ST.en} ${label}?`, `أين أشاهد ${ST.ar} ${label}؟`),
      a: L(lang, `On CBC and WATCH IT.${xs.some((x) => x.video) ? ` Pitches from this episode are also on YouTube, linked from each startup page.` : ''}`, `على CBC وWATCH IT.${xs.some((x) => x.video) ? ' وعروض هذه الحلقة متاحة أيضاً على يوتيوب وروابطها في صفحة كل شركة.' : ''}`) },
    lang === 'ar' && { q: `شارك تانك مصر ${seasonLabel(n, lang)} الحلقة ${num(e, lang)} مين خد صفقة؟`, a: won.length ? list(won.map((x) => x.name.ar), lang) + '.' : 'مفيش صفقات مسجلة في الحلقة دي.' },
  ];
  return qa.filter(Boolean) as QA[];
};

export const sharkSeasonFaq = (p: Shark, n: number, lang: Lang): QA[] => {
  const xs = p.deals.filter((x) => x.season === n), nm = p.name[lang], label = seasonLabel(n, lang), big = biggest(xs);
  const amt = xs.filter((x) => x.deal?.amountEGP != null), mates = (seasons.find((s) => s.season === n)?.sharks ?? []).filter((k) => k !== p.key);
  const qa: (QA | false)[] = [
    { q: L(lang, `What deals did ${nm} make in ${ST.en} ${label}?`, `ما صفقات ${nm} في ${ST.ar} ${label}؟`), a: list(xs.map((x) => dealLine(x, lang)), lang) + '.' },
    { q: L(lang, `How many deals did ${nm} make in ${label}?`, `كم عدد صفقات ${nm} في ${label}؟`), a: L(lang, `${xs.length}.`, `${dealsAr(xs.length)}.`) },
    amt.length > 0 && { q: L(lang, `How much did ${nm} invest in ${ST.en} ${label}?`, `كم بلغت استثمارات ${nm} في ${label} من ${ST.ar}؟`),
      a: L(lang, `${money(totalOf(amt), lang)} across ${amt.length} deal${amt.length > 1 ? 's' : ''} with a disclosed amount (joint deals at full value).`, `${money(totalOf(amt), lang)} عبر ${dealsAr(amt.length)} معلنة القيمة (الصفقات المشتركة بقيمتها الكاملة).`) },
    big && { q: L(lang, `What was ${nm}'s biggest deal in ${label}?`, `ما أكبر صفقات ${nm} في ${label}؟`), a: `${dealLine(big, lang)}.`, href: `${big.id}/` },
    mates.length > 0 && { q: L(lang, `Who sat with ${nm} on the ${label} panel?`, `من المستثمرون مع ${nm} في لجنة ${label}؟`), a: list(mates.map((k) => sharkName(k, lang)), lang) + '.', href: `season/${n}/` },
  ];
  return qa.filter(Boolean) as QA[];
};

export const pairFaq = (a: Shark, b: Shark, lang: Lang): QA[] => {
  const A = a.name[lang], B = b.name[lang], vs = L(lang, `${A} or ${B}`, `${A} أم ${B}`);
  const joint = a.deals.filter((x) => x.deal?.sharks?.includes(b.key));
  const together = a.seasons.filter((n) => n > 0 && b.seasons.includes(n));
  const ta = totalOf(a.deals), tb = totalOf(b.deals), ea = avgEq(a.deals), eb = avgEq(b.deals);
  const ba = biggest(a.deals), bb = biggest(b.deals);
  const top = (p: Shark) => count(p.deals.map((x) => x.category).filter(Boolean) as string[]).slice(0, 3).map(([c]) => category(c, lang));
  const side = (p: Shark, v: string) => `${p.name[lang]}: ${v}`;
  const qa: (QA | false)[] = [
    { q: L(lang, `Who has made more deals on ${ST.en}, ${vs}?`, `من أبرم صفقات أكثر في ${ST.ar}، ${vs}؟`),
      a: `${side(a, L(lang, String(a.deals.length), dealsAr(a.deals.length)))}${L(lang, '; ', '؛ ')}${side(b, L(lang, String(b.deals.length), dealsAr(b.deals.length)))}.` },
    (ta > 0 || tb > 0) && { q: L(lang, `Who has invested more on ${ST.en}, ${vs}?`, `من استثمر أكثر في ${ST.ar}، ${vs}؟`),
      a: `${side(a, money(ta, lang) ?? '—')}${L(lang, '; ', '؛ ')}${side(b, money(tb, lang) ?? '—')}. ${L(lang, 'Disclosed amounts, joint deals at full value.', 'المبالغ المعلنة، والصفقات المشتركة بقيمتها الكاملة.')}` },
    { q: L(lang, `Have ${A} and ${B} invested together?`, `هل استثمر ${A} و${B} معاً؟`),
      a: joint.length ? L(lang, `Yes, ${joint.length} joint deal${joint.length > 1 ? 's' : ''}: ${list(joint.map((x) => dealLine(x, lang)), lang)}.`, `نعم، ${dealsAr(joint.length)} مشتركة: ${list(joint.map((x) => dealLine(x, lang)), lang)}.`)
        : L(lang, `No joint deal between them is recorded.`, `لا توجد صفقة مشتركة مسجلة بينهما.`) },
    together.length > 0 && { q: L(lang, `Which seasons did ${A} and ${B} share?`, `في أي مواسم اجتمع ${A} و${B}؟`), a: list(together.map((n) => seasonLabel(n, lang)), lang) + '.' },
    ea != null && eb != null && { q: L(lang, `Who takes more equity, ${vs}?`, `من يطلب حصة أكبر، ${vs}؟`),
      a: L(lang, `On average ${A} takes ${pct(ea, lang)} and ${B} takes ${pct(eb, lang)}.`, `في المتوسط: ${A} ${pct(ea, lang)}، و${B} ${pct(eb, lang)}.`) },
    (ba || bb) && { q: L(lang, `What are the biggest deals of ${A} and ${B}?`, `ما أكبر صفقات ${A} و${B}؟`),
      a: [ba && side(a, dealLine(ba, lang)), bb && side(b, dealLine(bb, lang))].filter(Boolean).join(L(lang, '; ', '؛ ')) + '.' },
    (top(a).length > 0 || top(b).length > 0) && { q: L(lang, `What sectors do ${A} and ${B} invest in?`, `في أي القطاعات يستثمر ${A} و${B}؟`),
      a: [side(a, list(top(a), lang) || '—'), side(b, list(top(b), lang) || '—')].join(L(lang, '; ', '؛ ')) + '.' },
  ];
  return qa.filter(Boolean) as QA[];
};

type Ranking = { id: string; title: { en: string; ar: string }; intro: { en: string; ar: string }; items: Startup[]; faq: (lang: Lang) => QA[] };
const top10 = (xs: Startup[], f: (x: Startup) => string, lang: Lang) => list(xs.slice(0, 10).map((x, i) => `${L(lang, String(i + 1), num(i + 1, lang))}. ${x.name[lang]} (${f(x)})`), lang) + '.';
const deals = startups.filter((x) => x.deal?.made);
const bigDeals = deals.filter((x) => x.deal!.amountEGP != null).sort((a, b) => b.deal!.amountEGP! - a.deal!.amountEGP!);
const bigAsks = startups.filter((x) => x.ask?.amountEGP != null).sort((a, b) => b.ask!.amountEGP! - a.ask!.amountEGP!);
const vals = byDealValuation(startups);
const noDeals = startups.filter((x) => x.deal?.made === false);
const joint = deals.filter((x) => (x.deal!.sharks ?? []).length > 1).sort((a, b) => b.deal!.sharks!.length - a.deal!.sharks!.length);
const equity = deals.filter((x) => x.deal!.equityPct != null).sort((a, b) => b.deal!.equityPct! - a.deal!.equityPct!);
const aboveAsk = deals.filter((x) => x.deal!.amountEGP != null && x.ask?.amountEGP != null && x.deal!.amountEGP > x.ask.amountEGP);
const cuts = deals.map((x) => { const a = valuation(x.ask?.amountEGP, x.ask?.equityPct), d = dealValuation(x); return a && d ? (1 - d / a) * 100 : null; }).filter((v): v is number => v != null);
export const rankings: Ranking[] = [
  { id: 'biggest-deals', title: { en: 'Biggest Shark Tank Egypt deals', ar: 'أكبر صفقات شارك تانك مصر' },
    intro: { en: 'Every Shark Tank Egypt deal with a disclosed amount, from the largest down.', ar: 'كل صفقات شارك تانك مصر المعلنة القيمة، مرتبة من الأكبر إلى الأصغر.' }, items: bigDeals,
    faq: (lang) => [
      { q: L(lang, `What are the biggest deals in ${ST.en} history?`, `ما أكبر الصفقات في تاريخ ${ST.ar}؟`), a: top10(bigDeals, (x) => terms(x.deal!.amountEGP, x.deal!.equityPct, lang), lang) },
      { q: L(lang, `How many ${ST.en} deals were worth EGP 5 million or more?`, `كم صفقة في ${ST.ar} بلغت قيمتها ٥ ملايين جنيه أو أكثر؟`), a: L(lang, `${bigDeals.filter((x) => x.deal!.amountEGP! >= 5e6).length} of ${bigDeals.length} disclosed deals.`, `${num(bigDeals.filter((x) => x.deal!.amountEGP! >= 5e6).length, lang)} من ${num(bigDeals.length, lang)} صفقة معلنة.`) },
      { q: L(lang, `What is the typical deal size on ${ST.en}?`, `ما متوسط قيمة الصفقة في ${ST.ar}؟`), a: L(lang, `The median disclosed deal is ${money(median(bigDeals.map((x) => x.deal!.amountEGP!)), lang)}.`, `الوسيط ${money(median(bigDeals.map((x) => x.deal!.amountEGP!)), lang)} للصفقات المعلنة.`) },
      { q: L(lang, `Which sharks made the biggest deals?`, `أي المستثمرين أبرموا أكبر الصفقات؟`), a: list([...new Set(bigDeals.slice(0, 5).flatMap((x) => x.deal!.sharks ?? []))].map((k) => sharkName(k, lang)), lang) + '.' },
    ] },
  { id: 'highest-valuations', title: { en: 'Highest valuations on Shark Tank Egypt', ar: 'أعلى تقييمات الشركات في شارك تانك مصر' },
    intro: { en: 'Startups ranked by the valuation implied by their final deal with the sharks.', ar: 'الشركات مرتبة حسب التقييم الذي تعنيه صفقتها النهائية مع المستثمرين.' }, items: vals,
    faq: (lang) => [
      { q: L(lang, `Which startups got the highest valuation on ${ST.en}?`, `ما الشركات التي حصلت على أعلى تقييم في ${ST.ar}؟`), a: top10(vals, (x) => money(dealValuation(x), lang)!, lang) },
      { q: L(lang, `What is the average valuation of a ${ST.en} deal?`, `ما متوسط تقييم الشركات في صفقات ${ST.ar}؟`), a: L(lang, `The median is ${money(median(vals.map((x) => dealValuation(x)!)), lang)} across ${vals.length} deals.`, `الوسيط ${money(median(vals.map((x) => dealValuation(x)!)), lang)} عبر ${num(vals.length, lang)} صفقة.`) },
      cuts.length > 0 && { q: L(lang, `Do the sharks cut valuations on ${ST.en}?`, `هل يخفض المستثمرون التقييمات في ${ST.ar}؟`), a: L(lang, `Usually. In the ${cuts.length} deals where both the ask and the final terms are known, the median valuation cut is ${pct(Math.round(median(cuts)!), lang)}.`, `غالباً. في ${num(cuts.length, lang)} صفقة معروفة الطلب والشروط النهائية، بلغ وسيط خفض التقييم ${pct(Math.round(median(cuts)!), lang)}.`) },
    ].filter(Boolean) as QA[] },
  { id: 'biggest-asks', title: { en: 'Biggest asks on Shark Tank Egypt', ar: 'أكبر طلبات التمويل في شارك تانك مصر' },
    intro: { en: 'The largest amounts founders asked the sharks for, whatever the outcome.', ar: 'أكبر المبالغ التي طلبها رواد الأعمال من المستثمرين، أياً كانت النتيجة.' }, items: bigAsks,
    faq: (lang) => [
      { q: L(lang, `What is the biggest amount ever asked for on ${ST.en}?`, `ما أكبر مبلغ طُلب في ${ST.ar}؟`), a: top10(bigAsks, (x) => terms(x.ask!.amountEGP, x.ask!.equityPct, lang), lang) },
      { q: L(lang, `How much do founders usually ask for on ${ST.en}?`, `كم يطلب رواد الأعمال عادةً في ${ST.ar}؟`), a: L(lang, `The median ask is ${money(median(bigAsks.map((x) => x.ask!.amountEGP!)), lang)} across ${bigAsks.length} pitches.`, `وسيط الطلبات ${money(median(bigAsks.map((x) => x.ask!.amountEGP!)), lang)} عبر ${num(bigAsks.length, lang)} عرضاً.`) },
    ] },
  { id: 'no-deal', title: { en: 'Shark Tank Egypt startups that got no deal', ar: 'شركات خرجت من شارك تانك مصر بدون صفقة' },
    intro: { en: 'Startups that left the tank without an investment, and what they asked for.', ar: 'شركات غادرت البرنامج دون استثمار، وما الذي طلبته.' }, items: noDeals,
    faq: (lang) => [
      { q: L(lang, `Which startups left ${ST.en} without a deal?`, `ما الشركات التي خرجت من ${ST.ar} بدون صفقة؟`), a: list(noDeals.map((x) => x.name[lang]), lang) + '.' },
      { q: L(lang, `How many startups got no deal on ${ST.en}?`, `كم شركة لم تحصل على صفقة في ${ST.ar}؟`), a: L(lang, `${noDeals.length} recorded so far. ${NOTE.en}`, `${nAr(noDeals.length, 'شركة', 'شركتان', 'شركات')} مسجلة حتى الآن. ${NOTE.ar}`) },
    ] },
  { id: 'joint-deals', title: { en: 'Joint deals: startups backed by several sharks', ar: 'صفقات مشتركة: شركات استثمر فيها أكثر من مستثمر' },
    intro: { en: 'Deals where two or more sharks invested together.', ar: 'صفقات اشترك فيها مستثمران أو أكثر.' }, items: joint,
    faq: (lang) => [
      { q: L(lang, `Which startups got investment from more than one shark?`, `ما الشركات التي استثمر فيها أكثر من مستثمر في ${ST.ar}؟`), a: list(joint.map((x) => `${x.name[lang]} (${list((x.deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)})`), lang) + '.' },
      joint.length > 0 && { q: L(lang, `Which ${ST.en} deal had the most sharks?`, `أي صفقة في ${ST.ar} ضمت أكبر عدد من المستثمرين؟`), a: `${joint[0].name[lang]}: ${list((joint[0].deal!.sharks ?? []).map((k) => sharkName(k, lang)), lang)}.`, href: `${joint[0].id}/` },
    ].filter(Boolean) as QA[] },
  { id: 'most-equity', title: { en: 'Deals where founders gave up the most equity', ar: 'الصفقات التي تنازل فيها المؤسسون عن أكبر حصة' },
    intro: { en: 'Shark Tank Egypt deals ranked by the share of the company the sharks took.', ar: 'صفقات شارك تانك مصر مرتبة حسب نسبة الحصة التي حصل عليها المستثمرون.' }, items: equity,
    faq: (lang) => [
      { q: L(lang, `Which founders gave up the most equity on ${ST.en}?`, `أي المؤسسين تنازلوا عن أكبر حصة في ${ST.ar}؟`), a: top10(equity, (x) => pct(x.deal!.equityPct!, lang), lang) },
      { q: L(lang, `How much equity do the sharks usually take?`, `ما الحصة التي يحصل عليها المستثمرون عادةً؟`), a: L(lang, `The median is ${pct(median(equity.map((x) => x.deal!.equityPct!))!, lang)} across ${equity.length} deals.`, `الوسيط ${pct(median(equity.map((x) => x.deal!.equityPct!))!, lang)} عبر ${num(equity.length, lang)} صفقة.`) },
    ] },
  { id: 'more-than-asked', title: { en: 'Startups that got more than they asked for', ar: 'شركات حصلت على أكثر مما طلبت' },
    intro: { en: 'Deals where the sharks put in more money than the founders asked for (usually for a bigger stake).', ar: 'صفقات ضخ فيها المستثمرون مبلغاً أكبر مما طلبه المؤسسون (غالباً مقابل حصة أكبر).' }, items: aboveAsk,
    faq: (lang) => [
      { q: L(lang, `Which startups got more money than they asked for on ${ST.en}?`, `ما الشركات التي حصلت على أكثر مما طلبت في ${ST.ar}؟`),
        a: list(aboveAsk.map((x) => `${x.name[lang]} (${L(lang, 'asked', 'طلبت')} ${money(x.ask!.amountEGP, lang)}${L(lang, ', got ', '، حصلت على ')}${terms(x.deal!.amountEGP, x.deal!.equityPct, lang)})`), lang) + '.' },
    ] },
];

/** Sector × season pages ("Food startups in Season 2"), where the slice has at least 2 startups. */
export const sectorSeasons = categories.flatMap((c) => [...new Set(startups.filter((x) => x.category === c).map((x) => x.season))].sort()
  .map((n) => ({ c, n, items: startups.filter((x) => x.category === c && x.season === n) })).filter((x) => x.items.length >= 2));
/** Shark × sector pages ("Ayman Abbas food investments"), where the shark has at least 2 deals in the sector. */
export const sharkSectors = sharks.flatMap((p) => count(p.deals.map((x) => x.category).filter(Boolean) as string[]).filter(([, k]) => k >= 2)
  .map(([c]) => ({ p, c, items: p.deals.filter((x) => x.category === c) })));

export const sectorSeasonFaq = (c: string, n: number, lang: Lang): QA[] => {
  const xs = startups.filter((x) => x.category === c && x.season === n), st = stats(xs), cat = category(c, lang), label = seasonLabel(n, lang);
  const asks = xs.filter((x) => x.ask?.amountEGP != null).sort((a, b) => b.ask!.amountEGP! - a.ask!.amountEGP!), won = xs.filter((x) => x.deal?.made);
  const qa: (QA | false)[] = [
    { q: L(lang, `Which ${cat} startups are listed for ${ST.en} ${label}?`, `ما شركات قطاع ${cat} في ${ST.ar} ${label}؟`), a: list(xs.map((x) => x.name[lang]), lang) + '.' },
    { q: L(lang, `How many ${cat} startups got a deal in ${label}?`, `كم شركة من قطاع ${cat} حصلت على صفقة في ${label}؟`),
      a: won.length ? L(lang, `${won.length} of ${xs.length}: ${list(won.map((x) => dealLine(x, lang)), lang)}.`, `${num(won.length, lang)} من ${num(xs.length, lang)}: ${list(won.map((x) => dealLine(x, lang)), lang)}.`)
        : L(lang, `None recorded among the ${xs.length} startups.`, `لا توجد صفقات مسجلة بين ${nAr(xs.length, 'شركة', 'شركتين', 'شركات')}.`) },
    st.topSharks.length > 0 && { q: L(lang, `Which sharks invested in ${cat} startups in ${label}?`, `من المستثمرون في شركات قطاع ${cat} في ${label}؟`), a: list(st.topSharks.map(([k, v]) => `${sharkName(k, lang)} (${num(v, lang)})`), lang) + '.' },
    asks.length > 0 && { q: L(lang, `What was the biggest ${cat} ask in ${label}?`, `ما أكبر طلب تمويل في قطاع ${cat} في ${label}؟`), a: `${asks[0].name[lang]}: ${terms(asks[0].ask!.amountEGP, asks[0].ask!.equityPct, lang)}.`, href: `${asks[0].id}/` },
  ];
  return qa.filter(Boolean) as QA[];
};

export const sharkSectorFaq = (p: Shark, c: string, lang: Lang): QA[] => {
  const xs = p.deals.filter((x) => x.category === c), nm = p.name[lang], cat = category(c, lang), amt = xs.filter((x) => x.deal?.amountEGP != null), big = biggest(xs);
  const share = Math.round((xs.length / p.deals.length) * 100);
  const qa: (QA | false)[] = [
    { q: L(lang, `Which ${cat} startups has ${nm} invested in on ${ST.en}?`, `ما شركات قطاع ${cat} في محفظة ${nm} في ${ST.ar}؟`), a: list(xs.map((x) => dealLine(x, lang)), lang) + '.' },
    { q: L(lang, `Does ${nm} invest in ${cat}?`, `هل في محفظة ${nm} استثمارات في قطاع ${cat}؟`),
      a: L(lang, `Yes. ${xs.length} of ${nm}'s ${p.deals.length} recorded deals (${share}%) are in ${cat}.`, `نعم، ${num(xs.length, lang)} من ${num(p.deals.length, lang)} صفقة مسجلة (${pct(share, lang)}) في قطاع ${cat}.`) },
    amt.length > 0 && { q: L(lang, `How much has ${nm} invested in ${cat}?`, `كم بلغت استثمارات ${nm} في قطاع ${cat}؟`), a: L(lang, `${money(totalOf(amt), lang)} across ${amt.length} disclosed deal${amt.length > 1 ? 's' : ''}.`, `${money(totalOf(amt), lang)} عبر ${dealsAr(amt.length)} معلنة القيمة.`) },
    big && { q: L(lang, `What is ${nm}'s biggest ${cat} deal?`, `ما أكبر صفقة في محفظة ${nm} في قطاع ${cat}؟`), a: `${dealLine(big, lang)}.`, href: `${big.id}/` },
  ];
  return qa.filter(Boolean) as QA[];
};
