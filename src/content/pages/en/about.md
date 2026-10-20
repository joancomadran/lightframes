---
key: about
slug: about
title: "About Lightframes"
description: "Who builds Lightframes, why it edits photos on your device instead of in the cloud, how it's funded, and how the open-source (MIT) project works."
h1: "About Lightframes"
updated: 2026-10-20
schemaType: AboutPage
---

Lightframes is a free photo editor that runs entirely in your browser. You open your photos, including camera RAW files, edit them and export them without uploading anything and without creating an account. The code is open source under the MIT licence.

## Who builds Lightframes?

Lightframes is built and maintained by **Joan Comadran**, an independent developer. It's a side project, not a company product: there's no team, no investors and no sales department behind it.

<!-- TODO: add a short, verifiable line about Joan (location, background in photography or software, link to a personal site or profile) if he wants one. Keep it factual. -->

The sample photos that ship with the editor are Joan's own, developed from his RAW files.

## Why does Lightframes exist?

Because editing your photos shouldn't mean handing them over. Many online editors work by uploading each picture to a server, which is slow for large camera files and means your personal photos sit on someone else's machine. Desktop software solves that, but usually needs an install, a subscription or both.

Lightframes takes a third route: a full editor that loads like a web page but does all the work on your own computer or phone. It's built around a few ideas:

- **Private by design.** Your photos are opened from your disk and processed in the browser tab. They aren't sent to a server to be edited, and there's no account to sign into.
- **Local and offline.** Your open photos and edits are saved in your browser's own storage, so a refresh doesn't lose your work. After the first visit the app works without a connection, and you can install it as an app.
- **Presets and copy/paste edits.** Most of the time you edit a set of photos taken in the same light. Lightframes lets you save a look as a preset, dial its strength, import presets from XMP or `.cube` LUT files, and copy one photo's settings onto a whole selection, choosing which settings to bring across.
- **Free.** Every feature is available to everyone. There's no paid tier and no watermark you have to pay to remove.

## What can it do?

In short: non-destructive editing of JPEG, PNG and camera RAW files (Sony, Canon, Nikon, Fujifilm, Olympus, Panasonic, Pentax, Samsung and DNG), with tone and colour controls, a tone curve, crop and straighten, local masks, spot removal, background removal, AI upscaling on export, and a collage and seamless Instagram carousel mode. The [tool pages](/tools/raw-photo-editor) and the [FAQ](/faq) go into detail.

## How does it work, in plain words?

You don't need to know any of this to use Lightframes, but it explains how a web page can edit RAW files without a server:

- **WebAssembly** lets the browser run code that was originally written for desktop programs at close to native speed. Lightframes uses it to run LibRaw, an established open-source RAW decoder, inside the page.
- **Web Workers** are background threads. The heavy pixel work is split across several of them so the interface stays responsive while you drag a slider.
- **On-device AI models** power the smart tools. They run in the browser with ONNX Runtime Web:
  - object removal uses MI-GAN (MIT licence),
  - subject and background detection use IS-Net (Apache-2.0),
  - upscaling uses Real-ESRGAN (BSD-3-Clause).

  Each model is downloaded once, the first time you use the tool, checked against a fixed fingerprint, and cached in your browser. Your photo is processed locally; it isn't sent along with that download.

The app itself is written in TypeScript with React, and the whole thing is a set of static files: any web server can host it.

## How is Lightframes funded?

Running the site costs money and building it takes time, so Lightframes is funded in three low-key ways:

- **A small, clearly labelled ad space in the app.** Today it shows affiliate cards for photography gear.
- **Affiliate links.** The [gear page](/gear) and those ad cards link to products on Amazon.es. If you buy something through them, Lightframes earns a small commission at no extra cost to you. As an Amazon Associate, Lightframes earns from qualifying purchases.
- **Optional donations.** If the editor saves you time, you can [buy Joan a coffee](https://buymeacoffee.com/devcoma).

None of these involve your photos. The site counts page visits with Vercel Web Analytics, which doesn't see the pictures you open in the editor.

<!-- TODO: confirm the analytics wording against the privacy policy, and update this section if a third-party ad network is added. -->

## Is Lightframes open source?

Yes. The full source code is on GitHub at [github.com/joancomadran/lightframes](https://github.com/joancomadran/lightframes) under the MIT licence. You can read exactly what the app does with your files, run your own copy, or build on it. The sample photos in the repository are the exception: they're © the author and not covered by the MIT licence.

A star on the repository helps other people find the project.

## How can you contact Joan or contribute?

The best way to get in touch is through GitHub:

- **Found a bug or a RAW file that won't open?** [Open an issue](https://github.com/joancomadran/lightframes/issues). Mention your browser, your device and, for RAW problems, the camera model.
- **Have an idea for a feature?** Open an issue describing what you're trying to do. Concrete examples help more than feature names.
- **Want to contribute code?** Pull requests are welcome. For anything larger than a small fix, open an issue first so you can agree on the approach.

<!-- TODO: add a contact email or form if Joan wants one listed here. -->

Every change to the app is listed in the [changelog](/changelog).
