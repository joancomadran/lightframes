---
key: cr3-to-jpg
slug: cr3-to-jpg
title: "Convert CR3 to JPG Online, Free and No Upload"
description: "Convert Canon CR3 files to JPG for free in your browser, at full resolution and in batches. No upload, no account, no software to install. Works offline."
h1: "Convert Canon CR3 to JPG online, free"
lead: "To convert a CR3 file to JPG, open it in the Lightframes editor, click Export and choose JPEG. Your Canon RAW is developed from the sensor data in your browser and saved as a full-resolution JPG, one file or a whole folder at a time. It's free, open source and nothing is uploaded."
label: "CR3 to JPG"
summary: "Turn Canon CR3 (and CR2) RAW files into full-resolution JPGs in your browser, one by one or as a ZIP."
order: 1.6
featured: false
keywords:
  - "cr3 to jpg"
  - "convert cr3 to jpg online free"
  - "cr3 to jpeg converter"
  - "open cr3 file"
  - "canon raw to jpg"
  - "cr3 to jpg batch"
  - "cr3 to jpg without lightroom"
steps:
  - name: "Open the files"
    text: "Open the editor and click Open to choose .cr3 or .cr2 files. In Chrome, Edge or Brave, Folder in the filmstrip loads the card."
  - name: "Adjust"
    text: "Press Auto in the Adjust tab, or set exposure and white balance. Leave the sliders alone for a straight conversion."
  - name: "Export JPG"
    text: "Click Export, keep Size on Original, choose JPEG and a quality, and confirm. One photo downloads as a JPG."
  - name: "Batch"
    text: "Press Ctrl/Cmd+A to select the filmstrip and export once. The JPGs download together as one ZIP."
faq:
  - q: "How do I convert a CR3 to JPG for free?"
    a: "Open the CR3 in Lightframes at www.lightframes.si/editor, click Export, choose JPEG and confirm. The file is developed in your browser and saved as a full-resolution JPG, with no account, watermark or upload."
  - q: "How do I open a CR3 without software?"
    a: "Open it in the Lightframes editor at www.lightframes.si/editor?intent=raw. You do not install a program, and the file is not uploaded: LibRaw, compiled to WebAssembly, decodes the CR3 in your browser, including C-RAW. Click Export and choose JPEG when you want a JPG. Older CR2 files open the same way."
  - q: "Why can't my computer open CR3 files?"
    a: "CR3 is Canon's newer RAW format, introduced in 2018 and built on a different container from the older CR2. Software and system viewers that predate it often can't read it. Lightframes decodes CR3 with LibRaw compiled to WebAssembly, so any modern browser can open it."
  - q: "Can I convert C-RAW (compressed CR3) files?"
    a: "C-RAW files are CR3 files too and open the same way. The JPG carries whatever detail the camera kept when it compressed the file."
  - q: "Can I batch convert CR3 to JPG?"
    a: "Yes. Open a folder or several files, select them all and export once. Every photo is developed with the same settings and the JPGs download together as a ZIP."
  - q: "Are my CR3 files uploaded?"
    a: "No. Decoding, editing and JPEG encoding all happen in your browser on your own device. Your photos are not sent to a server."
  - q: "Does it also convert CR2?"
    a: "Yes. Older Canon .cr2 files are converted in exactly the same way, and so are RAW files from other brands; see the RAW to JPG converter."
  - q: "Will the colours match my Canon JPEGs?"
    a: "Not exactly. Lightframes uses the camera's white balance and a neutral base rendering, but it doesn't apply Canon Picture Styles or in-camera lens corrections. Adjust the sliders or apply a preset before exporting to get the look you want."
updated: 2026-11-11
---

## What a CR3 file is, and why it's awkward to share

CR3 is the RAW format of Canon cameras released since 2018, starting with the EOS M50 and the EOS R and now used across the EOS R mirrorless range and recent EOS DSLRs. It replaced CR2 with a new file structure based on the ISO base media file format, the same family as MP4 and HEIF. That makes it compact and well organised, but software written before 2018 can't read it, and most websites, chat apps and print services don't accept RAW files at all. Converting to JPG solves both problems.

Lightframes is a free, open-source photo editor that runs in your browser. It opens CR3 and CR2 files, develops them on your own device and exports full-resolution JPGs, without uploading anything and without installing software.

## Formats the editor opens

CR3 and CR2 are one row of this table. The editor opens every extension here and decodes it with the LibRaw build compiled to WebAssembly that ships with the app. If a camera or a compression is newer than that build, the export uses the full-size JPEG stored inside the file, when the camera saved one. Any other RAW extension is not opened.

| Source | Extensions | Guide |
| --- | --- | --- |
| Canon | `.cr2`, `.cr3` | This page |
| Nikon | `.nef`, `.nrw` | [NEF to JPG](/tools/nef-to-jpg) |
| Sony | `.arw` | [ARW to JPG](/tools/arw-to-jpg) |
| DNG (cameras, phones, drones) | `.dng` | [DNG to JPG](/tools/dng-to-jpg) |
| Fujifilm | `.raf` | [RAW to JPG](/tools/raw-to-jpg) |
| Olympus / OM System | `.orf` | [RAW to JPG](/tools/raw-to-jpg) |
| Panasonic | `.rw2` | [RAW to JPG](/tools/raw-to-jpg) |
| Pentax | `.pef` | [RAW to JPG](/tools/raw-to-jpg) |
| Samsung | `.srw` | [RAW to JPG](/tools/raw-to-jpg) |

## How CR3 conversion works in the browser

The CR3 is decoded on your device by LibRaw, an open-source RAW library compiled to WebAssembly, which includes Canon's CR3 decoder:

- **Thumbnails** come from the preview Canon embeds in each CR3, so a folder of files appears quickly.
- **The export** is developed from the full sensor data with the white balance the camera recorded, then encoded as JPEG at the quality you choose.
- **A fallback.** If a file can't be developed, for example from a camera newer than the bundled LibRaw, Lightframes exports the full-size JPEG Canon stored inside the CR3 instead.
- **The files stay in the tab.** The files are never uploaded, and after the first visit editing works offline.

## Converting a whole card of CR3 files

1. Click **Folder** in the filmstrip and choose the folder that holds your CR3 files (Chrome, Edge or Brave), or click **Open** and select them.
2. Press **Ctrl/Cmd+A** to select all.
3. If one edit should apply to all of them, edit one photo, copy it (Ctrl/Cmd+C) and paste it (Ctrl/Cmd+V) onto the selection. See the [batch photo editor](/tools/batch-photo-editor).
4. Click **Export**, choose JPEG and confirm. You get one ZIP with a JPG for every CR3.

Each CR3 is developed at full resolution one after another, so a large card takes a while. A computer handles big batches better than a phone.

## Recommended export settings

| Use | Size | Format and quality |
| --- | --- | --- |
| Archive or print | Original (up to 8192 px) | JPEG, 95–100% |
| Email, web, client preview | Web (2048 px) | JPEG, 85–92% |
| Instagram feed | IG 4:5 (1080 × 1350) or IG 1:1 | JPEG, 92% |
| Smallest files | Web (2048 px) | WebP, 80–90% |

To keep the original file names, set the file name pattern to `{name}` instead of the default `{name}-edited`.

## Compared with a desktop converter

Canon's own software, Lightroom and darktable install on the computer, can use more memory, and can apply Picture Styles and lens corrections. Lightframes does not install. No uploads: decoding and the JPEG stay in the browser tab.

A very large CR3, or many open at once, can run out of browser memory and the export fails. Each file is developed one after another. The long edge stops at 8192 px, and the rendering does not include Canon picture styles. A longer look at desktop apps is in [free Lightroom alternatives](/blog/free-lightroom-alternatives).

## Limitations

- **Canon-specific processing.** Picture Styles, Digital Lens Optimizer and other in-camera or Canon software corrections are not applied.
- **Size cap.** Exports are limited to 8192 px on the long edge.
- **Metadata.** EXIF information (date, camera, lens, GPS) is not copied into the JPG.
- **Very new bodies.** Files from cameras newer than the bundled LibRaw version fall back to the embedded preview.

To edit before you export, see the [RAW photo editor](/tools/raw-photo-editor) or [open the editor](/editor?intent=raw). How the decode works is in [edit RAW photos in your browser](/blog/edit-raw-photos-in-browser).
