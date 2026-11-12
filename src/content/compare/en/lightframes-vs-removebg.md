---
key: lightframes-vs-removebg
slug: lightframes-vs-removebg
title: "Lightframes vs remove.bg"
description: "Lightframes or remove.bg: cut out a subject on your device with no upload, or a server remover with an API and credits. Privacy and price, sourced."
h1: "Lightframes vs remove.bg"
lead: "Choose Lightframes if you want the background removed in the browser, with the photo never uploaded, and the rest of the edit in the same tab. Choose remove.bg if you want a dedicated cut-out service: the photo is uploaded, processed on their side and sent back, with an API and paid credits for full-size results. The desktop app does not change that. remove.bg says images are still processed through the API."
order: 6
updated: 2026-11-12
faq:
  - q: "Does remove.bg upload my photo?"
    a: "Yes. The privacy policy (16 July 2025) says files are uploaded, processed, offered for download and then deleted shortly after. A post updated on 28 August 2025 says uploaded images are deleted typically within 60 minutes. The same privacy policy says media uploads may be analysed to train their models."
  - q: "Is remove.bg free?"
    a: "Partly. The desktop-app page says download is free, processing needs credits, you get one free credit when you sign up, and 50 free API calls a month for preview images up to 0.25 megapixels (for example 625×400). The API page says the first 50 API calls each month are free and points at the pricing page for paid use. Lightframes has no credits and no account."
  - q: "Does Lightframes upload the photo to remove the background?"
    a: "No. The IS-Net model (about 45 MB) is downloaded from this site, checked with SHA-256 and run in the browser with ONNX Runtime Web. The photo stays on the device. After that first download, the cut-out works offline."
  - q: "Does remove.bg have an API?"
    a: "Yes. The API accepts a direct upload or an image URL, over HTTPS, and documents output up to 50 megapixels. The same page says that from 1 December 2026 background removal moves to Leonardo.Ai, also part of Canva."
---

remove.bg is a product of Canva Austria GmbH. Lightframes is independent and is not affiliated with remove.bg or Canva.

## Comparison

| | **Lightframes** | **remove.bg** |
| --- | --- | --- |
| **Price** | Free. No account, no credits and no paid tier. | The [desktop app page](https://www.remove.bg/a/background-remover-windows-mac-linux) says the download is free and processing spends credits: one free credit on sign-up, plus 50 free API calls a month for previews up to 0.25 megapixels (for example 625×400). The [API page](https://www.remove.bg/api) says the first 50 calls each month are free and refers paid use to [pricing](https://www.remove.bg/pricing). This page does not quote plan prices, because the pricing page did not print them in the HTML retrieved on 12 November 2026. |
| **Licence** | [MIT](https://github.com/joancomadran/lightframes), source on GitHub. | Proprietary. The [privacy policy](https://www.remove.bg/privacy) names the operator as Canva Austria GmbH. |
| **Where it runs** | Current Chrome, Edge, Brave, Firefox and Safari. Installable PWA. Editor UI in English. The cut-out is one mode in the Retouch tab, next to colour, blur, heal and the rest of the editor. | In the browser, plus a desktop app for Windows 10/11 (64-bit), macOS 13 or newer (64-bit) and Ubuntu/Debian (64-bit), an Android app, and an HTTP API ([desktop page](https://www.remove.bg/a/background-remover-windows-mac-linux), [API](https://www.remove.bg/api)). The desktop app asks for an account and an API key. |
| **What it cuts out** | IS-Net (general use), quantised to 8-bit, about 45 MB, from this site. The photo is scaled to 1024×1024 for the mask. You can export transparency, place the subject on a solid colour, or blur the original background, and paint Keep or Erase to fix the edge. | A dedicated background remover. The API documents output up to 50 megapixels and says the image needs a foreground (people, products, animals, cars and similar). The [API page](https://www.remove.bg/api) says that from 1 December 2026 this moves to Leonardo.Ai, also part of Canva. |
| **Batch** | Copy the background edit and paste it onto a filmstrip selection. Each photo gets its own mask when it is previewed or exported. Several files leave as one ZIP. | The [desktop app](https://www.remove.bg/a/background-remover-windows-mac-linux) takes folders of images and sends them through the API. The API itself is the path for bulk jobs. |
| **The rest of the editor** | RAW develop, `.xmp` presets, `.cube` LUTs, object removal and 2× or 4× upscale in the same session. Export is capped at 8192 px on the long edge. | A cut-out service, not a raw developer. The desktop page does not describe Lightroom presets or camera RAW. |
| **Privacy / uploads** | The photo is not uploaded. The model is cached in the browser after the first download. Page visits use cookieless Vercel Web Analytics. | The photo is uploaded. The [privacy policy](https://www.remove.bg/privacy) says files are processed and then deleted shortly after, and that media uploads may be used to train models. A [post updated 28 August 2025](https://www.remove.bg/b/prioritizing-security-and-privacy-at-remove-bg) says images are deleted typically within 60 minutes. |

## When remove.bg is the better choice

Use remove.bg when the cut-out is a production step: a folder of product shots, a Photoshop plug-in, or a script. The [API](https://www.remove.bg/api) takes an upload or a URL and documents results up to 50 megapixels, which is past the 8192 px long edge Lightframes will export. The [desktop app](https://www.remove.bg/a/background-remover-windows-mac-linux) is built for dragging in whole folders, and it still needs a network and credits because the images go to the API.

That is the honest trade. The photo leaves your device. The privacy policy says it is deleted shortly afterwards, and the August 2025 post says typically within 60 minutes, and the same policy says uploads may be used to train models. If a client forbids any upload, remove.bg does not fit, including the desktop app.

## When Lightframes is the better choice

Use Lightframes when the photo should not be uploaded and the cut-out is one step in a normal edit. Open the [editor](/editor), go to Retouch, and choose Remove, Color or Blur under Background. The first run downloads IS-Net (about 45 MB) from this site. JPEG export with Remove is saved as PNG so the transparency survives. The walkthrough is the [background remover](/tools/background-remover) page.

You give up the API, the 50-megapixel output and a tool whose only job is cut-outs. The mask is computed at 1024×1024, so fine hair can need the Keep and Erase brush. Spots and people you want filled in, rather than cut out, are the [object remover](/tools/remove-objects-from-photos). Enlarging the result is [Lightframes vs Upscayl](/compare/lightframes-vs-upscayl).
