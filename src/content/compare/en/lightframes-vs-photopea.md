---
key: lightframes-vs-photopea
slug: lightframes-vs-photopea
title: "Lightframes vs Photopea"
description: "Lightframes or Photopea in the browser: RAW and .xmp presets with nothing uploaded, or layers and PSD. Price, RAW, AI and privacy, with official sources."
h1: "Lightframes vs Photopea"
lead: "Choose Lightframes if the job is camera RAW, Lightroom .xmp presets, .cube LUTs and a batch of photos that never leave the browser. Choose Photopea if the job is layers, masks and PSD files in the browser. Both run locally. Photopea is the closer match to a Photoshop-style file; Lightframes is the closer match to a preset-based RAW session."
order: 2
updated: 2026-11-10
faq:
  - q: "Does Photopea upload my photos?"
    a: "Photopea’s privacy policy says files you open are never sent anywhere and are processed on your device. If you connect Dropbox, Google Drive or OneDrive, files move only between your device and that cloud, over HTTPS."
  - q: "Can Photopea apply my Lightroom .xmp presets?"
    a: "Not as a preset workflow. On GitHub issue 5658 the developer wrote that Photopea’s RAW interface does not support every Adobe Camera Raw option and would discard most of an XMP file."
  - q: "Is Photopea free?"
    a: "The editor can be used for free, including selling the work you make. Premium is an optional one-time payment for a set number of days (the terms use 90 days as the example) and then the account returns to free. Prices are in the Account window (https://www.photopea.com/api/accounts)."
  - q: "Which one imports a .cube LUT?"
    a: "Lightframes imports a .cube file as a preset with an intensity slider. Photopea: no documented .cube import (https://www.photopea.com/ and https://www.photopea.com/tuts/open-raw-photos-online/)."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe or with Photopea.

## Comparison

| | **Lightframes** | **Photopea** |
| --- | --- | --- |
| **Price** | Free. No account. | Free to use ([terms](https://www.photopea.com/privacy.html)). Optional Premium is a one-time payment for a number of days, then the account is free again. Prices are in the Account window ([accounts](https://www.photopea.com/api/accounts)). A self-hosted package is listed at $500–$2,000 per month on that page. |
| **Licence** | [MIT](https://github.com/joancomadran/lightframes), source on GitHub. | Proprietary. The terms allow free use of the editor; they do not grant an open-source licence. |
| **Where it runs** | Current Chrome, Edge, Brave, Firefox and Safari. Installable PWA. Editor UI in English. | In the browser, “on any device” ([homepage](https://www.photopea.com/)). No install. |
| **RAW** | LibRaw in WebAssembly: ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW. Half-size preview from sensor data; export up to 8192 px on the long edge, with an embedded-JPEG fallback. | Homepage lists DNG, CR2, CR3, NEF, ARW, RW2, RAF, ORF and FFF, with exposure, colour balance, contrast, highlights and shadows. The [RAW tutorial](https://www.photopea.com/tuts/open-raw-photos-online/) adds white balance, then Open into the editor or a JPG. |
| **Lightroom .xmp presets** | Import. Sliders, curves, HSL, colour grading, grain and sharpening are mapped. Profiles, lens corrections and masks are not. | Not a supported preset path. The developer said the RAW interface does not cover every Camera Raw option and would discard most of an XMP ([issue #5658](https://github.com/photopea/photopea/issues/5658)). |
| **.cube LUTs** | Import as a preset, with intensity. | No documented .cube import ([homepage](https://www.photopea.com/), [RAW tutorial](https://www.photopea.com/tuts/open-raw-photos-online/)). |
| **AI features** | On device: background removal, subject mask, object removal (MI-GAN from Hugging Face on first use), export upscale. Photos stay on the device. | The homepage advertises one-click background removal and replacing part of an image from a text description, and also says processing is fully local. |
| **Privacy / uploads** | No photo upload. IndexedDB keeps the session. Cookieless Vercel Web Analytics on page visits. | “Files, which you open in Photopea, are never sent anywhere” ([privacy](https://www.photopea.com/privacy.html)). Logging in stores name, email and preferences on Photopea’s server. Optional cloud storage is the user’s own Dropbox, Drive or OneDrive. |
| **Batch** | Presets and pasted edits on a selection, ZIP export. Session only, not a catalogue. | Opens the files you choose. The homepage describes layers, masks, smart objects and PSD open/save, not a photo library or an export queue. |

## When Photopea is the better choice

Use Photopea when the file is already a PSD, or when you need layers, masks, layer styles, paths and vector work in the browser. The [homepage](https://www.photopea.com/) says PSD is its main format, both opening and saving, and lists a long set of design formats (PNG, JPG, SVG, PDF, AI, TIFF and others). That is a different job from applying one develop preset across a shoot.

The RAW dialog is a step before the layer stack, not a catalogue. If you only need exposure and white balance and then a composite, Photopea matches. If the look lives in an `.xmp` you bought, it does not.

## When Lightframes is the better choice

Use Lightframes when you want the same develop settings on many RAW or JPEG files: import the `.xmp` or `.cube`, set intensity, paste onto the filmstrip and export a ZIP from the [editor](/editor). Collage and carousel export sit in the same session. Nothing in that path uploads the photo.

You give up layers, PSD and the design-file list Photopea publishes. For a full desktop raw library, see [Lightframes vs darktable](/compare/lightframes-vs-darktable). The broader roundup is [free Lightroom alternatives](/blog/free-lightroom-alternatives).
