---
title: Troubleshooting
order: 9
section: 'Using Glyph'
description: Common problems and fixes, extensions not loading, sync issues, downloads stuck, chapters failing.
---

# Troubleshooting

Before reaching out, try the fix here. If nothing matches, see [Support](/support) for how to get help.

## An extension doesn't show up after install

1. Open **Settings → Extensions** and tap the **refresh** button next to the repo. Glyph re-fetches the manifest and detects new sources.
2. If the source still isn't there, the source author may have removed or renamed it. Check the repo's GitHub page for changes.
3. As a last resort, remove and re-add the repository. Your library entries from that source are preserved through the round-trip.

## A source returns no results

- The source's website may be down, try opening it in Safari to check.
- The source may have changed its layout, breaking the extension. Update by tapping **refresh** in **Settings → Extensions**.
- If you're searching: try a simpler query (no quotes, no special characters, fewer words).

## A chapter fails to load

- Check your connection.
- Try refreshing the chapter list on the novel detail page.
- The source may have moved or removed the chapter.
- If the chapter loads but the content looks broken (HTML showing through, missing paragraphs), the source's parser is outdated, the source author needs to ship a fix.

## "Bridge version mismatch" error

The extension was built against an older runtime. Tap **refresh** on the repo in **Settings → Extensions** to download the latest bundle. If the error persists, the author hasn't published an update, open an issue on their GitHub.

## iCloud sync isn't working

1. **iOS Settings → [Your Name] → iCloud → iCloud Drive**, make sure it's on.
2. Find Glyph in the apps list and confirm its toggle is on.
3. Open Glyph → **Settings → iCloud Sync**, confirm the status reads "Connected".
4. If still not syncing, force a refresh by toggling iCloud Sync off and on.

iCloud sync only works while your device has internet. Changes you make offline sync when you reconnect.

## A download is stuck

- Tap the progress shelf above the tab bar, you'll see per-chapter progress.
- Tap a stuck chapter to cancel it; restart the download from the novel detail.
- If many chapters are stuck, check your storage (Settings → Data & Cache), a near-full disk blocks new downloads.
- Force-quit and reopen Glyph; the download queue resumes from where it left off.

## The reader theme doesn't apply / looks wrong

Exit the reader and re-enter the chapter. Themes are applied on chapter load. If the theme still looks broken, switch to a built-in (White or Dark) and back, if the issue disappears, your custom theme is the culprit; edit or delete it.

## The app feels slow

Try these in order:

1. **Settings → Data & Cache → Clear Cache**, removes temporary parsed HTML and cover thumbnails.
2. **Reduce pre-fetch**, Settings → Reader → Pre-fetch → 0 or 1.
3. If you have hundreds of library entries, group them into folders so each library view renders fewer items at once.

If the issue persists, share a diagnostic report (next section).

## A repository URL won't add

- Confirm the URL is correct, usually ends with `/index.json` or a domain that auto-resolves to one.
- Make sure it's HTTPS (HTTP is only allowed for `localhost` and `192.168.*` during development).
- The author may have moved the repo. Check the README of the project on GitHub for the current URL.

## How to share a diagnostic report

When asking for help, attach a diagnostic report so we have context:

1. **Settings → About → Share Diagnostic Report**
2. Choose how to share (AirDrop, Mail, Messages)
3. Send the file with a description of what went wrong

The report contains app logs and recent network history. It contains **no personal data**, no library content, no bookmarks, no passwords. See the [Privacy Policy](/privacy) for the exact contents.

## Where to get more help

- **Discord** (fastest): [discord.gg/hvA2sMRwxC](https://discord.gg/hvA2sMRwxC)
- **GitHub issues**: for reproducible bugs
- **Email**: `contact@glyph.moe` for private matters

See [Support](/support) for full guidance on what to include in a bug report.
