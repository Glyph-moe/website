---
title: 'Offline reading, and what it took to get downloads right'
description: 'Download a novel once and it reads without a connection: chapters, covers, and progress, all kept on the device. Here is what changed in the way Glyph stores them.'
date: 2026-10-28
category: Release
mood: night
cx: 0.76
---

Glyph downloads chapters to the device and reads them back with the network
switched off. That sounds like a small feature and it is not: a download has to
survive being paused, resumed, interrupted by a phone call, and picked up again
three days later in a tunnel.

This release rebuilds the download queue so a chapter is either on the device or
it is not, and the Downloads screen can say which.

## What changed

- Downloads are queued per novel, not per chapter, so a book arrives in reading
  order instead of whichever request finished first.
- A paused download keeps its place. Reopening the app picks it up rather than
  starting the chapter again.
- The Downloads screen shows what is saved and how much space it takes, and
  clearing one novel no longer touches the others.

## What is stored

Downloaded chapters live in the app's own storage. Covers and images are cached
for the chapters you saved, not for the whole novel, because a 400-chapter
serial with full artwork is not something anyone wants on a phone.

> Reading progress is separate from the download. You can clear a download and
> keep your place in the book; the reader will fetch the chapter again when you
> get back to it.

Offline reading is the one place where the app has to be honest about what it
cannot do: if a source is gone, the chapters already saved still open, but the
next one in the queue does not. The reader says so instead of loading forever.

## Trying it

Open a novel, tap the download icon on its detail page, and choose the chapters
you want or save all of them. The Downloads section in your Library shows the
list. Airplane mode is a fair test and the one I use.
