import type { Lang } from './i18n'

/**
 * Home page copy. The H1 and lead carry the main query ("free online photo editor" /
 * "editor de fotos online gratis"); the sections answer the questions people ask before trying it.
 */

export const landing = {
  en: {
    title: 'Lightframes — Use your Lightroom presets, without Lightroom',
    description:
      'Apply your presets, Lightroom XMP and .cube LUTs in batch, then export an Instagram-ready carousel. Free, in your browser, nothing uploaded.',
    h1: 'Use your Lightroom presets, without Lightroom',
    lead: 'Apply your own presets, Lightroom XMP files and .cube LUTs across a whole shoot, then export an Instagram-ready carousel. It all runs in the browser. Nothing is uploaded.',
    secondary: 'How it works',
    facts: ['Free and open source', 'Presets, XMP and LUTs', 'Nothing uploaded'],
    video: {
      label: 'Lightframes in action: editing, presets, batch export, AI tools and collages',
      caption: 'A 50-second tour of the editor. Every look on screen is a real export from Lightframes.',
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
        { h3: 'Offline', p: 'Install it as an app. Editing keeps working without a connection after it has loaded. The first object removal also downloads a model.' },
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
    title: 'Lightframes — Usa tus presets de Lightroom, sin Lightroom',
    description:
      'Aplica tus presets, XMP de Lightroom y LUTs .cube por lotes y exporta un carrusel listo para Instagram. Gratis, en el navegador, sin subir nada.',
    h1: 'Usa tus presets de Lightroom, sin Lightroom',
    lead: 'Aplica tus presets, archivos XMP de Lightroom y LUTs .cube a toda una sesión y exporta un carrusel listo para Instagram. Todo ocurre en el navegador. No se sube nada.',
    secondary: 'Cómo funciona',
    facts: ['Gratis y de código abierto', 'Presets, XMP y LUTs', 'Sin subir nada'],
    video: {
      label: 'Lightframes en acción: edición, presets, exportación por lotes, herramientas de IA y collages',
      caption: 'Un recorrido de 50 segundos por el editor. Cada look que aparece es una exportación real de Lightframes.',
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
        { h3: 'Sin conexión', p: 'Instálalo como app. La edición sigue funcionando sin internet después de cargarla. El primer borrado de objetos también descarga un modelo.' },
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
