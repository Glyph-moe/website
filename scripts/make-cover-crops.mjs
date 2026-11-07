/* Crops the world illustration to the part that can actually be seen.
 *
 * The artwork is drawn to cover the zoom stage, exactly like the prototype's
 * background-size:cover, so only a centred band of it is ever on screen. On a
 * portrait phone that band is at most 1006 px of the 3136 px original — three
 * quarters of the file is never painted, and the browser still has to
 * download all of it because the layout box is that wide.
 *
 * Cutting the source down to the visible band is a 1:1 pixel copy: the same
 * pixels, at the same scale, in a smaller file. The browser then picks a
 * smaller candidate and the page gets that much lighter.
 *
 * Requires sharp: npm run build already depends on it.
 *
 * Usage: node scripts/make-cover-crops.mjs
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const root = path.resolve(import.meta.dirname, '..')
const src = path.join(root, 'src/assets/cover/world-illustration.webp')
const outDir = path.join(root, 'src/assets/cover')

// Width of the centred band that can be seen, per layout.
//
// Portrait: the binding case is the cover sitting in the phone screen, where
// 1006 px of the artwork is visible (the same on every phone). 1344 px covers
// that with room to spare and still works for every portrait viewport.
//
// Wide: the whole stage is visible, so the band grows with the viewport.
// 1600 px covers viewports up to a 1.9:1 aspect; anything wider falls back to
// the full artwork. The master is capped at 2000 px wide, so the crop can
// never be wider than that.
const crops = [
  { out: 'world-illustration-portrait.webp', width: 1344 },
  { out: 'world-illustration-wide.webp', width: 1600 },
]

const meta = await sharp(src).metadata()
console.log(`source: ${meta.width}x${meta.height}`)

for (const crop of crops) {
  const width = Math.min(crop.width, meta.width)
  const left = Math.round((meta.width - width) / 2)
  const dest = path.join(outDir, crop.out)
  await sharp(src)
    .extract({ left, top: 0, width, height: meta.height })
    .webp({ quality: 82, effort: 6 })
    .toFile(dest)
  const kb = Math.round(fs.statSync(dest).size / 1024)
  console.log(`${crop.out}: ${width}x${meta.height} (from x=${left}) — ${kb} KB`)
}
