import { SITE, absoluteUrl } from './config'
import type { Lang } from './i18n'

/** JSON-LD node builders. Pages pass an array of these to the Base layout, which emits one @graph. */

type Node = Record<string, unknown>

const ORG_ID = `${SITE.url}/#organization`
const SITE_ID = `${SITE.url}/#website`
const APP_ID = `${SITE.url}/#app`
// Same @id as the Person node on joancomadran.dev, so both sites describe one entity
const AUTHOR_ID = `${SITE.author.url}/#person`

export function organization(): Node {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl('/pwa-512x512.png'),
    sameAs: [SITE.github],
    founder: { '@id': AUTHOR_ID },
  }
}

export function author(): Node {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: SITE.author.name,
    url: SITE.author.url,
    sameAs: [SITE.author.url, SITE.author.github, SITE.author.x],
  }
}

export function website(lang: Lang): Node {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    url: SITE.url,
    inLanguage: ['en', 'es'],
    publisher: { '@id': ORG_ID },
    ...(lang === 'es' ? { alternateName: 'Lightframes, editor de fotos online' } : {}),
  }
}

export function webApplication(lang: Lang, featureList: string[]): Node {
  return {
    '@type': 'WebApplication',
    '@id': APP_ID,
    name: SITE.name,
    url: absoluteUrl('/editor'),
    description:
      lang === 'es'
        ? 'Aplica tus presets de Lightroom, XMP y LUTs .cube por lotes y exporta un carrusel listo para Instagram. Gratis, en el navegador, sin subir tus fotos.'
        : 'Apply your Lightroom presets, XMP and .cube LUTs in batch and export an Instagram-ready carousel. Free, in the browser, nothing uploaded.',
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Photo editor',
    operatingSystem: 'Any (modern web browser)',
    browserRequirements: 'Requires JavaScript, WebAssembly and Web Workers',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    license: SITE.license,
    codeRepository: SITE.github,
    author: { '@id': AUTHOR_ID },
    creator: { '@id': AUTHOR_ID },
    screenshot: absoluteUrl('/site/shots/editor.jpg'),
    featureList,
    publisher: { '@id': ORG_ID },
  }
}

export function webPage(opts: {
  url: string
  name: string
  description: string
  lang: Lang
  type?: 'WebPage' | 'AboutPage' | 'FAQPage' | 'CollectionPage'
  updated?: Date
}): Node {
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: opts.lang,
    isPartOf: { '@id': SITE_ID },
    ...(opts.updated ? { dateModified: opts.updated.toISOString() } : {}),
  }
}

export function breadcrumbs(items: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqPage(url: string, items: readonly { q: string; a: string }[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function howTo(url: string, name: string, steps: readonly { name: string; text: string }[]): Node {
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name,
    tool: { '@id': APP_ID },
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      url: `${url}#step-${i + 1}`,
    })),
  }
}

export function blogPosting(opts: {
  url: string
  headline: string
  description: string
  lang: Lang
  published: Date
  updated?: Date
  image: string
  keywords: string[]
}): Node {
  return {
    '@type': 'BlogPosting',
    '@id': `${opts.url}#article`,
    mainEntityOfPage: opts.url,
    headline: opts.headline,
    description: opts.description,
    inLanguage: opts.lang,
    datePublished: opts.published.toISOString(),
    dateModified: (opts.updated ?? opts.published).toISOString(),
    image: absoluteUrl(opts.image),
    keywords: opts.keywords.join(', ') || undefined,
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
  }
}
