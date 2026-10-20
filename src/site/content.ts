import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { href, langOf, type Lang, type Section } from './i18n'

export type Tool = CollectionEntry<'tools'>
export type Post = CollectionEntry<'blog'>
export type Page = CollectionEntry<'pages'>

const SECTION_OF = { tools: 'tools', blog: 'blog', pages: 'pages' } as const satisfies Record<string, Section>

export async function getTools(lang: Lang): Promise<Tool[]> {
  const tools = await getCollection('tools', (entry) => langOf(entry.id) === lang)
  return tools.sort((a, b) => a.data.order - b.data.order)
}

export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = await getCollection(
    'blog',
    (entry) => langOf(entry.id) === lang && (import.meta.env.DEV || !entry.data.draft),
  )
  return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf())
}

export async function getPages(lang: Lang): Promise<Page[]> {
  return getCollection('pages', (entry) => langOf(entry.id) === lang)
}

export async function getFaq(lang: Lang) {
  return (await getEntry('faq', lang))?.data.items ?? []
}

type Entry = Tool | Post | Page

export function entryPath(entry: Entry): string {
  return href(SECTION_OF[entry.collection], langOf(entry.id), entry.data.slug)
}

/** URL of `key` in each language that has it, for hreflang. */
export async function entryAlternates(entry: Entry): Promise<Partial<Record<Lang, string>>> {
  const siblings = (await getCollection(entry.collection)) as Entry[]
  return Object.fromEntries(
    siblings
      .filter((other) => other.data.key === entry.data.key && !('draft' in other.data && other.data.draft))
      .map((other) => [langOf(other.id), entryPath(other)]),
  )
}

/** Path of a page entry (about, privacy…) by key, falling back to English. */
export async function pagePath(key: string, lang: Lang): Promise<string> {
  const pages = await getCollection('pages', (entry) => entry.data.key === key)
  const page = pages.find((entry) => langOf(entry.id) === lang) ?? pages.find((entry) => langOf(entry.id) === 'en')
  return page ? entryPath(page) : href('home', lang)
}
