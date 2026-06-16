# Site Refactor R2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add modernity + visual personality without abandoning the R1 anchor. Drop the landing nav, switch features to a bento grid with a real iPhone 16 Max mockup (via `@sneas/telephone` Web Component), introduce micro-visualizations for supporting features, replace four "Q." markers with editorial numerals, inline icon swaps in heavy display text.

**Spec ref:** `docs/superpowers/specs/2026-06-17-site-refactor-r2-delta.md`. Layers on top of `2026-06-16-site-refactor-design.md`.

**Architecture:** Astro 6 static site. R1 foundation (Fraunces+Geist, warm-paper palette, grain, zero motion infra, MDX docs components) stays. R2 changes are component-level: new floating theme toggle, new docs top-bar, rewritten Hero (no screenshot), new bento Features with ReaderPhone + 3 tile components, restyled FAQ (numbered + meta question), four pages drop their Nav import.

**Tech Stack:** Astro 6, `@sneas/telephone` Web Component for the iPhone 16 Max frame, Lucide static SVG icons inline, existing `@fontsource-variable/fraunces` + `geist`, CSS custom properties for theming.

**Working tree state at start:** the previous user iteration left edits on `Hero.astro` (button text → "Coming soon on TestFlight", removed hero-note, has a typo `font-styleitalic`) and `ProseBeat.astro` (shortened sentence). The Hero is being fully rewritten in this plan — preserve the user's button copy and removed hero-note; fix the `font-styleitalic` typo on the way (intended `font-style: italic`). ProseBeat is being deleted entirely so its edit becomes moot.

**Commit style:** conventional commits (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`). Husky + lint-staged runs Prettier on staged files — that's fine.

**Verification:** `npm run build` between tasks; visual smoke at end.

---

## Phase A — R2 Foundation

### Task R2.1: Install @sneas/telephone + Lucide static SVG dependency

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the package**

```bash
cd /Users/virgile/Documents/novel/glyph-landing
npm install @sneas/telephone
```

(Lucide is NOT installed — icons are inlined as static SVG markup directly in the relevant components. This keeps the bundle lean and avoids a runtime icon framework.)

- [ ] **Step 2: Verify**

```bash
grep -c '@sneas/telephone' package.json
ls node_modules/@sneas/telephone/ | head
```

Expected: package present in deps, files exist in `node_modules`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @sneas/telephone web component package"
```

---

### Task R2.2: Load telephone in Base.astro `<head>`

**Files:**

- Modify: `src/layouts/Base.astro`

The `@sneas/telephone` package registers `<iphone-16-max>` as a Web Component. Loading the script in `<head>` (not deferred) avoids a flash where the unrenderable custom element shows nothing until JS arrives.

- [ ] **Step 1: Add the import to Base.astro `<head>`**

Open `src/layouts/Base.astro`. In the `<head>` block (after the existing `<script is:inline>` for theme), add:

```astro
<script>
  import '@sneas/telephone'
</script>
```

Astro will bundle this client-side. The script registers the custom element globally.

- [ ] **Step 2: Build verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: succeeds. No "iphone-16-max" warnings.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: register telephone web component in base layout"
```

---

### Task R2.3: Create FloatingThemeToggle component

**Files:**

- Create: `src/components/FloatingThemeToggle.astro`

This is the corner-fixed toggle that replaces the nav-embedded toggle. Same JS pattern as today's nav toggle (localStorage persist + flip `data-theme` on `:root`).

- [ ] **Step 1: Create `src/components/FloatingThemeToggle.astro`**

```astro
---
// Fixed top-right theme toggle. Replaces nav-embedded toggle.
// Persists choice to localStorage. Reads on Base layout via the existing
// inline pre-paint script that applies the saved attribute.
---

<button class="float-toggle" id="float-theme-toggle" aria-label="Toggle theme" type="button">
  <svg
    class="icon-sun"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5"></circle>
    <path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
    ></path>
  </svg>
  <svg
    class="icon-moon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</button>

<style>
  .float-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-surface);
    color: var(--text-secondary);
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      color 0.18s ease,
      border-color 0.18s ease,
      background 0.18s ease;
  }

  .float-toggle:hover {
    color: var(--text);
    border-color: var(--border-strong);
  }

  .icon-moon {
    display: none;
  }
  .icon-sun {
    display: block;
  }
  :root[data-theme='dark'] .icon-sun {
    display: none;
  }
  :root[data-theme='dark'] .icon-moon {
    display: block;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .icon-sun {
      display: none;
    }
    :root:not([data-theme='light']) .icon-moon {
      display: block;
    }
  }

  @media (max-width: 640px) {
    .float-toggle {
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
    }
  }
</style>

<script is:inline>
  ;(function () {
    var btn = document.getElementById('float-theme-toggle')
    if (!btn) return
    var root = document.documentElement
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme')
      var isDark =
        current === 'dark' ||
        (!current && window.matchMedia('(prefers-color-scheme: dark)').matches)
      var next = isDark ? 'light' : 'dark'
      root.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
    })
  })()
</script>
```

- [ ] **Step 2: Build verify**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/FloatingThemeToggle.astro
git commit -m "feat: add floating corner theme toggle"
```

---

### Task R2.4: Create DocsTopBar component

**Files:**

- Create: `src/components/DocsTopBar.astro`

Minimal top-bar: wordmark home link + theme toggle. Used on docs / privacy / support / docs-index pages. No links, no menu.

- [ ] **Step 1: Create `src/components/DocsTopBar.astro`**

```astro
---
import Logo from './Logo.astro'
---

<header class="topbar">
  <div class="container topbar-inner">
    <a href="/" class="topbar-brand">
      <Logo size={22} />
      <span>Glyph</span>
    </a>
    <button class="topbar-toggle" id="topbar-theme-toggle" aria-label="Toggle theme" type="button">
      <svg
        class="icon-sun"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        ></path>
      </svg>
      <svg
        class="icon-moon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
  </div>
</header>

<style>
  .topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 14px 0;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: var(--nav-bg);
    border-bottom: 1px solid var(--border);
  }

  .topbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .topbar-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--text);
    transition: color 0.18s ease;
  }
  .topbar-brand:hover {
    color: var(--accent);
  }

  .topbar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      color 0.18s ease,
      border-color 0.18s ease;
  }
  .topbar-toggle:hover {
    color: var(--text);
    border-color: var(--border-strong);
  }

  .icon-moon {
    display: none;
  }
  .icon-sun {
    display: block;
  }
  :root[data-theme='dark'] .icon-sun {
    display: none;
  }
  :root[data-theme='dark'] .icon-moon {
    display: block;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .icon-sun {
      display: none;
    }
    :root:not([data-theme='light']) .icon-moon {
      display: block;
    }
  }
</style>

<script is:inline>
  ;(function () {
    var btn = document.getElementById('topbar-theme-toggle')
    if (!btn) return
    var root = document.documentElement
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme')
      var isDark =
        current === 'dark' ||
        (!current && window.matchMedia('(prefers-color-scheme: dark)').matches)
      var next = isDark ? 'light' : 'dark'
      root.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
    })
  })()
</script>
```

- [ ] **Step 2: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/DocsTopBar.astro
git commit -m "feat: add minimal docs top-bar (wordmark + theme toggle)"
```

---

## Phase B — Hero rewrite (type-led, no screenshot)

### Task R2.5: Rewrite Hero.astro

**Files:**

- Modify: `src/components/Hero.astro` (drop the `<Image>` import + screenshot, add small Logo above headline, preserve user's R1 edits)

The user's working-tree edits to Hero (button text "Coming soon on TestFlight", removed hero-note, `font-styleitalic` typo) are merged in. The screenshot below the copy is removed entirely.

- [ ] **Step 1: Replace `src/components/Hero.astro` entirely**

```astro
---
import Logo from './Logo.astro'
---

<section class="hero">
  <div class="container hero-inner">
    <a href="/" class="hero-brand" aria-label="Glyph home">
      <Logo size={34} />
      <span>Glyph</span>
    </a>
    <h1 class="hero-title">A reader, not a feed.</h1>
    <p class="hero-subtitle">
      Glyph is a free iOS app for web novels. Bring your own sources, read offline, customize every
      detail. No accounts, no tracking.
    </p>
    <div class="hero-actions">
      <a href="https://discord.gg/hvA2sMRwxC" target="_blank" rel="noopener" class="btn-outline">
        Coming soon on TestFlight
      </a>
      <a href="/docs/getting-started" class="text-link">
        Read the docs <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>

<style>
  .hero {
    padding: 160px 0 80px;
    position: relative;
    z-index: 1;
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 22px;
  }

  .hero-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--text);
    transition: color 0.18s ease;
  }
  .hero-brand:hover {
    color: var(--accent);
  }

  .hero-title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(48px, 8vw, 84px);
    letter-spacing: -0.035em;
    line-height: 1.02;
    color: var(--text);
    font-variation-settings:
      'SOFT' 30,
      'opsz' 144;
    max-width: 16ch;
  }

  .hero-subtitle {
    font-family: var(--font-body);
    font-size: clamp(16px, 2.2vw, 19px);
    color: var(--text-secondary);
    max-width: 540px;
    line-height: 1.55;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-outline {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    font-style: italic;
    padding: 11px 22px;
    border-radius: 999px;
    border: 1px solid var(--accent);
    color: var(--accent);
    background: transparent;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      color 0.18s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-outline:hover {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
  }

  .text-link {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 1px dotted var(--border-strong);
    padding-bottom: 2px;
    transition:
      color 0.18s ease,
      border-color 0.18s ease;
  }

  .text-link:hover {
    color: var(--text);
    border-bottom-color: var(--text);
  }

  @media (max-width: 640px) {
    .hero {
      padding: 110px 0 40px;
    }
    .hero-brand {
      font-size: 19px;
    }
    .hero-brand :global(svg) {
      width: 28px;
      height: 28px;
    }
  }
</style>
```

- [ ] **Step 2: Build verify**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "refactor: hero — drop screenshot, add brand mark, fix italic typo"
```

---

## Phase C — Bento Features (the big one)

### Task R2.6: Build ReaderPhone component (iPhone 16 Max + reader + Aa popover)

**Files:**

- Create: `src/components/ReaderPhone.astro`

This is the hero tile content. Web component renders the iPhone frame. Inside the screen, we render the reader page (Fraunces serif sample) plus a top-right "Aa" button that toggles an in-screen popover with theme dots + size buttons.

- [ ] **Step 1: Create `src/components/ReaderPhone.astro`**

```astro
---
// iPhone 16 Max frame (via @sneas/telephone) wrapping an interactive reader demo.
// Aa button in top-right of screen toggles in-screen popover with theme + size controls.
---

<div class="reader-phone-wrap" data-theme="sepia" data-size="medium" data-menu-open="false">
  <iphone-16-max mode="dark" class="reader-phone-frame">
    <div class="reader-screen">
      <div class="r-topbar">
        <span class="r-chapter">Chapter 14</span>
        <span class="r-progress">14 / 142</span>
        <button type="button" class="r-aa-btn" aria-label="Reader settings" data-aa-toggle>
          Aa
        </button>
      </div>
      <div class="r-body">
        <p>
          The rain hadn't stopped for three days. Elias sat at the window watching it streak down
          the glass, each drop catching the lamplight before disappearing into the dark below.
        </p>
        <p>
          He thought about what the merchant had said. Not the warning — that part was easy to
          dismiss. It was the other thing. The way the man's eyes had moved when&hellip;
        </p>
      </div>

      <div class="r-popover" role="dialog" aria-label="Reader settings" aria-hidden="true">
        <div class="r-popover-row">
          <span class="r-popover-label">Size</span>
          <div class="r-sizes" role="group" aria-label="Font size">
            <button type="button" class="size-btn" data-size="small" aria-label="Small text">
              <span class="size-small">A</span>
            </button>
            <button type="button" class="size-btn" data-size="medium" aria-label="Medium text">
              <span class="size-medium">A</span>
            </button>
            <button type="button" class="size-btn" data-size="large" aria-label="Large text">
              <span class="size-large">A</span>
            </button>
          </div>
        </div>
        <div class="r-popover-row">
          <span class="r-popover-label">Theme</span>
          <div class="r-themes" role="group" aria-label="Reader theme">
            <button
              type="button"
              class="theme-btn"
              data-theme="white"
              aria-label="White"
              style="--swatch:#ffffff;--swatch-border:#e0d8c8;"></button>
            <button
              type="button"
              class="theme-btn"
              data-theme="sepia"
              aria-label="Sepia"
              style="--swatch:#f5ecd9;--swatch-border:#d9c9a8;"></button>
            <button
              type="button"
              class="theme-btn"
              data-theme="warm-dark"
              aria-label="Warm dark"
              style="--swatch:#1a1612;--swatch-border:#1a1612;"></button>
            <button
              type="button"
              class="theme-btn"
              data-theme="black"
              aria-label="Black"
              style="--swatch:#000000;--swatch-border:#000000;"></button>
          </div>
        </div>
      </div>
    </div>
  </iphone-16-max>
</div>

<style>
  .reader-phone-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .reader-phone-frame {
    --width: 280px;
    width: 280px;
  }

  .reader-screen {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 56px 22px 22px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  /* Theme-driven background + ink colors on the screen surface */
  .reader-phone-wrap[data-theme='white'] .reader-screen {
    background: #ffffff;
    color: #1d1d1f;
  }
  .reader-phone-wrap[data-theme='sepia'] .reader-screen {
    background: #f5ecd9;
    color: #3a2e20;
  }
  .reader-phone-wrap[data-theme='warm-dark'] .reader-screen {
    background: #1a1612;
    color: #ece6dc;
  }
  .reader-phone-wrap[data-theme='black'] .reader-screen {
    background: #000000;
    color: #c8c8c8;
  }

  .r-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.65;
    margin-bottom: 14px;
  }

  .r-aa-btn {
    font-family: 'Iowan Old Style', Georgia, serif;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    padding: 4px 6px;
    opacity: 0.75;
    transition: opacity 0.15s ease;
  }
  .r-aa-btn:hover {
    opacity: 1;
  }

  .r-body {
    font-family: 'Iowan Old Style', 'Charter', Georgia, 'Times New Roman', serif;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: font-size 0.2s ease;
  }

  .reader-phone-wrap[data-size='small'] .r-body {
    font-size: 13px;
  }
  .reader-phone-wrap[data-size='medium'] .r-body {
    font-size: 14px;
  }
  .reader-phone-wrap[data-size='large'] .r-body {
    font-size: 16px;
  }

  .r-body p {
    margin: 0;
  }

  /* Popover */
  .r-popover {
    position: absolute;
    right: 14px;
    top: 50px;
    width: calc(100% - 28px);
    padding: 14px;
    border-radius: 14px;
    background: rgba(247, 244, 238, 0.96);
    color: #1a1612;
    border: 1px solid rgba(26, 22, 18, 0.08);
    box-shadow: 0 10px 30px rgba(26, 22, 18, 0.18);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .reader-phone-wrap[data-menu-open='true'] .r-popover {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .reader-phone-wrap[data-menu-open='true'] .r-popover {
    /* keep popover ink dark for legibility regardless of reader theme */
  }

  .r-popover[aria-hidden='true'] {
    /* keyed via JS below */
  }

  .r-popover-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .r-popover-label {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.55;
  }

  .r-sizes,
  .r-themes {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .size-btn {
    background: transparent;
    border: 0;
    padding: 4px 6px;
    cursor: pointer;
    color: #6b6259;
    font-family: 'Iowan Old Style', Georgia, serif;
    line-height: 1;
    border-radius: 6px;
    transition: color 0.18s ease;
  }
  .size-btn:hover {
    color: #1a1612;
  }
  .reader-phone-wrap[data-size='small'] .size-btn[data-size='small'],
  .reader-phone-wrap[data-size='medium'] .size-btn[data-size='medium'],
  .reader-phone-wrap[data-size='large'] .size-btn[data-size='large'] {
    color: var(--accent);
  }
  .size-small {
    font-size: 11px;
  }
  .size-medium {
    font-size: 14px;
  }
  .size-large {
    font-size: 18px;
  }

  .theme-btn {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--swatch);
    border: 1px solid var(--swatch-border);
    cursor: pointer;
    padding: 0;
    transition: box-shadow 0.18s ease;
  }
  .reader-phone-wrap[data-theme='white'] .theme-btn[data-theme='white'],
  .reader-phone-wrap[data-theme='sepia'] .theme-btn[data-theme='sepia'],
  .reader-phone-wrap[data-theme='warm-dark'] .theme-btn[data-theme='warm-dark'],
  .reader-phone-wrap[data-theme='black'] .theme-btn[data-theme='black'] {
    box-shadow: 0 0 0 2px var(--accent);
  }

  button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    .reader-phone-frame {
      --width: 240px;
      width: 240px;
    }
    .reader-screen {
      padding: 52px 18px 18px;
    }
  }
</style>

<script>
  document.querySelectorAll<HTMLElement>('.reader-phone-wrap').forEach(root => {
    const aaBtn = root.querySelector<HTMLButtonElement>('[data-aa-toggle]')
    const popover = root.querySelector<HTMLElement>('.r-popover')

    function setMenu(open: boolean) {
      root.setAttribute('data-menu-open', String(open))
      if (popover) popover.setAttribute('aria-hidden', String(!open))
    }

    aaBtn?.addEventListener('click', e => {
      e.stopPropagation()
      const isOpen = root.getAttribute('data-menu-open') === 'true'
      setMenu(!isOpen)
    })

    root.querySelectorAll<HTMLButtonElement>('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme')
        if (theme) root.setAttribute('data-theme', theme)
      })
    })
    root.querySelectorAll<HTMLButtonElement>('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-size')
        if (size) root.setAttribute('data-size', size)
      })
    })

    // Dismiss popover on outside click within the wrap
    document.addEventListener('click', e => {
      if (!root.contains(e.target as Node)) return
      const target = e.target as HTMLElement
      if (target.closest('[data-aa-toggle]')) return
      if (target.closest('.r-popover')) return
      setMenu(false)
    })
  })
</script>
```

- [ ] **Step 2: Build verify**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ReaderPhone.astro
git commit -m "feat: ReaderPhone — iphone-16-max + interactive Aa popover"
```

---

### Task R2.7: Build ExtensionsTile component

**Files:**

- Create: `src/components/tiles/ExtensionsTile.astro`

Supporting bento tile. Inline source-logo chips matching the real screenshots (Anna's Archive A-mark, NovelHaven NO chip, NovelHaven Rust N( chip). Inline puzzle-piece swap in the title.

- [ ] **Step 1: Create directory**

```bash
mkdir -p src/components/tiles
```

- [ ] **Step 2: Create `src/components/tiles/ExtensionsTile.astro`**

```astro
---
// Supporting bento tile. 3 source-logo chips, puzzle-piece icon swap in title.
---

<article class="tile">
  <div class="tile-text">
    <span class="eyebrow">Extensions</span>
    <h3 class="title">
      Bring your own
      <span class="title-icon" aria-label="sources">
        <svg
          width="0.9em"
          height="0.9em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="m15.39 4.39 5.22 5.22a2.5 2.5 0 0 1-3.54 3.54l-.86-.86a1 1 0 0 0-1.42 0l-2.83 2.83a1 1 0 0 0 0 1.42l.86.86a2.5 2.5 0 0 1-3.54 3.54L4.06 16.61a2.5 2.5 0 0 1 3.54-3.54l.86.86a1 1 0 0 0 1.42 0l2.83-2.83a1 1 0 0 0 0-1.42l-.86-.86a2.5 2.5 0 0 1 3.54-3.54Z"
          ></path>
        </svg>
      </span>.
    </h3>
    <p class="body">Community-built sources. Add a repo URL, browse across all of them.</p>
  </div>
  <div class="tile-viz tile-viz-extensions">
    <div class="source-chip">
      <span class="chip-icon" style="background:#1a1612;color:#fff;">A</span>
      <div class="chip-meta">
        <span class="chip-name">Anna's Archive</span>
        <span class="chip-ver">v1.1.0</span>
      </div>
    </div>
    <div class="source-chip">
      <span class="chip-icon" style="background:#b45309;color:#fff;">NO</span>
      <div class="chip-meta">
        <span class="chip-name">NovelHaven</span>
        <span class="chip-ver">v1.1.0</span>
      </div>
    </div>
    <div class="source-chip">
      <span
        class="chip-icon"
        style="background:#5b21b6;color:#fff;font-family:var(--font-mono);font-size:11px;">N(</span
      >
      <div class="chip-meta">
        <span class="chip-name">NovelHaven (Rust)</span>
        <span class="chip-ver">v1.0.0</span>
      </div>
    </div>
  </div>
</article>

<style>
  .tile {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 22px 22px 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    height: 100%;
  }

  .eyebrow {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--text);
    margin: 0 0 8px;
    font-variation-settings:
      'SOFT' 30,
      'opsz' 144;
  }

  .title-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: -0.1em;
    color: var(--accent);
  }

  .body {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0;
  }

  .tile-viz-extensions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
  }

  .source-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
  }

  .chip-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
  }

  .chip-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .chip-name {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip-ver {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--text-secondary);
  }
</style>
```

- [ ] **Step 3: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/tiles/ExtensionsTile.astro
git commit -m "feat: ExtensionsTile — source chips + puzzle icon swap"
```

---

### Task R2.8: Build OfflineTile component

**Files:**

- Create: `src/components/tiles/OfflineTile.astro`

Download-progress widget + plane icon swap.

- [ ] **Step 1: Create `src/components/tiles/OfflineTile.astro`**

```astro
---
// Supporting bento tile. Download-progress widget + plane icon swap.
---

<article class="tile">
  <div class="tile-text">
    <span class="eyebrow">Offline</span>
    <h3 class="title">
      Read
      <span class="title-icon" aria-label="anywhere">
        <svg
          width="0.95em"
          height="0.95em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
          ></path>
        </svg>
      </span>
      anywhere.
    </h3>
    <p class="body">Download once. Read on a plane, in the subway, in bed with no signal.</p>
  </div>
  <div class="tile-viz tile-viz-offline">
    <div
      class="dl-cover"
      style="background: linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%);"
      aria-label="Shadow Monarch cover"
    >
      S
    </div>
    <div class="dl-meta">
      <span class="dl-name">Shadow Monarch</span>
      <div class="dl-progress"><div class="dl-bar"></div></div>
      <span class="dl-sub">142 chapters · downloaded</span>
    </div>
    <span class="dl-check" aria-hidden="true">✓</span>
  </div>
</article>

<style>
  .tile {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 22px 22px 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    height: 100%;
  }

  .eyebrow {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--text);
    margin: 0 0 8px;
    font-variation-settings:
      'SOFT' 30,
      'opsz' 144;
  }

  .title-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: -0.1em;
    color: var(--accent);
  }

  .body {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0;
  }

  .tile-viz-offline {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    margin-top: auto;
  }

  .dl-cover {
    width: 36px;
    height: 50px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
  }

  .dl-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .dl-name {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dl-progress {
    height: 3px;
    border-radius: 2px;
    background: var(--bg-surface-hover);
    overflow: hidden;
  }

  .dl-bar {
    height: 100%;
    width: 100%;
    background: var(--accent);
    border-radius: 2px;
  }

  .dl-sub {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .dl-check {
    color: #2e7d57;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
  }
</style>
```

- [ ] **Step 2: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/tiles/OfflineTile.astro
git commit -m "feat: OfflineTile — download widget + plane icon swap"
```

---

### Task R2.9: Build PrivacyTile component

**Files:**

- Create: `src/components/tiles/PrivacyTile.astro`

Lock icon big + display copy. Quietest of the three.

- [ ] **Step 1: Create `src/components/tiles/PrivacyTile.astro`**

```astro
---
// Supporting bento tile. Lock icon + display copy. No widget.
---

<article class="tile">
  <div class="tile-text">
    <span class="eyebrow">Privacy</span>
    <h3 class="title">
      <span class="title-icon" aria-label="Private">
        <svg
          width="0.95em"
          height="0.95em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </span>
      Private by default.
    </h3>
    <p class="body">No accounts. No analytics. No tracking. Reading data stays on your device.</p>
  </div>
  <div class="tile-viz tile-viz-privacy">
    <p class="big-claim">No accounts.<br />No tracking.</p>
  </div>
</article>

<style>
  .tile {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 22px 22px 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    height: 100%;
  }

  .eyebrow {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--text);
    margin: 0 0 8px;
    font-variation-settings:
      'SOFT' 30,
      'opsz' 144;
    display: inline-flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25em;
  }

  .title-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: -0.1em;
    color: var(--accent);
  }

  .body {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0;
  }

  .tile-viz-privacy {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    margin-top: auto;
    min-height: 96px;
  }

  .big-claim {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    line-height: 1.15;
    letter-spacing: -0.015em;
    color: var(--text-secondary);
    text-align: center;
    margin: 0;
    font-style: italic;
    font-variation-settings:
      'SOFT' 50,
      'opsz' 144;
  }
</style>
```

- [ ] **Step 2: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/tiles/PrivacyTile.astro
git commit -m "feat: PrivacyTile — lock icon + display claim"
```

---

### Task R2.10: Rewrite Features.astro as bento grid

**Files:**

- Modify: `src/components/Features.astro` (full rewrite — bento grid host)

Tall hero left + 3 stacked right. The hero tile contains the existing reading text + the ReaderPhone. Supporting tiles imported.

- [ ] **Step 1: Replace `src/components/Features.astro` entirely**

```astro
---
import ReaderPhone from './ReaderPhone.astro'
import ExtensionsTile from './tiles/ExtensionsTile.astro'
import OfflineTile from './tiles/OfflineTile.astro'
import PrivacyTile from './tiles/PrivacyTile.astro'
---

<section class="features" id="features">
  <div class="container">
    <h2 class="visually-hidden">Features</h2>

    <div class="bento">
      <article class="tile tile-hero">
        <div class="tile-hero-text">
          <span class="eyebrow">Reading</span>
          <h3 class="title">Made for reading.</h3>
          <p class="body">
            Four themes, fine-grained typography, paginated or scroll. Tap
            <span class="kbd">Aa</span> in the screen below to try it.
          </p>
        </div>
        <div class="tile-hero-phone">
          <ReaderPhone />
        </div>
      </article>

      <div class="bento-side">
        <ExtensionsTile />
        <OfflineTile />
        <PrivacyTile />
      </div>
    </div>
  </div>
</section>

<style>
  .features {
    padding: 80px 0 120px;
    position: relative;
    z-index: 1;
  }

  .bento {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
  }

  .tile-hero {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 28px 28px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    min-height: 560px;
  }

  .tile-hero-text {
    display: flex;
    flex-direction: column;
  }

  .tile-hero-phone {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bento-side {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .eyebrow {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 28px;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--text);
    margin: 0 0 10px;
    font-variation-settings:
      'SOFT' 30,
      'opsz' 144;
  }

  .body {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
    max-width: 38ch;
  }

  .kbd {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    border-radius: 5px;
    border: 1px solid var(--border);
    background: var(--bg);
    font-family: 'Iowan Old Style', Georgia, serif;
    font-size: 13px;
    color: var(--text);
    vertical-align: -0.05em;
  }

  @media (max-width: 880px) {
    .bento {
      grid-template-columns: 1fr;
    }
    .tile-hero {
      min-height: 0;
    }
    .features {
      padding: 48px 0 80px;
    }
  }
</style>
```

- [ ] **Step 2: Build verify**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Features.astro
git commit -m "refactor: features — bento (hero phone + 3 supporting tiles)"
```

---

## Phase D — FAQ + closing housekeeping

### Task R2.11: Rewrite Faq.astro — numbered combo + meta question

**Files:**

- Modify: `src/components/Faq.astro` (full rewrite)

- [ ] **Step 1: Replace `src/components/Faq.astro` entirely**

```astro
---
const items = [
  {
    q: 'What is Glyph?',
    a: 'An iOS app for reading web novels. It has no content of its own; it connects to novel sites through community-built extensions. Think of it as a browser made for reading.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Free, no ads, no subscriptions, no in-app purchases.',
  },
  {
    q: 'Where do extensions come from?',
    a: 'The community shares them as repository URLs. You add a URL in Settings → Extensions, fetch the available sources, and install. Anyone can build one with the SDK.',
  },
  {
    q: 'Can I read offline?',
    a: 'Yes. Download any chapter (or all of them) from a novel’s detail page. Downloads stay on your device and read without a connection.',
  },
  {
    q: 'Does it track me?',
    a: 'No analytics, no accounts, no tracking. Your reading data lives on your device, syncing to iCloud only if you’re signed in. Extensions run sandboxed with domain restrictions.',
  },
  {
    q: 'Why the name Glyph?',
    a: 'A glyph is a single mark of meaning — the smallest unit of a written thing. It felt right for a reader.',
  },
]
---

<section class="faq" id="faq">
  <div class="container">
    <h2 class="faq-title">Questions</h2>

    <ol class="faq-list">
      {
        items.map((it, i) => (
          <li class="faq-item">
            <span class="faq-num">{String(i + 1).padStart(2, '0')}.</span>
            <div class="faq-pair">
              <p class="faq-q">{it.q}</p>
              <p class="faq-a">{it.a}</p>
            </div>
          </li>
        ))
      }
    </ol>

    <p class="faq-more">
      More questions in the <a href="/docs/faq">full FAQ</a>, or on
      <a href="https://discord.gg/hvA2sMRwxC" target="_blank" rel="noopener">Discord</a>.
    </p>
  </div>
</section>

<style>
  .faq {
    padding: 80px 0;
    position: relative;
    z-index: 1;
  }

  .faq-title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(24px, 3vw, 30px);
    color: var(--text);
    text-align: center;
    margin-bottom: 56px;
    letter-spacing: -0.015em;
    font-variation-settings:
      'SOFT' 30,
      'opsz' 144;
  }

  .faq-list {
    list-style: none;
    max-width: 720px;
    margin: 0 auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 44px;
  }

  .faq-item {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 16px;
    align-items: baseline;
  }

  .faq-num {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 28px;
    color: var(--accent);
    line-height: 1;
    font-variation-settings:
      'SOFT' 50,
      'opsz' 144,
      'WONK' 0;
  }

  .faq-pair {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .faq-q {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 20px;
    line-height: 1.35;
    color: var(--text);
    letter-spacing: -0.01em;
    margin: 0;
  }

  .faq-a {
    font-family: var(--font-body);
    font-size: 15.5px;
    line-height: 1.65;
    color: var(--text-secondary);
    margin: 0;
  }

  .faq-more {
    text-align: center;
    margin-top: 64px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-secondary);
  }

  .faq-more a {
    color: var(--accent);
    border-bottom: 1px dotted var(--accent);
    padding-bottom: 1px;
    transition: border-bottom-style 0.18s ease;
  }
  .faq-more a:hover {
    border-bottom-style: solid;
  }

  @media (max-width: 640px) {
    .faq {
      padding: 56px 0;
    }
    .faq-list {
      gap: 36px;
    }
    .faq-item {
      grid-template-columns: 44px 1fr;
      gap: 12px;
    }
    .faq-num {
      font-size: 24px;
    }
    .faq-q {
      font-size: 18px;
    }
    .faq-a {
      font-size: 14.5px;
    }
  }
</style>
```

- [ ] **Step 2: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/Faq.astro
git commit -m "refactor: faq — numbered editorial style + meta question (Why Glyph?)"
```

---

## Phase E — Wire everything: drop Nav, mount toggle + topbar

### Task R2.12: Update index.astro

**Files:**

- Modify: `src/pages/index.astro`

Drop Nav import, drop ProseBeat import, add FloatingThemeToggle.

- [ ] **Step 1: Replace `src/pages/index.astro` entirely**

```astro
---
import Base from '../layouts/Base.astro'
import Hero from '../components/Hero.astro'
import Features from '../components/Features.astro'
import Faq from '../components/Faq.astro'
import ClosingLine from '../components/ClosingLine.astro'
import Footer from '../components/Footer.astro'
import FloatingThemeToggle from '../components/FloatingThemeToggle.astro'
---

<Base>
  <FloatingThemeToggle />
  <main>
    <Hero />
    <Features />
    <Faq />
    <ClosingLine />
  </main>
  <Footer />
</Base>
```

- [ ] **Step 2: Build verify + smoke**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "refactor: index — drop Nav + ProseBeat, add floating toggle"
```

---

### Task R2.13: Update DocsLayout.astro — replace Nav with DocsTopBar

**Files:**

- Modify: `src/layouts/DocsLayout.astro`

- [ ] **Step 1: Swap the import**

In `src/layouts/DocsLayout.astro` frontmatter, replace:

```astro
import Nav from '../components/Nav.astro'
```

with:

```astro
import DocsTopBar from '../components/DocsTopBar.astro'
```

- [ ] **Step 2: Swap the element**

In the body, find `<Nav />` (just before `<div class="docs-shell">`) and replace with `<DocsTopBar />`.

- [ ] **Step 3: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git add src/layouts/DocsLayout.astro
git commit -m "refactor(docs): use minimal top-bar instead of Nav"
```

---

### Task R2.14: Update privacy.astro, support.astro, docs.astro

**Files:**

- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/support.astro`
- Modify: `src/pages/docs.astro`

For each of the three files:

- [ ] **Step 1: Replace `import Nav from '../components/Nav.astro'` with `import DocsTopBar from '../components/DocsTopBar.astro'`**

- [ ] **Step 2: Replace `<Nav />` with `<DocsTopBar />`**

- [ ] **Step 3: Build verify**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit all three together**

```bash
git add src/pages/privacy.astro src/pages/support.astro src/pages/docs.astro
git commit -m "refactor: privacy/support/docs — use minimal top-bar"
```

---

## Phase F — Cleanup

### Task R2.15: Delete ProseBeat + Nav (if unused)

**Files:**

- Delete: `src/components/ProseBeat.astro`
- Delete (if no consumers): `src/components/Nav.astro`

- [ ] **Step 1: Confirm no consumers**

```bash
grep -rln "from.*Nav\.astro\|from.*ProseBeat\.astro" src/
```

Expected: zero matches.

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/ProseBeat.astro src/components/Nav.astro
```

- [ ] **Step 3: Build verify + commit**

```bash
npm run build 2>&1 | tail -5
git commit -m "chore: remove unused Nav + ProseBeat components"
```

---

### Task R2.16: Format pass + final build

**Files:** none manually edited.

- [ ] **Step 1: Format**

```bash
npm run format
npm run format:check
```

- [ ] **Step 2: Production build**

```bash
npm run build 2>&1 | tail -15
```

- [ ] **Step 3: Commit any whitespace**

```bash
git add -A
git diff --cached --quiet || git commit -m "style: format pass after R2"
```

---

## Final notes

- **`@sneas/telephone` first render**: web component bootstraps client-side. Loading from `<head>` (Task R2.2) registers it before paint, avoiding visible flash. If a flash is still observable, consider a CSS skeleton inside the component slot.
- **Theme propagation into phone**: the iPhone frame's `mode="dark"` attribute controls status-bar text color. For now hardcoded to `dark` (white text on the warm-paper sepia screen reads well in both site themes). Revisit if needed.
- **Mobile (≤880px)** collapses the bento grid to single column. The phone frame stays but scales down per the ReaderPhone CSS.
- **Aa popover** is contained to the reader-phone surface; clicking outside the popover (but still inside the phone wrap) dismisses it.
- **Icon swaps** are inline Lucide-style SVG. No JS runtime, no extra package dependency.
