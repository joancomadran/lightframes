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
  - name: "Open the files"
    text: "Open the editor and click Open to pick one or more RAW files. In Chrome, Edge or Brave, Folder in the filmstrip loads a whole card."
  - name: "Adjust"
    text: "Press Auto, or set exposure and white balance. Skip this for a straight conversion: export uses the camera white balance."
  - name: "Export JPG"
    text: "Click Export, leave Size on Original, set Format to JPEG (92% by default) and confirm. One photo downloads as a JPG. Set the file name pattern to {name} to keep the original name."
  - name: "Batch"
    text: "Press Ctrl/Cmd+A to select the filmstrip, then export once. Every file uses the same settings and the JPGs download as one ZIP."
faq:
  - q: "Which RAW formats can I convert to JPG?"
    a: "Canon .cr3 and .cr2, Sony .arw, Nikon .nef and .nrw, .dng, Fujifilm .raf, Olympus / OM System .orf, Panasonic .rw2, Pentax .pef and Samsung .srw. Decoding is done by LibRaw compiled to WebAssembly, so support for a specific camera model follows what that library can read."
  - q: "How do I open a NEF or CR3 without software?"
    a: "Open the file in the Lightframes editor at www.lightframes.si/editor?intent=raw. Nothing is installed and the file is not uploaded. The bundled LibRaw build decodes NEF, NRW, CR3 and CR2 in the browser, and the same editor opens the other extensions listed on this page. Export as JPEG when you want a JPG."
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
updated: 2026-11-11
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

## Formats the converter opens

The editor opens the extensions in this table and decodes them with the LibRaw build compiled to WebAssembly that ships with the app. If a camera or a compression is newer than that build, the export uses the full-size JPEG stored inside the RAW, when the camera saved one. Any other RAW extension is not opened.

| Source | Extensions | Guide |
| --- | --- | --- |
| Canon | `.cr2`, `.cr3` | [CR3 to JPG](/tools/cr3-to-jpg) |
| Nikon | `.nef`, `.nrw` | [NEF to JPG](/tools/nef-to-jpg) |
| Sony | `.arw` | [ARW to JPG](/tools/arw-to-jpg) |
| DNG (cameras, phones, drones) | `.dng` | [DNG to JPG](/tools/dng-to-jpg) |
| Fujifilm | `.raf` | On this page |
| Olympus / OM System | `.orf` | On this page |
| Panasonic | `.rw2` | On this page |
| Pentax | `.pef` | On this page |
| Samsung | `.srw` | On this page |

CR3 is Canon's RAW from 2018 on, including the EOS R range; CR2 is the older EOS DSLR format. Nikon writes NEF on interchangeable-lens cameras and NRW on some Coolpix compacts. Sony Alpha cameras use ARW. DNG is an open container used by some camera makers and by many phones and drones. At Original size, a sensor wider than 8192 px is scaled to 8192 px on the long edge.

## Compared with a desktop converter

A desktop converter — the camera maker's app, Lightroom or darktable — installs on the computer, can use more memory, and usually applies that brand's colour profile and lens corrections. Lightframes does not install. No uploads: decoding and the JPEG stay in the browser tab.

A very large file, or many open at once, can run out of browser memory and the export fails. Each RAW is developed one after another. The long edge stops at 8192 px, and the rendering is a neutral base, without the manufacturer's picture style. A longer look at desktop apps is in [free Lightroom alternatives](/blog/free-lightroom-alternatives).

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

For the full list of controls, see the [RAW photo editor](/tools/raw-photo-editor), or [open the editor](/editor?intent=raw) with your files. How the decode works is in [edit RAW photos in your browser](/blog/edit-raw-photos-in-browser).

## Limitations

- **Maximum size.** Exports are capped at 8192 px on the long edge.
- **Rendering.** One neutral base rendering for every camera: no manufacturer picture styles, camera-specific colour profiles or lens corrections, so colours can differ from the camera's own JPEG.
- **Metadata.** EXIF data (date, camera, GPS) is not copied into the JPG.
- **New cameras.** Very recent models may not be readable by the bundled LibRaw version; those files fall back to the embedded preview.
- **Memory and speed.** Each RAW is developed at full resolution, which takes a few seconds per file. Big batches run faster on a computer than on a phone.
- **Folders.** Opening a whole folder needs a Chromium-based browser such as Chrome, Edge or Brave; in other browsers select the files with Open.

More answers are in the [FAQ](/faq).
