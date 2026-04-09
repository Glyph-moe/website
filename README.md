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
- **[Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)** for typography
- **[GSAP](https://gsap.com) + ScrollTrigger** for scroll animations
- **[Lenis](https://lenis.darkroom.engineering)** for smooth scrolling
- **[Shiki](https://shiki.matsu.io)** for code syntax highlighting (via Astro MDX)
- **CSS variables**, no component library

## Pages

| Route | What it does |
|-------|--------------|
| `/` | Landing page with hero, feature showcase, interactive phone mockup |
| `/docs/getting-started` | User guide: how to use the app, add extensions, reader features |
| `/docs/faq` | Frequently asked questions |
| `/docs/sdk-overview` | SDK architecture, quick start, project structure |
| `/docs/sdk-source-interface` | Source methods, types, examples |
| `/docs/sdk-http` | HTTP helpers, rate limiting, retries, error handling |
| `/docs/sdk-helpers` | Cheerio, pagination, cookies, content rating |
| `/docs/sdk-publishing` | Build, deploy, versioning, testing |
| `/template/example` | Mock novel site (NovelHaven) for extension development |
| `/template/example/novel/:id` | Novel detail pages with scrapeable selectors |
| `/template/example/novel/:id/:chapter` | Chapter content pages |
| `/template/example/genre/:genre` | Genre filtering with tag chips |
| `/template/example/search?q=...` | Search results |

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

## Structure

```
src/
├── components/         # Astro components (Nav, Hero, Features, Footer)
├── layouts/
│   ├── Base.astro      # Landing layout (GSAP + Lenis)
│   ├── DocsLayout.astro # Docs layout with sidebar navigation
│   └── MockSite.astro  # NovelHaven mock site layout
├── content/docs/       # Markdown documentation (7 pages)
├── data/
│   └── mock-novels.ts  # 6 novels, 591 chapters of test data
├── pages/
│   ├── index.astro     # Landing
│   ├── docs/           # Documentation
│   └── template/       # Mock novel site
└── styles/
    └── global.css      # Design tokens + reset
```

## Design

| Token | Value |
|-------|-------|
| Background | `#0E0E12` |
| Surface | `#16161D` |
| Accent | `#EF9F27` (gold) |
| Text | `#E8E6E3` |
| Font | Space Grotesk |
| Radius | 12px |

## License

MIT
