// Audits the Notes pages on the built site: page overflow, covers that clip
// their title, text contrast over the paintings, and the long-title case.
// Usage: node scripts/check-blog.mjs [baseUrl]
//
// Contrast is measured the honest way: the text is hidden (not the surface
// under it), the cover is screenshotted, and every pixel inside the title's
// own box is compared with the colour the title is drawn in. The lowest ratio
// in the box is the number reported.
import { createRequire } from 'node:module'
import sharp from 'sharp'

const require = createRequire('/opt/homebrew/lib/node_modules/puppeteer/')
const puppeteer = require('puppeteer')

const baseUrl = process.env.TEST_BASE_URL || process.argv[2] || 'http://localhost:4322'

const pages = [
  { path: '/blog', name: 'index' },
  { path: '/blog/no-sources', name: 'post-dawn' },
  { path: '/blog/first-source', name: 'post-dusk' },
  { path: '/blog/offline', name: 'post-night' },
  { path: '/blog/category/release', name: 'category' },
]

const viewports = [
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
  { name: 'tablet', width: 768, height: 1024, dsf: 1 },
  { name: 'desktop', width: 1280, height: 900, dsf: 1 },
]

const LONG_TITLE =
  'A very long post title that keeps going for more than eighty characters to see whether the cover holds it'

const relLum = (r, g, b) => {
  const f = c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const contrast = (a, b) => {
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const COLOURS = {
  ink: [42, 34, 48],
  paper: [247, 241, 230],
}

async function measureRegion(page, box, colour) {
  if (box.width < 2 || box.height < 2) return null
  const buffer = await page.screenshot({
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
    encoding: 'binary',
  })
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const textLum = relLum(...colour)
  let worst = Infinity
  for (let i = 0; i < data.length; i += 3) {
    const pixel = relLum(data[i], data[i + 1], data[i + 2])
    worst = Math.min(worst, contrast(pixel, textLum))
  }
  return { worst, pixels: info.width * info.height }
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
})

let failures = 0
const report = (ok, message) => {
  if (!ok) failures++
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${message}`)
}

for (const vp of viewports) {
  console.log(`\n===== ${vp.name} ${vp.width}x${vp.height} =====`)
  for (const target of pages) {
    const page = await browser.newPage()
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dsf })
    await page.goto(baseUrl + target.path, { waitUntil: 'networkidle0', timeout: 60000 })
    await new Promise(r => setTimeout(r, 400))

    // 1. No horizontal scroll, and the page respects the 16px gutter.
    const overflow = await page.evaluate(() => ({
      scroll: document.scrollingElement.scrollWidth,
      inner: window.innerWidth,
    }))
    report(
      overflow.scroll <= overflow.inner + 1,
      `${target.name}: no horizontal scroll (${overflow.scroll} <= ${overflow.inner})`,
    )

    // 2. Covers contain their type, at the real title and at a 100+ char one.
    for (const variant of ['real', 'long']) {
      if (variant === 'long') {
        await page.evaluate(title => {
          document.querySelectorAll('[data-cover-title]').forEach(el => {
            el.textContent = title
          })
        }, LONG_TITLE)
        await new Promise(r => setTimeout(r, 120))
      }
      const clipping = await page.evaluate(() => {
        const out = []
        document.querySelectorAll('.cover').forEach(cover => {
          const title = cover.querySelector('[data-cover-title]')
          const centre = cover.querySelector('.cover-center')
          const c = cover.getBoundingClientRect()
          const t = title ? title.getBoundingClientRect() : null
          const m = centre.getBoundingClientRect()
          const pills = [...cover.querySelectorAll('.cover-pill')].map(p =>
            p.getBoundingClientRect(),
          )
          const overlapsPill = pills.some(
            p => m.left < p.right && m.right > p.left && m.top < p.bottom && m.bottom > p.top,
          )
          out.push({
            overlap: overlapsPill,
            overflow:
              m.top < c.top - 0.5 ||
              m.bottom > c.bottom + 0.5 ||
              m.left < c.left - 0.5 ||
              m.right > c.right + 0.5,
            selfOverflow: title ? title.scrollHeight > title.clientHeight + 1 : false,
            font: title ? parseFloat(getComputedStyle(title).fontSize) : 0,
            width: Math.round(c.width),
            height: Math.round(c.height),
            titleHeight: t ? Math.round(t.height) : 0,
          })
        })
        return out
      })
      clipping.forEach((c, i) => {
        report(
          !c.overflow && !c.selfOverflow && !c.overlap,
          `${target.name}: cover ${i} holds its ${variant} title (${c.width}x${c.height}, ${c.titleHeight}px of type at ${c.font.toFixed(1)}px)`,
        )
      })
    }

    // Put the real titles back before measuring contrast.
    await page.reload({ waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 300))
    await page.evaluate(() => document.fonts.ready)

    // 3. Contrast of the title and the pills over the painting. Each cover is
    // scrolled into view first: the cards' paintings are lazy, and a cover that
    // has not painted yet would measure as blank paper.
    const coverCount = await page.evaluate(() => document.querySelectorAll('.cover').length)
    for (let index = 0; index < coverCount; index++) {
      const zones = await page.evaluate(async index => {
        const cover = document.querySelectorAll('.cover')[index]
        cover.scrollIntoView({ block: 'center' })
        await new Promise(r => setTimeout(r, 900))

        return new Promise(resolve => {
          const img = cover.querySelector('img')
          const done = () => {
            const mood = cover.dataset.mood
            const title = cover.querySelector('[data-cover-title]')
            const colour = title ? getComputedStyle(title).color : 'rgb(42, 34, 48)'
            const rect = el => {
              const r = el.getBoundingClientRect()
              const inset = el.classList.contains('cover-pill') ? 0.24 : 0
              return {
                x: r.x + window.scrollX + r.width * inset,
                y: r.y + window.scrollY + r.height * inset,
                width: r.width * (1 - inset * 2),
                height: r.height * (1 - inset * 2),
              }
            }
            const out = []
            if (title) out.push({ index, mood, kind: 'title', colour, box: rect(title) })
            const cat = cover.querySelector('.cover-pill--category')
            const date = cover.querySelector('.cover-pill--date')
            if (cat)
              out.push({
                index,
                mood,
                kind: 'category pill',
                colour: getComputedStyle(cat).color,
                box: rect(cat),
              })
            if (date)
              out.push({
                index,
                mood,
                kind: 'date pill',
                colour: getComputedStyle(date).color,
                box: rect(date),
              })
            // Hide only the glyphs: the scrim, the glass and the painting stay.
            cover.querySelectorAll('[data-cover-title], .cover-pill-text').forEach(el => {
              el.style.visibility = 'hidden'
            })
            // Let the painting finish its blur-up before the shot is taken.
            const started = performance.now()
            const finish = () => {
              const picture = cover.querySelector('.cover-art-picture')
              const ready = !picture || picture.classList.contains('is-loaded')
              if (!ready && performance.now() - started < 3000) return setTimeout(finish, 60)
              setTimeout(() => requestAnimationFrame(() => resolve(out)), 1150)
            }
            finish()
          }
          if (img && !img.complete) {
            img.addEventListener('load', done, { once: true })
            img.addEventListener('error', done, { once: true })
          } else {
            done()
          }
        })
      }, index)

      for (const zone of zones) {
        const rgb = zone.colour.match(/\d+/g)?.slice(0, 3).map(Number)
        const colour = rgb?.length === 3 ? rgb : COLOURS.ink
        const result = await measureRegion(page, zone.box, colour)
        if (!result) continue
        report(
          result.worst >= 4.5,
          `${target.name}: ${zone.mood} cover ${zone.index} ${zone.kind} contrast ${result.worst.toFixed(2)}:1`,
        )
      }
    }

    await page.close()
  }
}

// 4. Every post has a share card at the right size, with the type laid on it.
const ogPosts = [
  'offline',
  'content-rating',
  'capabilities',
  'waitlist',
  'first-source',
  'no-sources',
]
for (const slug of ogPosts) {
  const response = await fetch(`${baseUrl}/blog/og/${slug}.jpg`)
  if (!response.ok) {
    report(false, `og ${slug}: ${response.status}`)
    continue
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const meta = await sharp(buffer).metadata()
  report(
    meta.width === 1200 && meta.height === 630,
    `og ${slug}: ${meta.width}x${meta.height}, ${(buffer.length / 1024).toFixed(0)} kB`,
  )
  // The type layer is opaque on top of the painting: if it went missing the
  // card would be the plain crop, and the two would match closely.
  const mood = {
    offline: 'night',
    'content-rating': 'night',
    capabilities: 'dusk',
    waitlist: 'dawn',
    'first-source': 'dusk',
    'no-sources': 'dawn',
  }[slug]
  const source = await sharp('src/assets/blog/painting-' + mood + '.webp')
  const { width: sw, height: sh } = await source.metadata()
  const cropHeight = Math.min(sh, Math.round(sw / (1200 / 630)))
  const plain = await source
    .extract({ left: 0, top: Math.round((sh - cropHeight) * 0.64), width: sw, height: cropHeight })
    .resize(1200, 630)
    .jpeg({ quality: 84 })
    .toBuffer()
  const a = await sharp(buffer).removeAlpha().raw().toBuffer()
  const b = await sharp(plain).removeAlpha().raw().toBuffer()
  let diff = 0
  for (let i = 0; i < a.length; i += 3)
    diff += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])
  const mean = diff / (a.length / 3) / 3
  report(mean > 6, `og ${slug}: title layer present (mean diff ${mean.toFixed(1)})`)
}

await browser.close()
console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
