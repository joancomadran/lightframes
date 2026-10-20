---
key: raw-editor
slug: editor-fotos-raw
title: "Editor de fotos RAW online gratis"
description: "Edita fotos RAW online gratis: abre archivos ARW, CR2, CR3, NEF, DNG, RAF, ORF o RW2 en el navegador, sin subirlos, sin registro y también sin conexión."
h1: "Editar fotos RAW online, gratis y sin subirlas"
lead: "Lightframes abre archivos RAW de cámara (ARW, CR2, CR3, NEF, DNG, RAF, ORF, RW2 y más) directamente en el navegador y los revela en tu propio dispositivo. Es gratis, no pide registro y tus fotos nunca se suben a ningún servidor."
label: "Editor RAW"
summary: "Abre y revela archivos RAW (ARW, CR3, NEF, DNG…) en el navegador. Gratis, privado y sin subir nada."
order: 1
keywords:
  - "editar fotos raw online"
  - "editor raw online gratis"
  - "abrir archivo arw online"
  - "editar cr3 online"
  - "abrir nef online"
  - "revelar raw sin instalar programas"
  - "editor dng online"
steps:
  - name: "Abre tus archivos RAW"
    text: "Entra en el editor y pulsa Open en la barra superior, o Folder en la tira de miniaturas para cargar una carpeta entera. Los RAW aparecen como miniaturas."
  - name: "Revela la foto"
    text: "En la pestaña Adjust ajusta la luz (exposición, contraste, altas luces, sombras, blancos y negros) y el balance de blancos, o pulsa Auto. Color, Curve, Effects y Local te dan más control."
  - name: "Controla luces y sombras quemadas"
    text: "Pulsa J para ver el aviso de recorte en el histograma y en la imagen, y \\ para comparar el antes y el después."
  - name: "Exporta en JPEG, PNG o WebP"
    text: "Pulsa Export, elige tamaño y formato y confirma. El RAW se revela de nuevo a resolución completa y se descarga en tu equipo."
faq:
  - q: "¿Qué formatos RAW puedo abrir?"
    a: "Lightframes abre archivos .arw, .cr2, .cr3, .nef, .nrw, .dng, .raf, .orf, .rw2, .pef y .srw, además de JPEG y PNG. La lectura la hace LibRaw compilado a WebAssembly, así que la compatibilidad depende de lo que soporte esa librería."
  - q: "¿Se suben mis archivos RAW a algún servidor?"
    a: "No. Los archivos se leen y se revelan dentro del navegador, en tu propio dispositivo. No se envía nada a ningún servidor y no necesitas cuenta."
  - q: "¿Editar la foto modifica mi archivo RAW original?"
    a: "No. Los ajustes se guardan como parámetros y solo se aplican al exportar un archivo nuevo. El RAW de tu disco no se toca."
  - q: "¿Puedo editar RAW sin conexión a internet?"
    a: "Sí. Si abres el editor una vez con conexión, la aplicación y el decodificador RAW quedan guardados en el navegador y puedes abrir, editar y exportar sin internet. También puedes instalarlo como aplicación."
  - q: "¿A qué resolución se exportan las fotos?"
    a: "La exportación se revela desde los datos completos del sensor, hasta 8192 px en el lado largo. También puedes elegir un tamaño menor o un formato fijo para redes sociales."
  - q: "¿El editor está en español?"
    a: "La interfaz del editor está en inglés, pero es muy visual: los nombres de los controles (Exposure, Contrast, Highlights…) son los habituales en cualquier programa de revelado."
updated: 2026-10-20
---

## Qué es este editor RAW y para quién es

Lightframes es un editor de fotos RAW gratuito que funciona entero en el navegador. Está pensado para fotógrafos que quieren revelar sus archivos de cámara sin instalar programas, sin crearse una cuenta y sin mandar sus fotos a la nube. Sirve para un retoque rápido desde un portátil prestado, para revisar una tarjeta de viaje o para una sesión de edición completa en tu ordenador. El código es abierto, con licencia MIT.

Ten en cuenta que la interfaz del editor está en inglés; en los pasos de arriba usamos los nombres tal como aparecen en pantalla.

## Cómo se revela un RAW en el navegador (y por qué no se sube nada)

Cada archivo RAW se decodifica en tu dispositivo con LibRaw, una librería de lectura de RAW compilada a WebAssembly, y los píxeles nunca salen del navegador. Esto es lo que pasa cuando abres un archivo:

- **Las miniaturas** salen del JPEG que la cámara incrusta dentro del RAW, así que una carpeta entera aparece rápido.
- **La vista previa de edición** se revela a partir de los datos del sensor a la mitad de tamaño, en RGB lineal de 16 bits y con el balance de blancos que registró la cámara. Así se conserva información en las altas luces que el JPEG incrustado ya ha perdido, y recuperar un cielo quemado funciona mejor.
- **La exportación** vuelve a revelar el RAW a resolución completa. Si LibRaw no puede revelar un archivo concreto, Lightframes usa el JPEG incrustado en lugar de fallar.
- **La edición es no destructiva.** Los ajustes se guardan como parámetros y el RAW original nunca se modifica.
- **La sesión se recupera.** Las fotos abiertas y sus ajustes se guardan en el almacenamiento local del navegador (IndexedDB), así que si recargas la página vuelven a aparecer.

Como todo ocurre en local, después de la primera carga el editor funciona sin conexión, incluida la lectura de RAW. Puedes instalarlo como aplicación (PWA) desde el navegador.

## Formatos compatibles

| Extensión | Origen habitual |
| --- | --- |
| `.arw` | Sony |
| `.cr2`, `.cr3` | Canon |
| `.nef`, `.nrw` | Nikon |
| `.dng` | Digital Negative (muchas cámaras y móviles) |
| `.raf` | Fujifilm |
| `.orf` | Olympus / OM System |
| `.rw2` | Panasonic |
| `.pef` | Pentax |
| `.srw` | Samsung |
| `.jpg`, `.jpeg`, `.png` | Cualquier cámara, móvil o aplicación |

Puedes exportar en **JPEG**, **PNG** o **WebP**, con calidad ajustable (50–100) en JPEG y WebP, lado largo entre 800 y 8192 px y un patrón de nombre de archivo como `{name}-edited`.

## Qué puedes ajustar

- **Luz:** exposición, contraste, altas luces, sombras, blancos y negros, con un botón Auto que los calcula a partir del histograma.
- **Balance de blancos:** temperatura y matiz, cuentagotas para pinchar en algo neutro y modo automático.
- **Color:** textura, claridad, neblina, intensidad, saturación, editor HSL con ocho bandas de color y gradación de color en sombras, medios tonos y luces.
- **Curva de tonos:** curva general y curvas de rojo, verde y azul.
- **Detalle y efectos:** enfoque, reducción de ruido de luminancia y de color, viñeta y grano.
- **Encuadre:** recorte con proporciones predefinidas, enderezar y rotar.
- **Ajustes locales:** máscaras radiales, lineales (degradado) y de pincel, y una máscara de sujeto que se detecta sola.
- **Retoque:** pincel corrector, tampón de clonar y borrado de objetos con IA (más en [borrar objetos de una foto](/es/herramientas/borrar-objetos-foto)).

## Consejos para revelar mejor tus RAW

- Empieza por las altas luces: baja Highlights y Whites con el aviso de recorte (J) activado y después levanta las sombras.
- Corrige el balance de blancos antes de tocar el color; el cuentagotas te da un punto de partida neutro.
- Guarda tu estilo como [preset personalizado](/es/herramientas/presets-fotos) y aplícalo al resto de la sesión.
- Si tienes muchas fotos de la misma escena, copia y pega los ajustes y expórtalas todas de golpe con la [edición por lotes](/es/herramientas/editar-fotos-por-lotes).

## Limitaciones

- **Vista previa y exportación.** La vista previa se revela a mitad de tamaño para ir rápido; la resolución completa solo se calcula al exportar, lo que lleva unos segundos por RAW.
- **Tamaño máximo.** La exportación llega hasta 8192 px en el lado largo; los sensores de muchísima resolución se reducen un poco.
- **Perfiles.** Lightframes aplica un mismo revelado base a todos los RAW. No usa perfiles de color específicos de cada cámara ni corrige objetivos.
- **Cámaras muy nuevas.** Puede que la versión de LibRaw incluida aún no lea los modelos más recientes. En ese caso puedes editar el JPEG incrustado.
- **Memoria.** Los RAW grandes ocupan mucha memoria; un ordenador aguanta sesiones largas mejor que un móvil.
- **Navegador.** Open funciona en cualquier navegador moderno. Abrir una carpeta entera requiere Chrome, Edge, Brave u otro navegador basado en Chromium.

Tienes más respuestas en las [preguntas frecuentes](/es/preguntas-frecuentes).
