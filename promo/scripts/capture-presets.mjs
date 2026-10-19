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
    p.waitForEvent('download', { timeout: 120000 }),
    modal.getByRole('button', { name: 'Export', exact: true }).click(),
  ])
  await dl.saveAs(`${OUT}/${name}`)
  await p.waitForTimeout(600)
  if (await modal.isVisible()) await p.locator('.modal__backdrop').click({ position: { x: 5, y: 5 } })
  console.log('saved', name)
}

const PRESETS = process.argv[2] ? process.argv[2].split(',') : ['Vintage','Old Money','Japan Film','Moody Brown','Teal & Orange','Warm Film','Bright & Airy','Nordic','B&W Noir','Moody Forest']
for (const photo of ['pagoda', 'twelve-apostles', 'opera-night']) {
  await p.locator('.filmstrip').getByText(`${photo}.jpg`).click()
  await p.waitForTimeout(1200)
  await p.getByRole('tab', { name: 'Presets' }).click()
  await p.waitForTimeout(800)
  for (const name of PRESETS) {
    await p.locator('.preset-grid__name', { hasText: new RegExp(`^${name.replace(/[&]/g, '\\$&')}$`) }).click()
    await p.waitForTimeout(1500)
    await exportAs(`${photo}--${name.toLowerCase().replace(/[^a-z]+/g, '-')}.jpg`)
  }
  // clear the preset
  await p.locator('.preset-grid__item--active .preset-grid__apply').click().catch(() => {})
  await p.waitForTimeout(800)
}
await b.close()
