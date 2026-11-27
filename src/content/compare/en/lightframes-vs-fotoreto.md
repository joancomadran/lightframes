---
key: lightframes-vs-fotoreto
slug: lightframes-vs-fotoreto
title: "Lightframes vs Fotoreto"
description: "Lightframes or Fotoreto for a shoot: a free MIT browser editor with RAW, presets and collages, or culling and AI skin retouch. Prices as of November 2026."
h1: "Lightframes vs Fotoreto"
lead: "Choose Lightframes if you want a free editor in the browser, MIT licensed, with no account and no cap on how many photos a session can hold. It develops RAW, applies Lightroom .xmp presets and .cube LUTs in a batch, removes objects, and exports collages and seamless Instagram carousels, and the photos stay on your device. Choose Fotoreto if you want to cull a whole shoot, retouch skin with AI, and use a native app. Fotoreto is proprietary and freemium, and its download page describes the web version as light editing."
order: 7
updated: 2026-11-27
faq:
  - q: "Is Fotoreto free?"
    a: "Partly. The [pricing page](https://fotoreto.com/en/pricing/), as of November 2026, lists a free plan with no account: up to 10 photos per session, 10 colour looks and your own .cube LUTs. Premium is $12.99 for 365 days or $19.99 once. Master is $39.99 for 365 days or $79.99 once. Payments do not auto-renew and are not per-photo credits."
  - q: "Does Fotoreto upload photos?"
    a: "Its homepage says no. Photos are read and edited on the device, in the installed app or in the browser. If you sign in, the server knows the account and the plan. Lightframes also keeps photos in the browser and does not send them to a Lightframes server."
  - q: "Can Fotoreto open Lightroom .xmp presets?"
    a: "On Premium, yes, and .lrtemplate files with embedded colour profiles. The free plan can add .cube LUTs and does not import .xmp. Lightframes imports .xmp and .cube in the free editor, and does not import .lrtemplate files or camera profiles."
  - q: "Does either one make a collage or a seamless Instagram carousel?"
    a: "Lightframes does: a collage of 1 to 9 photos, and a carousel of 2 to 10 slides cut from one strip so the picture continues across the swipe. Public Fotoreto pages checked on 20 November 2026 describe an Instagram export size and photo frames. They do not describe that collage or that carousel."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe or with Fotoreto. Fotoreto is a separate product from Hoang Phuc Photo.

## Comparison

| | **Lightframes** | **Fotoreto** |
| --- | --- | --- |
| **Price** | Free. No account and no paid tier. The source has no session photo cap. Large RAW batches are limited by the memory of the device, and export stops at 8192 px on the long edge. | Freemium. Free: up to 10 photos per session and 10 colour looks. Premium: $12.99 for 365 days or $19.99 once. Master: $39.99 for 365 days or $79.99 once. One-time payments, no auto-renewal and no per-photo editing credits, as of November 2026 ([pricing](https://fotoreto.com/en/pricing/)). That page says App Store and Google Play prices are higher, and marks those store apps as coming soon. Photo frames on the free plan keep a name line on the frame. |
| **Licence** | [MIT](https://github.com/joancomadran/lightframes), source on GitHub. | Proprietary. The public site does not publish the source (checked 20 November 2026). |
| **Where it runs** | Current Chrome, Edge, Brave, Firefox and Safari, including Chromebooks. Installable PWA. The editor interface is English. The site is English and Spanish. | Native apps for Windows 10 and 11, Mac (Apple silicon and Intel), Android and iPhone, plus a web version on Chrome, Edge, Safari and Firefox ([homepage](https://fotoreto.com/en/), [download](https://fotoreto.com/en/download/)). The download page says the web app is meant for light editing only. The 12 November 2026 [changelog](https://fotoreto.com/en/blog/changelog/) adds 12 languages on top of Vietnamese and English, 14 in all. |
| **RAW** | Yes. JPEG, PNG, WebP, HEIC and HEIF open in the editor too (not TIFF). HEIC uses the system decoder when available; in Chrome or Firefox the first HEIC downloads its decoder from lightframes.si. LibRaw in WebAssembly opens ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF and SRW. The preview is a half-size 16-bit decode for RAW; export develops the sensor data again, up to 8192 px on the long edge, and falls back to the embedded JPEG if LibRaw cannot develop the file. Export is JPEG, PNG or WebP. See [RAW to JPG](/tools/raw-to-jpg). | Yes, on computers, including the free plan. The [homepage](https://fotoreto.com/en/) says it edits 16-bit RAW from Sony, Canon, Nikon, Fujifilm, Olympus, Panasonic and DNG, and that phones edit the embedded JPEG. It also opens JPEG, PNG, HEIC, WebP and TIFF. Master adds 16-bit TIFF and PNG export ([pricing](https://fotoreto.com/en/pricing/)). |
| **Lightroom .xmp presets** | Import in the Presets tab, including onto a filmstrip selection. Mapped settings include exposure, contrast, highlights, shadows, whites, blacks, temperature and tint, vibrance, saturation, texture, clarity, dehaze, tone curves, HSL, colour grading or split toning, sharpening, noise reduction, vignette and grain. Camera profiles, lens corrections, calibration, local masks and legacy `.lrtemplate` files are not imported. | Premium imports `.xmp` and `.lrtemplate`, including embedded colour profiles ([homepage](https://fotoreto.com/en/)). The free plan does not import `.xmp`. |
| **.cube LUTs** | Import a `.cube` file as a preset, with an intensity slider, and apply it to a selection. | Your own `.cube` LUTs are on the free plan ([pricing](https://fotoreto.com/en/pricing/)). |
| **AI features** | On device: background removal and a subject mask (models served by this site, about 45 MB and 5 MB for the upscaler), and object removal (MI-GAN, downloaded from Hugging Face the first time). Photos are not uploaded with the model. There is no AI skin retouch and no sky replacement. | Free: blemish removal, skin smoothing and face brightening. Premium: AI face and body skin retouch, object removal, background blur, sky replacement and group face swap. The homepage says the AI runs on the device. |
| **Privacy / uploads** | Photos stay in the browser. Edits and presets are stored in IndexedDB on that device. Page visits use cookieless Vercel Web Analytics. The first object-removal download shows your IP to Hugging Face, like any download. | Photos stay on the device, in the installed app and in the browser. The [homepage](https://fotoreto.com/en/) says nothing is uploaded or stored online. Signing in tells the server the account and the plan. |
| **Batch** | Copy and paste edits, apply a preset to a filmstrip selection, export a ZIP. You can set stars and pick or reject flags by hand. There is no automatic culling and no photo catalogue: the session lives in the browser. | Premium culls a shoot (duplicates, blur, camera shake, missed focus, exposure, closed eyes) and syncs a look across it, while each frame is still balanced on its own ([homepage](https://fotoreto.com/en/)). The free plan stops at 10 photos per session. |

## When Fotoreto is the better choice

Pick Fotoreto when the job is a whole shoot: flag the weak frames, retouch skin, and send the set out. Culling is a Premium feature. The free plan already finds blemishes for you to review, smooths skin by zone and brightens a backlit face. Premium adds the AI face and body skin sliders, face and body shaping, all 111 HoangPhucPhoto looks, and object removal with background blur and sky replacement. The [homepage](https://fotoreto.com/en/) says that AI runs on the device and that photos are never uploaded.

It is also the better choice when you want a native app. The [download page](https://fotoreto.com/en/download/) points to Windows, Mac, Android and iPhone, and says the web app is for light editing because of browser limits. On a computer, 16-bit RAW is on every plan, free included. Master, listed on the same [pricing page](https://fotoreto.com/en/pricing/), adds 16-bit TIFF and PNG export, scopes and frequency separation. The interface is offered in 14 languages. Lightframes does not cull a shoot, does not retouch skin with a slider, and keeps the editor interface in English.

## When Lightframes is the better choice

Pick Lightframes when the editor has to stay free, with the code on GitHub under the MIT licence, and with no 10-photo session cap. Open the [editor](/editor), import an `.xmp` or a `.cube` (profiles, lens corrections, masks and `.lrtemplate` files are skipped), set intensity from 0 to 100%, and paste that look onto the filmstrip. The same session exports a ZIP, builds a [collage](/tools/photo-collage-maker) and a [seamless Instagram carousel](/tools/instagram-carousel-maker), [removes objects](/tools/remove-objects-from-photos), and converts [RAW to JPG](/tools/raw-to-jpg). Nothing in that path uploads the photo.

Public Fotoreto pages checked on 20 November 2026 do not describe a collage grid or a carousel that continues one picture across slides. They do describe an Instagram save size and photo frames. Lightframes has no native Windows, Mac or phone app, no automatic culling and no AI skin retouch. For a desktop RAW library, see [Lightframes vs darktable](/compare/lightframes-vs-darktable). The wider roundup is [free Lightroom alternatives](/blog/free-lightroom-alternatives).
