---
key: film-look
slug: efecto-analogico-fotos
title: "Cómo dar efecto analógico a tus fotos"
description: "Consigue un efecto analógico de verdad en tus fotos digitales: negros lavados, luces suaves, color de carrete y grano. Paso a paso, gratis y en el navegador."
h1: "Cómo dar a tus fotos digitales un efecto analógico, de carrete"
published: 2026-10-22
author: Joan Comadran
tags: ["film", "guias"]
tools: ["presets", "lut", "raw-editor", "batch"]
keywords:
  - efecto analógico fotos
  - cómo editar fotos estilo analógico
  - efecto película fotos
  - editar fotos estilo film gratis
  - añadir grano a una foto online
  - efecto vintage fotos
  - efecto carrete fotos
---

**En resumen:** el aspecto de carrete sale de cuatro cambios, por este orden: levantar los negros para que nada sea negro puro, suavizar las luces, mover el color (sombras y luces más cálidas, verdes y azules más apagados, algo menos de saturación) y añadir un grano fino. En [Lightframes](/editor) eso está en la pestaña **Curve** (o la curva **Matte**), en **Adjust**, en **Color** y en **Effects → Grain**. Si quieres ir rápido, aplica el filtro **Warm Film**, **Japan Film** o **Analog Dreamy** y bájale la intensidad. Es gratis y la foto no sale de tu dispositivo.

## ¿Qué hace que una foto parezca de carrete?

El grano solo no basta: si lo pones sobre una foto digital nítida y con mucho contraste, parece ruido. El efecto analógico es un conjunto de rasgos que van juntos:

| Rasgo del carrete | Lo que hace el digital | Dónde se corrige en Lightframes |
| --- | --- | --- |
| Negros que se quedan en gris oscuro (sombras lavadas, mate) | Negro puro en las zonas más oscuras | **Curve**: sube el punto de abajo a la izquierda o elige **Matte** |
| Luces que se queman con suavidad | Blanco recortado de golpe | **Adjust → Light**: baja **Highlights** y **Whites** |
| Contraste general más bajo | El contraste fuerte que sale de la cámara | **Adjust → Light**: baja **Contrast** y añade una S suave en **Curve** |
| Dominantes de color distintas en sombras y luces | Color neutro y uniforme | **Color → Color grading**: Shadows, Mids, Highs |
| Verdes y azules más tranquilos, piel cálida | Todos los colores igual de saturados | **Color → Color mixer** (HSL) y **Saturation** a la baja en **Adjust** |
| Menos nitidez "digital" | Mucho enfoque y microcontraste | **Adjust → Presence**: baja **Clarity**; **Sharpening** bajo |
| Grano visible | Superficies limpias y lisas | **Effects → Grain**: Amount y Size |

Cada paso de abajo corresponde a una fila. Sigue este orden: el tono cambia cómo percibes el color, y el grano va siempre al final.

## ¿Cómo se consigue el efecto analógico en Lightframes, paso a paso?

Abre el [editor](/editor), pulsa **Open** y elige una foto. Lo ideal es partir de un RAW, porque tiene más margen en luces y color (lo contamos en [cómo editar fotos RAW en el navegador](/es/blog/editar-fotos-raw-en-el-navegador)), pero también vale un JPEG o un PNG. La interfaz está en inglés, así que te dejamos los nombres tal como aparecen en pantalla.

1. **Ajusta la exposición base.** En **Adjust → Light**, deja bien el brillo con **Exposure** antes de nada. Un efecto de carrete sobre una foto oscura y subexpuesta solo queda sucio.
2. **Baja el contraste.** Lleva **Contrast** a algún punto entre −10 y −30. Los filtros de película que trae la app se mueven por ahí: Warm Film usa −10 y Japan Film llega a −40.
3. **Suaviza las luces.** Baja **Highlights** (entre −20 y −30, más o menos) y, si el cielo o la piel siguen viéndose duros, también **Whites**. Pulsa **J** para ver las zonas recortadas y baja hasta que el aviso desaparezca de lo que debería conservar detalle.
4. **Lava los negros.** Abre la pestaña **Curve** y pulsa **Matte**: sube el negro hasta un gris de alrededor del 10% y baja un poco el blanco. Si quieres más control, arrastra hacia arriba el punto inferior izquierdo de la curva RGB: si lo subes poco, el lavado es suave; si lo subes mucho, la foto queda neblinosa. Haz clic sobre la curva para añadir puntos y dibuja una S suave en los medios tonos si la imagen se ha quedado plana. Con doble clic eliminas un punto.
5. **Caliéntala un poco.** Vuelve a **Adjust → Color**, sube un poco **Temperature** (el filtro Warm Film usa +12) y baja ligeramente **Saturation** (de −5 a −20). **Vibrance** puedes dejarlo como está o subirlo un pelín para que la piel no pierda vida.
6. **Separa el color por tonos.** En **Color → Color grading**, elige **Shadows** y lleva la rueda hacia ámbar o hacia verde azulado, con poca saturación. Haz lo mismo en **Highs**, normalmente hacia un amarillo anaranjado cálido. Con **Mids** ve con cuidado, porque ahí está la piel. **Blending** controla cuánto se solapan las zonas y **Balance** desplaza el reparto hacia las sombras o hacia las luces.
7. **Apaga los verdes y los azules.** En **Color → Color mixer**, baja la saturación de **Greens**, **Aquas** y **Blues**. Llevar un poco el tono del verde hacia el amarillo es un clásico del carrete, y es lo que separa un efecto analógico de una foto del móvil con filtro.
8. **Quítale el filo digital.** En **Adjust → Presence**, baja un poco **Clarity** (de −10 a −20). Lightframes empieza con **Sharpening** a 0; para este estilo, mejor dejarlo bajo.
9. **El grano, al final.** En **Effects → Grain**, pon **Amount** más o menos entre 15 y 30 y ajusta **Size**. El grano de Lightframes es monocromo, se nota menos en las sombras profundas y en las luces más brillantes, como suele pasar con el de verdad, y su tamaño va en proporción a la imagen, así que lo que ves en pantalla coincide con la exportación a resolución completa.
10. **Viñeta, si te gusta.** En **Effects → Vignette**, un **Amount** ligeramente negativo (de −5 a −15) oscurece las esquinas como un objetivo antiguo. **Midpoint** decide hasta dónde entra.

Pulsa **\\** para compararla con el original y exporta con **Ctrl/Cmd+E** en JPEG, PNG o WebP.

## Más rápido: parte de un filtro de película o de una LUT

Si no quieres montar el estilo desde cero, en la pestaña **Presets** hay filtros de solo lectura pensados a partir de rasgos del carrete:

- **Warm Film:** película de retrato cálida y con poco contraste, negros levantados y algo de grano.
- **Japan Film:** lavado, luces que tiran a frío, verdes y azules apagados y más grano.
- **Analog Dreamy:** suave y neblinoso, con negros lavados y una gradación de color discreta.
- **Vintage:** negros levantados, blancos suavizados y medios tonos cálidos.
- **B&W Matte:** blanco y negro con los negros levantados y un grano más gordo.

Haz clic en un filtro y baja **Intensity**; muchas fotos quedan mejor entre el 50% y el 80%. El filtro sustituye los ajustes de tono y color, así que aplícalo primero y retoca después. El recorte y los retoques se mantienen.

Si tienes LUTs de emulación de película, importa el archivo `.cube` desde **Presets → Import**. La LUT se aplica después del resto de ajustes, de modo que la exposición y el balance de blancos le sirven de punto de partida. En [aplicar una LUT a una foto](/es/herramientas/aplicar-lut-foto) tienes qué archivos funcionan.

## ¿Cómo mantienes el mismo estilo en toda una serie?

El efecto analógico luce de verdad cuando una serie o tu feed parecen hechos con el mismo carrete:

- **Guárdalo como preset.** Escribe un nombre en **Save current edits as…** en la pestaña Presets y la próxima vez lo tendrás a un clic. Más en [presets para fotos](/es/herramientas/presets-fotos).
- **Pégalo en el resto.** Copia los ajustes con **Ctrl/Cmd+C**, selecciona las demás fotos en la tira de miniaturas y pega con **Ctrl/Cmd+V**. En el cuadro de pegado eliges los grupos, así que puedes llevarte **Tone curve**, **HSL**, **Color grading** y **Vignette & grain** sin tocar el recorte ni la **Light** y el **White balance** de cada foto. Lo explicamos en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes).
- **Corrige la exposición y el balance de blancos de cada foto por separado.** Un preset no sabe que una toma se hizo a la sombra. Ajusta la entrada y conserva el estilo.

## Errores habituales

- **Pasarse con el grano.** Si lo primero que ves es el grano, sobra. Baja **Amount** antes que **Size**.
- **Lavar los negros y volver a hundirlos.** Subir **Contrast** o bajar **Blacks** después de la curva mate deshace el lavado. El contraste, mejor en los medios tonos de la curva.
- **Teñir demasiado la piel.** Mucho color en **Mids** pone las caras verdes o naranjas. Revísalo con el antes y el después.
- **Usar en fotos LUTs de vídeo log a Rec.709.** Están hechas para imágenes log muy planas y, sobre una foto normal, el contraste se dispara.

## Preguntas frecuentes

**¿Puedo añadir halation o bloom?**
Lightframes no tiene un control específico de halation ni de bloom. El resto del efecto (lavado, color, grano y viñeta) lo consigues con los pasos de arriba.

**¿Puedo usar los presets de película que ya tengo?**
Si son presets `.xmp` de Lightroom o Camera Raw, sí: impórtalos en la pestaña Presets y Lightframes traslada sus ajustes de revelado a sus propios controles, incluidas las curvas, la gradación de color y el grano. Los perfiles de cámara, las correcciones de objetivo y las máscaras no se importan, así que algunos estilos cambiarán un poco. Lightroom y Camera Raw son marcas de Adobe; Lightframes es un proyecto independiente sin relación con Adobe. Tienes los detalles en [presets para fotos](/es/herramientas/presets-fotos).

**¿Funciona en el móvil?**
Sí, el editor funciona en móviles y tabletas, y los filtros de película y el grano van igual. Con RAW grandes se trabaja más cómodo en un portátil.

**¿Es gratis? ¿Se sube mi foto a algún sitio?**
Es gratis, sin cuenta, y no se sube nada: la foto se edita y se exporta dentro de tu navegador. Lightframes es código abierto con licencia MIT ([GitHub](https://github.com/joancomadran/lightframes)).

¿Lo pruebas? [Abre el editor](/editor), carga una foto y empieza por la curva **Matte**.
