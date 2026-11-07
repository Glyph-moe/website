// Builds the self-hosted web fonts for the homepage.
//
// The site ships three families: Newsreader (display), Hanken Grotesk (UI)
// and DM Mono (labels). Fontsource ships the full Latin subsets, which is
// ~330 KB of woff2 for the four faces this page actually uses. Here we
// instance the variable faces to the weights in use and subset them to the
// characters on the page, which brings the total down to ~92 KB.
//
// Requires fonttools: `pipx install fonttools` (pyftsubset + fonttools).
//
// Usage: node scripts/subset-fonts.mjs
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'src/assets/fonts')
const pageFile = path.join(root, 'src/pages/index.astro')

// Characters the page can show. Printable ASCII covers every label and
// sentence; the extras are the typographic marks used in the copy.
const ALWAYS = '’‘“”—–…·•→'

function pageCharacters() {
  const source = fs.readFileSync(pageFile, 'utf8')
  const body = source
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
  const printable = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32)).join('')
  const used = new Set((body + ALWAYS + printable).split(''))
  return [...used]
    .filter(c => c.codePointAt(0) > 31)
    .sort()
    .join('')
}

// The italic face is only ever used for the marked words ("road", "door.",
// "your"), so it does not need the whole page charset. Keeping it to the
// characters inside <i> takes it from 36 KB to a couple of KB.
function italicCharacters() {
  const source = fs.readFileSync(pageFile, 'utf8')
  const body = source.replace(/<script[\s\S]*?<\/script>/g, '')
  const words = [...body.matchAll(/<i\b[^>]*>([\s\S]*?)<\/i\s*>/g)]
    .map(m => m[1].replace(/<[^>]+>/g, ''))
    .join('')
  if (!words.trim()) throw new Error('no <i> elements found — the italic subset would be empty')
  const used = new Set((words + ' .').split(''))
  return [...used]
    .filter(c => c.codePointAt(0) > 31)
    .sort()
    .join('')
}

const charset = pageCharacters()
const italicCharset = italicCharacters()
const charsetFile = path.join(outDir, '.charset.txt')
const italicCharsetFile = path.join(outDir, '.charset-italic.txt')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(charsetFile, charset)
fs.writeFileSync(italicCharsetFile, italicCharset)

const faces = [
  {
    out: 'newsreader-latin-400.woff2',
    src: 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2',
    instance: 'wght=400',
  },
  {
    out: 'newsreader-latin-400-italic.woff2',
    src: 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2',
    instance: 'wght=400',
    charset: italicCharsetFile,
  },
  {
    out: 'hanken-grotesk-latin.woff2',
    src: 'node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2',
  },
  {
    out: 'dm-mono-latin-400.woff2',
    src: 'node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2',
  },
]

const layout = 'kern,liga,calt,ccmp,mark,mkmk'

for (const face of faces) {
  const src = path.join(root, face.src)
  const dest = path.join(outDir, face.out)
  let input = src
  if (face.instance) {
    const staged = `${dest}.instance.woff2`
    execFileSync('fonttools', ['varLib.instancer', src, face.instance, '--output', staged], {
      stdio: 'inherit',
    })
    input = staged
  }
  execFileSync(
    'pyftsubset',
    [
      input,
      `--text-file=${face.charset ?? charsetFile}`,
      `--output-file=${dest}`,
      '--flavor=woff2',
      `--layout-features=${layout}`,
    ],
    { stdio: 'inherit' },
  )
  if (input !== src) fs.rmSync(input)
  const kb = Math.round(fs.statSync(dest).size / 1024)
  console.log(`${face.out}: ${kb} KB`)
}

fs.rmSync(charsetFile)
fs.rmSync(italicCharsetFile)
console.log(`charset: ${charset.length} characters (italic: ${italicCharset.length})`)
