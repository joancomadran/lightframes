import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

test('sitemap.xml redirects permanently to the index without catching the real sitemap files', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.deepEqual(config.redirects, [
    {
      source: '/sitemap.xml',
      destination: '/sitemap-index.xml',
      permanent: true,
    },
  ])
  const sources = config.redirects.map((redirect) => redirect.source)
  assert.equal(sources.includes('/sitemap-index.xml'), false)
  assert.equal(sources.includes('/sitemap-0.xml'), false)
})
