import type { Lang } from './i18n'

export interface Still {
  /** WebP fallback. */
  src: string
  avif: string
  width: number
  height: number
  alt: string
  label: string
  /** Draw a checkerboard behind the pixels so a transparent background reads as empty. */
  transparent?: boolean
  /** Above-the-fold result. Preload the AVIF separately; this only sets fetch priority. */
  priority?: boolean
}

/**
 * Stills in public/site/results/, produced by scripts/build-result-stills.mjs
 * from public/samples/. The captions say what was actually done.
 */

const SRC = '/site/results'

function still(
  name: string,
  width: number,
  height: number,
  alt: string,
  label: string,
  extra: Partial<Still> = {},
): Still {
  return {
    src: `${SRC}/${name}.webp`,
    avif: `${SRC}/${name}.avif`,
    width,
    height,
    alt,
    label,
    ...extra,
  }
}

export interface ResultExample {
  /** Tool `key`, when the example belongs on that tool page. */
  toolKey: string
  href: string
  title: string
  caption: string
  shots: Still[]
}

const PATHS: Record<Lang, Record<string, string>> = {
  en: {
    'raw-to-jpg': '/tools/raw-to-jpg',
    'background-remover': '/tools/background-remover',
    'remove-objects': '/tools/remove-objects-from-photos',
    upscaler: '/tools/ai-image-upscaler',
    carousel: '/tools/instagram-carousel-maker',
  },
  es: {
    'raw-to-jpg': '/es/herramientas/convertir-raw-a-jpg',
    'background-remover': '/es/herramientas/quitar-fondo-foto',
    'remove-objects': '/es/herramientas/borrar-objetos-foto',
    upscaler: '/es/herramientas/ampliar-foto-ia',
    carousel: '/es/herramientas/carrusel-instagram',
  },
}

export function resultExamples(lang: Lang): ResultExample[] {
  const en = lang === 'en'
  const before = en ? 'Before' : 'Antes'
  const after = en ? 'After' : 'Después'
  const href = PATHS[lang]
  return [
    {
      toolKey: 'raw-to-jpg',
      href: href['raw-to-jpg'],
      title: en ? 'Develop, then export' : 'Revelar y exportar',
      caption: en
        ? 'Before is public/samples/twelve-apostles.jpg, the flat JPEG shipped with the editor (developed flat from the author’s RAW; that RAW file is not in the repo). After is the same JPEG through the editor’s develop pipeline: exposure +0.85, contrast +26, highlights −65, shadows +85, whites +25, blacks −20, temperature +22, vibrance +55, saturation +8, clarity +32, dehaze +30.'
        : 'Antes es public/samples/twelve-apostles.jpg, el JPEG plano que trae el editor (revelado plano a partir del RAW del autor; ese RAW no está en el repositorio). Después es el mismo JPEG pasado por el revelado del editor: exposición +0,85, contraste +26, altas luces −65, sombras +85, blancos +25, negros −20, temperatura +22, intensidad +55, saturación +8, claridad +32, dehaze +30.',
      shots: [
        still(
          'develop-before',
          1200,
          801,
          en
            ? 'Twelve Apostles sea stacks, the flat sample JPEG before adjustments'
            : 'Los Twelve Apostles, el JPEG de ejemplo plano, antes de los ajustes',
          before,
        ),
        still(
          'develop-after',
          1200,
          801,
          en
            ? 'The same Twelve Apostles photo after exposure, colour and clarity in Lightframes'
            : 'La misma foto de los Twelve Apostles tras exposición, color y claridad en Lightframes',
          after,
        ),
      ],
    },
    {
      toolKey: 'background-remover',
      href: href['background-remover'],
      title: en ? 'Background removed' : 'Fondo quitado',
      caption: en
        ? 'A crop of public/samples/pagoda.jpg. After uses the IS-Net subject mask shipped in public/models, cleaned with the editor’s speck filter, and keeps the background transparent. The checkerboard is not part of the photo. The crop is the tower; the same mask also keeps some leaves lower in the frame.'
        : 'Un recorte de public/samples/pagoda.jpg. Después usa la máscara de sujeto IS-Net que va en public/models, limpia con el filtro de motas del editor, y deja el fondo transparente. El damero no forma parte de la foto. El recorte es la torre; la misma máscara también conserva algunas hojas más abajo.',
      shots: [
        still(
          'cutout-before',
          731,
          877,
          en ? 'Pagoda tower against a cloudy sky, before background removal' : 'Torre de la pagoda contra un cielo nublado, antes de quitar el fondo',
          before,
        ),
        still(
          'cutout-after',
          731,
          877,
          en
            ? 'The same pagoda crop with the sky removed and a transparent background'
            : 'El mismo recorte de la pagoda con el cielo quitado y el fondo transparente',
          after,
          { transparent: true },
        ),
      ],
    },
    {
      toolKey: 'remove-objects',
      href: href['remove-objects'],
      title: en ? 'Person healed out' : 'Persona eliminada con el parche',
      caption: en
        ? 'A crop of public/samples/pagoda.jpg. After is one Heal spot on the person standing on the gravel: brush radius about 53 px on the long edge, copying gravel from 110 px left and 70 px up, then blended by the editor’s Heal code. The brush also reaches the second person, who stands against the eaves, so that edge stays soft. An inpaint of these figures filled the hole with leaves, so this still is the Heal result.'
        : 'Un recorte de public/samples/pagoda.jpg. Después es un parche Heal sobre la persona que está en la grava: radio de unos 53 px en el lado largo, copiando grava desde 110 px a la izquierda y 70 px arriba, y mezclado con el código Heal del editor. El pincel también alcanza a la segunda persona, que está contra el alero, así que ese borde queda suave. Un relleno por IA de estas figuras cubrió el hueco con hojas, así que este ejemplo es el resultado de Heal.',
      shots: [
        still(
          'remove-before',
          840,
          672,
          en
            ? 'Two people on the gravel path under the pagoda eaves, before healing'
            : 'Dos personas en el camino de grava bajo el alero de la pagoda, antes del parche',
          before,
        ),
        still(
          'remove-after',
          840,
          672,
          en
            ? 'The same crop after Heal copies nearby gravel over the person on the path'
            : 'El mismo recorte después de que Heal copia la grava cercana sobre la persona del camino',
          after,
        ),
      ],
    },
    {
      toolKey: 'upscaler',
      href: href.upscaler,
      title: en ? '2× upscale' : 'Ampliación 2×',
      caption: en
        ? 'A 600×450 crop of the pagoda roof in public/samples/pagoda.jpg, scaled down to 256 px on the long edge. Before enlarges that small crop 2× with a smooth resize. After is Real-ESRGAN (the model in public/models) at 2× on the same pixels, mixed with 20% of the smooth resize, which is what export does. It is not detail that was never in the file.'
        : 'Un recorte de 600×450 del tejado de la pagoda en public/samples/pagoda.jpg, reducido a 256 px en el lado largo. Antes amplía ese recorte pequeño 2× con un reescalado suave. Después es Real-ESRGAN (el modelo de public/models) a 2× sobre los mismos píxeles, mezclado con un 20% del reescalado suave, que es lo que hace la exportación. No es detalle que no estuviera en el archivo.',
      shots: [
        still(
          'upscale-before',
          512,
          384,
          en
            ? 'Pagoda roof crop enlarged 2× with a smooth resize from a 256 px source'
            : 'Recorte del tejado de la pagoda ampliado 2× con un reescalado suave desde 256 px',
          en ? 'Smooth resize' : 'Reescalado suave',
        ),
        still(
          'upscale-after',
          512,
          384,
          en
            ? 'The same roof crop enlarged 2× with Real-ESRGAN and a 20% smooth-resize mix'
            : 'El mismo recorte del tejado ampliado 2× con Real-ESRGAN y un 20% de reescalado suave',
          en ? 'Real-ESRGAN 2×' : 'Real-ESRGAN 2×',
        ),
      ],
    },
    {
      toolKey: 'carousel',
      href: href.carousel,
      title: en ? 'Three seamless slides' : 'Tres diapositivas continuas',
      caption: en
        ? 'public/samples/twelve-apostles.jpg in the Panorama layout: one photo across three 4:5 slides, cover-fit, painted by the editor’s carousel painter. Each slide is 540×675, half of the 1080×1350 export, so the crop is the export crop.'
        : 'public/samples/twelve-apostles.jpg en la disposición Panorama: una foto a lo largo de tres diapositivas 4:5, en cover, pintadas con el pintor de carrusel del editor. Cada diapositiva es de 540×675, la mitad de la exportación a 1080×1350, así que el recorte es el de la exportación.',
      shots: [
        still(
          'carousel-source',
          960,
          640,
          en ? 'The full Twelve Apostles sample, before it is split into slides' : 'La foto completa de ejemplo de los Twelve Apostles, antes de dividirla',
          en ? 'Source' : 'Origen',
        ),
        still(
          'carousel-1',
          540,
          675,
          en ? 'Carousel slide 1 of 3, the left of the Twelve Apostles panorama' : 'Diapositiva 1 de 3 del carrusel, la izquierda de la panorámica',
          en ? 'Slide 1' : 'Diapositiva 1',
        ),
        still(
          'carousel-2',
          540,
          675,
          en ? 'Carousel slide 2 of 3, the middle of the Twelve Apostles panorama' : 'Diapositiva 2 de 3 del carrusel, el centro de la panorámica',
          en ? 'Slide 2' : 'Diapositiva 2',
        ),
        still(
          'carousel-3',
          540,
          675,
          en ? 'Carousel slide 3 of 3, the right of the Twelve Apostles panorama' : 'Diapositiva 3 de 3 del carrusel, la derecha de la panorámica',
          en ? 'Slide 3' : 'Diapositiva 3',
        ),
      ],
    },
  ]
}

export function exampleForTool(toolKey: string, lang: Lang): ResultExample | undefined {
  return resultExamples(lang).find((example) => example.toolKey === toolKey)
}
