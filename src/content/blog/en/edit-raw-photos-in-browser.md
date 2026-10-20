---
key: raw-in-browser
slug: edit-raw-photos-in-browser
title: "How to Edit RAW Photos in Your Browser"
description: "Edit camera RAW files (ARW, CR3, NEF, DNG, RAF and more) right in your browser. No uploads, no account: the file is developed on your own device."
h1: "How to edit RAW photos in your browser without uploading them"
published: 2026-10-20
author: Joan Comadran
tags: ["raw", "guides"]
tools: ["raw-editor", "presets", "batch"]
keywords:
  - edit raw photos in browser
  - online raw editor no upload
  - raw photo editor free
  - open arw file in browser
  - edit cr3 online
  - edit nef online
  - dng editor online
  - private photo editor
---

**Short answer:** open [Lightframes](/editor) in a desktop browser, click **Open** and pick your RAW files. The app decodes the sensor data on your own computer with LibRaw compiled to WebAssembly, so the photo is never uploaded. Edit with the sliders, then export a JPEG, PNG or WebP developed from the full-resolution RAW.

## What is a RAW file, and why edit it at all?

A RAW file is what the camera sensor recorded, before the camera turned it into a JPEG. Every brand has its own format: Sony ARW, Canon CR2 and CR3, Nikon NEF, Fujifilm RAF, Olympus ORF, Panasonic RW2, and the more open DNG.

A JPEG straight out of the camera has already had white balance, contrast and sharpening baked in, at 8 bits per channel. A RAW keeps more of what the sensor saw. In practice that means:

- **More room in the highlights and shadows.** A bright sky that looks blown out in the JPEG often still has detail in the RAW.
- **White balance you can change freely,** because it hasn't been applied to the pixels yet.
- **Fewer banding and posterisation problems** when you push exposure or colour hard.

The catch is that a RAW has to be "developed" before you can share it, and that usually means installing desktop software or sending the file to a web service.

## Why does it matter that the photo isn't uploaded?

Most online editors work by sending your photo to a server, processing it there and sending the result back. With RAW files that has real costs:

- **Privacy.** Photos of your family, your home or a client's shoot end up on someone else's machine, under someone else's retention policy.
- **Time and data.** A single RAW is often tens of megabytes. Uploading a full card over a hotel connection is slow, or simply not possible.
- **Accounts and limits.** Server-side tools usually need a sign-up, and many cap the file size or the number of exports.

Lightframes runs the whole pipeline in the browser tab. The RAW decoder, the editing engine and the export all run on your device; the heavy pixel work is spread across Web Workers so the page stays responsive. Your open photos and edits are kept in your browser's own storage (IndexedDB), so a page refresh doesn't lose your work, and none of it is sent anywhere. Once the app has loaded, it also works offline.

## How do you edit a RAW photo in Lightframes, step by step?

1. **Open the editor.** Go to [/editor](/editor). A recent Chromium-based browser (Chrome, Edge, Brave) on a desktop gives the best performance and lets you open whole folders.
2. **Open your files.** Click **Open** in the toolbar and select one or more RAWs. Hold **Option/Alt** while clicking to pick a folder instead. Opening more files adds them to the filmstrip.
3. **Wait for the first develop.** The filmstrip thumbnail appears quickly. The large preview takes a moment longer, because the app is demosaicing the sensor data in the background.
4. **Set the basics in Adjust.** Start with exposure, then highlights and shadows, whites and blacks. Fix white balance with temperature and tint, or use the white balance picker on something neutral. Press **J** to show clipping on the image, and check the histogram as you go.
5. **Refine colour and tone.** Use the **Color** panel for per-colour hue, saturation and luminance and for colour grading. Use **Curve** for the master tone curve, and **Effects** for vignette, grain, sharpening and noise reduction.
6. **Fix composition and details.** **Crop** handles crop, straighten and rotate (shortcut **R**). **Local** adds radial, linear, brush or subject masks, which you can narrow to a brightness or colour range. **Retouch** removes spots and small distractions.
7. **Compare.** Press **\\** for a before/after view. Every edit is non-destructive and undoable (**Ctrl/Cmd+Z**).
8. **Export.** Press **Ctrl/Cmd+E**, choose a size preset and format, and save.

If you shot a whole series in the same light, edit one photo, copy its settings (**Ctrl/Cmd+C**) and paste them onto the rest of the selection (**Ctrl/Cmd+V**). The paste dialog lets you choose which settings to bring across, so you can paste the colour without the crop. There's more on that in the [batch photo editor](/tools/batch-photo-editor) guide, and you can save any look as a reusable preset with the [photo presets](/tools/photo-presets) tool.

## Which RAW formats are supported?

Lightframes recognises these extensions, plus regular JPEG and PNG:

| Brand | Extensions |
| --- | --- |
| Sony | `.arw` |
| Canon | `.cr2`, `.cr3` |
| Nikon | `.nef`, `.nrw` |
| Fujifilm | `.raf` |
| Olympus / OM System | `.orf` |
| Panasonic | `.rw2` |
| Pentax | `.pef` |
| Samsung | `.srw` |
| DNG (many brands and phones) | `.dng` |

Decoding relies on LibRaw, so whether a specific camera model develops fully depends on LibRaw's own support for it. Very new bodies can lag behind.

<!-- TODO: confirm the LibRaw version bundled by libraw-wasm and whether we want to mention a camera support list. -->

## Embedded preview or full RAW decode: what are you actually editing?

Most RAW files carry a full-size JPEG inside them, the same picture you see on the camera's screen. Lightframes uses the two in different places:

- **Thumbnails** in the filmstrip come from that embedded JPEG, because it's quick to extract.
- **The editing preview** is a real RAW develop done with LibRaw: linear 16-bit RGB with the camera's white balance and no tone curve applied. To stay fast it's decoded at half size, which is plenty for a screen.
- **The export** decodes the RAW again at full resolution, so the saved file has every pixel the sensor captured.

If LibRaw can't develop a particular file, the app falls back to the embedded JPEG so you can still edit it. In that case you're working on the camera's 8-bit rendering, and you'll notice that highlights don't recover the way they do on other RAWs. If that happens, convert the file to DNG and try again.

<!-- TODO: if the UI ever shows which source is in use (RAW vs embedded JPEG), mention it here. -->

## Tips for better results

- **Expose first, colour second.** Get the brightness right before touching saturation; colour judgements change as exposure changes.
- **Watch the clipping overlay.** The RAW has headroom, but not unlimited headroom. Pull highlights down until the overlay disappears from areas that should hold detail.
- **Go easy on sharpening at half-size preview.** Check fine detail by zooming in before you export.
- **Don't panic when a large file takes a moment.** Developing a 40+ megapixel RAW at full resolution is real work for a laptop. It happens once per export, not on every slider move.
- **Keep your originals.** Lightframes never changes the RAW file itself. Your edits live alongside it until you export.

## How do you export the finished photo?

Open the export dialog with **Ctrl/Cmd+E**. You can pick:

- **A size preset:** Original (full resolution), Web (2048 px long edge), or Instagram sizes: 4:5 at 1080 × 1350, 1:1 at 1080 × 1080, and Story at 1080 × 1920. You can also set your own long edge. The Instagram sizes fit the whole photo inside the frame, with a border colour you choose, instead of cropping it.
- **Format and quality:** JPEG, PNG or WebP, with a quality slider.
- **A filename pattern,** such as `{name}-edited`, where `{name}` is the original file's name.
- **Optional extras:** a text watermark, and AI upscaling at 2× or 4×, which also runs on your device (see the [AI image upscaler](/tools/ai-image-upscaler)).

Select several photos in the filmstrip before exporting and each one is developed with its own edits; they download together as a single ZIP.

## Common questions

**Is it really free, and do I need an account?**
Yes, it's free and there's no account. Lightframes is open source under the MIT licence; you can read the code on [GitHub](https://github.com/joancomadran/lightframes). See [About](/about) for how the project is funded.

**Does it work on a phone?**
The editor works on phones and tablets, including touch zoom and pan. RAW files are large and phones have less memory, so a desktop or laptop is more comfortable for big RAW batches.

**My camera's RAW opens, but it looks just like the JPEG. Why?**
If LibRaw can't develop that file, Lightframes edits the embedded JPEG instead. Converting the file to DNG usually helps. If it doesn't, please [open an issue](https://github.com/joancomadran/lightframes/issues) with the camera model.

Ready to try it? [Open the RAW photo editor](/tools/raw-photo-editor) or go straight to [the editor](/editor).
