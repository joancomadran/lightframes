---
key: cookies
slug: cookies
title: "Política de cookies"
description: "Lightframes no usa cookies analíticas ni publicitarias. Qué guarda el editor en tu dispositivo para conservar tu trabajo y funcionar sin conexión."
h1: "Política de cookies"
updated: 2026-10-20
schemaType: WebPage
---

<!-- TODO legal review: primer borrador, pendiente de revisión jurídica. Completar todos los [MARCADORES] antes de publicar. -->

## Resumen

**Lightframes no instala cookies propias** ni utiliza cookies analíticas o publicitarias. Sí guarda cierta información en tu navegador (localStorage, IndexedDB, Cache Storage y un *service worker*) para que el editor conserve tu trabajo, recuerde tus preferencias y funcione sin conexión. Todo ello permanece en tu dispositivo, nosotros no lo recibimos y puedes borrarlo cuando quieras.

## Qué son las cookies y tecnologías similares

Las cookies son pequeños archivos que un sitio web guarda en tu navegador. Las mismas reglas se aplican a otras tecnologías que almacenan o leen información en tu dispositivo, como localStorage, IndexedDB, Cache Storage o los *service workers*. Conforme al artículo 22.2 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), y a la Guía sobre el uso de las cookies de la Agencia Española de Protección de Datos (AEPD), requieren tu consentimiento salvo que sean estrictamente necesarias para prestar un servicio que hayas solicitado expresamente.

Todo lo que almacena Lightframes se acoge a esa excepción: solo sirve para que funcione el editor que estás utilizando (conservar tus fotos y ediciones, tus *presets* y tus preferencias de interfaz, y cargar la aplicación y sus modelos de IA). Por eso la web no muestra un aviso de cookies.

## Qué se guarda en tu dispositivo

Todos los elementos siguientes son **propios** (pertenecen a lightframes.si), los crea únicamente el editor que se ejecuta en tu navegador y **nunca se nos envían**. No tienen fecha de caducidad: se conservan hasta que los borres, salvo que se indique otra cosa.

| Nombre | Tipo | Finalidad | Duración | Titularidad |
|---|---|---|---|---|
| `lightframes-session` | IndexedDB | Guarda una copia de las fotos que tienes abiertas, con sus nombres, ajustes, valoraciones, marcas y selección, para que no pierdas el trabajo al recargar. | Hasta que quites las fotos del editor o borres los datos del sitio | Propia |
| `lightframes-presets` | IndexedDB | Guarda los *presets* que creas o importas. | Hasta que los elimines o borres los datos del sitio | Propia |
| `lightframes.presets.v1` | localStorage | Copia de seguridad de tus *presets* (ubicación original, que se mantiene para que nunca se pierda ninguno). | Hasta que borres los datos del sitio | Propia |
| `lightframes:filmstrip-layout` | localStorage | Recuerda la disposición elegida para la tira de miniaturas. | Hasta que borres los datos del sitio | Propia |
| `lightframes:preview-background` | localStorage | Recuerda el color de fondo elegido para la vista previa. | Hasta que borres los datos del sitio | Propia |
| `lightframes:paste-groups` | localStorage | Recuerda qué grupos de ajustes se aplican al pegar ediciones. | Hasta que borres los datos del sitio | Propia |
| `lightframes-models` | Cache Storage | Conserva los modelos de IA (eliminación de fondo, ampliación y borrado de objetos) tras su primera descarga, para no volver a descargarlos. | Hasta que borres los datos del sitio | Propia |
| `workbox-precache-…` | Cache Storage | Copia de los archivos de la aplicación para que el editor cargue rápido y funcione sin conexión. | Se renueva con cada actualización; hasta que borres los datos del sitio | Propia |
| `inpaint-runtime` | Cache Storage | Conserva el motor de IA (WebAssembly) una vez que has usado una herramienta de IA. | Máximo 2 versiones; hasta que borres los datos del sitio | Propia |
| `samples` | Cache Storage | Conserva las fotos de demostración una vez abiertas, para usarlas sin conexión. | Máximo 10 archivos; hasta que borres los datos del sitio | Propia |
| `google-fonts` | Cache Storage | Copia local de las tipografías de la web, para no volver a descargarlas. | Hasta 1 año | Propia |
| *Service worker* (lightframes.si) | *Service worker* | Sirve la aplicación almacenada en caché y permite usarla sin conexión. | Hasta que borres los datos del sitio o lo desregistres | Propia |

<!-- TODO: los nombres de caché proceden de la configuración PWA actual (vite.config.ts) y del código de src/lib y src/components. Revisar la tabla tras la migración a Astro / workbox-build y cada vez que cambien las claves de almacenamiento. -->

## Servicios de terceros

- **Analítica.** Utilizamos Vercel Web Analytics para obtener estadísticas agregadas de visitas. Según Vercel, no utiliza cookies. <!-- TODO legal review: confirmar que Vercel Web Analytics no almacena nada en el dispositivo. -->
- **Fuentes tipográficas.** Las tipografías de la web se solicitan a Google Fonts (fonts.googleapis.com y fonts.gstatic.com). Estas peticiones no instalan cookies en tu dispositivo, pero sí transmiten tu dirección IP a Google; consulta la Política de privacidad. <!-- TODO: alojar las fuentes en el propio dominio para eliminar esta petición. -->
- **Descarga del modelo de IA.** El modelo de borrado de objetos se descarga desde huggingface.co. La descarga se realiza sin enviar ni aceptar cookies.
- **Enlaces a otros sitios.** Si haces clic en un enlace a Amazon.es (enlaces de afiliado), Buy Me a Coffee o GitHub, esos sitios pueden instalar sus propias cookies **en su propio dominio**, conforme a sus respectivas políticas de cookies. Lightframes no instala ni lee esas cookies. En particular, al hacer clic en un enlace de afiliado, Amazon puede utilizar cookies para atribuir a nuestra cuenta de afiliado las compras que cumplan los requisitos aplicables.

## Publicidad

La web reserva espacios para anuncios, pero **actualmente no hay ninguna red publicitaria activa** ni se utilizan cookies publicitarias.

<!-- TODO legal review: sustituir esta sección por el listado real de cookies y el mecanismo de consentimiento si se activa una red publicitaria. -->
Si en el futuro activamos un servicio de publicidad (por ejemplo, Google AdSense), actualizaremos antes esta política y una plataforma de gestión del consentimiento te pedirá permiso **antes** de utilizar cualquier cookie o tecnología similar que no sea estrictamente necesaria. Podrás aceptarlas, rechazarlas o configurarlas, y cambiar tu decisión en cualquier momento con la misma facilidad con que la tomaste.

## Cómo borrar o bloquear estos datos

Puedes eliminar todo lo que Lightframes ha guardado borrando los datos de este sitio desde la configuración del navegador:

- **Chrome / Edge:** Configuración → Privacidad y seguridad → Configuración de sitios (o Cookies y permisos del sitio) → Ver permisos y datos almacenados en los sitios → lightframes.si → Eliminar datos.
- **Firefox:** Ajustes → Privacidad & Seguridad → Cookies y datos del sitio → Administrar datos → lightframes.si → Eliminar.
- **Safari (macOS):** Ajustes → Privacidad → Gestionar datos de sitios web → lightframes.si → Eliminar.
- **Safari (iOS):** Ajustes → Safari → Avanzado → Datos de sitios web → lightframes.si → eliminar.

También puedes bloquear por completo el almacenamiento del sitio. En ese caso, el editor seguirá abriendo fotos, pero no podrá conservar tu trabajo al recargar, guardar *presets*, recordar tus preferencias ni funcionar sin conexión.

## Cambios en esta política

Actualizaremos esta política cada vez que cambie lo que se guarda en tu dispositivo. La fecha indicada muestra la versión vigente. Para cualquier otra cuestión sobre tus datos, consulta la Política de privacidad o escríbenos a [EMAIL DE CONTACTO].
