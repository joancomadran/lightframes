/**
 * Pathname `@vercel/analytics/astro` should report.
 *
 * With `build.format: 'file'`, `Astro.url.pathname` is `/index.html`, `/es.html`, `/404.html`.
 * Vercel `cleanUrls` serves those documents at `/`, `/es`, and (for a miss) the address-bar URL.
 * The 404 document is always `/404`; `locationPathname` is the request that failed.
 */
export function analyticsPathname(builtPathname: string, locationPathname: string): string {
  const cut = builtPathname.search(/[?#]/)
  let path = cut === -1 ? builtPathname : builtPathname.slice(0, cut)
  if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length)
  else if (path.endsWith('.html')) path = path.slice(0, -'.html'.length)
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  if (path === '') path = '/'
  if (path === '/404') return locationPathname || '/'
  return path
}

/**
 * Classic inline script. It has to run while the document is parsing, before the
 * deferred `@vercel/analytics/astro` module defines `<vercel-analytics>` and reads
 * `data-pathname` for its single pageview.
 */
export const analyticsPathClient = `(() => {
  const analyticsPathname = ${analyticsPathname.toString()};
  const el = document.querySelector('vercel-analytics');
  if (!el || el.getAttribute('data-pathname-ready') === '1') return;
  el.setAttribute('data-pathname', analyticsPathname(el.getAttribute('data-pathname') || '', location.pathname));
  el.setAttribute('data-pathname-ready', '1');
})();
`
