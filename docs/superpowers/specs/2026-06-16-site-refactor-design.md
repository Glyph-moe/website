# Glyph site refactor — design

Date: 2026-06-16
Status: Approved direction, pending plan + implementation.

## Goal

Move the site from "indie-startup landing" to literary minimalism. Anchor reference: [trylumnea.com](https://trylumnea.com). Type-led, near-zero motion, warm-paper palette, anti-SaaS surfaces. Applies to landing, docs shell, ancillary pages, and assets.

Secondary refs: [joi.software](https://joi.software) (restrained docs surfaces), [arc.net/search](https://arc.net/search) (not anchor — flagged because user mentioned it, but the gradient-heavy direction was rejected as wrong for a reading app).

## Non-goals

- Logo redesign (parked).
- Content rewrite of documentation pages (parked — flag glaring issues only during implementation).
- Docs search, version selector, live code playgrounds, i18n.
- Real iOS screenshot capture beyond what was provided.
- App Store badge (TestFlight pending — copy reflects this).

## Design system

### Typography

- **Display: Fraunces** (variable). SOFT axis dialed low (~30) for restraint. Used for: hero headline, section headings (h1/h2/h3 in docs, feature row headlines, FAQ questions, prose beat, closing line). Self-host via `@fontsource-variable/fraunces`.
- **Body + UI: Geist** (variable). Used for: paragraphs, nav, buttons, FAQ answers, sidebar, TOC, eyebrow labels, captions, code captions. Self-host via `@fontsource-variable/geist`.
- **Code mono:** unchanged. Shiki blocks keep `SF Mono / Fira Code / JetBrains Mono` stack.

Removed: `@fontsource/space-grotesk` and all its weights.

### Color (warm paper)

Light (default):

```
--bg:           #faf7f2  /* warm off-white */
--bg-surface:  #fffdf8  /* paper surface */
--bg-surface-hover: #f3eee5
--text:         #1a1612  /* warm ink */
--text-secondary: #6b6259
--border:       rgba(26, 22, 18, 0.08)
--accent:       #b35d1d  /* amber-ink */
--accent-dim:  rgba(179, 93, 29, 0.10)
--nav-bg:       rgba(250, 247, 242, 0.85)
```

Dark:

```
--bg:           #15110d  /* warm dark */
--bg-surface:   #1d1812
--bg-surface-hover: #261f17
--text:         #ece6dc
--text-secondary: #8c8275
--border:       rgba(236, 230, 220, 0.07)
--accent:       #d48a1a  /* lifted amber for contrast */
--accent-dim:  rgba(212, 138, 26, 0.10)
--nav-bg:       rgba(21, 17, 13, 0.85)
```

Phone-mockup-specific vars from current `global.css` retained where the reader-customization demo needs them, retuned to warm palette.

Contrast targets: text/bg ≥ 7:1 (AAA); accent/bg ≥ 4.5:1 (AA) on both modes. Tones above selected to hit these.

### Motion

Zero page-level choreography.

Drops:

- `lenis` dep (smooth scroll).
- All `[data-animate="fade-up"]` infrastructure (CSS + IntersectionObserver in `Base.astro`).
- Scroll-swap phone screens in `Features.astro` (IntersectionObserver-driven screen change).

Keeps:

- Hover micro-interactions (color/border shifts, max 200ms ease).
- Product clip autoplay (muted, looped, lazy-paused off-screen via IntersectionObserver). Falls back to static poster for `prefers-reduced-motion` users.
- Interactive reader demo (user-driven taps).

### Texture

Fixed-position full-page noise SVG, ~3–4% opacity, sits behind every page. Content blocks (cards, code blocks, screenshots, demo surfaces) sit on opaque surfaces that occlude the grain — grain never appears under prose, satisfying the "texture in decorative zones only" rule.

### Layout

- Container max-width: 1080px (unchanged).
- Vertical rhythm between major sections: ~120–160px (up from ~40–120 today).
- Section internal padding stays generous.

## Landing page

Section order: **Nav → Hero → Prose beat → Features → FAQ → Closing line → Footer.**

### Nav

- Brand left: logo (tightened) + "Glyph" wordmark in Fraunces.
- Right: text links only — Features, FAQ, Docs, GitHub icon, Discord icon, theme toggle.
- The filled orange "Join Discord" CTA button is removed.
- Backdrop blur (16px), thin border-bottom in `--border`.
- Mobile: burger drawer behavior unchanged, restyled.

### Hero

- Centered stack. No logo (lives in nav).
- Headline (Fraunces, clamp 48–80px, weight ~500): **"A reader, not a feed."**
- Subhead (Geist, clamp 16–19px, `--text-secondary`): "Glyph is a free iOS app for web novels. Bring your own sources, read offline, customize every detail. No accounts, no tracking."
- CTAs (hybrid):
  - One thin amber-ink-bordered button "Join the Discord" (transparent fill, accent text, accent border, hover deepens border).
  - One bare text link with arrow suffix: "Read the docs →".
- Tiny note (`--text-secondary`, ~13px): "TestFlight invites coming soon."
- **Directly below**, no animation, no scroll trigger: `screen-reader.png` face-on at ~320px desktop / ~280px mobile, soft shadow, no phone frame, no caption.

### Prose beat (new)

- Single Fraunces sentence, centered, clamp 28–40px, low contrast (`--text-secondary`), italic optional via SOFT axis.
- ~120px breathing room above and below.
- Draft copy: "Web novels deserve a reader. Not a feed, not a content app — a place where prose breathes."
- No CTA, no decoration.

### Features

Four alternating side-by-side rows. Mobile: stacked, media before text.

Text column per row:

- Small uppercase eyebrow in Geist (`READING`, `EXTENSIONS`, `OFFLINE`, `PRIVACY`), 11px, letter-spacing 0.08em, `--text-secondary`.
- Headline in Fraunces, ~28–32px.
- Body in Geist, ~16px, line-height 1.6, `--text-secondary`.
- No "Learn more" link unless content warrants it; otherwise the surface is read once and moved past.

Media column per row:

1. **Reading — interactive demo (CSS+JS, not video).**
   - Standalone surface (no phone frame): rounded warm paper bg styled like a reader page.
   - Sample paragraph rendered in Fraunces serif body (matches real Glyph reader feel).
   - Below: theme dots (4 swatches) and font-size chips (A / A).
   - Click theme dot → surface bg + ink color updates; click size chip → paragraph font-size updates. State purely local to the demo.
   - Themes available: white, sepia (default), warm-dark, full-black. Matches what the app offers.

2. **Extensions — static.** `screen-extensions.png` on a rounded warm-bordered surface, soft shadow, no phone frame.

3. **Offline — static.** `screen-downloads.png`, same treatment.

4. **Privacy — static.** `screen-settings.png`, same treatment.

All three non-Reading rows are static images for v1. Autoplay muted-loop clips may replace any of them post-launch if a suitable clip exists — not implemented in this refactor.

### FAQ section (magazine-interview style)

- Header: small Fraunces "Questions" (the section is still anchored at `#faq` for existing nav links; the visible label is "Questions").
- Five Q&A pairs, all open. No accordion.
- Layout per pair:
  - `Q.` marker in Fraunces italic, amber-ink, baseline-aligned with question.
  - Question in Fraunces regular.
  - `A.` marker in Geist, `--text-secondary`, on its own line below.
  - Answer in Geist body.
- ~48px vertical breathing between pairs.
- Below the list: small Geist line, "More questions in the [full FAQ](/docs/faq), or on [Discord](https://discord.gg/hvA2sMRwxC)."
- Existing 5 questions kept verbatim (content unchanged).

### Closing line (new)

- Fraunces sentence, centered, ~36–44px: "Coming to TestFlight. Be there when it ships."
- Single text link below: "Join Discord →" in amber-ink.
- ~140px breathing room. No card, no border.

### Footer

- Thin single row on desktop, stacked on mobile.
- Left: small logo + "Glyph" in Geist.
- Right: text links — Docs / GitHub / Discord / Privacy / Support.
- Below the row: tiny copy "© Glyph · Free iOS reader for web novels." in `--text-secondary`.
- No newsletter, no sitemap columns, no social icons beyond text links.

## Docs

Architecture unchanged: sidebar left, article middle, TOC right, mobile bar. Restyle only.

### Sidebar

- Sections collapsible (as today).
- Section titles: Geist, ~11px, uppercase, letter-spacing 0.08em.
- Links: Geist ~14px, secondary color.
- Active link: amber-ink 2px left bar + amber-ink text, no fill block.
- Hover: warm surface tint.

### Article typography

- `h1`: Fraunces ~38px, weight ~600, SOFT low. Big bottom margin (~32px).
- `h2`: Fraunces ~24px. Hairline `--border` divider above, ~48px top margin.
- `h3`: Fraunces ~18px.
- Body `p`: Geist 16px, line-height 1.7, `--text-secondary`.
- `a`: amber-ink, dotted underline (not solid border-bottom). Hover: underline solidifies.
- Inline `code`: Geist mono fallback, warm subtle bg, no border.
- `pre code`: warm-paper subtle border, 8px radius, more padding (~20px), Shiki retains current dual-theme behavior.
- `blockquote`: kept but recolored to amber-ink left bar, warm `--accent-dim` bg.

### TOC

- "On this page" label tightened.
- Active link: amber-ink color + amber-ink left bar (matching sidebar treatment).
- Smooth scroll behavior unchanged.

### Pager

- Bottom prev/next cards stay structurally.
- Restyle: hairline border, no fill on hover — border deepens to `--text-secondary` and title text shifts to `--accent`.

### New MDX components

All authored in `src/components/docs/*.astro`. MDX integration already on (`@astrojs/mdx`).

1. **`<Callout type="note|tip|warning|info">`**
   - Left amber-ink bar, warm `--accent-dim` (or type-specific tint) surface.
   - Icon + Fraunces small-caps label.
   - Geist body content via slot.

2. **`<ParamTable>` / `<Param name type required default>...</Param>`**
   - Editorial table layout (not HTML `<table>` necessarily — can be CSS grid for better mobile).
   - `name` in mono, `type` in mono amber-ink, `required` rendered as a small chip when true, `default` dimmed mono, description in Geist body.

3. **`<CLI>` / `<Output>`**
   - `<CLI>` renders a `$` prompt followed by command in mono.
   - Optional `<Output>` child renders dimmed mono block underneath.
   - Replaces ad-hoc `bash`/`shell` fenced blocks where the example is interactive.

4. **`<Method name returns badges>`**
   - Header block for SDK method docs.
   - Method name big mono, return type amber-ink mono, badges (e.g. `async`, `throws`) as small chips.

5. **`<Capability name>`**
   - Inline pill: amber-ink border, mono name.
   - Used in sdk-capabilities and wherever a capability is referenced.

6. **`<Platform>iOS</Platform>` / `<Platform>Rust</Platform>` / `<Platform>WIT</Platform>`**
   - Small uppercase tag, no chrome, sits at the top of a page or section.

**Faithfulness rule:** during implementation, each docs page is read; components are introduced only where they clarify the actual SDK/CLI behavior. Existing markdown tables that already work are not converted for the sake of it. No invented methods, capabilities, or flags.

## Ancillary pages

- **`/privacy`, `/support`** — inherit the new system (Fraunces h1/h2, Geist body, warm-paper, grain, no buttons). Re-flow vertical rhythm. Content untouched.
- **`/template/example/*`** — untouched. Mock site for SDK extension testing; intentionally bland to simulate real novel sites.

## Logo

- Stroke widths tightened: outer 2 → 1.5, inner 1 → 0.75, ring 0.75 → 0.5.
- Inherits new `--accent` for center dot automatically.
- No shape change.

## Assets

Existing screenshots in `/image-remake/` moved into `/public/images/screens/`:

| Source                 | Destination               | Use                            |
| ---------------------- | ------------------------- | ------------------------------ |
| `reader.png`           | `screen-reader.png`       | Hero product shot              |
| `reader-bis.png`       | `screen-reader-menu.png`  | Optional inset / future use    |
| `browse-main-page.png` | `screen-extensions.png`   | Extensions row                 |
| `browse.png`           | `screen-novel-detail.png` | Held for closing line / future |
| `downloads.png`        | `screen-downloads.png`    | Offline row                    |
| `settings.png`         | `screen-settings.png`     | Privacy row                    |

For each, generate `.webp` alongside `.png` for perf (using existing build tooling or a small `sharp` script — call out in plan). `/image-remake` deleted after migration.

## Dependencies and bundle

**Drop:**

- `lenis`
- `@fontsource/space-grotesk` (all weights)

**Add:**

- `@fontsource-variable/fraunces`
- `@fontsource-variable/geist`

Net effect: slightly leaner bundle. Variable fonts replace 4 static weights.

## Accessibility

- `prefers-reduced-motion`: product clips fall back to static posters; hover transitions become instant.
- Color contrast verified (AAA text, AA accent) for both modes.
- Interactive reader demo: theme/size controls have visible focus rings (amber-ink outline) and ARIA labels.
- Skip-link not introduced (not present today — defer).

## Risks / open follow-ups

- **Interactive reader demo CSS drift.** Demo styling may diverge slightly from the real app reader. Mitigated by sourcing the sepia + white palettes directly from `reader.png` / `reader-bis.png`; warm-dark and true-black themes use sensible defaults (warm-dark = `#1a1612` bg / warm cream text; true-black = `#000` bg / soft gray text). Flagged for visual review during implementation.
- **Grain perf on low-end devices.** A repeating SVG fixed-position noise can repaint on scroll. Pre-rasterize to a small PNG/JPEG if perf testing reveals issues.
- **Variable font payload.** Fraunces + Geist variable files are larger than single static weights. Self-hosted with `font-display: swap` and Latin-only subset (site is English-only).
- **TOC active-state collision with new active-bar.** Today's TOC uses a 2px left border for active. Sidebar will get the same. Distinguished by container — no semantic conflict, just visual consistency.

## Phasing (informative — full plan is the next deliverable)

The plan written next will likely sequence as:

1. Foundation: deps, fonts, palette, grain, drop-motion. (Site looks broken-but-coherent.)
2. Landing: nav, hero, prose beat, features (with interactive reader demo), FAQ rework, closing line, footer.
3. Docs: shell restyle, component build-out, page-by-page pass.
4. Ancillary: privacy, support typography pass.
5. Asset migration + perf pass.

Each phase ends in a runnable, demo-able state.
