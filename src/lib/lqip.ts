import path from 'node:path'
import sharp from 'sharp'

/**
 * The paintings, shrunk to a thumbnail and inlined, so a cover has something
 * of its own to show while the real crop is still on the wire.
 *
 * These are built once per build (the promise is cached), a 24px-wide copy of
 * the same painting the cover will load, blurred and encoded as a data URI.
 * Three of them, 2 kB together, emitted as CSS custom properties by the blog
 * layout. A cover paints its mood's wash and this thumbnail underneath the
 * title, then the real image fades in over it.
 */

export type Mood = 'dawn' | 'dusk' | 'night'

// Read from the source tree rather than through the asset pipeline: the build
// runs from the project root, and sharp wants a file, not a served URL.
const paintings: Record<Mood, string> = {
  dawn: path.join(process.cwd(), 'src/assets/blog/painting-dawn.webp'),
  dusk: path.join(process.cwd(), 'src/assets/blog/painting-dusk.webp'),
  night: path.join(process.cwd(), 'src/assets/blog/painting-night.webp'),
}

const cache = new Map<Mood, Promise<string>>()

function encode(mood: Mood): Promise<string> {
  return sharp(paintings[mood])
    .resize({ width: 24 })
    .blur(0.6)
    .jpeg({ quality: 42, mozjpeg: true })
    .toBuffer()
    .then(buffer => `url(data:image/jpeg;base64,${buffer.toString('base64')})`)
}

export function placeholder(mood: Mood): Promise<string> {
  let pending = cache.get(mood)
  if (!pending) {
    pending = encode(mood)
    cache.set(mood, pending)
  }
  return pending
}

/** The three placeholders as CSS custom properties, for the layout to inline. */
export async function placeholderVars(): Promise<string> {
  const moods: Mood[] = ['dawn', 'dusk', 'night']
  const values = await Promise.all(moods.map(placeholder))
  const vars = moods.map((mood, index) => `--lqip-${mood}:${values[index]}`).join(';')
  return `:root{${vars}}`
}
