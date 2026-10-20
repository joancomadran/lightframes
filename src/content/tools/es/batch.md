---
key: batch
slug: editar-fotos-por-lotes
title: "Editar fotos por lotes online gratis"
description: "Edita fotos por lotes gratis desde el navegador: copia y pega ajustes, sincroniza una selección y exporta todo en un ZIP. Sin subir fotos y sin registrarte."
h1: "Editar fotos por lotes: copia los ajustes y exporta muchas a la vez"
lead: "Con Lightframes editas una foto, copias sus ajustes a todas las que selecciones y las exportas de una vez en un ZIP. Es gratis, funciona en el navegador con RAW y JPEG y no sube nada a ningún servidor."
label: "Edición por lotes"
summary: "Copia y pega ajustes entre fotos, aplica presets a una selección y exporta todo en un único ZIP."
order: 2
keywords:
  - "editar fotos por lotes"
  - "editar varias fotos a la vez"
  - "aplicar los mismos ajustes a varias fotos"
  - "copiar ajustes entre fotos"
  - "editor de fotos por lotes gratis"
  - "exportar fotos en lote"
  - "sincronizar ajustes fotos"
steps:
  - name: "Abre las fotos"
    text: "Pulsa Open en el editor y elige varios archivos, o usa Folder en la tira de miniaturas para cargar una carpeta de JPEG, PNG o RAW."
  - name: "Edita una foto"
    text: "Elige una foto representativa de la serie y ajústala hasta que te guste."
  - name: "Copia y selecciona el resto"
    text: "Pulsa Ctrl/Cmd+C (Copy edits). Después selecciona las demás con Ctrl/Cmd+clic, Mayús+clic para un rango o Ctrl/Cmd+A para todas."
  - name: "Pega solo lo que quieras"
    text: "Pulsa Ctrl/Cmd+V (Paste edits), marca los grupos que quieres copiar, por ejemplo Light, White balance o HSL, y pulsa Paste."
  - name: "Exporta la selección"
    text: "Con las fotos aún seleccionadas, pulsa Export. Eliges tamaño y formato una sola vez y todas se descargan juntas en un archivo ZIP."
faq:
  - q: "¿Puedo copiar solo algunos ajustes, como el balance de blancos?"
    a: "Sí. El cuadro Paste edits separa los ajustes por grupos (luz, balance de blancos, presencia, curva, HSL, gradación de color, detalle, viñeta y grano, LUT, máscaras, recorte, retoque y fondo) y solo se pegan los que marques."
  - q: "¿Por qué el recorte, las máscaras y el retoque vienen desmarcados?"
    a: "Porque dependen del encuadre y del contenido de la foto original, y al pegarlos en otra suelen quedar mal. Puedes marcarlos si las fotos son iguales, y la próxima vez se recuerda tu elección."
  - q: "¿Cómo sincronizo ajustes sin copiar antes?"
    a: "Selecciona varias fotos, deja activa la que has editado y pulsa Paste edits sin haber copiado nada: sus ajustes se pegan en el resto de la selección."
  - q: "¿Cuántas fotos puedo exportar de golpe?"
    a: "No hay un límite fijo: todas las fotos seleccionadas se exportan con las mismas opciones y se empaquetan en un ZIP. Con muchos RAW tarda más porque cada uno se revela a resolución completa, y el límite real es la memoria de tu equipo."
  - q: "¿Se puede deshacer un pegado?"
    a: "Sí. Cada foto tiene su propio historial, así que Ctrl/Cmd+Z le devuelve los ajustes que tenía."
  - q: "¿Se suben mis fotos para procesarlas?"
    a: "No. Toda la edición y la exportación ocurre en tu navegador, en tu propio dispositivo, sin enviar nada a ningún servidor."
updated: 2026-10-20
---

## Para qué sirve editar fotos por lotes en Lightframes

Editar por lotes en Lightframes es retocar una foto y aplicar esos mismos ajustes a muchas otras, para después exportarlas todas juntas. Es útil cuando tienes una serie parecida: una boda o un evento, fotos de producto con la misma luz, las fotos de un viaje al atardecer o una tanda que quieres publicar con el mismo estilo. Funciona con JPEG, PNG y RAW de cámara, en el navegador, y es gratuito y de código abierto.

La interfaz del editor está en inglés, así que en esta guía verás los botones con el nombre que tienen en pantalla.

## Cómo funciona y dónde se quedan tus fotos

Todo el proceso ocurre en tu dispositivo: las fotos se leen, se editan y se codifican dentro del navegador, con WebAssembly para los RAW y Web Workers para el procesado, y no se sube nada. La edición es no destructiva: cada foto guarda sus ajustes y los archivos nuevos solo se crean al exportar, así que los originales no cambian. Las fotos abiertas y sus ajustes se guardan en el almacenamiento local del navegador, de modo que si recargas la página recuperas el lote. Tras la primera visita, el editor también funciona sin conexión.

## Tres formas de aplicar ajustes a muchas fotos

### Copiar y pegar

**Copy edits** (Ctrl/Cmd+C) copia los ajustes de la foto activa. **Paste edits** (Ctrl/Cmd+V) abre un cuadro que los aplica a todas las fotos seleccionadas, menos a la de origen. Tú decides qué grupos se pegan:

| Grupo (en pantalla) | Qué incluye |
| --- | --- |
| Light | Exposición, contraste, altas luces, sombras, blancos, negros |
| White balance | Temperatura y matiz |
| Presence | Textura, claridad, neblina, intensidad, saturación |
| Tone curve | Curva general y curvas RGB |
| HSL | Tono, saturación y luminancia de ocho colores |
| Color grading | Ruedas de sombras, medios tonos, luces y global |
| Detail | Enfoque y reducción de ruido |
| Vignette & grain | Viñeta y grano |
| Look (LUT) | Un LUT `.cube` y su intensidad |
| Masks* | Ajustes locales |
| Crop & rotate* | Recorte, enderezado y giro |
| Spot removal* | Puntos de corrección y clonado |
| Background* | Modo de eliminación de fondo |

\*Desmarcados por defecto, porque dependen del encuadre de la foto original. Los botones **All**, **None** y **Defaults** agilizan la selección, y el cuadro recuerda lo que marcaste la última vez.

### Sincronizar desde la foto activa

Si no has copiado nada, Paste edits toma como origen la foto activa. Selecciona un grupo de fotos, pulsa en la que has editado para que quede activa y pega: sus ajustes pasan al resto.

### Presets sobre una selección

Si aplicas un preset desde la pestaña Presets, se aplica a todas las fotos seleccionadas, y el control Intensity (0–100 %) las ajusta a la vez. Más detalles en [presets para fotos](/es/herramientas/presets-fotos).

## Seleccionar y ordenar las fotos

- **Clic** en una miniatura para activarla; **Ctrl/Cmd+clic** la añade o la quita de la selección; **Mayús+clic** selecciona un rango.
- **Ctrl/Cmd+A** selecciona todas las fotos.
- En pantallas táctiles, **mantén pulsada** una miniatura para seleccionar varias.
- Puntúa con **1–5**, marca con **P** (elegida), **X** (descartada) o **U** (sin marca) y filtra la tira para ver solo las elegidas o las de cierta puntuación.

## Exportación por lotes

Con varias fotos seleccionadas, Export aplica las mismas opciones a todas:

- Formato **JPEG**, **PNG** o **WebP**, con calidad de 50 a 100 en JPEG y WebP.
- Tamaño: Original (hasta 8192 px), Web (2048 px de lado largo), IG 4:5 (1080 × 1350), IG 1:1 (1080 × 1080), Story (1080 × 1920) o un lado largo a medida.
- Patrón de nombre como `{name}-edited`, marca de agua de texto opcional y ampliación con IA opcional.

Una sola foto se descarga tal cual; varias se descargan en un único ZIP, sin que el navegador lance decenas de descargas. Si quieres montar un carrusel con la misma serie, prueba el [creador de carruseles para Instagram](/es/herramientas/carrusel-instagram).

## Consejos

- Usa como origen una foto representativa: exposición media y balance de blancos típico de la serie.
- En series variadas, pega solo los grupos globales (luz, balance de blancos, color) y retoca la exposición foto a foto.
- Guarda el resultado como preset para empezar la siguiente sesión desde ahí.

## Limitaciones

- La exportación va foto a foto dentro de la pestaña. Un lote grande de RAW puede tardar varios minutos y la pestaña debe seguir abierta hasta que se descargue el ZIP.
- Los lotes muy grandes dependen de la memoria del equipo; un ordenador los lleva mejor que un móvil.
- Abrir una carpeta entera requiere un navegador basado en Chromium (Chrome, Edge, Brave). En los demás puedes elegir muchos archivos a la vez con Open.
- Pegar no adapta los ajustes a cada foto: si la exposición cambia mucho dentro de la serie, corrige esas fotos una a una después.

Tienes más respuestas sobre privacidad, uso sin conexión y navegadores en las [preguntas frecuentes](/es/preguntas-frecuentes).
