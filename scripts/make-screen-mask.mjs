// Builds the mask that clips the app screenshot to the device's glass.
//
// Apple's iPhone 18 Pro artwork has two different curves:
//   - the display aperture, whose corners are a soft glass curve
//     (not the sharp rounded rectangle of the screen image), and
//   - the device's own outline, which is rounded much more strongly.
//
// The screenshot is a plain rectangle, so without a mask its four corners
// poke out past the device outline and the app screenshot is visible
// floating on the page behind the phone.
//
// This script reads the frame's own alpha channel, finds the display
// aperture inside it and writes an SVG that traces the glass edge. The SVG is
// used as a CSS mask on the screenshot.
//
// Usage: node scripts/make-screen-mask.mjs
import fs from 'node:fs'
import nodePath from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const root = nodePath.resolve(import.meta.dirname, '..')
const frame = nodePath.join(root, 'src/assets/phone/frame-glacier.webp')
const out = nodePath.join(root, 'public/screen-mask.svg')

// Display aperture inside the 1350 x 2760 frame (measured from the alpha).
const APERTURE = { left: 72, top: 69, width: 1206, height: 2622 }

const { data, info } = await sharp(frame).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

const { width, height, channels } = info

// Transparent inside the glass, opaque on the bezel.
const isGlass = (x, y) => data[(y * width + x) * channels + 3] < 128

// The frame is transparent in two places: the display aperture, and the area
// outside the device outline. Flood-fill from the middle of the display so the
// mask is the aperture only - the transparent space around the rounded
// corners of the device is *not* part of the screen.
const glass = new Uint8Array(width * height)
const stack = [Math.floor(height / 2) * width + Math.floor(width / 2)]
while (stack.length) {
  const p = stack.pop()
  if (glass[p]) continue
  const x = p % width
  const y = (p - x) / width
  if (!isGlass(x, y)) continue
  glass[p] = 1
  if (x > 0) stack.push(p - 1)
  if (x < width - 1) stack.push(p + 1)
  if (y > 0) stack.push(p - width)
  if (y < height - 1) stack.push(p + width)
}

// The aperture is symmetric, so one corner is enough: walk down the left edge
// of the aperture and record how far in the glass starts on each row.
const edge = []
for (let y = 0; y < APERTURE.height; y++) {
  let x = 0
  while (x < APERTURE.width && !glass[(APERTURE.top + y) * width + (APERTURE.left + x)]) x++
  edge.push(x)
}

// The straight part of the edge starts where the glass reaches the edge.
const cornerEnd = edge.indexOf(0)
const samples = edge.slice(0, cornerEnd).map((x, y) => ({ x, y }))

/**
 * Fit one cubic Bezier to the corner with the ends pinned to the straight
 * edges (Schneider's method): with the parameters fixed by chord length, the
 * two free control points fall out of a 2x2 least-squares solve.
 */
function fitCubic(points) {
  const p0 = points[0]
  const p3 = points[points.length - 1]

  // Chord-length parameterisation.
  const ts = [0]
  for (let i = 1; i < points.length; i++) {
    ts.push(ts[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  }
  const total = ts[ts.length - 1] || 1
  for (let i = 0; i < ts.length; i++) ts[i] /= total

  // Normal equations for P1 and P2.
  let c00 = 0
  let c01 = 0
  let c11 = 0
  const rx = [0, 0]
  const ry = [0, 0]
  for (let i = 0; i < points.length; i++) {
    const t = ts[i]
    const u = 1 - t
    const b0 = u * u * u
    const b1 = 3 * u * u * t
    const b2 = 3 * u * t * t
    const b3 = t * t * t
    c00 += b1 * b1
    c01 += b1 * b2
    c11 += b2 * b2
    rx[0] += b1 * (points[i].x - (b0 * p0.x + b3 * p3.x))
    rx[1] += b2 * (points[i].x - (b0 * p0.x + b3 * p3.x))
    ry[0] += b1 * (points[i].y - (b0 * p0.y + b3 * p3.y))
    ry[1] += b2 * (points[i].y - (b0 * p0.y + b3 * p3.y))
  }
  const det = c00 * c11 - c01 * c01
  const solve = b =>
    det
      ? { a: (b[0] * c11 - b[1] * c01) / det, b: (c00 * b[1] - c01 * b[0]) / det }
      : { a: b[0] / (c00 || 1), b: b[1] / (c11 || 1) }

  const fx = solve(rx)
  const fy = solve(ry)
  const P1 = { x: fx.a, y: fy.a }
  const P2 = { x: fx.b, y: fy.b }

  // Mean distance from the samples to the curve.
  let sum = 0
  for (const s of points) {
    let best = Infinity
    for (let i = 0; i <= 240; i++) {
      const t = i / 240
      const u = 1 - t
      const cx = u * u * u * p0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * p3.x
      const cy = u * u * u * p0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * p3.y
      const d = (cx - s.x) ** 2 + (cy - s.y) ** 2
      if (d < best) best = d
    }
    sum += best
  }
  return { p0, P1, P2, p3, error: Math.sqrt(sum / points.length) }
}

// Two cubics per corner: Apple's continuous-curvature glass edge is not a
// single cubic, but two follow it closely enough that the difference never
// shows under the bezel.
const half = Math.floor(samples.length / 2)
const upper = fitCubic(samples.slice(0, half + 1))
const lower = fitCubic(samples.slice(half))
const join = lower.p0
const end = lower.p3

const W = APERTURE.width
const H = APERTURE.height
const n = v => Math.round(v * 100) / 100
const c = p => `${n(p.x)} ${n(p.y)}`

// One corner, as two cubic segments, starting on the top edge and ending on
// the left edge.
const cornerSegs = [
  { p0: upper.p0, p1: upper.P1, p2: upper.P2, p3: upper.p3 },
  { p0: lower.p0, p1: lower.P1, p2: lower.P2, p3: lower.p3 },
]
void cornerSegs

// Mirror a corner: the aperture is symmetric, so the right edge is the left
// edge mirrored in x, and the bottom is the top mirrored in y.
const mirrorX = s => ({
  p0: { x: W - s.p0.x, y: s.p0.y },
  p1: { x: W - s.p1.x, y: s.p1.y },
  p2: { x: W - s.p2.x, y: s.p2.y },
  p3: { x: W - s.p3.x, y: s.p3.y },
})
const mirrorY = s => ({
  p0: { x: s.p0.x, y: H - s.p0.y },
  p1: { x: s.p1.x, y: H - s.p1.y },
  p2: { x: s.p2.x, y: H - s.p2.y },
  p3: { x: s.p3.x, y: H - s.p3.y },
})
const seg = s => `C ${c(s.p1)} ${c(s.p2)} ${c(s.p3)}`
const upperSeg = { p0: upper.p0, p1: upper.P1, p2: upper.P2, p3: upper.p3 }
const lowerSeg = { p0: lower.p0, p1: lower.P1, p2: lower.P2, p3: lower.p3 }
// The fit can push a control point outside the aperture, which makes the curve
// bulge past the edge it is supposed to follow; keep it inside the box.
upperSeg.p1.y = Math.max(0, upperSeg.p1.y)
upperSeg.p2.y = Math.max(0, upperSeg.p2.y)
lowerSeg.p1.y = Math.min(H, lowerSeg.p1.y)
lowerSeg.p2.y = Math.min(H, lowerSeg.p2.y)
// A cubic runs p0 -> p1 -> p2 -> p3; reversed it runs p3 -> p2 -> p1 -> p0.
const rev = s => ({ p0: s.p3, p1: s.p2, p2: s.p1, p3: s.p0 })

const d = [
  `M ${c(upperSeg.p0)}`,
  `H ${n(W - upperSeg.p0.x)}`,
  seg(mirrorX(upperSeg)),
  seg(mirrorX(lowerSeg)),
  `V ${n(H - end.y)}`,
  seg(rev(mirrorY(mirrorX(lowerSeg)))),
  seg(rev(mirrorY(mirrorX(upperSeg)))),
  `H ${n(upperSeg.p0.x)}`,
  seg(mirrorY(upperSeg)),
  seg(mirrorY(lowerSeg)),
  `V ${n(end.y)}`,
  seg(rev(lowerSeg)),
  seg(rev(upperSeg)),
  'Z',
].join(' ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <path d="${d}" fill="#fff"/>
</svg>
`
fs.writeFileSync(out, svg)
console.log(
  `screen-mask.svg ${W}x${H} ${(fs.statSync(out).size / 1024).toFixed(1)} KB ` +
    `(corner fit error ${upper.error.toFixed(2)} / ${lower.error.toFixed(2)} px)`,
)
