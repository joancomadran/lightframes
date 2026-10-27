---
key: arw-to-jpg
slug: convertir-arw-a-jpg
title: "Convertir ARW a JPG online gratis y sin subir"
description: "Convierte archivos ARW de Sony a JPG gratis en el navegador, a resolución completa y por lotes. Sin subir nada, sin registro y sin instalar programas."
h1: "Convertir ARW de Sony a JPG online y gratis"
lead: "Para convertir un ARW a JPG, ábrelo en el editor de Lightframes, pulsa Export y elige JPEG. El RAW de tu Sony se revela a partir de los datos del sensor dentro del navegador y se guarda como JPG a resolución completa, de uno en uno o con la carpeta entera. Es gratis, de código abierto y no se sube nada."
label: "ARW a JPG"
summary: "Pasa archivos ARW de Sony a JPG a resolución completa en el navegador, de uno en uno o en un ZIP."
order: 1.62
featured: false
keywords:
  - "convertir arw a jpg"
  - "arw a jpg online gratis"
  - "pasar arw a jpg"
  - "abrir archivo arw"
  - "convertir raw sony a jpg"
  - "convertir arw a jpg por lotes"
steps:
  - name: "Abre tus archivos ARW"
    text: "Entra en el editor y pulsa Open para elegir tus .arw, o Folder en la tira de miniaturas para cargar la carpeta de la tarjeta. La interfaz está en inglés."
  - name: "Ajusta si lo necesitas"
    text: "Pulsa Auto en la pestaña Adjust o corrige la exposición y el balance de blancos. Si solo quieres convertir, déjalo todo como está."
  - name: "Selecciona las fotos que vas a convertir"
    text: "Pulsa Ctrl/Cmd+A para seleccionar todas las fotos de la tira, o elige algunas con Ctrl/Cmd-clic."
  - name: "Exporta en JPEG"
    text: "Pulsa Export, deja Size en Original, elige JPEG y la calidad, y confirma. Una foto se descarga como JPG; varias, en un único ZIP."
faq:
  - q: "¿Cómo convierto un ARW a JPG gratis?"
    a: "Abre el ARW en Lightframes, en www.lightframes.si/editor, pulsa Export, elige JPEG y confirma. El archivo se revela en tu navegador y se guarda como JPG a resolución completa, sin cuenta, sin marca de agua y sin subirlo."
  - q: "¿Qué cámaras Sony guardan archivos ARW?"
    a: "ARW es el formato RAW de las cámaras Alpha de Sony, tanto de formato completo como APS-C, y de las compactas RX y ZV que disparan en RAW. Lightframes abre los archivos de todas ellas, siempre que la versión de LibRaw incluida reconozca el modelo."
  - q: "¿Puedo convertir muchos ARW a JPG a la vez?"
    a: "Sí. Abre una carpeta o varios archivos, selecciónalos todos y exporta una sola vez. Cada foto se revela con los mismos ajustes y los JPG se descargan juntos en un ZIP."
  - q: "¿Se suben mis archivos ARW a algún servidor?"
    a: "No. La lectura, la edición y la codificación en JPEG se hacen en tu navegador, en tu propio dispositivo. Tus fotos no se envían a ningún servidor."
  - q: "¿Los colores serán iguales que los JPEG de mi Sony?"
    a: "No del todo. Lightframes usa el balance de blancos de la cámara y un revelado base neutro, pero no aplica los Creative Look o Creative Style de Sony, el DRO ni las correcciones de objetivo de la cámara. Ajusta los controles o aplica un preset antes de exportar para conseguir el resultado que buscas."
  - q: "¿Funciona con ARW comprimidos y comprimidos sin pérdida?"
    a: "Los ARW comprimidos y sin comprimir se revelan con normalidad. Si un archivo usa una compresión que el decodificador incluido no lee, Lightframes exporta la vista previa JPEG a tamaño completo que Sony guarda dentro del ARW, en vez de fallar."
updated: 2026-10-27
---

## Qué es un archivo ARW

ARW (Sony Alpha RAW) es el formato RAW de las cámaras Sony: las Alpha de formato completo y APS-C guardan sus RAW como `.arw`, y también las compactas RX y ZV que disparan en RAW. Un ARW conserva los datos del sensor sin procesar, así que hay más margen para recuperar luces y sombras que en un JPEG, pero la mayoría de webs, apps de mensajería y servicios de impresión no lo aceptan y muchos visores del sistema no lo abren. Pasarlo a JPG hace que la foto sea fácil de compartir.

Lightframes es un editor de fotos gratuito y de código abierto que funciona en el navegador. Abre archivos ARW, los revela en tu propio dispositivo y exporta JPG a resolución completa, sin subir nada y sin instalar programas.

## Cómo se convierte un ARW en el navegador

El ARW se decodifica en tu dispositivo con LibRaw, una librería libre de lectura de RAW compilada a WebAssembly:

- **Las miniaturas** salen de la vista previa que Sony guarda dentro de cada ARW, así que una carpeta entera aparece rápido.
- **La exportación** se revela a partir de todos los datos del sensor, con el balance de blancos que registró la cámara, y se codifica en JPEG con la calidad que elijas.
- **Plan B.** Si un archivo no se puede revelar (por ejemplo, de una cámara más nueva que la versión de LibRaw incluida), Lightframes exporta el JPEG a tamaño completo que Sony guardó dentro del archivo.
- **Los archivos se quedan en la pestaña.** Los archivos no se suben nunca y, después de la primera visita, la edición funciona sin conexión.

## Convertir una tarjeta entera de ARW

1. Pulsa **Folder** en la tira de miniaturas y elige la carpeta con tus ARW (en Chrome, Edge o Brave), o pulsa **Open** y selecciónalos.
2. Pulsa **Ctrl/Cmd+A** para seleccionarlos todos.
3. Si quieres aplicar la misma edición a todos, edita una foto, cópiala (Ctrl/Cmd+C) y pégala (Ctrl/Cmd+V) en la selección. Más en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes).
4. Pulsa **Export**, elige JPEG y confirma. Obtienes un ZIP con un JPG por cada ARW.

Cada ARW se revela a resolución completa, uno detrás de otro, así que una tarjeta grande tarda un rato. Un ordenador aguanta mejor los lotes grandes que un móvil.

## Ajustes de exportación recomendados

| Uso | Size (tamaño) | Formato y calidad |
| --- | --- | --- |
| Archivo o impresión | Original (hasta 8192 px) | JPEG, 95–100 % |
| Correo, web o previsualización para clientes | Web (2048 px) | JPEG, 85–92 % |
| Feed de Instagram | IG 4:5 (1080 × 1350) o IG 1:1 | JPEG, 92 % |
| Archivos lo más ligeros posible | Web (2048 px) | WebP, 80–90 % |

Para conservar los nombres originales (como `DSC01234`), cambia el patrón de nombre a `{name}` en vez del `{name}-edited` que viene por defecto.

## Limitaciones

- **Procesado propio de Sony.** No se aplican los Creative Look, los Creative Style, el DRO ni otras correcciones de la cámara o del software de Sony.
- **Tamaño máximo.** La exportación llega hasta 8192 px en el lado largo, así que los archivos de cámaras de alta resolución (unos 50 MP o más) se reducen en tamaño Original.
- **Metadatos.** Los datos EXIF (fecha, cámara, objetivo, GPS) no se copian al JPG.
- **Cámaras muy recientes.** Los archivos que la versión de LibRaw incluida no puede leer usan la vista previa incrustada.

Canon y Nikon tienen su propia página: [CR3 a JPG](/es/herramientas/convertir-cr3-a-jpg) y [NEF a JPG](/es/herramientas/convertir-nef-a-jpg). El resto de formatos los tienes en el [conversor de RAW a JPG](/es/herramientas/convertir-raw-a-jpg) y, si además de convertir quieres editar, mira el [editor de fotos RAW](/es/herramientas/editor-fotos-raw).
