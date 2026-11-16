---
key: raw-editor
slug: raw-photo-editor
title: "Free RAW Photo Editor Online — No Upload"
description: "Free online RAW photo editor for DNG and NEF, plus ARW, CR2 and CR3. Nothing is uploaded. No account, and it works offline after the first visit."
h1: "Edit RAW photos online, free and without uploading"
lead: "Lightframes opens camera RAW files (ARW, CR2, CR3, NEF, DNG, RAF, ORF, RW2 and more) directly in your browser and develops them on your own device. It is free, needs no account, and your photos are never uploaded."
label: "RAW editor"
summary: "Open and develop ARW, CR3, NEF, DNG and other camera RAW files in the browser. Free, private, nothing uploaded."
order: 1
keywords:
  - "raw photo editor online"
  - "edit raw photos online free"
  - "open arw file online"
  - "cr3 editor online"
  - "nef editor online"
  - "dng editor online"
  - "raw editor no upload"
  - "free raw converter browser"
  - "raw photo editor free"
  - "free raw processor"
  - "free raw editor"
  - "online raw photo editor"
  - "camera raw filter online"
  - "online nef editor"
steps:
  - name: "Open your RAW files"
    text: "Go to the editor and click Open in the toolbar, or use Folder in the filmstrip to load a whole directory. RAW files appear as thumbnails in the filmstrip."
  - name: "Develop the photo"
    text: "In the Adjust tab set Light (exposure, contrast, highlights, shadows, whites, blacks) and white balance, or press Auto. Use Color, Curve, Effects and Local for finer control."
  - name: "Check highlights and shadows"
    text: "Press J to show the clipping overlay on the histogram and preview, and press \\ to compare before and after."
  - name: "Export a JPEG, PNG or WebP"
    text: "Click Export, pick a size and format, and confirm. The RAW is developed again at full resolution from the sensor data and downloaded to your device."
faq:
  - q: "Which RAW formats can Lightframes open?"
    a: "It opens .arw, .cr2, .cr3, .nef, .nrw, .dng, .raf, .orf, .rw2, .pef and .srw files, plus JPEG and PNG. Decoding is done by LibRaw compiled to WebAssembly, so support follows what that library can read."
  - q: "Are my RAW files uploaded to a server?"
    a: "No. The files are read and developed inside your browser on your own device. Your photos are not sent to a server, and you don't need an account."
  - q: "Does editing change my original RAW file?"
    a: "No. Edits are stored as settings and applied only when you export a new file. The RAW on your disk is never modified."
  - q: "Can I edit RAW photos offline?"
    a: "Yes. After the editor has loaded once while online, the app and its RAW decoder are cached, so opening, editing and exporting RAW files works without a connection. You can also install it as an app."
  - q: "What resolution does the export have?"
    a: "Exports are developed from the full-resolution sensor data, up to 8192 px on the long edge. You can also choose a smaller long edge or a fixed social-media size."
  - q: "Is this RAW editor really free?"
    a: "Yes. There is no cost, no account and no watermark unless you turn one on yourself in the export dialog. Lightframes is free and open source under the MIT license."
  - q: "Is there a Camera Raw filter online?"
    a: "Lightframes is not Adobe Camera Raw and does not load that filter. In the browser it offers Camera Raw-style develop sliders: exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, texture, clarity, dehaze, vibrance and saturation, plus a tone curve, HSL and colour grading. You can import a Lightroom or Camera Raw .xmp preset, but camera profiles, lens corrections and masks in that file are not applied. Lightroom and Camera Raw are trademarks of Adobe, and Lightframes is not affiliated with Adobe. Import steps are in [how to use XMP presets without Lightroom](/xmp-presets-without-lightroom)."
  - q: "Can I edit NEF or DNG files online without installing software?"
    a: "Yes. Open a .nef, .nrw or .dng file in the editor. LibRaw decodes it in your browser on your device, nothing is uploaded, and you export a JPEG, PNG or WebP. There is nothing to install and no account. Convert-only steps are on [NEF to JPG](/tools/nef-to-jpg) and [DNG to JPG](/tools/dng-to-jpg)."
  - q: "Can I use my Lightroom XMP presets on RAW files?"
    a: "Yes, when the preset is a .xmp develop file. Import it from the Presets tab and apply it to the RAW. Lightframes maps exposure, contrast, highlights, shadows, whites, blacks, white balance, texture, clarity, dehaze, vibrance, saturation, the tone curve, HSL, colour grading, sharpening, noise reduction, vignette and grain. Camera profiles, lens corrections and masks in the file are not imported. Lightroom and Camera Raw are trademarks of Adobe, and Lightframes is not affiliated with Adobe. See [how to use XMP presets without Lightroom](/xmp-presets-without-lightroom) and the [free presets and LUTs pack](/free-presets-luts)."
updated: 2026-11-16
---

## What this RAW editor is and who it's for

Lightframes is a free RAW photo editor that runs entirely in a web browser, built for photographers who want to develop camera files without installing software, signing up or sending their pictures to a cloud service. It suits a quick edit on a borrowed laptop, a look at a card of files while travelling, or a full editing session on your own computer. The code is open source under the MIT license.

If you would rather install a desktop RAW catalogue, see [free Lightroom alternatives](/blog/free-lightroom-alternatives): it compares Lightframes with darktable, RawTherapee and Photopea.

For a walkthrough of those steps, read the [step-by-step guide to editing RAW photos in your browser](/blog/edit-raw-photos-in-browser).

## How RAW decoding works, and why nothing is uploaded

Every RAW file is decoded on your device by LibRaw, a RAW decoding library compiled to WebAssembly, and the pixels never leave the browser. Here is what happens to a file once you open it:

- **Thumbnails** come from the JPEG preview that cameras embed in the RAW, so a folder of files shows up in the filmstrip quickly.
- **The editing preview** is developed from the sensor data at half size into 16-bit linear RGB, using the camera's recorded white balance. That keeps highlight detail an embedded JPEG has already thrown away, so pulling back a bright sky works better.
- **The export** is developed again from the sensor data at full resolution. If LibRaw cannot develop a particular file, Lightframes falls back to the embedded JPEG instead of failing.
- **Your edits are non-destructive.** They are stored as settings, and the original RAW is never written to.
- **Sessions survive a refresh.** Open photos and their edits are kept in your browser's local storage (IndexedDB), so reloading the page brings them back.

Because the work happens locally, the app keeps working offline after its first load, including RAW decoding. You can install it as an app (PWA) from the browser.

## Supported RAW and image formats

Lightframes recognises the following file extensions:

| Extension | Common source |
| --- | --- |
| [`.arw`](/tools/arw-to-jpg) | Sony |
| [`.cr2`](/tools/raw-to-jpg), [`.cr3`](/tools/cr3-to-jpg) | Canon |
| [`.nef`](/tools/nef-to-jpg), [`.nrw`](/tools/nef-to-jpg) | Nikon |
| [`.dng`](/tools/dng-to-jpg) | Digital Negative (many cameras and phones) |
| [`.raf`](/tools/raw-to-jpg) | Fujifilm |
| [`.orf`](/tools/raw-to-jpg) | Olympus / OM System |
| [`.rw2`](/tools/raw-to-jpg) | Panasonic |
| [`.pef`](/tools/raw-to-jpg) | Pentax |
| [`.srw`](/tools/raw-to-jpg) | Samsung |
| `.jpg`, `.jpeg`, `.png` | Any camera, phone or app |

Only need a JPG? The [RAW to JPG converter](/tools/raw-to-jpg) covers any of these files, one at a time or a whole card. Dedicated pages: [Sony ARW to JPG](/tools/arw-to-jpg), [Canon CR3 to JPG](/tools/cr3-to-jpg), [Nikon NEF to JPG](/tools/nef-to-jpg) and [DNG to JPG](/tools/dng-to-jpg).

You can export to **JPEG**, **PNG** or **WebP**, with a quality setting (50–100) for JPEG and WebP, a long-edge size from 800 to 8192 px, and a filename pattern such as `{name}-edited`.

## What you can adjust

The editor covers the usual development controls, all applied live on the preview:

- **Light:** exposure, contrast, highlights, shadows, whites and blacks, with an Auto button that sets them from the histogram.
- **White balance:** temperature and tint, a picker for clicking something neutral, and Auto.
- **Presence and color:** texture, clarity, dehaze, vibrance, saturation, an HSL editor with eight colour bands, and colour grading for shadows, midtones and highlights.
- **Tone curve:** a master curve plus red, green and blue curves.
- **Detail and effects:** sharpening, luminance and colour noise reduction, vignette and grain.
- **Geometry:** crop with aspect presets, straighten and rotate.
- **Local adjustments:** radial, linear (graduated) and brush masks, plus a Subject mask found automatically.
- **Retouching:** spot healing and cloning, and AI object removal (see [remove objects from photos](/tools/remove-objects-from-photos)).

## Tips for better RAW edits

- Recover highlights first. Lower Highlights and Whites while the clipping overlay (J) is on, then lift Shadows.
- Fix white balance before colour work. The picker gives a neutral starting point for HSL and grading.
- Save your look. Once a photo looks right, store it as a [custom preset](/tools/photo-presets) and apply it to the rest of the shoot.
- Use a Lightroom or Camera Raw .xmp preset on a RAW file from the Presets tab. [How to use XMP presets without Lightroom](/xmp-presets-without-lightroom) lists which settings carry over. A starter set is in the [free presets and LUTs pack](/free-presets-luts).
- Edit a whole shoot at once. Copy and paste edits across a selection and export everything as one ZIP with the [batch photo editor](/tools/batch-photo-editor).

## Limitations

- **Preview vs. export resolution.** The preview is developed at half size for speed; full resolution is developed only on export, which takes a few seconds per RAW and longer for large batches.
- **Maximum size.** Exports are capped at 8192 px on the long edge, so files from very high-resolution sensors are scaled down slightly.
- **Rendering.** Lightframes uses one default tone rendering for all RAW files. It does not apply camera-specific colour profiles or lens corrections.
- **New cameras.** Very recent camera models may not be readable by the bundled LibRaw version. In that case you can still edit the embedded JPEG preview.
- **Memory.** Large RAW files use a lot of memory. A desktop browser handles big sessions better than a phone.
- **Browser.** Any modern browser can open files with Open. Opening a whole folder needs a Chromium-based browser such as Chrome, Edge or Brave.

More answers are on the [FAQ page](/faq).
