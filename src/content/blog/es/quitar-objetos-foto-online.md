---
key: remove-objects-guide
slug: quitar-objetos-foto-online
title: "Cómo quitar objetos de una foto online gratis (sin subirla)"
description: "Quita objetos, personas y manchas de tus fotos online y gratis en el navegador. Corrector, clonar o borrado con IA en Lightframes, sin subir la foto."
h1: "¿Cómo quitar objetos de una foto online gratis sin subir la imagen?"
published: 2026-11-05
author: Joan Comadran
tags: ["guias", "retoque"]
tools: ["remove-objects", "background-remover", "raw-editor", "batch"]
keywords:
  - quitar objetos de una foto online gratis
  - borrar objetos de una foto
  - borrar personas de una foto
  - eliminar manchas de una foto online
  - clonar zona foto navegador
  - borrar objetos foto gratis
faq:
  - q: "¿Borrar objetos en Lightframes es de verdad gratis?"
    a: "Sí. Corrector, clonar y Remove son gratis, sin cuenta ni marca de agua al exportar. Lightframes es código abierto con licencia MIT."
  - q: "¿Se sube mi foto cuando borro algo?"
    a: "No. La foto se lee en tu dispositivo, se edita en memoria dentro del navegador y solo se guarda cuando exportas. Lo único que puede salir a internet con Remove es el archivo del modelo MI-GAN (~28 MB desde Hugging Face) la primera vez que usas ese modo; tu imagen no forma parte de esa descarga."
  - q: "¿Cuándo uso Corrector, clonar o Remove?"
    a: "Usa Corrector (Heal) para marcas pequeñas en zonas uniformes — granos, motas de polvo, imperfecciones de piel — donde un trozo cercano puede fundirse bien. Usa clonar cuando necesites una copia literal de textura (patrones que se repiten, césped, baldosas). Usa Remove para personas, carteles u objetos sin un origen limpio en el encuadre: el modelo de IA inventa píxeles a partir del entorno."
  - q: "¿Puedo borrar a una persona de una foto gratis?"
    a: "Sí. Abre la pestaña Retouch, elige Remove, pinta sobre la persona (incluye la sombra en el trazo si puedes) y espera a que rellene. En escenas cargadas, mejor varios pases que un solo pincel enorme."
  - q: "¿Remove funciona sin conexión después de descargar el modelo?"
    a: "Tras la primera descarga, MI-GAN queda guardado en el navegador y se comprueba con una suma de comprobación fija. En sesiones posteriores puedes usar Remove sin volver a bajar el modelo, también sin conexión, mientras ese almacenamiento siga disponible."
  - q: "¿Puedo quitar manchas en archivos RAW?"
    a: "Sí. La eliminación de manchas funciona en JPEG, PNG y RAW de cámara abiertos en Lightframes, en la misma sesión que exposición y color. En la página de [editor RAW](/es/herramientas/editor-fotos-raw) y en la guía de [editar RAW en el navegador](/es/blog/editar-fotos-raw-en-el-navegador) tienes más detalle de formatos."
---

**Puedes quitar objetos de una foto online gratis sin subirla** abriendo [Lightframes](/editor), yendo a la pestaña **Retouch** y pintando encima de lo que quieras eliminar con **Heal** (corrector), **Clone** (clonar) o **Remove** (borrado con IA). Todo el flujo — abrir archivo, retocar, revelar y exportar — ocurre en el navegador; **la foto no se sube a ningún servidor**. Los controles paso a paso están en [borrar objetos de una foto](/es/herramientas/borrar-objetos-foto).

## ¿Cuándo conviene Corrector, clonar o Remove?

Los tres modos están en **Retouch → Spot removal**. Cada uno resuelve un problema distinto; elegir mal es lo que más suele delatar un retoque.

| Modo | Qué hace | Mejor para |
| --- | --- | --- |
| **Heal** (corrector) | Copia una zona cercana y mezcla el color para que el borde se funda con el entorno | Granos, motas de polvo del sensor, marcas pequeñas en piel, cielo o paredes |
| **Clone** (clonar) | Copia una zona tal cual, con borde difuminado | Texturas que se repiten, o cuando necesitas una copia exacta de otra parte del encuadre |
| **Remove** | Un modelo de inpainting en tu dispositivo (MI-GAN, licencia MIT) genera píxeles nuevos a partir del entorno | Personas, carteles, contenedores, cables — lo que no tiene un trozo limpio del que copiar |

En **Heal** y **Clone**, Lightframes elige un origen automáticamente. Si el contorno verde cae mal, arrástralo o pulsa **New source** (atajo `/`) para probar el siguiente candidato.

En **Remove**, la primera vez que eliges el modo se descarga el modelo **una sola vez** desde Hugging Face (unos **28 MB**), se verifica con una suma de comprobación y se guarda en el navegador. Tu foto no se envía; solo se bajan los pesos del modelo.

**Regla rápida:** si un trozo real de la foto podría tapar la mancha, empieza por **Heal**. Si necesitas esa copia literal, **Clone**. Si lo que borras no existe en otro sitio del encuadre, **Remove**.

¿Quieres quitar todo el fondo y no un objeto suelto? Eso es otra herramienta: [quitar el fondo de una foto](/es/herramientas/quitar-fondo-foto) recorta el sujeto para PNG transparente o fondo de color.

## Cómo quitar objetos en Lightframes, paso a paso

La interfaz del editor está en inglés; los nombres de abajo son los que verás en pantalla.

1. **Abre el editor** en [/editor](/editor) y pulsa **Open** (o **Open photos**). Valen JPEG, PNG y RAW de cámara; en RAW las manchas siguen siendo pasos editables hasta exportar ([editor RAW](/es/herramientas/editor-fotos-raw)).
2. **Entra en la pestaña Retouch.** En **Spot removal**, elige **Heal**, **Clone** o **Remove**.
3. **Ajusta Size, Feather y Opacity** antes de pintar. **Size** es el radio del pincel (0,2–10 como porcentaje del lado largo). **Feather** suaviza el borde (30 % por defecto). **Opacity** controla cuánto tapa el arreglo el original (5–100 %).
4. **Pinta encima de lo que quieras quitar.** Un clic para un punto pequeño o arrastra para un trazo. Con **Remove**, espera a que termine cada mancha antes de abrir otra zona grande: se procesan en orden.
5. **Oculta los contornos** con **Show spots** (`H`) y revisa al **100 %** de zoom. Deshaz, borra una mancha (`Delete`) o selecciónala y mueve los sliders.
6. **Exporta** con **Ctrl/Cmd+E** en JPEG, PNG o WebP. El archivo original en disco no se modifica; las manchas son pasos editables hasta exportar.

Cada mancha sigue en la pila: haz clic para mover el origen, cambiar el tamaño o eliminarla. **Clear all** quita todas las manchas de esa foto.

## Técnicas para que no se note el retoque

Estos hábitos importan más que buscar un modelo de IA más grande:

- **Pincel más ancho que el objeto.** Deja un poco de cielo, suelo o césped alrededor. Un trazo justo al borde suele dejar halo o costura.
- **Incluye sombra y reflejo en el mismo trazo.** Una persona o un poste siguen “leyéndose” si queda la sombra en el suelo o el reflejo en un cristal. Pinta objeto y sombra juntos cuando puedas.
- **Un objeto por pase.** Termina y revisa cada mancha de **Remove** antes de la siguiente. Las manchas posteriores ven el resultado de las anteriores y el fondo queda más coherente.
- **Objetos grandes: de fuera hacia dentro.** En un cartel grande o un grupo, borra por fuera hacia el centro con varios trazos en lugar de un rectángulo único.
- **Revisa al 100 % con los contornos ocultos** antes de exportar. A tamaño de pantalla puede valer; al ampliar a veces aparece mancha.
- **¿Polvo del sensor en toda la sesión?** Arregla un fotograma, copia los ajustes (**Ctrl/Cmd+C**), selecciona el resto en la tira, pega (**Ctrl/Cmd+V**) y marca **Spot removal**. El polvo cae en el mismo sitio en cada toma — mira el [editor por lotes](/es/herramientas/editar-fotos-por-lotes).

Si abriste un RAW, puedes quitar motas y ajustar exposición en la misma sesión; en [editar fotos RAW en el navegador](/es/blog/editar-fotos-raw-en-el-navegador) explicamos revelado y exportación sin subir archivos.

## Privacidad: qué sale de tu dispositivo

Lightframes procesa las fotos **en tu navegador**. No se suben a un servidor de Lightframes para corrector, clonar o Remove.

Lo que la gente pregunta por **Remove**: los pesos de **MI-GAN** se descargan **una vez** desde **Hugging Face** (unos **28 MB**), se comprueban con una suma fija y se guardan en caché. Después, el inpainting puede funcionar **sin conexión** en muchos navegadores, mientras esa caché siga ahí. Los bytes de tu imagen no forman parte de la descarga ni se envían para inferencia: el modelo corre en un worker en segundo plano en tu equipo.

Es distinto de las webs en la nube que piden subir la foto. También es honesto con la primera descarga: hace falta conexión **una vez** para **Remove**, no para **Heal** ni **Clone**.

Lightframes es código abierto ([GitHub](https://github.com/joancomadran/lightframes)). La interfaz del editor está en inglés; esta guía tiene versión en [inglés](/blog/remove-objects-from-photos-online).

## Límites reales de Remove

Ninguna herramienta inventa arquitectura perfecta siempre. En Lightframes:

- **Remove** trabaja sobre un recorte de cada mancha de como máximo **1024 px en el lado largo**, procesado por dentro a **512 px**. En un archivo muy grande, un borrado enorme puede verse más suave que el resto — trazos más pequeños suelen ir mejor.
- **Geometría dura y texto** (líneas rectas de edificios, letras legibles) cuestan más que césped, cielo, arena o agua. Cuenta con un segundo pase o pasa a **Heal**/**Clone** donde haya origen real.
- **Heal** y **Clone** solo copian lo que ya está en el encuadre. En una foto muy cargada, prueba **New source** varias veces o cambia a **Remove**.

Lightroom y Camera Raw tienen sus propias herramientas de saneamiento en flujos de pago o de escritorio; Lightframes es un editor independiente en el navegador, sin relación con Adobe. Si ya usas Lightframes para RAW y presets, el retoque está en la misma pestaña **Retouch**, sin otra app.

## Preguntas frecuentes

Las entradas del bloque faq de esta página cubren gratuidad, subida de archivos, elección de modo, borrar personas, **Remove** sin conexión tras la caché del modelo y soporte RAW. Para atajos y detalle de la herramienta, mira [borrar objetos de una foto](/es/herramientas/borrar-objetos-foto).

¿Lo pruebas? [Abre el editor](/editor), carga una foto, entra en **Retouch** y pinta una distracción con **Heal** o **Remove**.
