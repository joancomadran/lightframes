---
key: linux
slug: linux
title: "Lightroom for Linux? Free in the browser"
description: "Adobe lists Lightroom desktop for Windows and macOS, not Linux. Lightframes is a free browser alternative: RAW and .xmp presets, nothing uploaded."
h1: "Lightroom for Linux"
lead: "No: Adobe’s published desktop requirements for Lightroom list Windows and macOS, not Linux. Open Lightframes in Firefox or Chrome for .xmp presets, .cube LUTs and a RAW session in the browser, with nothing uploaded. Install darktable when you want a native library, OpenCL and a module pipeline."
order: 3
updated: 2026-11-24
faq:
  - q: "Is there an official Lightroom for Linux?"
    a: "No. Adobe’s published desktop requirements for Lightroom list Windows and macOS, not a Linux build ([system requirements](https://helpx.adobe.com/lightroom-cc/system-requirements.html))."
  - q: "Can I use my Lightroom .xmp presets on Linux?"
    a: "Yes. On Linux it is the same browser app: open Presets and import a .xmp develop preset. Lightframes maps exposure, contrast, highlights, shadows, whites, blacks, temperature and tint (relative values; Kelvin approximated), vibrance, saturation, texture, clarity, dehaze, the tone curve (master and red, green and blue), HSL, colour grading or split toning, sharpening, luminance and colour noise reduction, post-crop vignette (amount and midpoint) and grain (amount and size). Camera profiles, lens corrections, calibration and masks are not imported. Legacy .lrtemplate files are not read. You can apply the preset to the open photo, including RAW in ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF and SRW. Photos are not uploaded. The same import list is on [XMP presets without Lightroom](/xmp-presets-without-lightroom)."
  - q: "Does Lightframes run on Linux?"
    a: "Yes, in a current browser: Firefox, Chrome, Edge or Brave. It is the same web app. Photos are processed on the machine with WebAssembly and are not uploaded."
  - q: "Should I install darktable instead?"
    a: "Install it if you want a catalogue, tethered shooting and the desktop pipeline. It is GPL, version 3 or later, and its FAQ says presets from Lightroom are not compatible. The Flatpak build, as of September 2026, does not include darktable’s AI features."
  - q: "Is there a Lightroom desktop app for Linux?"
    a: "The Lightroom system requirements list Windows and macOS for the desktop app, not Linux. Lightroom on the web is a separate listing on Adobe’s web and mobile access page (https://helpx.adobe.com/creative-cloud/policy-pricing/cc-app-web-mobile-access.html)."
  - q: "Can I batch-export from the browser?"
    a: "Yes. Select photos, paste edits or apply a preset, and export a ZIP of JPEG, PNG or WebP files. There is no long-term catalogue in the browser; the session is IndexedDB on that machine."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe.

## The browser on Linux

Lightframes is a free, open-source (MIT) photo editor that runs entirely in the browser. On Linux, open the [editor](/editor) in Firefox or a Chromium browser. RAW support is LibRaw in WebAssembly (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW). Preview is half-size 16-bit; export goes back to the sensor data, capped at 8192 px on the long edge.

Chromium can open a folder through the directory picker. Firefox does not provide that API, so it uses the multi-file dialog instead. Either way the bytes stay on the device. Import `.xmp` and `.cube` from Presets. The editor UI is English.

AI tools run in the page: background removal and the subject mask download from this site (about 45 MB and a 5 MB upscaler), and object removal downloads MI-GAN from Hugging Face once. The photo is not part of that request.

## darktable, the native app

darktable is the usual installed answer on Linux. The project says it should appear in your package manager, and it also ships an AppImage and a Flatpak ([install](https://www.darktable.org/install/)). The [FAQ](https://www.darktable.org/about/faq/) says styles from other programs are not compatible, and that LUTs in several formats are the bridge. The same FAQ says the Flatpak does not include its AI features as of September 2026. Read [Lightframes vs darktable](/compare/lightframes-vs-darktable) before you pick one for a whole archive.

Adobe Lightroom’s [desktop requirements](https://helpx.adobe.com/lightroom-cc/system-requirements.html) name Windows and macOS. For what the free mobile tier includes, and what stays paid, see [Lightframes vs Lightroom](/compare/lightframes-vs-lightroom) and the [roundup](/blog/free-lightroom-alternatives).
