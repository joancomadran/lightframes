---
key: mac
slug: mac
title: "Alternativa a Lightroom en Mac"
description: "Alternativa gratis a Lightroom en el Mac, también en Safari: Lightframes revela RAW y JPEG en el navegador, importa presets .xmp y no sube las fotos."
h1: "Alternativa gratis a Lightroom en el Mac"
lead: "En un Mac, Lightframes es la opción gratis si quieres RAW, JPEG, presets .xmp y LUTs .cube en el navegador, Safari incluido, con las fotos en el equipo. Usa darktable si quieres una biblioteca RAW instalada, con licencia GPL, en Apple silicon. Usa Lightroom si quieres el catálogo de Adobe y ya tienes, o quieres, la suscripción."
order: 2
updated: 2026-11-10
faq:
  - q: "¿Funciona en Safari en el Mac?"
    a: "Sí. Safari es uno de los navegadores para los que está hecho el editor. No tiene el selector de carpetas de Chromium, así que abres archivos con el diálogo del sistema, varios a la vez si quieres. En Safari, Archivo → Añadir al Dock instala la app; después la edición funciona sin conexión cuando ya se ha cargado."
  - q: "¿Puedo abrir una carpeta entera?"
    a: "Open elige archivos. En Chrome, Edge o Brave, mantén Opción al pulsar Open, o usa Folder en la tira, para el selector de carpetas. En Safari esa API no está, así que te quedas en el diálogo de archivos y puedes seleccionar varias fotos."
  - q: "¿darktable va en un Mac Intel?"
    a: "La página de instalación actual dice que los paquetes de macOS soportan macOS 13.5 o posterior y que no hay versiones oficiales para Mac Intel. Son builds de Apple silicon."
  - q: "¿La interfaz del editor está en español?"
    a: "No. El sitio está en español y en inglés. Los controles del editor están en inglés en todas las plataformas."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado a Adobe.

## Safari y Chrome en macOS

Lightframes es un editor de fotos gratis y open source (MIT) que funciona entero en el navegador. Abre el [editor](/es/editor) en Safari, Chrome, Edge, Brave o Firefox. Los RAW (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW) los decodifica LibRaw en WebAssembly. La vista previa va a mitad de tamaño; la exportación vuelve a revelar el sensor hasta 8192 px en el lado largo.

Importa presets `.xmp` y LUTs `.cube` desde la pestaña Presets. Los perfiles, las correcciones de objetivo y las máscaras de un XMP no se aplican. Pegar por lotes y exportar un ZIP van en la misma sesión. Las fotos no se suben. La sesión se guarda en IndexedDB de ese Mac.

Safari no implementa `showDirectoryPicker` ni `showOpenFilePicker`. El editor lo detecta y usa un input de varios archivos: elegir fotos funciona; elegir un directorio como carpeta, no. Los navegadores Chromium en el Mac sí muestran el selector de carpetas.

En Safari, la pista de instalación es Archivo → Añadir al Dock. Tras esa primera carga con internet, la app en caché puede editar sin conexión, RAW incluido, hasta que necesites un modelo de IA nuevo.

## Apps instaladas, si las necesitas

La [página de instalación](https://www.darktable.org/install/) de darktable publica ahora una imagen de Apple silicon para macOS 13.5 o posterior, y dice que no hay versiones oficiales para Mac Intel. Su [FAQ](https://www.darktable.org/about/faq/) dice que los presets de Lightroom no son compatibles. Más detalle en [Lightframes o darktable](/es/comparar/lightframes-vs-darktable).

Los [requisitos](https://helpx.adobe.com/lightroom-cc/system-requirements.html) de Adobe Lightroom incluyen macOS (el apartado de la versión 10.0 nombra Sequoia 15 o Tahoe 26) y una comprobación de la suscripción. La [FAQ móvil](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) es otra app, en parte gratis. Mira [Lightframes o Lightroom](/es/comparar/lightframes-vs-lightroom).
