---
key: lightframes-vs-darktable
slug: lightframes-vs-darktable
title: "Lightframes vs darktable"
description: "Lightframes or darktable as a free Lightroom alternative: browser .xmp presets and .cube LUTs, or a desktop RAW library. RAW, batch, AI and privacy, sourced."
h1: "Lightframes vs darktable"
lead: "Choose Lightframes if you want a free editor in the browser that imports Lightroom .xmp presets and .cube LUTs and keeps the photos on your device. Choose darktable if you want a free desktop raw developer with a real photo library, OpenCL and a module pipeline you install. They are not substitutes: darktable’s own FAQ says presets from other programs, including Lightroom, are not compatible."
order: 1
updated: 2026-11-10
faq:
  - q: "Is darktable a free Lightroom alternative?"
    a: "darktable’s FAQ says yes and no. It edits raw files and manages a library, but it is not a direct replacement, and the learning curve is steep because little of a Lightroom workflow transfers."
  - q: "Can darktable open Lightroom .xmp presets?"
    a: "No. darktable says styles are specific to the program that created them. It can use LUTs in several formats instead. A very basic Lightroom edit import exists, and the same FAQ calls that code old and somewhat broken."
  - q: "Does Lightframes upload photos when you compare it with a desktop app?"
    a: "No. Lightframes decodes and develops photos in the browser with WebAssembly and Web Workers. They are not sent to a Lightframes server. darktable also keeps photos local because it is an installed app."
  - q: "Which one should I install on Linux?"
    a: "If you want a catalogue, tethering and a full raw pipeline, install darktable from your package manager or the project’s AppImage. If you want to apply .xmp presets without installing anything, open Lightframes in the browser."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe. darktable is a separate project.

## Comparison

| | **Lightframes** | **darktable** |
| --- | --- | --- |
| **Price** | Free. No account and no paid tier. | Free. |
| **Licence** | [MIT](https://github.com/joancomadran/lightframes) | GNU GPL, version 3 or later, stated in the [source headers](https://github.com/darktable-org/darktable/blob/master/src/is_supported_platform.h) |
| **Where it runs** | Current Chrome, Edge, Brave, Firefox and Safari, including Chromebooks. Installable PWA. The editor interface is English. | Linux, macOS, Windows, BSD and Solaris, per the [features page](https://www.darktable.org/about/features/). Current macOS builds need 13.5 or later and are Apple silicon only; there is no official Intel Mac release ([install](https://www.darktable.org/install/)). |
| **RAW** | Yes. LibRaw in WebAssembly opens ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF and SRW. The preview is a half-size 16-bit decode; export develops the sensor data again, up to 8192 px on the long edge, and falls back to the embedded JPEG if LibRaw cannot develop the file. | Yes. The [features page](https://www.darktable.org/about/features/) lists standard, raw and HDR formats such as JPEG, CR2, NEF and RAF. Camera support is listed on the [camera support page](https://www.darktable.org/resources/camera-support/). |
| **Lightroom .xmp presets** | Import in the Presets tab. Mapped settings include exposure, contrast, highlights, shadows, whites, blacks, temperature and tint, vibrance, saturation, texture, clarity, dehaze, tone curves, HSL, colour grading or split toning, sharpening, noise reduction, vignette and grain. Camera profiles, lens corrections, calibration and local masks are not imported. | No. Presets (styles) from other programs are not compatible ([FAQ](https://www.darktable.org/about/faq/)). |
| **.cube LUTs** | Import a `.cube` file as a preset, with an intensity slider. | LUTs in several formats, as a way to share looks across programs ([FAQ](https://www.darktable.org/about/faq/)). |
| **AI features** | On device: background removal and a subject mask (models served by this site, about 45 MB and 5 MB for the upscaler), and object removal (MI-GAN, downloaded from Hugging Face the first time). Photos are not uploaded with the model. | darktable has AI features, but the FAQ says that as of September 2026 the Flatpak build does not include them. The FAQ does not list what those features are, so this page does not describe them. |
| **Privacy / uploads** | Photos stay in the browser. Edits and presets are stored in IndexedDB on that device. Page visits use cookieless Vercel Web Analytics. The first object-removal download shows your IP to Hugging Face, like any download. | A local application. Originals are not modified; settings go to a database and XMP sidecars ([features](https://www.darktable.org/about/features/)). |
| **Batch** | Copy and paste edits, apply a preset to a filmstrip selection, export a ZIP. There is no photo catalogue: the session lives in the browser. | Library search, ratings and labels, an export system (JPEG, PNG, TIFF, HDR) and Lua scripting ([features](https://www.darktable.org/about/features/)). |

## When darktable is the better choice

Pick darktable when the job is a lasting raw library on your own disk. Its [features page](https://www.darktable.org/about/features/) describes non-destructive editing, a 32-bit float pipeline, OpenCL, display colour management, tethered shooting for some cameras, and export to web galleries as well as files. The [FAQ](https://www.darktable.org/about/faq/) is explicit that this is a toolbox with a steep learning curve, not a Lightroom skin.

It is also the better choice on Linux when you want a native app from your distribution, an AppImage or a Flatpak. Remember the Flatpak limit on AI features noted above, and the macOS limit: official builds currently target Apple silicon on macOS 13.5 or newer.

## When Lightframes is the better choice

Pick Lightframes when you already have Lightroom or Camera Raw `.xmp` presets, or `.cube` LUTs, and you want to apply them without installing a raw developer. Open the [editor](/editor), use Presets → Import, and set intensity from 0 to 100%. The same session does batch paste and ZIP export, plus collage and carousel export.

It is the practical option on a Chromebook or a borrowed computer, because nothing is installed and the files are read from disk in the tab. Expect a look that is close, not identical: profiles, lens corrections and masks in the XMP are skipped. There is no lighttable database, no tethering and no Lua. For that, darktable is the honest recommendation, and the [free Lightroom alternatives](/blog/free-lightroom-alternatives) guide covers RawTherapee and Photopea as well.
