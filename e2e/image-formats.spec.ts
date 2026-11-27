import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const tinyHeic = [...readFileSync(join(fixtureDir, 'tiny.heic'))]
const tinyHeif = [...readFileSync(join(fixtureDir, 'tiny.heif'))]

function installPicker(page: Page) {
  return page.addInitScript(() => {
    Object.defineProperty(window, 'showOpenFilePicker', {
      configurable: true,
      value: async () => {
        const files = (window as Window & { __lightframesFiles?: File[] }).__lightframesFiles ?? []
        return files.map((file) => ({ getFile: async () => file }))
      },
    })
  })
}

async function queueFiles(page: Page, files: { name: string; type: string; bytes: number[] }[]) {
  await page.evaluate((incoming) => {
    const list = incoming.map((item) => new File([new Uint8Array(item.bytes)], item.name, { type: item.type }))
    ;(window as Window & { __lightframesFiles?: File[] }).__lightframesFiles = list
  }, files)
}

test('opens a webp without loading the heic decoder', async ({ page }) => {
  const decoderScripts: string[] = []
  const pending: Promise<void>[] = []
  page.on('response', (response) => {
    if (response.request().resourceType() !== 'script') return
    pending.push(
      response
        .text()
        .then((body) => {
          if (body.includes('HEIF image not found')) decoderScripts.push(response.url())
        })
        .catch(() => undefined),
    )
  })

  await installPicker(page)
  await page.goto('/editor')
  await expect(page.getByRole('button', { name: 'Open photos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open', exact: true })).toHaveAttribute(
    'title',
    'Open JPEG, PNG, WebP, HEIC or RAW. Hold Option/Alt to open a folder.',
  )
  // The format chips are desktop-only; phones keep the same list on the Open button.
  if (test.info().project.name === 'chromium') {
    await expect(page.getByText('JPEG, PNG, WebP, HEIC & RAW')).toBeVisible()
    await page.screenshot({ path: '/opt/cursor/artifacts/editor-format-hints.png' })
  }
  await Promise.all(pending)
  expect(decoderScripts).toEqual([])

  await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    ctx.fillStyle = '#234'
    ctx.fillRect(0, 0, 48, 32)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9))
    if (!blob) throw new Error('webp encode failed')
    ;(window as Window & { __lightframesFiles?: File[] }).__lightframesFiles = [
      new File([blob], 'frame.webp', { type: 'image/webp' }),
    ]
  })
  await page.getByRole('button', { name: 'Open', exact: true }).click()
  await expect(page.locator('.toolbar__status')).toHaveText('Loaded 1 image')
  await expect(page.locator('canvas[aria-label="frame.webp"]')).toBeVisible()
  await Promise.all(pending)
  expect(decoderScripts).toEqual([])
  if (test.info().project.name === 'chromium') {
    await page.screenshot({ path: '/opt/cursor/artifacts/webp-opened.png' })
  }
})

test('decodes heic and heif in one batch and reports a corrupt file', async ({ page }) => {
  test.setTimeout(90_000)
  const decoderScripts: string[] = []
  const pending: Promise<void>[] = []
  page.on('response', (response) => {
    if (response.request().resourceType() !== 'script') return
    pending.push(
      response
        .text()
        .then((body) => {
          if (body.includes('HEIF image not found')) decoderScripts.push(response.url())
        })
        .catch(() => undefined),
    )
  })

  await installPicker(page)
  await page.goto('/editor')
  await queueFiles(page, [
    { name: 'IMG_1234.heic', type: 'image/heic', bytes: tinyHeic },
    { name: 'IMG_5678.heif', type: 'image/heif', bytes: tinyHeif },
  ])
  await page.getByRole('button', { name: 'Open', exact: true }).click()
  await expect(page.locator('.toolbar__status')).toHaveText('Loaded 2 images', { timeout: 60_000 })
  await expect(page.locator('canvas[aria-label="IMG_1234.heic"]')).toBeVisible()
  await Promise.all(pending)
  expect(decoderScripts.length).toBeGreaterThan(0)
  if (test.info().project.name === 'chromium') {
    await page.screenshot({ path: '/opt/cursor/artifacts/heic-opened.png' })
  }

  await queueFiles(page, [{ name: 'broken.heic', type: 'image/heic', bytes: [0, 1, 2, 3, 4] }])
  await page.getByRole('button', { name: 'Open', exact: true }).click()
  await expect(page.locator('.toolbar__status')).toHaveText('Could not open 1 image', { timeout: 30_000 })
  await expect(page.locator('.toast__message')).toHaveText(
    'Could not decode broken.heic. The HEIC file may be corrupted.',
  )
})
