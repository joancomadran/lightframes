import { expect, test, type Page } from '@playwright/test'

/** The toolbar wordmark. Exact text inside the banner skips the sr-only page title. */
function editorWordmark(page: Page) {
  return page.getByRole('banner').getByText('Lightframes', { exact: true })
}

/** Headings a sighted person can see. The 1px clipped page title does not count. */
async function visibleH1Text(page: Page): Promise<string[]> {
  return page.locator('h1').evaluateAll((nodes) =>
    nodes
      .filter((el) => {
        const box = el.getBoundingClientRect()
        return box.width > 2 && box.height > 2
      })
      .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()),
  )
}

test('editor shell mounts with the expected primary controls', async ({ page }) => {
  await page.goto('/editor')

  await expect(editorWordmark(page)).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Lightframes photo editor', exact: true })).toHaveCount(1)
  expect(await visibleH1Text(page)).toEqual(['The open-source photo editor that stays on your device'])
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

async function openCollageSettings(page: import('@playwright/test').Page) {
  await page.getByRole('tab', { name: 'Collage' }).click()
  const settings = page.getByRole('button', { name: 'Collage settings' })
  if ((await settings.count()) > 0 && (await settings.isVisible())) await settings.click()
}

test('collage export labels follow the route language', async ({ page }) => {
  await page.goto('/editor')
  await openCollageSettings(page)
  await expect(page.getByRole('button', { name: 'Export collage' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Export size' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exportar collage' })).toHaveCount(0)

  await page.goto('/es/editor')
  await openCollageSettings(page)
  await expect(page.getByRole('button', { name: 'Exportar collage' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Tamaño de exportación' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export collage', exact: true })).toHaveCount(0)
})

test('editor fits a mobile viewport without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/editor')

  await expect(editorWordmark(page)).toBeVisible()
  expect(await visibleH1Text(page)).toEqual(['The open-source photo editor that stays on your device'])
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

test('reports a batch with no importable images without creating a photo', async ({ page }) => {
  await prepareFilePicker(page, false)

  await page.getByRole('button', { name: 'Open', exact: true }).click()

  await expect(page.locator('.toolbar__status')).toHaveText('Could not open 1 image')
  await expect(page.locator('.filmstrip__count')).toHaveCount(0)
})
