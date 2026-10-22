---
key: remove-objects
slug: borrar-objetos-foto
title: "Borrar objetos de una foto online y gratis"
description: "Borra objetos, personas, granos y manchas de polvo de tus fotos en el navegador. Corrector, clonar o borrado con IA: gratis, sin registro y sin subir la foto."
h1: "Borra objetos y manchas de tus fotos"
lead: "Pinta encima de una persona que se ha colado, un cartel, un grano o una mota de polvo del sensor y Lightframes lo rellena con el resto de la imagen. Es gratis, funciona en el navegador y la foto no sale de tu dispositivo."
label: "Borrar objetos"
summary: "Pinta sobre objetos, granos o motas de polvo y rellénalos con corrector, clonado o un modelo de IA en tu dispositivo."
order: 6
keywords:
  - "borrar objetos de una foto"
  - "quitar objetos de una foto online gratis"
  - "borrar personas de una foto"
  - "eliminar manchas de una foto"
  - "quitar granos en fotos"
  - "tampón de clonar online"
  - "borrador mágico fotos gratis"
steps:
  - name: "Abre tu foto"
    text: "Entra en el editor y pulsa Open photos (o Open en la barra superior). Acepta JPEG, PNG y RAW de cámara. La interfaz está en inglés."
  - name: "Ve al panel Retouch"
    text: "Abre la pestaña Retouch. En la sección Spot removal tienes tres modos: Heal (corrector), Clone (clonar) y Remove (borrar con IA)."
  - name: "Elige el modo y el tamaño del pincel"
    text: "Usa Remove para objetos y personas, Heal para granos y polvo, y Clone si quieres una copia exacta. Ajusta Size, Feather y Opacity antes de pintar."
  - name: "Pinta sobre lo que quieras quitar"
    text: "Haz clic para un punto o arrastra para un trazo. Heal y Clone eligen solos de dónde copiar; arrastra el contorno verde o pulsa New source para probar otra zona."
  - name: "Revisa y exporta"
    text: "Pulsa H para ocultar los contornos y juzgar el resultado. Después exporta en JPEG, PNG o WebP."
faq:
  - q: "¿Puedo borrar a una persona de una foto gratis?"
    a: "Sí. En Lightframes elige el modo Remove del panel Retouch y pinta encima de la persona: un modelo de IA rellena la zona a partir de lo que la rodea. Es gratis, no pide cuenta y la foto se procesa en tu dispositivo."
  - q: "¿Qué diferencia hay entre Heal, Clone y Remove?"
    a: "Clone copia píxeles de otra parte de la foto tal cual. Heal también copia, pero ajusta los colores para que el parche se funda con el entorno sin que se note el borde. Remove pide a un modelo de IA que genere contenido nuevo, y es lo mejor para objetos que no tienen una zona limpia que copiar."
  - q: "¿Se sube mi foto cuando uso el borrado con IA?"
    a: "No. El modelo MI-GAN se descarga una sola vez (unos 28 MB) y se ejecuta dentro del navegador. Lo único que viene de internet es el archivo del modelo; tu foto se queda en tu dispositivo."
  - q: "¿Borrar un objeto modifica el archivo original?"
    a: "No. Cada corrección se guarda como un paso editable: puedes seleccionarla, cambiar de dónde copia, su tamaño o eliminarla cuando quieras. El original nunca se toca; el cambio solo queda fijado en la copia que exportas."
  - q: "¿Puedo quitar la misma mota de polvo en toda una serie de fotos?"
    a: "Sí. Copia los ajustes de la foto ya corregida, selecciona las demás en la tira de miniaturas, usa Paste edits y marca Spot removal. Las correcciones se colocan en la misma posición en cada foto, así que funciona sobre todo con el polvo del sensor, que sale siempre en el mismo sitio."
updated: 2026-10-20
---

## Para qué sirve borrar objetos de una foto

El borrador de objetos de Lightframes te permite quitar lo que sobra en una foto pintando encima. Está pensado para los arreglos de todos los días: el turista que cruza tu paisaje, una papelera o un cartel en el borde del encuadre, un cable que atraviesa el cielo, granos e imperfecciones en un retrato o esas motas de polvo que un sensor sucio deja en el mismo sitio en cada disparo.

Está dentro del mismo editor que usas para la exposición, el color y los presets, así que retocas y revelas la foto en un solo sitio. Si disparas en RAW, abres el archivo directamente: la eliminación de manchas funciona igual con los archivos del [editor de fotos RAW](/es/herramientas/editor-fotos-raw) que con un JPEG.

## Cómo funciona y qué pasa con tu foto

Todo el trabajo se hace en tu navegador: la foto nunca se envía a ningún servidor. Lightframes lee el archivo de tu disco, lo edita en memoria y guarda el resultado en tu carpeta de descargas cuando exportas. No hay cuenta ni almacenamiento en la nube.

Cada modo usa una técnica distinta:

| Modo | Qué hace | Ideal para |
| --- | --- | --- |
| **Heal** (corrector) | Copia una zona cercana y la ajusta para que los colores encajen exactamente en el borde (clonado sin costuras) | Granos, motas de polvo, marcas pequeñas sobre fondos uniformes |
| **Clone** (clonar) | Copia una zona cercana tal cual, con el borde suavizado | Texturas que se repiten, o cuando quieres una copia exacta |
| **Remove** (borrar con IA) | Un modelo de relleno con IA (MI-GAN, licencia MIT) genera píxeles nuevos a partir de lo que rodea la zona pintada | Personas, objetos, carteles, cualquier cosa sin una zona limpia que copiar |

En Heal y Clone, Lightframes elige solo la zona de origen buscando la que mejor encaja alrededor. Si no acierta, arrastra el contorno verde a otro sitio o pulsa **New source** (atajo `/`) para probar la siguiente opción.

Remove necesita el modelo la primera vez que lo eliges. Se descarga una sola vez de Hugging Face (unos 28 MB), se comprueba con una suma de verificación fija y se guarda en el almacenamiento del navegador, así que en las siguientes sesiones arranca al momento, incluso sin conexión. El modelo se ejecuta en el procesador de tu dispositivo, en segundo plano, para que el editor no se quede bloqueado mientras rellena. La foto no forma parte de esa descarga.

## Controles

- **Size**: radio del pincel, de 0,2 a 10 (porcentaje del lado largo de la foto).
- **Feather**: suavidad del borde, de 0 a 100 % (30 % por defecto).
- **Opacity**: cuánto tapa la corrección al original, de 5 a 100 %.
- **Show spots** (`H`): muestra u oculta los contornos para valorar el resultado.
- **Clear all**: quita todas las correcciones de la foto.
- **Delete spot** (`Supr`): quita solo la corrección seleccionada.

Todas las correcciones siguen siendo editables. Haz clic en una para seleccionarla y cambia sus controles, su origen o elimínala. Deshacer y rehacer funcionan como siempre.

## Consejos para que no se note

- **Pinta un poco más allá del borde** de lo que quieres quitar. Las sombras y los bordes difusos delatan el objeto si se quedan.
- **Mejor varios trazos pequeños** que uno enorme. Cada zona de Remove se rellena después de las anteriores, así que las siguientes parten de una imagen más limpia.
- **Heal para piel y cielo, Remove para objetos.** Heal conserva la textura real de la foto; Remove inventa contenido, que es justo lo que necesitas cuando no hay nada aprovechable que copiar.
- **Revisa al 100 %** con los contornos ocultos antes de exportar.
- **¿Tienes que limpiar una sesión entera?** Corrige una foto y pega sus ajustes con Spot removal marcado. Es lo mismo que [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes) con cualquier otro ajuste.

## Limitaciones

El modelo de Remove es rápido y privado, pero no hace milagros. Trabaja sobre un recorte alrededor de cada zona de como máximo 1024 px en su lado largo (internamente a 512 px), así que un borrado muy grande en una foto de mucha resolución puede verse más blando que el resto. Funciona mejor sobre fondos como césped, cielo, paredes, arena o agua, y peor cuando la zona oculta tiene mucha estructura, como las líneas rectas de un edificio o un texto.

Heal y Clone solo pueden copiar lo que ya hay en el encuadre. En una foto muy cargada sin zonas limpias cerca, quizá tengas que probar varios orígenes o pasarte a Remove.

La primera vez que usas Remove necesitas conexión para descargar el modelo de Hugging Face; tus fotos no salen de tu dispositivo. Después funciona sin internet. Si tienes dudas sobre privacidad, formatos o cómo instalar la app, consulta las [preguntas frecuentes](/es/preguntas-frecuentes), o [abre el editor](/editor) y pruébalo con tu propia foto.
