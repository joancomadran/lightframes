---
key: nef-to-jpg
slug: nef-to-jpg
title: "Convert NEF to JPG Online, Free and No Upload"
description: "Convert Nikon NEF and NRW files to JPG for free in your browser, at full resolution and in batches. No upload, no account and no software to install."
h1: "Convert Nikon NEF to JPG online, free"
lead: "To convert a NEF file to JPG, open it in the Lightframes editor, click Export and choose JPEG. Your Nikon RAW is developed from the sensor data in your browser and saved as a full-resolution JPG, one file or a whole folder at a time. It's free, open source and nothing is uploaded."
label: "NEF to JPG"
summary: "Turn Nikon NEF and NRW RAW files into full-resolution JPGs in your browser, one by one or as a ZIP."
order: 1.61
featured: false
keywords:
  - "nef to jpg"
  - "convert nef to jpg online free"
  - "nef to jpeg converter"
  - "open nef file"
  - "nikon raw to jpg"
  - "nef to jpg batch"
  - "nrw to jpg"
steps:
  - name: "Open the files"
    text: "Open the editor and click Open to choose .nef or .nrw files. In Chrome, Edge or Brave, Folder in the filmstrip loads the card."
  - name: "Adjust"
    text: "Press Auto in the Adjust tab, or set exposure and white balance. Leave the sliders alone for a straight conversion."
  - name: "Export JPG"
    text: "Click Export, keep Size on Original, choose JPEG and a quality, and confirm. One photo downloads as a JPG."
  - name: "Batch"
    text: "Press Ctrl/Cmd+A to select the filmstrip and export once. The JPGs download together as one ZIP."
faq:
  - q: "How do I convert a NEF to JPG for free?"
    a: "Open the NEF in Lightframes at www.lightframes.si/editor, click Export, choose JPEG and confirm. The file is developed in your browser and saved as a full-resolution JPG, with no account, watermark or upload."
  - q: "How do I open a NEF without software?"
    a: "Open it in the Lightframes editor at www.lightframes.si/editor?intent=raw. You do not install a program, and the file is not uploaded: LibRaw, compiled to WebAssembly, decodes the NEF in your browser. Click Export and choose JPEG when you want a JPG. NRW files from some Coolpix cameras open the same way."
  - q: "What is the difference between NEF and NRW?"
    a: "Both are Nikon RAW formats. NEF is written by Nikon's interchangeable-lens cameras (DSLRs and Z mirrorless), NRW by some Coolpix compacts. Lightframes converts both the same way."
  - q: "Can I batch convert NEF to JPG?"
    a: "Yes. Open a folder or several files, select them all and export once. Every photo is developed with the same settings and the JPGs download together as a ZIP."
  - q: "Are my NEF files uploaded?"
    a: "No. Decoding, editing and JPEG encoding all happen in your browser on your own device. Your photos are not sent to a server."
  - q: "Will the colours match my Nikon JPEGs?"
    a: "Not exactly. Lightframes uses the camera's white balance and a neutral base rendering, but it doesn't apply Nikon Picture Controls, Active D-Lighting or in-camera lens corrections. Adjust the sliders or apply a preset before exporting to get the look you want."
  - q: "What happens with High Efficiency NEF files?"
    a: "Some recent Z cameras offer High Efficiency RAW, a compression the bundled decoder may not be able to read. If a file can't be developed, Lightframes exports the full-size JPEG preview Nikon stores inside the NEF instead of failing."
updated: 2026-11-11
---

## What a NEF file is

NEF (Nikon Electronic Format) is the RAW format of Nikon cameras: every Nikon DSLR and the whole Z mirrorless range save their RAW files as `.nef`, and some Coolpix compacts use the related `.nrw`. A NEF keeps the unprocessed sensor data, which is why it holds more detail in the highlights and shadows than a JPEG, but most websites, chat apps and print services don't accept it and many system viewers can't open it. Converting to JPG makes the photo easy to share.

Lightframes is a free, open-source photo editor that runs in your browser. It opens NEF and NRW files, develops them on your own device and exports full-resolution JPGs, without uploading anything and without installing software.

## Formats the editor opens

NEF is one row of this table. The editor opens every extension here and decodes it with the LibRaw build compiled to WebAssembly that ships with the app. If a camera or a compression is newer than that build, the export uses the full-size JPEG stored inside the file, when the camera saved one. Any other RAW extension is not opened.

| Source | Extensions | Guide |
| --- | --- | --- |
| Nikon | `.nef`, `.nrw` | This page |
| Canon | `.cr2`, `.cr3` | [CR3 to JPG](/tools/cr3-to-jpg) |
| Sony | `.arw` | [ARW to JPG](/tools/arw-to-jpg) |
| DNG (cameras, phones, drones) | `.dng` | [DNG to JPG](/tools/dng-to-jpg) |
| Fujifilm | `.raf` | [RAW to JPG](/tools/raw-to-jpg) |
| Olympus / OM System | `.orf` | [RAW to JPG](/tools/raw-to-jpg) |
| Panasonic | `.rw2` | [RAW to JPG](/tools/raw-to-jpg) |
| Pentax | `.pef` | [RAW to JPG](/tools/raw-to-jpg) |
| Samsung | `.srw` | [RAW to JPG](/tools/raw-to-jpg) |

## How NEF conversion works in the browser

The NEF is decoded on your device by LibRaw, an open-source RAW library compiled to WebAssembly:

- **Thumbnails** come from the preview Nikon embeds in each NEF, so a folder of files appears quickly.
- **The export** is developed from the full sensor data with the white balance the camera recorded, then encoded as JPEG at the quality you choose.
- **A fallback.** If a file can't be developed, for example a High Efficiency NEF or one from a camera newer than the bundled LibRaw, Lightframes exports the full-size JPEG Nikon stored inside the file instead.
- **The files stay in the tab.** The files are never uploaded, and after the first visit editing works offline.

Lossless compressed, compressed and uncompressed NEF files all convert the same way.

## Converting a whole card of NEF files

1. Click **Folder** in the filmstrip and choose the folder that holds your NEF files (Chrome, Edge or Brave), or click **Open** and select them.
2. Press **Ctrl/Cmd+A** to select all.
3. If one edit should apply to all of them, edit one photo, copy it (Ctrl/Cmd+C) and paste it (Ctrl/Cmd+V) onto the selection. See the [batch photo editor](/tools/batch-photo-editor).
4. Click **Export**, choose JPEG and confirm. You get one ZIP with a JPG for every NEF.

Each NEF is developed at full resolution one after another, so a large card takes a while. A computer handles big batches better than a phone.

## Recommended export settings

| Use | Size | Format and quality |
| --- | --- | --- |
| Archive or print | Original (up to 8192 px) | JPEG, 95–100% |
| Email, web, client preview | Web (2048 px) | JPEG, 85–92% |
| Instagram feed | IG 4:5 (1080 × 1350) or IG 1:1 | JPEG, 92% |
| Smallest files | Web (2048 px) | WebP, 80–90% |

To keep the original file names (such as `DSC_0042`), set the file name pattern to `{name}` instead of the default `{name}-edited`.

## Compared with a desktop converter

Nikon's own software, Lightroom and darktable install on the computer, can use more memory, and can apply Picture Controls and lens corrections. Lightframes does not install. No uploads: decoding and the JPEG stay in the browser tab.

A very large NEF, or many open at once, can run out of browser memory and the export fails. Each file is developed one after another. The long edge stops at 8192 px, so a 45 MP body is scaled slightly at Original size, and the rendering does not include Nikon picture styles. A longer look at desktop apps is in [free Lightroom alternatives](/blog/free-lightroom-alternatives).

## Limitations

- **Nikon-specific processing.** Picture Controls, Active D-Lighting and other in-camera or Nikon software corrections are not applied.
- **Size cap.** Exports are limited to 8192 px on the long edge, so files from 45 MP bodies are scaled down slightly at Original size.
- **Metadata.** EXIF information (date, camera, lens, GPS) is not copied into the JPG.
- **Very new bodies and modes.** Files the bundled LibRaw can't read fall back to the embedded preview.

To edit before you export, see the [RAW photo editor](/tools/raw-photo-editor) or [open the editor](/editor?intent=raw). How the decode works is in [edit RAW photos in your browser](/blog/edit-raw-photos-in-browser).
