---
key: chromebook
slug: chromebook
title: "Alternativa a Lightroom: Chromebook"
description: "Alternativa gratis a Lightroom en un Chromebook: Lightframes va en Chrome, deja las fotos en el equipo e importa presets .xmp y LUTs .cube. Sin instalar."
h1: "Alternativa gratis a Lightroom en un Chromebook"
lead: "En un Chromebook, usa Lightframes en Chrome si quieres un editor de RAW y JPEG gratis que importa presets .xmp de Lightroom y LUTs .cube, y no sube las fotos. No hace falta una app de Linux ni un plan de Creative Cloud. La FAQ móvil de Adobe sigue tratando el RAW en un Chromebook como función de Creative Cloud, no del tramo gratis de Lightroom."
order: 1
updated: 2026-11-10
faq:
  - q: "¿Hay que instalar Lightframes en un Chromebook?"
    a: "No. Ábrelo en Chrome. Chrome también puede instalarlo como PWA con el botón Install app; después, la edición funciona sin conexión cuando la app ya se ha cargado."
  - q: "¿Puedo abrir una carpeta de RAW?"
    a: "En Chrome, Folder usa el selector de carpetas del navegador cuando esa API existe, y en Chromium existe. Los archivos se leen en el equipo. No se suben."
  - q: "¿Me basta la app gratis de Lightroom en el Chromebook para RAW?"
    a: "La FAQ móvil de Adobe dice que captura, organización, compartir y la mayoría de herramientas de edición son gratis. El revelado RAW en un Chromebook lo describe para miembros de Creative Cloud, y el RAW figura entre las funciones premium."
  - q: "¿Un preset .xmp queda igual que en Lightroom?"
    a: "A menudo se acerca en tono y color. Los perfiles de cámara, las correcciones de objetivo y las máscaras locales del XMP no se importan, así que es normal que haya diferencias."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado a Adobe.

## Qué funciona en Chrome en un Chromebook

Lightframes es un editor de fotos gratis y open source (MIT) que funciona entero en el navegador. En un Chromebook eso es [Chrome](/es/editor): abres JPEG, PNG o RAW, editas y exportas JPEG, PNG o WebP. Las fotos se decodifican con LibRaw compilado a WebAssembly y se revelan en Web Workers. No se envían a un servidor.

Las extensiones RAW que acepta el editor son `.arw`, `.cr2`, `.cr3`, `.nef`, `.nrw`, `.dng`, `.raf`, `.orf`, `.rw2`, `.pef` y `.srw`. La vista previa es un revelado a mitad de tamaño y 16 bits. La exportación vuelve a revelar el sensor, hasta 8192 px en el lado largo, y si LibRaw no puede, usa el JPEG que trae la cámara.

Presets → Import lee un `.xmp` de Lightroom o Camera Raw, un preset JSON de Lightframes o un LUT `.cube`, con intensidad de 0 a 100 %. Puedes copiar y pegar ajustes en la tira y exportar una selección en ZIP. La interfaz del editor está en inglés.

Chrome en ChromeOS es un navegador Chromium, así que Open puede usar el selector de archivos y Folder el de carpetas. Los dos leen archivos locales. No hay un paquete aparte de Lightframes en Play Store ni en Linux.

## Lo que esto no es

darktable publica builds para Linux, macOS, Windows y BSD ([instalación](https://www.darktable.org/install/), [funciones](https://www.darktable.org/about/features/)). No es una app de navegador, y esa página de instalación no trae un paquete para ChromeOS. Si necesitas su biblioteca y sus módulos, eso es una instalación de escritorio, en [Lightframes o darktable](/es/comparar/lightframes-vs-darktable).

La [FAQ móvil](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) de Adobe dice que un miembro de Creative Cloud puede importar y revelar RAW en Lightroom para móvil en un Chromebook, y lista el RAW, los lotes y la sincronización en la nube como premium. El tramo gratis es captura, organización, compartir y la mayoría de ediciones básicas. El reparto más amplio está en [Lightframes o Lightroom](/es/comparar/lightframes-vs-lightroom), y el [resumen](/es/blog/alternativas-gratis-a-lightroom) si todavía estás eligiendo herramienta.
