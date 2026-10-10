// Keys allowed in a startup's "links", in display order, with the hosts each may point to.
// Shared by the site and scripts/check-data.mjs.
export const platforms = {
  instagram: { en: 'Instagram', ar: 'إنستجرام', hosts: ['instagram.com'] },
  facebook: { en: 'Facebook', ar: 'فيسبوك', hosts: ['facebook.com', 'fb.com'] },
  tiktok: { en: 'TikTok', ar: 'تيك توك', hosts: ['tiktok.com'] },
  x: { en: 'X (Twitter)', ar: 'إكس (تويتر)', hosts: ['x.com', 'twitter.com'] },
  linkedin: { en: 'LinkedIn', ar: 'لينكدإن', hosts: ['linkedin.com'] },
  youtube: { en: 'YouTube', ar: 'يوتيوب', hosts: ['youtube.com', 'youtu.be'] },
  snapchat: { en: 'Snapchat', ar: 'سناب شات', hosts: ['snapchat.com'] },
  threads: { en: 'Threads', ar: 'ثريدز', hosts: ['threads.net', 'threads.com'] },
  telegram: { en: 'Telegram', ar: 'تيليجرام', hosts: ['t.me', 'telegram.me'] },
  pinterest: { en: 'Pinterest', ar: 'بنترست', hosts: ['pinterest.com'] },
  behance: { en: 'Behance', ar: 'بيهانس', hosts: ['behance.net'] },
  linktree: { en: 'Linktree', ar: 'لينكتري', hosts: ['linktr.ee'] },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب', hosts: ['wa.me', 'whatsapp.com'] },
  appStore: { en: 'App Store', ar: 'آب ستور', hosts: ['apps.apple.com'] },
  googlePlay: { en: 'Google Play', ar: 'جوجل بلاي', hosts: ['play.google.com'] },
};

/** Which platform key a URL belongs to (subdomains like m./eg./ar-ar. included), or undefined. */
export const platformOf = (url) => {
  const h = new URL(url).hostname.toLowerCase();
  return Object.keys(platforms).find((k) => platforms[k].hosts.some((d) => h === d || h.endsWith(`.${d}`)));
};
