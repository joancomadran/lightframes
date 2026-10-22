---
key: privacy
slug: privacy
title: "Privacy policy"
description: "How Lightframes handles your data: photos are edited locally in your browser and never uploaded. What the hosting, fonts and AI downloads involve."
h1: "Privacy policy"
updated: 2026-10-22
schemaType: WebPage
---

## In short

- **Your photos never leave your device.** Lightframes opens, decodes and edits images inside your browser (WebAssembly and Web Workers). Nothing is uploaded to us or to anyone else, and we cannot see your photos or your edits.
- There is **no account, no login, no contact form and no newsletter**.
- **Amazon affiliate links.** The editor and the gear page link to Amazon.es. As an Amazon Associate, we earn from qualifying purchases. A link opens Amazon only when you click it. The cards do not load images or scripts from Amazon.
- Like any website, visiting Lightframes involves some technical data (mainly your IP address) reaching the hosting provider and, only if you use the object-removal tool, Hugging Face. This policy explains each case.

## Who is responsible for your data

The data controller for this website (https://www.lightframes.si) is:

- **Name:** Joan Comadran, an individual based in Spain
- **Contact:** direct message on X to [@dev_coma](https://x.com/dev_coma)

We have not appointed a Data Protection Officer, as we are not required to do so. <!-- TODO legal review: confirm no DPO is required. -->

## What happens to your photos and edits

Lightframes is an in-browser photo editor. When you open a photo:

- The file is read and processed **locally**, on your device. It is not sent to any server.
- To restore your work after a reload, the editor keeps a copy of the open photos, together with their names, edits, ratings and flags, in your browser's **IndexedDB** storage.
- Your presets are stored in IndexedDB as well, with a backup copy in your browser's **localStorage**. A few interface preferences (filmstrip layout, preview background, which edit groups to paste) are kept in localStorage.
- A **service worker** caches the application so it can work offline.

This information stays in your browser. **We never receive it**, so we do not process it as personal data on our side. You can delete it at any time by removing the photos from the editor or by clearing this site's data in your browser settings. The Cookie policy lists every item stored on your device.

### AI tools

The AI features (background removal, upscaling and object removal) also run entirely on your device. They need a model file, which is downloaded the first time you use each tool and then kept in your browser's Cache Storage:

- The **background removal** and **upscaling** models are served from lightframes.si itself.
- The **object removal** model (MI-GAN) is downloaded from **huggingface.co**, operated by Hugging Face, Inc. When your browser downloads it, Hugging Face receives the usual technical data of any web request (your IP address, browser type, date and time). **Your photo is not sent**: only the model file is fetched. Hugging Face processes that data under its own privacy policy (https://huggingface.co/privacy).

<!-- TODO legal review: consider self-hosting the MI-GAN model under /models/ to avoid this request to a third party. -->

## Data we (or our providers) do process

### 1. Hosting and server logs

- **What:** IP address, date and time of the request, requested URL, referring page, browser and operating system (user agent), and the response status.
- **Why:** to deliver the website, keep it secure and diagnose errors.
- **Legal basis:** our legitimate interest in operating a secure, working website (art. 6(1)(f) GDPR).
- **Who:** our hosting provider, Vercel Inc. (USA), acting as data processor.
- **How long:** as long as Vercel keeps its logs for our plan, under Vercel's own retention periods. <!-- TODO legal review: confirm Vercel's log retention for the current plan. -->

### 2. Visitor statistics (Vercel Web Analytics)

- **What:** pages visited, referring page, approximate country, browser, operating system and device type.
- **Why:** to know, in aggregate, how many people use the site and which pages are useful.
- **How it works:** according to Vercel, Web Analytics does not use cookies, does not build cross-site profiles, and counts visits using a short-lived identifier derived from the request that is not kept beyond a short period. We only see aggregated statistics; we cannot identify individual visitors.
- **Legal basis:** our legitimate interest in understanding, in aggregate, how the site is used (art. 6(1)(f) GDPR).
- **Who:** Vercel Inc., acting as data processor.

<!-- TODO legal review: verify the current Vercel Web Analytics privacy documentation (identifier, retention, whether anything is stored on the device) and confirm that no consent is needed under art. 22.2 LSSI-CE. -->

### 3. Web fonts

The site's typefaces are served from lightframes.si itself. Displaying them sends no request to Google Fonts or any other third party.

### 4. When you contact us

There is no contact form. If you send us a direct message on X ([@dev_coma](https://x.com/dev_coma)), we will use your X username and the content of your message only to reply to you. That message is also processed by X Corp. under its own terms and privacy policy. The legal basis is your request itself and our legitimate interest in answering it (art. 6(1)(f) GDPR). We keep the conversation for as long as needed to deal with it and no longer, unless a longer period is required by law.

If you open an issue or a discussion on GitHub (https://github.com/joancomadran/lightframes), that content is **public** and is processed by GitHub, Inc. under its own terms and privacy policy.

## Affiliate links, donations and external sites

- **Amazon affiliate links.** Some links point to Amazon.es and include our Amazon Associates tag. As an Amazon Associate, we earn from qualifying purchases. Viewing a page does not load images or scripts from Amazon: the cards are drawn in the page, and a link opens Amazon only when you click it. Only then does Amazon receive the visit, and it may set its own cookies on amazon.es, under Amazon's privacy and cookie notices. We only receive aggregated reports of clicks and qualifying sales, never your identity.
- **Donations.** The "Buy me a coffee" button links to https://buymeacoffee.com/devcoma. If you donate, the payment is handled by Buy Me a Coffee and its payment providers under their own terms. We may receive your name or the message you choose to leave, and we use it only to manage and acknowledge the donation. <!-- TODO legal review: confirm what data Buy Me a Coffee shares with the creator and the retention needed for tax purposes. -->
- **Other links** (GitHub, model sources, etc.) take you to websites with their own privacy policies, which we do not control.

## Advertising

The site has space reserved for advertising, but **no advertising network is currently active** and no advertising cookies are set.

<!-- TODO legal review: rewrite this section if and when an ad network is enabled. -->
If we enable an advertising service in the future (for example, Google AdSense), we will update this policy and the Cookie policy beforehand, and a consent management platform will ask for your consent before any non-essential cookie or similar technology is used. You will be able to refuse or withdraw consent as easily as you gave it.

## International transfers

Some of the providers above are based in the United States (Vercel, Hugging Face and, if you message us there, X). Where personal data is transferred outside the European Economic Area, the transfer relies on the European Commission's adequacy decision for the EU-US Data Privacy Framework, for providers certified under it, or on the Standard Contractual Clauses approved by the Commission.

<!-- TODO legal review: confirm the DPF certification or SCCs for each provider (Vercel, Hugging Face, X). -->

## Recipients

We do not sell, rent or share your data with anyone for their own purposes. Apart from the providers named above, data will only be disclosed where required by law (for example, at the request of a court or public authority).

## Your rights

You can exercise your rights of **access, rectification, erasure, objection, restriction of processing and data portability** by sending a direct message on X to [@dev_coma](https://x.com/dev_coma). Please tell us which right you want to exercise; we may ask for information to verify your identity if needed. We will reply within one month.

Bear in mind that we hold very little data that can be linked to you: your photos, edits and presets are only on your own device, and you can delete them yourself at any time.

If you believe your data has not been handled properly, you can lodge a complaint with the Spanish Data Protection Agency (Agencia Española de Protección de Datos, https://www.aepd.es) or with the supervisory authority of your country.

## Children

Lightframes does not knowingly collect personal data from children. Under Spanish law, people under 14 may not consent to the processing of their data by themselves.

## Security

The site is served over HTTPS only. Because your photos are processed and stored locally, their security also depends on your device: if you share your computer, remember that the editor keeps your open photos until you remove them or clear the site's data.

## No automated decisions

We do not make automated decisions or create profiles that produce legal or similarly significant effects on you.

## Changes to this policy

We may update this policy when the site changes (for example, if we self-host fonts or enable advertising). The date at the top shows the latest version. If a change is significant, we will make it visible on the site.
