import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import data from './data/startups.json';
import seasons from './data/seasons.json';
import peopleData from './data/people.json';
import namesAr from './data/names.json';

export type Lang = 'ar' | 'en';
export const langs: Lang[] = ['ar', 'en'];
export type Startup = (typeof data)[number];
// Newest first; season 0 (July 2025 specials) aired between seasons 3 and 4.
const rank = (n: number) => (n === 0 ? 3.5 : n);
export const startups = [...data].sort((a, b) => rank(b.season) - rank(a.season) || (a.episode ?? 99) - (b.episode ?? 99));
export { seasons };
/** How well a record is backed: sourced outcome with sharks and terms = verified; some of it missing = partial; no source = unverified. */
export type Verification = 'verified' | 'partially_verified' | 'unverified';
export const verification = (x: Startup): Verification =>
  !x.sources?.length ? 'unverified'
  : x.deal?.made === false || (x.deal?.made && x.deal.sharks?.length && (x.deal.amountEGP != null || x.deal.equityPct != null)) ? 'verified'
  : 'partially_verified';
/** Date the data last changed (YYYY-MM-DD), for sitemap lastmod, dateModified and the footer. */
export const dataUpdated = (() => {
  try { return execSync('git log -1 --format=%cs -- src/data', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || new Date().toISOString().slice(0, 10); }
  catch { return new Date().toISOString().slice(0, 10); }
})();

// Fill these from https://giscus.app after enabling Discussions on the repo.
// Comments stay hidden until repoId and categoryId are set.
export const giscus = {
  repo: 'AhmadIbrahiim/SharkTankEgypt',
  repoId: '',
  category: 'Startups',
  categoryId: '',
};

// Google Search Console → HTML tag verification → paste the content="…" value here.
export const googleVerification = 'oxBn-T41uCZ5ddqGiXpFfS6q6LtcRe5YL0VtShRcXX8';

export const suggestUrl = 'https://github.com/AhmadIbrahiim/SharkTankEgypt/issues/new?template=new-startup.yml';

export const t = {
  ar: {
    title: 'دليل شركات شارك تانك مصر',
    short: 'دليل شارك تانك',
    tagline: 'كل الشركات الناشئة التي ظهرت في كل مواسم وحلقات شارك تانك مصر',
    heroKicker: 'من التانك إلى السوق',
    heroTitle: 'كل فكرة دخلت التانك… في مكان واحد',
    heroSub: 'اكتشف الشركات الناشئة التي وقفت أمام القروش في شارك تانك مصر، واعرف مين أخد صفقة، وقيّمها بنفسك.',
    statStartups: 'شركة ناشئة',
    statSeasons: 'مواسم',
    statDeals: 'صفقة',
    statInvested: 'استثمارات معلنة',
    search: 'ابحث عن شركة أو مؤسس أو قرش…',
    all: 'الكل',
    season: 'الموسم',
    seasonShort: 'م',
    episode: 'الحلقة',
    deal: 'تمت الصفقة',
    noDeal: 'بدون صفقة',
    allCategories: 'كل المجالات',
    sort: 'الترتيب',
    sortEpisode: 'الأحدث أولًا',
    sortName: 'أبجديًا',
    sortDeal: 'الأكبر استثمارًا',
    sortOldest: 'الأقدم أولًا',
    sortAsk: 'الأعلى طلبًا',
    allSharks: 'كل المستثمرين',
    results: 'نتيجة',
    emptyTitle: 'لا توجد نتائج',
    emptyText: 'جرّب كلمة أخرى أو امسح الفلاتر.',
    reset: 'مسح الفلاتر',
    showMore: 'عرض المزيد',
    asked: 'طلب',
    allStartups: 'كل الشركات',
    website: 'الموقع',
    visit: 'زيارة الموقع',
    watch: 'شاهد العرض في البرنامج',
    online: 'تابعهم على الإنترنت',
    glance: 'لمحة سريعة',
    brandName: 'شارك تانك مصر',
    brandSub: 'دليل الشركات الناشئة',
    footerTagline: 'دليل مجتمعي مفتوح المصدر لكل شركة ناشئة ومستثمر ومؤسس ظهر في شارك تانك مصر، بالعربية والإنجليزية.',
    explore: 'استكشف',
    openSource: 'مفتوح المصدر على GitHub',
    browseSectors: 'تصفح حسب المجال',
    browseSeasons: 'تصفح حسب الموسم',
    catTitle: (c: string) => `شركات ${c} في شارك تانك مصر`,
    catIntro: (c: string, n: string, d: string, m: string | null) => `${n} شركة ناشئة في مجال ${c} عرضت مشروعها أمام المستثمرين في شارك تانك مصر، وحصلت ${d} منها على صفقة${m ? ` باستثمارات معلنة تبلغ ${m}` : ''}. تعرّف على كل شركة وخدماتها ومؤسسيها ونتيجة عرضها.`,
    seasonTitle: (n: string) => `شارك تانك مصر ${n}: كل الشركات والصفقات`,
    seasonIntro: (n: string, c: string, d: string, m: string | null) => `كل الشركات الناشئة التي ظهرت في ${n} من شارك تانك مصر: ${c} شركة، منها ${d} حصلت على صفقة${m ? ` بإجمالي استثمارات معلنة ${m}` : ''}، مع تفاصيل العروض والمستثمرين.`,
    topSharks: 'أكثر المستثمرين نشاطًا هنا',
    secOverview: 'نظرة عامة',
    secServices: 'الخدمات والمنتجات',
    secPitch: 'العرض في البرنامج',
    secTeam: 'الفريق',
    secOnline: 'على الإنترنت',
    navStartups: 'الشركات',
    navSharks: 'المستثمرون',
    navFounders: 'المؤسسون',
    navFaq: 'أسئلة شائعة',
    navDeals: 'الصفقات',
    verify: { verified: 'تم التحقق من المصادر', partially_verified: 'تحقق جزئي: بعض التفاصيل غير مؤكدة', unverified: 'غير موثّق: لا يوجد مصدر بعد' },
    checked: 'آخر مراجعة',
    navFaqTab: 'الأسئلة',
    navMain: 'التنقل الرئيسي',
    faqTitle: 'أسئلة شائعة',
    faqMore: 'التفاصيل ←',
    faqHubTitle: 'أسئلة شائعة عن شارك تانك مصر',
    faqHubIntro: 'كل ما يسأل عنه الناس عن شارك تانك مصر: المستثمرون وصفقاتهم وكم استثمر كل منهم، والمواسم، والقطاعات، وأكبر الصفقات. الإجابات مبنية على بيانات هذا الدليل.',
    faqGeneral: 'عن البرنامج',
    faqBySeason: 'حسب الموسم',
    faqBySector: 'حسب القطاع',
    sharksTitle: 'مستثمرو شارك تانك مصر',
    sharksIntro: 'تعرّف على القروش عبر كل المواسم: من هم، وفي أي الشركات استثمروا، ومع من يستثمرون عادةً.',
    foundersTitle: 'مؤسسو شركات شارك تانك مصر',
    foundersIntro: 'رواد الأعمال الذين وقفوا أمام القروش، وشركاتهم وقصصهم المهنية.',
    dealsCount: 'صفقة',
    invested: 'استثمارات معلنة',
    avgEquity: 'متوسط الحصة',
    appearedIn: 'المواسم',
    portfolio: 'محفظة الاستثمارات في البرنامج',
    noDeals: 'لا توجد صفقات مسجلة بعد في الدليل.',
    coInvestors: 'يستثمر كثيرًا مع',
    sectors: 'المجالات',
    theirStartups: 'شركاته في البرنامج',
    coFounders: 'شركاؤه في التأسيس',
    profileThin: 'لم نجمع نبذة عن هذا الشخص بعد. هل تعرفه؟',
    photoBy: 'الصورة:',
    guest: 'ضيف',
    searchPeople: 'ابحث بالاسم أو الشركة…',
    founded: 'تأسست',
    basedIn: 'المقر',
    ask: 'طلب المؤسسين',
    finalDeal: 'الصفقة النهائية',
    valuation: 'تقييم',
    forEquity: 'مقابل',
    sharks: 'المستثمرون',
    founders: 'المؤسسون',
    category: 'المجال',
    sources: 'المصادر',
    comments: 'التقييم والتعليقات',
    rateHint: 'قيّم الشركة بالتفاعل 👍 ❤️ 🚀 على أول المناقشة، واكتب رأيك أو تجربتك معها. يتطلب تسجيل الدخول بحساب GitHub.',
    commentsOff: 'التعليقات ستُفعّل قريبًا.',
    home: 'الرئيسية',
    prev: 'السابقة',
    next: 'التالية',
    egp: 'ج.م',
    contributeTitle: 'عندك معلومة ناقصة؟',
    helpTitle: 'ساعدنا نكمّل الصفحة دي',
    helpText: 'لو شفت الحلقة أو تعرف الشركة، أضف أي معلومة ناقصة أو صحّح أي خطأ.',
    helpMissing: 'ناقص:',
    helpBtn: 'أضف معلومة',
    missingLabels: { founders: 'المؤسسون', ask: 'الطلب', deal: 'نتيجة العرض', links: 'روابط الشركة', video: 'فيديو العرض' },
    contributeText: 'الدليل مفتوح المصدر على GitHub. صحّح بيانات أو أضف شركة في دقيقتين.',
    edit: 'ساهم في الدليل',
    suggest: 'اقترح شركة ناقصة',
    missingTitle: 'شركة ناقصة؟',
    missingText: 'الدليل لسه بيكبر. لو تعرف شركة ظهرت في البرنامج ومش موجودة هنا، قولنا عليها.',
    switchLang: 'English',
    madeWith: 'دليل مجتمعي غير رسمي، غير تابع للبرنامج.',
  },
  en: {
    title: 'Shark Tank Egypt Directory',
    short: 'Shark Tank Egypt',
    tagline: 'Every startup that pitched on Shark Tank Egypt, across all seasons and episodes',
    heroKicker: 'From the tank to the market',
    heroTitle: 'Every pitch from the tank, in one friendly place',
    heroSub: 'Browse the startups that faced the sharks on Shark Tank Egypt, see who walked away with a deal, and rate them yourself.',
    statStartups: 'startups',
    statSeasons: 'seasons',
    statDeals: 'deals',
    statInvested: 'announced investment',
    search: 'Search startups, founders, sharks…',
    all: 'All',
    season: 'Season',
    seasonShort: 'S',
    episode: 'Episode',
    deal: 'Deal',
    noDeal: 'No deal',
    allCategories: 'All categories',
    sort: 'Sort',
    sortEpisode: 'Newest first',
    sortName: 'A–Z',
    sortDeal: 'Biggest deal',
    sortOldest: 'Oldest first',
    sortAsk: 'Biggest ask',
    allSharks: 'All sharks',
    results: 'results',
    emptyTitle: 'Nothing found',
    emptyText: 'Try another word or clear the filters.',
    reset: 'Clear filters',
    showMore: 'Show more',
    asked: 'Asked',
    allStartups: 'All startups',
    website: 'Website',
    visit: 'Visit website',
    watch: 'Watch the pitch',
    online: 'Find them online',
    glance: 'At a glance',
    brandName: 'Shark Tank Egypt',
    brandSub: 'Startup Directory',
    footerTagline: 'An open-source, community directory of every startup, shark and founder from Shark Tank Egypt — in Arabic and English.',
    explore: 'Explore',
    openSource: 'Open source on GitHub',
    browseSectors: 'Browse by sector',
    browseSeasons: 'Browse by season',
    catTitle: (c: string) => `${c} startups on Shark Tank Egypt`,
    catIntro: (c: string, n: string, d: string, m: string | null) => `${n} ${c.toLowerCase()} startups pitched to the sharks on Shark Tank Egypt, and ${d} walked away with a deal${m ? `, with ${m} in announced investment` : ''}. Explore each company, its services, founders and how the pitch went.`,
    seasonTitle: (n: string) => `Shark Tank Egypt ${n}: every startup and deal`,
    seasonIntro: (n: string, c: string, d: string, m: string | null) => `Every startup that pitched in Shark Tank Egypt ${n}: ${c} companies, ${d} of them closed a deal${m ? ` totalling ${m} in announced investment` : ''} — with pitch details and the sharks who invested.`,
    topSharks: 'Most active sharks here',
    secOverview: 'Overview',
    secServices: 'Services & products',
    secPitch: 'The pitch',
    secTeam: 'Team',
    secOnline: 'Online',
    navStartups: 'Startups',
    navSharks: 'Sharks',
    navFounders: 'Founders',
    navFaq: 'FAQ',
    navDeals: 'Deals',
    verify: { verified: 'Verified against sources', partially_verified: 'Partially verified: some details unconfirmed', unverified: 'Unverified: no source yet' },
    checked: 'Last checked',
    navFaqTab: 'FAQ',
    navMain: 'Main',
    faqTitle: 'Frequently asked questions',
    faqMore: 'Details →',
    faqHubTitle: 'Shark Tank Egypt FAQ',
    faqHubIntro: 'Everything people ask about Shark Tank Egypt: the sharks, their deals and how much each invested, the seasons, the sectors and the biggest deals. Answers come from the data in this directory.',
    faqGeneral: 'About the show',
    faqBySeason: 'By season',
    faqBySector: 'By sector',
    sharksTitle: 'The Sharks of Shark Tank Egypt',
    sharksIntro: 'Meet the investors across every season: who they are, what they backed, and who they like to invest with.',
    foundersTitle: 'Founders who faced the Sharks',
    foundersIntro: 'The entrepreneurs who pitched on Shark Tank Egypt, their companies and professional stories.',
    dealsCount: 'deals',
    invested: 'announced investment',
    avgEquity: 'average equity',
    appearedIn: 'Seasons',
    portfolio: 'Portfolio on the show',
    noDeals: 'No deals recorded in the directory yet.',
    coInvestors: 'Often invests with',
    sectors: 'Sectors',
    theirStartups: 'Startups on the show',
    coFounders: 'Co-founders',
    profileThin: 'We haven’t gathered a bio for this person yet. Know them?',
    photoBy: 'Photo:',
    guest: 'Guest',
    searchPeople: 'Search by name or startup…',
    founded: 'Founded',
    basedIn: 'Based in',
    ask: 'The ask',
    finalDeal: 'The deal',
    valuation: 'valuation',
    forEquity: 'for',
    sharks: 'Sharks',
    founders: 'Founders',
    category: 'Category',
    sources: 'Sources',
    comments: 'Rating & comments',
    rateHint: 'Rate it with 👍 ❤️ 🚀 on the discussion, and share your take or experience. GitHub sign-in required.',
    commentsOff: 'Comments are coming soon.',
    home: 'Home',
    prev: 'Previous',
    next: 'Next',
    egp: 'EGP',
    contributeTitle: 'Know something we missed?',
    helpTitle: 'Help complete this page',
    helpText: 'Watched the episode or know the company? Add anything missing or fix a mistake.',
    helpMissing: 'Missing:',
    helpBtn: 'Add info',
    missingLabels: { founders: 'founders', ask: 'the ask', deal: 'pitch outcome', links: 'company links', video: 'pitch video' },
    contributeText: 'This directory is open source on GitHub. Fix a detail or add a startup in two minutes.',
    edit: 'Edit the data',
    suggest: 'Suggest a startup',
    missingTitle: 'Missing a startup?',
    missingText: 'The directory is still growing. If you know a startup from the show that isn’t here, tell us.',
    switchLang: 'العربية',
    madeWith: 'An unofficial community directory, not affiliated with the show.',
  },
} as const;

export const locale = (lang: Lang) => (lang === 'ar' ? 'ar-EG' : 'en-US');
export const num = (n: number, lang: Lang) => n.toLocaleString(locale(lang));
/** 2,000,000 → "2M EGP" / "٢ مليون ج.م" */
export const money = (n: number | null | undefined, lang: Lang) =>
  n == null ? null : `${new Intl.NumberFormat(locale(lang), { notation: 'compact', maximumFractionDigits: 1 }).format(n)} ${t[lang].egp}`;
export const pct = (n: number, lang: Lang) => new Intl.NumberFormat(locale(lang), { style: 'percent', maximumFractionDigits: 1 }).format(n / 100);
export const valuation = (amount?: number | null, pct?: number | null) =>
  amount && pct ? Math.round(amount / (pct / 100)) : null;

/** YouTube thumbnail; hqdefault is 4:3 with letterbox bars, which a 16:9 object-fit crop removes. */
export const thumb = (video: string) => `https://i.ytimg.com/vi/${video}/hqdefault.jpg`;

/** Path (relative to base) of a startup's captured screenshot, or null. */
export const screenshot = (id: string) => (existsSync(`public/screenshots/${id}.jpg`) ? `/screenshots/${id}.jpg` : null);

/** Stable warm hue per startup for placeholders and avatars. */
export const hue = (s: string) => [14, 28, 38, 172, 190, 350, 262][[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 7];
export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

const categoryAr: Record<string, string> = {
  Food: 'أطعمة ومشروبات', Tech: 'تكنولوجيا', Fashion: 'أزياء', Health: 'صحة', Education: 'تعليم', Services: 'خدمات',
  Retail: 'تجزئة', Other: 'أخرى', Beauty: 'تجميل', Fintech: 'تكنولوجيا مالية', Agriculture: 'زراعة', Logistics: 'لوجستيات',
  Entertainment: 'ترفيه', Sports: 'رياضة', Home: 'المنزل', Kids: 'أطفال', Manufacturing: 'تصنيع', Travel: 'سفر وسياحة',
  Automotive: 'سيارات', 'Real Estate': 'عقارات', Pets: 'حيوانات أليفة', Environment: 'بيئة', Media: 'إعلام', Gaming: 'ألعاب',
};
/** Category values are stored in English; show Arabic labels where known. */
export const category = (c: string, lang: Lang) => (lang === 'ar' ? categoryAr[c] ?? c : c);

/** Season 0 holds the July 2025 specials, which sit outside the numbered seasons. */
export const seasonLabel = (n: number, lang: Lang, short = false) =>
  n === 0 ? (lang === 'ar' ? 'حلقات خاصة' : 'Specials') : short ? `${t[lang].seasonShort}${num(n, lang)}` : `${t[lang].season} ${num(n, lang)}`;

const sharkAr: Record<string, string> = {
  'Ayman Abbas': 'أيمن عباس', 'Ahmed El Sewedy': 'أحمد السويدي', 'Abdallah Sallam': 'عبد الله سلام',
  'Ahmed Tarek Khalil': 'أحمد طارق خليل', 'Dina Ghabbour': 'دينا غبور', 'Mohamed Farouk': 'محمد فاروق',
  'Hilda Louca': 'هيلدا لوقا', 'Mohamed Mansour': 'محمد منصور', 'Hend Sabry': 'هند صبري', 'Yassin Mansour': 'ياسين منصور',
  'Mona Ataya': 'منى عطايا', 'Bishoy Azmy': 'بيشوي عزمي', 'Robert Herjavec': 'روبرت هيرجافيك',
};
export const shark = (n: string, lang: Lang) => (lang === 'ar' ? sharkAr[n] ?? n : n);

/** URL slug for a person's name. */
export const slug = (name: string) => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Bi = { en: string; ar: string };
export type Person = {
  id: string; kind: 'shark' | 'founder'; name: Bi; title?: Bi; bio?: Bi;
  photo?: { url: string; credit?: string; creditUrl?: string };
  companies?: { name: string; role?: string; url?: string }[];
  links?: Record<string, string>; seasons?: number[]; sources?: string[];
};
const profiles = new Map((peopleData as Person[]).map((p) => [`${p.kind}:${p.id}`, p]));

/** Every shark: from season line-ups and deals, enriched by people.json, with their deals. */
export const sharks = (() => {
  const names = new Map<string, Set<number>>();
  for (const s of seasons) for (const n of s.sharks) (names.get(n) ?? names.set(n, new Set()).get(n)!).add(s.season);
  for (const x of startups) for (const n of x.deal?.sharks ?? []) (names.get(n) ?? names.set(n, new Set()).get(n)!).add(x.season);
  return [...names].map(([n, ss]) => {
    const id = slug(n), p = profiles.get(`shark:${id}`);
    const deals = startups.filter((x) => x.deal?.made && x.deal.sharks?.includes(n));
    return { ...p, id, kind: 'shark' as const, key: n, name: p?.name ?? { en: n, ar: sharkAr[n] ?? n }, seasons: [...(p?.seasons ?? ss)].sort(), deals };
  }).sort((a, b) => b.deals.length - a.deals.length || a.name.en.localeCompare(b.name.en));
})();

/** Every founder named in the data, enriched by people.json, with their startups. */
export const founders = (() => {
  const by = new Map<string, { key: string; startups: Startup[] }>();
  for (const x of startups) for (const n of x.founders ?? []) {
    const id = slug(n);
    if (!id) continue;
    (by.get(id) ?? by.set(id, { key: n, startups: [] }).get(id)!).startups.push(x);
  }
  return [...by].map(([id, f]) => {
    const p = profiles.get(`founder:${id}`);
    // No published portrait for most founders: use the frame CBC published from their pitch on the show,
    // only where a reviewed crop exists in public/people (title cards and shark close-ups were rejected).
    // Only for sole founders: with several founders the frame may show a co-founder.
    const v = f.startups.filter((x) => (x.founders ?? []).length === 1).map((x) => x.video).find((v) => v && existsSync(`public/people/pitch-${v}.jpg`));
    const photo = p?.photo ?? (v ? { url: `/people/pitch-${v}.jpg`, credit: 'Shark Tank Egypt · CBC', creditUrl: `https://www.youtube.com/watch?v=${v}` } : undefined);
    return { ...p, id, kind: 'founder' as const, key: f.key, name: p?.name ?? { en: f.key, ar: (namesAr as Record<string, string>)[f.key] ?? f.key }, photo, startups: f.startups };
  }).sort((a, b) => a.name.en.localeCompare(b.name.en));
})();

export const sharkByKey = new Map(sharks.map((s) => [s.key, s]));
export const founderId = (name: string) => slug(name);

export const catSlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-');
export const categories = [...new Set(startups.map((x) => x.category).filter(Boolean) as string[])].sort();
/** Summary numbers for a set of startups. */
export const stats = (xs: Startup[]) => {
  const deals = xs.filter((x) => x.deal?.made);
  const invested = deals.reduce((a, x) => a + (x.deal?.amountEGP ?? 0), 0);
  const by = new Map<string, number>();
  for (const x of deals) for (const n of x.deal?.sharks ?? []) by.set(n, (by.get(n) ?? 0) + 1);
  return { count: xs.length, deals: deals.length, invested, topSharks: [...by].sort((a, b) => b[1] - a[1]).slice(0, 5) };
};

/** Data for a page's generated share image (rendered after the build by scripts/og.mjs). */
export type Card = {
  kind: 'page' | 'startup' | 'person' | 'vs' | 'list';
  title: string; alt?: string; eyebrow?: string; sub?: string;
  photo?: string; shot?: string; play?: boolean; faces?: string[]; thumbs?: string[];
  stats?: [string, string][]; badge?: { text: string; tone: 'ok' | 'no' | 'ask' };
  vs?: { name: string; photo?: string; stats: string[] }[];
};
/** Share card for a page that lists startups (season, sector, episode, rankings…). */
export const listCard = (title: string, sub: string, items: Startup[], lang: Lang, eyebrow?: string): Card => {
  const st = stats(items);
  return { kind: 'list', title, sub, eyebrow,
    // Website screenshots first: they read better in a small stack than video frames.
    thumbs: [...items.map((x) => screenshot(x.id)), ...items.map((x) => (x.video ? thumb(x.video) : null))].filter((u): u is string => !!u).slice(0, 4),
    stats: [[num(st.count, lang), t[lang].statStartups], [num(st.deals, lang), t[lang].statDeals], ...(st.invested ? [[money(st.invested, lang)!, t[lang].statInvested] as [string, string]] : [])] };
};
