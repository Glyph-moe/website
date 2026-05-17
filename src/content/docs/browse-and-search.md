---
title: Browse & Search
order: 3
section: 'Using Glyph'
description: Discover new novels across all your installed sources with per-source filters and a global content-rating control.
---

# Browse & Search

Two tabs for finding novels: **Browse** for source-specific discovery, **Search** for finding a specific title across everything you have installed.

## Browse

The **Browse** tab shows each installed source as a card.

### Continue Reading

If you've been reading something, a **Continue Reading** card appears at the top, tap it to jump straight back into the chapter where you left off. The card shows the novel cover, chapter title, and your last-read position.

### Source cards

Each source card opens that source's discover page, typically featured novels, popular titles, latest updates, and genres. The exact sections depend on what the source supports (see [Capabilities](/docs/sdk-capabilities) for the technical model).

A source must declare the `discover` capability for its discover page to appear. Sources without it show a flat paginated list instead.

## Search

The **Search** tab searches every enabled source in parallel.

- **Cross-source results.** Type a query and Glyph fans out to all enabled sources, grouping results by source. Tap a result to open the novel.
- **View modes.** Toggle between grid (covers) and list (covers + titles + author) in the toolbar.
- **Per-source filters.** Sources that support filters show a filter icon in the results. Tap it to refine that source's results.

Filters are per-source, the available options come from the source itself and may differ from one to another. Glyph aggregates results from all sources but each source applies its own filter values.

## Filter types

When a source supports filters, you'll see one or more of:

| Type             | Example                                    |
| ---------------- | ------------------------------------------ |
| **Select**       | Status: ongoing / completed / hiatus       |
| **Multi-select** | Genres: fantasy, action, romance           |
| **Sort**         | Order results by popular / latest / rating |
| **Check**        | Toggle: "only completed"                   |

Applied filters persist for the session. Clear them with **Reset** in the filter sheet.

## Content rating filter

Both Browse and Search respect your global content rating in **Settings → Filters & Ratings → Maximum Rating**:

| Level        | What you see                                           |
| ------------ | ------------------------------------------------------ |
| **Everyone** | Only novels with no mature/adult tags                  |
| **Teen**     | Adds teen / shounen / shoujo / violence / suggestive   |
| **Mature**   | Adds mature / gore / sexual content / ecchi / explicit |
| **Adult**    | No filtering, everything visible                       |

Glyph detects ratings automatically from novel tags. Sources don't mark each novel by hand. If a source forgets to attach tags, the novel defaults to Everyone.

### Cover blur

Two independent toggles blur cover images for **Mature** and **Adult** content, useful if you want to see those novels in lists but not surface imagery in public spaces. Tap a blurred cover to reveal it temporarily.

## See also

- [Library](/docs/library): once you find a novel, bookmark it
- [Reader](/docs/reader): what happens when you tap a chapter
- [Sync & Privacy](/docs/sync-and-privacy): content rating settings sync via iCloud
