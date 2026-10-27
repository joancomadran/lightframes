---
key: nef-to-jpg
slug: convertir-nef-a-jpg
title: "Convertir NEF a JPG online gratis y sin subir"
description: "Convierte archivos NEF y NRW de Nikon a JPG gratis en el navegador, a resolución completa y por lotes. Sin subir nada, sin registro y sin instalar programas."
h1: "Convertir NEF de Nikon a JPG online y gratis"
lead: "Para convertir un NEF a JPG, ábrelo en el editor de Lightframes, pulsa Export y elige JPEG. El RAW de tu Nikon se revela a partir de los datos del sensor dentro del navegador y se guarda como JPG a resolución completa, de uno en uno o con la carpeta entera. Es gratis, de código abierto y no se sube nada."
label: "NEF a JPG"
summary: "Pasa archivos NEF y NRW de Nikon a JPG a resolución completa en el navegador, de uno en uno o en un ZIP."
order: 1.61
featured: false
keywords:
  - "convertir nef a jpg"
  - "nef a jpg online gratis"
  - "pasar nef a jpg"
  - "abrir archivo nef"
  - "convertir raw nikon a jpg"
  - "convertir nef a jpg por lotes"
  - "nrw a jpg"
steps:
  - name: "Abre tus archivos NEF"
    text: "Entra en el editor y pulsa Open para elegir tus .nef o .nrw, o Folder en la tira de miniaturas para cargar la carpeta de la tarjeta. La interfaz está en inglés."
  - name: "Ajusta si lo necesitas"
    text: "Pulsa Auto en la pestaña Adjust o corrige la exposición y el balance de blancos. Si solo quieres convertir, déjalo todo como está."
  - name: "Selecciona las fotos que vas a convertir"
    text: "Pulsa Ctrl/Cmd+A para seleccionar todas las fotos de la tira, o elige algunas con Ctrl/Cmd-clic."
  - name: "Exporta en JPEG"
    text: "Pulsa Export, deja Size en Original, elige JPEG y la calidad, y confirma. Una foto se descarga como JPG; varias, en un único ZIP."
faq:
  - q: "¿Cómo convierto un NEF a JPG gratis?"
    a: "Abre el NEF en Lightframes, en www.lightframes.si/editor, pulsa Export, elige JPEG y confirma. El archivo se revela en tu navegador y se guarda como JPG a resolución completa, sin cuenta, sin marca de agua y sin subirlo."
  - q: "¿Qué diferencia hay entre NEF y NRW?"
    a: "Los dos son formatos RAW de Nikon. El NEF lo usan las cámaras de objetivos intercambiables (réflex y sin espejo Z) y el NRW, algunas compactas Coolpix. Lightframes convierte los dos de la misma forma."
  - q: "¿Puedo convertir muchos NEF a JPG a la vez?"
    a: "Sí. Abre una carpeta o varios archivos, selecciónalos todos y exporta una sola vez. Cada foto se revela con los mismos ajustes y los JPG se descargan juntos en un ZIP."
  - q: "¿Se suben mis archivos NEF a algún servidor?"
    a: "No. La lectura, la edición y la codificación en JPEG se hacen en tu navegador, en tu propio dispositivo. Tus fotos no se envían a ningún servidor."
  - q: "¿Los colores serán iguales que los JPEG de mi Nikon?"
    a: "No del todo. Lightframes usa el balance de blancos de la cámara y un revelado base neutro, pero no aplica los Picture Control de Nikon, el D-Lighting activo ni las correcciones de objetivo de la cámara. Ajusta los controles o aplica un preset antes de exportar para conseguir el resultado que buscas."
  - q: "¿Qué pasa con los NEF de alta eficiencia?"
    a: "Algunas Z recientes ofrecen RAW de alta eficiencia (High Efficiency), una compresión que el decodificador incluido puede no leer. Si un archivo no se puede revelar, Lightframes exporta la vista previa JPEG a tamaño completo que Nikon guarda dentro del NEF, en vez de fallar."
updated: 2026-10-27
---

## Qué es un archivo NEF

NEF (Nikon Electronic Format) es el formato RAW de las cámaras Nikon: todas las réflex de la marca y toda la gama Z sin espejo guardan sus RAW como `.nef`, y algunas compactas Coolpix usan el formato hermano `.nrw`. Un NEF conserva los datos del sensor sin procesar, por eso guarda más detalle en luces y sombras que un JPEG, pero la mayoría de webs, apps de mensajería y servicios de impresión no lo aceptan y muchos visores del sistema no lo abren. Pasarlo a JPG hace que la foto sea fácil de compartir.

Lightframes es un editor de fotos gratuito y de código abierto que funciona en el navegador. Abre archivos NEF y NRW, los revela en tu propio dispositivo y exporta JPG a resolución completa, sin subir nada y sin instalar programas.

## Cómo se convierte un NEF en el navegador

El NEF se decodifica en tu dispositivo con LibRaw, una librería libre de lectura de RAW compilada a WebAssembly:

- **Las miniaturas** salen de la vista previa que Nikon guarda dentro de cada NEF, así que una carpeta entera aparece rápido.
- **La exportación** se revela a partir de todos los datos del sensor, con el balance de blancos que registró la cámara, y se codifica en JPEG con la calidad que elijas.
- **Plan B.** Si un archivo no se puede revelar (por ejemplo, un NEF de alta eficiencia o uno de una cámara más nueva que la versión de LibRaw incluida), Lightframes exporta el JPEG a tamaño completo que Nikon guardó dentro del archivo.
- **Los archivos se quedan en la pestaña.** Los archivos no se suben nunca y, después de la primera visita, la edición funciona sin conexión.

Los NEF sin compresión, comprimidos y comprimidos sin pérdida se convierten igual.

## Convertir una tarjeta entera de NEF

1. Pulsa **Folder** en la tira de miniaturas y elige la carpeta con tus NEF (en Chrome, Edge o Brave), o pulsa **Open** y selecciónalos.
2. Pulsa **Ctrl/Cmd+A** para seleccionarlos todos.
3. Si quieres aplicar la misma edición a todos, edita una foto, cópiala (Ctrl/Cmd+C) y pégala (Ctrl/Cmd+V) en la selección. Más en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes).
4. Pulsa **Export**, elige JPEG y confirma. Obtienes un ZIP con un JPG por cada NEF.

Cada NEF se revela a resolución completa, uno detrás de otro, así que una tarjeta grande tarda un rato. Un ordenador aguanta mejor los lotes grandes que un móvil.

## Ajustes de exportación recomendados

| Uso | Size (tamaño) | Formato y calidad |
| --- | --- | --- |
| Archivo o impresión | Original (hasta 8192 px) | JPEG, 95–100 % |
| Correo, web o previsualización para clientes | Web (2048 px) | JPEG, 85–92 % |
| Feed de Instagram | IG 4:5 (1080 × 1350) o IG 1:1 | JPEG, 92 % |
| Archivos lo más ligeros posible | Web (2048 px) | WebP, 80–90 % |

Para conservar los nombres originales (como `DSC_0042`), cambia el patrón de nombre a `{name}` en vez del `{name}-edited` que viene por defecto.

## Limitaciones

- **Procesado propio de Nikon.** No se aplican los Picture Control, el D-Lighting activo ni otras correcciones de la cámara o del software de Nikon.
- **Tamaño máximo.** La exportación llega hasta 8192 px en el lado largo, así que los archivos de cámaras de 45 MP se reducen un poco en tamaño Original.
- **Metadatos.** Los datos EXIF (fecha, cámara, objetivo, GPS) no se copian al JPG.
- **Cámaras y modos muy recientes.** Los archivos que la versión de LibRaw incluida no puede leer usan la vista previa incrustada.

Canon y Sony tienen su propia página: [CR3 a JPG](/es/herramientas/convertir-cr3-a-jpg) y [ARW a JPG](/es/herramientas/convertir-arw-a-jpg). El resto de formatos los tienes en el [conversor de RAW a JPG](/es/herramientas/convertir-raw-a-jpg) y, si además de convertir quieres editar, mira el [editor de fotos RAW](/es/herramientas/editor-fotos-raw).
