---
key: raw-to-jpg
slug: raw-to-jpg
title: "Convert RAW to JPG Online, Free and No Upload"
description: "Convert RAW to JPG free in your browser: CR3, CR2, ARW, NEF, DNG, RAF, ORF or RW2 to full-resolution JPEG, one file or a whole batch. Nothing is uploaded."
h1: "Convert RAW to JPG online, free and without uploading"
lead: "To convert a RAW file to JPG, open it in the Lightframes editor, click Export and choose JPEG. The RAW is developed from its sensor data inside your browser and saved as a full-resolution JPG, and several files download together as one ZIP. It's free and open source, and your photos are never uploaded."
label: "RAW to JPG"
summary: "Convert CR3, ARW, NEF, DNG and other camera RAW files to full-resolution JPG, one by one or in a batch. Nothing uploaded."
order: 1.5
keywords:
  - "convert raw to jpg online free"
  - "raw to jpg converter"
  - "raw to jpeg no upload"
  - "arw to jpg"
  - "nef to jpg"
  - "dng to jpg"
  - "cr2 to jpg"
  - "raf to jpg"
  - "batch convert raw to jpg"
steps:
  - name: "Open your RAW files"
    text: "Open the editor and click Open in the toolbar to pick one or more RAW files, or click Folder in the filmstrip to load a whole card or directory."
  - name: "Optionally fix the photo first"
    text: "Press Auto in the Adjust tab or set exposure and white balance yourself. If you just want a straight conversion, skip this step: the RAW is developed with the camera's white balance."
  - name: "Select the photos to convert"
    text: "To convert more than one file, press Ctrl/Cmd+A to select every photo in the filmstrip, or Ctrl/Cmd-click and Shift-click to pick some."
  - name: "Choose JPEG in Export"
    text: "Click Export. Leave Size on Original for full resolution, set Format to JPEG and choose a quality (92% by default). Change the file name pattern to {name} if you want to keep the original names."
  - name: "Download the JPGs"
    text: "Confirm the export. A single photo downloads as a JPG; several photos download together as one ZIP file."
faq:
  - q: "Which RAW formats can I convert to JPG?"
    a: "Canon .cr3 and .cr2, Sony .arw, Nikon .nef and .nrw, .dng, Fujifilm .raf, Olympus / OM System .orf, Panasonic .rw2, Pentax .pef and Samsung .srw. Decoding is done by LibRaw compiled to WebAssembly, so support for a specific camera model follows what that library can read."
  - q: "Are my RAW files uploaded to convert them?"
    a: "No. The RAW is read, developed and encoded to JPG inside your browser on your own device. Your photos are not sent to a server and there is no account."
  - q: "Is the JPG full resolution?"
    a: "Yes. With Size set to Original, the export is developed from the full sensor data, up to 8192 px on the long edge. Files from sensors wider than that are scaled down to 8192 px. You can also pick a smaller long edge or a fixed social-media size."
  - q: "Can I convert many RAW files to JPG at once?"
    a: "Yes. Select the photos in the filmstrip and export once: every file is converted with the same settings and they download together as one ZIP. There is no fixed limit; large batches take longer because each RAW is developed at full resolution, one after another."
  - q: "What JPEG quality should I use?"
    a: "The default of 92% is a good balance for most photos. Use 95–100% for prints or further editing, and lower values for smaller files to send or post. You can also export PNG (lossless) or WebP instead."
  - q: "Does the JPG keep the camera's EXIF data?"
    a: "No. The exported JPG contains the developed image only; camera metadata such as capture date, camera model and GPS position is not copied over. Keep the RAW if you need that information."
  - q: "Will the JPG look like my camera's own JPEG?"
    a: "Not exactly. Lightframes develops every RAW with the same neutral base rendering and the camera's white balance, without the manufacturer's picture styles or lens corrections. Use the sliders before exporting if you want a different look."
  - q: "Is the original RAW file changed?"
    a: "No. Converting creates a new JPG file; the RAW on your disk is never modified."
updated: 2026-10-20
---

## What converting RAW to JPG in Lightframes means

Lightframes turns camera RAW files into ordinary JPG images that any phone, computer, website or print shop can open. The RAW is fully developed from its sensor data (not just its built-in preview) on your own device, and you can export one photo or a whole shoot in one go. It is a free, open-source (MIT) photo editor that runs in the browser, so there is nothing to install and nothing to upload.

Because the converter is a full RAW editor, you can also fix exposure, recover a bright sky or correct white balance before the JPG is written. If you only want a quick conversion, open the files and export them without touching anything.

## How the conversion works

Every step happens in the browser tab:

1. **Reading.** The file is read from your disk. Its embedded preview gives a fast thumbnail in the filmstrip.
2. **Developing.** On export, LibRaw (compiled to WebAssembly) decodes the sensor data at full resolution with the camera's recorded white balance. Lightframes then applies its base tone curve and any edits you made.
3. **Encoding.** The developed image is encoded as JPEG at the quality you chose and downloaded. Several files are packed into one ZIP named like `lightframes-2026-10-20-24-photos.zip`.

If LibRaw cannot develop a particular file, Lightframes uses the full-size JPEG the camera embedded in the RAW instead of failing. After the first visit the app is cached, so converting also works offline, and you can install it as an app (PWA).

## RAW to JPG by camera format

All the formats below are converted the same way. The differences are in the cameras that write them.

### CR3 and CR2 to JPG (Canon)

CR3 is the RAW format of Canon cameras released since 2018, including the EOS R mirrorless range; CR2 is the older format used by earlier EOS DSLRs. Both open in Lightframes. CR3 has its own page with more detail: [convert CR3 to JPG](/tools/cr3-to-jpg).

### ARW to JPG (Sony)

Sony Alpha cameras save RAW as `.arw`. Open the files, select them and export as JPEG; the conversion uses the full sensor data. Very high-resolution files are scaled to 8192 px on the long edge. More detail: [convert ARW to JPG](/tools/arw-to-jpg).

### NEF and NRW to JPG (Nikon)

Nikon writes `.nef` on its interchangeable-lens cameras and `.nrw` on some Coolpix compacts. Both are converted from the sensor data like any other RAW. More detail: [convert NEF to JPG](/tools/nef-to-jpg).

### DNG to JPG

DNG is an openly documented RAW format used by several camera makers and by many phones and drones. Most DNG files develop normally; if a file uses a compression the bundled decoder can't read, Lightframes falls back to its embedded preview. Phone and drone DNGs have their own page: [convert DNG to JPG](/tools/dng-to-jpg).

### RAF, ORF, RW2, PEF and SRW to JPG

Fujifilm `.raf`, Olympus / OM System `.orf`, Panasonic `.rw2`, Pentax `.pef` and Samsung `.srw` files are converted the same way.

## Export settings for the JPG

| Setting | Options | Tip |
| --- | --- | --- |
| Size | Original (full resolution, up to 8192 px), Web (2048 px), IG 4:5 (1080 × 1350), IG 1:1 (1080 × 1080), Story (1080 × 1920), or any long edge from 800 px | Original for archiving and prints, Web for email and websites |
| Format | JPEG, PNG or WebP | JPEG for compatibility, PNG for lossless copies, WebP for smaller web files |
| Quality | 50–100% for JPEG and WebP (92% by default) | 90–95% keeps compression invisible in most photos |
| File name | Pattern such as `{name}-edited` | Use `{name}` to keep the original names |
| Watermark | Optional text in a corner or the centre | Off by default |

The settings are applied to every selected photo, so a whole card is converted with one click.

## Convert straight away, or edit first?

A plain conversion gives you a faithful, neutral JPG. Editing first is worth it when the camera got something wrong, since the RAW still holds detail a JPG has thrown away:

- **Blown-out sky:** lower Highlights and Whites with the clipping overlay (J) on.
- **Wrong colour cast:** use the white balance picker on something neutral.
- **A consistent look for a set:** apply a [preset](/tools/photo-presets) or paste one edit across the whole selection with the [batch editor](/tools/batch-photo-editor).

For the full list of controls, see the [RAW photo editor](/tools/raw-photo-editor).

## Limitations

- **Maximum size.** Exports are capped at 8192 px on the long edge.
- **Rendering.** One neutral base rendering for every camera: no manufacturer picture styles, camera-specific colour profiles or lens corrections, so colours can differ from the camera's own JPEG.
- **Metadata.** EXIF data (date, camera, GPS) is not copied into the JPG.
- **New cameras.** Very recent models may not be readable by the bundled LibRaw version; those files fall back to the embedded preview.
- **Memory and speed.** Each RAW is developed at full resolution, which takes a few seconds per file. Big batches run faster on a computer than on a phone.
- **Folders.** Opening a whole folder needs a Chromium-based browser such as Chrome, Edge or Brave; in other browsers select the files with Open.

More answers are in the [FAQ](/faq).
