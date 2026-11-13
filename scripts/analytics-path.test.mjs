import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { analyticsPathClient, analyticsPathname } from '../src/site/analyticsPath.ts'

test('file-format pathnames match clean URLs', () => {
  assert.equal(analyticsPathname('/index.html', '/'), '/')
  assert.equal(analyticsPathname('/es.html', '/es'), '/es')
  assert.equal(analyticsPathname('/blog.html', '/blog'), '/blog')
  assert.equal(analyticsPathname('/blog/edit-raw-photos-in-browser.html', '/blog/edit-raw-photos-in-browser'), '/blog/edit-raw-photos-in-browser')
  assert.equal(analyticsPathname('/es/blog/edit-raw-photos-in-browser.html', '/es'), '/es/blog/edit-raw-photos-in-browser')
  assert.equal(analyticsPathname('/', '/'), '/')
  assert.equal(analyticsPathname('/editor', '/editor'), '/editor')
  assert.equal(analyticsPathname('/tools/raw-photo-editor.html', '/tools/raw-photo-editor'), '/tools/raw-photo-editor')
})

test('the 404 document reports the requested pathname, including a .html miss', () => {
  assert.equal(analyticsPathname('/404.html', '/missing'), '/missing')
  assert.equal(analyticsPathname('/404', '/missing/page.html'), '/missing/page.html')
  assert.equal(analyticsPathname('/404.html', '/404'), '/404')
  assert.equal(analyticsPathname('/404.html', ''), '/')
})

test('query and hash on the built pathname are not part of the reported path', () => {
  assert.equal(analyticsPathname('/blog.html?utm=1', '/blog'), '/blog')
  assert.equal(analyticsPathname('/index.html#top', '/'), '/')
})

function applyClient(built, locationPath) {
  const attrs = { 'data-pathname': built }
  const el = {
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null
    },
    setAttribute(name, value) {
      attrs[name] = value
    },
  }
  vm.runInNewContext(analyticsPathClient, {
    document: { querySelector: () => el },
    location: { pathname: locationPath },
  })
  return attrs
}

test('the inline script rewrites data-pathname once, before the analytics element upgrades', () => {
  const home = applyClient('/index.html', '/')
  assert.equal(home['data-pathname'], '/')
  assert.equal(home['data-pathname-ready'], '1')

  const missing = applyClient('/404.html', '/no-such-page')
  assert.equal(missing['data-pathname'], '/no-such-page')

  const htmlMiss = applyClient('/404.html', '/old-page.html')
  assert.equal(htmlMiss['data-pathname'], '/old-page.html')

  vm.runInNewContext(analyticsPathClient, {
    document: {
      querySelector: () => ({
        getAttribute(name) {
          return name === 'data-pathname-ready' ? '1' : '/index.html'
        },
        setAttribute() {
          throw new Error('rewrote a pathname that was already applied')
        },
      }),
    },
    location: { pathname: '/' },
  })

  vm.runInNewContext(analyticsPathClient, {
    document: { querySelector: () => null },
    location: { pathname: '/' },
  })
})
