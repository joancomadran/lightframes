---
key: linux
slug: linux
title: "¿Lightroom para Linux? Gratis en el navegador"
description: "Adobe lista Lightroom para Windows y macOS, no para Linux. Lightframes es una alternativa gratis en el navegador: RAW y presets .xmp, sin subir nada."
h1: "Lightroom para Linux"
lead: "No: los requisitos de escritorio que publica Adobe para Lightroom listan Windows y macOS, no Linux. Abre Lightframes en Firefox o Chrome para presets .xmp, LUTs .cube y una sesión RAW en el navegador, sin subir nada. Instala darktable si quieres una biblioteca nativa, OpenCL y un flujo por módulos."
order: 3
updated: 2026-11-24
faq:
  - q: "¿Hay un Lightroom oficial para Linux?"
    a: "No. Los requisitos de escritorio que publica Adobe para Lightroom listan Windows y macOS, no una build de Linux ([requisitos del sistema](https://helpx.adobe.com/lightroom-cc/system-requirements.html))."
  - q: "¿Puedo usar mis presets .xmp de Lightroom en Linux?"
    a: "Sí. En Linux es la misma web: abre Presets e importa un preset de revelado .xmp. Lightframes traslada exposición, contraste, altas luces, sombras, blancos, negros, temperatura y tinte (valores relativos; el Kelvin se aproxima), intensidad, saturación, textura, claridad, eliminar niebla, la curva de tonos (general y canales rojo, verde y azul), HSL, gradación de color o split toning, enfoque, reducción de ruido de luminancia y de color, viñeta posterior al recorte (cantidad y punto medio) y grano (cantidad y tamaño). No entran perfiles de cámara, correcciones de objetivo, calibración ni máscaras. Los .lrtemplate antiguos no se leen. Puedes aplicar el preset a la foto abierta, incluido un RAW en ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF o SRW. Las fotos no se suben. La misma lista de importación está en [presets .xmp sin Lightroom](/es/presets-xmp-sin-lightroom)."
  - q: "¿Lightframes funciona en Linux?"
    a: "Sí, en un navegador actual: Firefox, Chrome, Edge o Brave. Es la misma web. Las fotos se procesan en el equipo con WebAssembly y no se suben."
  - q: "¿Me conviene instalar darktable?"
    a: "Instálalo si quieres catálogo, disparo conectado y el revelado de escritorio. Es GPL, versión 3 o posterior, y su FAQ dice que los presets de Lightroom no son compatibles. La build Flatpak, a septiembre de 2026, no incluye las funciones de IA de darktable."
  - q: "¿Hay Lightroom de escritorio para Linux?"
    a: "Los requisitos de Lightroom listan Windows y macOS para la app de escritorio, no Linux. Lightroom en la web aparece aparte en la página de acceso web y móvil de Adobe (https://helpx.adobe.com/creative-cloud/policy-pricing/cc-app-web-mobile-access.html)."
  - q: "¿Puedo exportar por lotes desde el navegador?"
    a: "Sí. Selecciona fotos, pega ajustes o aplica un preset y exporta un ZIP de JPEG, PNG o WebP. No hay un catálogo a largo plazo en el navegador; la sesión es IndexedDB en ese equipo."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado a Adobe.

## El navegador en Linux

Lightframes es un editor de fotos gratis y open source (MIT) que funciona entero en el navegador. En Linux, abre el [editor](/es/editor) en Firefox o en un navegador Chromium. El RAW lo lleva LibRaw en WebAssembly (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW). La vista previa es a mitad de tamaño y 16 bits; la exportación vuelve a los datos del sensor, con tope de 8192 px en el lado largo.

Chromium puede abrir una carpeta con el selector de directorios. Firefox no ofrece esa API, así que usa el diálogo de varios archivos. En los dos casos los bytes se quedan en el equipo. Importa `.xmp` y `.cube` desde Presets. La interfaz del editor está en inglés.

Las herramientas de IA corren en la página: quitar el fondo y la máscara de sujeto se descargan de este sitio (unos 45 MB y un ampliador de 5 MB), y el borrado de objetos descarga MI-GAN de Hugging Face una vez. La foto no va en esa petición.

## darktable, la app nativa

darktable es la respuesta instalada habitual en Linux. El proyecto dice que debería salir en tu gestor de paquetes, y también publica AppImage y Flatpak ([instalación](https://www.darktable.org/install/)). La [FAQ](https://www.darktable.org/about/faq/) dice que los estilos de otros programas no son compatibles y que las LUTs en varios formatos son el puente. La misma FAQ dice que el Flatpak no incluye sus funciones de IA a septiembre de 2026. Lee [Lightframes o darktable](/es/comparar/lightframes-vs-darktable) antes de elegir uno para un archivo entero.

Los [requisitos de escritorio](https://helpx.adobe.com/lightroom-cc/system-requirements.html) de Adobe Lightroom nombran Windows y macOS. Para lo que incluye el tramo móvil gratis, y lo que sigue de pago, mira [Lightframes o Lightroom](/es/comparar/lightframes-vs-lightroom) y el [resumen](/es/blog/alternativas-gratis-a-lightroom).
