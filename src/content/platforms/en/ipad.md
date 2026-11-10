---
key: ipad
slug: ipad
title: "Lightroom alternative for iPad"
description: "A free Lightroom alternative for iPad Safari: open photos in the browser, edit on device, import .xmp. Folder picking and large RAW exports have real limits."
h1: "A free Lightroom alternative for iPad"
lead: "Lightframes works in iPad Safari for JPEG, PNG and RAW: you pick files with the system dialog, edits run on the iPad, and photos are not uploaded. It is a good free fit for presets and modest files. It is a poor fit for a folder of large RAWs or heavy AI, because Safari has no directory picker and a full-resolution RAW decode can run out of memory. Adobe’s Lightroom for iPad is the app to use if you want its cloud library and you have the subscription."
order: 4
updated: 2026-11-10
faq:
  - q: "Does the editor actually run in iPad Safari?"
    a: "Yes. It is the same editor as on desktop. iPad Safari is detected for install (Share → Add to Home Screen), touch is handled on purpose, and RAW goes through LibRaw in WebAssembly. There is no separate iPad app."
  - q: "Can I open a folder from the Files app?"
    a: "Not as a directory. Safari does not provide the folder picker, so the editor uses a multi-file input. Choose the photos you want. You cannot point it at a whole card the way Chrome on a computer can."
  - q: "Will a large RAW export on an iPad?"
    a: "Not always. Editing previews decode at half size. Export decodes the sensor data at full resolution into 16-bit RGB, then limits the long edge to 8192 px. If the tab runs out of memory, the export fails. JPEG and smaller RAW files are the reliable path."
  - q: "Do the AI tools work on iPad?"
    a: "They are the same on-device models: a subject mask of about 45 MB, an upscaler of about 5 MB, and object removal from Hugging Face on first use. They need the memory and the download. If the tab is already holding a large RAW, they can fail."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe.

## What iPad Safari can do

Lightframes is a free, open-source (MIT) photo editor that runs entirely in the browser. On an iPad, open the [editor](/editor) in Safari. The page treats iPadOS as iOS even when the browser reports itself as a Mac: the install hint is Share, then Add to Home Screen, and a touch listener is registered so drags on the photo are delivered. Pinch-zoom on the preview is implemented for touch.

Opening photos does not use the File System Access API, which Safari does not ship. The fallback is a standard file input that accepts several JPEG, PNG or RAW files (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW). That is enough to edit a selection. It is not a folder import.

RAW decode is LibRaw compiled to WebAssembly, on the device. The preview is half size, which is the path meant for editing. Export calls the full-resolution decode and can fall back to the embedded JPEG if LibRaw fails. The app classifies out-of-memory errors; it does not pretend an iPad has desktop RAM. Prefer JPEG, or one RAW at a time, if an export dies.

`.xmp` presets and `.cube` LUTs import the same way as on a computer. The editor controls are English. After the app has loaded once online, editing works offline until an AI model still needs its first download.

## When the iPad app from Adobe is the better choice

Adobe’s [mobile FAQ](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) says the free Lightroom app covers capture, organisation, sharing and most basic edits, and that raw editing, masking, healing and batch editing are premium. The same page says a Creative Cloud member can import and edit raw files on an iPad. That app also backs photos up to Creative Cloud. Lightframes does not. If the catalogue has to sync, use Lightroom and read [Lightframes vs Lightroom](/compare/lightframes-vs-lightroom).

For a laptop browser without these memory limits, start at the [Chromebook](/for/chromebook), [Mac](/for/mac) or [Linux](/for/linux) page, or the [roundup](/blog/free-lightroom-alternatives).
