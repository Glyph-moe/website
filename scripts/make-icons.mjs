// Generates the site icons from the artwork in design/icons/.
//
//   design/icons/glyph-icon-day.{svg,png}   -> day icon (sun over an open book)
//   design/icons/glyph-icon-night.{svg,png} -> night icon (crescent moon over an open book)
//
// The SVG is the master: the page draws the header mark from it at any scale,
// and the favicon uses it too. The PNG and ICO below are the fallbacks a
// browser or a home screen still asks for.
//
// The homepage swaps icon.svg for icon-night.svg based on the visitor's local
// time; the rest of the site keeps the day icon.
//
// Usage: node scripts/make-icons.mjs
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const root = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(root, 'public')
const day = path.join(root, 'design/icons/glyph-icon-day.png')
const night = path.join(root, 'design/icons/glyph-icon-night.png')

// The vectors are copied through untouched: they are already a few hundred
// bytes of paths, and rewriting them would only risk breaking the artwork.
function svg(source, out) {
  const file = path.join(publicDir, out)
  fs.copyFileSync(source, file)
  console.log(out, fs.statSync(file).size, 'bytes')
}

async function png(source, size, out) {
  await sharp(source)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(publicDir, out))
  console.log(out, fs.statSync(path.join(publicDir, out)).size, 'bytes')
}

async function ico(source, out) {
  const sizes = [16, 32, 48]
  const images = await Promise.all(
    sizes.map(size => sharp(source).resize(size, size, { fit: 'cover' }).png().toBuffer()),
  )
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(sizes.length, 4)
  let offset = 6 + 16 * sizes.length
  const entries = []
  for (let i = 0; i < sizes.length; i++) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0)
    entry.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(images[i].length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += images[i].length
    entries.push(entry)
  }
  fs.writeFileSync(path.join(publicDir, out), Buffer.concat([header, ...entries, ...images]))
  console.log(out, fs.statSync(path.join(publicDir, out)).size, 'bytes')
}

svg(path.join(root, 'design/icons/glyph-icon-day.svg'), 'icon.svg')
svg(path.join(root, 'design/icons/glyph-icon-night.svg'), 'icon-night.svg')
await png(day, 64, 'favicon-64.png')
await png(night, 64, 'favicon-night-64.png')
await png(day, 180, 'apple-touch-icon.png')
await png(day, 192, 'icon-192.png')
await png(day, 512, 'icon-512.png')
await ico(day, 'favicon.ico')
