---
title: FAQ
order: 10
section: 'Using Glyph'
description: Answers to common questions about Glyph, extensions, offline reading, privacy, reader customization, and troubleshooting.
---

# Frequently Asked Questions

## About the project

### When does Glyph ship?

TestFlight in 2026–2027. Join the waitlist on the [home page](/#waitlist) to get the link the day it goes out. One email, no spam.

### What if Apple pulls it from the App Store?

TestFlight first, and sideloading is on the roadmap too. More importantly, the extension SDK and format are open. The ecosystem doesn't depend on any single app staying listed, so even a worst-case App Store outcome doesn't kill the sources.

### What if you stop working on Glyph?

The SDK is open and the source format is documented. Sources keep working as long as the novel sites do, and anyone can build or maintain extensions without us. The goal is something that survives its maker.

### Is Glyph open source?

The app itself isn't, but the extension SDK, the WIT contract, and these docs are fully open. That's the part that matters for keeping the ecosystem alive and forkable.

### Can I import my library from another reader?

Not yet. Glyph is a novel reader, not a scan reader, so a library from something like Aidoku or Paperback isn't a 1:1 match, different content entirely. What's planned is import by title: paste a list of novel names and Glyph will match them against your installed sources. No ETA, but it's on the roadmap.

### Is Glyph free?

Yes. Free, no ads, no subscriptions, no in-app purchases. Not "free with a pro tier", just free.

## General

### What is Glyph?

Glyph is an iOS app for reading web novels. It doesn't host any content. Instead, it uses community-built extensions to connect to novel websites. Think of it as a browser specifically designed for reading.

### Where do I get extensions?

Extensions are shared as repository URLs by the community. You add them in Settings → Extensions → +. The app fetches the available sources from the URL and lets you install them.

### Does Glyph work offline?

Yes. You can download chapters for offline reading from any novel's detail page. Downloaded chapters are stored on your device and accessible without an internet connection.

## Reading

### How do I switch between paginated and scroll mode?

While reading, tap the center of the screen to show controls. Tap the menu (bottom right) → Theme & Settings → Reading Direction. Choose "Horizontal" for paginated or "Vertical" for scroll.

### Can I change the font and colors?

Yes. In the reader, go to menu → Theme & Settings. You can change the font, font size, line spacing, text color, background color, and more. There are 6 built-in themes and you can create custom ones.

### How do I bookmark a position?

Open the reader menu → Add Bookmark. A small orange marker appears on the page. To see your bookmarks, go to menu → Bookmarks. You can also add notes to bookmarks.

### How do I search within a chapter?

Open the reader menu → Search in Chapter. Type your query. All matches are highlighted in yellow, and the active match is orange. Use the arrow buttons to jump between matches.

### The reader shows a white screen / loading forever

Try these steps:

1. Go back and re-open the chapter
2. If that doesn't work, go to Settings → Storage → Clear Extension Cache, then try again
3. Check your internet connection, since the extension might need to fetch content

### A chapter shows "Could not load chapter"

The extension couldn't fetch the chapter content. This usually means:

- The novel website is down or blocking requests
- Your internet connection dropped
- The extension needs to be updated

Tap "Retry" to try again. If it persists, check if the extension has an update in Settings → Extensions.

## Extensions

### How do I add a new extension repository?

1. Go to Settings → Extensions
2. Tap the **+** button
3. Paste the repository URL
4. Tap Fetch, then Install

### How do I update extensions?

Go to Settings → Extensions. In the Active Sources section, tap **Refresh** on any source to re-download its latest version. You can also tap the refresh button in the toolbar to update all repositories at once.

### An extension isn't loading / shows "Extension not loaded"

The extension's JavaScript bundle might be missing or corrupted. Try:

1. Go to Settings → Extensions → tap the repository → **Refresh** the source
2. If that doesn't work, go to Settings → Storage → Clear Extension Cache
3. Re-open the app

### Can I disable an extension without deleting it?

Yes. Go to Settings → Extensions → tap the repository. Swipe left on any source to disable it. It stays installed but won't appear in Browse or Search. You can re-enable it anytime with the Install button.

### How do I create my own extension?

Run `npx create-glyph-extension my-extensions` to scaffold a new project. See the [SDK Documentation](/docs/sdk-overview) for a complete guide. You'll need basic TypeScript knowledge and familiarity with HTML selectors.

## Data & Privacy

### Does Glyph track me?

No. Glyph has no analytics, no tracking, no accounts. Your reading data stays on your device (and iCloud if you're signed in).

### Does my data sync between devices?

Yes, via iCloud. Your library, reading history, bookmarks, and progress sync automatically across all devices signed into the same Apple ID.

### How do I clear my data?

- **Reading history**: Settings → Storage → Clear Reading History
- **Extension cache**: Settings → Storage → Clear Extension Cache
- **Downloaded chapters**: Settings → Storage → Delete All Downloads
- **Library**: Remove novels individually via swipe or context menu

### Where is my data stored?

All data is stored locally on your device using SwiftData. If iCloud is enabled, it's also synced to your iCloud account. Extensions run in sandboxed WebViews with domain restrictions and can only access their declared base URL.

## Troubleshooting

### The app feels slow

- Check which extension is slow, as some novel sites have high latency
- Try clearing the extension cache (Settings → Storage)
- Make sure you're on a stable internet connection

### Novels are showing content I don't want to see

Go to Settings → Filters & Ratings:

- Set your **Maximum Rating** (Everyone, Teen, Mature, Adult)
- Enable **Blur Mature/Adult Covers** to blur sensitive cover images

Extensions that support tags will have their content filtered automatically.

### I lost my reading progress

Your progress syncs via iCloud. If you're on a new device:

1. Make sure you're signed into the same Apple ID
2. Wait a few minutes for iCloud to sync
3. Check the History tab

### How do I report a bug?

Go to Settings → Share Diagnostic Report. This generates a report with app logs and network activity (no personal data). Share it via email or message to help debug the issue.
