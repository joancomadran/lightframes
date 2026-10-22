---
key: background-remover
slug: quitar-fondo-foto
title: "Quitar el fondo de una foto gratis"
description: "Quita el fondo de una foto gratis con IA en tu propio equipo. Exporta un PNG transparente, pon un color sólido o desenfoca el fondo, sin subir la foto."
h1: "Quitar el fondo de una foto gratis, sin subirla a internet"
lead: "Abre la foto en Lightframes, ve a la pestaña Retouch y pulsa Remove en el apartado Background: un modelo de IA que funciona en tu navegador detecta el sujeto y lo recorta sobre fondo transparente. También puedes cambiar el fondo por un color o desenfocarlo, y la foto nunca se sube."
label: "Quitar fondo"
summary: "Recorta el sujeto con IA en tu dispositivo y exporta un PNG transparente, un fondo de color o un fondo desenfocado."
order: 5
keywords:
  - "quitar fondo foto gratis"
  - "eliminar fondo de una imagen"
  - "quitar fondo sin subir la foto"
  - "fondo transparente png"
  - "cambiar fondo de una foto"
  - "desenfocar fondo foto online"
  - "quitar fondo con ia"
steps:
  - name: "Abre tu foto"
    text: "Abre un JPEG, PNG o RAW en el editor y selecciónalo en la tira de miniaturas."
  - name: "Elige qué hacer con el fondo"
    text: "En la pestaña Retouch, apartado Background, pulsa Remove para dejarlo transparente, Color para un color sólido o Blur para desenfocarlo. La primera vez se descarga el modelo (45 MB, una sola vez)."
  - name: "Retoca los bordes si hace falta"
    text: "En Fix the cutout pulsa Brush. Pinta con Keep para recuperar partes del sujeto o con Erase para quitar restos de fondo, ajustando el tamaño con Size."
  - name: "Exporta"
    text: "Pulsa Export. Con Remove, si eliges JPEG se guarda automáticamente como PNG para conservar la transparencia; PNG y WebP la mantienen."
faq:
  - q: "¿Es gratis de verdad?"
    a: "Sí. Lightframes es gratuito y de código abierto (licencia MIT). No hay créditos, ni registro, ni marca de agua, ni una versión de pago con más calidad: todo el mundo usa la misma herramienta."
  - q: "¿Se sube mi foto para quitar el fondo?"
    a: "No. El modelo de IA se descarga en tu navegador y se ejecuta en tu propio dispositivo. La foto no se envía a ningún servidor."
  - q: "¿Qué modelo de IA usa?"
    a: "IS-Net (versión de uso general) del proyecto DIS, con licencia Apache-2.0, cuantizado a 8 bits para que la descarga ocupe 45 MB. Se ejecuta con ONNX Runtime Web en un proceso en segundo plano."
  - q: "¿Funciona sin conexión?"
    a: "Sí, a partir del primer uso. El modelo se descarga una vez, se verifica con un hash SHA-256 y se guarda en la caché del navegador, así que después no necesitas internet."
  - q: "¿Cómo consigo un PNG con fondo transparente?"
    a: "Elige Remove en Background y exporta. Si el formato está en JPEG, Lightframes guarda un PNG porque JPEG no admite transparencia. Usa el tamaño Original, Web o uno a medida; los tamaños fijos para redes añaden un borde de color."
  - q: "¿Puedo quitar el fondo de varias fotos a la vez?"
    a: "Sí. Elige el modo en una foto, copia la edición, selecciona las demás y pega con el grupo Background marcado. Cada foto detecta su propio sujeto al previsualizarla o exportarla."
updated: 2026-10-20
---

## Qué hace esta herramienta y para quién es

La herramienta para quitar fondos de Lightframes separa el sujeto principal de una foto de su fondo y te deja hacerlo transparente, cambiarlo por un color sólido o desenfocarlo. Viene bien para fotos de producto con fondo limpio, fotos de perfil, recortes para diseños o pegatinas, o para dar un efecto de poca profundidad de campo a una foto del móvil. A diferencia de muchas webs para quitar fondos, no pide registro ni créditos y no envía tu foto a ningún sitio. Además forma parte de un editor completo, así que puedes ajustar la exposición y el color sin cambiar de herramienta.

La interfaz del editor está en inglés; en esta guía verás los botones con el nombre que tienen en pantalla.

## Cómo funciona la IA en tu dispositivo

El sujeto lo detecta un modelo de IA que se ejecuta en tu navegador, con el procesador de tu equipo, así que la foto no sale de tu ordenador o tu móvil. Paso a paso:

1. La primera vez que eliges un modo de fondo, el editor descarga el modelo de segmentación **IS-Net** (45 MB). La descarga se comprueba con un hash SHA-256 y se guarda en la caché del navegador, así que solo ocurre una vez.
2. El modelo se ejecuta con ONNX Runtime Web dentro de un Web Worker, de modo que el editor sigue respondiendo mientras trabaja. Analiza la foto reducida a 1024 × 1024 y devuelve una máscara del sujeto.
3. Lightframes limpia la máscara: elimina las motas sueltas que el modelo a veces deja en fondos complicados y mantiene un margen suave para que el pelo y los bordes difusos no se corten.
4. La máscara se calcula una vez por foto y se reutiliza en la vista previa, en la exportación y con cualquier recorte, así que cambiar el encuadre no vuelve a lanzar el modelo.

Tras esa primera descarga, quitar fondos funciona sin conexión. La edición es no destructiva: el archivo original no se toca y si vuelves a **Original** recuperas la foto tal cual.

## Modos de fondo y opciones

| Modo (en pantalla) | Resultado | Opciones |
| --- | --- | --- |
| Original | La foto sin cambios | — |
| Remove | Sujeto sobre transparencia | Se exporta en PNG (o WebP) |
| Color | Sujeto sobre un color sólido | Blanco, blanco roto, negro, azul claro o cualquier color |
| Blur | Fondo original desenfocado | Amount de 0 a 100 |

En cuanto eliges un modo distinto de Original aparece **Fix the cutout**:

- **Brush** activa un pincel para retocar el recorte pintando sobre la foto.
- **Keep** recupera partes del sujeto que se han quedado fuera, como una mano o el borde de un producto.
- **Erase** borra restos de fondo que el modelo ha conservado.
- **Size** cambia el tamaño del pincel y **Reset** deshace todos los retoques del pincel.

La misma detección del sujeto se usa en la máscara **Subject** de la pestaña Local, para aclarar o cambiar el color solo del sujeto sin quitar el fondo.

## Consejos para un recorte limpio

- Funciona mejor con un único sujeto claro sobre un fondo que se distinga bien.
- Edita la exposición y el color como siempre: se aplican al sujeto y, en modo Blur, también al fondo.
- Para fotos de producto tipo tienda online, usa **Color** con blanco y exporta en tamaño Web.
- Si vas a aplicarlo a varias fotos, pega el ajuste Background **antes** de usar el pincel: los retoques se copian también y solo encajan en la foto donde los pintaste.
- Si solo quieres eliminar un elemento que molesta, usa [borrar objetos de una foto](/es/herramientas/borrar-objetos-foto). Para agrandar un recorte pequeño, prueba [ampliar una foto con IA](/es/herramientas/ampliar-foto-ia).

## Limitaciones

- El modelo ve la foto a 1024 × 1024, así que en fotos muy grandes los detalles finos, como pelos sueltos, se aproximan y a veces hay que retocarlos con el pincel.
- Detecta el sujeto más destacado. Los grupos, las escenas muy cargadas o los sujetos que se confunden con el fondo pueden necesitar retoques a mano.
- Funciona con el procesador, así que en un móvil lento la primera detección puede tardar.
- El primer uso necesita conexión para descargar los 45 MB, y si borras los datos del sitio el modelo se vuelve a descargar.
- Los tamaños fijos de exportación para redes (IG 4:5, IG 1:1, Story) añaden un borde de color; para un archivo transparente usa Original, Web o un tamaño a medida.

Tienes más respuestas sobre privacidad, uso sin conexión y navegadores compatibles en las [preguntas frecuentes](/es/preguntas-frecuentes).
