import { chromium } from 'playwright'
const OUT = 'public/renders'
const b = await chromium.launch({ channel: 'chrome' })
const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true })
const p = await ctx.newPage()
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.getByText('Try sample photos').click()
await p.waitForTimeout(3500)

async function exportAs(name, png = false) {
  await p.locator('.toolbar').getByText('Export', { exact: true }).click()
  await p.waitForTimeout(400)
  const modal = p.locator('.modal')
  await modal.getByText('Web', { exact: true }).click()
  if (png) await modal.locator('select').first().selectOption('png')
  const [dl] = await Promise.all([
    p.waitForEvent('download', { timeout: 180000 }),
    modal.getByRole('button', { name: 'Export', exact: true }).click(),
  ])
  await dl.saveAs(`${OUT}/${name}`)
  await p.waitForTimeout(600)
  if (await modal.isVisible()) await p.locator('.modal__backdrop').click({ position: { x: 5, y: 5 } })
  console.log('saved', name)
}
async function set(label, v) {
  const s = p.locator('.cslider', { has: p.locator('.cslider__label', { hasText: new RegExp(`^${label}$`) }) }).first().locator('input')
  await s.fill(String(v))
  await p.waitForTimeout(150)
}
const HERO = {
  pagoda: { Exposure: 0.25, Contrast: 28, Highlights: -75, Shadows: 80, Whites: 18, Blacks: -18, Temperature: 12, Vibrance: 60, Saturation: 12, Clarity: 32, Dehaze: 32 },
  'twelve-apostles': { Exposure: 0.85, Contrast: 26, Highlights: -65, Shadows: 85, Whites: 25, Blacks: -20, Temperature: 22, Vibrance: 55, Saturation: 8, Clarity: 32, Dehaze: 30 },
  'opera-night': { Exposure: 0.55, Contrast: 20, Highlights: -40, Shadows: 65, Whites: 15, Blacks: -12, Temperature: 4, Vibrance: 50, Saturation: 10, Clarity: 18, Dehaze: 16 },
}
for (const [photo, vals] of Object.entries(HERO)) {
  await p.locator('.filmstrip').getByText(`${photo}.jpg`).click()
  await p.waitForTimeout(1200)
  await p.getByRole('tab', { name: 'Adjust' }).click()
  await p.waitForTimeout(500)
  for (const [k, v] of Object.entries(vals)) await set(k, v)
  await p.waitForTimeout(1500)
  await exportAs(`${photo}--hero.jpg`)
}
// background removal on the edited pagoda
await p.locator('.filmstrip').getByText('pagoda.jpg').click()
await p.waitForTimeout(1200)
await p.getByRole('tab', { name: 'Retouch' }).click()
await p.waitForTimeout(500)
await p.locator('.segmented__btn', { hasText: /^Remove$/ }).first().click()
await p.waitForTimeout(20000)
await p.screenshot({ path: 'shots/06-bgremove.png' })
await exportAs('pagoda--cutout.png', true)
await b.close()
