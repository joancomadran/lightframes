---
key: remove-objects
slug: remove-objects-from-photos
title: "Remove Objects from Photos Online, Free"
description: "Remove objects, people, blemishes and dust spots from photos in your browser. Heal, Clone or AI Remove: free, no account, and your photo is never uploaded."
h1: "Remove objects and spots from your photos"
lead: "Paint over a stray person, a sign, a blemish or a sensor dust spot and Lightframes fills it in from the rest of the photo. It's free, works in your browser, and the photo never leaves your device."
label: "Object remover"
summary: "Paint over objects, blemishes or dust spots and fill them in with Heal, Clone or an on-device AI model."
order: 6
keywords:
  - "remove objects from photos"
  - "remove object from photo online free"
  - "remove person from photo"
  - "remove blemishes from photo"
  - "remove dust spots from photo"
  - "photo eraser tool"
  - "clone stamp online"
steps:
  - name: "Open your photo"
    text: "Open the editor and click Open photos (or Open in the toolbar). JPEG, PNG and camera RAW files all work."
  - name: "Go to the Retouch panel"
    text: "Pick the Retouch tab. The Spot removal section has three modes: Heal, Clone and Remove."
  - name: "Choose a mode and brush size"
    text: "Use Remove for objects and people, Heal for blemishes and dust, Clone for an exact copy. Set Size, Feather and Opacity before you paint."
  - name: "Paint over what you want gone"
    text: "Click for a dot or drag for a stroke. Heal and Clone pick a source area automatically; drag the green outline or press New source to try another one."
  - name: "Check and export"
    text: "Press H to hide the spot outlines and judge the result, then export as JPEG, PNG or WebP."
faq:
  - q: "Can I remove a person from a photo for free?"
    a: "Yes. In Lightframes, choose the Remove mode in the Retouch panel and paint over the person; an AI inpainting model fills the area from its surroundings. It's free, needs no account, and the photo is processed on your device."
  - q: "What is the difference between Heal, Clone and Remove?"
    a: "Clone copies pixels from another part of the photo exactly. Heal copies them too, then blends the colours so the patch meets its surroundings seamlessly. Remove asks an AI model to invent new content for the area, which works best for objects where no clean copy exists elsewhere in the frame."
  - q: "Is my photo uploaded when I use AI Remove?"
    a: "No. The MI-GAN model is downloaded once (about 28 MB) and runs inside your browser. Only the model file is fetched from the internet; your photo stays on your device."
  - q: "Does object removal change my original file?"
    a: "No. Every spot is stored as an editable step, so you can select it, move its source, change its size or delete it later. The original file is never modified; the fix is baked in only in the copy you export."
  - q: "Can I remove the same dust spot from a whole series?"
    a: "Yes. Copy edits from the fixed photo, select the others in the filmstrip, use Paste edits and tick Spot removal. Spots are placed at the same position in each photo, so this works best for sensor dust, which sits in the same place in every frame."
updated: 2026-10-20
---

## What the object remover is for

The object remover in Lightframes lets you erase things you don't want in a photo by painting over them. It's built for the everyday clean-up jobs: a tourist walking through your landscape, a bin or a sign at the edge of the frame, a power line across the sky, skin blemishes in a portrait, or the dust spots that a dirty sensor leaves in the same place on every shot.

It sits in the same editor you use for exposure, colour and presets, so you can retouch and develop a photo in one place. If you shoot RAW, you can open the file directly; spot removal works on RAW files from the [RAW photo editor](/tools/raw-photo-editor) just as it does on JPEGs.

## How it works, and what happens to your photo

All the work happens in your browser; your photo is never sent to a server. Lightframes reads the file from your disk, edits it in memory and writes the result back to your downloads folder when you export. There is no account and no cloud storage.

The three modes use different techniques:

| Mode | What it does | Best for |
| --- | --- | --- |
| **Heal** | Copies a nearby area, then adjusts it so the colours meet the surroundings exactly at the edge (a seamless-cloning blend) | Blemishes, dust spots, small marks on even backgrounds |
| **Clone** | Copies a nearby area as it is, with a feathered edge | Repeating textures, or when you want an exact copy |
| **Remove** | An AI inpainting model (MI-GAN, MIT licence) generates new pixels from what surrounds the painted area | People, objects, signs, anything without a clean copy elsewhere |

For Heal and Clone, Lightframes picks a source area automatically by looking for the best match around the spot. If it chooses badly, drag the green outline to another place or press **New source** (shortcut `/`) to try the next candidate.

Remove needs the model the first time you select it. It downloads once from Hugging Face (about 28 MB), is checked against a fixed checksum, and is then kept in your browser's storage, so later sessions start straight away, even offline. The model runs on your device's processor in a background worker, so the editor stays responsive while it fills a spot. Your photo is not part of that download.

## Controls

- **Size**: brush radius, from 0.2 to 10 (as a percentage of the photo's long edge).
- **Feather**: how soft the edge of the fix is, from 0 to 100% (30% by default).
- **Opacity**: how strongly the fix covers the original, from 5 to 100%.
- **Show spots** (`H`): hides or shows the outlines so you can judge the result.
- **Clear all**: removes every spot on the photo.
- **Delete spot** (`Delete`): removes the selected spot only.

Every spot stays editable. Click it to select it, then change its sliders, move its source or delete it. Undo and redo work as usual.

## Tips for cleaner results

- **Paint a little beyond the edges** of what you're removing. Shadows and soft fringes give the object away if they're left behind.
- **Use several small strokes** rather than one huge one. Each Remove spot is filled after the earlier ones, so later spots build on a cleaner picture.
- **Heal for skin and sky, Remove for things.** Heal keeps real texture from the photo; Remove invents content, which is what you need when there's nothing suitable to copy.
- **Check at 100% zoom** with the outlines hidden before you export.
- **Fixing a whole shoot?** Clean one frame, then copy and paste its edits with Spot removal ticked. The same applies to [batch editing](/tools/batch-photo-editor) in general.

## Limitations

The Remove model is fast and private, but it isn't magic. It works on a crop around each spot of at most 1024 px on its long side (internally at 512 px), so a very large removal on a high-resolution photo can look softer than the surrounding detail. It does best on backgrounds such as grass, sky, walls, sand or water, and less well when the hidden area contains strong structure, like the straight lines of a building or text.

Heal and Clone can only copy what's already in the frame. On a busy photo with no clean area nearby, you may need to try a few sources or switch to Remove.

The first use of Remove needs an internet connection to download the model from Hugging Face. After that it works offline, and your photo never leaves your device. Have more questions about privacy, formats or installing the app? See the [FAQ](/faq), or [open the editor](/editor) and try it on your own photo.
