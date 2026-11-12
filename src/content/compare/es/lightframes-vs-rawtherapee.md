---
key: lightframes-vs-rawtherapee
slug: lightframes-vs-rawtherapee
title: "Lightframes frente a RawTherapee"
description: "Lightframes o RawTherapee: presets .xmp y LUTs .cube en el navegador sin subir fotos, o un revelador RAW de escritorio con cola. RAW, lotes y privacidad."
h1: "Lightframes o RawTherapee"
lead: "Lightframes encaja si quieres un editor gratis en el navegador que importa presets .xmp de Lightroom y LUTs .cube, y no sube las fotos. RawTherapee encaja si quieres un revelador RAW de escritorio, también gratis, que se instala: flujo en coma flotante de 32 bits, explorador de archivos y cola de procesado. No se sustituyen. RawTherapee guarda el revelado en perfiles .pp3, y escribir ese perfil en un sidecar XMP sigue siendo una petición abierta, no el flujo actual."
order: 4
updated: 2026-11-12
faq:
  - q: "¿RawTherapee abre presets .xmp de Lightroom?"
    a: "No como preset de revelado. Guarda sus perfiles en sidecars .pp3. El issue 7315 de GitHub pide poder volcar ese perfil a un XMP y sigue abierto. La versión 5.13 puede mostrar etiquetas de color leídas del XMP incrustado, que es metadato, no la receta de Lightroom."
  - q: "¿RawTherapee es gratis?"
    a: "Sí. La portada del proyecto dice que es software libre bajo la GPLv3, para Linux, macOS y Windows, y ahí no describe un plan de pago."
  - q: "¿Lightframes sube las fotos?"
    a: "No. Las decodifica y las revela en el navegador con WebAssembly y Web Workers. No se envían a un servidor de Lightframes. RawTherapee también las deja en el disco porque es una aplicación instalada."
  - q: "¿Cuál uso si quiero una biblioteca RAW que se quede?"
    a: "Instala RawTherapee si quieres explorador, cola y un revelado a fondo en tu máquina. Abre Lightframes en el navegador si el trabajo es aplicar presets .xmp o LUTs .cube sin instalar nada."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado a Adobe ni a RawTherapee.

## Comparación

| | **Lightframes** | **RawTherapee** |
| --- | --- | --- |
| **Precio** | Gratis. Sin cuenta y sin plan de pago. | Gratis. La [portada](https://rawtherapee.com/) dice que se puede usar sin coste bajo la GPLv3. |
| **Licencia** | [MIT](https://github.com/joancomadran/lightframes) | GPLv3, en la [portada](https://rawtherapee.com/). |
| **Dónde funciona** | Chrome, Edge, Brave, Firefox y Safari actuales, Chromebook incluido. Se puede instalar como PWA. La interfaz del editor está en inglés. | Linux, macOS y Windows ([portada](https://rawtherapee.com/)). La versión [5.13](https://rawtherapee.com/downloads/5.13/) (26 de julio de 2026) trae builds de Windows y Linux para x86_64 y ARM64. En macOS pide Tahoe 26 o posterior en Apple silicon, o Monterey 12 o posterior en Intel. La interfaz está traducida a más de 15 idiomas. |
| **RAW** | Sí. LibRaw en WebAssembly abre ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF y SRW. La vista previa es un revelado a mitad de tamaño y 16 bits; la exportación vuelve a revelar el sensor, hasta 8192 px en el lado largo, y si LibRaw no puede, usa el JPEG incrustado. | Sí. La [portada](https://rawtherapee.com/) describe un procesado no destructivo en coma flotante de 32 bits, demosaico (incluso dos algoritmos en la misma imagen), composición de pixel-shift, RAW de varios fotogramas, resta de dark frame, flat field y corrección de píxeles calientes o muertos, DNG HDR incluido. Desde la 5.11 las builds oficiales leen el RAW con un LibRaw mejorado y, si no puede, con un dcraw mejorado ([notas de la 5.13](https://rawtherapee.com/downloads/5.13/)). |
| **Presets .xmp de Lightroom** | Se importan en la pestaña Presets. Entran exposición, contraste, altas luces, sombras, blancos, negros, temperatura y tinte, intensidad, saturación, textura, claridad, niebla, curvas, HSL, gradación o split toning, enfoque, reducción de ruido, viñeta y grano. No entran perfiles de cámara, correcciones de objetivo, calibración ni máscaras locales. | Sin importación documentada de presets de revelado de Lightroom. Los ajustes viven en perfiles `.pp3`. El [issue #7315](https://github.com/RawTherapee/RawTherapee/issues/7315) pide serializar ese perfil en un sidecar XMP y sigue abierto. La 5.13 solo menciona el XMP para las etiquetas de color del explorador. |
| **LUTs .cube** | Un `.cube` se importa como preset, con control de intensidad. | Las notas de instalación de la 5.13 nombran una herramienta Film Simulation. No describen la importación de un `.cube`. |
| **IA** | En el dispositivo: quitar el fondo y máscara de sujeto (IS-Net, de este sitio, unos 45 MB) y ampliación (Real-ESRGAN general x4v3, unos 5 MB, también de este sitio). Borrar objetos usa MI-GAN, que se descarga de Hugging Face la primera vez. La foto no se sube con el modelo. | La [portada](https://rawtherapee.com/) y las [notas de la 5.13](https://rawtherapee.com/downloads/5.13/) no listan quitar fondo, ampliar ni borrar objetos. |
| **Privacidad / subidas** | Las fotos se quedan en el navegador. Los ajustes y los presets viven en IndexedDB de ese equipo. Las visitas usan Vercel Web Analytics sin cookies. La primera descarga del borrado de objetos muestra tu IP a Hugging Face, como cualquier descarga. | Aplicación instalada. Los perfiles de procesado son sidecars `.pp3` en tu disco ([issue #7315](https://github.com/RawTherapee/RawTherapee/issues/7315)). |
| **Lotes** | Copiar y pegar ajustes, aplicar un preset a una selección y exportar un ZIP. No hay catálogo: la sesión vive en el navegador. El collage y el carrusel salen de la misma sesión. | Cola de procesado. Las [notas de la 5.13](https://rawtherapee.com/downloads/5.13/) describen una plantilla de carpeta de salida en la cola. Las builds de macOS incluyen además un `rawtherapee-cli` opcional. |

## Cuándo conviene RawTherapee

RawTherapee conviene cuando el archivo RAW está en tu ordenador y el aspecto hay que construirlo en un revelador, no heredarlo de un preset de Lightroom. La [portada](https://rawtherapee.com/) habla de un motor en coma flotante de 32 bits, demosaico, pixel-shift, dark frames y flat field. La [5.13](https://rawtherapee.com/downloads/5.13/) añade herramientas de edición selectiva, una plantilla de salida en la cola y notas de soporte para cuerpos recientes de Canon, Nikon, Sony, Fujifilm, Panasonic y otros. Esa lista va más lejos de lo que puede prometer una sesión en el navegador: si el LibRaw que lleva Lightframes no puede revelar un archivo, la exportación cae al JPEG incrustado.

También es la mejor opción si quieres la interfaz en tu idioma, una línea de comandos o una cola que puedas dejar trabajando. Nada de eso importa el preset `.xmp` de revelado que ya habías comprado.

## Cuándo conviene Lightframes

Lightframes encaja cuando ya tienes presets `.xmp` de Lightroom o Camera Raw, o LUTs `.cube`, y los quieres en un Chromebook o en un ordenador prestado. Abre el [editor](/es/editor), entra en Presets → Import y ajusta la intensidad de 0 a 100 %. En la misma sesión puedes pegar ajustes sobre una selección, exportar un ZIP y montar un [collage](/es/herramientas/collage-fotos) o un [carrusel de Instagram](/es/herramientas/carrusel-instagram). La foto no se sube.

El aspecto se acerca, pero no es idéntico, porque el XMP deja fuera perfiles, objetivos y máscaras. No hay un explorador que siga ahí al cerrar la pestaña, ni composición pixel-shift, ni resta de dark frame. Para eso, RawTherapee es la recomendación honesta. Una biblioteca de escritorio con otro juego de módulos está en [Lightframes o darktable](/es/comparar/lightframes-vs-darktable). El repaso más amplio está en [alternativas gratis a Lightroom](/es/blog/alternativas-gratis-a-lightroom). Los límites de la importación están en [presets](/es/herramientas/presets-fotos) y [aplicar un LUT](/es/herramientas/aplicar-lut-foto).
