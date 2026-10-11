// robots.txt, built from the site address so it follows a domain change.
import { ROOT } from '../schema';

// Named explicitly so there's no doubt: AI search and answer engines are welcome to read and cite the directory.
const AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot'];
export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\n${AI.map((a) => `User-agent: ${a}\nAllow: /\n`).join('')}\nSitemap: ${ROOT}sitemap.xml\n# AI-readable summary: ${ROOT}llms.txt\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
