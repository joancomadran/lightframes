---
key: background-remover
slug: background-remover
title: "Free Background Remover — No Upload"
description: "Remove the background from a photo for free with on-device AI. Export a transparent PNG, swap in a solid colour or blur it. Your photo is never uploaded."
h1: "Remove the background from a photo, free and on your device"
lead: "Open a photo in Lightframes, go to the Retouch tab and click Remove under Background: an AI model running in your browser finds the subject and cuts it out onto transparency. You can also replace the background with a solid colour or blur it, and the photo is never uploaded."
label: "Background remover"
summary: "Cut out the subject with on-device AI, then export a transparent PNG, a solid-colour background or a blurred one."
order: 5
keywords:
  - "background remover free"
  - "remove background from photo"
  - "remove background without uploading"
  - "transparent background png"
  - "change photo background color"
  - "blur photo background online"
  - "ai background removal offline"
steps:
  - name: "Open your photo"
    text: "Open a JPEG, PNG or RAW file in the editor and select it in the filmstrip."
  - name: "Choose a background mode"
    text: "Go to the Retouch tab and, under Background, click Remove for transparency, Color for a solid colour, or Blur to soften the existing background. The first time, the model downloads once (45 MB)."
  - name: "Fix the edges if needed"
    text: "Under Fix the cutout, click Brush. Paint with Keep to add missed parts of the subject, or Erase to remove leftover background. Adjust Size as you go."
  - name: "Export"
    text: "Click Export. With Remove, JPEG is saved as PNG automatically so the transparency is kept; PNG and WebP keep it as chosen."
faq:
  - q: "Is the background remover really free?"
    a: "Yes. Lightframes is free and open source under the MIT license. There are no credits, no account, no watermark and no paid tier with better quality: everyone gets the same tool."
  - q: "Is my photo uploaded to remove the background?"
    a: "No. The AI model is downloaded to your browser and runs on your own device. The photo is never sent to a server."
  - q: "Which AI model does it use?"
    a: "It uses IS-Net (general use) from the DIS project, licensed Apache-2.0, quantized to 8-bit so the download is 45 MB. It runs with ONNX Runtime Web in a background worker."
  - q: "Does it work offline?"
    a: "Yes, after the first use. The model is downloaded once, checked against a SHA-256 hash and kept in the browser's cache, so later sessions don't need a connection."
  - q: "How do I get a transparent PNG?"
    a: "Choose Remove in the Background section and export. If the format is set to JPEG, Lightframes saves a PNG instead because JPEG has no transparency. Use Original, Web or a custom size; the fixed social-media sizes add a solid border."
  - q: "Can I remove the background from several photos at once?"
    a: "Yes. Set the mode on one photo, copy its edits, select the others, and paste with the Background group ticked. Each photo gets its own subject detection when it is previewed or exported."
updated: 2026-10-20
---

## What this background remover does and who it's for

The Lightframes background remover separates the main subject of a photo from its background and lets you make the background transparent, replace it with a solid colour, or blur it. It is useful for product shots on a clean backdrop, profile pictures, stickers and cut-outs for designs, or a shallow depth-of-field look on a phone photo. Unlike most online removers, it doesn't ask for an account or credits and it doesn't send your photo anywhere. It is part of a full photo editor, so you can adjust exposure and colour in the same place.

## How the on-device AI works

The subject is detected by an AI model that runs in your browser, on your device's processor, so the photo never leaves your computer or phone. Step by step:

1. The first time you choose a background mode, the editor downloads the **IS-Net** segmentation model (45 MB). The download is checked against a SHA-256 hash and stored in the browser's cache, so it only happens once.
2. The model runs with ONNX Runtime Web inside a Web Worker, so the editor stays responsive while it works. It looks at the photo scaled to 1024 × 1024 and returns a mask of the main subject.
3. Lightframes cleans the mask, dropping small floating specks the model may leave in busy backgrounds while keeping a soft margin so hair and fuzzy edges survive.
4. The mask is computed once per photo and reused for the preview, the export and any crop, so changing the framing doesn't run the model again.

After that first download, background removal works offline, like the rest of the editor. The edit is non-destructive: the original file is untouched, and switching back to **Original** restores the photo.

## Background modes and options

| Mode | Result | Options |
| --- | --- | --- |
| Original | Photo unchanged | — |
| Remove | Subject on transparency | Exports as PNG (or WebP) |
| Color | Subject on a solid colour | White, off-white, black, light blue, or any custom colour |
| Blur | Original background, blurred | Amount 0–100 |

**Fix the cutout** appears whenever a mode other than Original is active:

- **Brush** toggles a refine brush you paint with directly on the photo.
- **Keep** paints parts of the subject back in, such as a hand or the edge of a product.
- **Erase** paints away background the model kept.
- **Size** sets the brush size, and **Reset** clears all your brush fixes.

The same subject detection powers the **Subject** mask in the Local tab, so you can also brighten or recolour just the subject without removing anything.

## Tips for cleaner cutouts

- Photos with one clear subject against a distinct background give the best results.
- Do colour and exposure edits as usual; they apply to the subject and, in Blur mode, to the background too.
- Use **Color** with white for marketplace-style product photos, then export at Web size.
- For a batch, paste the Background setting **before** using the brush. Brush fixes are copied with it and only fit the photo they were painted on.
- To remove a distracting object instead of the whole background, use [remove objects from photos](/tools/remove-objects-from-photos). To enlarge a small cut-out, use the [AI image upscaler](/tools/ai-image-upscaler).

## Limitations

- The model sees the photo at 1024 × 1024, so on very large photos fine detail like individual hairs is approximated and may need the brush.
- It finds the most prominent subject. Groups, busy scenes and subjects that blend into the background can need manual fixes.
- It runs on the CPU, so the first detection on a slow phone can take a while.
- The first use needs an internet connection for the 45 MB download, and clearing site data removes the cached model.
- The fixed social-media export sizes (IG 4:5, IG 1:1, Story) add a solid border, so use Original, Web or a custom size for transparent output.

Questions about privacy, offline use and browser support are answered in the [FAQ](/faq).
