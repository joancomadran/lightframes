---
key: film-look
slug: make-photos-look-like-film
title: "How to Make Digital Photos Look Like Film"
description: "Give digital photos a real film look for free: lift the blacks, soften highlights, shift colours, add grain. A step-by-step recipe that runs in your browser."
h1: "How to make digital photos look like film"
published: 2026-10-22
author: Joan Comadran
tags: ["film", "guides"]
tools: ["presets", "lut", "raw-editor", "batch"]
keywords:
  - how to make photos look like film
  - film look photo editor online free
  - make digital photos look analog
  - add film grain to photo online
  - film emulation free
  - vintage film effect photo
  - faded film look
---

**Short answer:** a film look comes from four changes, in this order: lift the blacks so nothing is pure black, soften the highlights, shift the colours (warmer shadows and highlights, calmer greens and blues, a bit less saturation) and add fine grain. In [Lightframes](/editor) that's the **Curve** tab (or the **Matte** curve), **Adjust**, **Color** and **Effects → Grain**. For a one-click start, apply the built-in **Warm Film**, **Japan Film** or **Analog Dreamy** filter and lower its intensity. It's free, and the photo never leaves your device.

## What actually makes a photo look like film?

Grain on its own doesn't do it; added to a crisp, contrasty digital file it mostly reads as noise. The look is a set of traits that appear together:

| Film trait | What digital does instead | Where to fix it in Lightframes |
| --- | --- | --- |
| Blacks that stay dark grey (faded, matte shadows) | True black in the darkest areas | **Curve**: raise the bottom-left point, or pick **Matte** |
| Highlights that roll off gently | Hard clipping to white | **Adjust → Light**: lower **Highlights** and **Whites** |
| Softer, lower overall contrast | Punchy contrast straight from the camera | **Adjust → Light**: lower **Contrast**, then a gentle S in **Curve** |
| Colour casts that differ by tone | Neutral, even colour | **Color → Color grading**: Shadows, Mids, Highs |
| Calmer greens and blues, warm skin | Every channel equally saturated | **Color → Color mixer** (HSL), **Adjust**: Saturation down |
| Less "digital" crispness | Strong sharpening and micro-contrast | **Adjust → Presence**: Clarity down; keep **Sharpening** low |
| Visible grain | Clean, smooth surfaces | **Effects → Grain**: Amount and Size |

Each step below covers one row. Work in this order, because tone changes how colour reads and grain should go on last.

## How do you get the film look in Lightframes, step by step?

Open the [editor](/editor), click **Open** and pick a photo. RAW files are the best starting point because highlights and colour have more headroom (more on that in [how to edit RAW photos in your browser](/blog/edit-raw-photos-in-browser)), but JPEG and PNG work too. The interface is in English, so the control names below are the ones you'll see.

1. **Set the base exposure.** In **Adjust → Light**, get the brightness right with **Exposure** first. A film look on a dark, underexposed file just looks muddy.
2. **Lower the contrast.** Pull **Contrast** down to somewhere between −10 and −30. The built-in film filters sit in that range: Warm Film uses −10, Japan Film goes as far as −40.
3. **Soften the highlights.** Lower **Highlights** (around −20 to −30) and, if skies or skin still look hard, **Whites**. Press **J** to show the clipping overlay and pull back until it disappears from areas that should keep detail.
4. **Fade the blacks.** Open the **Curve** tab and click **Matte**, which lifts black to about 10% grey and pulls white down slightly. For control, drag the bottom-left point of the RGB curve straight up instead: a small lift gives a gentle fade, a large one looks hazy. Click the curve to add a point and add a soft S through the midtones if the image now looks flat. Double-click a point to remove it.
5. **Warm it up a little.** Back in **Adjust → Color**, nudge **Temperature** up (the Warm Film filter uses +12) and lower **Saturation** slightly (−5 to −20). Leave **Vibrance** alone or raise it a touch so skin keeps some life.
6. **Split the colour by tone.** In **Color → Color grading**, choose **Shadows** and drag the wheel towards amber or teal at low saturation, then do the same for **Highs**, usually towards a warm yellow-orange. Keep **Mids** subtle; that's where skin lives. **Blending** controls how much the zones overlap and **Balance** shifts the split towards shadows or highlights.
7. **Calm the greens and blues.** In **Color → Color mixer**, lower the saturation of **Greens**, **Aquas** and **Blues**. Shifting green hue slightly towards yellow is a classic film move. This is what separates a film look from a filtered phone photo.
8. **Take the digital edge off.** In **Adjust → Presence**, lower **Clarity** a little (−10 to −20). Lightframes starts with **Sharpening** at 0; keep it low for this look.
9. **Add grain last.** In **Effects → Grain**, set **Amount** to roughly 15–30 and adjust **Size**. Lightframes' grain is monochrome, it's weaker in deep shadows and bright highlights the way film grain tends to be, and its size scales with the image, so the preview matches the full-resolution export.
10. **Optional vignette.** In **Effects → Vignette**, a small negative **Amount** (−5 to −15) darkens the corners like an old lens. **Midpoint** sets how far it reaches in.

Press **\\** to compare with the original, then export with **Ctrl/Cmd+E** as JPEG, PNG or WebP.

## Faster: start from a film filter or a LUT

If you'd rather not build the look from scratch, the **Presets** tab includes read-only filters designed around film traits:

- **Warm Film:** warm, low-contrast portrait film with lifted blacks and light grain.
- **Japan Film:** faded, cooler highlights, quiet greens and blues, more grain.
- **Analog Dreamy:** soft and hazy, with faded blacks and gentle colour grading.
- **Vintage:** lifted blacks, softened whites, warm midtones.
- **B&W Matte:** black and white with lifted blacks and coarser grain.

Click a filter, then drag **Intensity** down; many photos look best between 50% and 80%. A filter replaces the tone and colour sliders, so apply it first and fine-tune afterwards. Your crop and retouching stay as they are.

If you own film-emulation LUTs, import the `.cube` file under **Presets → Import**. The LUT is applied after your other edits, so exposure and white balance act as its input. See [apply a LUT to a photo](/tools/apply-lut-to-photo) for which files work.

## How do you keep the look consistent across a whole set?

A film look matters most when a series or a feed looks like it was shot on the same roll:

- **Save it as a preset.** Type a name in **Save current edits as…** in the Presets tab. Next time it's one click. More in [photo presets](/tools/photo-presets).
- **Paste it onto the rest.** Copy the edits with **Ctrl/Cmd+C**, select the other photos in the filmstrip and paste with **Ctrl/Cmd+V**. The paste dialog lets you pick groups, so you can bring **Tone curve**, **HSL**, **Color grading** and **Vignette & grain** across without the crop or each photo's own **Light** and **White balance**. See the [batch photo editor](/tools/batch-photo-editor).
- **Correct each photo's exposure and white balance separately.** A preset can't know that one shot was taken in shade. Fix the input, keep the look.

## Common mistakes

- **Too much grain.** If grain is the first thing you notice, it's too strong. Lower **Amount** before you lower **Size**.
- **Fading the blacks and then crushing them again.** Raising **Contrast** or lowering **Blacks** after the matte curve undoes the fade. Shape contrast in the midtones of the curve instead.
- **Over-tinting skin.** Strong colour in **Mids** turns faces green or orange. Check skin with the before/after view.
- **Using log-to-Rec.709 video LUTs on photos.** LUTs built for flat log footage expect a flat input, so on a normal photo they look far too contrasty.

## Common questions

**Can I add halation or bloom?**
Lightframes has no dedicated halation or bloom control. You can get the rest of the look (fade, colour, grain, vignette) with the steps above.

**Can I use film presets I already own?**
If they're `.xmp` presets from Lightroom or Camera Raw, yes: import them in the Presets tab and Lightframes maps their develop settings, including tone curves, colour grading and grain, onto its own sliders. Camera profiles, lens corrections and masks aren't imported, so some looks will differ. Lightroom and Camera Raw are trademarks of Adobe; Lightframes is independent and not affiliated with Adobe. Details in [photo presets](/tools/photo-presets).

**Does it work on a phone?**
Yes, the editor works on phones and tablets, and the film filters and grain work the same way. Large RAW files are more comfortable on a laptop.

**Is it free, and is my photo uploaded?**
It's free, with no account, and nothing is uploaded: the photo is edited and exported inside your browser. Lightframes is open source under the MIT licence ([GitHub](https://github.com/joancomadran/lightframes)).

Ready to try it? [Open the editor](/editor), load a photo and start with the **Matte** curve.
