// Every stylesheet the site serves is inlined into the document it belongs to.
// A `<link rel="stylesheet">` is a render-blocking request: the browser may not
// paint until it arrives, which on a slow connection is a second of blank page.
//
// The composition is here rather than in `styles/global.css` because Astro can
// inline a stylesheet a layout imports, but it does not follow an `@import`
// chain while doing so — the hub resolves, its imports are dropped, and the
// page renders unstyled with nothing in the build output to say so. Listing the
// files makes the order visible, which is what a cascade needs.
//
// The type faces are separate: they are 53 kB of the 86 kB a slow connection
// can move in a second, and they were arriving while the hero painting was
// still on the wire.
//
// A missing import does not fail the build; it shows up as unstyled content.
// `scripts/check-perf.mjs` asserts a token from each on the route that needs it.

import blogStyles from '../styles/blog.css?inline'
import docsStyles from '../styles/docs.css?inline'
import fontsCss from '../styles/fonts.css?inline'
import shellStyles from '../styles/global.css?inline'
import innerCss from '../styles/inner.css?inline'
import marksCss from '../styles/marks.css?inline'
import siteCss from '../styles/site.css?inline'
import homeStyles from '../styles/home.css?inline'

export { fontsCss }

/** The homepage: theme, marks, then its own layout. Type comes separately. */
export const homeCss = marksCss + siteCss + homeStyles

/** Every other page: the shared theme, the type, the editorial layout, and the
 *  page shell that used to be the tail of global.css. */
export const baseCss = siteCss + fontsCss + innerCss + shellStyles

/** Documentation adds its own navigation and prose rules on top. */
export const docsCss = docsStyles

/** The notes, and the pages that borrow their shell. */
export const blogCss = blogStyles
