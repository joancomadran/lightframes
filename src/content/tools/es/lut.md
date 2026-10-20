---
key: lut
slug: aplicar-lut-foto
title: "Aplicar un LUT a una foto online gratis"
description: "Aplica LUT .cube a tus fotos online y gratis. Importa un LUT 3D como preset, regula su intensidad del 0 al 100 % y exporta en JPEG, PNG o WebP sin subir nada."
h1: "Cómo aplicar un LUT .cube a una foto online"
lead: "Para aplicar un LUT a una foto, ábrela en Lightframes, pulsa Import en la pestaña Presets y elige tu archivo .cube. El LUT se convierte en un preset que puedes aplicar a una o varias fotos, con la intensidad que quieras, todo dentro del navegador."
label: "Aplicar LUT"
summary: "Importa LUT 3D .cube como presets, aplícalos a fotos o RAW con la intensidad que quieras y exporta el resultado."
order: 4
keywords:
  - "aplicar lut a foto"
  - "aplicar lut online"
  - "lut cube para fotos"
  - "abrir archivo cube online"
  - "usar luts en fotos gratis"
  - "lut 3d foto"
steps:
  - name: "Abre tu foto"
    text: "Abre un JPEG, PNG o RAW de cámara en el editor con Open o Folder."
  - name: "Importa el archivo .cube"
    text: "Ve a la pestaña Presets, pulsa Import y elige un LUT 3D .cube. Aparecerá en My presets con el nombre de su TITLE o del archivo."
  - name: "Aplícalo y regula la intensidad"
    text: "Pulsa el preset del LUT y mueve Intensity, bajo Applied, entre 0 y 100 % para mezclarlo con la foto."
  - name: "Corrige la entrada"
    text: "Ajusta Exposure, el balance de blancos y el resto de controles. Se aplican antes del LUT, así que corriges lo que le llega."
  - name: "Exporta"
    text: "Pulsa Export y elige JPEG, PNG o WebP. Para usar el mismo LUT en otras fotos, selecciónalas y aplica el preset o pega el grupo Look (LUT)."
faq:
  - q: "¿Qué formatos de LUT acepta?"
    a: "LUT 3D en formato de texto .cube, con LUT_3D_SIZE de 2 a 128 y líneas DOMAIN_MIN / DOMAIN_MAX opcionales. Los .cube 1D y otros formatos de LUT no son compatibles."
  - q: "¿En qué momento de la edición se aplica el LUT?"
    a: "Al final, después de todos los ajustes, incluidas las máscaras locales. Así la exposición, el balance de blancos y el color hacen de entrada del LUT, como en una gradación de color normal."
  - q: "¿Puedo suavizar el LUT?"
    a: "Sí. El control Intensity de la pestaña Presets mezcla entre sin LUT (0 %) y el LUT completo (100 %)."
  - q: "¿Aplicar un LUT borra mis ajustes?"
    a: "Sustituye los controles de tono y color por los del preset, que en un .cube importado son neutros; el recorte, el giro, los retoques y el fondo se mantienen. Aplica primero el LUT y ajusta después, o pulsa Remove para recuperar tu edición anterior."
  - q: "¿Funciona con fotos RAW?"
    a: "Sí. El RAW se revela primero y el LUT se aplica a la imagen revelada, tanto en la vista previa como en la exportación a resolución completa."
  - q: "¿Se suben mi LUT o mis fotos a algún sitio?"
    a: "No. El archivo .cube se lee y se aplica en tu navegador, y el LUT se guarda en el almacenamiento local como parte del preset."
updated: 2026-10-20
---

## Qué significa aplicar un LUT en Lightframes

Un LUT (tabla de consulta, *look-up table*) es un archivo que asigna a cada color de entrada un color de salida, y aplicarlo da a una foto una gradación de color completa de un solo paso. Lightframes lee LUT 3D en el formato `.cube`, el mismo de muchos packs de emulación de película y estilos cinematográficos, y te deja aplicarlos a fotografías, también a archivos RAW. Es útil si ya tienes LUT comprados, si haces vídeo y quieres fotos con el mismo color, o si buscas una gradación coherente en toda una serie. El editor es gratuito, de código abierto y funciona en el navegador.

La interfaz del editor está en inglés; los nombres de botones de esta guía son los que verás en pantalla.

## Cómo funciona y por qué todo se queda en tu equipo

El archivo `.cube` lo lee y lo aplica el propio editor en tu navegador, y no se sube ni el LUT ni tus fotos. Al importar un LUT:

1. Lightframes lee el archivo de texto, comprueba que es un LUT 3D y que el número de muestras coincide con `LUT_3D_SIZE`, y reescala los valores si el archivo usa un `DOMAIN_MIN` / `DOMAIN_MAX` propio.
2. Lo guarda como preset en el almacenamiento IndexedDB del navegador, con espacio de sobra para LUT grandes: un cubo de 65 puntos tiene más de 270.000 muestras de color.
3. Al aplicarlo, cada píxel se busca en el cubo con interpolación trilineal. Esto ocurre **después** del resto de ajustes y máscaras, y el control Intensity mezcla el resultado con la imagen sin gradar.

La edición es no destructiva: el LUT queda guardado como ajuste de la foto y el archivo original no cambia.

## Archivos LUT compatibles

| Característica | Compatible |
| --- | --- |
| Tipo de archivo | `.cube` (texto plano) |
| Dimensiones | Solo 3D (`LUT_3D_SIZE`) |
| Tamaño del cubo | De 2 a 128 puntos por eje |
| Dominio | `DOMAIN_MIN` / `DOMAIN_MAX`, normalizado automáticamente |
| Nombre | Se lee de `TITLE "…"`; si no, el del archivo |
| Comentarios | Se ignoran las líneas que empiezan por `#` o `//` |
| No compatible | LUT 1D (`LUT_1D_SIZE`), `.3dl`, `.look`, `.csp` y otros formatos |

Las fotos pueden ser JPEG, PNG o cualquier RAW compatible, y se exportan en JPEG, PNG o WebP.

## Cómo combinar el LUT con tus propios ajustes

Como el LUT va al final del proceso, los controles funcionan como ajustes de entrada:

- **Primero exposición y balance de blancos.** La mayoría de LUT creativos esperan una imagen bien expuesta y neutra.
- **Guarda el estilo combinado.** Cuando los ajustes y el LUT funcionen bien juntos, escribe un nombre en *Save current edits as…* y guárdalo: el nuevo preset incluye tus ajustes y el LUT.
- **Aplícalo a muchas fotos.** Selecciónalas en la tira de miniaturas y pulsa el preset, o copia la edición y pega solo el grupo **Look (LUT)**. Más en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes).
- **Gestiónalos como cualquier preset.** Bórralos con ×, descárgalos en JSON o haz copia de todos con Backup. Más en [presets para fotos](/es/herramientas/presets-fotos).

## Consejos para que quede bien

- Usa LUT pensados para imágenes estándar (Rec.709 / sRGB). Los LUT para convertir vídeo grabado en perfil *log* esperan una imagen plana y en una foto normal dan un contraste exagerado.
- Empieza al 100 % para ver qué hace el LUT y luego bájalo; muchos estilos quedan mejor entre el 50 y el 80 %.
- Si el LUT quema las luces, baja Highlights o Whites antes de reducir la intensidad.
- Revisa los tonos de piel con la comparación antes/después (`\`) cuando uses gradaciones fuertes tipo teal and orange.

## Limitaciones

- Solo acepta `.cube` 3D. Si tu LUT viene en otro formato, conviértelo antes.
- Un LUT por foto: aplicar otro preset con LUT sustituye al anterior, no se suman.
- El LUT se aplica sobre los valores de 8 bits ya revelados, no sobre los datos lineales del RAW.
- No exporta archivos `.cube`; los presets con LUT se exportan en el JSON de Lightframes, que incluye los datos del LUT.
- Aplicar un preset de LUT importado pone los controles de tono y color en neutro, así que aplícalo antes de afinar, no después.

Tienes más información sobre el editor en las [preguntas frecuentes](/es/preguntas-frecuentes).
