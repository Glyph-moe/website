/**
 * Share cards for the Notes.
 *
 * A post's Open Graph image is the same cover the page shows: one of the three
 * paintings, cropped on the post's focus, with the title set in Newsreader on
 * top. Satori lays the type out (it is the only way to wrap real text without
 * a browser), resvg rasterises it, sharp puts it on the painting.
 *
 * The fonts here are build-only TrueType files: satori cannot read the woff2
 * the site ships, and the site must never serve these. See scripts/og-fonts.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { formatDate } from './blog'

type Mood = 'dawn' | 'dusk' | 'night'

const WIDTH = 1200
const HEIGHT = 630

const PAINTINGS: Record<Mood, string> = {
  dawn: 'painting-dawn.webp',
  dusk: 'painting-dusk.webp',
  night: 'painting-night.webp',
}

const sunGlyph = (colour: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="none" stroke="${colour}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 12.6c4.1-.4 7.6 3 7.5 7.2-.1 4-3.4 7.2-7.4 7.1-4-.1-7.2-3.3-7.1-7.3.1-3.9 3.2-7 7-7z"/><path d="M20.1 4.4c.7 1.6.9 3.1.8 4.6"/><path d="M31.7 8.7c-1.1 1.3-2.1 2.2-3.3 3"/><path d="M35.5 20.2c-1.7.5-3.1.6-4.6.4"/><path d="M8.4 8.4c1.2 1.2 2.1 2.2 2.8 3.4"/><path d="M4.6 19.4c1.6.6 2.9.9 4.4.9"/><path d="M11.5 29.9c1.4-1 2.6-1.6 3.9-2"/><path d="M28.8 30.4c-1.3-1-2.5-1.6-3.7-2.1"/></g></svg>`

const ink = '#2a2230'
const paper = '#f7f1e6'

/** The mood palette, as far as a raster of the type needs it. */
const palette = (mood: Mood) =>
  mood === 'night'
    ? {
        text: paper,
        sun: '#f2a46b',
        veil: 'radial-gradient(760px 320px at 50% 46%, rgba(24,16,32,0.82) 0%, rgba(24,16,32,0.82) 40%, rgba(24,16,32,0.58) 66%, rgba(24,16,32,0) 90%)',
        glass: 'linear-gradient(158deg, rgba(32,23,41,0.68), rgba(32,23,41,0.46))',
        border: 'rgba(255,255,255,0.34)',
        shadow: '0 2px 30px rgba(10,6,16,0.5)',
      }
    : {
        text: ink,
        sun: '#d9824a',
        veil: 'radial-gradient(760px 320px at 50% 46%, rgba(247,241,230,0.72) 0%, rgba(247,241,230,0.72) 40%, rgba(247,241,230,0.46) 66%, rgba(247,241,230,0) 90%)',
        glass: 'linear-gradient(158deg, rgba(255,255,255,0.72), rgba(255,252,244,0.4))',
        border: 'rgba(255,255,255,0.78)',
        shadow: '0 2px 24px rgba(42,34,48,0.24)',
      }

let fonts: { newsreader: Buffer; mono: Buffer } | null = null

async function loadFonts() {
  if (fonts) return fonts
  const dir = path.join(process.cwd(), 'scripts/og-fonts')
  const [newsreader, mono] = await Promise.all([
    readFile(path.join(dir, 'Newsreader.ttf')),
    readFile(path.join(dir, 'DMMono-Regular.ttf')),
  ])
  fonts = { newsreader, mono }
  return fonts
}

/** A pill: the glass the cover uses, minus the blur a raster cannot do. */
const pill = (
  label: string,
  position: Record<string, string>,
  tone: ReturnType<typeof palette>,
) => ({
  type: 'div',
  props: {
    style: {
      position: 'absolute',
      ...position,
      display: 'flex',
      padding: '10px 18px',
      borderRadius: '999px',
      backgroundImage: tone.glass,
      border: `1px solid ${tone.border}`,
      color: tone.text,
      fontFamily: 'DM Mono',
      fontSize: '17px',
      letterSpacing: '1.2px',
      textTransform: 'uppercase',
    },
    children: label,
  },
})

/**
 * The type layer, transparent. Drawn separately from the painting so the
 * painting can be cropped by sharp at the post's own focus.
 */
async function textLayer(title: string, category: string, date: Date, mood: Mood) {
  const tone = palette(mood)
  const { newsreader, mono } = await loadFonts()
  const sunUri = `data:image/svg+xml;base64,${Buffer.from(sunGlyph(tone.sun)).toString('base64')}`
  // A long headline keeps its three lines rather than spilling out of the card.
  const fontSize = title.length > 90 ? 46 : title.length > 60 ? 52 : 58

  const tree = {
    type: 'div',
    props: {
      style: { width: `${WIDTH}px`, height: `${HEIGHT}px`, display: 'flex', position: 'relative' },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${WIDTH}px`,
              height: `${HEIGHT}px`,
              backgroundImage: tone.veil,
            },
          },
        },
        pill(category, { left: '48px', top: '40px' }, tone),
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${WIDTH}px`,
              height: `${HEIGHT}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'img',
                props: { src: sunUri, width: 40, height: 40, style: { marginBottom: '26px' } },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '960px',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontFamily: 'Newsreader',
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.14,
                    letterSpacing: '-1.1px',
                    color: tone.text,
                    textShadow: tone.shadow,
                  },
                  children: title,
                },
              },
            ],
          },
        },
        pill(formatDate(date), { left: '48px', bottom: '40px' }, tone),
      ],
    },
  }

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Newsreader', data: newsreader, weight: 400, style: 'normal' },
      { name: 'DM Mono', data: mono, weight: 400, style: 'normal' },
    ],
  })

  return new Resvg(svg).render().asPng()
}

/**
 * The painting, cropped to the card the way the page crops it: object-fit
 * cover with object-position 50% 64%. The card is 1.9:1 and the paintings are
 * 16:9, so the whole width is visible and only the vertical crop moves — the
 * post's own `cx` focus has nothing to choose between here.
 */
async function paintingLayer(mood: Mood) {
  const file = path.join(process.cwd(), 'src/assets/blog', PAINTINGS[mood])
  const image = sharp(file)
  const meta = await image.metadata()
  const width = meta.width ?? WIDTH
  const height = meta.height ?? HEIGHT
  const cropHeight = Math.min(height, Math.round(width / (WIDTH / HEIGHT)))
  const top = Math.round((height - cropHeight) * 0.64)

  return image.extract({ left: 0, top, width, height: cropHeight }).resize(WIDTH, HEIGHT).toBuffer()
}

export interface OgOptions {
  title: string
  category: string
  date: Date
  mood: Mood
}

/** 1200×630 JPEG. Falls back to the bare painting if the type layer fails. */
export async function renderOgImage({ title, category, date, mood }: OgOptions) {
  const base = await paintingLayer(mood)

  try {
    const layer = await textLayer(title, category, date, mood)
    return await sharp(base)
      .composite([{ input: layer }])
      .jpeg({ quality: 84 })
      .toBuffer()
  } catch (error) {
    console.warn(`[og] type layer failed for “${title}”, falling back to the painting`, error)
    return sharp(base).jpeg({ quality: 84 }).toBuffer()
  }
}
