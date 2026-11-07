<p align="center">
  <img src="public/favicon.svg" width="56" height="56" alt="" />
</p>

<h1 align="center">glyph.moe</h1>

<p align="center">
  The website for <strong>Glyph</strong>, a free, source-first iOS reader for web novels:
  landing page, documentation, release notes and the mock novel site that
  extension developers test against.
</p>

<p align="center">
  <img src="docs/preview-home.jpg" width="880" alt="The Glyph home page: a watercolour valley behind the headline, then a scrolled sequence that turns the phone's cover into the full painting." />
</p>

---

## What's here

| Route               | What it is                                                                      |
| ------------------- | ------------------------------------------------------------------------------- |
| `/`                 | Landing page: hero, the scroll-zoom sequence, feature notes, FAQ, waitlist      |
| `/blog`             | "Notes": release news, source news, guides, one painting per post               |
| `/docs`             | Documentation index                                                             |
| `/docs/:slug`       | Guides, SDK reference, CLI, WIT and Rust extension docs (18 pages)              |
| `/support`          | How to get help                                                                 |
| `/privacy`          | Privacy policy                                                                  |
| `/template/example` | Mock novel site for extension development. `noindex`, excluded from the sitemap |

## Stack

- **[Astro 7](https://astro.build)** — static output, no UI framework, no client runtime
  beyond a few small inline scripts (theme toggle, docs search, the scroll marks).
- **[@astrojs/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)** —
  static build, `dist/` deployed as-is.
- **MDX** for documentation pages, Markdown for blog posts.
- **[satori](https://github.com/vercel/satori) + [resvg](https://github.com/thx/resvg-js)** —
  share cards rendered at build time (`/blog/og/:slug.jpg`).
- **[sharp](https://sharp.pixelplumbing.com)** — every image variant, generated at build.
- **Self-hosted subset fonts** — Newsreader, Hanken Grotesk, DM Mono, inlined via `@font-face`.
- **Plain CSS** with custom properties; no preprocessor, no utility framework.

## Quick start

Node **22.12 or newer**.

```bash
npm ci
npm run dev        # http://localhost:4321
```

| Script            | What it does                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| `npm run dev`     | Dev server                                                             |
| `npm run build`   | Static build to `dist/`                                                |
| `npm run preview` | Serve the build on http://localhost:4321                               |
| `npm run check`   | `astro check` — TypeScript and template diagnostics                    |
| `npm run format`  | Prettier over the repo (`format:check` to verify only)                 |
| `npm run fonts`   | Rebuild the subset `woff2` faces (needs [fonttools])                   |
| `npm run icons`   | Regenerate favicons, `icon.svg`, `icon-night.svg` from `design/icons/` |
| `npm run lqip`    | Rebuild the inline hero placeholders (`src/data/hero-lqip.ts`)         |
| `npm run covers`  | Re-crop the zoom artwork (`world-illustration-wide/-portrait`)         |
| `npm run mask`    | Re-derive `public/screen-mask.svg` from the phone frame                |
| `npm run posters` | Re-encode the clip posters (`-- --check` enforces the byte budget)     |

[fonttools]: https://fonttools.readthedocs.io/en/latest/installation.html

A Husky pre-commit hook runs Prettier on staged Astro/TS/CSS/Markdown/JSON files.

`check:perf` and `check:blog` drive a real browser and are the only scripts that
need Puppeteer, which is not a dependency (it downloads a browser). To run them:

```bash
npm install --no-save puppeteer
npm run build
npm run preview -- --port 4322 &     # check:perf reads http://localhost:4322
npm run check:perf
```

## Project structure

```
.
├── design/                 # design sources — never served, never imported by a page
│   ├── device/             # iPhone frame artwork (the source of screen-mask.svg)
│   ├── icons/              # app icon masters (day and night)
│   ├── paintings/          # hero paintings not in use, kept for future art direction
│   └── prototypes/         # the original single-file scroll prototype
├── public/                 # served verbatim: icons, demo clips, robots.txt, OG card
├── scripts/                # asset generators (see the script table above)
├── src/
│   ├── assets/             # what ships: optimised WebP, subset woff2
│   ├── components/         # SiteNav, SiteFooter, PageHero, blog/*, docs/*
│   ├── content/
│   │   ├── blog/           # Notes posts (.md)
│   │   └── docs/           # documentation (.md, .mdx)
│   ├── data/               # hero LQIP, mock novels for the template site
│   ├── layouts/            # Base, DocsLayout, BlogLayout, MockSite
│   ├── lib/                # blog helpers, OG renderer, LQIP, inline CSS, search index
│   ├── pages/              # routes
│   ├── plugins/            # rehype plugin that wraps markdown tables
│   ├── scripts/            # client-side scripts (search, docs UI, the marks)
│   └── styles/             # tokens, per-surface stylesheets
├── astro.config.mjs        # static output, sitemap, MDX, Shiki themes
├── netlify.toml            # build command, publish dir, cache headers
└── package.json
```

## Adding a blog post

Create `src/content/blog/<slug>.md`. The slug is the URL; the frontmatter is
validated by `src/content.config.ts`, so a typo fails the build instead of
shipping.

```markdown
---
title: 'Reading offline, and what it costs'
description: 'One sentence shown on the card, in search results and in the RSS feed.'
date: 2026-03-14
category: Guide # Release | Sources | Privacy | Roadmap | Guide
mood: dusk # dawn | dusk | night — picks the painting behind the title
cx: 0.68 # 0 = left edge, 1 = right edge: where the crop is centred
draft: false # true keeps the post out of the build
---

The first paragraph.
```

A post owns a **mood**, not a cover image: `mood` selects one of the three
paintings in `src/assets/blog/`, and `cx` moves the crop so two posts in the
same mood do not look alike. `cover:` is available as a rare escape hatch for a
real image. The per-post share card and the RSS feed are generated from the same
frontmatter, so there is nothing else to update.

## Adding a docs page

Create `src/content/docs/<slug>.md` (or `.mdx` if you need components):

```markdown
---
title: Exporting your library
order: 4 # position within the section
section: 'Using Glyph' # 'Using Glyph' | 'Building Extensions' | 'SDK Reference'
description: One line for the index, the search results and the meta description.
---
```

The sidebar, the pager, the search index and the sitemap all read the collection,
so a new file needs nothing else. Sections are fixed by `src/content/docs/`'s
ordering logic in `src/lib/searchIndex.ts`. In `.mdx` you can import
`Callout`, `CLI`, `Platform` and `Capability` from `src/components/docs/`.

## Images and fonts

Source artwork lives in `design/`; what ships lives in `src/assets/`.

- **Shipped images are committed as WebP**, capped at 2000 px wide, and served
  through Astro's `<Picture>`, which emits AVIF/WebP plus a JPEG fallback at the
  widths each layout asks for. Adding a 3000 px PNG to `src/assets/` and importing
  it will bloat the build — resize first.
- **The 8 MB PNG masters are not in the repository.** They live next to the
  checkout, outside git. Everything derived from them (`icons`, `lqip`, `covers`,
  `mask`) can be regenerated from `design/` and `src/assets/` with the npm
  scripts above.
- **Icons** come from `design/icons/*.svg` (masters) and `*.png` (the sizes the
  favicon and home-screen fallbacks need).
- **Fonts**: `npm run fonts` subsets the Fontsource faces down to the characters
  the pages use and writes `src/assets/fonts/*.woff2`. It shells out to
  `pyftsubset`, so it needs `pipx install fonttools`; the generated faces are
  committed, so a normal build never runs it.
- **Demo clips** in `public/clips/` are H.264 MP4 with JPEG posters; the posters
  are budget-checked by `npm run posters -- --check`.

## Deploy

Netlify builds from `master`:

- command `npm run build`, publish `dist/`
- headers in `netlify.toml`: immutable for `/_astro/*`, a one-minute revalidate
  window for documents, a day for the stable-named icons
- the waitlist form is a Netlify form; submissions land in the Netlify dashboard,
  with no backend in this repository

The canonical origin is set once, in `astro.config.mjs` (`site`), and used for
canonical URLs, the sitemap and the RSS feed.

## Credits

- **Type**: Newsreader, Hanken Grotesk and DM Mono, via [Fontsource](https://fontsource.org).
- **Paintings**: the watercolour series behind the hero, the section headers and
  the Notes covers was made for Glyph. They are not stock and not free to reuse.
- **Device artwork**: the iPhone frame is Apple's device outline, used to show
  the app on its hardware; it is not ours to license.
- **Icons**: [Lucide](https://lucide.dev) (ISC).
- **Marks**: the hand-drawn circles, underlines and brackets are drawn in
  `src/scripts/glyph-marks.js` on the page's own paths.

## License

© the Glyph authors. All rights reserved, for now: the code and the artwork are
published so the site can be read and the extension docs can be checked, not for
reuse. See [LICENSE](LICENSE). If you want to use the code, open an issue and
ask — a permissive licence for the code alone (with the artwork and brand assets
still reserved) is the likely outcome.
