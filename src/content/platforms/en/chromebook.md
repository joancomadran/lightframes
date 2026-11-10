---
key: chromebook
slug: chromebook
title: "Lightroom alternative: Chromebook"
description: "A free Lightroom alternative for Chromebook: Lightframes runs in Chrome, keeps photos on the device and imports .xmp presets and .cube LUTs. No install."
h1: "A free Lightroom alternative for Chromebook"
lead: "On a Chromebook, use Lightframes in Chrome when you want a free RAW and JPEG editor that imports Lightroom .xmp presets and .cube LUTs and does not upload the photos. You do not install a Linux app or a Creative Cloud plan. Adobe’s own mobile FAQ still treats raw editing on a Chromebook as a Creative Cloud feature, not part of the free Lightroom tier."
order: 1
updated: 2026-11-10
faq:
  - q: "Does Lightframes need to be installed on a Chromebook?"
    a: "No. Open it in Chrome. Chrome can also install it as a PWA from the Install app button, after which editing works offline once the app has loaded."
  - q: "Can I open a folder of RAW files?"
    a: "In Chrome, Folder uses the browser’s directory picker when that API exists, which it does in Chromium. The files are read on the device. They are not uploaded."
  - q: "Is the free Lightroom app on Chromebook enough for RAW?"
    a: "Adobe’s mobile FAQ says you can use capture, organisation, sharing and most editing tools for free. Raw editing on a Chromebook is described there for Creative Cloud members, and raw editing is listed among premium features."
  - q: "Will an .xmp preset match Lightroom exactly?"
    a: "Often close for tone and colour. Camera profiles, lens corrections and local masks in the XMP are not imported, so differences are normal."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe.

## What works in Chrome on a Chromebook

Lightframes is a free, open-source (MIT) photo editor that runs entirely in the browser. On a Chromebook that means [Chrome](/editor): open JPEG, PNG or camera RAW, edit, and export JPEG, PNG or WebP. Photos are decoded with LibRaw compiled to WebAssembly and developed in Web Workers. They are not sent to a server.

RAW extensions the editor accepts are `.arw`, `.cr2`, `.cr3`, `.nef`, `.nrw`, `.dng`, `.raf`, `.orf`, `.rw2`, `.pef` and `.srw`. The editing preview is a half-size 16-bit decode. Export develops the sensor data again, up to 8192 px on the long edge, and falls back to the camera’s embedded JPEG if LibRaw cannot develop that file.

Presets → Import reads a Lightroom or Camera Raw `.xmp`, a Lightframes JSON preset or a `.cube` LUT, with intensity from 0 to 100%. Copy and paste edits across the filmstrip and export a selection as a ZIP. The editor interface is English; this page is the English guide.

Chrome on ChromeOS is a Chromium browser, so Open can use the file picker and Folder can use the directory picker. Both read local files. There is no separate Lightframes package to install from the Play Store or from Linux.

## What this is not

darktable publishes builds for Linux, macOS, Windows and BSD ([install](https://www.darktable.org/install/), [features](https://www.darktable.org/about/features/)). It is not a browser app, and this page does not claim a ChromeOS package. If you need its library and modules, that is a desktop install, covered in [Lightframes vs darktable](/compare/lightframes-vs-darktable).

Adobe’s [mobile FAQ](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) says a Creative Cloud member can import and edit raw files in Lightroom for mobile on a Chromebook, and lists raw editing, batch editing and cloud sync as premium. The free tier is capture, organisation, sharing and most basic edits. See [Lightframes vs Lightroom](/compare/lightframes-vs-lightroom) for the wider split, and the [roundup](/blog/free-lightroom-alternatives) if you are still choosing a tool.
