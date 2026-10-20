import { SITE } from '../site/config'

/**
 * Everything is crawlable. AI crawlers are named explicitly so that the intent is clear
 * (and so a future Disallow for one of them is a one-line change).
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export const GET = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
      `Sitemap: ${SITE.url}/sitemap-index.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
