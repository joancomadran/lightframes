---
key: presets
slug: photo-presets
title: "Free Photo Presets Online — Import Lightroom XMP"
description: "Apply free photo presets online, including Lightroom and Camera Raw .xmp presets. Save your own, set intensity from 0 to 100% and import .cube LUTs. No upload."
h1: "Free photo presets: create, import and apply them in your browser"
lead: "Lightframes lets you save any edit as a custom preset, apply it to one photo or a whole selection, and dial its intensity from 0 to 100%. You can import Lightroom and Camera Raw .xmp presets, JSON presets and .cube LUTs and back them up as JSON, all free in the browser with nothing uploaded."
label: "Photo presets"
summary: "Save your own looks, import XMP, JSON or .cube presets, and apply them at any intensity to one photo or many."
order: 3
keywords:
  - "free photo presets online"
  - "apply preset to photo online"
  - "import xmp preset online"
  - "use xmp presets without software"
  - "apply lightroom preset online"
  - "use lightroom presets without lightroom"
  - "free lightroom alternative presets"
  - "create custom photo preset"
  - "photo filter presets free"
  - "preset intensity"
steps:
  - name: "Open a photo"
    text: "Open a JPEG, PNG or RAW file in the editor. Preset thumbnails in the Presets tab are rendered from this photo."
  - name: "Apply or import a preset"
    text: "In the Presets tab, click one of the built-in Filters, or click Import to load a .xmp, .json or .cube file into My presets."
  - name: "Set the intensity"
    text: "Drag the Intensity slider under Applied from 0 to 100% until the look is as strong as you want."
  - name: "Save your own look"
    text: "After editing a photo, type a name in the Save current edits as… field and click Save. Use Update preset with current edits to overwrite an existing one."
  - name: "Back up your presets"
    text: "Click the download icon on a preset to save it as JSON, or Backup to download all your custom presets in one JSON file."
faq:
  - q: "Can I use my Lightroom presets in Lightframes?"
    a: "Yes, if they are .xmp files, the format Lightroom Classic, Lightroom and Adobe Camera Raw use for develop presets. Click Import in the Presets tab and choose the .xmp file. Lightframes reads its develop settings and maps them onto its own sliders: light, white balance, presence, tone curves, HSL, colour grading or split toning, sharpening, noise reduction, vignette and grain."
  - q: "Will an imported XMP preset look exactly the same?"
    a: "Close, but not always identical. Settings without an equivalent here, such as camera profiles, lens corrections or masks, are ignored, and absolute white balance in Kelvin can only be approximated."
  - q: "What does the intensity slider do?"
    a: "It blends between a neutral edit (0%) and the full preset (100%), including any LUT it contains. When several photos are selected, the slider changes all of them at once."
  - q: "Where are my presets stored?"
    a: "In your browser's local storage on your device (IndexedDB, with a localStorage copy as backup). They are not synced to a server, so use Backup to keep a JSON copy or move them to another browser."
  - q: "Does applying a preset keep my crop?"
    a: "Yes. Crop, rotation, spot removal and background removal stay as they are on each photo. The preset replaces the tone and colour adjustments, and Remove brings the previous ones back."
  - q: "Are there built-in presets?"
    a: "Yes, 15 built-in Filters: Vintage, Old Money, Japan Film, Moody Brown, Analog Dreamy, Moody Forest, Teal & Orange, Warm Film, Bright & Airy, Nordic, B&W, B&W Noir, B&W Matte, Sepia and Selenium."
updated: 2026-10-20
---

## What presets in Lightframes are and who they're for

A preset in Lightframes is a saved set of edit settings that you can apply to any photo with one click. It is for photographers who want a consistent look across a shoot or an Instagram feed, people who have bought or downloaded Lightroom presets (.xmp) and want to use them without installing Lightroom or any other software, and anyone who just wants a quick filter on a phone photo. The editor is free and open source and runs in your browser, which makes it a free Lightroom alternative for applying the looks you already own. See also [using XMP presets without Lightroom](/xmp-presets-without-lightroom) for a step-by-step guide and an honest list of which XMP settings import.

## How presets work, and why your files stay private

Presets are applied on your own device: the editor renders every preset thumbnail and every full-size preview locally, and neither your photos nor your presets are uploaded. Your custom presets are kept in the browser's IndexedDB storage, with a localStorage copy as a fallback, and the editor asks the browser to keep that storage from being cleared automatically.

Applying a preset is non-destructive. It replaces the photo's tone and colour settings, keeps that photo's crop, rotation, spot removal and background, and can be undone. Click **Remove** (or click the active preset again) and the edits you had before come back. Switching from one preset to another replaces the look instead of stacking it, and Remove still returns to the edits you had before the first preset.

## What you can do in the Presets tab

- **Filters:** 15 built-in, read-only looks: Vintage, Old Money, Japan Film, Moody Brown, Analog Dreamy, Moody Forest, Teal & Orange, Warm Film, Bright & Airy, Nordic, B&W, B&W Noir, B&W Matte, Sepia and Selenium.
- **Live thumbnails:** each preset tile shows the active photo with that preset applied.
- **Intensity:** after applying, set it from 0% to 100%.
- **Save:** store the current photo's edits as a new preset under My presets.
- **Update preset with current edits:** overwrite the applied custom preset after tweaking it.
- **Apply to a selection:** with several photos selected in the filmstrip, a preset and its intensity apply to all of them (see the [batch photo editor](/tools/batch-photo-editor)).
- **Import** and **export** in the formats below.

## Supported preset formats

| Format | Import | Export | Notes |
| --- | --- | --- | --- |
| `.json` | Yes | Yes | A single preset, or a full backup containing many |
| `.xmp` | Yes | No | Develop settings mapped onto Lightframes sliders |
| `.cube` | Yes | No | 3D LUT applied after your edits (see [apply a LUT](/tools/apply-lut-to-photo)) |

From an XMP file, Lightframes reads these settings when present:

- Exposure, contrast, highlights, shadows, whites and blacks
- Temperature and tint (relative values directly, Kelvin values approximated)
- Vibrance, saturation, texture, clarity and dehaze
- Master and red, green, blue tone curves
- HSL hue, saturation and luminance for eight colour bands
- Colour grading wheels, or older split-toning settings
- Sharpening, luminance and colour noise reduction
- Post-crop vignette and grain

These are the same develop settings stored in presets exported from Lightroom or Adobe Camera Raw, so most of the look carries over. The preset takes its name from the XMP file when one is stored there, otherwise from the file name.

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is an independent open-source project and is not affiliated with or endorsed by Adobe.

## Tips

- Build presets on a well-exposed photo. A preset saved from a photo that needed +2 EV will push every other photo up too.
- Use intensity instead of saving several strengths of the same look. 60% of a strong film look is often enough.
- After applying a preset, fine-tune exposure and white balance for each photo. Then use **Update preset with current edits** if the change should apply to every photo.
- Click **Backup** from time to time. It downloads a dated JSON file with every custom preset, which you can import again on another device.

## Limitations

- Older Lightroom presets in the `.lrtemplate` format can't be imported; only `.xmp` presets are read.
- XMP import is a mapping, not a copy. Camera profiles, lens corrections, calibration and local masks in the XMP are not imported, so some looks will differ.
- You import one file at a time. To move many presets at once, use a JSON backup.
- Presets live in one browser. Clearing site data, or a private window, can remove them unless you have a JSON backup.
- Presets are exported only as Lightframes JSON, not as XMP or `.cube`.
- The editor interface is in English. More questions are answered in the [FAQ](/faq).
