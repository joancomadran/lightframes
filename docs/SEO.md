# Web, blog y SEO: guía para editar el contenido

El sitio es Astro (HTML estático, sin JS en las páginas de contenido) y el editor es una isla React en `/editor`. Todo el contenido editable está en Markdown/JSON; no hace falta tocar componentes para cambiar textos, títulos, metas o FAQs.

```bash
npm run dev      # http://localhost:4321
npm run build    # astro check + build → dist/
```

## Mapa de URLs

| EN | ES | Origen del contenido |
| --- | --- | --- |
| `/` | `/es` | `src/site/landing.ts` (copy) + `src/site/views/LandingView.astro` |
| `/editor` | (mismo) | La app. Interfaz solo en inglés |
| `/tools` | `/es/herramientas` | textos en `src/site/i18n.ts` → `toolsIndex` |
| `/tools/<slug>` | `/es/herramientas/<slug>` | `src/content/tools/{en,es}/*.md` |
| `/blog`, `/blog/<slug>` | `/es/blog`, `/es/blog/<slug>` | `src/content/blog/{en,es}/*.md` |
| `/blog/rss.xml` | `/es/blog/rss.xml` | generado |
| `/faq` | `/es/preguntas-frecuentes` | `src/content/faq/{en,es}.json` (las 6 primeras salen también en la home) |
| `/gear` | `/es/equipo` | `src/lib/affiliate.ts` (compartido con el editor) + traducciones en `src/site/views/GearView.astro` |
| `/about`, `/changelog`, `/privacy`, `/cookies`, `/terms` | `/es/sobre-lightframes`, `/es/novedades`, `/es/privacidad`, `/es/cookies`, `/es/terminos` | `src/content/pages/{en,es}/*.md` |
| `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | | generados en el build |

## Frontmatter

El esquema completo está en `src/content.config.ts`; si falta un campo obligatorio, el build falla. Los más importantes:

- `title`: el `<title>`, sin la marca (se añade " · Lightframes"). En la home el título va completo en `landing.ts`.
- `description`: la meta description (140–160 caracteres).
- `slug`: el segmento de URL en ese idioma. Si cambias uno publicado, añade una redirección en `vercel.json`.
- `key`: debe ser igual en EN y ES. Es lo que empareja las traducciones para el `hreflang`.
- `h1` y `lead`: el titular y la respuesta directa a la intención de búsqueda. El `lead` es la frase que más fácilmente citará un LLM.
- `steps` y `faq` (herramientas): se pintan en la página y generan los JSON-LD `HowTo` y `FAQPage`. No los repitas en el cuerpo.
- `keywords`: referencia interna, no se publica.
- `ogImage`: ruta en `/public` de una imagen de 1200×630 para esa página. Si no se indica, se usa `/og-image.png`.
- `noindex`, y `draft` en el blog: los borradores no se publican en producción.

Un post nuevo se crea copiando uno existente en `src/content/blog/en/` y su par en `es/` con el mismo `key`. Las herramientas que lista en `tools:` aparecen al final como enlaces.

## Lo que ya está hecho

- Dominio canónico: `https://www.lightframes.si` (`SITE.url` en `src/site/config.ts` y `site` en `astro.config.mjs`). El apex redirige a www, así que canonical, `hreflang`, sitemap, `og:url`, JSON-LD y `llms.txt` usan siempre www.
- HTML estático con canonical, `hreflang` (en, es, x-default), Open Graph y Twitter, y `og:locale` en cada página.
- JSON-LD en un `@graph`: `Organization`, `WebSite`, `WebApplication` (gratis, MIT), `WebPage`/`AboutPage`/`CollectionPage`, `BreadcrumbList`, `FAQPage`, `HowTo`, `BlogPosting` + `Person` (autor) e `ItemList`.
- Un sitemap que excluye la 404 y un `robots.txt` que permite explícitamente GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended y CCBot.
- `llms.txt` y `llms-full.txt` (todo el texto de las herramientas, las guías y la FAQ en Markdown), que se regeneran solos a partir del contenido.
- Migas, enlazado interno (pie, herramientas relacionadas, "Pruébalo" en los posts) y una 404 propia.
- Si alguien abre la PWA instalada en `/`, se le redirige a `/editor`.

## Pendiente: decisiones para SEO

1. **Dominio `.si`.** Google trata `.si` como un dominio geolocalizado en Eslovenia (no está entre sus dominios de país "genéricos"), y Search Console no permite cambiar la segmentación de un dominio de país. Hay que valorar si conviene migrar a un `.com`, `.app` o similar antes de acumular autoridad.
2. **Imágenes OG por página.** Ahora todas usan `/og-image.png`.
3. **`hreflang` en el sitemap.** Por ahora solo está en el `<head>`. Como las URLs están localizadas, el plugin del sitemap no puede emparejarlas solo; habría que hacerlo con `serialize` a partir de `key`.
4. **Search Console y Bing Webmaster.** Verificar el dominio y enviar `sitemap-index.xml`.
5. ~~**Google Fonts.**~~ Hecho: las fuentes se sirven desde el propio dominio con `@fontsource-variable` (`font-display: swap`).
6. **Banner de consentimiento (CMP)** antes de activar AdSense o cualquier red de anuncios. Ahora mismo no hay cookies propias que no sean técnicas.
7. ~~**Textos legales.**~~ Hecho: titular Joan Comadran (persona física, España), contacto por X (https://x.com/dev_coma). Quedan comentarios `<!-- TODO legal review … -->` en el Markdown, que salen en el HTML publicado: revisarlos o quitarlos.
8. **Datos de Instagram en los posts del carrusel** (ratio 3:4 y límite de diapositivas): marcados con TODO para comprobarlos.
9. **Marca.** Lightroom solo se puede nombrar en frases de compatibilidad ("importa presets .xmp de Lightroom / Camera Raw", "funciona con tus presets de Lightroom") y como "alternativa gratis a Lightroom" en textos descriptivos. Nunca comparativas punto por punto, críticas ni nada que sugiera afiliación con Adobe; donde se nombre en detalle, añadir que Lightroom y Camera Raw son marcas de Adobe. No mencionar otros productos concretos.
10. **Afiliados de Amazon.** El texto de divulgación obligatorio en español está en `src/lib/affiliate.ts` y se muestra en `/gear` y en el pie en español.
