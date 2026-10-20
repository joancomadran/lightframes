---
key: cr3-to-jpg
slug: convertir-cr3-a-jpg
title: "Convertir CR3 a JPG online gratis y sin subir"
description: "Convierte archivos CR3 de Canon a JPG gratis en el navegador, a resolución completa y por lotes. Sin subir nada, sin registro y sin instalar programas."
h1: "Convertir CR3 de Canon a JPG online y gratis"
lead: "Para convertir un CR3 a JPG, ábrelo en el editor de Lightframes, pulsa Export y elige JPEG. El RAW de tu Canon se revela a partir de los datos del sensor dentro del navegador y se guarda como JPG a resolución completa, de uno en uno o con la carpeta entera. Es gratis, de código abierto y no se sube nada."
label: "CR3 a JPG"
summary: "Pasa archivos CR3 (y CR2) de Canon a JPG a resolución completa en el navegador, de uno en uno o en un ZIP."
order: 1.6
keywords:
  - "convertir cr3 a jpg"
  - "cr3 a jpg online gratis"
  - "pasar cr3 a jpg"
  - "abrir archivo cr3"
  - "convertir raw canon a jpg"
  - "convertir cr3 a jpg por lotes"
  - "cr3 a jpg sin lightroom"
steps:
  - name: "Abre tus archivos CR3"
    text: "Entra en el editor y pulsa Open para elegir tus .cr3, o Folder en la tira de miniaturas para cargar la carpeta de la tarjeta. La interfaz está en inglés."
  - name: "Ajusta si lo necesitas"
    text: "Pulsa Auto en la pestaña Adjust o corrige la exposición y el balance de blancos. Si solo quieres convertir, déjalo todo como está."
  - name: "Selecciona las fotos que vas a convertir"
    text: "Pulsa Ctrl/Cmd+A para seleccionar todas las fotos de la tira, o elige algunas con Ctrl/Cmd-clic."
  - name: "Exporta en JPEG"
    text: "Pulsa Export, deja Size en Original, elige JPEG y la calidad, y confirma. Una foto se descarga como JPG; varias, en un único ZIP."
faq:
  - q: "¿Cómo convierto un CR3 a JPG gratis?"
    a: "Abre el CR3 en Lightframes, en www.lightframes.si/editor, pulsa Export, elige JPEG y confirma. El archivo se revela en tu navegador y se guarda como JPG a resolución completa, sin cuenta, sin marca de agua y sin subirlo."
  - q: "¿Por qué mi ordenador no abre los archivos CR3?"
    a: "CR3 es el formato RAW más reciente de Canon: llegó en 2018 y usa una estructura distinta del antiguo CR2. Los programas y visores del sistema anteriores a esa fecha muchas veces no lo leen. Lightframes decodifica el CR3 con LibRaw compilado a WebAssembly, así que se abre en cualquier navegador moderno."
  - q: "¿Puedo convertir archivos C-RAW (CR3 comprimido)?"
    a: "Los C-RAW también son archivos CR3 y se abren igual. El JPG tendrá el detalle que la cámara conservó al comprimir el archivo."
  - q: "¿Puedo convertir muchos CR3 a JPG a la vez?"
    a: "Sí. Abre una carpeta o varios archivos, selecciónalos todos y exporta una sola vez. Cada foto se revela con los mismos ajustes y los JPG se descargan juntos en un ZIP."
  - q: "¿Se suben mis archivos CR3 a algún servidor?"
    a: "No. La lectura, la edición y la codificación en JPEG se hacen en tu navegador, en tu propio dispositivo. No se envía nada a ningún servidor."
  - q: "¿También convierte CR2?"
    a: "Sí. Los .cr2 de las Canon más antiguas se convierten exactamente igual, y también los RAW de otras marcas; lo tienes en el conversor de RAW a JPG."
  - q: "¿Los colores serán iguales que los JPEG de mi Canon?"
    a: "No del todo. Lightframes usa el balance de blancos de la cámara y un revelado base neutro, pero no aplica los estilos de imagen (Picture Style) de Canon ni las correcciones de objetivo de la cámara. Ajusta los controles o aplica un preset antes de exportar para conseguir el resultado que buscas."
updated: 2026-10-20
---

## Qué es un archivo CR3 y por qué cuesta compartirlo

CR3 es el formato RAW de las cámaras Canon que han salido desde 2018: empezó con la EOS M50 y la EOS R y hoy lo usan toda la gama EOS R sin espejo y las réflex EOS más recientes. Sustituyó al CR2 con una estructura nueva basada en el formato de archivo multimedia base de ISO (ISO BMFF), la misma familia que el MP4 y el HEIF. Es un formato compacto y bien organizado, pero los programas anteriores a 2018 no lo leen, y la mayoría de webs, apps de mensajería y servicios de impresión no aceptan archivos RAW. Pasarlo a JPG resuelve las dos cosas.

Lightframes es un editor de fotos gratuito y de código abierto que funciona en el navegador. Abre archivos CR3 y CR2, los revela en tu propio dispositivo y exporta JPG a resolución completa, sin subir nada y sin instalar programas.

## Cómo se convierte un CR3 en el navegador

El CR3 se decodifica en tu dispositivo con LibRaw, una librería libre de lectura de RAW compilada a WebAssembly que incluye el decodificador de CR3 de Canon:

- **Las miniaturas** salen de la vista previa que Canon guarda dentro de cada CR3, así que una carpeta entera aparece rápido.
- **La exportación** se revela a partir de todos los datos del sensor, con el balance de blancos que registró la cámara, y se codifica en JPEG con la calidad que elijas.
- **Plan B.** Si un archivo no se puede revelar (por ejemplo, de una cámara más nueva que la versión de LibRaw incluida), Lightframes exporta el JPEG a tamaño completo que Canon guardó dentro del CR3.
- **Nada sale de la pestaña.** Los archivos no se suben nunca y, después de la primera visita, el editor funciona sin conexión.

## Convertir una tarjeta entera de CR3

1. Pulsa **Folder** en la tira de miniaturas y elige la carpeta con tus CR3 (en Chrome, Edge o Brave), o pulsa **Open** y selecciónalos.
2. Pulsa **Ctrl/Cmd+A** para seleccionarlos todos.
3. Si quieres aplicar la misma edición a todos, edita una foto, cópiala (Ctrl/Cmd+C) y pégala (Ctrl/Cmd+V) en la selección. Más en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes).
4. Pulsa **Export**, elige JPEG y confirma. Obtienes un ZIP con un JPG por cada CR3.

Cada CR3 se revela a resolución completa, uno detrás de otro, así que una tarjeta grande tarda un rato. Un ordenador aguanta mejor los lotes grandes que un móvil.

## Ajustes de exportación recomendados

| Uso | Size (tamaño) | Formato y calidad |
| --- | --- | --- |
| Archivo o impresión | Original (hasta 8192 px) | JPEG, 95–100 % |
| Correo, web o previsualización para clientes | Web (2048 px) | JPEG, 85–92 % |
| Feed de Instagram | IG 4:5 (1080 × 1350) o IG 1:1 | JPEG, 92 % |
| Archivos lo más ligeros posible | Web (2048 px) | WebP, 80–90 % |

Para conservar los nombres originales, cambia el patrón de nombre a `{name}` en vez del `{name}-edited` que viene por defecto.

## Limitaciones

- **Procesado propio de Canon.** No se aplican los Picture Style, el Digital Lens Optimizer ni otras correcciones de la cámara o del software de Canon.
- **Tamaño máximo.** La exportación llega hasta 8192 px en el lado largo.
- **Metadatos.** Los datos EXIF (fecha, cámara, objetivo, GPS) no se copian al JPG.
- **Cámaras muy recientes.** Los archivos de cámaras más nuevas que la versión de LibRaw incluida usan la vista previa incrustada.

Los demás formatos RAW, como ARW, NEF o DNG, los tienes en el [conversor de RAW a JPG](/es/herramientas/convertir-raw-a-jpg). Si además de convertir quieres editar, mira el [editor de fotos RAW](/es/herramientas/editor-fotos-raw).
