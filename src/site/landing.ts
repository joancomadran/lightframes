import type { Lang } from './i18n'

/**
 * Home page copy. The H1 and lead carry the main query ("free online photo editor" /
 * "editor de fotos online gratis"); the sections answer the questions people ask before trying it.
 */

/** Before/after looks: real exports of /samples/twelve-apostles.jpg with the built-in presets. */
export const LOOKS = [
  { id: 'warm-film', name: 'Warm Film' },
  { id: 'nordic', name: 'Nordic' },
  { id: 'teal-orange', name: 'Teal & Orange' },
  { id: 'moody-forest', name: 'Moody Forest' },
  { id: 'b-w-noir', name: 'B&W Noir' },
] as const

export const landing = {
  en: {
    title: 'Lightframes — Free online photo editor, nothing uploaded',
    description:
      'Edit RAW and JPEG photos in your browser for free. Presets, copy/paste edits, batch export and on-device AI. No upload, no account, open source.',
    h1: 'A free photo editor that keeps your photos on your device',
    lead: 'Edit RAW and JPEG files, save your own presets and paste one edit across a whole shoot. Everything runs in your browser, so nothing is uploaded and there is no account to make.',
    secondary: 'How it works',
    facts: ['Free and open source', 'RAW from most cameras', 'Works offline'],
    compare: {
      before: 'Before',
      after: 'After',
      slider: 'Drag to compare before and after',
      looks: 'Built-in presets',
      caption: 'Sample photo, exported from Lightframes with each built-in preset.',
    },
    privacy: {
      h2: 'Your photos never leave your device',
      body: [
        'When you open a photo, the browser reads it from your disk. The editing, RAW decoding and AI tools run on your own computer or phone through WebAssembly and Web Workers, and the result is saved straight back to your disk.',
        'There is no server that receives your photos, so there is nothing to upload, wait for or delete afterwards. Your edits and presets are stored in your browser, and the session comes back after a refresh.',
      ],
      points: [
        { h3: 'No upload', p: 'Files are processed locally, in the tab.' },
        { h3: 'No account', p: 'Open the editor and start. Nothing to sign up for.' },
        { h3: 'Offline', p: 'Install it as an app; it keeps working without a connection.' },
      ],
    },
    tools: {
      h2: 'Everything is in one editor',
      lead: 'Each of these is a part of the same app, not a separate upload tool.',
      all: 'All tools',
    },
    how: {
      h2: 'How it works',
      steps: [
        {
          h3: 'Open your photos',
          p: 'Open JPEG, PNG or camera RAW files, or a whole folder. They appear in the filmstrip.',
        },
        {
          h3: 'Edit one, paste to the rest',
          p: 'Adjust light, colour, curves and crop, or apply a preset. Copy the edit and paste it onto every photo from the same shoot.',
        },
        {
          h3: 'Export in one go',
          p: 'Save JPEG, PNG or WebP with your quality, size and file-name pattern, for one photo or the whole selection.',
        },
      ],
      shotAlt: 'The Lightframes editor with a RAW photo open, the filmstrip and the presets panel',
    },
    faq: { h2: 'Questions', all: 'All questions' },
    blog: { h2: 'Guides', all: 'All guides' },
    end: {
      h2: 'Open the editor and try it on your own photos',
      p: 'It loads in the browser in a few seconds. The code is open source on GitHub.',
      github: 'View the source',
    },
  },
  es: {
    title: 'Lightframes — Editor de fotos online gratis y sin subir nada',
    description:
      'Edita fotos RAW y JPEG gratis en el navegador. Presets, copiar y pegar ajustes, exportación por lotes e IA en tu dispositivo. Sin subir fotos ni crear cuenta.',
    h1: 'Un editor de fotos gratis que no saca tus fotos de tu dispositivo',
    lead: 'Edita archivos RAW y JPEG, guarda tus propios presets y pega un mismo ajuste en toda una sesión. Todo funciona en tu navegador: no se sube nada y no hace falta cuenta.',
    secondary: 'Cómo funciona',
    facts: ['Gratis y de código abierto', 'RAW de casi cualquier cámara', 'Funciona sin conexión'],
    compare: {
      before: 'Antes',
      after: 'Después',
      slider: 'Arrastra para comparar el antes y el después',
      looks: 'Presets incluidos',
      caption: 'Foto de ejemplo exportada desde Lightframes con cada preset incluido.',
    },
    privacy: {
      h2: 'Tus fotos no salen de tu dispositivo',
      body: [
        'Cuando abres una foto, el navegador la lee de tu disco. La edición, el revelado RAW y las herramientas de IA se ejecutan en tu ordenador o tu móvil con WebAssembly y Web Workers, y el resultado se guarda directamente en tu disco.',
        'No hay ningún servidor que reciba tus fotos, así que no hay nada que subir, esperar ni borrar después. Tus ajustes y presets se guardan en el navegador y la sesión se recupera al recargar.',
      ],
      points: [
        { h3: 'Sin subir nada', p: 'Los archivos se procesan en local, en la pestaña.' },
        { h3: 'Sin cuenta', p: 'Abre el editor y empieza. No hay registro.' },
        { h3: 'Sin conexión', p: 'Instálalo como app y sigue funcionando sin internet.' },
      ],
    },
    tools: {
      h2: 'Todo en un mismo editor',
      lead: 'Cada una forma parte de la misma app; no son herramientas sueltas a las que subir fotos.',
      all: 'Todas las herramientas',
    },
    how: {
      h2: 'Cómo funciona',
      steps: [
        {
          h3: 'Abre tus fotos',
          p: 'Abre archivos JPEG, PNG o RAW, o una carpeta entera. Aparecen en la tira de fotos.',
        },
        {
          h3: 'Edita una y pégala en las demás',
          p: 'Ajusta luz, color, curvas y recorte, o aplica un preset. Copia la edición y pégala en todas las fotos de la misma sesión.',
        },
        {
          h3: 'Exporta de una vez',
          p: 'Guarda en JPEG, PNG o WebP con la calidad, el tamaño y el nombre de archivo que quieras, una foto o toda la selección.',
        },
      ],
      shotAlt: 'El editor Lightframes con una foto RAW abierta, la tira de fotos y el panel de presets',
    },
    faq: { h2: 'Preguntas', all: 'Todas las preguntas' },
    blog: { h2: 'Guías', all: 'Todas las guías' },
    end: {
      h2: 'Abre el editor y pruébalo con tus fotos',
      p: 'Carga en el navegador en unos segundos. El código es abierto y está en GitHub.',
      github: 'Ver el código',
    },
  },
} satisfies Record<Lang, unknown>
