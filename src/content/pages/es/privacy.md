---
key: privacy
slug: privacidad
title: "Política de privacidad"
description: "Cómo trata Lightframes tus datos: tus fotos se editan en tu navegador y nunca se suben. Qué implican el alojamiento, las fuentes y las descargas de IA."
h1: "Política de privacidad"
updated: 2026-10-22
schemaType: WebPage
---

## Resumen

- **Tus fotos no salen de tu dispositivo.** Lightframes abre, decodifica y edita las imágenes dentro de tu navegador (WebAssembly y Web Workers). No se suben a nuestros servidores ni a los de terceros, y no tenemos acceso ni a tus fotos ni a tus ediciones.
- **No hay cuentas de usuario, registro, formulario de contacto ni boletín.**
- **Enlaces de afiliado de Amazon.** El editor y la página de equipo enlazan a Amazon.es. Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables. El enlace abre Amazon solo al hacer clic. Las tarjetas no cargan imágenes ni scripts de Amazon.
- **El borrado de objetos** descarga su modelo de IA de Hugging Face la primera vez que lo usas; tus fotos no salen de tu dispositivo. Esa descarga, como cualquier otra, muestra tu dirección IP a Hugging Face. La eliminación de fondo, las máscaras de sujeto y la ampliación descargan sus modelos desde lightframes.si, no desde otro servidor.
- Como en cualquier web, al visitar Lightframes ciertos datos técnicos (principalmente tu dirección IP) llegan al proveedor de alojamiento. Las visitas se cuentan con Vercel Web Analytics, que no usa cookies y no recibe tus fotos. A continuación te explicamos cada caso.

## Responsable del tratamiento

El responsable del tratamiento de los datos de este sitio web (https://www.lightframes.si) es:

- **Titular:** Joan Comadran, persona física residente en España
- **Contacto:** mensaje directo en X a [@dev_coma](https://x.com/dev_coma)

No se ha designado delegado de protección de datos, al no ser obligatorio en este caso. <!-- TODO legal review: confirmar que no es obligatorio designar DPD. -->

## Qué ocurre con tus fotos y ediciones

Lightframes es un editor de fotos que funciona en el navegador. Cuando abres una foto:

- El archivo se lee y se procesa **localmente**, en tu dispositivo. No se envía a ningún servidor.
- Para que no pierdas el trabajo al recargar la página, el editor guarda una copia de las fotos abiertas, junto con sus nombres, ajustes, valoraciones y marcas, en el almacenamiento **IndexedDB** de tu navegador.
- Tus ajustes preestablecidos (*presets*) también se guardan en IndexedDB, con una copia de seguridad en el **localStorage** del navegador. Algunas preferencias de la interfaz (disposición de la tira de miniaturas, fondo de la vista previa y grupos de ajustes que se pegan) se guardan en localStorage.
- Un ***service worker*** almacena la aplicación en caché para que funcione sin conexión.

Esta información permanece en tu navegador. **Nosotros no la recibimos en ningún momento**, por lo que no la tratamos como datos personales. Puedes borrarla cuando quieras quitando las fotos del editor o eliminando los datos de este sitio desde la configuración de tu navegador. En la Política de cookies encontrarás el detalle de todo lo que se guarda en tu dispositivo.

### Herramientas de inteligencia artificial

Las funciones de IA (eliminación de fondo, máscaras de sujeto, ampliación y borrado de objetos) también se ejecutan íntegramente en tu dispositivo. Para ello necesitan un archivo de modelo, que se descarga la primera vez que usas cada herramienta y queda guardado en la Cache Storage del navegador:

- **El borrado de objetos** descarga su modelo de IA (MI-GAN) de Hugging Face (huggingface.co) la primera vez que lo usas; tus fotos no salen de tu dispositivo. Esa petición, como cualquier descarga, revela tu dirección IP, el tipo de navegador y la hora a Hugging Face, Inc. Solo se descarga el archivo del modelo. Hugging Face trata esos datos conforme a su propia política de privacidad (https://huggingface.co/privacy).
- **La eliminación de fondo, las máscaras de sujeto y la ampliación** descargan sus modelos (IS-Net y Real-ESRGAN) desde lightframes.si. Ninguna otra función de IA pide un modelo a un servidor externo.

<!-- TODO legal review: valorar alojar el modelo MI-GAN en /models/ para evitar esta petición a un tercero. -->

## Datos que tratamos (directamente o a través de proveedores)

### 1. Alojamiento y registros del servidor

- **Datos:** dirección IP, fecha y hora de la petición, URL solicitada, página de procedencia, navegador y sistema operativo (*user agent*) y código de respuesta.
- **Finalidad:** servir la web, mantener su seguridad y diagnosticar errores.
- **Base jurídica:** nuestro interés legítimo en mantener un sitio web seguro y operativo (art. 6.1.f RGPD).
- **Destinatario:** el proveedor de alojamiento, Vercel Inc. (EE. UU.), como encargado del tratamiento.
- **Conservación:** el plazo durante el que Vercel conserva los registros en nuestro plan, según los plazos de conservación de la propia Vercel. <!-- TODO legal review: confirmar el plazo de conservación de logs de Vercel para el plan contratado. -->

### 2. Estadísticas de visitas (Vercel Web Analytics)

- **Datos:** páginas visitadas, página de procedencia, país aproximado, navegador, sistema operativo y tipo de dispositivo.
- **Finalidad:** conocer, de forma agregada, cuántas personas usan la web y qué páginas resultan útiles.
- **Funcionamiento:** según Vercel, Web Analytics no utiliza cookies, no elabora perfiles entre sitios y cuenta las visitas mediante un identificador efímero derivado de la propia petición, que no se conserva más allá de un periodo breve. Nosotros solo vemos estadísticas agregadas y no podemos identificar a ningún visitante.
- **Base jurídica:** nuestro interés legítimo en conocer de forma agregada el uso del sitio (art. 6.1.f RGPD).
- **Destinatario:** Vercel Inc., como encargado del tratamiento.

<!-- TODO legal review: verificar la documentación vigente de Vercel Web Analytics (identificador, conservación, si almacena algo en el dispositivo) y confirmar que no requiere consentimiento conforme al art. 22.2 LSSI-CE. -->

### 3. Fuentes tipográficas

Las tipografías de la web se sirven desde el propio dominio lightframes.si. Para mostrarlas no se hace ninguna petición a Google Fonts ni a ningún otro tercero.

### 4. Si nos escribes

No hay formulario de contacto. Si nos envías un mensaje directo en X ([@dev_coma](https://x.com/dev_coma)), usaremos tu nombre de usuario y el contenido del mensaje únicamente para responderte. Ese mensaje también lo trata X Corp. conforme a sus propias condiciones y política de privacidad. La base jurídica es tu propia solicitud y nuestro interés legítimo en atenderla (art. 6.1.f RGPD). Conservaremos la conversación mientras sea necesario para gestionarla y no más, salvo que la ley exija un plazo mayor.

Si abres una incidencia (*issue*) o una conversación en GitHub (https://github.com/joancomadran/lightframes), ese contenido es **público** y lo trata GitHub, Inc. conforme a sus propias condiciones y política de privacidad.

## Enlaces de afiliado, donaciones y sitios externos

- **Enlaces de afiliado de Amazon.** Algunos enlaces llevan a Amazon.es e incluyen nuestro identificador del Programa de Afiliados de Amazon. Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables. Ver una página no carga imágenes ni scripts de Amazon: las tarjetas se dibujan en la propia página y el enlace abre Amazon solo al hacer clic. Solo entonces Amazon registra la visita y puede instalar sus propias cookies en amazon.es, conforme a sus avisos de privacidad y de cookies. Nosotros solo recibimos informes agregados de clics y ventas, nunca tu identidad.
- **Donaciones.** El botón «Buy me a coffee» enlaza con https://buymeacoffee.com/devcoma. Si haces una donación, el pago lo gestionan Buy Me a Coffee y sus proveedores de pago conforme a sus propias condiciones. Podemos recibir tu nombre o el mensaje que decidas dejar, que solo utilizaremos para gestionar y agradecer la donación. <!-- TODO legal review: confirmar qué datos comparte Buy Me a Coffee con el creador y el plazo de conservación necesario a efectos fiscales. -->
- **Otros enlaces** (GitHub, orígenes de los modelos, etc.) llevan a sitios con sus propias políticas de privacidad, que no controlamos.

## Publicidad

La web reserva espacios para anuncios, pero **actualmente no hay ninguna red publicitaria activa** ni se instalan cookies publicitarias.

<!-- TODO legal review: reescribir esta sección cuando se active una red publicitaria. -->
Si en el futuro activamos un servicio de publicidad (por ejemplo, Google AdSense), actualizaremos previamente esta política y la Política de cookies, y una plataforma de gestión del consentimiento te pedirá permiso antes de utilizar cualquier cookie o tecnología similar que no sea estrictamente necesaria. Podrás rechazarlas o retirar tu consentimiento con la misma facilidad con que lo diste.

## Transferencias internacionales

Algunos de los proveedores citados tienen su sede en Estados Unidos (Vercel, Hugging Face y, si nos escribes por ahí, X). Cuando se transfieren datos personales fuera del Espacio Económico Europeo, la transferencia se ampara en la decisión de adecuación de la Comisión Europea relativa al Marco de Privacidad de Datos UE-EE. UU., en el caso de los proveedores adheridos a él, o en las cláusulas contractuales tipo aprobadas por la Comisión.

<!-- TODO legal review: confirmar la adhesión al DPF o las CCT de cada proveedor (Vercel, Hugging Face, X). -->

## Destinatarios

No vendemos, alquilamos ni cedemos tus datos a terceros para sus propios fines. Fuera de los proveedores indicados, solo se comunicarán datos cuando exista una obligación legal (por ejemplo, a requerimiento de un juzgado o de una autoridad pública).

## Tus derechos

Puedes ejercer tus derechos de **acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad** enviándonos un mensaje directo en X a [@dev_coma](https://x.com/dev_coma). Indícanos qué derecho quieres ejercer; si fuera necesario, te pediremos información para verificar tu identidad. Te responderemos en el plazo de un mes.

Ten en cuenta que apenas tratamos datos que puedan vincularse contigo: tus fotos, ediciones y *presets* solo están en tu propio dispositivo y puedes borrarlos tú mismo en cualquier momento.

Si consideras que tus datos no se han tratado correctamente, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (https://www.aepd.es) o ante la autoridad de control de tu país.

## Menores de edad

Lightframes no recaba conscientemente datos personales de menores. Conforme a la normativa española, los menores de 14 años no pueden consentir por sí mismos el tratamiento de sus datos.

## Seguridad

La web se sirve exclusivamente mediante HTTPS. Como tus fotos se procesan y guardan en local, su seguridad depende también de tu dispositivo: si compartes el ordenador, recuerda que el editor conserva las fotos abiertas hasta que las quites o borres los datos del sitio.

## Decisiones automatizadas

No tomamos decisiones automatizadas ni elaboramos perfiles que produzcan efectos jurídicos o te afecten de forma significativa.

## Cambios en esta política

Podemos actualizar esta política cuando cambie el funcionamiento de la web (por ejemplo, si alojamos las fuentes en nuestro dominio o activamos la publicidad). La fecha indicada muestra la versión vigente. Si el cambio es relevante, lo indicaremos de forma visible en la web.
