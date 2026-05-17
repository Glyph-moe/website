---
title: Insights
order: 8
section: 'Using Glyph'
description: Reading streaks, monthly chapter counts, total time read, and a six-month activity heatmap, all in one screen.
---

# Insights

The **Insights** screen (Settings → Insights) shows your reading activity at a glance.

<figure class="docs-clip">
  <video src="/clips/insights.mp4" autoplay muted loop playsinline preload="metadata" width="960" height="720" aria-label="Opening the Insights screen from Settings, showing the streak, heatmap, and stats grid"></video>
  <figcaption>Reaching Insights from Settings, with the full dashboard in view.</figcaption>
</figure>

## Reading streak

The headline number: consecutive days where you read at least one chapter. The streak shows up at the top in green with a faint pulse. It resets to 0 the day after you skip.

A "reading day" is any day with at least one chapter completed (or substantial progress on a long chapter). Time zone uses your device's local time, so a streak survives travel.

## Six-month heatmap

A GitHub-style activity grid showing the last six months. Each square is a day; darker green means more reading. The legend at the bottom right of the card reads "Less → More".

The label at the top of the card tells you how many distinct reading days you have in the window.

## Stats grid

Four tiles below the heatmap:

| Tile                    | What it measures                                    |
| ----------------------- | --------------------------------------------------- |
| **Total Time**          | Cumulative reading time tracked across all sessions |
| **Chapters This Month** | Count for the current calendar month                |
| **Novels Completed**    | Novels where you've reached the last chapter        |
| **Avg / Day**           | Chapters per active reading day this month          |

The numbers update in real time as you read, close and re-open Insights to refresh.

## Chapters per month

A bar chart at the bottom shows chapters read by month for the current year (J F M A M J J A S O N D). Tap a bar to see the exact count.

## Privacy

All Insights data lives on-device in your SwiftData store. The numbers sync across your devices via iCloud (so your streak and totals don't reset when you switch from iPhone to iPad), but they never leave your iCloud account.

Incognito sessions don't count toward any Insights stat, see [Sync & Privacy](/docs/sync-and-privacy#incognito-mode) for what that means.

## See also

- [Sync & Privacy](/docs/sync-and-privacy): how stats sync across devices
- [Library](/docs/library): track which novels you've completed
