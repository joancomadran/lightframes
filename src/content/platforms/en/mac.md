---
key: mac
slug: mac
title: "Lightroom alternative for Mac"
description: "A free Lightroom alternative for Mac, including Safari: Lightframes edits RAW and JPEG in the browser, imports .xmp presets and does not upload photos."
h1: "A free Lightroom alternative for Mac"
lead: "On a Mac, Lightframes is the free option when you want RAW, JPEG, .xmp presets and .cube LUTs in the browser, including Safari, with the photos staying on the machine. Use darktable if you want an installed GPL raw library on Apple silicon. Use Lightroom if you want Adobe’s catalogue and you already have, or want, the subscription."
order: 2
updated: 2026-11-10
faq:
  - q: "Does it work in Safari on Mac?"
    a: "Yes. Safari is one of the browsers the editor is built for. It does not offer the Chromium directory picker, so you open files with the system file dialog, including several at once. In Safari, File → Add to Dock installs the app; editing then works offline after the first load."
  - q: "Can I open a whole folder?"
    a: "Open picks files. In Chrome, Edge or Brave, hold Option while clicking Open, or use Folder in the filmstrip, to use the directory picker. In Safari that API is missing, so you stay on the file dialog and can still select several photos."
  - q: "Does darktable run on an Intel Mac?"
    a: "The current install page says the macOS bundles support macOS 13.5 or later and that there are no official releases for Intel Macs. They are Apple silicon builds."
  - q: "Is the editor interface in English?"
    a: "Yes. The site is in English and Spanish. The editor controls are English on every platform."
---

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is independent and is not affiliated with Adobe.

## Safari and Chrome on macOS

Lightframes is a free, open-source (MIT) photo editor that runs entirely in the browser. Open the [editor](/editor) in Safari, Chrome, Edge, Brave or Firefox. RAW files (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW) are decoded by LibRaw in WebAssembly. The preview is half size; export redevelops the sensor data up to 8192 px on the long edge.

Import `.xmp` presets and `.cube` LUTs from the Presets tab. Profiles, lens corrections and masks inside an XMP are not applied. Batch paste and ZIP export work in the same session. Photos are not uploaded. The session is stored in IndexedDB on that Mac.

Safari does not implement `showDirectoryPicker` or `showOpenFilePicker`. The editor detects that and uses a normal multi-file input, so picking photos works; picking a directory as a folder does not. Chromium browsers on the Mac do expose the folder picker.

In Safari, the install hint is File → Add to Dock. After that first online load, the cached app can edit offline, including RAW, until you need a new AI model.

## Installed apps, if you need them

darktable’s [install page](https://www.darktable.org/install/) currently ships an Apple silicon disk image for macOS 13.5 or later, and says there are no official Intel Mac releases. Its [FAQ](https://www.darktable.org/about/faq/) says Lightroom presets are not compatible. Details: [Lightframes vs darktable](/compare/lightframes-vs-darktable).

Adobe Lightroom’s [system requirements](https://helpx.adobe.com/lightroom-cc/system-requirements.html) include macOS (the version 10.0 section names Sequoia 15 or Tahoe 26) and a subscription check. The [mobile FAQ](https://helpx.adobe.com/mobile-apps/help/lightroom-mobile-faq.html) is a different, partly free app. See [Lightframes vs Lightroom](/compare/lightframes-vs-lightroom).
