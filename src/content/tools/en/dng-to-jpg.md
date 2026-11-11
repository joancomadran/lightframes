---
key: dng-to-jpg
slug: dng-to-jpg
title: "Convert DNG to JPG Online, Free and No Upload"
description: "Convert DNG files from cameras, phones and drones to JPG for free in your browser, at full resolution and in batches. No upload, no account, nothing to install."
h1: "Convert DNG to JPG online, free"
lead: "To convert a DNG file to JPG, open it in the Lightframes editor, click Export and choose JPEG. The DNG is developed in your browser and saved as a full-resolution JPG, one file or a whole folder at a time. It works with DNGs from cameras, phones and drones, it's free, and nothing is uploaded."
label: "DNG to JPG"
summary: "Turn DNG files from cameras, phones and drones into full-resolution JPGs in your browser, one by one or as a ZIP."
order: 1.63
featured: false
keywords:
  - "dng to jpg"
  - "convert dng to jpg online free"
  - "dng to jpeg converter"
  - "open dng file"
  - "iphone dng to jpg"
  - "drone dng to jpg"
  - "dng to jpg batch"
steps:
  - name: "Open the files"
    text: "Open the editor and click Open to choose .dng files. In Chrome, Edge or Brave, Folder in the filmstrip loads the folder."
  - name: "Adjust"
    text: "Press Auto in the Adjust tab, or set exposure and white balance. Leave the sliders alone for a straight conversion."
  - name: "Export JPG"
    text: "Click Export, keep Size on Original, choose JPEG and a quality, and confirm. One photo downloads as a JPG."
  - name: "Batch"
    text: "Press Ctrl/Cmd+A to select the filmstrip and export once. The JPGs download together as one ZIP."
faq:
  - q: "How do I convert a DNG to JPG for free?"
    a: "Open the DNG in Lightframes at www.lightframes.si/editor, click Export, choose JPEG and confirm. The file is developed in your browser and saved as a full-resolution JPG, with no account, watermark or upload."
  - q: "Can I convert DNG files from my phone?"
    a: "Yes. Phones that shoot RAW, such as recent iPhone, Pixel and Galaxy models, save DNG files, and they open like any other DNG. Lightframes works in a mobile browser too, although large batches are faster on a computer."
  - q: "Can I convert DNG files from a drone?"
    a: "Yes. Drones that shoot RAW usually save DNG, and those files convert the same way as camera DNGs."
  - q: "Can I batch convert DNG to JPG?"
    a: "Yes. Open a folder or several files, select them all and export once. Every photo is developed with the same settings and the JPGs download together as a ZIP."
  - q: "Are my DNG files uploaded?"
    a: "No. Decoding, editing and JPEG encoding all happen in your browser on your own device. Your photos are not sent to a server."
  - q: "Why does my DNG look different from the phone's own photo?"
    a: "The phone's JPEG or HEIC includes its own processing, such as tone mapping, sharpening and noise reduction. A DNG is closer to the raw capture, so it starts flatter. Press Auto or apply a preset before exporting to get a finished look."
  - q: "What if a DNG doesn't open properly?"
    a: "Some recent phones save DNGs with newer compression types that the bundled decoder may not read. In that case Lightframes exports the full-size JPEG preview stored inside the DNG instead of failing."
updated: 2026-11-11
---

## What a DNG file is

DNG (Digital Negative) is an openly documented RAW format. Instead of a format tied to one brand, it describes the sensor data and how to develop it in a published specification, so any software can read it. Some cameras save DNG natively (Leica, Pentax and Ricoh among them), most phones that shoot RAW use it, and so do many drones. Like any RAW file, a DNG holds more detail than a JPEG but is rarely accepted by websites, chat apps or print services, which is why converting to JPG is often the first step.

Lightframes is a free, open-source photo editor that runs in your browser. It opens DNG files, develops them on your own device and exports full-resolution JPGs, without uploading anything and without installing software.

## Formats the editor opens

DNG is one row of this table. The editor opens every extension here and decodes it with the LibRaw build compiled to WebAssembly that ships with the app. If a camera or a compression is newer than that build, the export uses the full-size JPEG stored inside the file, when one was saved. Any other RAW extension is not opened.

| Source | Extensions | Guide |
| --- | --- | --- |
| DNG (cameras, phones, drones) | `.dng` | This page |
| Canon | `.cr2`, `.cr3` | [CR3 to JPG](/tools/cr3-to-jpg) |
| Nikon | `.nef`, `.nrw` | [NEF to JPG](/tools/nef-to-jpg) |
| Sony | `.arw` | [ARW to JPG](/tools/arw-to-jpg) |
| Fujifilm | `.raf` | [RAW to JPG](/tools/raw-to-jpg) |
| Olympus / OM System | `.orf` | [RAW to JPG](/tools/raw-to-jpg) |
| Panasonic | `.rw2` | [RAW to JPG](/tools/raw-to-jpg) |
| Pentax | `.pef` | [RAW to JPG](/tools/raw-to-jpg) |
| Samsung | `.srw` | [RAW to JPG](/tools/raw-to-jpg) |

## How DNG conversion works in the browser

The DNG is decoded on your device by LibRaw, an open-source RAW library compiled to WebAssembly:

- **Thumbnails** come from the preview embedded in each DNG, so a folder of files appears quickly.
- **The export** is developed from the image data with the white balance recorded in the file, then encoded as JPEG at the quality you choose.
- **A fallback.** If a file uses a compression the bundled decoder can't read, Lightframes exports the full-size JPEG preview stored inside the DNG instead.
- **The files stay in the tab.** The files are never uploaded, and after the first visit editing works offline.

## Converting phone and drone DNGs

Phone and drone DNGs are often smaller and noisier than those from a dedicated camera, and they lack the processing the device applies to its own JPEGs. For a finished look:

1. Open the DNGs and press **Auto** in the Adjust tab on one of them.
2. Raise **Luminance NR** in the Detail section a little if the shadows look grainy.
3. Copy the edit (Ctrl/Cmd+C) and paste it (Ctrl/Cmd+V) onto the other photos from the same session. See the [batch photo editor](/tools/batch-photo-editor).
4. Select them all, click **Export** and choose JPEG. You get one ZIP with a JPG for every DNG.

## Recommended export settings

| Use | Size | Format and quality |
| --- | --- | --- |
| Archive or print | Original (up to 8192 px) | JPEG, 95–100% |
| Email, web, client preview | Web (2048 px) | JPEG, 85–92% |
| Instagram feed | IG 4:5 (1080 × 1350) or IG 1:1 | JPEG, 92% |
| Smallest files | Web (2048 px) | WebP, 80–90% |

To keep the original file names, set the file name pattern to `{name}` instead of the default `{name}-edited`.

## Compared with a desktop converter

Lightroom and darktable install on the computer and can use more memory. Lightframes does not install. No uploads: decoding and the JPEG stay in the browser tab.

A very large DNG, or many open at once, can run out of browser memory and the export fails. Each file is developed one after another. The long edge stops at 8192 px, and phone tone-mapping is not reproduced. A longer look at desktop apps is in [free Lightroom alternatives](/blog/free-lightroom-alternatives).

## Limitations

- **Device processing.** The tone mapping, multi-frame merging and sharpening that phones apply to their own photos are not reproduced.
- **Size cap.** Exports are limited to 8192 px on the long edge.
- **Metadata.** EXIF information (date, camera, lens, GPS) is not copied into the JPG.
- **Newer compression.** DNGs the bundled LibRaw can't read fall back to the embedded preview.

To edit before you export, see the [RAW photo editor](/tools/raw-photo-editor) or [open the editor](/editor?intent=raw). How the decode works is in [edit RAW photos in your browser](/blog/edit-raw-photos-in-browser).
