---
key: lightframes-vs-upscayl
slug: lightframes-vs-upscayl
title: "Lightframes frente a Upscayl"
description: "Lightframes o Upscayl: ampliar 2× o 4× en el navegador sin subir la foto, o un ampliador de escritorio gratis con más modelos. GPU, escala y privacidad."
h1: "Lightframes o Upscayl"
lead: "Lightframes encaja si quieres ampliar una foto 2× o 4× en el navegador, después de los ajustes, sin subirla. La app de escritorio de Upscayl encaja si quieres un ampliador gratis que se instala, con varios modelos, modelos propios y una GPU Vulkan. Solo coinciden en ese trabajo. La documentación de Upscayl describe además una API en la nube que sube la imagen y gasta créditos: eso es otro producto, no la app de escritorio."
order: 5
updated: 2026-11-12
faq:
  - q: "¿La app de escritorio de Upscayl sube mis fotos?"
    a: "Es un programa local. El README de GitHub dice que usa Real-ESRGAN con Vulkan en tu máquina, y que hace falta una GPU compatible con Vulkan. La API de Upscayl Cloud, en docs.upscayl.org, sí sube el archivo y descuenta créditos."
  - q: "¿Upscayl funciona sin tarjeta gráfica?"
    a: "El README dice que la GPU Vulkan es obligatoria y que la mayoría de gráficas integradas y de CPUs no sirven, con un apaño de la comunidad para Windows y Linux. Lightframes prueba WebGPU y, si no está, ejecuta el mismo modelo de ampliación en la CPU con WebAssembly."
  - q: "¿Hasta dónde amplía Lightframes?"
    a: "2× o 4×, con un solo modelo Real-ESRGAN (general x4v3, unos 5 MB, servido por este sitio). El resultado se detiene en 8192 px en el lado largo y en unos 40 megapíxeles. Una exportación a 2× es la salida 4× del modelo, reducida."
  - q: "¿Upscayl es gratis?"
    a: "La app de escritorio es gratis y open source. La licencia del repositorio es la GNU AGPL versión 3, y el README dice que el backend ncnn también es AGPL. La API en la nube no es esa app: su documentación habla de créditos que se descuentan por tarea."
---

Lightframes es independiente y no está afiliado a Upscayl.

## Comparación

| | **Lightframes** | **Upscayl** |
| --- | --- | --- |
| **Precio** | Gratis. Sin cuenta y sin plan de pago. Ampliar forma parte de la exportación. | La app de escritorio es gratis ([portada](https://upscayl.org/), [README](https://github.com/upscayl/upscayl)). La [API en la nube](https://docs.upscayl.org/start-task) descuenta créditos por tarea y puede responder que no hay créditos suficientes. |
| **Licencia** | [MIT](https://github.com/joancomadran/lightframes) | GNU AGPL versión 3, en el [LICENSE](https://github.com/upscayl/upscayl/blob/main/LICENSE) del repositorio. El README dice que el [backend ncnn](https://github.com/upscayl/upscayl-ncnn) también es AGPL. |
| **Dónde funciona** | Chrome, Edge, Brave, Firefox y Safari actuales. PWA instalable. No pide Vulkan: WebGPU si el navegador lo tiene y, si no, la CPU. La interfaz del editor está en inglés. | Builds de escritorio para Linux, macOS 12 o posterior y Windows 10 o posterior ([README](https://github.com/upscayl/upscayl)). Hace falta una GPU compatible con Vulkan; la misma página dice que la mayoría de gráficas integradas no sirven. La portada también sitúa la app de escritorio en Linux, macOS y Windows. |
| **Qué amplía** | Un modelo: Real-ESRGAN general x4v3, unos 5 MB, descargado de este sitio y comprobado con SHA-256. La exportación ofrece 2× o 4×. El lado largo se detiene en 8192 px y el resultado en unos 40 megapíxeles. Por debajo de una ganancia de 1,1× el paso se omite. | El README dice que la app de escritorio usa Real-ESRGAN. La [guía](https://github.com/upscayl/upscayl/wiki/Guide) dice que los modelos de serie solo salen a ×4 y que, desde la v2.8, las otras escalas se obtienen reduciendo ese resultado ×4. Desde la v2.5 se pueden añadir modelos NCNN propios. La [portada](https://upscayl.org/) anuncia ampliaciones de hasta 16×. La API en la nube documenta escalas del 1 al 8. |
| **Modelos** | Un modelo general de foto. El resultado a 2× es la salida ×4 remuestreada, con un 20 % de una ampliación suave normal mezclada para que la piel conserve algo de textura. | Varios modelos incluidos. El README acredita Real-ESRGAN más High Fidelity (HFA2k), Remacri, y Ultrasharp y Ultramix. Puedes apuntar la app a tus modelos NCNN. |
| **Lotes** | Selecciona fotos en la tira, abre Export, activa AI upscale y descarga un ZIP. Cada archivo se amplía por turno, después de sus propios ajustes. | El README describe Batch Upscayl. La portada también nombra Double Upscayl (pasar la ampliación dos veces). Hay una CLI aparte, [upscayl-ncnn](https://github.com/upscayl/upscayl-ncnn). |
| **El resto del editor** | La ampliación cae sobre una foto ya revelada: RAW, presets `.xmp`, LUTs `.cube`, recorte, quitar fondo y borrar objetos en la misma pestaña. | Un ampliador. El README no describe revelado RAW, presets de Lightroom ni un collage. |
| **Privacidad / subidas** | La foto no se sube. El modelo de ampliación sale de este sitio, no de un tercero, y se guarda en la caché del navegador. Las visitas usan Vercel Web Analytics sin cookies. | La app de escritorio corre en local y necesita una GPU en esa máquina ([README](https://github.com/upscayl/upscayl)). La [API en la nube](https://docs.upscayl.org/start-task) acepta un archivo subido, una lista de archivos o URLs de imagen, y devuelve un id de tarea. |

## Cuándo conviene Upscayl

La app de escritorio de Upscayl conviene cuando ampliar es todo el trabajo y tienes una GPU Vulkan. Hay más de un modelo, modelos NCNN propios, un modo por lotes y una herramienta de línea de comandos, y la [portada](https://upscayl.org/) anuncia hasta 16× y una segunda pasada (Double Upscayl). Lightframes se queda en 4× y en 8192 px en el lado largo, y solo lleva Real-ESRGAN general x4v3. Si la foto ya está nítida y solo querías un ampliador dedicado, Upscayl se acerca más.

La API en la nube es otra oferta. Su página [start-task](https://docs.upscayl.org/start-task) sube la imagen y cobra créditos. Eso no es la app local, y no es un motivo para preferir Upscayl cuando la foto tiene que quedarse en el equipo.

## Cuándo conviene Lightframes

Lightframes conviene cuando la foto todavía hay que revelarla, o cuando el ordenador no tiene GPU Vulkan y no debería instalar nada. Abre el [editor](/es/editor), ajusta y pon AI upscale a 2× o 4× en Export. La primera vez el modelo (unos 5 MB) se descarga de este sitio. Las siguientes exportaciones funcionan sin conexión. El paso a paso está en el [ampliador con IA](/es/herramientas/ampliar-foto-ia).

No iguala una pila de modelos especializados ni una pasada a 16×. Una foto que ya ronda los 8192 px en el lado largo no se amplía. Quitar el fondo en el mismo editor es otra herramienta, en [Lightframes o remove.bg](/es/comparar/lightframes-vs-removebg).
