---
key: lut
slug: apply-lut-to-photo
title: "Apply a .cube LUT to Photos Online, Free"
description: "Apply .cube LUTs to photos online for free. Import a 3D LUT as a preset, set its strength from 0 to 100% and export JPEG, PNG or WebP. Nothing is uploaded."
h1: "Apply a .cube LUT to a photo online"
lead: "To apply a LUT to a photo, open the photo in Lightframes, click Import in the Presets tab and choose your .cube file. The LUT becomes a preset you can apply to one photo or many, at any strength from 0 to 100%, entirely in your browser."
label: "Apply LUT"
summary: "Import .cube 3D LUTs as presets, apply them to photos or RAW files at any strength, and export the result."
order: 4
keywords:
  - "apply lut to photo online"
  - "cube lut photo editor"
  - "use lut on image"
  - "3d lut photo online free"
  - "open cube file online"
  - "lut for photos"
  - "apply cube lut online"
  - "lut photo editor free"
steps:
  - name: "Open your photo"
    text: "Open a JPEG, PNG or camera RAW file in the editor with Open or Folder."
  - name: "Import the .cube file"
    text: "Go to the Presets tab, click Import and choose a .cube 3D LUT. It appears under My presets, named after the LUT's TITLE or its file name."
  - name: "Apply it and set the strength"
    text: "Click the LUT preset, then drag Intensity under Applied between 0 and 100% to blend it with the photo."
  - name: "Adjust the input"
    text: "Fine-tune Exposure, White balance and the other sliders. They are applied before the LUT, so you are correcting what goes into it."
  - name: "Export"
    text: "Click Export and choose JPEG, PNG or WebP. To use the same LUT on other photos, select them and apply the preset, or paste the Look (LUT) group."
faq:
  - q: "Which LUT formats are supported?"
    a: "3D LUTs in the .cube text format, with LUT_3D_SIZE from 2 to 128 and optional DOMAIN_MIN / DOMAIN_MAX lines. 1D .cube LUTs and other LUT formats are not supported."
  - q: "Where in the editing order is the LUT applied?"
    a: "After all other adjustments, including local masks. That means exposure, white balance and colour changes act as the input to the LUT, the way a colour grade is normally applied."
  - q: "Can I make the LUT weaker?"
    a: "Yes. The Intensity slider in the Presets tab blends between no LUT (0%) and the full LUT (100%)."
  - q: "Does applying a LUT preset reset my edits?"
    a: "It replaces the photo's tone and colour sliders with the preset's settings, which for an imported .cube are neutral, while crop, rotation, retouching and background stay. Apply the LUT first and adjust afterwards, or click Remove to get your previous edits back."
  - q: "Can I use LUTs on RAW photos?"
    a: "Yes. RAW files are developed first, then the LUT is applied to the developed image, both in the preview and in the full-resolution export."
  - q: "Is my LUT or photo uploaded anywhere?"
    a: "No. The .cube file is parsed and applied in your browser, and the LUT is stored in your browser's local storage as part of the preset."
updated: 2026-11-08
---

## What applying a LUT in Lightframes means

A LUT (look-up table) is a file that maps every input colour to an output colour, and applying one gives a photo a ready-made colour grade in one step. Lightframes reads 3D LUTs in the common `.cube` format, the same files often sold or shared as film emulations and cinematic looks, and lets you apply them to still photos, including camera RAW files. It is for photographers who already own LUTs, video creators who want matching stills, and anyone who wants a consistent grade across a set. The editor is free, open source and runs in the browser. For what `LUT_3D_SIZE` and the RGB table mean, and how a `.cube` differs from a Lightroom preset, read [what a .cube LUT is and how to use it on photos](/blog/what-is-a-cube-lut).

## How it works, and why it stays on your device

The `.cube` file is read and applied by the editor in your browser, and neither the LUT nor your photos are uploaded. When you import a LUT:

1. Lightframes parses the text file, checks it is a 3D LUT and that the number of samples matches `LUT_3D_SIZE`, and rescales values if the file uses a custom `DOMAIN_MIN` / `DOMAIN_MAX`.
2. It saves the LUT as a preset in your browser's IndexedDB storage. That storage has room for large LUTs; a 65-point cube holds over 270,000 colour samples.
3. When applied, every pixel is looked up in the cube with trilinear interpolation. This happens **after** your other edits and local masks, and the Intensity slider mixes the result with the un-graded image.

Edits are non-destructive. The LUT is stored as a setting on the photo, and the original file is never changed.

## Supported LUT files

| Property | Supported |
| --- | --- |
| File type | `.cube` (plain text) |
| Dimensions | 3D only (`LUT_3D_SIZE`) |
| Cube size | 2 to 128 points per axis |
| Domain | `DOMAIN_MIN` / `DOMAIN_MAX`, normalised automatically |
| Title | Read from `TITLE "…"`, otherwise the file name |
| Comments | Lines starting with `#` or `//` are ignored |
| Not supported | 1D LUTs (`LUT_1D_SIZE`), `.3dl`, `.look`, `.csp` and other formats |

Photos can be JPEG, PNG or any supported camera RAW. Exports can be JPEG, PNG or WebP.

## Try a free .cube LUT on your photo

You do not need your own LUT pack to try a grade in Lightframes. **Coastal Mist** is a 3D `.cube` from our CC0 [free presets & LUTs pack](/free-presets-luts); you can download the LUT alone and use it on any photo.

1. **Download the LUT.** Save [coastal-mist.cube](/downloads/free-presets-pack/coastal-mist/coastal-mist.cube) (33×33×33, released under [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)).
2. **Open a photo** in the [editor](/editor) with **Open** or **Folder** — JPEG, PNG or a [camera RAW file](/tools/raw-photo-editor) all work.
3. **Import it.** In the **Presets** tab, click **Import** and choose `coastal-mist.cube`. It appears under **My presets** as *Coastal Mist* (from the file's `TITLE` line).
4. **Apply and set strength.** Click the preset, then drag **Intensity** under **Applied** between 0 and 100%. Coastal Mist adds cool, lifted shadows; on a typical sRGB JPEG, 60–80% is often enough before fine-tuning exposure.
5. **Compare and export.** Press **\\** for a before/after view. When you are happy, click **Export** and pick JPEG, PNG or WebP.

The same pack has seven other looks as `.xmp` and `.cube` files; import each `.cube` the same way. For the full pack download and licence details, see [free presets & LUTs](/free-presets-luts). Only 3D `.cube` LUTs are supported here; preset `.xmp` files use the same **Import** button but follow the compatibility rules on the [photo presets](/tools/photo-presets) page. If you mainly use Lightroom or Camera Raw `.xmp` presets rather than LUTs, see [how to use XMP presets without Lightroom](/xmp-presets-without-lightroom) for import steps and which develop settings carry over.

## Using LUTs together with your own edits

Because the LUT sits at the end of the pipeline, the sliders work as input controls for it:

- **Exposure and white balance first.** Most creative LUTs assume a correctly exposed, neutral image, so fix those before judging the look.
- **Save a combined look.** When the sliders and LUT work well together, type a name in *Save current edits as…* and save. The new preset contains both your adjustments and the LUT.
- **Apply to many photos.** Select photos in the filmstrip and click the preset, or copy the edits and paste only the **Look (LUT)** group. See the [batch photo editor](/tools/batch-photo-editor).
- **Manage LUT presets like any other.** Delete with ×, download one as JSON, or save all of them with Backup. More in [photo presets](/tools/photo-presets).

## Tips for better results

- Pick LUTs made for standard (Rec.709 / sRGB) images. LUTs built to convert camera *log* footage expect a flat log input and will look far too contrasty on a normal photo.
- Start at 100% intensity to see what the LUT does, then pull it back. Many looks sit well between 50% and 80%.
- If a LUT clips highlights, lower Highlights or Whites before it rather than reducing intensity.
- Check skin tones with the before/after view (`\`) when using strong teal-and-orange grades.

## Limitations

- Only 3D `.cube` files are accepted. Convert other formats to `.cube` first.
- One LUT per photo. Applying a second LUT preset replaces the first instead of stacking.
- LUTs are applied to 8-bit display values after development, not to the RAW's linear data.
- The editor can't export a `.cube`; LUT presets are exported as Lightframes JSON, which includes the LUT data.
- Applying an imported LUT preset sets the tone and colour sliders to neutral, so apply it before fine-tuning, not after.

For more about how the editor works, see the [FAQ](/faq).
