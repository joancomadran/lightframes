---
key: lightframes-vs-darktable
slug: lightframes-vs-darktable
title: "Lightframes frente a darktable"
description: "Lightframes o darktable como alternativa gratis a Lightroom: presets .xmp en el navegador, o un catálogo RAW de escritorio. RAW, lotes, IA y privacidad."
h1: "Lightframes o darktable"
lead: "Lightframes encaja si quieres un editor gratis en el navegador que importa presets .xmp de Lightroom y LUTs .cube, y deja las fotos en tu equipo. darktable encaja si quieres un revelador RAW de escritorio, también gratis, con biblioteca, OpenCL y un flujo por módulos que se instala. No se sustituyen: la FAQ de darktable dice que los presets de otros programas, Lightroom incluido, no son compatibles."
order: 1
updated: 2026-11-10
faq:
  - q: "¿darktable es una alternativa gratis a Lightroom?"
    a: "Su FAQ dice que sí y que no. Revela RAW y gestiona una biblioteca, pero no es un recambio directo, y la curva de aprendizaje es pronunciada porque casi nada de un flujo de Lightroom se traslada."
  - q: "¿darktable abre presets .xmp de Lightroom?"
    a: "No. darktable explica que los estilos son propios del programa que los creó. A cambio puede usar LUTs en varios formatos. Hay una importación muy básica de ediciones de Lightroom que la misma FAQ califica de código viejo y algo roto."
  - q: "¿Lightframes sube las fotos?"
    a: "No. Las decodifica y las revela en el navegador con WebAssembly y Web Workers. No se envían a un servidor de Lightframes. darktable también las deja en local porque es una aplicación instalada."
  - q: "¿Cuál instalo en Linux?"
    a: "Si quieres catálogo, tethering y un revelado RAW completo, instala darktable desde tu distribución o el AppImage del proyecto. Si quieres aplicar presets .xmp sin instalar nada, abre Lightframes en el navegador."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es independiente y no está afiliado a Adobe. darktable es otro proyecto.

## Comparación

| | **Lightframes** | **darktable** |
| --- | --- | --- |
| **Precio** | Gratis. Sin cuenta y sin plan de pago. | Gratis. |
| **Licencia** | [MIT](https://github.com/joancomadran/lightframes) | GNU GPL, versión 3 o posterior, en las [cabeceras del código](https://github.com/darktable-org/darktable/blob/master/src/is_supported_platform.h) |
| **Dónde funciona** | Chrome, Edge, Brave, Firefox y Safari actuales, Chromebook incluido. Se puede instalar como PWA. La interfaz del editor está en inglés. | Linux, macOS, Windows, BSD y Solaris, según la [página de funciones](https://www.darktable.org/about/features/). Las builds actuales de macOS piden 13.5 o posterior y son solo Apple silicon; no hay versión oficial para Mac Intel ([instalación](https://www.darktable.org/install/)). |
| **RAW** | Sí. LibRaw en WebAssembly abre ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF y SRW. La vista previa es un revelado a mitad de tamaño y 16 bits; la exportación vuelve a revelar el sensor, hasta 8192 px en el lado largo, y si LibRaw no puede, usa el JPEG incrustado. | Sí. La [página de funciones](https://www.darktable.org/about/features/) cita formatos estándar, RAW y HDR como JPEG, CR2, NEF y RAF. El soporte por cámara está en la [página de cámaras](https://www.darktable.org/resources/camera-support/). |
| **Presets .xmp de Lightroom** | Se importan en la pestaña Presets. Entran exposición, contraste, altas luces, sombras, blancos, negros, temperatura y tinte, intensidad, saturación, textura, claridad, niebla, curvas, HSL, gradación o split toning, enfoque, reducción de ruido, viñeta y grano. No entran perfiles de cámara, correcciones de objetivo, calibración ni máscaras locales. | No. Los presets (estilos) de otros programas no son compatibles ([FAQ](https://www.darktable.org/about/faq/)). |
| **LUTs .cube** | Un `.cube` se importa como preset, con control de intensidad. | LUTs en varios formatos, como puente entre programas ([FAQ](https://www.darktable.org/about/faq/)). |
| **IA** | En el dispositivo: quitar el fondo y máscara de sujeto (modelos de este sitio, unos 45 MB el de sujeto y 5 MB el de ampliación) y borrar objetos (MI-GAN, que se descarga de Hugging Face la primera vez). La foto no se sube con el modelo. | darktable tiene funciones de IA, pero la FAQ dice que, a septiembre de 2026, la build Flatpak no las incluye. La FAQ no enumera esas funciones, así que aquí no las describimos. |
| **Privacidad / subidas** | Las fotos se quedan en el navegador. Los ajustes y los presets viven en IndexedDB de ese equipo. Las visitas usan Vercel Web Analytics sin cookies. La primera descarga del borrado de objetos muestra tu IP a Hugging Face, como cualquier descarga. | Aplicación local. Los originales no se modifican; los ajustes van a una base de datos y a sidecars XMP ([funciones](https://www.darktable.org/about/features/)). |
| **Lotes** | Copiar y pegar ajustes, aplicar un preset a una selección y exportar un ZIP. No hay catálogo: la sesión vive en el navegador. | Búsqueda en la biblioteca, estrellas y etiquetas, exportación (JPEG, PNG, TIFF, HDR) y scripts en Lua ([funciones](https://www.darktable.org/about/features/)). |

## Cuándo conviene darktable

darktable es la opción cuando el trabajo es una biblioteca RAW que se queda en tu disco. Su [página de funciones](https://www.darktable.org/about/features/) describe edición no destructiva, un flujo en coma flotante de 32 bits, OpenCL, gestión de color, disparo conectado en algunas cámaras y exportación a galerías web además de a archivo. La [FAQ](https://www.darktable.org/about/faq/) deja claro que es una caja de herramientas con curva pronunciada, no una piel de Lightroom.

También es la mejor opción en Linux si quieres una app nativa de tu distribución, un AppImage o un Flatpak. Ten en cuenta el límite de IA del Flatpak y el de macOS: las builds oficiales actuales van a Apple silicon con macOS 13.5 o más nuevo.

## Cuándo conviene Lightframes

Lightframes encaja cuando ya tienes presets `.xmp` de Lightroom o Camera Raw, o LUTs `.cube`, y quieres aplicarlos sin instalar un revelador. Abre el [editor](/es/editor), entra en Presets → Import y ajusta la intensidad de 0 a 100 %. En la misma sesión puedes pegar ajustes por lotes, exportar un ZIP y montar un collage o un carrusel.

Es lo práctico en un Chromebook o en un ordenador prestado: no se instala nada y el navegador lee los archivos del disco. El aspecto se acerca, pero no es idéntico, porque el XMP deja fuera perfiles, objetivos y máscaras. No hay mesa de luz, ni tethering, ni Lua. Para eso, darktable es la recomendación honesta. La guía de [alternativas gratis a Lightroom](/es/blog/alternativas-gratis-a-lightroom) también habla de RawTherapee y Photopea.
