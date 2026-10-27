// Tells IndexNow (Bing, Yandex, Seznam, Naver…) that every URL in the live sitemap may have changed.
// Run it after a production deploy: `npm run indexnow`. The key file lives in public/<key>.txt.
const SITE = 'https://www.lightframes.si'
const KEY = 'cbe38ed6993e917dd19342c4b7aa09f5'

async function sitemapUrls(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)
  // The index lists child sitemaps; a child lists pages
  const nested = await Promise.all(locs.filter((loc) => loc.endsWith('.xml')).map(sitemapUrls))
  return [...locs.filter((loc) => !loc.endsWith('.xml')), ...nested.flat()]
}

const urlList = await sitemapUrls(`${SITE}/sitemap-index.xml`)
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
})
// 200 = accepted, 202 = accepted while the key is being verified
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`)
if (!res.ok) {
  console.error(await res.text())
  process.exit(1)
}
