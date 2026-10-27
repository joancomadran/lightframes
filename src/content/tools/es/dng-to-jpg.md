---
key: dng-to-jpg
slug: convertir-dng-a-jpg
title: "Convertir DNG a JPG online gratis y sin subir"
description: "Convierte archivos DNG de cámaras, móviles y drones a JPG gratis en el navegador, a resolución completa y por lotes. Sin subir nada ni instalar programas."
h1: "Convertir DNG a JPG online y gratis"
lead: "Para convertir un DNG a JPG, ábrelo en el editor de Lightframes, pulsa Export y elige JPEG. El DNG se revela dentro del navegador y se guarda como JPG a resolución completa, de uno en uno o con la carpeta entera. Funciona con DNG de cámaras, móviles y drones, es gratis y no se sube nada."
label: "DNG a JPG"
summary: "Pasa archivos DNG de cámaras, móviles y drones a JPG a resolución completa en el navegador, de uno en uno o en un ZIP."
order: 1.63
featured: false
keywords:
  - "convertir dng a jpg"
  - "dng a jpg online gratis"
  - "pasar dng a jpg"
  - "abrir archivo dng"
  - "dng iphone a jpg"
  - "dng dron a jpg"
  - "convertir dng a jpg por lotes"
steps:
  - name: "Abre tus archivos DNG"
    text: "Entra en el editor y pulsa Open para elegir tus .dng, o Folder en la tira de miniaturas para cargar una carpeta entera. La interfaz está en inglés."
  - name: "Ajusta si lo necesitas"
    text: "Pulsa Auto en la pestaña Adjust o corrige la exposición y el balance de blancos. Si solo quieres convertir, déjalo todo como está."
  - name: "Selecciona las fotos que vas a convertir"
    text: "Pulsa Ctrl/Cmd+A para seleccionar todas las fotos de la tira, o elige algunas con Ctrl/Cmd-clic."
  - name: "Exporta en JPEG"
    text: "Pulsa Export, deja Size en Original, elige JPEG y la calidad, y confirma. Una foto se descarga como JPG; varias, en un único ZIP."
faq:
  - q: "¿Cómo convierto un DNG a JPG gratis?"
    a: "Abre el DNG en Lightframes, en www.lightframes.si/editor, pulsa Export, elige JPEG y confirma. El archivo se revela en tu navegador y se guarda como JPG a resolución completa, sin cuenta, sin marca de agua y sin subirlo."
  - q: "¿Puedo convertir los DNG de mi móvil?"
    a: "Sí. Los móviles que disparan en RAW, como los iPhone, Pixel y Galaxy recientes, guardan archivos DNG, y se abren como cualquier otro DNG. Lightframes también funciona en el navegador del móvil, aunque los lotes grandes van más rápido en un ordenador."
  - q: "¿Puedo convertir los DNG de un dron?"
    a: "Sí. Los drones que disparan en RAW suelen guardar DNG, y esos archivos se convierten igual que los de una cámara."
  - q: "¿Puedo convertir muchos DNG a JPG a la vez?"
    a: "Sí. Abre una carpeta o varios archivos, selecciónalos todos y exporta una sola vez. Cada foto se revela con los mismos ajustes y los JPG se descargan juntos en un ZIP."
  - q: "¿Se suben mis archivos DNG a algún servidor?"
    a: "No. La lectura, la edición y la codificación en JPEG se hacen en tu navegador, en tu propio dispositivo. Tus fotos no se envían a ningún servidor."
  - q: "¿Por qué mi DNG se ve distinto de la foto que hace el móvil?"
    a: "El JPEG o HEIC del móvil lleva su propio procesado: mapeo de tonos, enfoque y reducción de ruido. Un DNG está más cerca de la captura en bruto, así que parte más plano. Pulsa Auto o aplica un preset antes de exportar para conseguir un resultado acabado."
  - q: "¿Y si un DNG no se abre bien?"
    a: "Algunos móviles recientes guardan DNG con tipos de compresión más nuevos que el decodificador incluido puede no leer. En ese caso Lightframes exporta la vista previa JPEG a tamaño completo que va dentro del DNG, en vez de fallar."
updated: 2026-10-27
---

## Qué es un archivo DNG

DNG (Digital Negative) es un formato RAW con especificación pública. En lugar de ser un formato ligado a una marca, describe los datos del sensor y cómo revelarlos en un documento abierto, así que cualquier programa puede leerlo. Algunas cámaras lo usan de serie (Leica, Pentax y Ricoh, entre otras), la mayoría de los móviles que disparan en RAW lo usan, y muchos drones también. Como cualquier RAW, un DNG guarda más detalle que un JPEG, pero casi ninguna web, app de mensajería ni servicio de impresión lo acepta, por eso pasarlo a JPG suele ser el primer paso.

Lightframes es un editor de fotos gratuito y de código abierto que funciona en el navegador. Abre archivos DNG, los revela en tu propio dispositivo y exporta JPG a resolución completa, sin subir nada y sin instalar programas.

## Cómo se convierte un DNG en el navegador

El DNG se decodifica en tu dispositivo con LibRaw, una librería libre de lectura de RAW compilada a WebAssembly:

- **Las miniaturas** salen de la vista previa que va dentro de cada DNG, así que una carpeta entera aparece rápido.
- **La exportación** se revela a partir de los datos de imagen, con el balance de blancos que registra el archivo, y se codifica en JPEG con la calidad que elijas.
- **Plan B.** Si un archivo usa una compresión que el decodificador incluido no lee, Lightframes exporta la vista previa JPEG a tamaño completo que va dentro del DNG.
- **Los archivos se quedan en la pestaña.** Los archivos no se suben nunca y, después de la primera visita, la edición funciona sin conexión.

## Convertir DNG de móvil y de dron

Los DNG de móviles y drones suelen ser más pequeños y con más ruido que los de una cámara, y no llevan el procesado que el dispositivo aplica a sus propios JPEG. Para un resultado acabado:

1. Abre los DNG y pulsa **Auto** en la pestaña Adjust en uno de ellos.
2. Sube un poco **Luminance NR**, en la sección Detail, si las sombras se ven granuladas.
3. Copia la edición (Ctrl/Cmd+C) y pégala (Ctrl/Cmd+V) en las demás fotos de la misma sesión. Más en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes).
4. Selecciónalas todas, pulsa **Export** y elige JPEG. Obtienes un ZIP con un JPG por cada DNG.

## Ajustes de exportación recomendados

| Uso | Size (tamaño) | Formato y calidad |
| --- | --- | --- |
| Archivo o impresión | Original (hasta 8192 px) | JPEG, 95–100 % |
| Correo, web o previsualización para clientes | Web (2048 px) | JPEG, 85–92 % |
| Feed de Instagram | IG 4:5 (1080 × 1350) o IG 1:1 | JPEG, 92 % |
| Archivos lo más ligeros posible | Web (2048 px) | WebP, 80–90 % |

Para conservar los nombres originales, cambia el patrón de nombre a `{name}` en vez del `{name}-edited` que viene por defecto.

## Limitaciones

- **Procesado del dispositivo.** No se reproducen el mapeo de tonos, la fusión de varias tomas ni el enfoque que aplican los móviles a sus propias fotos.
- **Tamaño máximo.** La exportación llega hasta 8192 px en el lado largo.
- **Metadatos.** Los datos EXIF (fecha, cámara, objetivo, GPS) no se copian al JPG.
- **Compresiones nuevas.** Los DNG que la versión de LibRaw incluida no puede leer usan la vista previa incrustada.

Los formatos de marca tienen su propia página: [CR3 a JPG](/es/herramientas/convertir-cr3-a-jpg), [NEF a JPG](/es/herramientas/convertir-nef-a-jpg) y [ARW a JPG](/es/herramientas/convertir-arw-a-jpg). El resto de formatos los tienes en el [conversor de RAW a JPG](/es/herramientas/convertir-raw-a-jpg) y, si además de convertir quieres editar, mira el [editor de fotos RAW](/es/herramientas/editor-fotos-raw).
