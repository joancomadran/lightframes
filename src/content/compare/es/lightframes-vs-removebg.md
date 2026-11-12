---
key: lightframes-vs-removebg
slug: lightframes-vs-removebg
title: "Lightframes frente a remove.bg"
description: "Lightframes o remove.bg: quitar el fondo en tu equipo sin subir la foto, o un servicio con API y créditos que la envía a un servidor. Privacidad y precio."
h1: "Lightframes o remove.bg"
lead: "Lightframes encaja si quieres quitar el fondo en el navegador, sin subir la foto, y seguir editando en la misma pestaña. remove.bg encaja si quieres un servicio dedicado a quitar el fondo: la foto se sube, se procesa en su lado y vuelve, con API y créditos de pago para el tamaño completo. La app de escritorio no cambia eso. remove.bg dice que las imágenes se procesan igual a través de la API."
order: 6
updated: 2026-11-12
faq:
  - q: "¿remove.bg sube mi foto?"
    a: "Sí. La política de privacidad (16 de julio de 2025) dice que los archivos se suben, se procesan, se ofrecen para descargar y después se borran al poco tiempo. Un artículo actualizado el 28 de agosto de 2025 dice que las imágenes subidas se borran normalmente en 60 minutos. La misma política dice que las subidas pueden analizarse para entrenar sus modelos."
  - q: "¿remove.bg es gratis?"
    a: "En parte. La página de la app de escritorio dice que la descarga es gratis, que procesar gasta créditos, que al registrarte tienes un crédito gratis y 50 llamadas gratis a la API al mes para vistas previas de hasta 0,25 megapíxeles (por ejemplo 625×400). La página de la API dice que las primeras 50 llamadas de cada mes son gratis y remite el uso de pago a la página de precios. Lightframes no tiene créditos ni cuenta."
  - q: "¿Lightframes sube la foto para quitar el fondo?"
    a: "No. El modelo IS-Net (unos 45 MB) se descarga de este sitio, se comprueba con SHA-256 y se ejecuta en el navegador con ONNX Runtime Web. La foto se queda en el equipo. Después de esa primera descarga, el recorte funciona sin conexión."
  - q: "¿remove.bg tiene API?"
    a: "Sí. La API acepta una subida directa o una URL de imagen, por HTTPS, y documenta una salida de hasta 50 megapíxeles. La misma página dice que desde el 1 de diciembre de 2026 quitar el fondo pasa a Leonardo.Ai, también de Canva."
---

remove.bg es un producto de Canva Austria GmbH. Lightframes es independiente y no está afiliado a remove.bg ni a Canva.

## Comparación

| | **Lightframes** | **remove.bg** |
| --- | --- | --- |
| **Precio** | Gratis. Sin cuenta, sin créditos y sin plan de pago. | La [página de la app de escritorio](https://www.remove.bg/a/background-remover-windows-mac-linux) dice que la descarga es gratis y que procesar gasta créditos: un crédito gratis al registrarte, más 50 llamadas gratis a la API al mes para vistas previas de hasta 0,25 megapíxeles (por ejemplo 625×400). La [página de la API](https://www.remove.bg/api) dice que las primeras 50 llamadas de cada mes son gratis y remite el uso de pago a los [precios](https://www.remove.bg/pricing). Esta página no cita importes de los planes, porque el HTML de precios recuperado el 12 de noviembre de 2026 no los imprimía. |
| **Licencia** | [MIT](https://github.com/joancomadran/lightframes), código en GitHub. | Propietaria. La [política de privacidad](https://www.remove.bg/privacy) nombra como operador a Canva Austria GmbH. |
| **Dónde funciona** | Chrome, Edge, Brave, Firefox y Safari actuales. PWA instalable. La interfaz del editor está en inglés. Quitar el fondo es un modo de la pestaña Retouch, junto a Color, Blur y Heal. | En el navegador, más una app de escritorio para Windows 10/11 (64 bits), macOS 13 o posterior (64 bits) y Ubuntu/Debian (64 bits), una app de Android y una API HTTP ([app de escritorio](https://www.remove.bg/a/background-remover-windows-mac-linux), [API](https://www.remove.bg/api)). La app de escritorio pide cuenta y clave de API. |
| **Qué quita** | IS-Net (uso general), cuantizado a 8 bits, unos 45 MB, de este sitio. La foto se escala a 1024×1024 para la máscara. Puedes exportar transparencia, poner el sujeto sobre un color sólido o desenfocar el fondo original, y pintar Keep o Erase para corregir el borde. | Un quitafondos dedicado. La API documenta una salida de hasta 50 megapíxeles y dice que la imagen necesita un primer plano (personas, productos, animales, coches y similares). La [página de la API](https://www.remove.bg/api) dice que desde el 1 de diciembre de 2026 esto pasa a Leonardo.Ai, también de Canva. |
| **Lotes** | Copia el ajuste de fondo y pégalo en una selección de la tira. Cada foto calcula su máscara al previsualizar o al exportar. Varios archivos salen en un ZIP. | La [app de escritorio](https://www.remove.bg/a/background-remover-windows-mac-linux) acepta carpetas de imágenes y las manda por la API. La propia API es el camino para los trabajos grandes. |
| **El resto del editor** | Revelado RAW, presets `.xmp`, LUTs `.cube`, borrar objetos y ampliar 2× o 4× en la misma sesión. La exportación se detiene en 8192 px en el lado largo. | Un servicio de recorte, no un revelador RAW. La página de la app de escritorio no describe presets de Lightroom ni RAW de cámara. |
| **Privacidad / subidas** | La foto no se sube. El modelo se guarda en el navegador tras la primera descarga. Las visitas usan Vercel Web Analytics sin cookies. | La foto se sube. La [política de privacidad](https://www.remove.bg/privacy) dice que los archivos se procesan y luego se borran al poco tiempo, y que las subidas pueden usarse para entrenar modelos. Un [artículo actualizado el 28 de agosto de 2025](https://www.remove.bg/b/prioritizing-security-and-privacy-at-remove-bg) dice que las imágenes se borran normalmente en 60 minutos. |

## Cuándo conviene remove.bg

remove.bg conviene cuando quitar el fondo es un paso de producción: una carpeta de fotos de producto, un plugin de Photoshop o un script. La [API](https://www.remove.bg/api) acepta una subida o una URL y documenta resultados de hasta 50 megapíxeles, por encima de los 8192 px de lado largo que exporta Lightframes. La [app de escritorio](https://www.remove.bg/a/background-remover-windows-mac-linux) está hecha para arrastrar carpetas enteras, y sigue necesitando red y créditos porque las imágenes van a la API.

Ese es el intercambio real. La foto sale de tu equipo. La política de privacidad dice que se borra al poco tiempo, el artículo de agosto de 2025 dice que normalmente en 60 minutos, y la misma política dice que las subidas pueden servir para entrenar modelos. Si un cliente prohíbe cualquier subida, remove.bg no encaja, tampoco la app de escritorio.

## Cuándo conviene Lightframes

Lightframes conviene cuando la foto no debe subirse y el recorte es un paso más de una edición normal. Abre el [editor](/es/editor), ve a Retouch y elige Remove, Color o Blur en Background. La primera vez se descarga IS-Net (unos 45 MB) de este sitio. Si exportas en JPEG con Remove, se guarda un PNG para que la transparencia no se pierda. El recorrido está en [quitar el fondo](/es/herramientas/quitar-fondo-foto).

A cambio no hay API, ni salida a 50 megapíxeles, ni una herramienta que solo quite fondos. La máscara se calcula a 1024×1024, así que un pelo fino puede pedir el pincel Keep y Erase. Las manchas y las personas que quieres rellenar, en vez de separar, están en [borrar objetos](/es/herramientas/borrar-objetos-foto). Ampliar el resultado está en [Lightframes o Upscayl](/es/comparar/lightframes-vs-upscayl).
