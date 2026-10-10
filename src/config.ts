import { existsSync } from 'node:fs';
import startups from './data/startups.json';
import seasons from './data/seasons.json';

export type Lang = 'ar' | 'en';
export const langs: Lang[] = ['ar', 'en'];
export type Startup = (typeof startups)[number];
export { startups, seasons };

// Fill these from https://giscus.app after enabling Discussions on the repo.
// Comments stay hidden until repoId and categoryId are set.
export const giscus = {
  repo: 'AhmadIbrahiim/SharkTankEgypt',
  repoId: '',
  category: 'Startups',
  categoryId: '',
};

// Google Search Console → HTML tag verification → paste the content="…" value here.
export const googleVerification = '';

export const t = {
  ar: {
    title: 'دليل شركات شارك تانك مصر',
    tagline: 'كل الشركات الناشئة التي ظهرت في كل مواسم وحلقات شارك تانك مصر',
    search: 'ابحث باسم الشركة أو المجال أو المؤسس…',
    allSeasons: 'كل المواسم',
    season: 'الموسم',
    episode: 'الحلقة',
    allDeals: 'كل النتائج',
    deal: 'تمت الصفقة',
    noDeal: 'لم تتم صفقة',
    allCategories: 'كل المجالات',
    website: 'الموقع',
    ask: 'الطلب',
    finalDeal: 'الصفقة',
    sharks: 'المستثمرون',
    founders: 'المؤسسون',
    sources: 'المصادر',
    comments: 'التقييم والتعليقات',
    rateHint: 'قيّم الشركة بالتفاعل 👍 ❤️ 🚀 واكتب رأيك (يتطلب حساب GitHub).',
    commentsOff: 'التعليقات غير مفعّلة بعد.',
    back: '→ كل الشركات',
    results: 'نتيجة',
    egp: 'ج.م',
    edit: 'تصحيح أو إضافة بيانات',
    switchLang: 'English',
  },
  en: {
    title: 'Shark Tank Egypt Directory',
    tagline: 'Every startup that pitched on Shark Tank Egypt, across all seasons and episodes',
    search: 'Search by name, category or founder…',
    allSeasons: 'All seasons',
    season: 'Season',
    episode: 'Episode',
    allDeals: 'All outcomes',
    deal: 'Deal',
    noDeal: 'No deal',
    allCategories: 'All categories',
    website: 'Website',
    ask: 'Ask',
    finalDeal: 'Deal',
    sharks: 'Sharks',
    founders: 'Founders',
    sources: 'Sources',
    comments: 'Rating & comments',
    rateHint: 'Rate it with 👍 ❤️ 🚀 reactions and leave a comment (GitHub sign-in required).',
    commentsOff: 'Comments are not enabled yet.',
    back: '← All startups',
    results: 'results',
    egp: 'EGP',
    edit: 'Fix or add data',
    switchLang: 'العربية',
  },
} as const;

export const money = (n: number | null | undefined, lang: Lang) =>
  n == null ? '—' : `${n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} ${t[lang].egp}`;

export const terms = (amount?: number | null, pct?: number | null, lang: Lang = 'en') =>
  amount == null && pct == null ? '—' : `${money(amount, lang)} / ${pct ?? '—'}%`;

/** Path (relative to base) of a startup's captured screenshot, or null. */
export const screenshot = (id: string) => (existsSync(`public/screenshots/${id}.jpg`) ? `/screenshots/${id}.jpg` : null);
