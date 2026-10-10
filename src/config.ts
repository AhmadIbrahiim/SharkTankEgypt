import { existsSync } from 'node:fs';
import data from './data/startups.json';
import seasons from './data/seasons.json';

export type Lang = 'ar' | 'en';
export const langs: Lang[] = ['ar', 'en'];
export type Startup = (typeof data)[number];
// Newest first; season 0 (July 2025 specials) aired between seasons 3 and 4.
const rank = (n: number) => (n === 0 ? 3.5 : n);
export const startups = [...data].sort((a, b) => rank(b.season) - rank(a.season) || (a.episode ?? 99) - (b.episode ?? 99));
export { seasons };

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
    results: 'نتيجة',
    emptyTitle: 'لا توجد نتائج',
    emptyText: 'جرّب كلمة أخرى أو امسح الفلاتر.',
    reset: 'مسح الفلاتر',
    website: 'الموقع',
    visit: 'زيارة الموقع',
    watch: 'شاهد العرض في البرنامج',
    online: 'تابعهم على الإنترنت',
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
    results: 'results',
    emptyTitle: 'Nothing found',
    emptyText: 'Try another word or clear the filters.',
    reset: 'Clear filters',
    website: 'Website',
    visit: 'Visit website',
    watch: 'Watch the pitch',
    online: 'Find them online',
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
