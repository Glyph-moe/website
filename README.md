<p align="center">
  <img src="public/favicon.svg" width="48" height="48" alt="Glyph" />
</p>

<h1 align="center">glyph.moe</h1>

<p align="center">
  Landing page, documentation, and extension test site for <a href="https://glyph.moe">Glyph</a>.
</p>

---

## Stack

- **[Astro](https://astro.build)** with static output + Netlify adapter
- **[Fraunces](https://fonts.google.com/specimen/Fraunces)** (display) + **[Geist](https://fonts.google.com/specimen/Geist)** (body), via Fontsource
- **[Shiki](https://shiki.matsu.io)** for code syntax highlighting (via Astro MDX)
- **CSS variables**, no component library, no JS framework
- **[@sneas/telephone](https://github.com/sneas/telephone)** web component for the iPhone reader mockup

## Pages

| Route               | What it does                                                           |
| ------------------- | ---------------------------------------------------------------------- |
| `/`                 | Landing: hero (tagline + waitlist + reader mockup), feature tiles, FAQ |
| `/docs`             | Documentation index (readers, extension builders, reference)           |
| `/docs/:slug`       | Individual docs pages (getting started, SDK, CLI, WIT, Rust, FAQ, …)   |
| `/support`          | Support channels (GitHub Issues, Discussions, email)                   |
| `/privacy`          | Privacy policy                                                         |
| `/template/example` | Mock novel site (NovelHaven) for extension development                 |

## Development

```bash
npm install
npm run dev
```

Open [localhost:4321](http://localhost:4321).

## Build & Deploy

```bash
npm run build
```

Static output to `dist/`. Deploys to Netlify automatically via `netlify.toml`.
The waitlist form (`form name="waitlist"`) is a Netlify form — submissions land in the Netlify dashboard.

## Structure

```
src/
├── components/         # Astro components (Hero, Features, Faq, Footer, ReaderPhone, tiles, WaitlistForm)
│   └── tiles/          # Bento supporting tiles (Extensions, Offline, Privacy)
├── layouts/
│   ├── Base.astro      # Landing layout (head, OG, structured data, Grain)
│   ├── DocsLayout.astro # Docs layout with sidebar, TOC, pager
│   └── MockSite.astro  # NovelHaven mock site layout
├── content/docs/       # Markdown / MDX documentation
├── pages/
│   ├── index.astro     # Landing
│   ├── docs.astro       # Docs index
│   ├── docs/[slug].astro
│   ├── support.astro
│   ├── privacy.astro
│   └── template/        # Mock novel site
└── styles/
    └── global.css      # Design tokens + reset
```

## Design

| Token        | Value                  |
| ------------ | ---------------------- |
| Background   | `#faf7f2` (warm paper) |
| Surface      | `#fffdf8`              |
| Accent       | `#b35d1d` (orange)     |
| Text         | `#1a1612`              |
| Display font | Fraunces Variable      |
| Body font    | Geist Variable         |
| Radius       | 12px / 16px            |

Dark mode via explicit `data-theme` toggle (`#15110d` background, `#d48a1a` accent).

## License

MIT
