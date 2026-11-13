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

const FREE_PACK_LOOKS = [
  'Coastal Mist',
  'Golden Hour Glow',
  'Ink Stone',
  'Sage Garden',
  'Rose Fade',
  'Midnight City',
  'Ember Portrait',
  'Silver Rain',
]

async function openPresets(page: Page) {
  const tab = page.getByRole('tab', { name: 'Presets', exact: true })
  if (await tab.isVisible()) {
    await tab.click()
    return
  }
  await page.getByRole('button', { name: 'Editing tools' }).click()
  await page.getByRole('button', { name: 'Presets', exact: true }).click()
}

test('loads one sample photo from an empty-state thumbnail', async ({ page }) => {
  await page.goto('/editor')

  await expect(page.getByRole('button', { name: 'Open photos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try sample photos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Watch demo' })).toBeVisible()
  await page.getByRole('button', { name: 'Open sample photo Pagoda' }).click()

  await expect(page.locator('.toolbar__status')).toHaveText('Loaded 1 image')
  await expect(page.locator('canvas[aria-label="pagoda.jpg"]')).toBeVisible()
})

test('spanish editor localizes the empty state', async ({ page }) => {
  await page.goto('/es/editor')

  const title = 'El editor de fotos open source que se queda en tu dispositivo'
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  expect(await visibleH1Text(page)).toEqual([title])
  await expect(page.getByRole('button', { name: 'Abrir fotos' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Probar fotos de ejemplo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ver la demo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir la foto de ejemplo Pagoda' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sin subir archivos' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'The open-source photo editor that stays on your device' })).toHaveCount(0)
  await expect(page.getByRole('tab', { name: 'Editar' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir', exact: true })).toBeVisible()
})

test('lists the eight free pack looks in the presets panel', async ({ page }) => {
  await page.goto('/editor')
  await page.getByRole('button', { name: 'Open sample photo Pagoda' }).click()
  await expect(page.locator('.toolbar__status')).toHaveText('Loaded 1 image')

  await openPresets(page)
  const panel = page.getByRole('region', { name: 'Presets' })
  for (const name of FREE_PACK_LOOKS) {
    await expect(panel.getByRole('button', { name, exact: true })).toBeVisible()
  }
  await expect(panel.getByRole('link', { name: 'Download ZIP' })).toHaveAttribute(
    'href',
    '/downloads/lightframes-free-presets-luts.zip',
  )
  await expect(panel.getByRole('link', { name: 'About the pack' })).toHaveAttribute('href', '/free-presets-luts')
})

test('spanish presets panel names the free pack in Spanish', async ({ page }) => {
  await page.goto('/es/editor')
  await page.getByRole('button', { name: 'Abrir la foto de ejemplo Pagoda' }).click()
  await expect(page.locator('.toolbar__status')).toHaveText('1 imagen cargada')

  const tab = page.getByRole('tab', { name: 'Preajustes', exact: true })
  if (await tab.isVisible()) {
    await tab.click()
  } else {
    await page.getByRole('button', { name: 'Herramientas de edición' }).click()
    await page.getByRole('button', { name: 'Preajustes', exact: true }).click()
  }

  const panel = page.getByRole('region', { name: 'Preajustes' })
  await expect(panel.getByText('Pack gratis')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Bruma costera', exact: true })).toBeVisible()
  await expect(panel.getByRole('link', { name: 'Descargar ZIP' })).toHaveAttribute(
    'href',
    '/downloads/lightframes-free-presets-luts.zip',
  )
  await expect(panel.getByRole('link', { name: 'Sobre el pack' })).toHaveAttribute('href', '/es/presets-luts-gratis')
})

test('reports a batch with no importable images without creating a photo', async ({ page }) => {
  await prepareFilePicker(page, false)

  await page.getByRole('button', { name: 'Open', exact: true }).click()

  await expect(page.locator('.toolbar__status')).toHaveText('Could not open 1 image')
  await expect(page.locator('.filmstrip__count')).toHaveCount(0)
})
