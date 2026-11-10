---
key: lightframes-vs-lightroom
slug: lightframes-vs-lightroom
title: "Lightframes frente a Lightroom"
description: "Lightframes o Lightroom: un editor MIT gratis en el navegador, o el catálogo y la nube de Adobe. RAW, presets, lotes y privacidad, con páginas de Adobe."
h1: "Lightframes o Lightroom"
lead: "Lightframes encaja si quieres un editor gratis y open source en el navegador que aplica los presets .xmp y los LUTs .cube que ya tienes, sin cuenta y sin subir las fotos. Lightroom encaja si quieres el catálogo de Adobe, la sincronización en la nube y el revelado para el que se hicieron esos presets, incluidas funciones que Adobe lista de pago. Lightframes no sustituye una biblioteca de Creative Cloud."
order: 3
updated: 2026-11-10
faq:
  - q: "¿Lightframes está afiliado a Adobe?"
    a: "No. Lightroom y Camera Raw son marcas de Adobe. Lightframes es un proyecto independiente con licencia MIT. Importar un .xmp no hace que el resultado sea idéntico a Lightroom."
  - q: "¿Puedo usar presets .xmp de Lightroom en Lightframes?"
    a: "Sí, si tienes el archivo .xmp. Lightframes mapea sliders de revelado, curvas, HSL, gradación, grano, enfoque y reducción de ruido. No importa perfiles de cámara, correcciones de objetivo, calibración ni máscaras locales."
  - q: "¿Qué incluye la app gratis de Lightroom?"
    a: "La FAQ móvil dice que captura, organización, compartir y la mayoría de herramientas de edición son gratis. Lo premium incluye almacenamiento en la nube, sincronización, pincel corrector, máscaras, geometría, edición por lotes, revelado RAW y búsqueda Sensei. Lightroom de escritorio necesita internet para activar la suscripción."
  - q: "¿Las fotos se quedan en mi equipo con Lightroom?"
    a: "No cuando usas la biblioteca en la nube. La FAQ móvil dice que Lightroom copia las fotos a la nube y guarda los originales en Creative Cloud. En Lightframes la foto se procesa en el navegador y no se sube."
---

Lightroom y Camera Raw son marcas de Adobe. Lightframes es un proyecto open source independiente y no está afiliado ni respaldado por Adobe.

## Comparación

| | **Lightframes** | **Lightroom** |
| --- | --- | --- |
| **Precio** | Gratis. Sin prueba y sin plan de pago. | Suscripción. Activar la versión de escritorio pide conexión a internet y aceptar el acuerdo de licencia ([requisitos](https://helpx.adobe.com/lightroom-cc/system-requirements.html)). Aquí no hay un precio, porque los planes de Adobe cambian según el país. |
| **Licencia** | [MIT](https://github.com/joancomadran/lightframes). | Propietaria. Los requisitos dicen que el producto puede no estar en todos los países y puede cambiar. |
| **Dónde funciona** | El navegador: Chrome, Edge, Brave, Firefox y Safari en ordenadores, y navegadores móviles. PWA. La interfaz del editor está en inglés. | Los requisitos de escritorio listan Windows y macOS (notas actuales: Windows 11 24H2 o posterior; macOS Sequoia 15 o Tahoe 26), no Linux. El RAW en móvil para miembros de Creative Cloud incluye iPad, iPhone, Android y Chromebook ([FAQ móvil](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html)). |
| **RAW** | LibRaw en WebAssembly para ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF y SRW. Gratis, en el navegador. | La FAQ móvil lista el revelado RAW como función premium. Esa FAQ exige una membresía de Creative Cloud para importar y revelar RAW en el teléfono, la tableta o un Chromebook. |
| **Presets .xmp de Lightroom** | Se importa un `.xmp` desde el disco. Perfiles, objetivos y máscaras del archivo se omiten, así que el look puede diferir. | Esta es la app para la que se escriben esos presets. El tramo gratis de la FAQ móvil no es lo mismo que sincronizar tu biblioteca de presets; la nube pide membresía. |
| **LUTs .cube** | Se importan como preset, con intensidad. | Las páginas de Adobe citadas aquí no lo describen, así que esta fila no afirma un importador `.cube` de Lightroom. |
| **IA** | En el dispositivo: quitar fondo, máscara de sujeto, borrar objetos y ampliar al exportar. Los modelos se bajan una vez; las fotos no se envían con ellos. | Los [requisitos de escritorio](https://helpx.adobe.com/lightroom-cc/system-requirements.html) citan funciones de IA como Denoise, Lens Blur y Reflection Removal. La FAQ móvil lista la búsqueda con Sensei en premium. |
| **Privacidad / subidas** | Las fotos no se suben. La sesión se queda en IndexedDB. Las visitas usan analítica sin cookies. | La FAQ móvil dice que las fotos se copian a la nube, que los originales se guardan en Creative Cloud y que puedes seguir en otros dispositivos con una suscripción activa. |
| **Lotes** | Copiar y pegar, y un preset sobre una selección, y un ZIP. Sin catálogo sincronizado. | La FAQ móvil lista la edición por lotes como premium. Lightroom de escritorio es una app de biblioteca con exportación; esta página no inventa un límite de lotes en escritorio. |

## Cuándo conviene Lightroom

Lightroom conviene cuando el preset, el perfil de cámara y la corrección de objetivo tienen que coincidir con el flujo de Adobe, o cuando la biblioteca tiene que seguirte entre el teléfono, la tableta y el escritorio. La [FAQ móvil](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) describe la copia en la nube, la sincronización y las herramientas premium (RAW, máscaras, lotes, corrector). Los [requisitos de escritorio](https://helpx.adobe.com/lightroom-cc/system-requirements.html) dicen que la aplicación intenta validar la suscripción más o menos cada 30 días.

Eso es otro producto que una pestaña gratis. Si ya pagas Creative Cloud, Lightroom es la app en la que se crearon tus `.xmp`. Lightframes no reproduce perfiles, máscaras ni correcciones de objetivo que no importa.

## Cuándo conviene Lightframes

Lightframes conviene cuando quieres esos `.xmp`, o un LUT `.cube`, en un ordenador que no debería llevar suscripción ni instalación. Abre el [editor](/es/editor), importa el preset y exporta JPEG, PNG o WebP. El archivo se queda en el equipo. No hay Adobe ID.

No sincroniza un catálogo ni guarda originales en una biblioteca en la nube. Para una biblioteca RAW instalada y gratis, lee [Lightframes o darktable](/es/comparar/lightframes-vs-darktable). Para capas y PSD, [Lightframes o Photopea](/es/comparar/lightframes-vs-photopea). El repaso de varias herramientas gratis está en [alternativas gratis a Lightroom](/es/blog/alternativas-gratis-a-lightroom).

La tabla de planes de Adobe para web y móvil es distinta del tramo móvil gratis y está escrita para planes individuales de Norteamérica ([acceso web y móvil](https://helpx.adobe.com/creative-cloud/policy-pricing/cc-app-web-mobile-access.html)). Mírala antes de dar por hecho que una función de Lightroom en la web entra en tu plan.
