---
key: raw-in-browser
slug: editar-fotos-raw-en-el-navegador
title: "Cómo editar fotos RAW en el navegador"
description: "Edita archivos RAW de tu cámara (ARW, CR3, NEF, DNG, RAF…) desde el navegador, sin subirlos a ningún sitio ni crear cuenta. Todo se revela en tu equipo."
h1: "Cómo editar fotos RAW en el navegador sin subirlas a internet"
published: 2026-10-20
author: Joan Comadran
tags: ["raw", "guias"]
tools: ["raw-editor", "raw-to-jpg", "presets", "batch"]
keywords:
  - editar raw online
  - editar fotos raw en el navegador
  - editor raw gratis
  - abrir archivo arw
  - editar cr3 online
  - revelar raw sin instalar nada
  - editor de fotos sin subir archivos
  - editor dng online
---

**En resumen:** abre [Lightframes](/editor) en el navegador del ordenador, pulsa **Open** y elige tus archivos RAW. La app revela los datos del sensor en tu propio equipo con LibRaw compilado a WebAssembly, así que la foto no se sube a ningún servidor. Ajustas con los controles y exportas un JPEG, PNG o WebP generado a partir del RAW a resolución completa.

## ¿Qué es un archivo RAW y por qué merece la pena editarlo?

Un RAW es lo que registró el sensor de la cámara antes de que la propia cámara lo convirtiera en JPEG. Cada marca tiene su formato: ARW en Sony, CR2 y CR3 en Canon, NEF en Nikon, RAF en Fujifilm, ORF en Olympus, RW2 en Panasonic, y el formato abierto DNG.

El JPEG que sale de la cámara ya lleva aplicados el balance de blancos, el contraste y el enfoque, y se queda en 8 bits por canal. El RAW conserva mucha más información. En la práctica, eso se traduce en:

- **Más margen en luces y sombras.** Un cielo que en el JPEG parece quemado suele conservar detalle en el RAW.
- **Balance de blancos totalmente libre,** porque todavía no se ha aplicado a los píxeles.
- **Menos bandas y saltos de color** cuando fuerzas la exposición o la saturación.

El inconveniente es que hay que "revelar" el RAW antes de poder compartirlo, y normalmente eso implica instalar un programa o mandar el archivo a un servicio web.

## ¿Por qué importa que la foto no se suba a internet?

La mayoría de editores online envían tu foto a un servidor, la procesan allí y te devuelven el resultado. Con archivos RAW eso tiene un coste real:

- **Privacidad.** Las fotos de tu familia, de tu casa o de la sesión de un cliente acaban en una máquina ajena, con una política de conservación que no controlas.
- **Tiempo y datos.** Un solo RAW suele pesar decenas de megas. Subir una tarjeta entera con el wifi de un hotel es lentísimo, o directamente imposible.
- **Cuentas y límites.** Los servicios en la nube suelen pedir registro y muchos limitan el tamaño del archivo o el número de exportaciones.

Lightframes hace todo el proceso dentro de la pestaña del navegador. El decodificador RAW, el motor de edición y la exportación funcionan en tu dispositivo, y el trabajo pesado se reparte entre Web Workers para que la página no se congele. Las fotos abiertas y tus ajustes se guardan en el almacenamiento del propio navegador (IndexedDB), de modo que no pierdes nada si recargas la página, y nada de eso se envía a ninguna parte. Una vez cargada, la edición también funciona sin conexión. La primera vez que borras un objeto, esa herramienta descarga su modelo de Hugging Face.

## ¿Cómo se edita un RAW en Lightframes, paso a paso?

1. **Abre el editor.** Entra en [/editor](/editor). Con un navegador basado en Chromium reciente (Chrome, Edge, Brave) en el ordenador vas más rápido y puedes abrir carpetas enteras. La interfaz está en inglés.
2. **Carga tus archivos.** Pulsa **Open** en la barra superior y selecciona uno o varios RAW. Si mantienes **Option/Alt** al hacer clic, eliges una carpeta. Cada archivo nuevo se añade a la tira de miniaturas (filmstrip).
3. **Espera al primer revelado.** La miniatura aparece enseguida; la vista grande tarda un poco más porque la app está procesando los datos del sensor en segundo plano.
4. **Ajusta lo básico en Adjust.** Empieza por la exposición y sigue con luces, sombras, blancos y negros. Corrige el balance de blancos con temperatura y matiz, o usa el cuentagotas sobre algo neutro. Pulsa **J** para ver las zonas recortadas y vigila el histograma.
5. **Afina color y tono.** En **Color** tienes tono, saturación y luminancia por colores y gradación de color. En **Curve**, la curva de tonos; en **Effects**, viñeta, grano, enfoque y reducción de ruido.
6. **Encuadre y detalles.** **Crop** recorta, endereza y gira (atajo **R**). **Local** añade máscaras radiales, lineales, de pincel o de sujeto, que puedes limitar a un rango de brillo o de color. **Retouch** elimina manchas y pequeñas distracciones.
7. **Compara.** Pulsa **\\** para ver el antes y el después. Todo es no destructivo y se puede deshacer (**Ctrl/Cmd+Z**).
8. **Exporta.** Pulsa **Ctrl/Cmd+E**, elige tamaño y formato, y guarda.

Si has hecho una serie con la misma luz, edita una foto, copia sus ajustes (**Ctrl/Cmd+C**) y pégalos en el resto de la selección (**Ctrl/Cmd+V**). Al pegar puedes elegir qué ajustes se copian, por ejemplo el color pero no el recorte. Lo explicamos con más detalle en [editar fotos por lotes](/es/herramientas/editar-fotos-por-lotes), y cualquier estilo que te guste lo puedes guardar como [preset](/es/herramientas/presets-fotos) para reutilizarlo.

## ¿Qué formatos RAW admite?

Además de JPEG y PNG, Lightframes reconoce estas extensiones:

| Marca | Extensiones |
| --- | --- |
| Sony | `.arw` |
| Canon | `.cr2`, `.cr3` |
| Nikon | `.nef`, `.nrw` |
| Fujifilm | `.raf` |
| Olympus / OM System | `.orf` |
| Panasonic | `.rw2` |
| Pentax | `.pef` |
| Samsung | `.srw` |
| DNG (muchas marcas y móviles) | `.dng` |

El revelado depende de LibRaw, así que el que un modelo concreto se revele bien depende de que LibRaw lo soporte. Las cámaras recién salidas al mercado pueden tardar en estar cubiertas.

<!-- TODO: confirmar la versión de LibRaw que incluye libraw-wasm y si queremos enlazar una lista de cámaras compatibles. -->

## Vista previa incrustada o revelado RAW completo: ¿qué estás editando?

Casi todos los RAW llevan dentro un JPEG a tamaño completo, el mismo que ves en la pantalla de la cámara. Lightframes usa cada cosa para lo que sirve:

- **Las miniaturas** de la tira salen de ese JPEG incrustado, porque se extrae muy rápido.
- **La vista de edición** es un revelado RAW de verdad hecho con LibRaw: RGB lineal de 16 bits, con el balance de blancos de la cámara y sin curva de tonos aplicada. Para ir fluido se decodifica a la mitad de tamaño, que en pantalla sobra.
- **La exportación** vuelve a revelar el RAW a resolución completa, así que el archivo final tiene todos los píxeles que captó el sensor.

Si LibRaw no consigue revelar un archivo concreto, la app recurre al JPEG incrustado para que puedas editarlo igualmente. En ese caso trabajas sobre la versión de 8 bits que generó la cámara, y notarás que las luces no se recuperan como en otros RAW. Si te pasa, convierte el archivo a DNG y vuelve a probar.

<!-- TODO: si la interfaz llega a indicar qué fuente se usa (RAW o JPEG incrustado), mencionarlo aquí. -->

## Consejos para sacarle partido

- **Primero la exposición, luego el color.** La percepción del color cambia con el brillo, así que deja la saturación para el final.
- **Usa el aviso de recorte.** El RAW tiene margen, pero no infinito. Baja las luces hasta que el aviso desaparezca de las zonas que deberían tener detalle.
- **Cuidado con el enfoque en la vista reducida.** Haz zoom para revisar el detalle fino antes de exportar.
- **Paciencia con los archivos grandes.** Revelar un RAW de más de 40 megapíxeles a tamaño completo cuesta lo suyo en un portátil. Solo ocurre al exportar, no cada vez que mueves un control.
- **Conserva los originales.** Lightframes nunca modifica tu archivo RAW. Los ajustes viven aparte hasta que exportas.

## ¿Cómo se exporta la foto terminada?

Abre el cuadro de exportación con **Ctrl/Cmd+E**. Puedes elegir:

- **Un tamaño predefinido:** Original (resolución completa), Web (2048 px en el lado largo) o tamaños de Instagram: 4:5 a 1080 × 1350, 1:1 a 1080 × 1080 e historia a 1080 × 1920. También puedes fijar tú el lado largo. Los tamaños de Instagram encajan la foto entera en el marco, con un borde del color que elijas, en lugar de recortarla.
- **Formato y calidad:** JPEG, PNG o WebP, con control de calidad.
- **Un patrón de nombre,** como `{name}-edited`, donde `{name}` es el nombre del archivo original.
- **Extras opcionales:** marca de agua de texto y ampliación con IA a 2× o 4×, que también se hace en tu equipo (mira [ampliar foto con IA](/es/herramientas/ampliar-foto-ia)).

Si seleccionas varias fotos en la tira antes de exportar, cada una se revela con sus propios ajustes y se descargan juntas en un único ZIP.

## Preguntas frecuentes

**¿De verdad es gratis? ¿Hace falta cuenta?**
Sí, es gratis y no necesitas cuenta. Lightframes es código abierto con licencia MIT; puedes ver el código en [GitHub](https://github.com/joancomadran/lightframes). En [Sobre Lightframes](/es/sobre-lightframes) te contamos cómo se financia.

**¿Funciona en el móvil?**
El editor funciona en móviles y tabletas, con zoom y desplazamiento táctiles. Pero los RAW pesan mucho y el móvil tiene menos memoria, así que para tandas grandes es más cómodo el ordenador.

**Mi RAW se abre, pero se ve igual que el JPEG. ¿Por qué?**
Si LibRaw no puede revelar ese archivo, Lightframes edita el JPEG incrustado. Convertirlo a DNG suele solucionarlo. Si no, [abre una incidencia en GitHub](https://github.com/joancomadran/lightframes/issues) indicando el modelo de cámara.

¿Te animas a probarlo? Entra en el [editor de fotos RAW](/es/herramientas/editor-fotos-raw) o directamente en [el editor](/editor).
