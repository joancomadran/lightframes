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
