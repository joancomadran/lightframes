---
key: cookies
slug: cookies
title: "Cookie policy"
description: "Lightframes sets no analytics or advertising cookies. This page lists what the editor stores on your device to keep your work and run offline."
h1: "Cookie policy"
updated: 2026-10-20
schemaType: WebPage
---

<!-- TODO legal review: first draft, not yet reviewed by a lawyer. Fill in every [PLACEHOLDER] before publishing. -->

## In short

**Lightframes does not set any cookies of its own**, and it uses no analytics or advertising cookies. It does store some information in your browser (localStorage, IndexedDB, Cache Storage and a service worker) so that the editor can keep your work, remember your preferences and run offline. All of it stays on your device, we never receive it, and you can delete it whenever you want.

## What cookies and similar technologies are

Cookies are small files that a website saves in your browser. The same rules apply to other technologies that store or read information on your device, such as localStorage, IndexedDB, Cache Storage or service workers. Under Spanish law (article 22.2 of Law 34/2002, LSSI-CE) and the guidance of the Spanish Data Protection Agency (AEPD), they require your consent unless they are strictly necessary to provide a service you have expressly requested.

Everything Lightframes stores falls into that exception: it exists only to make the editor you are using work (keep your photos and edits, your presets and your interface settings, and load the app and its AI models). That is why the site does not show a cookie banner.

## What is stored on your device

All the items below are **first-party** (they belong to lightframes.si), are created only by the editor running in your browser, and **are never sent to us**. They have no expiry date: they remain until you delete them, unless stated otherwise.

| Name | Type | Purpose | Duration | Party |
|---|---|---|---|---|
| `lightframes-session` | IndexedDB | Keeps a copy of the photos you have open, with their names, edits, ratings, flags and selection, so your work survives a reload. | Until you remove the photos from the editor or clear the site's data | First-party |
| `lightframes-presets` | IndexedDB | Stores the presets you create or import. | Until you delete them or clear the site's data | First-party |
| `lightframes.presets.v1` | localStorage | Backup copy of your presets (original storage location, kept so a preset is never lost). | Until you clear the site's data | First-party |
| `lightframes:filmstrip-layout` | localStorage | Remembers the filmstrip layout you chose. | Until you clear the site's data | First-party |
| `lightframes:preview-background` | localStorage | Remembers the preview background colour you chose. | Until you clear the site's data | First-party |
| `lightframes:paste-groups` | localStorage | Remembers which groups of settings are applied when you paste edits. | Until you clear the site's data | First-party |
| `lightframes-models` | Cache Storage | Keeps the AI model files (background removal, upscaling, object removal) after their first download, so they are not downloaded again. | Until you clear the site's data | First-party |
| `workbox-precache-…` | Cache Storage | Copy of the application files so the editor loads quickly and works offline. | Replaced on each app update; until you clear the site's data | First-party |
| `inpaint-runtime` | Cache Storage | Keeps the AI runtime (WebAssembly) once you have used an AI tool. | Up to 2 versions kept; until you clear the site's data | First-party |
| `samples` | Cache Storage | Keeps the demo photos once you have opened them, for offline use. | Up to 10 files; until you clear the site's data | First-party |
| `google-fonts` | Cache Storage | Local copy of the site's typefaces, to avoid downloading them again. | Up to 1 year | First-party |
| Service worker (lightframes.si) | Service worker | Serves the cached application and enables offline use. | Until you clear the site's data or unregister it | First-party |

<!-- TODO: the cache names come from the current PWA configuration (vite.config.ts) and the code in src/lib and src/components. Re-check this table after the migration to Astro / workbox-build, and whenever storage keys change. -->

## Third-party services

- **Analytics.** We use Vercel Web Analytics to obtain aggregated visit statistics. According to Vercel, it does not use cookies. <!-- TODO legal review: confirm that Vercel Web Analytics stores nothing on the device. -->
- **Fonts.** The site's fonts are requested from Google Fonts (fonts.googleapis.com, fonts.gstatic.com). These requests do not set cookies on your device, but they do transmit your IP address to Google; see the Privacy policy. <!-- TODO: self-host the fonts to remove this request. -->
- **AI model download.** The object-removal model is downloaded from huggingface.co. The download is made without sending or accepting cookies.
- **Links to other sites.** If you click a link to Amazon.es (affiliate links), Buy Me a Coffee or GitHub, those sites may set their own cookies **on their own domain**, under their own cookie policies. Lightframes does not set or read those cookies. In particular, when you click an Amazon affiliate link, Amazon may use cookies to attribute any qualifying purchase to our Associates account.

## Advertising

There is space reserved for ads on the site, but **no advertising network is currently active** and no advertising cookies are used.

<!-- TODO legal review: replace this section with the real list of cookies and the consent mechanism if an ad network is enabled. -->
If we enable an advertising service in the future (for example, Google AdSense), we will update this policy first, and a consent management platform will ask for your consent **before** any non-essential cookie or similar technology is used. You will be able to accept, reject or configure them, and change your choice at any time as easily as you made it.

## How to delete or block this data

You can delete everything Lightframes has stored by clearing this site's data in your browser settings:

- **Chrome / Edge:** Settings → Privacy and security → Site settings (or Cookies and site permissions) → View permissions and data stored across sites → lightframes.si → Delete data.
- **Firefox:** Settings → Privacy & Security → Cookies and Site Data → Manage Data → lightframes.si → Remove.
- **Safari (macOS):** Settings → Privacy → Manage Website Data → lightframes.si → Remove.
- **Safari (iOS):** Settings → Safari → Advanced → Website Data → lightframes.si → delete.

You can also block site storage altogether. If you do, the editor will still open photos, but it will not be able to keep your work after a reload, save presets, remember your preferences or work offline.

## Changes to this policy

We will update this policy whenever what is stored on your device changes. The date at the top shows the latest version. For anything else about your data, see the Privacy policy or write to [CONTACT EMAIL].
