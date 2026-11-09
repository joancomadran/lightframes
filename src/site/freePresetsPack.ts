import type { Lang } from './i18n'
import { FREE_PACK_LOOKS, FREE_PACK_LICENSE } from '../lib/freePackPresets'

export const freePresetsPackPath = {
  en: '/free-presets-luts',
  es: '/es/presets-luts-gratis',
} as const satisfies Record<Lang, string>

export const freePresetsPackAlternates = {
  en: freePresetsPackPath.en,
  es: freePresetsPackPath.es,
}

export const freePresetsPackUpdated = new Date('2026-11-05')

const zipUrl = '/downloads/lightframes-free-presets-luts.zip'

function lookFiles(id: string) {
  const base = `/downloads/free-presets-pack/${id}/${id}`
  return { xmp: `${base}.xmp`, cube: `${base}.cube`, preview: `/site/looks/free-pack/${id}.jpg` }
}

export const freePresetsPack = {
  en: {
    title: 'Free Presets & LUTs Pack — CC0, No Upload',
    description:
      'Download eight original photo looks as Lightroom-compatible .xmp presets and .cube 3D LUTs. Free, CC0, and try them in Lightframes in your browser with no uploads.',
    h1: 'Free presets & LUTs pack',
    lead:
      'Yes — you can download eight original creative looks for free, each as a Lightroom-compatible .xmp preset and a .cube 3D LUT. They were built for Lightframes, released under CC0, and you can apply them in the browser without uploading your photos.',
    license: `License: ${FREE_PACK_LICENSE}. Use, remix and share without attribution.`,
    zipLabel: 'Download the full pack (ZIP)',
    zipUrl,
    sampleBefore: '/samples/pagoda.jpg',
    sampleBeforeAlt: 'Sample photo before any preset',
    tryLabel: 'Try it in Lightframes',
    downloadXmp: 'Download .xmp',
    downloadCube: 'Download .cube',
    looks: FREE_PACK_LOOKS.map((look) => ({
      id: look.id,
      name: look.name,
      description: look.description,
      ...lookFiles(look.id),
      editorUrl: `/editor?look=${look.id}`,
    })),
    howTitle: 'How to use the files',
    how: [
      {
        name: 'In Lightframes (no upload)',
        text: 'Click “Try it in Lightframes” for a look, open your own photo, and the preset is applied on your device. You can also import the .xmp or .cube from Presets → Import.',
      },
      {
        name: 'In Lightroom or Camera Raw (compatibility)',
        text: 'Import the .xmp develop preset into Lightroom Classic, Lightroom, or Camera Raw as an alternative workflow. Camera profiles and local edits in other presets are not included in these files.',
      },
      {
        name: 'In other apps with LUT support',
        text: 'Load the .cube file in any editor that reads 3D LUTs. Size is 33×33×33.',
      },
    ],
    faq: [
      {
        q: 'Are these presets copied from Lightroom or Etsy packs?',
        a: 'No. Each look is defined in the Lightframes repository and generated programmatically. The .cube LUTs are built from documented colour transforms; the .xmp files use the same numeric settings.',
      },
      {
        q: 'Do I need Lightroom?',
        a: 'No. Lightframes applies the looks in your browser without uploads. The .xmp files are only for compatibility if you also use Adobe apps.',
      },
      {
        q: 'Are my photos uploaded?',
        a: 'No. Downloads are static files from lightframes.si. Editing happens locally in your browser.',
      },
      {
        q: 'Can I use them commercially?',
        a: `Yes. They are released under ${FREE_PACK_LICENSE}.`,
      },
    ],
    relatedTitle: 'Related',
    related: [
      { label: 'Photo presets in Lightframes', path: '/tools/photo-presets' },
      { label: 'Use .xmp presets without Lightroom', path: '/xmp-presets-without-lightroom' },
      { label: 'Apply .cube LUTs', path: '/tools/apply-lut-to-photo' },
    ],
  },
  es: {
    title: 'Pack gratis de presets y LUTs — CC0, sin subir nada',
    description:
      'Descarga ocho looks originales en presets .xmp compatibles con Lightroom y LUTs .cube. Gratis, CC0, y pruébalos en Lightframes en el navegador sin subir fotos.',
    h1: 'Pack gratis de presets y LUTs',
    lead:
      'Sí: puedes descargar gratis ocho looks creativos originales, cada uno como preset .xmp compatible con Lightroom y LUT .cube 3D. Están hechos para Lightframes, publicados bajo CC0, y puedes aplicarlos en el navegador sin subir tus fotos.',
    license: `Licencia: ${FREE_PACK_LICENSE}. Úsalos, remíxalos y compártelos sin atribución.`,
    zipLabel: 'Descargar el pack completo (ZIP)',
    zipUrl,
    sampleBefore: '/samples/pagoda.jpg',
    sampleBeforeAlt: 'Foto de ejemplo antes del preset',
    tryLabel: 'Probar en Lightframes',
    downloadXmp: 'Descargar .xmp',
    downloadCube: 'Descargar .cube',
    looks: FREE_PACK_LOOKS.map((look) => ({
      id: look.id,
      name: look.nameEs,
      description: look.descriptionEs,
      ...lookFiles(look.id),
      editorUrl: `/es/editor?look=${look.id}`,
    })),
    howTitle: 'Cómo usar los archivos',
    how: [
      {
        name: 'En Lightframes (sin subir nada)',
        text: 'Pulsa «Probar en Lightframes» en un look, abre tu foto y el preset se aplica en tu dispositivo. También puedes importar el .xmp o .cube desde Presets → Importar.',
      },
      {
        name: 'En Lightroom o Camera Raw (compatibilidad)',
        text: 'Importa el preset .xmp en Lightroom Classic, Lightroom o Camera Raw como alternativa. Estos archivos no incluyen perfiles de cámara ni ajustes locales.',
      },
      {
        name: 'En otras apps con LUT',
        text: 'Carga el .cube en cualquier editor que lea LUT 3D. Tamaño 33×33×33.',
      },
    ],
    faq: [
      {
        q: '¿Son presets copiados de Lightroom o de Etsy?',
        a: 'No. Cada look está definido en el repositorio de Lightframes y se genera por programa. Los LUT .cube se construyen a partir de transformaciones de color documentadas; los .xmp usan los mismos valores.',
      },
      {
        q: '¿Necesito Lightroom?',
        a: 'No. Lightframes aplica los looks en el navegador sin subir nada. Los .xmp son solo por compatibilidad si también usas apps de Adobe.',
      },
      {
        q: '¿Se suben mis fotos?',
        a: 'No. Las descargas son archivos estáticos de lightframes.si. La edición es local en tu navegador.',
      },
      {
        q: '¿Puedo usarlos comercialmente?',
        a: `Sí. Están bajo ${FREE_PACK_LICENSE}.`,
      },
    ],
    relatedTitle: 'Relacionado',
    related: [
      { label: 'Presets de fotos', path: '/es/herramientas/presets-fotos' },
      { label: 'Presets XMP sin Lightroom', path: '/es/presets-xmp-sin-lightroom' },
      { label: 'Aplicar LUT .cube', path: '/es/herramientas/aplicar-lut-foto' },
    ],
  },
} satisfies Record<Lang, unknown>

export type FreePresetsPackContent = (typeof freePresetsPack)['en']
