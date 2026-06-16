# Site refactor R2 — delta on R1 spec

Date: 2026-06-17
Status: Approved direction, pending plan + implementation.
Layers on top of: `2026-06-16-site-refactor-design.md`.

## Why this delta

After R1 shipped, the site felt finished but sage — too restrained, not enough visual interest, screenshots felt naked, header carried no weight. R2 adds modernity selectively without abandoning the R1 anchor (literary type, warm paper, no scroll choreography).

## Changes (delta from R1)

### Structural

- **Drop the landing Nav entirely.** Discord/GitHub were dead weight (Discord link not driving signups, GitHub findable from footer); Docs link is already in hero CTAs and footer.
- **Drop the prose beat section.** It was the sagest moment on the page. Hero already states the position.
- **Floating theme toggle** (top-right corner, fixed, no chrome, ~30px square) replaces the in-nav toggle on the landing page.
- **Minimal top-bar on docs / privacy / support pages**: wordmark home link (Glyph) + theme toggle only. No links, no menu. Gives users a way back to `/` without scrolling to footer.
- **Logo in hero**: small Logo above the headline (replaces the brand-mark role the nav held).
- **Footer unchanged**: keeps the thin single row with Docs / GitHub / Discord / Privacy / Support links + copyright.

### Hero

- **Drop the reader screenshot below the copy.** The phone moves into the Features bento hero tile; one phone on the page is more impactful than two.
- **New layout**: small Logo + Fraunces headline + Geist subhead + hybrid CTAs (outline button + text link) + tiny TestFlight note. Type-led, no image.

### Features — bento grid

- **Layout**: tall hero left (~55% width) + 3 stacked supporting tiles right (~45%). Mobile collapses to single column (hero first, then 3 tiles).
- **Hero tile (Reading)**: iPhone 16 Max frame via the `@sneas/telephone` Web Component (`<iphone-16-max mode="...">`). Inside the screen: reader page with sample paragraph. A small "Aa" button top-right of the reader screen opens an in-screen popover with theme dots + size buttons (matches the real Glyph reader UX, see `screen-reader-menu.png`). Tap "Aa" again or anywhere outside the popover to dismiss.
- **3 supporting tiles** — micro-viz mix, no phones, each distinct:
  - **Extensions**: 3 source-logo chips (Anna's Archive / NovelHaven / NovelHaven Rust), rendered as inline pills with the colored letter-mark icons from the existing screenshots. Headline: "Bring your own sources" with `<source-icon>` swap in the title (e.g. inline puzzle-piece). Body: short.
  - **Offline**: small download-progress widget (cover thumbnail + filename + thin progress bar + checkmark on complete). Static visual (no animation needed). Headline: "Read \[plane-icon\] anywhere". Body: short.
  - **Privacy**: big lock icon + display copy ("No accounts. No tracking.") in Fraunces. Headline: "\[lock-icon\] by default". Body: short.

### Inline icon swaps

- Strategy: replace ONE word per heavy display line with a contextual icon (Lucide static SVG, inline, sized to letter cap-height, color = currentColor). Keeps the gesture literary, not gimmicky.
- Locations (final 4):
  - Closing line ship icon (already shipped, user-edited).
  - Extensions feature title: "Bring your own \[source-icon\]" or similar — puzzle-piece glyph.
  - Offline feature title: "Read \[plane-icon\] anywhere".
  - Privacy feature title: "\[lock-icon\] by default".
- Hero headline and prose beat are NOT eligible — too risky on the main statement; prose beat is gone anyway.

### FAQ

- **Numbered editorial combo**: drop "Q." and "A." markers. Each question gets a big italic Fraunces numeral above it (`01.` through `06.` in amber-ink, ~28px, italic). Question follows in Fraunces regular. Answer follows below in Geist (no marker).
- **Add 1 meta question**: "Why the name Glyph?" — answer should be a short, slightly personal sentence (e.g. "A glyph is a single mark of meaning. The smallest unit of a written thing. It felt right for a reader."). Total now 6 questions.
- "Questions" header stays (Fraunces, small).

### Landing page section order (post-R2)

`Hero → Features (bento) → FAQ → Closing line → Footer.`

(No nav, no prose beat, floating theme toggle persists across all sections.)

## Implementation notes

- **`@sneas/telephone`** is a Web Component package (`<iphone-16-max mode="light|dark">`). It loads client-side. To avoid a flash-of-unstyled-content, register its script in `<head>` (not deferred). On theme flip, update the `mode` attribute on the element so the status-bar text contrast follows.
- **Mobile phone frames**: the iPhone 16 Max frame stays even on mobile per user preference. Just scale down (`max-width` on the container). User notes: "no need for too much images" — supporting tiles stay micro-viz, only the hero tile renders a phone, so mobile sees one phone-in-phone, which is acceptable.
- **`Aa` popover**: small JS interaction (toggle a class on the reader surface to show/hide the popover). State is local to the demo. No framework needed.
- **Floating theme toggle**: same script logic as today's nav toggle (localStorage persist + flip `data-theme` on `:root`). Just relocated and restyled.

## Out of scope (still)

- Logo redesign (parked).
- Docs content rewrite (parked).
- Search, version selector, live playgrounds.
- Real iOS screenshot capture (we have what we have).
- App Store badge.
