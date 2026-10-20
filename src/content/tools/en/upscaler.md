---
key: upscaler
slug: ai-image-upscaler
title: "Free AI Image Upscaler, No Upload"
description: "Enlarge photos 2× or 4× with AI in your browser. Real-ESRGAN runs on your device, so nothing is uploaded. Free, no account, up to 8192 px on the long edge."
h1: "Upscale photos with AI, right in your browser"
lead: "Lightframes enlarges a photo 2× or 4× with an AI super-resolution model as you export it, adding sharp detail instead of plain blur. The model runs on your device, so the photo is never uploaded, and it's free with no account."
label: "AI upscaler"
summary: "Enlarge photos 2× or 4× with Real-ESRGAN on your own device, up to 8192 px, with your edits applied first."
order: 7
keywords:
  - "ai image upscaler"
  - "upscale image free"
  - "increase photo resolution"
  - "enlarge photo without losing quality"
  - "upscale photo 4x"
  - "ai upscaler no upload"
steps:
  - name: "Open and edit your photo"
    text: "Open the editor, click Open photos and make any edits you want. Upscaling runs last, on the finished photo."
  - name: "Open the Export dialog"
    text: "Click Export in the toolbar or press Ctrl/Cmd+E. To upscale several photos, select them in the filmstrip first."
  - name: "Leave room in the size"
    text: "Under Size, choose Original or set Long edge high enough. The upscale never goes past that size or 8192 px."
  - name: "Turn on AI upscale"
    text: "Set AI upscale to 2× or 4×. The first time, a 5 MB model downloads and is kept for later."
  - name: "Export"
    text: "Pick JPEG, PNG or WebP and click Export. Progress shows while the photo is processed tile by tile."
faq:
  - q: "Is this AI upscaler really free?"
    a: "Yes. Lightframes is free and open source, with no account, no credits and no watermark. Upscaling runs on your own device, so there is no server cost to pass on."
  - q: "Are my photos uploaded to be upscaled?"
    a: "No. The Real-ESRGAN model (about 5 MB) is downloaded once and runs inside your browser. Your photo is processed on your device and saved straight to your downloads."
  - q: "How big can the result be?"
    a: "Up to 4× the size of the edited photo, limited to 8192 px on the long edge and about 40 megapixels in total. The export size you choose also caps it, so set Size to Original if you want the full enlargement."
  - q: "Why didn't my photo get bigger?"
    a: "The upscale stops at the export size you picked. If the photo is already as large as the Long edge setting (or the IG 4:5, IG 1:1 or Story frame), there is nothing to enlarge, so Lightframes skips the step."
  - q: "Can I upscale many photos at once?"
    a: "Yes. Select the photos in the filmstrip, open Export and turn on AI upscale; each photo is upscaled in turn and several files download together as one ZIP. Large photos take longer, so batches of big files can take a while."
updated: 2026-10-20
---

## What the AI upscaler does

The AI upscaler makes a photo larger while adding believable fine detail, so edges and textures stay crisp instead of turning soft and blocky. It's the tool to reach for when a photo is too small for what you need: a heavy crop you want to print, an old low-resolution picture, a phone shot you want to use as a wallpaper, or a small image from a messaging app.

In Lightframes, upscaling is part of exporting. You develop the photo as usual (exposure, colour, crop, [presets](/tools/photo-presets), retouching) and switch on **AI upscale** in the Export dialog. The enlargement runs on the finished result, so your edits are scaled up along with the photo.

## How it works, and why nothing is uploaded

Lightframes uses **Real-ESRGAN (general x4v3)**, an open super-resolution model under the BSD-3-Clause licence, and runs it inside your browser. The photo is never sent anywhere: the only thing downloaded is the model file itself, about 5 MB, the first time you pick 2× or 4×. It is checked against a fixed checksum and kept in your browser's storage, so later exports start straight away and work offline.

The model runs on your graphics card through WebGPU when your browser supports it, and falls back to the processor otherwise. It works on 128 px tiles that overlap slightly, keeping only the middle of each tile, so tile edges don't show as seams. Each tile's 4× result is resampled straight to the factor you asked for, which keeps memory use down.

Two details make the result look more natural:

- **Texture mix.** The model smooths noise aggressively, which can make skin look waxy. Lightframes blends a small share (20%) of a regular smooth enlargement back in, so some of the original texture survives while edges stay sharp.
- **Transparency is kept.** If the photo has a transparent background (for example after using the [background remover](/tools/background-remover)), the transparency is scaled up with it. Export as PNG or WebP to keep it.

## Options and size limits

| Setting | What it means |
| --- | --- |
| **AI upscale: Off / 2× / 4×** | The enlargement you ask for. A 2× result is made from the 4× model output, which keeps more detail than a plain 2× resize. |
| **Size: Original** | Allows up to 8192 px on the long edge, so the full factor usually applies. |
| **Size: Web / Long edge** | The upscale stops at this size. A 1000 px photo exported at Web (2048 px) is enlarged about 2×, even if you picked 4×. |
| **IG 4:5, IG 1:1, Story** | The upscale stops at the frame's size (1080 px wide), then the photo is fitted onto it with a border. |
| **Hard limits** | 8192 px on the long edge and about 40 megapixels in total, to stay within what browsers can hold in memory. Below a 1.1× gain, the step is skipped. |

Some examples, with Size set to Original:

- 1200 × 800 at 4× → 4800 × 3200
- 2000 × 1500 at 4× → about 7300 × 5480 (capped by the 40 MP limit)
- 4000 × 1000 panorama at 4× → 8192 × 2048 (capped by the 8192 px long edge)

## Tips

- **Upscale small or cropped photos.** That's where the model helps most. A photo that is already large gains little and takes much longer.
- **Do noise reduction and sharpening lightly.** The model already cleans noise and sharpens edges; strong settings on top can look overdone.
- **Use PNG or high-quality JPEG** for prints, so compression doesn't undo the new detail.
- **Check the size first.** If nothing seems to change, raise Long edge or choose Original.
- **Batch it.** Select several photos in the filmstrip and export them together; each one is upscaled in turn.

## Limitations

An upscaler predicts detail; it can't recover what the camera never recorded. Faces in tiny, blurry photos won't become sharp portraits, and text that is unreadable won't become readable. The model is trained for general photos, so it can add a slightly painted look to very fine textures such as foliage or hair.

Speed depends on your device. With WebGPU on a recent computer it's quick; on the processor, or on a phone, a large 4× upscale can take a while, and the browser may run out of memory on older devices. The first use needs an internet connection to fetch the model. More questions? Read the [FAQ](/faq) or [open the editor](/editor).
