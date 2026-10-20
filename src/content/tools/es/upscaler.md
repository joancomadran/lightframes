---
key: upscaler
slug: ampliar-foto-ia
title: "Ampliar fotos con IA gratis y sin subirlas"
description: "Amplía tus fotos 2× o 4× con IA en el navegador. Real-ESRGAN funciona en tu dispositivo y no sube nada. Gratis, sin registro y hasta 8192 px de lado largo."
h1: "Amplía fotos con IA desde el navegador"
lead: "Lightframes amplía una foto 2× o 4× con un modelo de superresolución por IA al exportarla, y añade detalle nítido en lugar de emborronarla. El modelo funciona en tu dispositivo, así que la foto no se sube a ningún sitio, y es gratis y sin cuenta."
label: "Ampliar con IA"
summary: "Amplía fotos 2× o 4× con Real-ESRGAN en tu propio dispositivo, hasta 8192 px, con tus ajustes ya aplicados."
order: 7
keywords:
  - "ampliar foto con ia"
  - "aumentar resolución de una foto"
  - "mejorar calidad de imagen online gratis"
  - "agrandar foto sin perder calidad"
  - "escalar imagen con ia"
  - "ampliar imagen 4x"
steps:
  - name: "Abre y edita tu foto"
    text: "Entra en el editor, pulsa Open photos y haz los ajustes que quieras. La ampliación se aplica al final, sobre la foto terminada. La interfaz está en inglés."
  - name: "Abre el cuadro de exportación"
    text: "Pulsa Export en la barra superior o Ctrl/Cmd+E. Si quieres ampliar varias fotos, selecciónalas antes en la tira de miniaturas."
  - name: "Deja margen en el tamaño"
    text: "En Size, elige Original o sube Long edge lo suficiente. La ampliación nunca pasa de ese tamaño ni de 8192 px."
  - name: "Activa AI upscale"
    text: "Pon AI upscale en 2× o 4×. La primera vez se descarga un modelo de 5 MB que se queda guardado para las siguientes."
  - name: "Exporta"
    text: "Elige JPEG, PNG o WebP y pulsa Export. Verás el progreso mientras la foto se procesa por bloques."
faq:
  - q: "¿Es gratis ampliar fotos con IA en Lightframes?"
    a: "Sí. Lightframes es gratuito y de código abierto: sin cuenta, sin créditos y sin marca de agua. La ampliación se hace en tu propio dispositivo, así que no hay coste de servidor que repercutir."
  - q: "¿Se suben mis fotos para ampliarlas?"
    a: "No. El modelo Real-ESRGAN (unos 5 MB) se descarga una vez y se ejecuta dentro del navegador. Tu foto se procesa en tu dispositivo y se guarda directamente en tus descargas."
  - q: "¿Hasta qué tamaño puedo ampliar una foto?"
    a: "Hasta 4 veces el tamaño de la foto editada, con un límite de 8192 px en el lado largo y unos 40 megapíxeles en total. El tamaño de exportación que elijas también la limita, así que pon Size en Original si quieres la ampliación completa."
  - q: "¿Por qué mi foto no ha salido más grande?"
    a: "La ampliación se detiene en el tamaño de exportación elegido. Si la foto ya mide lo mismo que Long edge (o que los marcos IG 4:5, IG 1:1 o Story), no hay nada que ampliar y Lightframes se salta ese paso."
  - q: "¿Puedo ampliar muchas fotos a la vez?"
    a: "Sí. Selecciona las fotos en la tira de miniaturas, abre Export y activa AI upscale: se amplían una tras otra y, si son varias, se descargan juntas en un ZIP. Con fotos grandes tarda más, así que un lote de archivos pesados puede llevar un rato."
updated: 2026-10-20
---

## Qué hace el ampliador de fotos con IA

El ampliador con IA hace una foto más grande y le añade detalle fino creíble, de modo que los bordes y las texturas siguen nítidos en lugar de verse blandos o pixelados. Es la herramienta para cuando una foto se te queda pequeña: un recorte muy cerrado que quieres imprimir, una foto antigua de poca resolución, una captura del móvil para usar de fondo de pantalla o una imagen pequeña que te han pasado por mensajería.

En Lightframes, ampliar forma parte de la exportación. Revelas la foto como siempre (exposición, color, recorte, [presets](/es/herramientas/presets-fotos), retoque) y activas **AI upscale** en el cuadro de exportación. La ampliación se aplica al resultado final, así que tus ajustes se amplían junto con la foto.

## Cómo funciona y por qué no se sube nada

Lightframes usa **Real-ESRGAN (general x4v3)**, un modelo abierto de superresolución con licencia BSD-3-Clause, y lo ejecuta dentro de tu navegador. La foto no se envía a ningún sitio: lo único que se descarga es el propio modelo, unos 5 MB, la primera vez que eliges 2× o 4×. Se comprueba con una suma de verificación fija y se guarda en el almacenamiento del navegador, así que las siguientes exportaciones empiezan al momento y funcionan sin conexión.

El modelo usa la tarjeta gráfica mediante WebGPU cuando tu navegador lo permite y, si no, el procesador. Trabaja en bloques de 128 px que se solapan un poco y solo conserva el centro de cada uno, para que no se noten costuras entre bloques. El resultado 4× de cada bloque se reescala directamente al factor que has pedido, lo que ahorra memoria.

Dos detalles hacen que el resultado parezca más natural:

- **Mezcla de textura.** El modelo elimina mucho ruido y eso puede dejar la piel con aspecto de cera. Lightframes mezcla una pequeña parte (20 %) de una ampliación suave normal, para que sobreviva algo de la textura original mientras los bordes siguen nítidos.
- **Respeta la transparencia.** Si la foto tiene el fondo transparente (por ejemplo, después de [quitar el fondo](/es/herramientas/quitar-fondo-foto)), la transparencia se amplía con ella. Exporta en PNG o WebP para conservarla.

## Opciones y límites de tamaño

| Ajuste | Qué significa |
| --- | --- |
| **AI upscale: Off / 2× / 4×** | La ampliación que pides. El 2× se obtiene a partir de la salida 4× del modelo, que conserva más detalle que un reescalado 2× normal. |
| **Size: Original** | Permite hasta 8192 px en el lado largo, así que normalmente se aplica el factor completo. |
| **Size: Web / Long edge** | La ampliación se detiene en ese tamaño. Una foto de 1000 px exportada en Web (2048 px) se amplía unas 2 veces aunque hayas elegido 4×. |
| **IG 4:5, IG 1:1, Story** | La ampliación se detiene en el tamaño del marco (1080 px de ancho) y la foto se encaja en él con borde. |
| **Límites fijos** | 8192 px en el lado largo y unos 40 megapíxeles en total, para no superar lo que el navegador puede tener en memoria. Si la ganancia es menor de 1,1×, el paso se omite. |

Algunos ejemplos, con Size en Original:

- 1200 × 800 a 4× → 4800 × 3200
- 2000 × 1500 a 4× → unos 7300 × 5480 (limitado por los 40 MP)
- Panorámica de 4000 × 1000 a 4× → 8192 × 2048 (limitado por los 8192 px de lado largo)

## Consejos

- **Amplía fotos pequeñas o recortadas.** Es donde más ayuda el modelo. Una foto que ya es grande gana poco y tarda mucho más.
- **No te pases con la reducción de ruido ni el enfoque.** El modelo ya limpia ruido y define bordes; si subes mucho esos ajustes, el resultado puede quedar forzado.
- **Usa PNG o JPEG de alta calidad** para imprimir, para que la compresión no se coma el detalle nuevo.
- **Revisa el tamaño antes.** Si no notas cambio, sube Long edge o elige Original.
- **Hazlo por lotes.** Selecciona varias fotos en la tira de miniaturas y expórtalas juntas; se amplían una tras otra.

## Limitaciones

Un ampliador predice detalle; no puede recuperar lo que la cámara nunca captó. Una cara diminuta y movida no se convierte en un retrato nítido, y un texto ilegible no pasa a leerse. El modelo está entrenado para fotos en general, así que en texturas muy finas, como hojas o pelo, puede dar un ligero aspecto de pintura.

La velocidad depende de tu dispositivo. Con WebGPU en un ordenador reciente va rápido; con el procesador, o en un móvil, una ampliación 4× grande puede tardar, y en equipos antiguos el navegador puede quedarse sin memoria. La primera vez necesitas conexión para descargar el modelo. ¿Más dudas? Consulta las [preguntas frecuentes](/es/preguntas-frecuentes) o [abre el editor](/editor).
