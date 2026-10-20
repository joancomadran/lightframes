import rss from '@astrojs/rss'
import { SITE } from './config'
import { entryPath, getPosts } from './content'
import { href, ui, type Lang } from './i18n'

export async function rssFeed(lang: Lang) {
  const posts = await getPosts(lang)
  return rss({
    title: `${SITE.name} — ${ui[lang].blogIndex.title}`,
    description: ui[lang].blogIndex.description,
    site: new URL(href('blog', lang), SITE.url).href,
    customData: `<language>${lang}</language>`,
    items: posts.map((post) => ({
      title: post.data.h1 ?? post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: entryPath(post),
      categories: post.data.tags,
      author: post.data.author,
    })),
  })
}
