// The site's performance budget, asserted against a production build.
//
// Build first and serve dist/ on TEST_BASE_URL (default http://localhost:4322):
//   npm run build && npm run preview -- --port 4322 &
//   node scripts/check-perf.mjs
//
// One test per budget in the performance notes: the LCP element, the bytes it
// transfers, and the candidates each picture offers.
// The measurements use Lighthouse's mobile profile so the numbers move with
// bandwidth rather than with whatever this machine happens to have.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import zlib from 'node:zlib'

const require = createRequire('/opt/homebrew/lib/node_modules/puppeteer/')
const puppeteer = require('puppeteer')

export const BASE = process.env.TEST_BASE_URL || 'http://localhost:4322'

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 }

export const PROFILES = {
  // Lighthouse's "slow 4G" mobile default: the profile every budget row uses
  // unless it says otherwise.
  slow4g: { latency: 150, downMbps: 1.6, upMbps: 0.75, cpu: 4, viewport: MOBILE },
  // A healthy phone on wifi, to keep an eye on the fast path.
  fast4g: { latency: 70, downMbps: 10, upMbps: 3, cpu: 1, viewport: MOBILE },
  // The worst connection still worth caring about.
  threeg: { latency: 300, downMbps: 0.75, upMbps: 0.4, cpu: 4, viewport: MOBILE },
  desktopSlow4g: { latency: 150, downMbps: 1.6, upMbps: 0.75, cpu: 4, viewport: DESKTOP },
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const failures = []
let passed = 0

export async function test(name, run) {
  try {
    await run()
    passed += 1
    console.log(`PASS ${name}`)
  } catch (error) {
    failures.push({ name, error })
    console.error(`FAIL ${name}\n  ${error.message}`)
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function prepare(profile, { cache = false } = {}) {
  const page = await browser.newPage()
  await page.setViewport(profile.viewport)
  await page.setCacheEnabled(cache)

  const client = await page.createCDPSession()
  await client.send('Network.enable')
  if (!cache) await client.send('Network.clearBrowserCache')
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.latency,
    downloadThroughput: (profile.downMbps * 1024 * 1024) / 8,
    uploadThroughput: (profile.upMbps * 1024 * 1024) / 8,
  })
  await client.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu })

  // Collect paint and LCP from the page itself, resetting on every navigation
  // so a reload measures the reload and not the first visit.
  await page.evaluateOnNewDocument(() => {
    window.__perf = { fcp: 0, lcp: 0, lcpUrl: '', cls: 0 }
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') window.__perf.fcp = entry.startTime
      }
    }).observe({ type: 'paint', buffered: true })
    new PerformanceObserver(list => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      window.__perf.lcp = last.renderTime || last.loadTime || last.startTime
      window.__perf.lcpUrl = last.url || last.element?.currentSrc || ''
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver(list => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__perf.cls += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  })

  return { page, client }
}

// Turn in-page timings and resource entries into the shape the tests assert on.
async function collect(page) {
  return page.evaluate(() => {
    const perf = window.__perf || { fcp: 0, lcp: 0, lcpUrl: '', cls: 0 }
    const reqs = performance
      .getEntriesByType('resource')
      .filter(entry => entry.name.startsWith(location.origin))
      .map(entry => ({
        url: entry.name.replace(location.origin, ''),
        type: entry.initiatorType,
        start: Math.round(entry.startTime),
        end: Math.round(entry.responseEnd),
        size: entry.transferSize || 0,
        fromCache: (entry.transferSize || 0) === 0,
      }))
    const bytes = reqs.reduce((total, request) => total + request.size, 0)
    return {
      fcp: Math.round(perf.fcp),
      lcp: Math.round(perf.lcp),
      lcpUrl: perf.lcpUrl,
      cls: Math.round(perf.cls * 10000) / 10000,
      bytes,
      reqs,
    }
  })
}

export async function measure(path, profileName, options = {}) {
  const profile = PROFILES[profileName]
  assert.ok(profile, `unknown profile ${profileName}`)
  const { page } = await prepare(profile)
  if (options.js === false) await page.setJavaScriptEnabled(false)
  if (options.clock) {
    // The site picks its day or night face from the visitor's clock, so the
    // only way to test one branch is to hand the page a clock. This runs
    // before any document script, which is also when the real one runs.
    const hour = options.clock === 'night' ? 22 : 12
    await page.evaluateOnNewDocument(fixedHour => {
      const RealDate = Date
      const frozen = new RealDate()
      frozen.setHours(fixedHour, 0, 0, 0)
      class FrozenDate extends RealDate {
        constructor(...args) {
          if (args.length === 0) super(frozen.getTime())
          else super(...args)
        }
        static now() {
          return frozen.getTime()
        }
      }
      globalThis.Date = FrozenDate
    }, hour)
  }
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  await sleep(700)
  const result = await collect(page)
  await page.close()
  return result
}

// A second visit in the same browser context, which is what a returning
// reader actually gets: HTTP cache warm, document reusable.
//
// This navigates rather than calls page.reload(). A reload is defined to
// revalidate the main resource (Chrome sends `Cache-Control: max-age=0` for
// it), so measuring a reload measures the one navigation the browser is
// guaranteed to send to the server, not the one a reader performs. Clicking a
// link back to the page is a fresh navigation, and that one is allowed to use
// the cache.
export async function warmReload(path, profileName) {
  const profile = PROFILES[profileName]
  const { page } = await prepare(profile, { cache: true })
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  await sleep(700)

  // Listen for the second visit only: anything the server answers with 304 or
  // a non-cached 200 touched the network, and the point of the budget is that
  // a repeat visit touches it not at all.
  const network = []
  const onResponse = response => {
    const request = response.request()
    if (request.isNavigationRequest()) return
    if (!response.fromCache() || response.status() === 304) {
      network.push({ url: response.url().replace(BASE, ''), status: response.status() })
    }
  }
  page.on('response', onResponse)
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  await sleep(700)
  page.off('response', onResponse)

  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0]
    return { transferSize: entry?.transferSize ?? -1, deliveryType: entry?.deliveryType ?? '' }
  })
  const { lcp } = await collect(page)
  await page.close()

  return {
    docFromCache: navigation.transferSize === 0 || navigation.deliveryType === 'cache',
    lcp,
    networkReqs: network,
  }
}

export async function getHeader(path) {
  const response = await fetch(`${BASE}${path}`, { redirect: 'manual' })
  const headers = {}
  for (const [key, value] of response.headers) headers[key.toLowerCase()] = value
  return headers
}

export function maxAge(headers) {
  const match = /max-age=(\d+)/.exec(headers['cache-control'] || '')
  return match ? Number(match[1]) : 0
}

export function headOf(html) {
  return /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? ''
}

export function inlineStyleOf(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join('\n')
}

// The homepage inlines its stylesheet, so the immutability check needs any
// fingerprinted asset rather than specifically a CSS file.
export function firstAstroAsset(html) {
  const href = /(?:href|src)="(\/_astro\/[^"]+)"/.exec(html)?.[1]
  assert.ok(href, 'expected at least one fingerprinted /_astro/ asset in the document')
  return href
}

// Measure, then scroll to a selector in steps, and report everything the page
// fetched along the way. Used to prove that artwork held back at load is
// actually delivered once the reader approaches it.
export async function scrollAndCollect(path, profileName, selector) {
  const profile = PROFILES[profileName]
  const { page } = await prepare(profile)
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  await sleep(500)
  await page.evaluate(async target => {
    const element = document.querySelector(target)
    const end = element ? element.getBoundingClientRect().top + window.scrollY : 0
    for (let y = 0; y < end + 200; y += 200) {
      window.scrollTo(0, y)
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }, selector)
  await sleep(1200)
  const { reqs } = await collect(page)
  await page.close()
  return reqs
}

// Single runs on a throttled profile vary by ~50 ms, which is larger than the
// differences this plan is chasing. Budget assertions take the median of three
// so a decision is never made on one lucky trace.
export async function measureMedian(path, profileName, options = {}, runs = 3) {
  const results = []
  for (let index = 0; index < runs; index += 1)
    results.push(await measure(path, profileName, options))
  results.sort((a, b) => a.lcp - b.lcp)
  return results[Math.floor(runs / 2)]
}

// ── the budget ───────────────────────────────────────────────────────────────

await test('document is cacheable for 60s with background revalidation', async () => {
  const headers = await getHeader('/')
  assert.match(headers['cache-control'], /max-age=60\b/)
  assert.match(headers['cache-control'], /stale-while-revalidate=\d{4,}/)
})

await test('static media is cacheable for at least a day', async () => {
  for (const path of ['/icon.svg', '/site.webmanifest', '/screen-mask.svg', '/favicon.ico']) {
    assert.ok(maxAge(await getHeader(path)) >= 86400, `${path} max-age`)
  }
})

await test('video clips are cacheable for at least a week', async () => {
  assert.ok(maxAge(await getHeader('/clips/insights.mp4')) >= 604800)
})

await test('fingerprinted assets stay immutable', async () => {
  const html = await (await fetch(`${BASE}/`)).text()
  const asset = firstAstroAsset(html)
  assert.match((await getHeader(asset))['cache-control'], /immutable/)
})

await test('a repeat visit is free and paints under 120ms', async () => {
  const { docFromCache, lcp, networkReqs } = await warmReload('/', 'slow4g')
  assert.equal(docFromCache, true, 'document should come from cache')
  assert.deepEqual(
    networkReqs.map(request => request.url),
    [],
    'no subresource should hit the network',
  )
  assert.ok(lcp <= 120, `warm LCP ${lcp}ms`)
})

await test('no font is preloaded ahead of the hero', async () => {
  // Measured: preloading either text face put the hero behind 53 kB of type and
  // cost 116 ms of FCP (252 → 368) and 36 ms of LCP. Even with
  // fetchpriority="low" the preload was still the first request in the
  // document. The faces are discovered from the inlined stylesheet and swap in
  // after the first paint instead. See the perf spec, decision D2.
  const head = headOf(await (await fetch(`${BASE}/`)).text())
  const preloads = [...head.matchAll(/<link[^>]+as="font"[^>]*>/g)].map(match => match[0])
  assert.deepEqual(preloads, [], 'a font preload re-creates the contention this removed')
})

await test('the document stays small enough to reach the hero quickly', async () => {
  // The document is serial: nothing in the body is parsed, and so no <img> is
  // discovered, until all of it has arrived. This is the invariant that keeps
  // well-meant inlining from buying a round trip with a slower LCP.
  const html = await (await fetch(`${BASE}/`)).text()
  const gzipped = zlib.gzipSync(html).length
  assert.ok(gzipped <= 13 * 1024, `${Math.round(gzipped / 1024)}KB gzipped document`)
})

await test('the hero paints a placeholder before the painting arrives', async () => {
  const css = inlineStyleOf(await (await fetch(`${BASE}/`)).text())
  assert.ok(
    /\.hero\b[^}]*background-image:\s*var\(--hero-lqip/.test(css),
    'no .hero rule paints --hero-lqip behind the painting',
  )
  assert.ok(
    /\[data-theme=['"]?night['"]?\]\)?\s*\.hero[^}]*background-image:\s*var\(--hero-lqip-night\)/.test(
      css,
    ),
    'night visitors need their own placeholder, or they see a daylight flash',
  )
})

await test('the hero is fetched once, not preloaded and then fetched again', async () => {
  // Pinned to daytime: the assertion names the day file, and the site picks its
  // painting from the visitor's clock — an unpinned run fails after dusk.
  const { reqs } = await measure('/', 'slow4g', { clock: 'day' })
  const hero = reqs.filter(request => /hero-watercolor\./.test(request.url))
  assert.equal(hero.length, 1, `hero requested ${hero.length}×: ${hero.map(r => r.url).join(', ')}`)
})

await test('night visitors fetch the night painting and nothing else', async () => {
  const { reqs, lcpUrl } = await measure('/', 'slow4g', { clock: 'night' })
  assert.ok(
    reqs.some(request => /hero-watercolor-night/.test(request.url)),
    'night art requested',
  )
  // Day files are /hero-watercolor.<hash>_<w>.avif; night files carry -night.
  assert.deepEqual(
    reqs.filter(request => /hero-watercolor\./.test(request.url)).map(request => request.url),
    [],
    'the day painting should not be fetched at night',
  )
  assert.match(lcpUrl, /hero-watercolor-night/, 'the night painting is the LCP element')
})

await test('every composition picture is deferred', async () => {
  // The bytes of the zoom artwork are a quality decision and change with the
  // encoder settings; what must not change is that none of it is fetched while
  // the hero is still painting. A picture that ships `srcset` instead of
  // `data-srcset` starts downloading as soon as it is parsed, wherever it sits
  // on the page, so this is the invariant that keeps them off the LCP.
  const html = await (await fetch(`${BASE}/`)).text()
  // The <noscript> copies carry a real `srcset` on purpose: they are what a
  // reader without scripts gets, and they are inert whenever scripts run. Strip
  // them first, or this counts the fallback as an eager request.
  const scripted = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
  const pictures = [...scripted.matchAll(/<picture[^>]*>[\s\S]*?<\/picture>/g)].map(
    match => match[0],
  )
  const composition = pictures.filter(picture =>
    /world-illustration|screen-novel|frame-glacier/.test(picture),
  )
  assert.ok(composition.length >= 4, `found ${composition.length} composition pictures`)
  const eager = composition.filter(picture => /\ssrcset=/.test(picture))
  assert.deepEqual(
    eager.map(p => p.slice(0, 90)),
    [],
    'a composition picture is fetching eagerly',
  )
})

await test('no composition image is on the critical path', async () => {
  // Presence is the wrong test: they arrive shortly after load by design. What
  // matters is that nothing starts before the first paint, because that is what
  // pushes the hero's own transfer back.
  const { reqs, fcp } = await measure('/', 'slow4g', { clock: 'day' })
  const early = reqs.filter(
    request =>
      /world-illustration|screen-novel|frame-glacier/.test(request.url) && request.start < fcp,
  )
  assert.deepEqual(
    early.map(request => `${request.url} @${request.start}ms`),
    [],
    `deferred images started before the first paint (FCP ${fcp}ms)`,
  )
})

await test('composition images load when the zoom section is approached', async () => {
  // A 390×844 viewport shows the portrait crop (the wide file is `display:none`
  // there), so this is the one to expect.
  const reqs = await scrollAndCollect('/', 'slow4g', '#zoom')
  assert.ok(
    reqs.some(request => /world-illustration-portrait/.test(request.url)),
    'artwork loaded after scroll',
  )
  assert.ok(
    reqs.some(request => /screen-novel/.test(request.url)),
    'screenshot loaded after scroll',
  )
})

await test('no-JS visitors still get the composition images', async () => {
  const { reqs } = await measure('/', 'slow4g', { js: false })
  assert.ok(
    reqs.some(request => /world-illustration/.test(request.url)),
    'no-JS artwork',
  )
  assert.ok(
    reqs.some(request => /screen-novel/.test(request.url)),
    'no-JS screenshot',
  )
})

await test('first-load bytes and LCP meet budget', async () => {
  const { lcp, reqs } = await measureMedian('/', 'slow4g')
  // Bytes the reader waits for: everything that had started by the time the
  // largest element painted. Anything after that is not on the critical path.
  const critical = reqs.filter(request => request.start <= lcp)
  const bytes = critical.reduce((total, request) => total + request.size, 0)
  assert.ok(lcp <= 700, `LCP ${lcp}ms`)
  assert.ok(bytes <= 130 * 1024, `${Math.round(bytes / 1024)}KB before LCP`)
})

await test('no route makes a render-blocking stylesheet request', async () => {
  // Every stylesheet is inline, so nothing in the document can hold up the
  // first paint while another file is fetched.
  for (const p of ['/', '/docs/', '/docs/getting-started/', '/support/', '/privacy/']) {
    const html = await (await fetch(`${BASE}${p}`)).text()
    assert.equal((html.match(/<link[^>]+rel="stylesheet"/g) || []).length, 0, p)
  }
})

await test('inlining does not drop the layout rules', async () => {
  // The failure mode of inlining is a missing import, which shows up as
  // unstyled content rather than as an error. These tokens only exist in the
  // stylesheets each route needs.
  for (const [p, needle] of [
    ['/docs/getting-started/', '--font-display'],
    ['/support/', '--radius'],
  ]) {
    const html = await (await fetch(`${BASE}${p}`)).text()
    assert.ok(inlineStyleOf(html).includes(needle), `${p} missing ${needle}`)
  }
})

await test('documentation first paint is not blocked by CSS', async () => {
  const { fcp } = await measure('/docs/getting-started/', 'slow4g')
  assert.ok(fcp <= 450, `FCP ${Math.round(fcp)}ms`)
})

await test('video posters stay small', async () => {
  // Shown at most 460 CSS px wide, so 960 px is right for a 2× display; the
  // budget is about encoding, not dimensions. 16 kB is the measured floor for
  // these frames at a quality that keeps UI text legible.
  for (const p of [
    '/clips/add-extension-poster.jpg',
    '/clips/chapters-download-poster.jpg',
    '/clips/insights-poster.jpg',
  ]) {
    const res = await fetch(`${BASE}${p}`)
    assert.ok(Number(res.headers.get('content-length')) <= 16 * 1024, p)
  }
})

await test('desktop LCP stays under 950ms', async () => {
  const { lcp } = await measure('/', 'desktopSlow4g')
  assert.ok(lcp <= 950, `LCP ${Math.round(lcp)}ms`)
})

await test('3G LCP stays under 1500ms', async () => {
  const { lcp } = await measure('/', 'threeg')
  assert.ok(lcp <= 1500, `LCP ${Math.round(lcp)}ms`)
})

await test('nothing on any route shifts the layout', async () => {
  // Not literally zero: the decorative marks are inserted after first paint and
  // move nothing, which Chrome scores as 0.1% of the viewport. The budget is 1%,
  // an order of magnitude under the "good" threshold of 10%.
  for (const p of ['/', '/docs/', '/docs/getting-started/', '/support/']) {
    const { cls } = await measure(p, 'slow4g')
    assert.ok(cls <= 0.01, `${p} CLS ${cls.toFixed(4)}`)
  }
})

await test('the privacy policy does not shift more than 2% of the viewport', async () => {
  // /privacy/ measures 0.0120 and the rest of the site under 0.001. The cause
  // is not the inlined CSS: the shift lands at ~820 ms, the moment the web
  // faces swap in, and its sources are the summary section and its action row
  // — a text reflow, not an unreserved image box (the hero carries its
  // dimensions). It is recorded rather than fixed here because the fix is a
  // metric-matched fallback face or `font-display: optional`, and both change
  // how the type renders. 2% is still a fifth of the "good" threshold.
  const { cls } = await measure('/privacy/', 'slow4g')
  assert.ok(cls <= 0.02, `CLS ${cls.toFixed(4)}`)
})

await test('the hero is still the largest thing painted', async () => {
  // If this starts matching a paragraph, the painting has stopped being the
  // LCP element and every LCP number in this file is measuring something else.
  const { lcpUrl } = await measure('/', 'slow4g')
  assert.match(lcpUrl, /hero-watercolor/)
})

await test('no-JS visitors see the hero and the composition images', async () => {
  // The performance observers are themselves scripts and are off in this run,
  // so this asserts on the requests rather than on a paint entry.
  const { reqs } = await measure('/', 'slow4g', { js: false })
  assert.ok(
    reqs.some(request => /hero-watercolor/.test(request.url)),
    'the hero painting is missing without scripts',
  )
  assert.ok(
    reqs.some(request => /world-illustration/.test(request.url)),
    'composition artwork is missing without scripts',
  )
})

await browser.close()
console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) process.exit(1)
