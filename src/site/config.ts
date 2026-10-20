/** Site-wide facts reused by meta tags, JSON-LD and llms.txt. */
export const SITE = {
  name: 'Lightframes',
  url: 'https://lightframes.si',
  ogImage: '/og-image.png',
  github: 'https://github.com/joancomadran/lightframes',
  donate: 'https://buymeacoffee.com/devcoma',
  license: 'https://opensource.org/license/mit',
  author: {
    name: 'Joan Comadran',
    github: 'https://github.com/joancomadran',
  },
  themeColor: '#171e1a',
} as const

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href
}
