import { expect, test, type Page } from '@playwright/test'

test.use({ serviceWorkers: 'block' })

test.beforeEach(async ({ page }) => {
  await page.route('**/_vercel/insights/**', (route) => route.abort())
  await page.route('**://va.vercel-scripts.com/**', (route) => route.abort())
})

async function pageviews(page: Page): Promise<{ path?: string; route?: string | null }[]> {
  await page.waitForFunction(() => {
    const queue = (window as unknown as { vaq?: unknown[][] }).vaq
    return Array.isArray(queue) && queue.some((entry) => entry[0] === 'pageview')
  })
  return page.evaluate(() => {
    const queue = (window as unknown as { vaq?: unknown[][] }).vaq ?? []
    return queue
      .filter((entry) => entry[0] === 'pageview')
      .map((entry) => entry[1] as { path?: string; route?: string | null })
  })
}

test('home, locale, and a blog post report clean paths once', async ({ page }) => {
  await page.goto('/')
  await expect.poll(async () => pageviews(page)).toEqual([{ path: '/', route: '/' }])
  await expect(page.locator('vercel-analytics')).toHaveAttribute('data-pathname', '/')

  await page.goto('/es')
  await expect.poll(async () => pageviews(page)).toEqual([{ path: '/es', route: '/es' }])

  await page.goto('/blog/edit-raw-photos-in-browser')
  await expect.poll(async () => pageviews(page)).toEqual([
    { path: '/blog/edit-raw-photos-in-browser', route: '/blog/[slug]' },
  ])
})

test('a query string does not bring back the html pathname', async ({ page }) => {
  await page.goto('/?utm=newsletter')
  await expect.poll(async () => pageviews(page)).toEqual([{ path: '/', route: '/' }])
})

test('the 404 page reports the URL that missed', async ({ page }) => {
  const response = await page.goto('/no-such-page')
  expect(response?.status()).toBe(404)
  await expect.poll(async () => pageviews(page)).toEqual([{ path: '/no-such-page', route: '/no-such-page' }])
  await expect(page.locator('vercel-analytics')).toHaveAttribute('data-pathname', '/no-such-page')
})

test('the editor keeps React analytics and does not add an Astro pageview', async ({ page }) => {
  await page.goto('/editor')
  await expect(page.getByRole('banner').getByText('Lightframes', { exact: true })).toBeVisible()
  await expect(page.locator('vercel-analytics')).toHaveCount(0)
  const queued = await page.evaluate(() => {
    const queue = (window as unknown as { vaq?: unknown[][] }).vaq ?? []
    return queue.filter((entry) => entry[0] === 'pageview')
  })
  expect(queued).toEqual([])
})

test('an html-shaped miss is reported as requested', async ({ page }) => {
  const response = await page.goto('/retired-guide.html')
  expect(response?.status()).toBe(404)
  await expect.poll(async () => pageviews(page)).toEqual([
    { path: '/retired-guide.html', route: '/retired-guide.html' },
  ])
})
