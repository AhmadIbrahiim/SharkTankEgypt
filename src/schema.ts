// schema.org entity graph shared by every page. Entities get one stable @id (the English page URL + a fragment),
// so the Arabic and English pages describe the same shark, founder, startup or season and Google can join them.
import { seasons, sharkByKey, founderId, t, type Startup } from './config';

export const ROOT = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), import.meta.env.SITE).href;
export const ID = {
  site: `${ROOT}#website`,
  org: `${ROOT}#organization`,
  series: `${ROOT}#series`,
  startup: (id: string) => `${ROOT}en/${id}/#organization`,
  shark: (id: string) => `${ROOT}en/sharks/${id}/#person`,
  founder: (id: string) => `${ROOT}en/founders/${id}/#person`,
  season: (n: number) => `${ROOT}en/season/${n}/#season`,
  episode: (n: number, e: number) => `${ROOT}en/season/${n}/episode/${e}/#episode`,
};
/** Absolute URL for a site path ("/people/x.jpg") or a full URL. */
export const absUrl = (u: string) => (u.startsWith('http') ? u : new URL(u.replace(/^\//, ''), ROOT).href);

export const sharkRef = (key: string) => ({ '@type': 'Person', '@id': ID.shark(sharkByKey.get(key)?.id ?? founderId(key)), name: key });
export const founderRef = (name: string) => ({ '@type': 'Person', '@id': ID.founder(founderId(name)), name });
export const startupRef = (x: Startup) => ({ '@type': 'Organization', '@id': ID.startup(x.id), name: x.name.en });
/** A photo with its credit, so Google can show "Credit:" in Images. */
export const photo = (p?: { url: string; credit?: string; creditUrl?: string }) =>
  p && { '@type': 'ImageObject', contentUrl: absUrl(p.url), url: absUrl(p.url), ...(p.credit && { creditText: p.credit }) };
export const seasonRef = (n: number) => ({ '@type': 'TVSeason', '@id': ID.season(n), seasonNumber: n });

/** The publisher, the site and the show: the same three nodes on every page. */
export const siteNodes = () => [
  { '@type': 'Organization', '@id': ID.org, name: 'Shark Tank Egypt Directory', alternateName: ['دليل شارك تانك مصر', 'دليل شركات شارك تانك مصر'],
    url: ROOT, logo: { '@type': 'ImageObject', url: `${ROOT}icon-512.png`, width: 512, height: 512 },
    sameAs: ['https://github.com/AhmadIbrahiim/SharkTankEgypt'] },
  // Google supports one site name per subdomain; translations and the hostname are alternatives.
  { '@type': 'WebSite', '@id': ID.site, url: ROOT, name: t.en.title,
    alternateName: [t.en.brandName, t.ar.title, t.ar.brandName, 'دليل شارك تانك مصر', new URL(ROOT).hostname],
    inLanguage: ['ar', 'en'], publisher: { '@id': ID.org } },
  { '@type': 'TVSeries', '@id': ID.series, name: 'Shark Tank Egypt', alternateName: 'شارك تانك مصر', inLanguage: 'ar', countryOfOrigin: { '@type': 'Country', name: 'Egypt' },
    numberOfSeasons: seasons.filter((s) => s.season > 0).length, containsSeason: seasons.map((s) => seasonRef(s.season)),
    actor: [...new Set(seasons.flatMap((s) => s.sharks))].map(sharkRef) },
];
