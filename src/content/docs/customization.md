---
title: Customization
order: 6
section: 'Using Glyph'
description: App appearance, reader themes, and importing custom themes from the community.
---

# Customization

Glyph has two independent theming systems: one for the **app** (tab bar, navigation, settings), one for the **reader** (page background, text). You can mix and match, a warm sepia reader theme inside a dark app, for example.

## App appearance

Open **Settings → Appearance**.

- **Color scheme**: Light, Dark, or System (follows your iOS setting)
- **App theme grid**: accent colors that tint the app's controls (buttons, toggles, highlights). Pick a preset or tap **+ Custom** to build your own.

Custom app themes let you set background, surface, accent, and text colors. They're saved locally and switchable at any time.

## Reader themes

Reader themes are separate from the app theme, they only affect the reading view (page color, text color, accent inside the Reader). See [Reader → Themes](/docs/reader#themes) for the six built-ins and the custom-theme creator.

### Sharing themes

Custom reader themes can be exported and shared.

- **Export**: Theme & Settings → tap your custom theme → **Share**. Produces a `.glyphtheme` file.
- **Import**: open any `.glyphtheme` file in Mail, Messages, Files, or AirDrop and select "Open in Glyph". The theme is added to your collection.

The format is a plain JSON document, community themes can be shared on GitHub, GitHub Discussions, or anywhere people share files.

## Library badges

In **Settings → Library**, two optional badges on each library cover:

- **Unread**: number of unread chapters
- **Downloaded**: number of chapters available offline

Both off by default. Turn them on if you want at-a-glance status.

## Reader defaults

Pre-set how new chapters open in **Settings → Reader**:

| Setting               | Description                             |
| --------------------- | --------------------------------------- |
| **Default direction** | Paginated horizontal or scroll vertical |
| **Keep screen on**    | Prevent auto-lock while reading         |
| **Pre-fetch**         | How many chapters to pre-load (0–5)     |

These are defaults for _new_ opens. Inside any specific reader session you can override them temporarily without affecting the global setting.

## See also

- [Reader](/docs/reader): themes, fonts, and per-session controls
- [Sync & Privacy](/docs/sync-and-privacy): themes sync across devices
