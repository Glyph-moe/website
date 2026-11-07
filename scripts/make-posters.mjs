// Re-encode the clip posters.
//
// Each one is the first frame of a documentation video, shown at most 460 CSS
// px wide — so 960 px is the right size for a 2× display and there is nothing
// to gain from shrinking it. What was wrong was the encoding: they shipped at
// 20–29 kB for a frame that is mostly flat UI, which is several times what the
// content costs. mozjpeg at quality 60 lands at 11–15 kB with no visible
// change at the size they are shown.
//
// Usage: node scripts/make-posters.mjs [--check]
//   --check  report sizes and exit non-zero if any poster is over budget
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const DIR = 'public/clips'
const POSTERS = ['add-extension', 'chapters-download', 'insights']
const QUALITY = 60
const BUDGET = 16 * 1024
const checkOnly = process.argv.includes('--check')

let over = 0
const rows = []

for (const name of POSTERS) {
  const file = path.join(DIR, `${name}-poster.jpg`)
  const before = fs.statSync(file).size
  const image = sharp(file)
  const meta = await image.metadata()

  const encoded = await image
    .resize({ width: Math.min(960, meta.width) })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toBuffer()

  if (!checkOnly) fs.writeFileSync(file, encoded)
  const after = checkOnly ? fs.statSync(file).size : encoded.length
  if (after > BUDGET) over += 1
  rows.push({ name, size: `${meta.width}×${meta.height}`, before, after, over: after > BUDGET })
}

for (const row of rows) {
  const kb = bytes => `${(bytes / 1024).toFixed(1)} kB`.padStart(8)
  console.log(
    `${row.name.padEnd(20)} ${row.size.padStart(9)}  ${kb(row.before)} → ${kb(row.after)}` +
      (row.over ? '  OVER BUDGET' : ''),
  )
}

console.log(`\nbudget ${BUDGET / 1024} kB · ${rows.length - over}/${rows.length} within budget`)
if (over) process.exit(1)
