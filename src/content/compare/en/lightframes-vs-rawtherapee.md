---
key: lightframes-vs-rawtherapee
slug: lightframes-vs-rawtherapee
title: "Lightframes vs RawTherapee"
description: "Lightframes or RawTherapee: .xmp presets and .cube LUTs in the browser, nothing uploaded, or a free desktop raw tool with a queue. Batch and privacy, sourced."
h1: "Lightframes vs RawTherapee"
lead: "Choose Lightframes if you want a free editor in the browser that imports Lightroom .xmp presets and .cube LUTs and does not upload the photos. Choose RawTherapee if you want a free desktop raw developer you install, with a 32-bit float pipeline, a file browser and a processing queue. They are not substitutes: RawTherapee stores processing profiles as .pp3 sidecars, and writing those profiles into XMP is an open request, not the current workflow."
order: 4
updated: 2026-11-12
faq:
  - q: "Can RawTherapee open Lightroom .xmp presets?"
    a: "Not as a develop preset. RawTherapee stores its own processing profiles as .pp3 sidecars. GitHub issue 7315 asks for an option to write that profile into an XMP sidecar, and it is still open. Version 5.13 can show colour labels from XMP embedded in the file, which is metadata, not the Lightroom recipe."
  - q: "Is RawTherapee free?"
    a: "Yes. The project homepage says it is free software under the GPLv3, for Linux, macOS and Windows, with no paid tier described there."
  - q: "Does Lightframes upload photos when you compare it with RawTherapee?"
    a: "No. Lightframes decodes and develops photos in the browser with WebAssembly and Web Workers. They are not sent to a Lightframes server. RawTherapee also keeps photos on disk because it is an installed app."
  - q: "Which one should I use for a lasting RAW library?"
    a: "Install RawTherapee when you want a file browser, a queue and a deep raw pipeline on your own machine. Open Lightframes in the browser when the job is applying .xmp presets or .cube LUTs without an install."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe or with RawTherapee.

## Comparison

| | **Lightframes** | **RawTherapee** |
| --- | --- | --- |
| **Price** | Free. No account and no paid tier. | Free. The [homepage](https://rawtherapee.com/) says you can use it free of charge under the GPLv3. |
| **Licence** | [MIT](https://github.com/joancomadran/lightframes) | GPLv3, stated on the [homepage](https://rawtherapee.com/). |
| **Where it runs** | Current Chrome, Edge, Brave, Firefox and Safari, including Chromebooks. Installable PWA. The editor interface is English. | Linux, macOS and Windows ([homepage](https://rawtherapee.com/)). Version [5.13](https://rawtherapee.com/downloads/5.13/) (26 July 2026) ships Windows and Linux builds for x86_64 and ARM64. macOS needs Tahoe 26 or newer on Apple silicon, or Monterey 12 or newer on Intel. The interface is translated into more than 15 languages. |
| **RAW** | Yes. LibRaw in WebAssembly opens ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF and SRW. The preview is a half-size 16-bit decode; export develops the sensor data again, up to 8192 px on the long edge, and falls back to the embedded JPEG if LibRaw cannot develop the file. | Yes. The [homepage](https://rawtherapee.com/) describes non-destructive 32-bit float processing, demosaicing (including two algorithms on one image), pixel-shift composites, multi-frame raw, dark-frame subtraction, flat-field correction and hot or dead pixel correction, including HDR DNG. Since 5.11 the official builds read raw with an enhanced LibRaw and fall back to an enhanced dcraw ([5.13 notes](https://rawtherapee.com/downloads/5.13/)). |
| **Lightroom .xmp presets** | Import in the Presets tab. Mapped settings include exposure, contrast, highlights, shadows, whites, blacks, temperature and tint, vibrance, saturation, texture, clarity, dehaze, tone curves, HSL, colour grading or split toning, sharpening, noise reduction, vignette and grain. Camera profiles, lens corrections, calibration and local masks are not imported. | No documented import of Lightroom develop presets. Edits live in `.pp3` profiles. [Issue #7315](https://github.com/RawTherapee/RawTherapee/issues/7315) asks to serialise that profile into an XMP sidecar and is still open. Version 5.13 only mentions XMP for colour labels in the file browser. |
| **.cube LUTs** | Import a `.cube` file as a preset, with an intensity slider. | The 5.13 install notes name a Film Simulation tool. They do not describe importing a `.cube` file. |
| **AI features** | On device: background removal and a subject mask (IS-Net, served by this site, about 45 MB) and upscaling (Real-ESRGAN general x4v3, about 5 MB, also from this site). Object removal uses MI-GAN, downloaded from Hugging Face the first time. Photos are not uploaded with the model. | The [homepage](https://rawtherapee.com/) and the [5.13 notes](https://rawtherapee.com/downloads/5.13/) do not list background removal, upscaling or object removal. |
| **Privacy / uploads** | Photos stay in the browser. Edits and presets are stored in IndexedDB on that device. Page visits use cookieless Vercel Web Analytics. The first object-removal download shows your IP to Hugging Face, like any download. | An installed application. Processing profiles are `.pp3` sidecars on your disk ([issue #7315](https://github.com/RawTherapee/RawTherapee/issues/7315)). |
| **Batch** | Copy and paste edits, apply a preset to a filmstrip selection, export a ZIP. There is no photo catalogue: the session lives in the browser. Collage and carousel export are in the same session. | A processing queue. The [5.13 notes](https://rawtherapee.com/downloads/5.13/) describe a Queue output-location template. macOS builds also include an optional `rawtherapee-cli`. |

## When RawTherapee is the better choice

Pick RawTherapee when the job is a raw file on your own computer and the look has to be built in a raw developer, not borrowed from a Lightroom preset. The [homepage](https://rawtherapee.com/) is explicit about a 32-bit float engine, demosaicing, pixel-shift, dark frames and flat fields. Version [5.13](https://rawtherapee.com/downloads/5.13/) adds selective-editing tools, a queue output template, and camera support notes for recent Canon, Nikon, Sony, Fujifilm, Panasonic and other bodies. That list is longer than a browser session can promise: if Lightframes’ bundled LibRaw cannot develop a file, export falls back to the embedded JPEG.

It is also the better choice when you want the interface in your language, a command-line tool, or a queue you can leave running. Nothing there imports the `.xmp` develop preset you already bought.

## When Lightframes is the better choice

Pick Lightframes when you already have Lightroom or Camera Raw `.xmp` presets, or `.cube` LUTs, and you want them on a Chromebook or a borrowed computer. Open the [editor](/editor), use Presets → Import, and set intensity from 0 to 100%. The same session pastes edits across a selection and exports a ZIP, and it can build a [collage](/tools/photo-collage-maker) or an [Instagram carousel](/tools/instagram-carousel-maker). The photo is not uploaded.

Expect a look that is close, not identical: profiles, lens corrections and masks in the XMP are skipped. There is no file browser that survives after you close the tab, no pixel-shift composite and no dark-frame subtraction. For that, RawTherapee is the honest recommendation. A free desktop library with a different module set is covered in [Lightframes vs darktable](/compare/lightframes-vs-darktable). The wider roundup is [free Lightroom alternatives](/blog/free-lightroom-alternatives). The import limits are spelled out on [photo presets](/tools/photo-presets) and [apply a LUT](/tools/apply-lut-to-photo).
