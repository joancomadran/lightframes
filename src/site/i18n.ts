export const LANGS = ['en', 'es'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'en'

export const LOCALES: Record<Lang, string> = { en: 'en_US', es: 'es_ES' }

/** Localized section roots. Collection entries add their own `slug` under these. */
const SECTIONS = {
  home: { en: '/', es: '/es' },
  tools: { en: '/tools', es: '/es/herramientas' },
  blog: { en: '/blog', es: '/es/blog' },
  faq: { en: '/faq', es: '/es/preguntas-frecuentes' },
  gear: { en: '/gear', es: '/es/equipo' },
  pages: { en: '', es: '/es' },
} satisfies Record<string, Record<Lang, string>>

export type Section = keyof typeof SECTIONS

/** The editor is a single English app shared by both languages. */
export const EDITOR_PATH = '/editor'

export function href(section: Section, lang: Lang, slug?: string): string {
  const root = SECTIONS[section][lang]
  return slug ? `${root}/${slug}` : root || '/'
}

/** Same route in every language, for static sections (home, tools index, faq…). */
export function sectionAlternates(section: Section): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((lang) => [lang, href(section, lang)])) as Record<Lang, string>
}

/** Collection ids look like "es/raw-editor": the folder is the language. */
export function langOf(id: string): Lang {
  const lang = id.split('/')[0]
  return (LANGS as readonly string[]).includes(lang) ? (lang as Lang) : DEFAULT_LANG
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const ui = {
  en: {
    langName: 'English',
    skip: 'Skip to content',
    nav: { tools: 'Tools', blog: 'Blog', faq: 'FAQ', gear: 'Gear', about: 'About' },
    openEditor: 'Open the editor',
    openEditorShort: 'Open editor',
    home: 'Home',
    tools: 'Tools',
    blog: 'Blog',
    footer: {
      tagline: 'A free, open-source photo editor that runs on your device.',
      tools: 'Tools',
      resources: 'Resources',
      project: 'Project',
      changelog: 'Changelog',
      github: 'Source on GitHub',
      donate: 'Buy me a coffee',
      privacy: 'Privacy',
      cookies: 'Cookies',
      terms: 'Legal notice & terms',
      madeBy: 'Made by',
      affiliate:
        'Some gear links are Amazon affiliate links: as an Amazon Associate, Lightframes earns from qualifying purchases.',
    },
    tool: {
      steps: 'How to do it',
      faq: 'Questions',
      related: 'More tools',
      updated: 'Updated',
      free: 'Free, no account, nothing uploaded',
    },
    blogIndex: {
      title: 'Photo editing guides',
      description: 'Practical guides to editing photos in the browser: RAW, presets, batch edits, carousels and more.',
      h1: 'Guides',
      lead: 'How-tos for editing photos on your own device, written alongside the editor.',
      empty: 'The first guides are on their way.',
      rss: 'RSS feed',
    },
    post: { by: 'By', published: 'Published', updated: 'Updated', tryIt: 'Try it in Lightframes' },
    toolsIndex: {
      title: 'Free online photo editing tools',
      description:
        'Every Lightframes tool in one place: RAW editing, batch edits, presets, LUTs, background removal, object removal, upscaling, carousels and collages.',
      h1: 'Tools',
      lead: 'Each tool is part of the same editor. Open it once and everything runs locally in your browser.',
    },
    faqPage: {
      title: 'Frequently asked questions',
      description: 'Answers about Lightframes: price, privacy, RAW formats, exporting, offline use, presets and on-device AI.',
      h1: 'Frequently asked questions',
    },
    gearPage: {
      title: 'Photography gear for editing and backup',
      description:
        'Gear that makes editing and backing up photos easier: SD cards, portable SSDs, card readers, calibrators and lenses.',
      h1: 'Gear',
      lead: 'Things that make shooting, importing and backing up less painful. Links go to Amazon.es.',
      cta: 'See on Amazon',
    },
    notFound: {
      title: 'Page not found',
      h1: 'This page isn’t here',
      body: 'The link may be old or mistyped. The editor and the guides are still where they were.',
      home: 'Go to the home page',
    },
    breadcrumb: 'Breadcrumb',
    langSwitch: 'Leer en español',
  },
  es: {
    langName: 'Español',
    skip: 'Saltar al contenido',
    nav: { tools: 'Herramientas', blog: 'Blog', faq: 'Preguntas', gear: 'Equipo', about: 'Sobre' },
    openEditor: 'Abrir el editor',
    openEditorShort: 'Abrir editor',
    home: 'Inicio',
    tools: 'Herramientas',
    blog: 'Blog',
    footer: {
      tagline: 'Un editor de fotos gratis y de código abierto que funciona en tu dispositivo.',
      tools: 'Herramientas',
      resources: 'Recursos',
      project: 'Proyecto',
      changelog: 'Novedades',
      github: 'Código en GitHub',
      donate: 'Invítame a un café',
      privacy: 'Privacidad',
      cookies: 'Cookies',
      terms: 'Aviso legal',
      madeBy: 'Hecho por',
      affiliate:
        'Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.',
    },
    tool: {
      steps: 'Cómo hacerlo',
      faq: 'Preguntas',
      related: 'Más herramientas',
      updated: 'Actualizado',
      free: 'Gratis, sin cuenta y sin subir nada',
    },
    blogIndex: {
      title: 'Guías de edición de fotos',
      description:
        'Guías prácticas para editar fotos en el navegador: RAW, presets, edición por lotes, carruseles y más.',
      h1: 'Guías',
      lead: 'Tutoriales para editar fotos en tu propio dispositivo, escritos junto al editor.',
      empty: 'Las primeras guías están en camino.',
      rss: 'Feed RSS',
    },
    post: { by: 'Por', published: 'Publicado', updated: 'Actualizado', tryIt: 'Pruébalo en Lightframes' },
    toolsIndex: {
      title: 'Herramientas gratis para editar fotos online',
      description:
        'Todas las herramientas de Lightframes: editar RAW, edición por lotes, presets, LUTs, quitar fondos, borrar objetos, ampliar fotos, carruseles y collages.',
      h1: 'Herramientas',
      lead: 'Todas forman parte del mismo editor. Ábrelo una vez y todo se procesa en tu navegador.',
    },
    faqPage: {
      title: 'Preguntas frecuentes',
      description:
        'Respuestas sobre Lightframes: precio, privacidad, formatos RAW, exportación, uso sin conexión, presets e IA en el dispositivo.',
      h1: 'Preguntas frecuentes',
    },
    gearPage: {
      title: 'Equipo fotográfico para editar y hacer copias',
      description:
        'Equipo que facilita editar y guardar copias de tus fotos: tarjetas SD, SSD portátiles, lectores, calibradores y objetivos.',
      h1: 'Equipo',
      lead: 'Cosas que hacen más fácil disparar, importar y guardar copias. Los enlaces van a Amazon.es.',
      cta: 'Ver en Amazon',
    },
    notFound: {
      title: 'Página no encontrada',
      h1: 'Esta página no existe',
      body: 'Puede que el enlace sea antiguo o tenga una errata. El editor y las guías siguen en su sitio.',
      home: 'Ir a la página de inicio',
    },
    breadcrumb: 'Ruta de navegación',
    langSwitch: 'Read in English',
  },
} as const

export type Ui = (typeof ui)[Lang]
