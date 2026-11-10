---
key: ipad
slug: ipad
title: "Alternativa a Lightroom en el iPad"
description: "Alternativa gratis a Lightroom en el iPad con Safari: abre fotos en el navegador, edita en el equipo e importa .xmp. Hay límites de carpeta y de RAW grandes."
h1: "Alternativa gratis a Lightroom en el iPad"
lead: "Lightframes funciona en Safari del iPad con JPEG, PNG y RAW: eliges archivos con el diálogo del sistema, la edición corre en el iPad y las fotos no se suben. Encaja como opción gratis para presets y archivos moderados. Encaja mal para una carpeta de RAW grandes o para IA pesada, porque Safari no tiene selector de carpetas y un revelado a resolución completa puede quedarse sin memoria. Lightroom de Adobe para iPad es la app si quieres su biblioteca en la nube y tienes la suscripción."
order: 4
updated: 2026-11-10
faq:
  - q: "¿El editor funciona de verdad en Safari del iPad?"
    a: "Sí. Es el mismo editor que en el escritorio. Safari del iPad se detecta para instalarlo (Compartir → Añadir a pantalla de inicio), el toque está tratado a propósito y el RAW pasa por LibRaw en WebAssembly. No hay una app distinta para iPad."
  - q: "¿Puedo abrir una carpeta desde Archivos?"
    a: "No como directorio. Safari no ofrece el selector de carpetas, así que el editor usa un input de varios archivos. Elige las fotos que quieras. No puedes señalarle una tarjeta entera como hace Chrome en un ordenador."
  - q: "¿Un RAW grande se exporta en el iPad?"
    a: "No siempre. La vista previa decodifica a mitad de tamaño. La exportación decodifica el sensor a resolución completa en RGB de 16 bits y luego limita el lado largo a 8192 px. Si la pestaña se queda sin memoria, la exportación falla. JPEG y RAW más pequeños son el camino fiable."
  - q: "¿La IA funciona en el iPad?"
    a: "Son los mismos modelos en el dispositivo: una máscara de sujeto de unos 45 MB, un ampliador de unos 5 MB y el borrado de objetos desde Hugging Face la primera vez. Necesitan memoria y la descarga. Si la pestaña ya tiene un RAW grande, pueden fallar."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado a Adobe.

## Qué puede hacer Safari en el iPad

Lightframes es un editor de fotos gratis y open source (MIT) que funciona entero en el navegador. En un iPad, abre el [editor](/es/editor) en Safari. La página trata iPadOS como iOS aunque el navegador se anuncie como Mac: la pista de instalación es Compartir y luego Añadir a pantalla de inicio, y hay un listener de toque para que los arrastres sobre la foto lleguen. El pellizco para ampliar la vista previa está implementado.

Abrir fotos no usa la File System Access API, que Safari no trae. La alternativa es un input de archivo normal que acepta varios JPEG, PNG o RAW (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW). Basta para editar una selección. No es una importación de carpeta.

El RAW lo decodifica LibRaw compilado a WebAssembly, en el dispositivo. La vista previa va a mitad de tamaño, que es el camino pensado para editar. La exportación pide el revelado a resolución completa y puede caer al JPEG incrustado si LibRaw falla. La app clasifica los errores de memoria; no finge que un iPad tiene la RAM de un escritorio. Si una exportación muere, mejor JPEG, o un RAW cada vez.

Los presets `.xmp` y los LUTs `.cube` se importan igual que en un ordenador. Los controles del editor están en inglés. Cuando la app se ha cargado una vez con internet, la edición funciona sin conexión hasta que un modelo de IA necesite su primera descarga.

## Cuándo conviene la app de Adobe en el iPad

La [FAQ móvil](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) de Adobe dice que la app gratis de Lightroom cubre captura, organización, compartir y la mayoría de ediciones básicas, y que el RAW, las máscaras, el corrector y los lotes son premium. La misma página dice que un miembro de Creative Cloud puede importar y revelar RAW en un iPad. Esa app también copia las fotos a Creative Cloud. Lightframes no. Si el catálogo tiene que sincronizarse, usa Lightroom y lee [Lightframes o Lightroom](/es/comparar/lightframes-vs-lightroom).

Para un navegador de portátil sin estos límites de memoria, empieza por [Chromebook](/es/para/chromebook), [Mac](/es/para/mac) o [Linux](/es/para/linux), o por el [resumen](/es/blog/alternativas-gratis-a-lightroom).
