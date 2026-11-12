---
key: lightframes-vs-upscayl
slug: lightframes-vs-upscayl
title: "Lightframes vs Upscayl"
description: "Lightframes or Upscayl: enlarge 2× or 4× in the browser, nothing uploaded, or a free desktop upscaler with more models. GPU, scale and privacy, sourced."
h1: "Lightframes vs Upscayl"
lead: "Choose Lightframes if you want to enlarge a photo 2× or 4× in the browser, after your edits, with the photo never uploaded. Choose the Upscayl desktop app if you want a free installed upscaler with several models, custom models and a Vulkan GPU. They overlap on one job only. Upscayl’s own docs also describe a cloud API that uploads the image and spends credits; that is a different product from the desktop app."
order: 5
updated: 2026-11-12
faq:
  - q: "Does the Upscayl desktop app upload my photos?"
    a: "The desktop app is a local program. The GitHub README says it uses Real-ESRGAN through Vulkan on your machine, and that you need a Vulkan-compatible GPU. The separate Upscayl Cloud API, documented at docs.upscayl.org, does upload the file and deducts credits."
  - q: "Does Upscayl run without a graphics card?"
    a: "The README says a Vulkan GPU is required and that most integrated GPUs and CPUs do not work, with a community workaround for Windows and Linux. Lightframes tries WebGPU and, if that is missing, runs the same upscale model on the CPU in WebAssembly."
  - q: "How far can Lightframes enlarge a photo?"
    a: "2× or 4×, from one Real-ESRGAN model (general x4v3, about 5 MB, served by this site). The result stops at 8192 px on the long edge and about 40 megapixels. A 2× export is the 4× model output scaled back down."
  - q: "Is Upscayl free?"
    a: "The desktop app is free and open source. The repository licence is the GNU AGPL version 3, and the README says the ncnn backend is AGPL as well. The cloud API is not that app: its docs describe credits deducted per task."
---

Lightframes is independent and is not affiliated with Upscayl.

## Comparison

| | **Lightframes** | **Upscayl** |
| --- | --- | --- |
| **Price** | Free. No account and no paid tier. Upscaling is part of export. | The desktop app is free ([homepage](https://upscayl.org/), [README](https://github.com/upscayl/upscayl)). The [cloud API](https://docs.upscayl.org/start-task) deducts credits per task and can answer “insufficient credits”. |
| **Licence** | [MIT](https://github.com/joancomadran/lightframes) | GNU AGPL version 3 in the repository [LICENSE](https://github.com/upscayl/upscayl/blob/main/LICENSE). The README says the [ncnn backend](https://github.com/upscayl/upscayl-ncnn) is AGPL as well. |
| **Where it runs** | Current Chrome, Edge, Brave, Firefox and Safari. Installable PWA. No Vulkan requirement: WebGPU when the browser has it, otherwise the CPU. Editor UI in English. | Desktop builds for Linux, macOS 12 or later, and Windows 10 or later ([README](https://github.com/upscayl/upscayl)). A Vulkan-compatible GPU is required; the same page says most integrated GPUs do not work. The homepage also says the desktop app is for Linux, macOS and Windows. |
| **What it enlarges** | One model: Real-ESRGAN general x4v3, about 5 MB, downloaded from this site and checked with SHA-256. Export offers 2× or 4×. The long edge stops at 8192 px and the result at about 40 megapixels. Below a 1.1× gain the step is skipped. | The README says the desktop app uses Real-ESRGAN. The [guide](https://github.com/upscayl/upscayl/wiki/Guide) says the default models only output ×4, and that since v2.8 other scales are made by scaling that ×4 result down. Custom NCNN models can be added from v2.5. The [homepage](https://upscayl.org/) advertises upscaling up to 16×. The cloud API documents scales 1 through 8. |
| **Models** | One general photo model. A 2× result is the ×4 output resampled, with 20% of a plain smooth enlargement mixed back so skin keeps some texture. | Several bundled models. The README credits Real-ESRGAN plus High Fidelity (HFA2k), Remacri, and Ultrasharp and Ultramix. You can point the app at your own NCNN models. |
| **Batch** | Select photos in the filmstrip, turn on AI upscale in Export, and download one ZIP. Each file is upscaled in turn, after that file’s edits. | The README describes Batch Upscayl. The homepage also names Double Upscayl (running the enlargement twice). There is a separate CLI, [upscayl-ncnn](https://github.com/upscayl/upscayl-ncnn). |
| **The rest of the editor** | Upscale sits on a developed photo: RAW, `.xmp` presets, `.cube` LUTs, crop, background removal and object removal in the same tab. | An upscaler. The README does not describe raw development, Lightroom presets or a collage. |
| **Privacy / uploads** | The photo is not uploaded. The upscale model comes from this site, not from a third party, and is cached in the browser. Page visits use cookieless Vercel Web Analytics. | The desktop app runs locally and needs a GPU on that machine ([README](https://github.com/upscayl/upscayl)). The [cloud API](https://docs.upscayl.org/start-task) accepts an uploaded file, a list of files, or image URLs, and returns a task id. |

## When Upscayl is the better choice

Use the Upscayl desktop app when enlargement is the whole job and you have a Vulkan GPU. You get more than one model, your own NCNN models, a batch mode and a command-line tool, and the [homepage](https://upscayl.org/) advertises up to 16× plus a second pass (Double Upscayl). Lightframes stops at 4× and at 8192 px on the long edge, and it only ships Real-ESRGAN general x4v3. If a photo is already sharp and you only wanted a dedicated upscaler, Upscayl is the closer tool.

The cloud API is a different offer. Its [start-task](https://docs.upscayl.org/start-task) page uploads the image and charges credits. That is not the local desktop app, and it is not a reason to prefer Upscayl when the photo should stay on the device.

## When Lightframes is the better choice

Use Lightframes when the photo still needs developing, or when the computer has no Vulkan GPU and should not get an install. Open the [editor](/editor), edit, then set AI upscale to 2× or 4× in Export. The first time, the model (about 5 MB) downloads from this site. Later exports work offline. The how-to is the [AI upscaler](/tools/ai-image-upscaler) page.

It will not match a stack of specialist models or a 16× pass. A photo that is already near 8192 px on the long edge is not enlarged. Background removal in the same editor is a separate tool, covered in [Lightframes vs remove.bg](/compare/lightframes-vs-removebg).
