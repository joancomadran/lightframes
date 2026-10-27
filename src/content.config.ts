import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Editable site content. Every entry lives under `src/content/<collection>/<lang>/`,
 * so the language comes from the folder and `key` ties translations together (hreflang).
 */

/** Keep "<lang>/<file>" as the id: the default would use the frontmatter `slug` and drop the language folder. */
const byPath = ({ entry }: { entry: string }) => entry.replace(/\.(md|json)$/, '')

const faqItem = z.object({ q: z.string(), a: z.string() })

/** SEO fields shared by every indexable entry. */
const seo = {
  /** <title> without the brand suffix; aim for ≤ 60 characters including " · Lightframes". */
  title: z.string(),
  /** Meta description, 140–160 characters. */
  description: z.string(),
  /** Same value across languages: pairs translations for hreflang. */
  key: z.string(),
  /** URL segment in this language. */
  slug: z.string(),
  /** Absolute path under /public for a page-specific Open Graph image (1200×630). */
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
}

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools', generateId: byPath }),
  schema: z.object({
    ...seo,
    h1: z.string(),
    /** One or two sentences under the H1: the direct answer to the search intent. */
    lead: z.string(),
    /** Short label for menus and cards. */
    label: z.string(),
    /** Card text on the landing and the tools index. */
    summary: z.string(),
    order: z.number(),
    /** Listed on the landing, in the footer and under "More tools". Narrow variants (one RAW format) set false. */
    featured: z.boolean().default(true),
    /** Target queries, for the SEO team's reference only (never rendered). */
    keywords: z.array(z.string()).default([]),
    steps: z.array(z.object({ name: z.string(), text: z.string() })).default([]),
    faq: z.array(faqItem).default([]),
    updated: z.coerce.date(),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog', generateId: byPath }),
  schema: z.object({
    ...seo,
    h1: z.string().optional(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Joan Comadran'),
    tags: z.array(z.string()).default([]),
    /** Tool keys this post links to; rendered as "Try it" cards. */
    tools: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
})

/** Plain prose pages: about, legal, changelog. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages', generateId: byPath }),
  schema: z.object({
    ...seo,
    h1: z.string(),
    updated: z.coerce.date(),
    schemaType: z.enum(['WebPage', 'AboutPage']).default('WebPage'),
  }),
})

/** One file per language: src/content/faq/<lang>.json → { items: [{ q, a }] }. */
const faq = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/faq', generateId: byPath }),
  schema: z.object({ items: z.array(faqItem) }),
})

export const collections = { tools, blog, pages, faq }
