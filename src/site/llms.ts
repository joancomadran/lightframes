import { SITE } from './config'
import { entryPath, getFaq, getPages, getPosts, getTools } from './content'
import { EDITOR_PATH, href } from './i18n'

/** llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants, built from the collections. */

const url = (path: string) => new URL(path, SITE.url).href

const SUMMARY = `> Lightframes is a free, open-source (MIT) photo editor that runs entirely in the web browser. Photos are processed on the user's device with WebAssembly and Web Workers and are never uploaded. No account is needed. It edits camera RAW and JPEG/PNG files, supports custom presets (including XMP and .cube LUT import), copy/paste and batch edits, RAW-to-JPG conversion and batch export to JPEG/PNG/WebP, and on-device AI tools (background removal, object removal, upscaling). It is an installable PWA. Editing works offline once the app has loaded. Object removal downloads its model from Hugging Face the first time it is used; background removal, subject masks and upscaling download theirs from lightframes.si. Page visits are counted with cookieless Vercel Web Analytics. The site includes Amazon affiliate links that open Amazon only when clicked.`

const FACTS = [
  `- Editor: ${url(EDITOR_PATH)}`,
  '- Price: free. Funded by affiliate links, a few small ad spaces and optional donations.',
  `- Source code: ${SITE.github} (MIT license)`,
  `- Maker: ${SITE.author.name}, AI engineer and full stack developer in Barcelona (${SITE.author.url})`,
  '- Languages: site in English and Spanish (/es/); the editor interface is in English.',
  '- Privacy: photos stay on the device and are never uploaded. Edits, presets and the session are stored in the browser. Visits use cookieless Vercel Web Analytics. The first use of object removal downloads MI-GAN from Hugging Face (that request shows your IP, like any download). Other AI models come from this site. Amazon affiliate links open Amazon only when clicked.',
]

export async function llmsTxt(): Promise<string> {
  const [tools, posts, pages, toolsEs] = await Promise.all([getTools('en'), getPosts('en'), getPages('en'), getTools('es')])
  return [
    `# ${SITE.name}`,
    '',
    SUMMARY,
    '',
    ...FACTS,
    '',
    '## Tools',
    '',
    ...tools.map((tool) => `- [${tool.data.h1}](${url(entryPath(tool))}): ${tool.data.lead}`),
    '',
    '## Guides',
    '',
    ...posts.map((post) => `- [${post.data.h1 ?? post.data.title}](${url(entryPath(post))}): ${post.data.description}`),
    '',
    '## Reference',
    '',
    `- [Frequently asked questions](${url(href('faq', 'en'))})`,
    ...pages.map((page) => `- [${page.data.h1}](${url(entryPath(page))}): ${page.data.description}`),
    `- [Full text for AI assistants](${url('/llms-full.txt')})`,
    '',
    '## Optional',
    '',
    `- [Español: inicio](${url(href('home', 'es'))})`,
    ...toolsEs.map((tool) => `- [${tool.data.h1}](${url(entryPath(tool))})`),
    '',
  ].join('\n')
}

/** Every tool page, guide and the FAQ as Markdown, for assistants that want the full text in one fetch. */
export async function llmsFullTxt(): Promise<string> {
  const [tools, posts, faq] = await Promise.all([getTools('en'), getPosts('en'), getFaq('en')])
  const section = (title: string, path: string, lead: string, body = '') =>
    [`## ${title}`, '', `Source: ${url(path)}`, '', lead, '', body.trim(), ''].join('\n')
  return [
    `# ${SITE.name}`,
    '',
    SUMMARY,
    '',
    ...FACTS,
    '',
    ...tools.map((tool) =>
      section(
        tool.data.h1,
        entryPath(tool),
        tool.data.lead,
        [
          tool.body ?? '',
          tool.data.steps.length ? `### Steps\n\n${tool.data.steps.map((s, i) => `${i + 1}. **${s.name}.** ${s.text}`).join('\n')}` : '',
          tool.data.faq.length ? `### Questions\n\n${tool.data.faq.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}` : '',
        ].join('\n\n'),
      ),
    ),
    ...posts.map((post) => section(post.data.h1 ?? post.data.title, entryPath(post), post.data.description, post.body)),
    section('Frequently asked questions', href('faq', 'en'), '', faq.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')),
  ].join('\n')
}
