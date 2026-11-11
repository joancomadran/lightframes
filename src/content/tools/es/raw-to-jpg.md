---
key: raw-to-jpg
slug: convertir-raw-a-jpg
title: "Convertir RAW a JPG online gratis y sin subir"
description: "Convierte RAW a JPG gratis en el navegador: CR3, CR2, ARW, NEF, DNG, RAF, ORF o RW2 a JPEG a resolución completa, uno a uno o por lotes. Sin subir nada."
h1: "Convertir RAW a JPG online, gratis y sin subir tus fotos"
lead: "Para convertir un RAW a JPG, ábrelo en el editor de Lightframes, pulsa Export y elige JPEG. El RAW se revela a partir de los datos del sensor dentro de tu navegador y se guarda como JPG a resolución completa; si son varios, se descargan juntos en un ZIP. Es gratis, de código abierto y tus fotos nunca se suben a ningún servidor."
label: "RAW a JPG"
summary: "Convierte CR3, ARW, NEF, DNG y otros RAW a JPG a resolución completa, de uno en uno o por lotes. Sin subir nada."
order: 1.5
keywords:
  - "convertir raw a jpg online gratis"
  - "pasar raw a jpg"
  - "conversor raw a jpg"
  - "convertir arw a jpg"
  - "convertir nef a jpg"
  - "convertir dng a jpg"
  - "convertir cr2 a jpg"
  - "convertir raw a jpg por lotes"
steps:
  - name: "Abre los archivos"
    text: "Entra en el editor y pulsa Open para elegir uno o varios RAW. En Chrome, Edge o Brave, Folder en la tira de miniaturas carga la tarjeta entera. Los botones están en inglés."
  - name: "Ajusta"
    text: "Pulsa Auto, o corrige la exposición y el balance de blancos. Si solo quieres convertir, sáltate este paso: la exportación usa el balance de blancos de la cámara."
  - name: "Exporta el JPG"
    text: "Pulsa Export, deja Size en Original, pon Format en JPEG (92 % por defecto) y confirma. Una foto se descarga como JPG. Pon el patrón de nombre en {name} para conservar el original."
  - name: "Por lotes"
    text: "Pulsa Ctrl/Cmd+A para seleccionar la tira y exporta una sola vez. Todos los archivos usan los mismos ajustes y los JPG se descargan en un ZIP."
faq:
  - q: "¿Qué formatos RAW puedo convertir a JPG?"
    a: "Canon .cr3 y .cr2, Sony .arw, Nikon .nef y .nrw, .dng, Fujifilm .raf, Olympus / OM System .orf, Panasonic .rw2, Pentax .pef y Samsung .srw. La lectura la hace LibRaw compilado a WebAssembly, así que la compatibilidad con cada modelo de cámara depende de lo que soporte esa librería."
  - q: "¿Cómo abrir un NEF o un CR3 sin programas?"
    a: "Abre el archivo en el editor de Lightframes, en www.lightframes.si/es/editor?intent=raw. No instalas nada y el archivo no se sube. La versión de LibRaw incluida decodifica NEF, NRW, CR3 y CR2 en el navegador, y el mismo editor abre el resto de extensiones de esta página. Exporta en JPEG cuando quieras el JPG."
  - q: "¿Tengo que subir mis RAW para convertirlos?"
    a: "No. El RAW se lee, se revela y se codifica en JPG dentro de tu navegador, en tu propio dispositivo. Tus fotos no se envían a ningún servidor y no necesitas cuenta."
  - q: "¿El JPG sale a resolución completa?"
    a: "Sí. Con Size en Original, la exportación se revela a partir de todos los datos del sensor, hasta 8192 px en el lado largo; los sensores más grandes se reducen a esa medida. También puedes elegir un lado largo menor o un tamaño fijo para redes sociales."
  - q: "¿Puedo convertir muchos RAW a JPG a la vez?"
    a: "Sí. Selecciona las fotos en la tira de miniaturas y exporta una sola vez: todas se convierten con los mismos ajustes y se descargan juntas en un ZIP. No hay un límite fijo, pero cada RAW se revela a resolución completa, uno detrás de otro, así que los lotes grandes tardan más."
  - q: "¿Qué calidad de JPEG elijo?"
    a: "El 92 % que viene por defecto va bien para casi todo. Usa 95–100 % para imprimir o seguir editando, y valores más bajos si quieres archivos ligeros para enviar o publicar. También puedes exportar en PNG (sin pérdida) o en WebP."
  - q: "¿El JPG conserva los datos EXIF de la cámara?"
    a: "No. El JPG exportado solo contiene la imagen revelada: no se copian metadatos como la fecha de la foto, el modelo de cámara o la ubicación GPS. Si necesitas esa información, guarda también el RAW."
  - q: "¿El JPG se verá igual que el JPEG de mi cámara?"
    a: "No exactamente. Lightframes revela todos los RAW con un mismo revelado base neutro y el balance de blancos de la cámara, sin los estilos de imagen del fabricante ni correcciones de objetivo. Si buscas otro resultado, ajusta los controles antes de exportar."
  - q: "¿Se modifica el archivo RAW original?"
    a: "No. La conversión crea un JPG nuevo; el RAW de tu disco no se toca."
updated: 2026-11-11
---

## Qué significa convertir RAW a JPG con Lightframes

Lightframes convierte los archivos RAW de tu cámara en JPG normales, de los que se abren en cualquier móvil, ordenador, web o tienda de impresión. El RAW se revela de verdad a partir de los datos del sensor (no se limita a sacar la vista previa que lleva dentro), en tu propio dispositivo, y puedes exportar una foto o una sesión entera de una vez. Es un editor de fotos gratuito y de código abierto (licencia MIT) que funciona en el navegador: no hay nada que instalar ni nada que subir.

Como el conversor es también un editor RAW completo, antes de generar el JPG puedes corregir la exposición, recuperar un cielo quemado o ajustar el balance de blancos. Si solo quieres convertir, abre los archivos y expórtalos sin tocar nada.

La interfaz del editor está en inglés; en esta guía usamos los nombres de los botones tal como aparecen en pantalla.

## Cómo funciona la conversión

Todo ocurre dentro de la pestaña del navegador:

1. **Lectura.** El archivo se lee de tu disco y su vista previa incrustada sirve para mostrar la miniatura enseguida.
2. **Revelado.** Al exportar, LibRaw (compilado a WebAssembly) decodifica los datos del sensor a resolución completa con el balance de blancos que registró la cámara. Después, Lightframes aplica su curva de tono base y los ajustes que hayas hecho.
3. **Codificación.** La imagen revelada se guarda en JPEG con la calidad que elijas y se descarga. Si son varias, se empaquetan en un ZIP con un nombre como `lightframes-2026-10-20-24-photos.zip`.

Si LibRaw no puede revelar un archivo concreto, Lightframes usa el JPEG a tamaño completo que la cámara guardó dentro del RAW, en lugar de dar error. Después de la primera visita, la aplicación queda guardada en el navegador y la conversión funciona también sin conexión; incluso puedes instalarla como app (PWA).

## Formatos que abre este conversor

El editor abre las extensiones de esta tabla y las decodifica con la versión de LibRaw compilada a WebAssembly que lleva la aplicación. Si la cámara o la compresión son más nuevas que esa versión, la exportación usa el JPEG a tamaño completo guardado dentro del RAW, cuando la cámara lo incluyó. Cualquier otra extensión RAW no se abre.

| Origen | Extensiones | Guía |
| --- | --- | --- |
| Canon | `.cr2`, `.cr3` | [CR3 a JPG](/es/herramientas/convertir-cr3-a-jpg) |
| Nikon | `.nef`, `.nrw` | [NEF a JPG](/es/herramientas/convertir-nef-a-jpg) |
| Sony | `.arw` | [ARW a JPG](/es/herramientas/convertir-arw-a-jpg) |
| DNG (cámaras, móviles y drones) | `.dng` | [DNG a JPG](/es/herramientas/convertir-dng-a-jpg) |
| Fujifilm | `.raf` | En esta página |
| Olympus / OM System | `.orf` | En esta página |
| Panasonic | `.rw2` | En esta página |
| Pentax | `.pef` | En esta página |
| Samsung | `.srw` | En esta página |

CR3 es el RAW de Canon desde 2018, incluida la gama EOS R; CR2 es el de las réflex EOS anteriores. Nikon escribe NEF en las cámaras de objetivos intercambiables y NRW en algunas Coolpix. Las Sony Alpha usan ARW. DNG es un contenedor abierto que usan algunas marcas y muchos móviles y drones. En tamaño Original, un sensor de más de 8192 px se reduce a 8192 px en el lado largo.

## Frente a un conversor de escritorio

Un conversor de escritorio — el programa de la marca, Lightroom o darktable — se instala en el ordenador, puede usar más memoria y suele aplicar el perfil de color y la corrección de objetivo de esa marca. Lightframes no se instala y convierte sin subir archivos: el revelado y el JPEG se quedan en la pestaña del navegador.

Un archivo muy grande, o muchos abiertos a la vez, puede agotar la memoria del navegador y la exportación falla. Cada RAW se revela de uno en uno. El lado largo se queda en 8192 px, y el revelado es una base neutra, sin el estilo de imagen del fabricante. La comparación más larga de programas de escritorio está en [alternativas gratis a Lightroom](/es/blog/alternativas-gratis-a-lightroom).

## Opciones de exportación del JPG

| Opción | Valores | Consejo |
| --- | --- | --- |
| Size (tamaño) | Original (resolución completa, hasta 8192 px), Web (2048 px), IG 4:5 (1080 × 1350), IG 1:1 (1080 × 1080), Story (1080 × 1920) o cualquier lado largo desde 800 px | Original para archivar e imprimir; Web para correo y páginas web |
| Format (formato) | JPEG, PNG o WebP | JPEG por compatibilidad, PNG para copias sin pérdida, WebP para webs más ligeras |
| Quality (calidad) | 50–100 % en JPEG y WebP (92 % por defecto) | Entre 90 y 95 % la compresión no se nota en casi ninguna foto |
| Filename (nombre) | Patrón como `{name}-edited` | Pon `{name}` para conservar los nombres originales |
| Watermark (marca de agua) | Texto opcional en una esquina o en el centro | Desactivada por defecto |

Las opciones se aplican a todas las fotos seleccionadas, así que conviertes una tarjeta entera con un solo clic.

## ¿Convertir directamente o editar antes?

Una conversión directa te da un JPG fiel y neutro. Merece la pena editar antes cuando la cámara se ha equivocado, porque el RAW todavía guarda información que un JPG ya ha perdido:

- **Cielo quemado:** baja Highlights y Whites con el aviso de recorte (J) activado.
- **Dominante de color:** usa el cuentagotas del balance de blancos sobre algo neutro.
- **Mismo estilo en toda la serie:** aplica un [preset](/es/herramientas/presets-fotos) o pega una misma edición en toda la selección con la [edición por lotes](/es/herramientas/editar-fotos-por-lotes).

Tienes todos los controles explicados en el [editor de fotos RAW](/es/herramientas/editor-fotos-raw), o [abre el editor](/es/editor?intent=raw) con tus archivos. Cómo funciona el revelado está en [editar fotos RAW en el navegador](/es/blog/editar-fotos-raw-en-el-navegador).

## Limitaciones

- **Tamaño máximo.** La exportación llega hasta 8192 px en el lado largo.
- **Revelado.** Se usa el mismo revelado base neutro para todas las cámaras, sin estilos de imagen del fabricante, perfiles de color por cámara ni corrección de objetivos, así que los colores pueden diferir del JPEG de la cámara.
- **Metadatos.** Los datos EXIF (fecha, cámara, GPS) no se copian al JPG.
- **Cámaras muy nuevas.** Puede que la versión de LibRaw incluida aún no lea los modelos más recientes; en ese caso se usa la vista previa incrustada.
- **Memoria y tiempo.** Cada RAW se revela a resolución completa, lo que lleva unos segundos por archivo. Los lotes grandes van mejor en un ordenador que en un móvil.
- **Carpetas.** Abrir una carpeta entera requiere Chrome, Edge, Brave u otro navegador basado en Chromium; en los demás, selecciona los archivos con Open.

Tienes más respuestas en las [preguntas frecuentes](/es/preguntas-frecuentes).
