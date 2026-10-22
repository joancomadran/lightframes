---
key: batch
slug: batch-photo-editor
title: "Free Batch Photo Editor Online"
description: "Batch edit photos online for free: copy and paste edits, sync settings across a selection and export them all as one ZIP. No upload, runs in your browser."
h1: "Batch edit photos online: copy, sync and export many at once"
lead: "In Lightframes you edit one photo, then copy its settings to as many others as you select and export them all in one go as a ZIP. It runs free in your browser, works with RAW and JPEG, and nothing is uploaded."
label: "Batch editor"
summary: "Copy and paste edits across a selection, apply presets to many photos and export them all as one ZIP."
order: 2
keywords:
  - "batch photo editor online"
  - "batch edit photos free"
  - "copy edits to multiple photos"
  - "apply same edit to multiple photos"
  - "sync photo edits"
  - "bulk photo editor"
  - "batch export photos"
steps:
  - name: "Open the photos"
    text: "Click Open in the editor and choose several files, or use Folder in the filmstrip to load a whole directory of JPEG, PNG or RAW files."
  - name: "Edit one photo"
    text: "Pick a representative photo in the filmstrip and adjust it until it looks right."
  - name: "Copy and select the others"
    text: "Press Ctrl/Cmd+C (or Copy edits in the toolbar). Then select the target photos with Ctrl/Cmd-click, Shift-click for a range, or Ctrl/Cmd+A for all."
  - name: "Paste the settings you want"
    text: "Press Ctrl/Cmd+V (Paste edits). Tick the groups to copy, such as Light, White balance or HSL, and click Paste."
  - name: "Export the selection"
    text: "Click Export with the photos still selected. Choose size and format once; several photos download together as a single ZIP file."
faq:
  - q: "Can I copy only some settings, like white balance?"
    a: "Yes. The Paste edits dialog lists each group of settings separately: Light, White balance, Presence, Tone curve, HSL, Color grading, Detail, Vignette & grain, Look (LUT), Masks, Crop & rotate, Spot removal and Background. Only ticked groups are pasted."
  - q: "Why are crop, masks and spot removal unticked by default?"
    a: "Those settings depend on the framing and content of the photo they were made on, so pasting them elsewhere often looks wrong. You can still tick them when the shots match, and your choice is remembered next time."
  - q: "How do I sync edits without copying first?"
    a: "Select several photos, make the photo you edited the active one, and press Paste edits without copying anything. Its settings are pasted onto the rest of the selection."
  - q: "How many photos can I export at once?"
    a: "There is no fixed limit; every selected photo is exported with the same options and bundled into one ZIP. Large batches of RAW files take longer because each one is developed at full resolution, and the practical limit is your device's memory."
  - q: "Can I undo a paste?"
    a: "Yes. Each photo keeps its own undo history, so Ctrl/Cmd+Z restores its previous settings."
  - q: "Are my photos uploaded during batch processing?"
    a: "No. All editing and exporting happens in your browser on your own device, and your photos are not sent to a server."
updated: 2026-10-20
---

## What batch editing in Lightframes is for

Batch editing in Lightframes means editing one photo and applying the same settings to many others, then exporting them all together. It is for anyone with a set of similar pictures: a wedding or event shoot, product photos under the same light, a holiday set shot at golden hour, or a series you want to post with a consistent look. It works on JPEG, PNG and camera RAW files, runs in the browser, and is free and open source.

## How it works, and where your photos stay

Every step runs on your own device: photos are decoded, edited and encoded in your browser, using WebAssembly for RAW files and Web Workers for the image processing, and nothing is uploaded. Edits are non-destructive. Each photo stores its settings, and new files are only created when you export, so the originals are never changed. The open photos and their edits are saved in the browser's local storage, so a page refresh brings your batch back. After the first visit, this kind of editing also works offline.

## Three ways to apply edits to many photos

### Copy and paste

**Copy edits** (Ctrl/Cmd+C) takes the settings of the active photo. **Paste edits** (Ctrl/Cmd+V) opens a dialog that applies them to every selected photo except the source. You choose exactly which groups to paste:

| Group | What it carries |
| --- | --- |
| Light | Exposure, contrast, highlights, shadows, whites, blacks |
| White balance | Temperature, tint |
| Presence | Texture, clarity, dehaze, vibrance, saturation |
| Tone curve | Master and RGB curves |
| HSL | Hue, saturation and luminance of eight colour bands |
| Color grading | Shadow, midtone, highlight and global wheels |
| Detail | Sharpening, luminance and colour noise reduction |
| Vignette & grain | Vignette amount and midpoint, grain amount and size |
| Look (LUT) | A `.cube` LUT and its strength |
| Masks* | Local adjustments |
| Crop & rotate* | Crop, straighten, rotation |
| Spot removal* | Healing and clone spots |
| Background* | Background removal mode |

\*Off by default, because they depend on the framing of the original photo. **All**, **None** and **Defaults** buttons speed up the choice, and the dialog remembers what you ticked last time.

### Sync from the active photo

If nothing has been copied, Paste edits uses the active photo as the source. Select a group of photos, click the one you edited so it is active, and paste: its settings go to the rest of the selection.

### Presets on a selection

Applying a preset from the Presets tab affects every selected photo, and the Intensity slider (0–100%) adjusts all of them together. See [photo presets](/tools/photo-presets) for saving and importing looks.

## Selecting and sorting photos

- **Click** a thumbnail to make it active; **Ctrl/Cmd-click** adds or removes it from the selection; **Shift-click** selects a range.
- **Ctrl/Cmd+A** selects every photo in the filmstrip.
- On touch screens, **long-press** a thumbnail to select several.
- Rate with **1–5**, flag with **P** (pick), **X** (reject) or **U** (clear), and filter the filmstrip to show only picks or a minimum star rating before you select.

## Batch export

With several photos selected, Export applies the same options to all of them:

- Format: **JPEG**, **PNG** or **WebP**, with quality 50–100 for JPEG and WebP.
- Size: Original (up to 8192 px), Web (2048 px long edge), IG 4:5 (1080 × 1350), IG 1:1 (1080 × 1080), Story (1080 × 1920), or a custom long edge.
- A filename pattern such as `{name}-edited`, an optional text watermark, and optional AI upscaling.

A single photo downloads as a file. Several photos download as one ZIP, so your browser doesn't fire dozens of separate downloads. For carousels or collages built from the same set, see the [Instagram carousel maker](/tools/instagram-carousel-maker).

## Tips

- Pick a representative photo as the source: average exposure, typical white balance.
- Paste only global groups (Light, White balance, colour) across a mixed set, then fine-tune exposure per photo.
- Save the finished look as a preset so the next shoot starts from it.

## Limitations

- Exports run one photo at a time in the browser tab. Big RAW batches can take several minutes, and the tab needs to stay open until the ZIP downloads.
- Very large batches are limited by your device's memory. A desktop handles them better than a phone.
- Opening a folder needs a Chromium-based browser (Chrome, Edge, Brave); other browsers can still select many files with Open.
- Pasting doesn't adapt settings to each photo. If exposure varies a lot across the set, adjust those photos individually after pasting.

More answers about privacy, offline use and browsers are on the [FAQ page](/faq).
