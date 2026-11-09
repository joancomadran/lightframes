import { expect, test } from '@playwright/test'

test('editor shell mounts with the expected primary controls', async ({ page }) => {
  await page.goto('/editor')

  await expect(page.getByRole('heading', { name: 'Lightframes' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Edit' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tab', { name: 'Collage' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeVisible()
})

test('switches between edit and collage modes', async ({ page }) => {
  await page.goto('/editor')

  await page.getByRole('tab', { name: 'Collage' }).click()
  await expect(page.getByRole('tab', { name: 'Collage' })).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('tab', { name: 'Edit' }).click()
  await expect(page.getByRole('tab', { name: 'Edit' })).toHaveAttribute('aria-selected', 'true')
})

test('editor fits a mobile viewport without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/editor')

  await expect(page.getByRole('heading', { name: 'Lightframes' })).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
})

async function prepareFilePicker(page: import('@playwright/test').Page, includeValidImage: boolean) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showOpenFilePicker', {
      configurable: true,
      value: async () => {
        const files = (window as Window & { __lightframesFiles?: File[] }).__lightframesFiles ?? []
        return files.map((file) => ({ getFile: async () => file }))
      },
    })
  })

  await page.goto('/editor')
  await page.evaluate(async (withValidImage) => {
    const files: File[] = []
    if (withValidImage) {
      const response = await fetch('/samples/pagoda.jpg')
      if (!response.ok) throw new Error('Could not load the JPEG fixture')
      files.push(new File([await response.blob()], 'valid-photo.jpg', { type: 'image/jpeg' }))
    }
    files.push(new File(['not an image'], 'corrupt-photo.jpg', { type: 'image/jpeg' }))
    ;(window as Window & { __lightframesFiles?: File[] }).__lightframesFiles = files
  }, includeValidImage)
}

test('keeps valid images when another image in the same import batch is corrupt', async ({ page }) => {
  await prepareFilePicker(page, true)

  await page.getByRole('button', { name: 'Open', exact: true }).click()

  await expect(page.locator('.toolbar__status')).toHaveText('Loaded 1 image; 1 failed')

  // On phones the filmstrip lives inside the Photos tray, which is closed by default.
  if ((await page.evaluate(() => window.innerWidth)) <= 767) {
    await page.getByRole('button', { name: 'Show photos' }).click()
  }
  await expect(page.locator('.filmstrip__count')).toHaveText('1/1')
})

test('revokes the object URL when a corrupt image fails to decode', async ({ page }) => {
  await page.addInitScript(() => {
    const created: string[] = []
    const revoked: string[] = []
    const originalCreate = URL.createObjectURL.bind(URL)
    const originalRevoke = URL.revokeObjectURL.bind(URL)

    URL.createObjectURL = (blob) => {
      const url = originalCreate(blob)
      created.push(url)
      return url
    }
    URL.revokeObjectURL = (url) => {
      revoked.push(url)
      originalRevoke(url)
    }

    ;(window as Window & {
      __lightframesObjectUrls?: { created: string[]; revoked: string[] }
    }).__lightframesObjectUrls = { created, revoked }
  })

  await prepareFilePicker(page, false)
  await page.getByRole('button', { name: 'Open', exact: true }).click()

  await expect(page.locator('.toolbar__status')).toHaveText('Could not open 1 image')
  const urls = await page.evaluate(() =>
    (window as Window & {
      __lightframesObjectUrls?: { created: string[]; revoked: string[] }
    }).__lightframesObjectUrls,
  )
  expect(urls?.created).toHaveLength(1)
  expect(urls?.revoked).toEqual(urls?.created)
  await expect(page.locator('.filmstrip__count')).toHaveCount(0)
})

test('reports a batch with no importable images without creating a photo', async ({ page }) => {
  await prepareFilePicker(page, false)

  await page.getByRole('button', { name: 'Open', exact: true }).click()

  await expect(page.locator('.toolbar__status')).toHaveText('Could not open 1 image')
  await expect(page.locator('.filmstrip__count')).toHaveCount(0)
})
