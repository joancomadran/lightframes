---
key: free-lightroom-alternatives
slug: alternativas-gratis-a-lightroom
title: "Alternativas gratis a Lightroom, comparadas"
description: "Alternativas gratis a Lightroom para RAW y presets XMP: Lightframes en el navegador, darktable, RawTherapee y Photopea. Pros, contras y quién encaja."
h1: "Alternativas gratis a Lightroom para RAW y presets"
published: 2026-10-29
author: Joan Comadran
tags: ["guias", "presets", "raw"]
tools: ["raw-editor", "presets", "lut", "batch", "raw-to-jpg", "remove-objects", "carousel", "collage"]
keywords:
  - alternativa gratis a lightroom
  - alternativa a lightroom online
  - editor raw gratis navegador
  - usar presets lightroom sin lightroom
  - darktable gratis
  - rawtherapee español
  - photopea raw online
---

**En resumen:** si quieres **aplicar presets `.xmp` o LUTs `.cube` de Lightroom sin instalar nada** y que tus **RAW no se suban a un servidor**, abre [Lightframes](/editor) en el navegador de un ordenador — o la guía [usar presets XMP sin Lightroom](/es/presets-xmp-sin-lightroom). Para un **catálogo RAW de escritorio con ajustes locales modulares**, **darktable** y **RawTherapee** (gratis, GPLv3) van más lejos, pero **no leen presets de revelado de Lightroom**. **Photopea** edita por **capas** en el navegador y abre muchos RAW con ajustes básicos, pero **no sustituye un flujo de presets XMP**. La app **gratis de Lightroom para móvil** cubre captura y edición básica; el **revelado RAW, los ajustes selectivos, el lote y los presets sincronizados** están en planes de pago, según la [FAQ de Lightroom móvil de Adobe](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html).

## Comparativa rápida

| | **Lightframes** | **darktable** | **RawTherapee** | **Photopea** | **Lightroom (móvil gratis)** |
| --- | --- | --- | --- | --- | --- |
| **Precio / licencia** | Gratis, [MIT](https://github.com/joancomadran/lightframes) | Gratis, [GPL-3.0](https://www.darktable.org) | Gratis, [GPL-3.0](https://rawtherapee.com/) | Web gratis ([photopea.com](https://www.photopea.com/)) | Gratis + de pago ([Adobe](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)) |
| **Dónde corre** | Navegador (PWA instalable) | Linux, macOS, Windows, BSD | Linux, macOS, Windows | Navegador | iOS, Android, Chromebook |
| **Revelado RAW** | Sí, [LibRaw en WebAssembly](/es/herramientas/editor-fotos-raw) | Sí ([formatos](https://docs.darktable.org/usermanual/en/overview/supported-file-formats/)) | Sí | Sí, panel limitado al importar ([tutorial](https://www.photopea.com/tuts/open-raw-photos-online/)) | RAW en móvil/tablet = **premium** ([Adobe](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)) |
| **Presets `.xmp` de Lightroom** | **Importación** en Presets ([guía](/es/herramientas/presets-fotos)) | **No** — estilos propios ([FAQ](https://www.darktable.org/about/faq/)) | **No** — perfiles `.pp3` | No como presets LR; el diálogo RAW puede abrir/exportar XMP propio ([issue #5658](https://github.com/photopea/photopea/issues/5658)) | Presets sincronizados = **de pago** ([Adobe](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)) |
| **LUT `.cube`** | Importar como preset ([LUT](/es/herramientas/aplicar-lut-foto)) | Varios formatos LUT ([FAQ](https://www.darktable.org/about/faq/)) | Hald CLUT (PNG/TIFF); `.cube` suele convertirse | Edición general, no flujo preset RAW | Presets integrados en la app móvil |
| **Lotes / series** | Copiar/pegar, presets en selección, ZIP ([lotes](/es/herramientas/editar-fotos-por-lotes)) | Cola de exportación, Lua ([features](https://www.darktable.org/about/features/)) | **Cola** de procesado ([RawPedia](https://rawpedia.rawtherapee.com/Queue)) | Acciones sobre archivos abiertos | Edición por lotes = **premium** ([Adobe](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)) |
| **Catálogo** | Sesión en el navegador (IndexedDB) | Base de datos + mesa de luz | Explorador de archivos | Sin archivo fotográfico | Nube con plan de pago |
| **¿Se suben las fotos?** | **No** — se procesan en tu navegador; modelos IA al primer uso | **No** — app de escritorio | **No** — app de escritorio | **No** — en tu dispositivo ([Photopea](https://www.photopea.com/)) | Sincronización en nube con planes de pago |
| **IA** | ONNX en el dispositivo: fondo, máscara de sujeto, borrado de objetos (modelo desde Hugging Face la primera vez), ampliación al exportar | Sin IA generativa en el núcleo | Sin IA generativa en el núcleo | Sin relleno generativo tipo Adobe | Más funciones IA en **premium** |

Lightroom y Camera Raw son marcas de Adobe. Lightframes es un proyecto independiente sin relación con Adobe.

## Lightframes — RAW y presets de Lightroom en el navegador

**Para quién:** tienes **presets `.xmp` o LUTs `.cube`**, buscas una **alternativa a Lightroom online** y quieres **RAW y lotes** sin cuenta ni subidas.

Lightframes es un editor de fotos de código abierto que funciona en la pestaña del navegador. Los RAW se decodifican con **LibRaw compilado a WebAssembly**; el revelado, los presets y la exportación corren en tu equipo con Web Workers. **Las fotos no se suben**: se procesan en tu navegador. Los archivos abiertos y tus presets personalizados se guardan en **IndexedDB** de ese navegador.

Lo que encaja con un flujo tipo Lightroom (comprobado en este proyecto):

- **RAW, JPEG y PNG**, exportación a JPEG, PNG o WebP a partir del RAW a resolución completa ([editor RAW](/es/herramientas/editor-fotos-raw), [RAW a JPG](/es/herramientas/convertir-raw-a-jpg)).
- **Importar presets `.xmp` de Lightroom / Camera Raw**, JSON y **LUTs `.cube`**, con control de **intensidad** ([presets](/es/herramientas/presets-fotos), [XMP sin Lightroom](/es/presets-xmp-sin-lightroom)).
- **Copiar y pegar ajustes** en la tira de miniaturas y **exportar por lotes** en ZIP ([editar por lotes](/es/herramientas/editar-fotos-por-lotes)).
- **Ajustes locales** radiales, lineales, pincel y máscara de **sujeto con IA** en el dispositivo.
- **Collage** y **carrusel de Instagram** en la misma sesión ([collage](/es/herramientas/collage-fotos), [carrusel](/es/herramientas/carrusel-instagram)).
- **Retoque:** heal, clonado y **borrado de objetos con IA** — el modelo se **descarga de Hugging Face la primera vez** y luego corre en local ([borrar objetos](/es/herramientas/borrar-objetos-foto)).
- **Ampliación con IA** al exportar (Real-ESRGAN con ONNX Runtime Web, modelo descargado una vez).

**Límites honestos:** el XMP mapea sliders, curvas, HSL, gradación, grano, etc.; **no se importan perfiles de cámara, correcciones de objetivo ni máscaras de Lightroom**, así que el aspecto puede ser muy parecido pero no idéntico ([FAQ de presets](/es/herramientas/presets-fotos)). LibRaw depende de la versión incluida — cámaras muy nuevas pueden tardar ([RAW en el navegador](/es/blog/editar-fotos-raw-en-el-navegador)). La interfaz está solo en inglés. Los RAW grandes van mejor en un portátil que en el móvil.

## darktable — cuarto oscuro y biblioteca en el escritorio

**Para quién:** quieres un **flujo RAW local completo** con **catálogo**, tethering y módulos profundos, y **no** necesitas cargar presets de revelado de Lightroom tal cual.

darktable combina mesa de luz, revelado no destructivo y exportación. Es **GPL-3.0** en **Linux, macOS, Windows y BSD** ([features](https://www.darktable.org/about/features/)). Lee muchos RAW vía RawSpeed ([formatos](https://docs.darktable.org/usermanual/en/overview/supported-file-formats/)), guarda ajustes en base de datos y **sidecars XMP**, usa **OpenCL** y permite scripting en **Lua**.

**Donde gana:** **biblioteca y filtros**, muchos **módulos de ajuste local**, pipeline flotante de 32 bits y **exportación** madura.

**Contras:** la FAQ dice que los **estilos de otros programas (incluido Lightroom) no son compatibles**; las **LUT** pueden acercar algunos looks ([FAQ](https://www.darktable.org/about/faq/)). Hay que **instalar**; no hay carrusel o collage integrados como en Lightframes.

## RawTherapee — revelado RAW fino en el escritorio

**Para quién:** te importa el **ajuste fino del RAW**, exportas mucho con la **cola** y trabajas con **perfiles `.pp3`**, no con presets XMP de Lightroom.

RawTherapee es **software libre (GPLv3)** multiplataforma ([rawtherapee.com](https://rawtherapee.com/)). Tiene explorador, editor detallado y **cola de procesado** para exportar mientras sigues editando ([RawPedia Queue](https://rawpedia.rawtherapee.com/Queue)). Los ajustes van en **`.pp3`**; la sincronización **XMP** cubre sobre todo **metadatos**, no volcar el revelado completo a un XMP compatible con Lightroom ([issue #7315](https://github.com/RawTherapee/RawTherapee/issues/7315)).

**Donde gana:** control RAW muy detallado, **pegado parcial** de perfiles y **cola** para exportaciones largas.

**Contras:** **sin importación de presets `.xmp` de Lightroom.** Film Simulation usa **Hald CLUT**; muchos usuarios **convierten `.cube` a Hald CLUT**. Sin biblioteca en la nube ni editor en navegador.

## Photopea — Photoshop en el navegador

**Para quién:** necesitas **capas, selecciones y PSD** en el navegador, o solo **ajustes RAW básicos** antes de retocar.

Photopea corre **en local** — no sube tus archivos a un servidor ([Photopea](https://www.photopea.com/)). Abre **DNG, CR2, CR3, NEF, ARW** y otros formatos listados en su [readme](https://github.com/photopea/photopea), con un **diálogo RAW** antes de pasar a capas ([tutorial](https://www.photopea.com/tuts/open-raw-photos-online/)).

**Donde brilla:** flujo por **capas** tipo Photoshop sin instalar nada.

**Contras:** no es un gestor de archivo RAW. El autor indica que el panel RAW **no cubre todas las opciones de Camera Raw** y que los **presets `.xmp` de Lightroom no son un flujo soportado** ([issue #5658](https://github.com/photopea/photopea/issues/5658)). Para lotes con XMP que ya tienes, Lightframes encaja mejor.

## GIMP (+ revelador RAW aparte)

**Para quién:** ya usas **GIMP** para retoque y composición y aceptas **revelar el RAW en otra app**.

[GIMP](https://www.gimp.org/about/introduction.html) es **software libre** (GPL) para retoque e imagen compuesta. **No sustituye** el conjunto RAW+catálogo de Lightroom: lo habitual es **revelar en darktable, RawTherapee u otro** y abrir el TIFF o JPEG en GIMP. Es flexible y gratis, pero más lento que un lote de presets en Lightframes o un catálogo único en darktable.

## Lightroom móvil gratis (solo contexto)

La app **gratis de Lightroom para móvil** incluye captura, organización, compartir y **más de 30 presets**, con la mayoría de herramientas de edición básica gratis ([FAQ Adobe](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)). Lo **premium** — **RAW en móvil**, **ajustes selectivos**, **lotes**, **presets/perfiles sincronizados** y **almacenamiento en la nube** — requiere suscripción ([misma FAQ](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)). **Lightroom en la web** va ligado a Creative Cloud de pago, no al tier móvil gratis ([comparativa Adobe](https://helpx.adobe.com/creative-cloud/policy-pricing/cc-app-web-mobile-access.html)).

Si lo que buscas es **usar tus `.xmp` comprados en el portátil sin pagar Lightroom**, eso queda fuera de la oferta móvil gratuita de Adobe.

## Cómo cambiar: tus presets Lightroom (`.xmp`) sin Lightroom

1. **Elige un editor que importe revelado XMP.** En Lightframes, abre el [editor](/editor), **Presets → Import** y elige el `.xmp` (o un `.cube`). Detalle en [presets para fotos](/es/herramientas/presets-fotos).
2. **Parte de una foto representativa.** Aplica el preset, ajusta la **intensidad** y corrige **exposición y balance de blancos** en cada toma.
3. **Extiende el estilo a la sesión.** **Ctrl/Cmd+C**, selecciona el resto en la tira, **Ctrl/Cmd+V** y marca solo los grupos que quieras (por ejemplo **Tone curve** y **HSL**, no **Crop**). Exporta en ZIP desde [editar por lotes](/es/herramientas/editar-fotos-por-lotes).
4. **Copia de seguridad.** Descarga tus presets como JSON por si borras datos del navegador.
5. **Pequeñas diferencias.** Sin **perfiles de cámara, correcciones de objetivo ni máscaras** de Lightroom, algunos presets necesitan un retoque manual — igual que en [efecto analógico en tus fotos](/es/blog/efecto-analogico-fotos).

Más sobre RAW y LibRaw: [editar fotos RAW en el navegador](/es/blog/editar-fotos-raw-en-el-navegador).

## Preguntas frecuentes

**¿Cuál es la mejor alternativa gratis a Lightroom online?**
Para **RAW, presets `.xmp` y exportación por lotes en el navegador sin subir fotos**, Lightframes es la opción más cercana de esta lista. Para **capas**, Photopea. Para **catálogo y módulos RAW de escritorio**, darktable o RawTherapee.

**¿Pueden darktable o RawTherapee abrir mis presets de Lightroom?**
**No como presets de revelado de Lightroom.** darktable lo indica en su [FAQ](https://www.darktable.org/about/faq/). RawTherapee guarda en **`.pp3`**; meter ese revelado en XMP para otras apps es una petición abierta, no el flujo habitual ([issue #7315](https://github.com/RawTherapee/RawTherapee/issues/7315)). Sí puedes reutilizar **LUTs `.cube`** con las rutas de importación o conversión descritas arriba.

**¿Photopea sube mis RAW?**
Photopea indica que el procesamiento es en tu dispositivo ([Photopea](https://www.photopea.com/)). Eso no implica que aplique tus packs de presets `.xmp` como Lightroom.

**¿Mis fotos se quedan privadas en Lightframes?**
**No se suben**; el procesamiento es **en tu navegador**. Las herramientas de IA descargan modelos la primera vez (borrado de objetos desde **Hugging Face**; otros desde el sitio de Lightframes). No es un servidor de Lightframes recibiendo tus imágenes.

**¿Puedo revelar RAW gratis en el móvil sin suscripción?**
Lightframes funciona en navegadores móviles, pero los RAW grandes van mejor en ordenador. Adobe lista el **RAW en móvil/tablet** entre funciones **premium** de Lightroom ([FAQ](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)).

**¿Qué elijo si solo disparo JPEG con presets comprados?**
Lightframes: importa `.xmp`, intensidad, pega en la carpeta, exporta. Photopea si también necesitas **capas y PSD**. darktable/RawTherapee si montas un **archivo de escritorio** y recreas looks con estilos o LUTs nativos.

¿Lo pruebas? [Abre Lightframes](/editor), importa un `.xmp` en **Presets** y mira la guía de [presets para fotos](/es/herramientas/presets-fotos).
