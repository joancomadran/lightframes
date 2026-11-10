---
key: lightframes-vs-photopea
slug: lightframes-vs-photopea
title: "Lightframes frente a Photopea"
description: "Lightframes o Photopea en el navegador: RAW y presets .xmp sin subir fotos, o capas y PSD. Precio, RAW, IA y privacidad, con fuentes oficiales."
h1: "Lightframes o Photopea"
lead: "Lightframes encaja si el trabajo es RAW de cámara, presets .xmp de Lightroom, LUTs .cube y un lote de fotos que no sale del navegador. Photopea encaja si el trabajo son capas, máscaras y archivos PSD en el navegador. Los dos procesan en local. Photopea se parece más a un archivo tipo Photoshop; Lightframes, a una sesión de presets sobre RAW."
order: 2
updated: 2026-11-10
faq:
  - q: "¿Photopea sube mis fotos?"
    a: "Su política de privacidad dice que los archivos que abres no se envían a ningún sitio y se procesan en tu dispositivo. Si conectas Dropbox, Google Drive o OneDrive, el archivo solo viaja entre tu equipo y esa nube, por HTTPS."
  - q: "¿Photopea aplica mis presets .xmp de Lightroom?"
    a: "No como flujo de presets. En el issue 5658 de GitHub el desarrollador escribió que la interfaz RAW de Photopea no cubre todas las opciones de Adobe Camera Raw y descartaría la mayor parte de un XMP."
  - q: "¿Photopea es gratis?"
    a: "El editor se puede usar gratis, incluso para vender el trabajo. Premium es un pago único opcional por un número de días (en las condiciones ponen 90 días como ejemplo) y después la cuenta vuelve a ser gratis. Los precios están en la ventana Account; aquí no los repetimos."
  - q: "¿Cuál importa un LUT .cube?"
    a: "Lightframes importa un .cube como preset, con intensidad. La portada y el tutorial RAW de Photopea no describen esa importación, así que esta página no la afirma."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado ni a Adobe ni a Photopea.

## Comparación

| | **Lightframes** | **Photopea** |
| --- | --- | --- |
| **Precio** | Gratis. Sin cuenta. | Uso gratis ([condiciones](https://www.photopea.com/privacy.html)). Premium es un pago único opcional por unos días y luego la cuenta vuelve a ser gratis. Los precios están en la ventana Account ([cuentas](https://www.photopea.com/api/accounts)). En esa página, el paquete autoalojado figura a 500–2.000 $ al mes. |
| **Licencia** | [MIT](https://github.com/joancomadran/lightframes), código en GitHub. | Propietaria. Las condiciones permiten usar el editor gratis; no conceden una licencia open source. |
| **Dónde funciona** | Chrome, Edge, Brave, Firefox y Safari actuales. PWA instalable. La interfaz del editor está en inglés. | En el navegador, «en cualquier dispositivo» ([portada](https://www.photopea.com/)). Sin instalación. |
| **RAW** | LibRaw en WebAssembly: ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF y SRW. Vista previa a mitad de tamaño desde el sensor; exportación hasta 8192 px en el lado largo, con el JPEG incrustado si LibRaw no puede. | La portada lista DNG, CR2, CR3, NEF, ARW, RW2, RAF, ORF y FFF, con exposición, balance de color, contraste, altas luces y sombras. El [tutorial RAW](https://www.photopea.com/tuts/open-raw-photos-online/) añade el balance de blancos y luego abrir en el editor o sacar un JPG. |
| **Presets .xmp de Lightroom** | Se importan. Se mapean sliders, curvas, HSL, gradación, grano y enfoque. No se mapean perfiles, objetivos ni máscaras. | No es un flujo de presets. El desarrollador dijo que la interfaz RAW no cubre todas las opciones de Camera Raw y descartaría la mayor parte de un XMP ([issue #5658](https://github.com/photopea/photopea/issues/5658)). |
| **LUTs .cube** | Se importan como preset, con intensidad. | No aparecen en la portada ni en el tutorial RAW. |
| **IA** | En el dispositivo: quitar fondo, máscara de sujeto, borrar objetos (MI-GAN desde Hugging Face la primera vez) y ampliar al exportar. La foto se queda en el equipo. | La portada anuncia quitar el fondo en un clic y sustituir una parte de la imagen a partir de un texto, y también dice que el proceso es local. |
| **Privacidad / subidas** | Las fotos no se suben. IndexedDB guarda la sesión. Las visitas usan Vercel Web Analytics sin cookies. | «Los archivos que abres en Photopea no se envían a ningún sitio» ([privacidad](https://www.photopea.com/privacy.html)). Si inicias sesión, el servidor guarda nombre, correo y preferencias. La nube opcional es tu Dropbox, Drive u OneDrive. |
| **Lotes** | Presets y ajustes pegados sobre una selección, exportación en ZIP. Solo sesión, sin catálogo. | Abre los archivos que eliges. La portada describe capas, máscaras, objetos inteligentes y abrir/guardar PSD, no una biblioteca ni una cola de exportación. |

## Cuándo conviene Photopea

Photopea conviene cuando el archivo ya es un PSD, o cuando necesitas capas, máscaras, estilos, trazados y vectores en el navegador. La [portada](https://www.photopea.com/) dice que el PSD es su formato principal, al abrir y al guardar, y lista muchos formatos de diseño (PNG, JPG, SVG, PDF, AI, TIFF y otros). Eso es otro trabajo que aplicar un preset de revelado a una sesión.

El diálogo RAW es un paso previo a la pila de capas, no un catálogo. Si solo quieres exposición y balance de blancos y luego un montaje, Photopea encaja. Si el look vive en un `.xmp` que has comprado, no.

## Cuándo conviene Lightframes

Lightframes conviene cuando quieres los mismos ajustes en muchos RAW o JPEG: importa el `.xmp` o el `.cube`, pon la intensidad, pégalo en la tira y exporta un ZIP desde el [editor](/es/editor). El collage y el carrusel salen de la misma sesión. En ese recorrido la foto no se sube.

A cambio no hay capas, ni PSD, ni la lista de formatos de diseño que publica Photopea. Para una biblioteca RAW de escritorio, mira [Lightframes o darktable](/es/comparar/lightframes-vs-darktable). El repaso más amplio está en [alternativas gratis a Lightroom](/es/blog/alternativas-gratis-a-lightroom).
