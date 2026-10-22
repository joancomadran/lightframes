---
key: about
slug: sobre-lightframes
title: "Sobre Lightframes"
description: "Quién hace Lightframes, por qué edita tus fotos en tu dispositivo y no en la nube, cómo se financia y cómo funciona este proyecto de código abierto (MIT)."
h1: "Sobre Lightframes"
updated: 2026-10-22
schemaType: AboutPage
---

Lightframes es un editor de fotos gratuito que funciona entero en tu navegador. Abres tus fotos, también los RAW de la cámara, las editas y las exportas sin subir nada y sin crear ninguna cuenta. El código es abierto, con licencia MIT.

## ¿Quién está detrás de Lightframes?

Lightframes lo desarrolla y lo mantiene **Joan Comadran**, desarrollador independiente. Es un proyecto personal, no el producto de una empresa: no hay equipo, ni inversores, ni departamento comercial.

<!-- TODO: añadir una línea breve y comprobable sobre Joan (dónde vive, relación con la fotografía o el desarrollo, enlace a web o perfil) si quiere. Solo datos verificables. -->

Las fotos de ejemplo que trae el editor son de Joan, reveladas a partir de sus propios RAW.

## ¿Por qué existe?

Porque editar tus fotos no debería obligarte a entregarlas. Muchos editores online suben cada imagen a un servidor, algo lento con archivos de cámara pesados y que deja tus fotos personales en una máquina ajena. Los programas de escritorio evitan eso, pero suelen pedir instalación, suscripción o las dos cosas.

Lightframes va por un tercer camino: un editor completo que se abre como una web, pero hace todo el trabajo en tu ordenador o tu móvil. Se basa en unas pocas ideas:

- **Privado desde el diseño.** Las fotos se abren desde tu disco y se procesan en la pestaña del navegador. No se mandan a ningún servidor para editarlas y no hay cuenta con la que iniciar sesión.
- **Local y sin conexión.** Las fotos abiertas y tus ajustes se guardan en el almacenamiento del navegador, así que no pierdes nada al recargar. Tras la primera visita, la edición funciona sin internet y puedes instalarla como aplicación. La primera vez que borras un objeto, esa herramienta descarga su modelo de Hugging Face.
- **Presets y copiar/pegar ajustes.** Lo normal es editar una tanda de fotos hechas con la misma luz. Con Lightframes guardas un estilo como preset, regulas su intensidad, importas presets XMP o LUT `.cube`, y copias los ajustes de una foto a toda una selección eligiendo cuáles se pegan.
- **Gratis.** Todas las funciones están disponibles para todo el mundo. No hay versión de pago ni marcas de agua que haya que pagar para quitar.

## ¿Qué puedes hacer con él?

En resumen: edición no destructiva de JPEG, PNG y RAW de cámara (Sony, Canon, Nikon, Fujifilm, Olympus, Panasonic, Pentax, Samsung y DNG), con controles de tono y color, curva de tonos, recorte y enderezado, máscaras locales, eliminación de manchas, quitar el fondo, ampliación con IA al exportar y un modo de collage y carrusel continuo para Instagram. Las [páginas de herramientas](/es/herramientas/editor-fotos-raw) y las [preguntas frecuentes](/es/preguntas-frecuentes) lo explican con detalle.

## ¿Cómo funciona, explicado sin tecnicismos?

No necesitas saber nada de esto para usarlo, pero explica cómo una web puede revelar RAW sin servidor:

- **WebAssembly** permite que el navegador ejecute, casi a velocidad nativa, código pensado originalmente para programas de escritorio. Lightframes lo usa para ejecutar dentro de la página LibRaw, un decodificador RAW de código abierto con muchos años de recorrido.
- **Web Workers** son hilos en segundo plano. El trabajo pesado con los píxeles se reparte entre varios para que la interfaz siga fluida mientras mueves un control.
- **Modelos de IA en el propio dispositivo** hacen funcionar las herramientas inteligentes. Se ejecutan en el navegador con ONNX Runtime Web:
  - borrar objetos usa MI-GAN (licencia MIT), que se descarga de Hugging Face la primera vez que lo usas,
  - detectar el sujeto y quitar el fondo usa IS-Net (Apache-2.0), que se descarga desde lightframes.si,
  - ampliar fotos usa Real-ESRGAN (BSD-3-Clause), también desde lightframes.si.

  Cada modelo se descarga una sola vez, la primera vez que usas la herramienta, se comprueba con una huella fija y se guarda en la caché del navegador. Tu foto se procesa en local; no viaja con esa descarga.

La app está escrita en TypeScript con React y, al final, es un conjunto de archivos estáticos que puede alojar cualquier servidor web.

## ¿Cómo se financia?

Mantener la web cuesta dinero y desarrollarla lleva tiempo, así que Lightframes se financia de tres formas discretas:

- **Un pequeño espacio publicitario en la app, siempre señalizado.** Ahora mismo muestra tarjetas de afiliado con material fotográfico.
- **Enlaces de afiliado.** La [página de equipo](/es/equipo) y esas tarjetas enlazan a productos de Amazon.es. Si compras algo a través de ellos, Lightframes se lleva una pequeña comisión sin que a ti te cueste más. Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.
- **Donaciones voluntarias.** Si el editor te ahorra tiempo, puedes [invitar a Joan a un café](https://buymeacoffee.com/devcoma).

Nada de esto tiene que ver con tus fotos. La web cuenta las visitas con Vercel Web Analytics, que no ve las imágenes que abres en el editor.

<!-- TODO: confirmar la redacción sobre analítica con la política de privacidad y actualizar esta sección si se añade una red publicitaria de terceros. -->

## ¿Es de código abierto?

Sí. Todo el código está en GitHub, en [github.com/joancomadran/lightframes](https://github.com/joancomadran/lightframes), con licencia MIT. Puedes ver exactamente qué hace la app con tus archivos, montar tu propia copia o construir sobre ella. La excepción son las fotos de ejemplo del repositorio: son © del autor y no están cubiertas por la licencia MIT.

Una estrella en el repositorio ayuda a que más gente descubra el proyecto.

## ¿Cómo contactar o colaborar?

La mejor vía es GitHub:

- **¿Has encontrado un fallo o un RAW que no se abre?** [Abre una incidencia](https://github.com/joancomadran/lightframes/issues). Indica tu navegador, tu dispositivo y, si es un problema con un RAW, el modelo de cámara.
- **¿Tienes una idea?** Abre una incidencia contando qué intentas hacer. Un ejemplo concreto ayuda más que el nombre de una función.
- **¿Quieres aportar código?** Los pull requests son bienvenidos. Para algo más grande que un arreglo pequeño, abre antes una incidencia y acordáis el enfoque.

<!-- TODO: añadir un email o formulario de contacto si Joan quiere publicarlo. -->

Todos los cambios de la app están en [novedades](/es/novedades).
