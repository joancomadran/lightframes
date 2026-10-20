---
key: presets
slug: presets-fotos
title: "Presets para fotos gratis: importa XMP de Lightroom"
description: "Aplica presets gratis online, también tus .xmp de Lightroom y Camera Raw. Crea los tuyos, ajusta la intensidad e importa LUT .cube sin subir nada a internet."
h1: "Presets para fotos gratis: créalos, impórtalos y aplícalos online"
lead: "Lightframes te deja guardar cualquier edición como preset, aplicarlo a una foto o a toda una selección y regular su intensidad del 0 al 100 %. Puedes importar presets .xmp de Lightroom y Camera Raw, presets JSON y LUT .cube y hacer copia en JSON, gratis en el navegador y sin subir nada."
label: "Presets"
summary: "Guarda tus estilos, importa presets XMP, JSON o .cube y aplícalos con la intensidad que quieras a una o varias fotos."
order: 3
keywords:
  - "presets para fotos gratis"
  - "aplicar preset a foto online"
  - "importar presets xmp"
  - "usar presets xmp sin programas"
  - "usar presets de lightroom online"
  - "presets lightroom gratis online"
  - "alternativa lightroom gratis"
  - "crear preset de fotos"
  - "filtros para fotos gratis"
  - "presets online"
steps:
  - name: "Abre una foto"
    text: "Abre un JPEG, PNG o RAW en el editor. Las miniaturas de la pestaña Presets se generan a partir de esa foto."
  - name: "Aplica o importa un preset"
    text: "En la pestaña Presets pulsa uno de los Filters incluidos, o Import para cargar un archivo .xmp, .json o .cube en My presets."
  - name: "Regula la intensidad"
    text: "Mueve el control Intensity, bajo Applied, entre 0 y 100 % hasta que el efecto tenga la fuerza que buscas."
  - name: "Guarda tu propio estilo"
    text: "Cuando tengas una foto editada, escribe un nombre en el campo Save current edits as… y pulsa Save. Con Update preset with current edits sobrescribes uno que ya tengas."
  - name: "Haz copia de tus presets"
    text: "Pulsa el icono de descarga de un preset para guardarlo en JSON, o Backup para descargar todos tus presets en un único archivo JSON."
faq:
  - q: "¿Puedo usar mis presets de Lightroom en Lightframes?"
    a: "Sí, si son archivos .xmp, el formato en el que Lightroom Classic, Lightroom y Adobe Camera Raw guardan los presets de revelado. Pulsa Import en la pestaña Presets y elige el archivo .xmp. Lightframes lee sus ajustes de revelado y los traslada a sus propios controles: luz, balance de blancos, presencia, curvas, HSL, gradación de color o virado partido, enfoque, ruido, viñeta y grano."
  - q: "¿Un preset XMP importado se verá exactamente igual?"
    a: "Muy parecido, pero no siempre idéntico. Lo que no tiene equivalente aquí, como perfiles de cámara, correcciones de objetivo o máscaras, se ignora, y la temperatura en grados Kelvin solo se puede aproximar."
  - q: "¿Qué hace el control de intensidad?"
    a: "Mezcla entre una edición neutra (0 %) y el preset completo (100 %), incluido el LUT si lo lleva. Si tienes varias fotos seleccionadas, cambia todas a la vez."
  - q: "¿Dónde se guardan mis presets?"
    a: "En el almacenamiento local de tu navegador (IndexedDB, con una copia de respaldo en localStorage). No se sincronizan con ningún servidor, así que usa Backup para tener una copia en JSON o llevarlos a otro navegador."
  - q: "¿Aplicar un preset me cambia el recorte?"
    a: "No. El recorte, el giro, los retoques y el fondo de cada foto se mantienen. El preset sustituye los ajustes de tono y color, y con Remove recuperas los que tenías."
  - q: "¿Trae presets incluidos?"
    a: "Sí, 15 filtros: Vintage, Old Money, Japan Film, Moody Brown, Analog Dreamy, Moody Forest, Teal & Orange, Warm Film, Bright & Airy, Nordic, B&W, B&W Noir, B&W Matte, Sepia y Selenium."
updated: 2026-10-20
---

## Qué son los presets de Lightframes y para quién son

Un preset en Lightframes es un conjunto de ajustes guardado que aplicas a cualquier foto con un clic. Viene bien si quieres un estilo coherente en una sesión o en tu perfil de Instagram, si has comprado o descargado presets de Lightroom (.xmp) y quieres usarlos sin instalar Lightroom ni ningún otro programa, o si solo buscas un filtro rápido para una foto del móvil. El editor es gratuito, de código abierto y funciona en el navegador, así que es una alternativa gratis a Lightroom para aplicar los estilos que ya tienes.

La interfaz del editor está en inglés; en esta página verás los botones con su nombre en pantalla.

## Cómo funcionan y por qué tus archivos no salen de tu equipo

Los presets se aplican en tu propio dispositivo: el editor genera cada miniatura y cada vista previa en local, y no sube ni tus fotos ni tus presets. Los presets que creas se guardan en el almacenamiento IndexedDB del navegador, con una copia de respaldo en localStorage, y el editor pide al navegador que no borre ese espacio automáticamente.

Aplicar un preset no es destructivo. Sustituye los ajustes de tono y color de la foto, respeta su recorte, giro, retoques y fondo, y se puede deshacer. Pulsa **Remove** (o vuelve a pulsar el preset activo) y recuperas la edición que tenías. Si cambias de un preset a otro, el nuevo sustituye al anterior en lugar de sumarse, y Remove te sigue devolviendo a la edición que tenías antes del primero.

## Qué puedes hacer en la pestaña Presets

- **Filters:** 15 estilos incluidos: Vintage, Old Money, Japan Film, Moody Brown, Analog Dreamy, Moody Forest, Teal & Orange, Warm Film, Bright & Airy, Nordic, B&W, B&W Noir, B&W Matte, Sepia y Selenium.
- **Miniaturas en vivo:** cada preset se muestra aplicado a la foto activa.
- **Intensity:** tras aplicar un preset, lo regulas del 0 al 100 %.
- **Save:** guarda la edición actual como preset nuevo en My presets.
- **Update preset with current edits:** sobrescribe el preset aplicado con tus últimos cambios.
- **Varias fotos:** si seleccionas varias en la tira de miniaturas, el preset y su intensidad se aplican a todas (más en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes)).
- **Importar** y **exportar** en los formatos de la tabla.

## Formatos de preset compatibles

| Formato | Importar | Exportar | Notas |
| --- | --- | --- | --- |
| `.json` | Sí | Sí | Un preset o una copia completa con muchos |
| `.xmp` | Sí | No | Ajustes de revelado trasladados a los controles de Lightframes |
| `.cube` | Sí | No | LUT 3D que se aplica después de tus ajustes (ver [aplicar un LUT](/es/herramientas/aplicar-lut-foto)) |

De un archivo XMP, Lightframes lee estos ajustes si están presentes:

- Exposición, contraste, altas luces, sombras, blancos y negros
- Temperatura y matiz (los valores relativos tal cual; los Kelvin, aproximados)
- Intensidad, saturación, textura, claridad y neblina
- Curva de tonos general y curvas de rojo, verde y azul
- Tono, saturación y luminancia HSL de ocho colores
- Ruedas de gradación de color o el antiguo virado partido
- Enfoque y reducción de ruido de luminancia y color
- Viñeta posrecorte y grano

Son los mismos ajustes de revelado que guardan los presets exportados desde Lightroom o Adobe Camera Raw, así que la mayor parte del estilo se conserva. El preset toma el nombre guardado dentro del XMP y, si no lo hay, el nombre del archivo.

Lightroom y Camera Raw son marcas de Adobe. Lightframes es un proyecto independiente de código abierto, sin relación ni respaldo de Adobe.

## Consejos

- Crea los presets sobre una foto bien expuesta: si la foto de origen necesitaba +2 EV, el preset subirá también la exposición de todas las demás.
- En lugar de guardar varias versiones del mismo estilo, usa la intensidad. Un 60 % de un estilo de película fuerte suele bastar.
- Después de aplicar un preset, ajusta exposición y balance de blancos en cada foto. Si el cambio debe valer para todas, usa **Update preset with current edits**.
- Pulsa **Backup** de vez en cuando. Descarga un JSON con fecha y todos tus presets, que puedes volver a importar en otro equipo.

## Limitaciones

- Los presets antiguos de Lightroom en formato `.lrtemplate` no se pueden importar; solo se leen los `.xmp`.
- Importar XMP es una traducción, no una copia: los perfiles de cámara, las correcciones de objetivo, la calibración y las máscaras no se importan, así que algunos estilos cambiarán.
- Se importa un archivo cada vez. Para pasar muchos presets de golpe, usa una copia JSON.
- Los presets viven en un navegador concreto. Si borras los datos del sitio o usas una ventana privada puedes perderlos si no tienes copia.
- Solo se exportan en el formato JSON de Lightframes, no en XMP ni en `.cube`.

Tienes más dudas resueltas en las [preguntas frecuentes](/es/preguntas-frecuentes).
