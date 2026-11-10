---
key: linux
slug: linux
title: "Alternativa a Lightroom en Linux"
description: "Alternativa gratis a Lightroom en Linux: Lightframes va en el navegador con RAW, presets .xmp y lotes. darktable es la biblioteca de escritorio."
h1: "Alternativa gratis a Lightroom en Linux"
lead: "En Linux, abre Lightframes en Firefox o Chrome si quieres presets .xmp, LUTs .cube y una sesión RAW privada sin instalar un revelador. Instala darktable si quieres una biblioteca nativa, OpenCL y un flujo por módulos. Los requisitos de escritorio que publica Adobe para Lightroom listan Windows y macOS, no una build de Linux."
order: 3
updated: 2026-11-10
faq:
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
