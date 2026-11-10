---
key: remove-objects-guide
slug: remove-objects-from-photos-online
title: "How to Remove Objects from Photos Online (Free, No Upload)"
description: "Remove objects, people and blemishes from photos online for free in your browser. Heal, Clone or AI Remove in Lightframes — no upload, no account."
h1: "How do you remove objects from photos online for free without uploading them?"
published: 2026-11-05
author: Lightframes
tags: ["guides", "retouch"]
tools: ["remove-objects", "background-remover", "raw-editor", "batch"]
keywords:
  - remove objects from photo online free
  - how to remove objects from photos
  - remove person from photo free
  - remove blemishes from photo online
  - clone stamp online free
  - photo inpainting browser
faq:
  - q: "Is object removal in Lightframes really free?"
    a: "Yes. Heal, Clone and Remove are free, with no account and no export watermark. Lightframes is open source under the MIT licence."
  - q: "Is my photo uploaded when I remove something?"
    a: "No. The photo is read from your device, edited in memory in your browser and saved only when you export. The only network fetch for Remove is the MI-GAN model file (~28 MB from Hugging Face) the first time you use that mode; your image is not part of that download."
  - q: "When should I use Heal, Clone or Remove?"
    a: "Use Heal for small marks on even areas (blemishes, dust, tiny specks) where a nearby patch can blend in. Use Clone when you want an exact copy of texture (repeating patterns, grass, tiles). Use Remove for people, signs and objects where there is no clean source elsewhere in the frame — the AI inpainting model invents new pixels from the surroundings."
  - q: "Can I remove a person from a photo for free?"
    a: "Yes. Open the Retouch tab, choose Remove, paint over the person (include their shadow in the stroke if you can) and wait for the fill. Use several passes for crowded scenes rather than one huge brush."
  - q: "Does Remove work offline after the model downloads?"
    a: "After the first download, MI-GAN is stored in your browser and checked against a fixed checksum. Later sessions can run Remove without fetching the model again, including offline, as long as that storage is still available."
  - q: "Can I remove spots from RAW files?"
    a: "Yes. Spot removal works on JPEG, PNG and camera RAW files opened in Lightframes, including the same session as exposure and colour edits. See the RAW editor tool page and the guide on editing RAW in the browser for format details."
---

**You can remove objects from a photo online for free without uploading it** by opening [Lightframes](/editor), going to the **Retouch** tab and painting over what you want gone with **Heal**, **Clone** or **Remove**. The full workflow — open file, retouch, develop and export — runs in your browser; the photo stays on your device. Step-by-step controls and mode details are on the [remove objects from photos](/tools/remove-objects-from-photos) tool page.

## When should you use Heal, Clone or Remove?

All three modes live under **Retouch → Spot removal**. They solve different problems; picking the wrong one is the main reason a fix looks pasted on.

| Mode | What it does | Best for |
| --- | --- | --- |
| **Heal** | Copies a nearby area, then blends colours so the edge meets the surroundings (seamless cloning) | Blemishes, sensor dust, small marks on skin, sky or walls |
| **Clone** | Copies a nearby area exactly, with a feathered edge | Repeating texture, or when you need a literal copy from elsewhere in the frame |
| **Remove** | On-device AI inpainting (MI-GAN, MIT licence) generates new pixels from what surrounds the stroke | People, signs, bins, power lines — anything with no clean patch to copy |

For **Heal** and **Clone**, Lightframes picks a source automatically. If the green outline sits in the wrong place, drag it or press **New source** (shortcut `/`) to try the next candidate.

For **Remove**, the model runs the first time you select the mode: it downloads once from Hugging Face (about **28 MB**), is verified with a checksum, then stays in browser storage. Your photo is not sent; only the model weights are fetched.

**Quick rule of thumb:** if a real patch of the photo could replace the blemish, start with **Heal**. If you need that patch copied literally, use **Clone**. If the thing you are erasing is unique in the frame, use **Remove**.

Need the whole background gone instead of one object? That is a different tool: [background remover](/tools/background-remover) cuts out the subject for a transparent PNG or a solid colour.

## How to remove objects in Lightframes, step by step

1. **Open the editor** at [/editor](/editor) and click **Open** (or **Open photos**). JPEG, PNG and camera RAW files all work; RAW keeps the same non-destructive spot list until you export ([RAW photo editor](/tools/raw-photo-editor)).
2. **Open the Retouch tab.** Under **Spot removal**, choose **Heal**, **Clone** or **Remove**.
3. **Set Size, Feather and Opacity** before you paint. **Size** is the brush radius (0.2–10 as a percentage of the long edge). **Feather** softens the edge (30% is the default). **Opacity** controls how strongly the fix covers the original (5–100%).
4. **Paint over what you want removed.** Click for a small dot or drag for a stroke. For **Remove**, wait until the spot finishes filling before starting another large area — each spot is processed in order.
5. **Hide the outlines** with **Show spots** (`H`) and check the result at **100% zoom**. Undo, delete a spot (`Delete`), or select it and adjust the sliders.
6. **Export** with **Ctrl/Cmd+E** as JPEG, PNG or WebP. The original file on disk is never modified; spots are editable steps until export.

Every spot stays on the stack: click one to move its source, resize it or delete it. **Clear all** removes every spot on that photo.

## Techniques that give cleaner results

These habits matter more than chasing a bigger AI model:

- **Brush wider than the object.** Include a little extra sky, pavement or grass around the edges. A tight stroke often leaves a halo or a hard seam.
- **Include shadow and reflection in the same stroke.** A person or a post still “reads” if their shadow stays on the ground, or a window reflection stays in the glass. Paint the object and its cast shadow together when you can.
- **One object per pass.** Finish and check each **Remove** spot before painting the next. Later spots see the result of earlier ones, which keeps backgrounds consistent.
- **Large objects: work inward.** For a big sign or a group, erase from the outside in with several strokes instead of one rectangle over the whole area.
- **Check at 100% with outlines hidden** before export. What looks fine at fit-to-screen often shows a smear when you zoom in.
- **Sensor dust on a whole shoot?** Fix one frame, copy edits (**Ctrl/Cmd+C**), select the rest in the filmstrip, paste (**Ctrl/Cmd+V**) and tick **Spot removal**. Dust sits in the same place on every shot — see the [batch photo editor](/tools/batch-photo-editor).

If you opened a RAW, you can fix dust and develop exposure in one session; the guide [edit RAW photos in your browser](/blog/edit-raw-photos-in-browser) covers decode and export without uploading files.

## Privacy: what leaves your device

Lightframes processes photos **in your browser**. Nothing is uploaded to a Lightframes server for Heal, Clone or Remove.

The exception people ask about is **Remove**: the **MI-GAN** weights download **once** from **Hugging Face** (about **28 MB**), are checked against a fixed checksum, then cached locally. After that, inpainting can run **offline** in many browsers, as long as that cache remains. Your image bytes are not part of the download and are not sent for inference — the model runs in a background worker on your device.

That is different from cloud “magic eraser” sites that require an upload. It is also honest about the first-use download: you need a connection once for **Remove**, not for **Heal** or **Clone**.

Lightframes is open source ([GitHub](https://github.com/joancomadran/lightframes)). The editor UI is in English; this guide is available in [Spanish](/es/blog/quitar-objetos-foto-online).

## What Remove cannot do perfectly

No tool invents perfect architecture every time. In Lightframes:

- **Remove** works on a crop around each painted spot of at most **1024 px on the long side**, processed internally at **512 px**. On a very high-resolution file, a huge removal can look softer than the surrounding detail — smaller strokes usually look better.
- **Strong geometry and text** (straight building lines, readable type) are harder than grass, sky, sand or water. Expect to refine with a second pass or switch to **Heal**/**Clone** where a real source exists.
- **Heal** and **Clone** only copy what is already in the frame. On a cluttered photo with no clean nearby patch, try **New source** a few times or move to **Remove**.

Lightroom and Camera Raw include their own healing tools on paid or desktop workflows; Lightframes is an independent browser editor, not affiliated with Adobe. If you already use Lightframes for RAW and presets, retouch sits in the same **Retouch** tab — no separate app required.

## Common questions

The FAQ entries in this page cover free use, uploads, mode choice, removing people, offline **Remove** after the model cache, and RAW support. For tool-specific steps and keyboard shortcuts, see [remove objects from photos](/tools/remove-objects-from-photos).

Ready to try it? [Open the editor](/editor), load a photo, open **Retouch**, and paint over one distraction with **Heal** or **Remove**.
