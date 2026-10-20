---
key: seamless-carousel
slug: seamless-instagram-carousel-panorama
title: "Make a Seamless Instagram Carousel From a Panorama"
description: "Split a panorama into a seamless Instagram carousel that swipes as one picture. Pick 4:5, 3:4 or 1:1, set the slides and export each at 1080 px wide."
h1: "How to make a seamless Instagram carousel from a panorama"
published: 2026-10-20
author: Joan Comadran
tags: ["instagram", "guides"]
tools: ["carousel", "collage", "raw-editor"]
keywords:
  - seamless instagram carousel
  - split panorama for instagram
  - instagram panorama carousel
  - panorama carousel maker
  - instagram carousel 1080 x 1350
  - seamless carousel template
  - how to post a panorama on instagram
---

**Short answer:** a seamless carousel is one wide image cut into equal slides, so swiping through the post feels like panning across a single picture. In [Lightframes](/editor), open your panorama, switch to **Collage → Carousel**, pick a slide shape (4:5, 3:4 or 1:1) and a number of slides, choose the **Panorama** layout, and export. You get one JPEG per slide, each 1080 px wide, numbered in posting order.

## What is a seamless Instagram carousel?

An Instagram carousel is a single post with several images that people swipe through. In a *seamless* carousel those images aren't separate photos: they're consecutive pieces of one wide strip. The right edge of slide 1 continues exactly where slide 2 begins, so the scene flows across the cut.

It's the best way to show a panorama in the feed. Posted as a single image, a wide landscape gets squeezed into a thin band. Spread across three or four slides, every part of it is shown at full feed height.

The same trick works with several photos: a picture straddling the cut between two slides nudges people to keep swiping. Lightframes has layouts for that too, but this guide focuses on the panorama case.

## Which aspect ratio should you pick: 4:5, 3:4 or 1:1?

Lightframes offers the three feed shapes for carousels. All of them are exported 1080 px wide:

| Slide shape | Size per slide | When to use it |
| --- | --- | --- |
| 4:5 (Portrait) | 1080 × 1350 px | The default, and a safe choice: tall slides take up a lot of the screen in the feed. |
| 3:4 (Tall) | 1080 × 1440 px | Slightly taller still, and it matches the 3:4 grid thumbnails on profiles. Check that your Instagram app offers 3:4 when you post. |
| 1:1 (Square) | 1080 × 1080 px | Very wide panoramas, where taller slides would crop too much off the top and bottom. |

<!-- TODO: re-check Instagram's current feed ratios and slide limit before publishing; they change. -->

The more useful question is how many slides to use. The whole strip has a width-to-height ratio of **number of slides × slide ratio**. Four 4:5 slides make a strip of 4 × 0.8 = 3.2:1. Three square slides make 3:1.

The panorama is fitted to fill the strip, so if their shapes differ, something is trimmed: the top and bottom when the photo is taller than the strip, the sides when it's wider. To lose as little as possible, divide your panorama's ratio by the slide ratio:

- A **3:1** panorama: 3 square slides, or 4 slides at 3:4 (exactly 3:1), or 4 slides at 4:5 (a little off the top and bottom).
- A **4:1** panorama: 4 square slides, or 5 slides at 4:5.
- A **2:1** panorama: 2 square slides, or 3 slides at 3:4 (2.25:1, a little off the sides).

You can use between 2 and 10 slides.

**Resolution check:** the strip is 1080 px per slide wide. Four slides need a panorama at least 4320 px wide to avoid enlarging it. Most stitched panoramas are far bigger than that, but a crop from a phone photo may not be.

## How do you make the carousel in Lightframes, step by step?

1. **Open your panorama.** Go to [/editor](/editor), click **Open** and pick the file. JPEG, PNG and camera RAW all work.
2. **Edit it first (optional).** Do your exposure, colour and cleanup in **Edit** mode. The carousel uses the edited photo, and the export develops it again from the full-resolution original, RAW included. See the [RAW photo editor](/tools/raw-photo-editor) if you're starting from a RAW.
3. **Switch to the carousel.** Click **Collage** in the mode switch at the top, then choose **Carousel** under **Format** in the sidebar. With a single photo selected, it starts as a panorama across three slides.
4. **Pick the size.** Under **Size**, choose 4:5, 3:4 or 1:1, then set **Slides** with the slider. The header shows the result, for example `4 × 1080 × 1350`.
5. **Pick a layout.** **Panorama** runs the photo edge to edge across every slide. **Framed** does the same with an even margin around it, which looks good on a white or black background (set under **Background**).
6. **Frame the shot.** Select the photo to adjust it. Use the **Zoom** slider (or the mouse wheel) to crop in, and click **Reframe** (or double-click the photo) to drag it inside its frame and choose which part stays in view. The cuts between slides are drawn on the canvas, so you can keep a face, a horizon or a building out of a seam.
7. **Preview the swipe.** Click **Preview swipe** to page through the slides as they'll appear on Instagram, and check every seam.
8. **Export.** Click **Export N slides**. On a computer the slides download as one ZIP. On a phone you get **Save** and **Share** buttons; Share opens your phone's share sheet, so you can send the slides straight to the Instagram app.

Everything happens in your browser: the panorama is never uploaded to build the carousel. There's a shorter overview on the [Instagram carousel maker](/tools/instagram-carousel-maker) page.

## How should you post the slides so the seams line up?

The export already does the hard part: every slide is the same size, and they're cut from one strip, so the edges match pixel for pixel. To keep it that way when posting:

- **Add them in order.** The files are named `carousel-01.jpg`, `carousel-02.jpg` and so on. Instagram puts slides in the order you select them, so tap 01 first and go up.
- **Don't let Instagram re-crop.** When you add the first image, make sure the post's frame is set to the same shape you exported (4:5, 3:4 or 1:1). If the app crops the slides differently, the seams stop lining up.
- **Use one filter or none.** Applying a filter or edit to one slide but not the next makes the join visible. Do your editing in Lightframes before you export.
- **Think about slide 1.** It's the one people see first, and the one that represents the post on your profile grid. Make sure it works as a picture on its own, and that the panorama clearly continues to the right.
- **Hint at the swipe.** A line in the caption such as "swipe →" helps people who don't spot the dots.

## Beyond panoramas: other carousel layouts

If you want to mix several photos, Lightframes includes ready-made carousel layouts: **Bridges** (a photo over every cut), **Staggered**, **Row**, **Columns**, **Grid**, **Hero**, **Cover**, **Scattered** and **Per slide**. Edges snap to the slide cuts as you drag, and you can bring photos to the front or send them to the back. For single-slide or multi-slide grids without the seamless effect, use the [photo collage maker](/tools/photo-collage-maker) instead.

## Common questions

**Will Instagram lower the quality of my slides?**
Instagram recompresses everything it receives. Exporting at exactly 1080 px wide, the width the feed displays, avoids an extra resize on top of that.

**Can I make a seamless carousel on my phone?**
Yes. The carousel works with touch, and when the export is ready the **Share** button hands the slides to the share sheet, from where you can open them in Instagram.

**My panorama looks cut off at the top and bottom. What do I change?**
The strip is wider than your photo. Use fewer slides, or switch to a taller slide shape (1:1 → 4:5 → 3:4), until the strip's shape is close to the panorama's. Then fine-tune with **Zoom** and **Reframe**.

Ready? [Open the editor](/editor) and load your widest shot.
