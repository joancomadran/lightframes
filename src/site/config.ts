/** Site-wide facts reused by meta tags, JSON-LD and llms.txt. */
export const SITE = {
  name: 'Lightframes',
  url: 'https://www.lightframes.si',
  ogImage: '/og-image.png',
  github: 'https://github.com/joancomadran/lightframes',
  donate: 'https://buymeacoffee.com/devcoma',
  license: 'https://opensource.org/license/mit',
  author: {
    name: 'Joan Comadran',
    url: 'https://www.joancomadran.dev',
    github: 'https://github.com/joancomadran',
    x: 'https://x.com/dev_coma',
    xHandle: '@dev_coma',
  },
  themeColor: '#171e1a',
} as const

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href
}
