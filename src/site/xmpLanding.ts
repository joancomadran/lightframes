import type { Lang } from './i18n'

/** Canonical paths for the XMP-without-Lightroom landing (hreflang pair). */
export const xmpLandingPath = {
  en: '/xmp-presets-without-lightroom',
  es: '/es/presets-xmp-sin-lightroom',
} as const satisfies Record<Lang, string>

export const xmpLandingAlternates = { en: xmpLandingPath.en, es: xmpLandingPath.es }

type FaqItem = { q: string; a: string }
type Step = { name: string; text: string }
type TableRow = { setting: string; supported: boolean; notes?: string }

export const xmpLandingUpdated = new Date('2026-10-30')

export const xmpLanding = {
  en: {
    title: 'Use XMP Presets Without Lightroom — Free in Your Browser',
    description:
      'Yes, you can use Lightroom and Camera Raw .xmp presets without Lightroom. Lightframes imports them free in the browser, applies them to RAW or JPEG, batch included. No uploads.',
    h1: 'Use .xmp presets without Lightroom',
    /** Answer-first, quotable lead. */
    lead:
      'Yes — you can use Lightroom and Camera Raw .xmp develop presets without Lightroom. Lightframes is a free, open-source photo editor that runs in your browser, imports .xmp files and .cube LUTs, and never uploads your photos.',
    trademark:
      'Lightroom and Camera Raw are trademarks of Adobe. Lightframes is an independent open-source project and is not affiliated with or endorsed by Adobe.',
    stepsTitle: 'How to apply an .xmp preset without Lightroom',
    steps: [
      {
        name: 'Open Lightframes in your browser',
        text: 'Go to the editor and open one or more JPEG, PNG or camera RAW files (or a whole folder). They appear in the filmstrip. Nothing is uploaded — files are read from your disk and processed on your device.',
      },
      {
        name: 'Import your .xmp preset',
        text: 'Open the Presets tab and click Import. Choose a .xmp file from Lightroom Classic, Lightroom, or Adobe Camera Raw. You can also import .cube LUTs or Lightframes JSON presets. The preset name comes from the file when available.',
      },
      {
        name: 'Apply to one photo or a batch',
        text: 'Click the preset to apply it. Use the Intensity slider (0–100%) to blend the look. Select several photos in the filmstrip to apply the same preset and intensity to all of them at once.',
      },
      {
        name: 'Fine-tune and export',
        text: 'Adjust exposure or white balance if needed, then export JPEG, PNG or WebP for one photo or the whole selection (ZIP for batches). Copy/paste edits between photos works too — see the batch photo editor guide.',
      },
    ] as Step[],
    alsoTitle: 'Also supported in the same editor',
    also: [
      { h3: '.cube LUTs', p: 'Import 3D LUTs as presets with the same intensity control — useful for film looks sold as .cube files.' },
      { h3: 'Camera RAW', p: 'Decode RAW files with LibRaw in WebAssembly, apply presets, and export developed JPEGs without desktop software.' },
      { h3: 'Batch workflow', p: 'Copy edits, paste to a selection, apply presets to many photos, and export a ZIP in one go.' },
    ],
    tableTitle: 'Which XMP / Lightroom settings Lightframes imports',
    tableLead:
      'Lightframes maps develop settings from .xmp sidecars and preset files onto its own sliders. This table reflects the actual import code — we do not claim support for settings that are ignored.',
    tableSetting: 'Setting',
    tableSupported: 'Imported from .xmp',
    tableUnsupported: 'Not imported',
    tableNotes: 'Notes',
    supportedRows: [
      { setting: 'Exposure, contrast, highlights, shadows, whites, blacks', supported: true },
      { setting: 'Temperature and tint (relative values; Kelvin approximated)', supported: true },
      { setting: 'Vibrance and saturation', supported: true },
      { setting: 'Texture, clarity, dehaze', supported: true },
      { setting: 'Tone curve (master and red, green, blue channels)', supported: true },
      { setting: 'HSL hue, saturation and luminance (8 colour bands)', supported: true },
      { setting: 'Colour grading wheels (or legacy split toning)', supported: true },
      { setting: 'Sharpening, luminance and colour noise reduction', supported: true },
      { setting: 'Post-crop vignette (amount and midpoint)', supported: true },
      { setting: 'Grain (amount and size)', supported: true },
      { setting: 'Camera profiles (Adobe Color, etc.)', supported: false, notes: 'Ignored — your photo keeps Lightframes’ default rendering' },
      { setting: 'Lens corrections (profile, distortion, CA)', supported: false },
      { setting: 'Calibration / camera-specific colour matrices', supported: false },
      { setting: 'Local adjustments (masks, brushes, gradients)', supported: false },
      { setting: 'Transform, defringe, red-eye and other panels', supported: false },
      { setting: 'Legacy `.lrtemplate` preset format', supported: false, notes: 'Export or convert to .xmp first' },
    ] as TableRow[],
    limitsTitle: 'What to expect',
    limits: [
      'An imported preset usually looks close but not always identical to Lightroom, because profiles, lens fixes and masks in the XMP are skipped.',
      'Presets you bought on Etsy or Gumroad are almost always .xmp — they work here. Mobile-only preset packs tied to Adobe’s cloud need Lightroom or a desktop .xmp export.',
      'The editor interface is in English. The site is available in English and Spanish.',
    ],
    faq: [
      {
        q: 'Is Lightframes free?',
        a: 'Yes. The editor is free and open source under the MIT licence. No account or subscription is required.',
      },
      {
        q: 'Are my photos uploaded when I use .xmp presets?',
        a: 'No. Photos and presets are processed in your browser. Files stay on your device and are not sent to a Lightframes server.',
      },
      {
        q: 'Does it work with DNG files and sidecar XMP?',
        a: 'Yes for editing DNG and other RAW formats supported by LibRaw. Import presets via Presets → Import (.xmp file). Lightframes does not auto-read a separate sidecar next to your RAW; load the .xmp preset manually.',
      },
      {
        q: 'Can I use old `.lrtemplate` Lightroom presets?',
        a: 'No. Only .xmp develop presets are read. Convert or re-export them as .xmp from Lightroom or Camera Raw, or ask the seller for an .xmp version.',
      },
      {
        q: 'Do Lightroom Classic and Lightroom CC presets both work?',
        a: 'Yes, when they are saved as standard Camera Raw .xmp develop presets — the format both apps use for syncable develop presets.',
      },
      {
        q: 'Can I use mobile Lightroom presets without the app?',
        a: 'Only if you have the .xmp file on disk. Presets locked inside Adobe’s mobile/cloud library cannot be imported here without exporting them as .xmp from a desktop Adobe app.',
      },
      {
        q: 'Will the look match Lightroom exactly?',
        a: 'Often very close for tone and colour sliders, but camera profiles, lens corrections and local edits in the XMP are not applied, so differences are normal.',
      },
      {
        q: 'Can I apply a preset to many photos at once?',
        a: 'Yes. Select multiple photos in the filmstrip, apply a preset, set intensity, and export them together — including ZIP batch export.',
      },
    ] as FaqItem[],
    relatedTitle: 'Related guides',
    related: [
      { label: 'Photo presets tool page', path: '/tools/photo-presets' },
      { label: 'Free Lightroom alternatives', path: '/blog/free-lightroom-alternatives' },
      { label: 'Apply .cube LUTs', path: '/tools/apply-lut-to-photo' },
      { label: 'Batch photo editor', path: '/tools/batch-photo-editor' },
    ],
  },
  es: {
    title: 'Usar presets XMP sin Lightroom — gratis en el navegador',
    description:
      'Sí, puedes usar presets .xmp de Lightroom y Camera Raw sin Lightroom. Lightframes los importa gratis en el navegador, en RAW o JPEG y por lotes. Sin subir nada.',
    h1: 'Usar presets .xmp sin Lightroom',
    lead:
      'Sí: puedes usar presets de revelado .xmp de Lightroom y Camera Raw sin instalar Lightroom. Lightframes es un editor de fotos gratis y open source que funciona en el navegador, importa archivos .xmp y LUTs .cube, y no sube tus fotos.',
    trademark:
      'Lightroom y Camera Raw son marcas de Adobe. Lightframes es un proyecto open source independiente y no está afiliado ni respaldado por Adobe.',
    stepsTitle: 'Cómo aplicar un preset .xmp sin Lightroom',
    steps: [
      {
        name: 'Abre Lightframes en el navegador',
        text: 'Entra en el editor y abre uno o varios archivos JPEG, PNG o RAW (o una carpeta entera). Aparecen en la tira de fotos. No se sube nada: el navegador lee tus archivos del disco y los procesa en tu dispositivo.',
      },
      {
        name: 'Importa tu preset .xmp',
        text: 'Ve a la pestaña Presets y pulsa Importar. Elige un archivo .xmp de Lightroom Classic, Lightroom o Camera Raw. También puedes importar LUTs .cube o presets JSON de Lightframes. El nombre sale del archivo cuando viene en el XMP.',
      },
      {
        name: 'Aplica a una foto o a un lote',
        text: 'Pulsa el preset para aplicarlo. Usa el control Intensidad (0–100 %) para mezclar el look. Selecciona varias fotos en la tira para aplicar el mismo preset e intensidad a todas a la vez.',
      },
      {
        name: 'Retoca y exporta',
        text: 'Ajusta exposición o balance de blancos si hace falta y exporta JPEG, PNG o WebP, una foto o toda la selección (ZIP en lotes). También puedes copiar y pegar ajustes entre fotos — mira la guía del editor por lotes.',
      },
    ] as Step[],
    alsoTitle: 'También en el mismo editor',
    also: [
      { h3: 'LUTs .cube', p: 'Importa LUT 3D como presets con la misma intensidad — útil para looks de película vendidos en .cube.' },
      { h3: 'RAW de cámara', p: 'Revela RAW con LibRaw en WebAssembly, aplica presets y exporta JPEG sin instalar un programa de escritorio.' },
      { h3: 'Trabajo por lotes', p: 'Copia ajustes, pega en una selección, aplica presets a muchas fotos y exporta un ZIP de una vez.' },
    ],
    tableTitle: 'Qué ajustes XMP / Lightroom importa Lightframes',
    tableLead:
      'Lightframes traduce los ajustes de revelado del .xmp a sus propios controles. Esta tabla refleja el código real de importación: no afirmamos soporte donde el valor se ignora.',
    tableSetting: 'Ajuste',
    tableSupported: 'Se importa del .xmp',
    tableUnsupported: 'No se importa',
    tableNotes: 'Notas',
    supportedRows: [
      { setting: 'Exposición, contraste, luces, sombras, blancos y negros', supported: true },
      { setting: 'Temperatura y tinte (relativos; Kelvin aproximado)', supported: true },
      { setting: 'Intensidad vibrante y saturación', supported: true },
      { setting: 'Textura, claridad y eliminar niebla', supported: true },
      { setting: 'Curva de tonos (general y canales rojo, verde, azul)', supported: true },
      { setting: 'TSL matiz, saturación y luminosidad (8 bandas)', supported: true },
      { setting: 'Gradación de color (o split toning antiguo)', supported: true },
      { setting: 'Enfoque, reducción de ruido luminancia y color', supported: true },
      { setting: 'Viñeta postrecorte (cantidad y punto medio)', supported: true },
      { setting: 'Grano (cantidad y tamaño)', supported: true },
      { setting: 'Perfiles de cámara (Adobe Color, etc.)', supported: false, notes: 'Se ignoran — la foto usa el renderizado por defecto de Lightframes' },
      { setting: 'Corrección de objetivo (perfil, distorsión, CA)', supported: false },
      { setting: 'Calibración / matrices de color de cámara', supported: false },
      { setting: 'Ajustes locales (máscaras, pinceles, degradados)', supported: false },
      { setting: 'Transformar, defringe, ojos rojos y otros paneles', supported: false },
      { setting: 'Presets antiguos `.lrtemplate`', supported: false, notes: 'Exporta o convierte a .xmp antes' },
    ] as TableRow[],
    limitsTitle: 'Qué puedes esperar',
    limits: [
      'Un preset importado suele parecerse mucho a Lightroom, pero no siempre idéntico, porque perfiles, correcciones de objetivo y máscaras del XMP no se aplican.',
      'Los presets comprados en Etsy o Gumroad casi siempre son .xmp — funcionan aquí. Los packs solo móvil ligados a la nube de Adobe necesitan Lightroom o una exportación .xmp de escritorio.',
      'La interfaz del editor está en inglés. El sitio web está en inglés y español.',
    ],
    faq: [
      {
        q: '¿Lightframes es gratis?',
        a: 'Sí. El editor es gratis y open source con licencia MIT. No hace falta cuenta ni suscripción.',
      },
      {
        q: '¿Se suben mis fotos al usar presets .xmp?',
        a: 'No. Fotos y presets se procesan en el navegador. Los archivos permanecen en tu dispositivo; no van a un servidor de Lightframes.',
      },
      {
        q: '¿Funciona con DNG y XMP sidecar?',
        a: 'Sí para editar DNG y otros RAW que LibRaw admita. Importa presets con Presets → Importar (archivo .xmp). Lightframes no lee automáticamente un sidecar junto al RAW; carga el .xmp a mano.',
      },
      {
        q: '¿Puedo usar presets `.lrtemplate` antiguos?',
        a: 'No. Solo se leen presets de revelado .xmp. Conviértelos o expórtalos como .xmp desde Lightroom o Camera Raw, o pide al vendedor la versión .xmp.',
      },
      {
        q: '¿Valen presets de Lightroom Classic y de Lightroom CC?',
        a: 'Sí, cuando están guardados como presets de revelado .xmp estándar de Camera Raw — el formato que usan ambas apps para presets sincronizables.',
      },
      {
        q: '¿Puedo usar presets móvil de Lightroom sin la app?',
        a: 'Solo si tienes el archivo .xmp en disco. Los presets encerrados en la biblioteca móvil/nube de Adobe no se importan aquí sin exportarlos como .xmp desde una app de escritorio de Adobe.',
      },
      {
        q: '¿El resultado será idéntico a Lightroom?',
        a: 'A menudo muy parecido en tono y color, pero perfiles de cámara, correcciones de objetivo y ediciones locales del XMP no se aplican, así que puede haber diferencias.',
      },
      {
        q: '¿Puedo aplicar un preset a muchas fotos a la vez?',
        a: 'Sí. Selecciona varias fotos en la tira, aplica un preset, ajusta la intensidad y expórtalas juntas, también en ZIP por lotes.',
      },
    ] as FaqItem[],
    relatedTitle: 'Guías relacionadas',
    related: [
      { label: 'Presets de fotos', path: '/es/herramientas/presets-fotos' },
      { label: 'Alternativas gratis a Lightroom', path: '/es/blog/alternativas-gratis-a-lightroom' },
      { label: 'Aplicar LUT .cube', path: '/es/herramientas/aplicar-lut-foto' },
      { label: 'Editor por lotes', path: '/es/herramientas/editar-fotos-por-lotes' },
    ],
  },
} satisfies Record<Lang, unknown>
